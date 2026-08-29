import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@repo/database";
import Groq from "groq-sdk";
import { fetchStockQuote } from "@/lib/yahoo-finance";

let groq: Groq;
try {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy" });
} catch (e) {
  // handled in POST
}

const SYSTEM_PROMPT = `You are an AI Trading Assistant for a Trade Journal app. You engage in a conversation with the user to log trades or mistakes.
The user will provide natural language prompts (often in Hinglish or English).
Your job is to parse their intent into a STRICT JSON structure.

MANDATORY & OPTIONAL FIELD CHECK:
Before returning an action intent (like CREATE_FORM_FILL or CREATE_MISTAKE), you must ensure all mandatory fields are provided by the user in the conversation history.
- For a NEW TRADE (CREATE_FORM_FILL), mandatory fields are: symbol, side (BUY/SELL), and price (entry price). NOTE: If the user says "at current price", "market price", or "live price", then price is NO LONGER mandatory. Set it to null. Optional fields are: exchange, quantity, priceOut, stopLoss, target, strategy, and notes.
- For a MISTAKE (CREATE_MISTAKE), mandatory fields are: title, and impact (financial loss). Optional fields are: desc, category, and recurred.
- For RISK CALCULATOR (CALCULATE_RISK), mandatory fields are: symbol, side (BUY/SELL), price (entry), and stopLoss. NOTE: If the user says "at current price", set price to null. Optional fields are: exchange, target, riskPercent.
- For EXIT or UPDATE, mandatory field is: symbol.

EXCEPTION TO MANDATORY FIELDS / PROCEEDING:
If the user explicitly states they want to skip a field, fill it out manually later, or ignore your question (e.g. "I'll do it myself", "skip", "I'll fill it later", "done", "ready"), you must IMMEDIATELY stop asking questions and return the final action intent (CREATE_FORM_FILL, CREATE_MISTAKE, etc.) with whatever data you have collected so far. Leave the missing fields as null.

If any mandatory fields are missing, you MUST return the ASK_CLARIFICATION intent with a natural language message asking for the missing info AND gently reminding them of the optional fields they can also provide. 
Example: { "intent": "ASK_CLARIFICATION", "message": "Which stock did you trade? (You can also include quantity, stop loss, and target if you want).", "data": {} }

If ALL mandatory fields are present, BUT the user hasn't provided the optional fields and hasn't explicitly told you they are finished (like "done", "skip", "no", "that's it"), you MUST return ASK_CLARIFICATION to ask if they want to add the optional fields.
Example: { "intent": "ASK_CLARIFICATION", "message": "Got the main details! Do you want to add quantity, stop loss, target, or your strategy? Or just reply 'skip' to proceed.", "data": {} }

Once you have all mandatory fields, return the action intent:

If the user is describing a NEW trade they took or want to log (including past trades):
Intent: "CREATE_FORM_FILL"
Extract: symbol, exchange (e.g. NSE, BSE, NASDAQ, CRYPTO. Default to NSE if unknown, but if it's a crypto pair like 'ethusdt', use CRYPTO), side (BUY/SELL), quantity, price (entry price, or null if market price), priceOut (exit price), stopLoss, target.
Also extract executionTime (entry date/time) and exitTime (exit date/time) if mentioned, in ISO format "YYYY-MM-DDTHH:mm".
Additionally, you MUST act as a professional trading analyst and generate a comprehensive 'thesis' (why they took the trade based on their prompt) and 'notes' (any additional context) in English. Translate their Hinglish reasons into professional trading terminology.

If the user is describing a trading MISTAKE they made:
Intent: "CREATE_MISTAKE"
Extract: title, desc (description), category ("Entry" | "Risk Mgmt" | "Psychology" | "Exit" | "Analysis"), symbol, direction ("LONG" | "SHORT"), priceIn, priceOut, impact (financial loss as a positive number), recurred (default 1).

If the user wants to EXIT an existing open trade:
Intent: "EXIT_TRADE"
Extract: symbol (must match one of their open trades), exitPrice (null if they say "at current price" or "market"), quantity (null if they say "fully" or don't specify, meaning full exit).

If the user wants to UPDATE an existing open trade (like trailing a stop loss, changing a target, or updating their thesis/notes):
Intent: "UPDATE_TRADE"
Extract: symbol, stopLoss, target, thesis, notes, reasonForEntry, setup, strategy, confidence.

If the user wants to OPEN the EDIT FORM for a specific trade (e.g. "Edit my Reliance trade", "Open edit form for TCS"):
Intent: "EDIT_TRADE"
Extract: tradeId (match this from the provided recent trades context based on the symbol the user mentions).

If the user wants to ADD MORE quantity to an existing open trade (e.g. "Buy 50 more Reliance"):
Intent: "ADD_EXECUTION"
Extract: symbol, side (BUY/SELL), price (null if market), quantity.

If the user wants to calculate risk or position size for a trade:
Intent: "CALCULATE_RISK"
Extract: symbol, side (BUY/SELL), price (entry), stopLoss, target, riskPercent.

If the user wants to take a screenshot or capture the current page as an image:
Intent: "EXPORT_SCREENSHOT"
Extract: nothing required.

If the user wants to download or export the current page as a PDF:
Intent: "EXPORT_PDF"
Extract: nothing required.

If the user just asks for the current price or quote of a stock/crypto:
Intent: "GET_QUOTE"
Extract: symbol, exchange.

If the user asks a general question about how to use the app, where to find a setting, or how to navigate the website (e.g. "how do I change my capital?", "where is the risk calculator?", "how to close a trade", "how to delete a trade"):
Intent: "APP_NAVIGATION_GUIDE"
Extract: nothing required. But in the "message" field of the JSON, you MUST provide a helpful natural language guide based on this Knowledge Base:
- Default Trading Capital / Total Capital: Change it in Settings -> Trading tab -> Risk Management.
- Profile (Name, Avatar, Bio): Change it in Settings -> General tab.
- Risk Calculator: Accessible from the sidebar, helps size positions based on capital and risk.
- Import Trades: Go to Dashboard -> Import to upload CSV files from brokers.
- Export Data: Use the export options on the dashboard.
- Close/Exit a Trade: You can ask the AI to "close my Reliance trade", or do it manually by clicking the trade in your Dashboard/Trades page and adding an exit execution.
- Edit/Delete a Trade: Click on a trade to open its details page. To edit, click the Edit button. To delete, use the delete option/button inside the edit menu or on the trade page.
- If it's a feature not explicitly listed, use your best logical guess based on standard trade journal apps.

Respond ONLY with valid JSON matching this schema:
{
  "intent": "ASK_CLARIFICATION" | "CREATE_FORM_FILL" | "EXIT_TRADE" | "UPDATE_TRADE" | "ADD_EXECUTION" | "CREATE_MISTAKE" | "CALCULATE_RISK" | "EXPORT_SCREENSHOT" | "EXPORT_PDF" | "GET_QUOTE" | "EDIT_TRADE" | "APP_NAVIGATION_GUIDE",
  "message": string | null,
  "data": {
    "symbol": string | null,
    "tradeId": string | null,
    "exchange": string | null,
    "side": "BUY" | "SELL" | null,
    "quantity": number | null,
    "price": number | null,
    "executionTime": string | null,
    "exitTime": string | null,
    "stopLoss": number | null,
    "target": number | null,
    "setup": string | null,
    "strategy": string | null,
    "marketCondition": string | null,
    "reasonForEntry": string | null,
    "confidence": string | null,
    "thesis": string | null,
    "notes": string | null,
    "title": string | null,
    "desc": string | null,
    "category": string | null,
    "direction": string | null,
    "priceIn": number | null,
    "priceOut": number | null,
    "impact": number | null,
    "recurred": number | null,
    "riskPercent": number | null
  }
}
Do not include markdown blocks or any other text. Only the JSON.`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Please add your GROQ_API_KEY to your .env file to use the AI Assistant." }, { status: 400 });
    }
    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages, prompt } = await req.json();
    if (!messages && !prompt) return NextResponse.json({ error: "Messages or Prompt is required" }, { status: 400 });

    const chatHistory = messages || [{ role: "user", content: prompt }];

    // Fetch open trades context to help the AI understand what "exit reliance" means
    const openTrades = await prisma.trade.findMany({
      where: { userId, status: { in: ["OPEN", "PARTIAL"] } },
      select: { id: true, symbol: true, exchange: true, direction: true, totalBuyQty: true, totalSellQty: true, riskAmount: true, entryTime: true, grossPnl: true, netPnl: true, pnlPercentage: true, rMultiple: true },
    });

    const openTradesContext = openTrades.length > 0 
      ? `\n\nUser's current OPEN trades:\n${openTrades.map(t => `- ${t.symbol} (${t.direction}), Open Qty: ${t.direction === "LONG" ? t.totalBuyQty - t.totalSellQty : t.totalSellQty - t.totalBuyQty}`).join("\n")}`
      : "\n\nUser has no open trades currently.";

    const recentTrades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { entryTime: "desc" },
      take: 10,
      select: { id: true, symbol: true, status: true }
    });

    const recentTradesContext = recentTrades.length > 0
      ? `\n\nUser's recent 10 trades (use these IDs if they want to edit a trade):\n${recentTrades.map(t => `- ID: ${t.id} | Symbol: ${t.symbol} | Status: ${t.status}`).join("\n")}`
      : "";

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT + openTradesContext + recentTradesContext },
        ...chatHistory
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) throw new Error("No response from Groq");

    const parsed = JSON.parse(responseContent);

    // Auto-Execution Logic for EXIT
    if (parsed.intent === "EXIT_TRADE" && parsed.data.symbol) {
      const trade = openTrades.find((t) => t.symbol.toUpperCase() === parsed.data.symbol.toUpperCase());
      
      if (trade) {
        let exitPrice = parsed.data.price;
        // If price wasn't specified, fetch current market price
        if (!exitPrice) {
          const quote = await fetchStockQuote(trade.symbol, trade.exchange);
          if (quote && quote.regularMarketPrice) {
            exitPrice = quote.regularMarketPrice;
          } else {
            return NextResponse.json({ 
              error: `Could not fetch live price for ${trade.symbol}. Please specify a price.` 
            }, { status: 400 });
          }
        }

        const openQty = trade.direction === "LONG" ? trade.totalBuyQty - trade.totalSellQty : trade.totalSellQty - trade.totalBuyQty;
        const exitQty = parsed.data.quantity || openQty;
        const exitSide = trade.direction === "LONG" ? "SELL" : "BUY";

        // Create execution
        await prisma.execution.create({
          data: {
            userId,
            tradeId: trade.id,
            symbol: trade.symbol,
            side: exitSide,
            quantity: exitQty,
            executedQty: exitQty,
            price: exitPrice,
            avgPrice: exitPrice,
            executionTime: new Date(),
            fingerprint: `ai-exit-${Date.now()}`,
          },
        });

        // Update trade totals
        const allExecs = await prisma.execution.findMany({ where: { tradeId: trade.id } });
        let newBuyQty = 0;
        let newSellQty = 0;
        let totalBuyValue = 0;
        let totalSellValue = 0;
        allExecs.forEach(e => {
          if (e.side === "BUY") { newBuyQty += e.quantity; totalBuyValue += (e.quantity * e.price); }
          else { newSellQty += e.quantity; totalSellValue += (e.quantity * e.price); }
        });

        const newAvgEntry = trade.direction === "LONG" ? (newBuyQty ? totalBuyValue / newBuyQty : 0) : (newSellQty ? totalSellValue / newSellQty : 0);
        const newAvgExit = trade.direction === "LONG" ? (newSellQty ? totalSellValue / newSellQty : null) : (newBuyQty ? totalBuyValue / newBuyQty : null);
        
        let newStatus = "OPEN";
        if (trade.direction === "LONG") {
          if (newSellQty >= newBuyQty && newBuyQty > 0) newStatus = "CLOSED";
          else if (newSellQty > 0) newStatus = "PARTIAL";
        } else {
          if (newBuyQty >= newSellQty && newSellQty > 0) newStatus = "CLOSED";
          else if (newBuyQty > 0) newStatus = "PARTIAL";
        }

        const totalEntryQty = trade.direction === "LONG" ? newBuyQty : newSellQty;
        const totalExitQty = trade.direction === "LONG" ? newSellQty : newBuyQty;

        let grossPnl = trade.grossPnl || 0;
        let netPnl = trade.netPnl || 0;
        let pnlPercentage = trade.pnlPercentage || 0;
        let rMultiple = trade.rMultiple;
        let holdingPeriodMs = null;

        if (totalExitQty > 0) {
          if (trade.direction === "LONG") {
            grossPnl = (newAvgExit! - newAvgEntry) * totalExitQty;
          } else {
            grossPnl = (newAvgEntry - newAvgExit!) * totalExitQty;
          }
          netPnl = grossPnl;
          const investment = newAvgEntry * totalEntryQty;
          pnlPercentage = investment > 0 ? (grossPnl / investment) * 100 : 0;
          if (trade.riskAmount && trade.riskAmount > 0) {
            rMultiple = grossPnl / trade.riskAmount;
          }
        }
        
        const exitDate = newStatus === "CLOSED" ? new Date() : undefined;
        if (newStatus === "CLOSED") {
          holdingPeriodMs = exitDate!.getTime() - trade.entryTime.getTime();
        }

        await prisma.trade.update({
          where: { id: trade.id },
          data: {
            totalBuyQty: newBuyQty,
            totalSellQty: newSellQty,
            avgEntryPrice: newAvgEntry,
            avgExitPrice: newAvgExit,
            status: newStatus,
            grossPnl,
            netPnl,
            pnlPercentage,
            rMultiple,
            exitTime: exitDate,
            holdingPeriodMs,
          }
        });

        return NextResponse.json({ success: true, message: `Successfully exited ${exitQty} shares of ${trade.symbol} at ₹${exitPrice}` });
      }
    }

    // Auto-Execution Logic for UPDATE
    if (parsed.intent === "UPDATE_TRADE" && parsed.data.symbol) {
      const trade = openTrades.find((t) => t.symbol.toUpperCase() === parsed.data.symbol.toUpperCase());
      if (trade) {
        const updates: any = {};
        if (parsed.data.stopLoss) updates.stopLoss = parsed.data.stopLoss;
        if (parsed.data.target) updates.target = parsed.data.target;
        if (parsed.data.thesis) updates.thesis = parsed.data.thesis;
        if (parsed.data.notes) updates.notes = parsed.data.notes;
        if (parsed.data.reasonForEntry) updates.reasonForEntry = parsed.data.reasonForEntry;
        if (parsed.data.setup) updates.setup = parsed.data.setup;
        if (parsed.data.strategy) updates.strategy = parsed.data.strategy;
        if (parsed.data.confidence) updates.confidence = Number(parsed.data.confidence);
        
        if (Object.keys(updates).length > 0) {
          await prisma.trade.update({ where: { id: trade.id }, data: updates });
          return NextResponse.json({ success: true, message: `Successfully updated ${trade.symbol}.` });
        } else {
          return NextResponse.json({ success: true, data: {
            intent: "ASK_CLARIFICATION",
            message: `What exactly would you like to update for your ${trade.symbol} trade?`,
            data: parsed.data
          }});
        }
      }
    }

    // Auto-Execution Logic for EDIT_TRADE
    if (parsed.intent === "EDIT_TRADE") {
      if (parsed.data.tradeId) {
        return NextResponse.json({ success: true, data: {
          intent: "EDIT_TRADE",
          tradeId: parsed.data.tradeId,
          message: "Redirecting you to the edit form..."
        }});
      } else {
        return NextResponse.json({ success: true, data: {
          intent: "ASK_CLARIFICATION",
          message: "Which trade would you like to edit? Please specify the symbol.",
          data: parsed.data
        }});
      }
    }

    // Auto-Execution Logic for ADD_EXECUTION
    if (parsed.intent === "ADD_EXECUTION" && parsed.data.symbol) {
      const trade = openTrades.find((t) => t.symbol.toUpperCase() === parsed.data.symbol.toUpperCase());
      if (trade) {
        let entryPrice = parsed.data.price;
        if (!entryPrice) {
          const quote = await fetchStockQuote(trade.symbol);
          if (quote && quote.regularMarketPrice) {
            entryPrice = quote.regularMarketPrice;
          } else {
            return NextResponse.json({ 
              error: `Could not fetch live price for ${trade.symbol}. Please specify a price.` 
            }, { status: 400 });
          }
        }

        const addQty = parsed.data.quantity;
        if (!addQty) {
          return NextResponse.json({ error: "Please specify the quantity to add." }, { status: 400 });
        }

        const addSide = trade.direction === "LONG" ? "BUY" : "SELL"; // Add in the same direction

        // Create execution
        await prisma.execution.create({
          data: {
            userId,
            tradeId: trade.id,
            symbol: trade.symbol,
            side: addSide,
            quantity: addQty,
            executedQty: addQty,
            price: entryPrice,
            avgPrice: entryPrice,
            executionTime: new Date(),
            fingerprint: `ai-add-${Date.now()}`,
          },
        });

        // Update trade totals
        const allExecs = await prisma.execution.findMany({ where: { tradeId: trade.id } });
        let newBuyQty = 0;
        let newSellQty = 0;
        let totalBuyValue = 0;
        let totalSellValue = 0;
        allExecs.forEach(e => {
          if (e.side === "BUY") { newBuyQty += e.quantity; totalBuyValue += (e.quantity * e.price); }
          else { newSellQty += e.quantity; totalSellValue += (e.quantity * e.price); }
        });

        const newAvgEntry = trade.direction === "LONG" ? (newBuyQty ? totalBuyValue / newBuyQty : 0) : (newSellQty ? totalSellValue / newSellQty : 0);

        await prisma.trade.update({
          where: { id: trade.id },
          data: {
            totalBuyQty: newBuyQty,
            totalSellQty: newSellQty,
            avgEntryPrice: newAvgEntry,
          }
        });

        return NextResponse.json({ success: true, message: `Successfully added ${addQty} shares to ${trade.symbol} at ₹${entryPrice}` });
      } else {
        return NextResponse.json({ error: `You don't have an open trade for ${parsed.data.symbol} to add to.` }, { status: 400 });
      }
    }

    // Auto-Execution Logic for GET_QUOTE
    if (parsed.intent === "GET_QUOTE" && parsed.data.symbol) {
      const quote = await fetchStockQuote(parsed.data.symbol, parsed.data.exchange || "NSE");
      if (quote && quote.regularMarketPrice) {
        return NextResponse.json({ success: true, data: {
          intent: "GET_QUOTE",
          message: `The live market price of ${parsed.data.symbol} is ₹${quote.regularMarketPrice}.`,
          data: parsed.data
        }});
      } else {
        return NextResponse.json({ success: true, data: {
          intent: "GET_QUOTE",
          message: `I couldn't fetch the live price for ${parsed.data.symbol}. Please check the symbol and exchange.`,
          data: parsed.data
        }});
      }
    }

    // If it's CREATE_FORM_FILL or CALCULATE_RISK, check if we need to auto-fetch the live price
    if ((parsed.intent === "CREATE_FORM_FILL" || parsed.intent === "CALCULATE_RISK") && parsed.data.symbol && !parsed.data.price) {
      const quote = await fetchStockQuote(parsed.data.symbol, parsed.data.exchange || "NSE");
      if (quote && quote.regularMarketPrice) {
        parsed.data.price = quote.regularMarketPrice;
        if (!parsed.message) {
          parsed.message = `Fetched current market price: ₹${quote.regularMarketPrice}`;
        }
      } else {
        // If we fail to fetch, ask clarification instead
        return NextResponse.json({ success: true, data: {
          intent: "ASK_CLARIFICATION",
          message: `I couldn't fetch the live market price for ${parsed.data.symbol}. Please provide your entry price.`,
          data: parsed.data
        }});
      }
    }

    // Just return the parsed data for the frontend to handle
    return NextResponse.json({ success: true, data: parsed });

  } catch (error: any) {
    console.error("AI Command Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
