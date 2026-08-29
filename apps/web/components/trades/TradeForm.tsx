"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { STRATEGIES, MARKET_CONDITIONS, EXCHANGES } from "@/lib/constants";
import { formatINR } from "@/lib/utils";

interface TradeFormProps {
  userId: string;
  tradeId?: string;
  initialData?: any;
}

export default function TradeForm({ userId, tradeId, initialData }: TradeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [form, setForm] = useState({
    symbol: initialData?.symbol || "",
    exchange: initialData?.exchange || "NSE",
    side: initialData?.direction === "LONG" ? "BUY" : initialData?.direction === "SHORT" ? "SELL" : "BUY",
    quantity: initialData?.totalBuyQty ? String(initialData.totalBuyQty) : initialData?.totalSellQty ? String(initialData.totalSellQty) : "",
    price: initialData?.avgEntryPrice ? String(initialData.avgEntryPrice) : "",
    executionTime: initialData?.entryTime ? new Date(initialData.entryTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    orderType: "MARKET", // Note: The raw order type isn't stored in Trade directly, we default it
    productType: "CNC",
    // Exit fields
    exitPrice: initialData?.avgExitPrice ? String(initialData.avgExitPrice) : "",
    exitTime: initialData?.exitTime ? new Date(initialData.exitTime).toISOString().slice(0, 16) : "",
    // Journal fields
    strategy: initialData?.strategy || "",
    setup: initialData?.setup || "",
    thesis: initialData?.thesis || "",
    stopLoss: initialData?.stopLoss ? String(initialData.stopLoss) : "",
    target: initialData?.target ? String(initialData.target) : "",
    confidence: initialData?.confidence ? String(initialData.confidence) : "5",
    marketCondition: initialData?.marketCondition || "",
    reasonForEntry: initialData?.reasonForEntry || "",
    reasonForExit: initialData?.reasonForExit || "",
    notes: initialData?.notes || "",
    emotionalState: initialData?.emotionalState || "",
    postTradeReview: initialData?.postTradeReview || "",
  });

  const initialEntry = initialData?.avgEntryPrice || 0;
  const initialSl = initialData?.stopLoss || 0;
  const initialTarget = initialData?.target || 0;

  const [slPercent, setSlPercent] = useState(
    initialEntry > 0 && initialSl > 0 ? (Math.abs(initialEntry - initialSl) / initialEntry * 100).toFixed(2) : ""
  );
  
  const [targetPercent, setTargetPercent] = useState(
    initialEntry > 0 && initialTarget > 0 ? (Math.abs(initialTarget - initialEntry) / initialEntry * 100).toFixed(2) : ""
  );

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Load AI prefill data if available
  useEffect(() => {
    if (!tradeId) {
      const aiDataRaw = sessionStorage.getItem("aiTradePrefill");
      if (aiDataRaw) {
        try {
          const aiData = JSON.parse(aiDataRaw);
          setForm(prev => ({
            ...prev,
            symbol: aiData.symbol || prev.symbol,
            exchange: aiData.exchange || prev.exchange,
            side: aiData.side || prev.side,
            quantity: aiData.quantity ? String(aiData.quantity) : prev.quantity,
            price: aiData.price ? String(aiData.price) : prev.price,
            executionTime: aiData.executionTime || prev.executionTime,
            exitPrice: aiData.priceOut ? String(aiData.priceOut) : prev.exitPrice,
            exitTime: aiData.exitTime || prev.exitTime,
            stopLoss: aiData.stopLoss ? String(aiData.stopLoss) : prev.stopLoss,
            target: aiData.target ? String(aiData.target) : prev.target,
            setup: aiData.setup || prev.setup,
            strategy: aiData.strategy || prev.strategy,
            marketCondition: aiData.marketCondition || prev.marketCondition,
            reasonForEntry: aiData.reasonForEntry || prev.reasonForEntry,
            confidence: aiData.confidence || prev.confidence,
            thesis: aiData.thesis || prev.thesis,
            notes: aiData.notes || prev.notes,
            emotionalState: aiData.emotionalState || prev.emotionalState,
            postTradeReview: aiData.postTradeReview || prev.postTradeReview,
          }));
          const newEntry = aiData.price || parseFloat(form.price) || 0;
          if (newEntry > 0) {
            if (aiData.stopLoss) setSlPercent((Math.abs(newEntry - aiData.stopLoss) / newEntry * 100).toFixed(2));
            if (aiData.target) setTargetPercent((Math.abs(aiData.target - newEntry) / newEntry * 100).toFixed(2));
          }

          sessionStorage.removeItem("aiTradePrefill");
        } catch (e) {
          console.error("Failed to parse AI prefill data", e);
        }
      }
    }
  }, [tradeId]);

  // Debounced search for symbol
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (form.symbol.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${form.symbol}&exchange=${form.exchange}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [form.symbol]);

  const handleSelectSymbol = (result: any) => {
    setForm(prev => {
      let newExchange = result.exchange;
      if (prev.exchange === "CRYPTO") {
        newExchange = "CRYPTO";
      } else if (!EXCHANGES.includes(newExchange)) {
        newExchange = prev.exchange;
      }
      
      return { 
        ...prev, 
        symbol: result.symbol, 
        exchange: newExchange, 
        price: String(result.price) 
      };
    });
    setShowDropdown(false);
  };

  // Calculate expected R:R
  const entry = parseFloat(form.price) || 0;
  const sl = parseFloat(form.stopLoss) || 0;
  const target = parseFloat(form.target) || 0;
  const riskPerShare = entry > 0 && sl > 0 ? Math.abs(entry - sl) : 0;
  const rewardPerShare = entry > 0 && target > 0 ? Math.abs(target - entry) : 0;
  const expectedRR = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateField("price", val);
    const newEntry = parseFloat(val);
    if (newEntry > 0) {
      if (form.stopLoss) setSlPercent((Math.abs(newEntry - parseFloat(form.stopLoss)) / newEntry * 100).toFixed(2));
      if (form.target) setTargetPercent((Math.abs(parseFloat(form.target) - newEntry) / newEntry * 100).toFixed(2));
    }
  };

  const handleSlPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateField("stopLoss", val);
    const parsedSl = parseFloat(val);
    if (entry > 0 && !isNaN(parsedSl)) {
      setSlPercent((Math.abs(entry - parsedSl) / entry * 100).toFixed(2));
    } else {
      setSlPercent("");
    }
  };

  const handleSlPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSlPercent(val);
    const pct = parseFloat(val);
    if (entry > 0 && !isNaN(pct)) {
      const diff = entry * (pct / 100);
      const slPrice = form.side === "BUY" ? entry - diff : entry + diff;
      updateField("stopLoss", slPrice.toFixed(2));
    } else {
      updateField("stopLoss", "");
    }
  };

  const handleTargetPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateField("target", val);
    const parsedTarget = parseFloat(val);
    if (entry > 0 && !isNaN(parsedTarget)) {
      setTargetPercent((Math.abs(parsedTarget - entry) / entry * 100).toFixed(2));
    } else {
      setTargetPercent("");
    }
  };

  const handleTargetPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTargetPercent(val);
    const pct = parseFloat(val);
    if (entry > 0 && !isNaN(pct)) {
      const diff = entry * (pct / 100);
      const targetPrice = form.side === "BUY" ? entry + diff : entry - diff;
      updateField("target", targetPrice.toFixed(2));
    } else {
      updateField("target", "");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = tradeId ? `/api/trades/${tradeId}` : "/api/trades";
      const method = tradeId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: parseFloat(form.quantity),
          price: parseFloat(form.price),
          exitPrice: form.exitPrice ? parseFloat(form.exitPrice) : null,
          exitTime: form.exitTime || null,
          stopLoss: form.stopLoss ? parseFloat(form.stopLoss) : null,
          target: form.target ? parseFloat(form.target) : null,
          confidence: parseInt(form.confidence),
          expectedRR: expectedRR || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (tradeId ? "Failed to update trade" : "Failed to create trade"));

      router.push("/trades");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="trade-form">
      <div className="grid-2">
        {/* Left column - Trade Details */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Trade Details</span>
          </div>
          <div className="card-body flex-col gap-4" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="grid-2">
              <div className="form-group" style={{ position: "relative" }}>
                <label className="form-label">Symbol * {isSearching && <span style={{ fontSize: 10, color: "var(--color-primary)", marginLeft: 8 }}>Searching...</span>}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. RELIANCE"
                  value={form.symbol}
                  onChange={(e) => {
                    updateField("symbol", e.target.value.toUpperCase());
                    setShowDropdown(true);
                  }}
                  onFocus={() => form.symbol.length >= 2 && setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  required
                  id="trade-symbol"
                  autoComplete="off"
                />
                {showDropdown && searchResults.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 6, marginTop: 4, zIndex: 50, maxHeight: 250, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                    {searchResults.map((res, idx) => (
                      <div key={`${res.symbol}-${idx}`} onMouseDown={() => handleSelectSymbol(res)} style={{ padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid var(--border-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg-secondary)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{res.symbol} <span className="text-muted" style={{ fontSize: 10, fontWeight: 400 }}>{res.exchange}</span></div>
                          <div className="text-muted" style={{ fontSize: "var(--text-xs)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{res.name}</div>
                        </div>
                        <div style={{ fontWeight: 600, color: "var(--color-primary)", marginLeft: 8 }}>
                          {["NASDAQ", "NYSE", "CRYPTO"].includes(form.exchange) || ["NASDAQ", "NYSE", "BINANCE", "COINBASE"].includes(res.exchange)
                            ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(res.price)
                            : formatINR(res.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Exchange</label>
                <select
                  className="form-select w-full"
                  value={form.exchange}
                  onChange={(e) => updateField("exchange", e.target.value)}
                >
                  {EXCHANGES.map((ex) => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Side *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`btn ${form.side === "BUY" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => updateField("side", "BUY")}
                    style={{ flex: 1, background: form.side === "BUY" ? "var(--color-positive)" : undefined }}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    className={`btn ${form.side === "SELL" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => updateField("side", "SELL")}
                    style={{ flex: 1, background: form.side === "SELL" ? "var(--color-negative)" : undefined }}
                  >
                    SELL
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Order Type</label>
                <select
                  className="form-select w-full"
                  value={form.orderType}
                  onChange={(e) => updateField("orderType", e.target.value)}
                >
                  <option value="MARKET">Market</option>
                  <option value="LIMIT">Limit</option>
                  <option value="SL">Stop Loss</option>
                  <option value="SL-M">SL-Market</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="100"
                  value={form.quantity}
                  onChange={(e) => updateField("quantity", e.target.value)}
                  required
                  min="0.000001"
                  step="0.000001"
                  id="trade-quantity"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="1420.50"
                  value={form.price}
                  onChange={handlePriceChange}
                  required
                  min="0"
                  step="0.01"
                  id="trade-price"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Entry Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={form.executionTime}
                  onChange={(e) => updateField("executionTime", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Product Type</label>
                <select
                  className="form-select w-full"
                  value={form.productType}
                  onChange={(e) => updateField("productType", e.target.value)}
                >
                  <option value="CNC">CNC (Delivery)</option>
                  <option value="MIS">MIS (Intraday)</option>
                  <option value="NRML">NRML (Normal)</option>
                </select>
              </div>
            </div>

            {/* Exit Section */}
            <div style={{ borderTop: "1px solid var(--border-secondary)", paddingTop: "var(--space-4)", marginTop: "var(--space-2)" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: "var(--space-3)" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>Exit Details</span>
                <span className="text-muted" style={{ fontSize: "var(--text-xs)" }}>(leave blank if trade is still open)</span>
              </div>
              <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
                <label className="form-label">Exit Price</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="1515.00"
                  value={form.exitPrice}
                  onChange={(e) => updateField("exitPrice", e.target.value)}
                  step="0.01"
                  id="trade-exit-price"
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Stop Loss (Price)</label>
                  <input type="number" className="form-input" placeholder="1380.00" value={form.stopLoss} onChange={handleSlPriceChange} step="0.01" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stop Loss (%)</label>
                  <input type="number" className="form-input" placeholder="2.5" value={slPercent} onChange={handleSlPercentChange} step="0.01" />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Target (Price)</label>
                  <input type="number" className="form-input" placeholder="1540.00" value={form.target} onChange={handleTargetPriceChange} step="0.01" />
                </div>
                <div className="form-group">
                  <label className="form-label">Target (%)</label>
                  <input type="number" className="form-input" placeholder="10.0" value={targetPercent} onChange={handleTargetPercentChange} step="0.01" />
                </div>
              </div>

              {/* P&L and Risk/Reward Preview */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
                {form.exitPrice && form.price && (
                  <div className="calc-result-item" style={{ background: parseFloat(form.exitPrice) >= parseFloat(form.price) ? "var(--color-positive-bg)" : "var(--color-negative-bg)" }}>
                    <span className="calc-result-label">Estimated P&L</span>
                    <span className="calc-result-value" style={{ color: parseFloat(form.exitPrice) >= parseFloat(form.price) ? "var(--color-positive)" : "var(--color-negative)" }}>
                      {(() => {
                        const pnl = form.side === "BUY"
                          ? (parseFloat(form.exitPrice) - parseFloat(form.price)) * (parseInt(form.quantity) || 0)
                          : (parseFloat(form.price) - parseFloat(form.exitPrice)) * (parseInt(form.quantity) || 0);
                        return ["NASDAQ", "NYSE", "CRYPTO"].includes(form.exchange)
                          ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", signDisplay: "always" }).format(pnl)
                          : formatINR(pnl, { showSign: true });
                      })()}
                    </span>
                  </div>
                )}
                
                {riskPerShare > 0 && (
                  <div className="calc-result-item" style={{ background: "var(--accent-primary-light)" }}>
                    <span className="calc-result-label">Expected R:R</span>
                    <span className="calc-result-value" style={{ color: "var(--accent-primary)" }}>
                      1 : {expectedRR.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Journal */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Trade Journal</span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="form-group">
              <label className="form-label">Strategy</label>
              <select
                className="form-select w-full"
                value={form.strategy}
                onChange={(e) => updateField("strategy", e.target.value)}
              >
                <option value="">Select strategy...</option>
                {STRATEGIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Setup</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. VCP breakout with volume"
                value={form.setup}
                onChange={(e) => updateField("setup", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trade Thesis</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Why are you taking this trade?"
                value={form.thesis}
                onChange={(e) => updateField("thesis", e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Market Condition</label>
              <select
                className="form-select w-full"
                value={form.marketCondition}
                onChange={(e) => updateField("marketCondition", e.target.value)}
              >
                <option value="">Select condition...</option>
                {MARKET_CONDITIONS.map((mc) => (
                  <option key={mc} value={mc}>{mc}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Confidence ({form.confidence}/10)</label>
              <div className="confidence-slider">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={form.confidence}
                  onChange={(e) => updateField("confidence", e.target.value)}
                />
                <span className="confidence-value">{form.confidence}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Entry</label>
              <textarea
                className="form-input form-textarea"
                placeholder="What triggered your entry?"
                value={form.reasonForEntry}
                onChange={(e) => updateField("reasonForEntry", e.target.value)}
                rows={2}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Any additional notes..."
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={2}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emotional State</label>
              <select
                className="form-select w-full"
                value={form.emotionalState}
                onChange={(e) => updateField("emotionalState", e.target.value)}
              >
                <option value="">Select emotion...</option>
                <option value="Calm">Calm</option>
                <option value="Anxious">Anxious</option>
                <option value="FOMO">FOMO</option>
                <option value="Greedy">Greedy</option>
                <option value="Fearful">Fearful</option>
                <option value="Confident">Confident</option>
                <option value="Frustrated">Frustrated</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Post Trade Review</label>
              <textarea
                className="form-input form-textarea"
                placeholder="What did you learn? What went well or wrong?"
                value={form.postTradeReview}
                onChange={(e) => updateField("postTradeReview", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      {error && (
        <div className="login-error mt-4" style={{ background: "var(--color-negative-bg)", color: "var(--color-negative)", border: "1px solid var(--color-negative)" }}>
          {error}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          id="submit-trade"
        >
          {loading ? (tradeId ? "Updating..." : "Creating...") : (tradeId ? "Update Trade" : "Create Trade")}
        </button>
      </div>
    </form>
  );
}
