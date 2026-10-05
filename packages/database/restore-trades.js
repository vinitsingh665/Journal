const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function restoreTrade(symbol) {
  console.log(`\n--- Restoring ${symbol} ---`);
  
  // 1. Find the most recently closed trade for the symbol
  const trade = await prisma.trade.findFirst({
    where: { 
      symbol: symbol, 
      status: { in: ["STOP_LOSS_HIT", "CLOSED"] } 
    },
    orderBy: { exitTime: 'desc' },
    include: {
      executions: {
        orderBy: { executionTime: 'desc' },
        take: 1
      },
      events: {
        where: { type: "AUTO_CLOSED" },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!trade) {
    console.log(`No recently closed trade found for ${symbol}`);
    return;
  }

  console.log(`Found trade ID: ${trade.id} closed at ${trade.exitTime}`);

  const exitExecution = trade.executions[0];
  if (!exitExecution || !exitExecution.fingerprint?.includes("auto-sl-") && !exitExecution.fingerprint?.includes("auto-tp-")) {
    console.log(`Last execution doesn't look like an auto-close. Please verify manually.`);
    return;
  }

  // Determine what the open quantity was before it was closed
  const closedQty = exitExecution.quantity;
  const isLong = trade.direction === "LONG";
  
  const newBuyQty = isLong ? trade.totalBuyQty : trade.totalBuyQty - closedQty;
  const newSellQty = isLong ? trade.totalSellQty - closedQty : trade.totalSellQty;

  await prisma.$transaction(async (tx) => {
    // 2. Delete the exit execution
    await tx.execution.delete({ where: { id: exitExecution.id } });
    console.log(`Deleted auto-close execution: ${exitExecution.id}`);

    // 3. Delete the auto-close event
    if (trade.events.length > 0) {
      await tx.tradeEvent.delete({ where: { id: trade.events[0].id } });
      console.log(`Deleted auto-close event: ${trade.events[0].id}`);
    }

    // 4. Update the trade back to OPEN (or PARTIAL if qty > 0 but < total)
    const newStatus = (newBuyQty > 0 && newSellQty > 0) ? "PARTIAL" : "OPEN";
    
    await tx.trade.update({
      where: { id: trade.id },
      data: {
        status: newStatus,
        totalBuyQty: newBuyQty,
        totalSellQty: newSellQty,
        avgExitPrice: null,
        grossPnl: 0,
        netPnl: 0,
        pnlPercentage: 0,
        rMultiple: null,
        exitTime: null,
        holdingPeriodMs: null
      }
    });
    console.log(`Updated trade ${trade.id} back to ${newStatus}`);

    // 5. Restore the position record
    const existingPos = await tx.position.findUnique({
      where: {
        userId_symbol_exchange: {
          userId: trade.userId,
          symbol: trade.symbol,
          exchange: trade.exchange
        }
      }
    });

    if (existingPos) {
      await tx.position.update({
        where: { id: existingPos.id },
        data: { quantity: existingPos.quantity + closedQty }
      });
      console.log(`Updated existing position for ${symbol}`);
    } else {
      await tx.position.create({
        data: {
          userId: trade.userId,
          symbol: trade.symbol,
          exchange: trade.exchange,
          quantity: closedQty,
          avgPrice: trade.avgEntryPrice,
        }
      });
      console.log(`Recreated position for ${symbol}`);
    }
  });
  
  console.log(`Successfully restored ${symbol}!`);
}

async function main() {
  await restoreTrade("CUPID");
  await restoreTrade("ETHUSDT");
}

main().catch(console.error).finally(() => prisma.$disconnect());
