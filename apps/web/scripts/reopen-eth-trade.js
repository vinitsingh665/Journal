/**
 * Script to reopen the ETHUSDT trade that was falsely closed by the buggy stop-loss cron.
 * 
 * What it does:
 * 1. Finds the ETHUSDT trade with status STOP_LOSS_HIT or CLOSED
 * 2. Deletes the fake auto-close execution (the one with fingerprint starting with "auto-sl-" or "auto-tp-")
 * 3. Resets the trade back to OPEN status
 * 4. Clears exit data (avgExitPrice, exitTime, grossPnl, netPnl, etc.)
 * 5. Recreates the position if it was deleted
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function reopenEthTrade() {
  try {
    // Find the ETHUSDT trade
    const trade = await prisma.trade.findFirst({
      where: {
        symbol: "ETHUSDT",
        exchange: "CRYPTO",
        status: { in: ["STOP_LOSS_HIT", "CLOSED"] },
        isArchived: false,
      },
      include: {
        executions: { orderBy: { executionTime: "desc" } },
      },
    });

    if (!trade) {
      // Try without exchange filter
      const tradeAny = await prisma.trade.findFirst({
        where: {
          symbol: "ETHUSDT",
          status: { in: ["STOP_LOSS_HIT", "CLOSED"] },
          isArchived: false,
        },
        include: {
          executions: { orderBy: { executionTime: "desc" } },
        },
      });

      if (!tradeAny) {
        console.error("❌ No ETHUSDT trade found with STOP_LOSS_HIT or CLOSED status.");
        console.log("\nAll ETHUSDT trades found:");
        const all = await prisma.trade.findMany({ where: { symbol: "ETHUSDT" } });
        console.log(all.map(t => ({ id: t.id, status: t.status, exchange: t.exchange })));
        return;
      }

      await reopen(tradeAny);
    } else {
      await reopen(trade);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function reopen(trade) {
  console.log(`\n📋 Found trade:`);
  console.log(`   ID:         ${trade.id}`);
  console.log(`   Symbol:     ${trade.symbol} (${trade.exchange})`);
  console.log(`   Status:     ${trade.status}`);
  console.log(`   Entry:      ₹${trade.avgEntryPrice}`);
  console.log(`   Exit:       ₹${trade.avgExitPrice || "—"}`);
  console.log(`   Buy Qty:    ${trade.totalBuyQty}`);
  console.log(`   Sell Qty:   ${trade.totalSellQty}`);
  console.log(`   Executions: ${trade.executions.length}`);

  // Find the auto-generated fake exit execution
  const fakeExits = trade.executions.filter(e =>
    e.fingerprint?.startsWith("auto-sl-") ||
    e.fingerprint?.startsWith("auto-tp-") ||
    e.fingerprint?.startsWith("auto-SELL-") ||
    e.fingerprint?.startsWith("auto-BUY-") ||
    (e.fingerprint?.startsWith("auto-") && e.side !== "BUY") // for LONG trades, fake exit is a SELL
  );

  console.log(`\n🔍 Auto-close executions found: ${fakeExits.length}`);
  fakeExits.forEach(e => {
    console.log(`   - ${e.id} | side: ${e.side} | price: ${e.price} | fingerprint: ${e.fingerprint}`);
  });

  if (fakeExits.length === 0) {
    console.log("\n⚠️  No auto-close executions found with 'auto-' fingerprint.");
    console.log("Checking all SELL executions for the exit...");
    const sellExecs = trade.executions.filter(e => e.side === "SELL");
    console.log(sellExecs.map(e => ({ id: e.id, price: e.price, fingerprint: e.fingerprint, time: e.executionTime })));
  }

  // Recalculate correct state: only count non-fake executions
  const realExecutions = trade.executions.filter(e => !fakeExits.some(f => f.id === e.id));
  const realBuyQty = realExecutions.filter(e => e.side === "BUY").reduce((s, e) => s + e.quantity, 0);
  const realSellQty = realExecutions.filter(e => e.side === "SELL").reduce((s, e) => s + e.quantity, 0);
  const openQty = realBuyQty - realSellQty;

  console.log(`\n📊 After removing fake executions:`);
  console.log(`   Real buy qty:  ${realBuyQty}`);
  console.log(`   Real sell qty: ${realSellQty}`);
  console.log(`   Open qty:      ${openQty}`);

  if (openQty <= 0) {
    console.error("\n❌ After removing fake executions, open qty is 0 or negative.");
    console.error("   The trade may have been legitimately closed. Please verify manually.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    // 1. Delete all fake auto-close executions
    if (fakeExits.length > 0) {
      await tx.execution.deleteMany({
        where: { id: { in: fakeExits.map(e => e.id) } },
      });
      console.log(`\n🗑️  Deleted ${fakeExits.length} fake auto-close execution(s)`);
    }

    // 2. Delete any AUTO_CLOSED trade events
    const deletedEvents = await tx.tradeEvent.deleteMany({
      where: { tradeId: trade.id, type: "AUTO_CLOSED" },
    });
    console.log(`🗑️  Deleted ${deletedEvents.count} AUTO_CLOSED trade event(s)`);

    // 3. Reset trade to OPEN
    await tx.trade.update({
      where: { id: trade.id },
      data: {
        status: "OPEN",
        totalBuyQty: realBuyQty,
        totalSellQty: realSellQty,
        avgExitPrice: null,
        exitTime: null,
        grossPnl: 0,
        netPnl: 0,
        pnlPercentage: 0,
        holdingPeriodMs: null,
        rMultiple: null,
        isArchived: false,
      },
    });
    console.log(`✅ Trade reset to OPEN`);

    // 4. Restore position (upsert)
    await tx.position.upsert({
      where: {
        userId_symbol_exchange: {
          userId: trade.userId,
          symbol: trade.symbol,
          exchange: trade.exchange,
        },
      },
      update: {
        quantity: openQty,
        avgPrice: trade.avgEntryPrice,
      },
      create: {
        userId: trade.userId,
        symbol: trade.symbol,
        exchange: trade.exchange,
        quantity: openQty,
        avgPrice: trade.avgEntryPrice,
      },
    });
    console.log(`✅ Position restored: ${openQty} × ${trade.symbol} @ ₹${trade.avgEntryPrice}`);
  });

  console.log("\n✅ Done! ETHUSDT trade is now OPEN again.");
  console.log("   Refresh the app to see the changes.");
}

reopenEthTrade().catch(console.error);
