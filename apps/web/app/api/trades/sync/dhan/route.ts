import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import {
  deduplicateExecutions,
  matchExecutionsToTrades,
  generateFingerprint,
} from "@repo/trading-engine";
import type { NormalizedExecution } from "@repo/trading-engine";
import { decrypt } from "@/lib/encryption";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { dhanClientId: true, dhanAccessToken: true },
    });

    if (!userSettings?.dhanClientId || !userSettings?.dhanAccessToken) {
      return NextResponse.json(
        { error: "Dhan API keys not configured. Please configure them in Settings." },
        { status: 400 }
      );
    }

    const decryptedToken = decrypt(userSettings.dhanAccessToken);

    // Call Dhan API
    const response = await fetch("https://api.dhan.co/trades", {
      headers: {
        "client-id": userSettings.dhanClientId,
        "access-token": decryptedToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Dhan API Error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const json = await response.json();
    const data = json.data || [];

    if (data.length === 0) {
      return NextResponse.json({ message: "No trades found in Dhan." });
    }

    // Map Dhan trades to NormalizedExecution
    const normalizedExecutions: NormalizedExecution[] = data.map((trade: any) => {
      // Parse exchange Segment (e.g., NSE_EQ -> NSE)
      let exchange = "NSE";
      if (trade.exchangeSegment) {
        if (trade.exchangeSegment.includes("BSE")) exchange = "BSE";
        if (trade.exchangeSegment.includes("MCX")) exchange = "MCX";
      }

      // Parse time: "2023-10-10 10:15:30"
      const executionTime = new Date(trade.createTime);

      const exec: Omit<NormalizedExecution, "fingerprint"> = {
        symbol: trade.tradingSymbol,
        exchange,
        side: trade.transactionType === "BUY" ? "BUY" : "SELL",
        quantity: trade.tradedQuantity,
        executedQty: trade.tradedQuantity,
        price: trade.tradedPrice,
        avgPrice: trade.tradedPrice,
        orderId: trade.orderId,
        executionId: trade.exchangeTradeId,
        orderType: "MARKET", // Default fallback if not provided
        productType: trade.productType || "CNC",
        executionTime,
      };

      return {
        ...exec,
        fingerprint: generateFingerprint(exec),
      } as NormalizedExecution;
    });

    // Get existing fingerprints
    const existingFingerprints = new Set(
      (
        await prisma.execution.findMany({
          where: { userId },
          select: { fingerprint: true },
        })
      ).map((e) => e.fingerprint)
    );

    // Deduplicate
    const { newExecutions, duplicates } = deduplicateExecutions(
      normalizedExecutions,
      existingFingerprints
    );

    if (newExecutions.length === 0) {
      return NextResponse.json({ 
        message: "No new trades found.",
        totalFetched: data.length,
        newRecords: 0
      });
    }

    // Create import log
    const importLog = await prisma.importLog.create({
      data: {
        userId,
        source: "dhan_api",
        fileName: "API Sync",
        totalRows: data.length,
        newRecords: newExecutions.length,
        duplicates: duplicates.length,
        errors: 0,
        status: "processing",
      },
    });

    // Insert new executions
    for (const exec of newExecutions) {
      // Store raw data
      await prisma.rawImportData.create({
        data: {
          source: "dhan_api",
          rawData: JSON.parse(JSON.stringify(exec)),
          importLogId: importLog.id,
        },
      });

      // Create execution record
      await prisma.execution.create({
        data: {
          userId,
          fingerprint: exec.fingerprint,
          symbol: exec.symbol,
          exchange: exec.exchange,
          side: exec.side,
          quantity: exec.quantity,
          executedQty: exec.executedQty,
          price: exec.price,
          avgPrice: exec.avgPrice,
          orderId: exec.orderId,
          executionId: exec.executionId,
          orderType: exec.orderType,
          productType: exec.productType,
          executionTime: exec.executionTime,
        },
      });
    }

    // Match executions to trades
    const unmatchedExecutions = await prisma.execution.findMany({
      where: { userId, tradeId: null },
      orderBy: { executionTime: "asc" },
    });

    const matchedTrades = matchExecutionsToTrades(
      unmatchedExecutions.map((e) => ({
        id: e.id,
        symbol: e.symbol,
        exchange: e.exchange,
        side: e.side as "BUY" | "SELL",
        quantity: e.quantity,
        executedQty: e.executedQty,
        price: e.price,
        avgPrice: e.avgPrice,
        executionTime: e.executionTime,
        fingerprint: e.fingerprint,
        charges: e.totalCharges ? { total: e.totalCharges } : undefined,
      }))
    );

    let tradesCreated = 0;

    // Create trade records
    for (const match of matchedTrades) {
      const trade = await prisma.trade.create({
        data: {
          userId,
          symbol: match.symbol,
          exchange: match.exchange,
          direction: match.direction,
          status: match.status,
          totalBuyQty: match.totalBuyQty,
          totalSellQty: match.totalSellQty,
          avgEntryPrice: match.avgEntryPrice,
          avgExitPrice: match.avgExitPrice,
          grossPnl: match.grossPnl,
          totalCharges: match.totalCharges,
          netPnl: match.netPnl,
          pnlPercentage: match.pnlPercentage,
          entryTime: match.entryTime,
          exitTime: match.exitTime,
          holdingPeriodMs: match.holdingPeriodMs ? BigInt(match.holdingPeriodMs) : null,
        },
      });

      // Link executions to trade
      const allLegIds = [
        ...match.entries.map((e) => e.executionId),
        ...match.exits.map((e) => e.executionId),
      ];

      await prisma.execution.updateMany({
        where: { id: { in: allLegIds } },
        data: { tradeId: trade.id },
      });

      tradesCreated++;
    }

    // Update import log
    await prisma.importLog.update({
      where: { id: importLog.id },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Sync complete",
      totalFetched: data.length,
      newExecutions: newExecutions.length,
      duplicates: duplicates.length,
      tradesCreated,
    });
  } catch (error) {
    console.error("Dhan sync error:", error);
    return NextResponse.json(
      { error: "Sync failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
