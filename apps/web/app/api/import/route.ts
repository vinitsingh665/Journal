import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import {
  parseCsv,
  detectBrokerFormat,
  normalizeExecutions,
  deduplicateExecutions,
  matchExecutionsToTrades,
} from "@repo/trading-engine";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { csvContent } = await request.json();
    if (!csvContent) {
      return NextResponse.json({ error: "No CSV content" }, { status: 400 });
    }

    // Parse CSV
    const { data: rows, headers } = parseCsv(csvContent);
    const format = detectBrokerFormat(headers);
    const mapping = format.getMapping();

    // Normalize
    const { executions: normalized, errors: normalizeErrors } =
      normalizeExecutions(rows, mapping, format.id);

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
      normalized,
      existingFingerprints
    );

    // Create import log
    const importLog = await prisma.importLog.create({
      data: {
        userId,
        source: "csv",
        fileName: "import.csv",
        totalRows: rows.length,
        newRecords: newExecutions.length,
        duplicates: duplicates.length,
        errors: normalizeErrors.length,
        errorDetails: normalizeErrors.length > 0 ? normalizeErrors : undefined,
        status: "processing",
      },
    });

    // Insert new executions
    for (const exec of newExecutions) {
      // Store raw data
      await prisma.rawImportData.create({
        data: {
          source: "csv",
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
    // Get all unmatched executions for this user
    const unmatchedExecutions = await prisma.execution.findMany({
      where: { userId, tradeId: null },
      orderBy: { executionTime: "asc" },
    });

    // Match using trading engine
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
      totalRows: rows.length,
      newExecutions: newExecutions.length,
      duplicates: duplicates.length,
      errors: normalizeErrors.length,
      tradesCreated,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Import failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
