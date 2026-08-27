import { useState, useMemo, useEffect } from "react";

export interface RiskTemplate {
  id: string;
  name: string;
  capital: number;
  maxPortfolioRiskPct: number;
  defaultTradeRiskPct: number;
  slippagePct: number;
  winRatePct: number;
}

export interface PlannerTrade {
  id: string;
  symbol: string;
  exchange: string;
  direction: "LONG" | "SHORT";
  entry: number;
  stop: number;
  target: number;
  riskPct: number; // Individual trade risk %
  sector: string;
  status: "OPEN" | "PLANNED";
}

export function useRiskEngine() {
  // Global Settings
  const [capital, setCapital] = useState<number>(500000);
  const [maxPortfolioRiskPct, setMaxPortfolioRiskPct] = useState<number>(1.5);
  
  // UI State
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  
  // Current Trade Inputs
  const [symbol, setSymbol] = useState<string>("");
  const [exchange, setExchange] = useState<string>("NSE");
  const [sector, setSector] = useState<string>("Unclassified");
  const [defaultTradeRiskPct, setDefaultTradeRiskPct] = useState<number>(0.5);
  const [entry, setEntry] = useState<number>(0);
  const [stop, setStop] = useState<number>(0);
  const [target, setTarget] = useState<number>(0);
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [slippagePct, setSlippagePct] = useState<number>(0.1);
  const [winRatePct, setWinRatePct] = useState<number>(40);

  // Portfolio State
  const [trades, setTrades] = useState<PlannerTrade[]>([]);

  const [savedTemplates, setSavedTemplates] = useState<RiskTemplate[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("risk_templates");
    if (stored) {
      try {
        setSavedTemplates(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (savedTemplates.length > 0) {
      localStorage.setItem("risk_templates", JSON.stringify(savedTemplates));
    } else {
      localStorage.removeItem("risk_templates");
    }
  }, [savedTemplates]);

  // Derived: Global Risk Wallet
  const maxRiskBudget = capital * (maxPortfolioRiskPct / 100);

  // Derived: Current Trade
  const tradeRiskAmount = capital * (defaultTradeRiskPct / 100);
  
  const currentRiskPerShare = direction === "LONG" 
    ? Math.max(0, entry - stop) 
    : Math.max(0, stop - entry);
    
  const currentPositionSize = currentRiskPerShare > 0 
    ? Math.floor(tradeRiskAmount / currentRiskPerShare) 
    : 0;

  const currentCapitalDeployed = currentPositionSize * entry;
  const currentCapitalUtilizationPct = capital > 0 ? (currentCapitalDeployed / capital) * 100 : 0;

  const currentExecutionRisk = currentRiskPerShare + (entry * (slippagePct / 100));
  const currentMaxExecutionLoss = currentPositionSize * currentExecutionRisk;

  const currentRewardPerShare = direction === "LONG" 
    ? Math.max(0, target - entry) 
    : Math.max(0, entry - target);
    
  const currentRR = currentRiskPerShare > 0 ? currentRewardPerShare / currentRiskPerShare : 0;
  const currentPotentialProfit = currentPositionSize * currentRewardPerShare;

  const winRateDecimal = winRatePct / 100;
  const lossRateDecimal = 1 - winRateDecimal;
  const currentExpectancyR = (winRateDecimal * currentRR) - (lossRateDecimal * 1);
  const currentExpectancyAmt = currentExpectancyR * tradeRiskAmount;

  // Derived: Portfolio Planner Metrics
  const enrichedTrades = useMemo(() => {
    return trades.map(trade => {
      const riskAmount = capital * (trade.riskPct / 100);
      const riskPerShare = trade.direction === "LONG" ? trade.entry - trade.stop : trade.stop - trade.entry;
      const quantity = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
      const rewardPerShare = trade.direction === "LONG" ? trade.target - trade.entry : trade.entry - trade.target;
      const rr = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;
      const capitalDeployed = quantity * trade.entry;
      return {
        ...trade,
        riskAmount,
        riskPerShare,
        quantity,
        rewardPerShare,
        rr,
        capitalDeployed
      };
    });
  }, [trades, capital]);

  const openRiskAmount = enrichedTrades.filter(t => t.status === "OPEN").reduce((acc, t) => acc + t.riskAmount, 0);
  const plannedRiskAmount = enrichedTrades.filter(t => t.status === "PLANNED").reduce((acc, t) => acc + t.riskAmount, 0);
  const totalPortfolioRiskAmount = openRiskAmount + plannedRiskAmount;
  const remainingRiskCapacityAmount = maxRiskBudget - totalPortfolioRiskAmount;

  const openRiskPct = capital > 0 ? (openRiskAmount / capital) * 100 : 0;
  const plannedRiskPct = capital > 0 ? (plannedRiskAmount / capital) * 100 : 0;
  const totalPortfolioRiskPct = openRiskPct + plannedRiskPct;
  const remainingRiskCapacityPct = maxPortfolioRiskPct - totalPortfolioRiskPct;
  
  const totalCapitalDeployed = enrichedTrades.reduce((acc, t) => acc + t.capitalDeployed, 0);
  const totalCapitalUtilizationPct = capital > 0 ? (totalCapitalDeployed / capital) * 100 : 0;

  const fullRiskTradesCapacity = (capital > 0 && defaultTradeRiskPct > 0) 
    ? (remainingRiskCapacityPct / defaultTradeRiskPct) 
    : 0;

  const openCalculator = () => setIsCalculatorOpen(true);
  const closeCalculator = () => setIsCalculatorOpen(false);

  const addTradeToPlanner = () => {
    const newTrade: PlannerTrade = {
      id: Math.random().toString(36).substring(7),
      symbol: symbol || "NEW_TRADE",
      exchange,
      direction,
      entry,
      stop,
      target,
      riskPct: defaultTradeRiskPct,
      sector,
      status: "PLANNED"
    };
    setTrades([...trades, newTrade]);
  };

  const removeTrade = (id: string) => {
    setTrades(trades.filter(t => t.id !== id));
  };
  
  const clearAllTrades = () => {
    setTrades([]);
  };

  const toggleTradeStatus = (id: string) => {
    setTrades(trades.map(t => 
      t.id === id 
        ? { ...t, status: t.status === "OPEN" ? "PLANNED" : "OPEN" } 
        : t
    ));
  };

  const loadTradeToInputs = (id: string) => {
    const trade = trades.find(t => t.id === id);
    if (!trade) return;
    
    setSymbol(trade.symbol);
    setExchange(trade.exchange);
    if (trade.sector) setSector(trade.sector);
    setDefaultTradeRiskPct(trade.riskPct);
    setEntry(trade.entry);
    setStop(trade.stop);
    if (trade.target) setTarget(trade.target);
    setDirection(trade.direction);
  };

  const saveTemplate = () => {
    const newTemplate: RiskTemplate = {
      id: Math.random().toString(36).substring(7),
      name: `Profile ${savedTemplates.length + 1}`,
      capital,
      maxPortfolioRiskPct,
      defaultTradeRiskPct,
      slippagePct,
      winRatePct
    };
    setSavedTemplates([...savedTemplates, newTemplate]);
  };

  const loadTemplate = (id: string) => {
    const t = savedTemplates.find(x => x.id === id);
    if (!t) return;
    setCapital(t.capital);
    setMaxPortfolioRiskPct(t.maxPortfolioRiskPct);
    setDefaultTradeRiskPct(t.defaultTradeRiskPct);
    setSlippagePct(t.slippagePct);
    setWinRatePct(t.winRatePct);
    setIsCalculatorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const deleteTemplate = (id: string) => {
    setSavedTemplates(savedTemplates.filter(t => t.id !== id));
  };

  return {
    state: {
      isCalculatorOpen,
      capital, maxPortfolioRiskPct, defaultTradeRiskPct,
      symbol, exchange, sector,
      entry, stop, target, direction, slippagePct, winRatePct,
      trades, savedTemplates
    },
    setters: {
      setCapital, setMaxPortfolioRiskPct, setDefaultTradeRiskPct,
      setSymbol, setExchange, setSector,
      setEntry, setStop, setTarget, setDirection, setSlippagePct, setWinRatePct
    },
    current: {
      tradeRiskAmount,
      riskPerShare: currentRiskPerShare,
      positionSize: currentPositionSize,
      capitalDeployed: currentCapitalDeployed,
      capitalUtilizationPct: currentCapitalUtilizationPct,
      executionRiskPerShare: currentExecutionRisk,
      maxExecutionLoss: currentMaxExecutionLoss,
      rewardPerShare: currentRewardPerShare,
      rr: currentRR,
      potentialProfit: currentPotentialProfit,
      expectancyR: currentExpectancyR,
      expectancyAmt: currentExpectancyAmt
    },
    portfolio: {
      maxRiskBudget,
      enrichedTrades,
      openRiskAmount, plannedRiskAmount, totalPortfolioRiskAmount, remainingRiskCapacityAmount,
      openRiskPct, plannedRiskPct, totalPortfolioRiskPct, remainingRiskCapacityPct,
      totalCapitalDeployed, totalCapitalUtilizationPct,
      fullRiskTradesCapacity
    },
    actions: {
      openCalculator,
      closeCalculator,
      addTradeToPlanner,
      removeTrade,
      clearAllTrades,
      toggleTradeStatus,
      loadTradeToInputs,
      saveTemplate,
      loadTemplate,
      deleteTemplate
    }
  };
}
