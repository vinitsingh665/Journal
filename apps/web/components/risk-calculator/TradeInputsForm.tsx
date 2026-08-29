import React from "react";
import { formatINR, cn } from "@/lib/utils";

interface TradeInputsFormProps {
  state: any;
  setters: any;
  current: any;
}

export function TradeInputsForm({ state, setters, current }: TradeInputsFormProps) {
  const { tradeCapital, defaultTradeRiskPct, entry, stop, target, direction, slippagePct, winRatePct } = state;
  const { setTradeCapital, setDefaultTradeRiskPct, setEntry, setStop, setTarget, setDirection, setSlippagePct, setWinRatePct } = setters;

  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  React.useEffect(() => {
    const handler = setTimeout(async () => {
      if (!state.symbol || state.symbol.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${state.symbol}&exchange=${state.exchange}`);
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
  }, [state.symbol, state.exchange]);

  const handleSelectSymbol = (result: any) => {
    setters.setSymbol(result.symbol);
    
    // Check if exchange is valid, otherwise default to NSE or keep current
    const validExchanges = ["NSE", "BSE", "MCX", "CRYPTO", "FOREX"];
    let newExchange = result.exchange;
    if (state.exchange === "CRYPTO") {
      newExchange = "CRYPTO";
    } else if (!validExchanges.includes(newExchange)) {
      newExchange = state.exchange;
    }
    
    setters.setExchange(newExchange);
    
    if (result.price) {
      setEntry(Number(result.price));
    }
    setShowDropdown(false);
  };

  return (
    <div className="card card-body flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-inverse">1</div>
        <h3 className="font-bold text-sm tracking-wide">TRADE RISK INPUTS</h3>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div>
          <label className="block text-xs font-semibold text-secondary mb-1">Trade Capital</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">₹</span>
            <input 
              type="number" 
              className="form-input pl-8 w-full font-mono text-sm" 
              value={tradeCapital === 0 ? "" : tradeCapital}
              onChange={(e) => setTradeCapital(Number(e.target.value))}
            />
          </div>
          <p className="text-[10px] text-muted mt-1">Capital allocated for this trade. Can differ from your total Trading Capital.</p>
        </div>


        <div className="grid grid-cols-2 gap-4">
          <div className="relative z-50">
            <label className="block text-xs font-semibold text-secondary mb-1">Symbol {isSearching && <span className="text-primary text-[10px] ml-2">Searching...</span>}</label>
            <input 
              type="text" 
              placeholder="e.g. RELIANCE"
              className="form-input w-full font-sans text-sm uppercase" 
              value={state.symbol || ""}
              onChange={(e) => {
                setters.setSymbol(e.target.value.toUpperCase());
                setShowDropdown(true);
              }}
              onFocus={() => (state.symbol || "").length >= 2 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              autoComplete="off"
            />
            {showDropdown && searchResults.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 6, marginTop: 4, zIndex: 50, maxHeight: 250, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                {searchResults.map((res, idx) => (
                  <div key={`${res.symbol}-${idx}`} onMouseDown={() => handleSelectSymbol(res)} style={{ padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid var(--border-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg-secondary)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{res.symbol} <span className="text-muted" style={{ fontSize: 10, fontWeight: 400 }}>{res.exchange}</span></div>
                      <div className="text-muted" style={{ fontSize: "var(--text-xs)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{res.name}</div>
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--color-primary)", marginLeft: 8 }}>{formatINR(res.price)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Exchange</label>
            <select 
              className="form-input w-full font-sans text-sm"
              value={state.exchange || "NSE"}
              onChange={(e) => setters.setExchange(e.target.value)}
            >
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
              <option value="MCX">MCX</option>
              <option value="CRYPTO">CRYPTO</option>
              <option value="FOREX">FOREX</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-secondary mb-1">Sector (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Banking, Auto"
            className="form-input w-full font-sans text-sm" 
            value={state.sector || ""}
            onChange={(e) => setters.setSector(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-secondary mb-1">Risk Per Trade</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="number" 
                step="0.1"
                className="form-input w-full font-mono text-sm pr-6" 
                value={defaultTradeRiskPct === 0 ? "" : defaultTradeRiskPct}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setDefaultTradeRiskPct(0);
                  } else {
                    setDefaultTradeRiskPct(Number(e.target.value));
                  }
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs">%</span>
            </div>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">₹</span>
              <input 
                type="number"
                step="100"
                className="form-input w-full pl-7 text-sm font-mono"
                value={current.tradeRiskAmount === 0 ? "" : Number(current.tradeRiskAmount.toFixed(2))}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setDefaultTradeRiskPct(0);
                    return;
                  }
                  const newAmount = Number(e.target.value);
                  const newPct = tradeCapital > 0 ? (newAmount / tradeCapital) * 100 : 0;
                  setDefaultTradeRiskPct(newPct);
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Entry Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">₹</span>
              <input 
                type="number" 
                className="form-input pl-7 w-full font-mono text-sm" 
                value={entry === 0 ? "" : entry}
                onChange={(e) => setEntry(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Stop Loss Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">₹</span>
              <input 
                type="number" 
                className="form-input pl-7 w-full font-mono text-sm" 
                value={stop === 0 ? "" : stop}
                onChange={(e) => setStop(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Target Price (Optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">₹</span>
              <input 
                type="number" 
                className="form-input pl-7 w-full font-mono text-sm" 
                value={target === 0 ? "" : target}
                onChange={(e) => setTarget(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Slippage / Gap Buffer</label>
            <div className="relative flex">
              <input 
                type="number" 
                step="0.05"
                className="form-input w-full font-mono text-sm pr-6" 
                value={slippagePct === 0 ? "" : slippagePct}
                onChange={(e) => setSlippagePct(Number(e.target.value))}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs">%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-secondary mb-1">Expected Win Rate (Optional)</label>
          <div className="relative">
            <input 
              type="number" 
              className="form-input w-full font-mono text-sm pr-6" 
              value={winRatePct === 0 ? "" : winRatePct}
              onChange={(e) => setWinRatePct(Number(e.target.value))}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs">%</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-secondary mb-2">Position Direction</label>
          <div className="flex gap-3">
            <button 
              className={cn("btn flex-1", direction === "LONG" ? "btn-primary bg-positive hover:bg-positive border-positive text-white" : "btn-secondary bg-transparent")}
              onClick={() => setDirection("LONG")}
            >
              ↑ Long
            </button>
            <button 
              className={cn("btn flex-1", direction === "SHORT" ? "btn-primary bg-negative hover:bg-negative border-negative text-white" : "btn-secondary bg-transparent")}
              onClick={() => setDirection("SHORT")}
            >
              ↓ Short
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
