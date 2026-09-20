"use client";
import React, { useEffect, useRef, useState } from 'react';
import './Experience.css';

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function Experience() {
  const [sectionRef, inView] = useInView(0.08);

  const trades = [
    { sym: 'RELIANCE', typ: 'LONG', set: 'VCP', risk: '1.2R', pnl: '+18.4K', status: 'WIN' },
    { sym: 'TCS',      typ: 'LONG', set: 'BRK', risk: '1.0R', pnl: '+9.6K', status: 'WIN' },
    { sym: 'BTC/USDT', typ: 'SHRT', set: 'TL',  risk: '0.8R', pnl: '+35K',  status: 'WIN' },
    { sym: 'INFY',     typ: 'LONG', set: 'PULL', risk: '1.5R', pnl: '-4.2K', status: 'LOSS' },
    { sym: 'HDFCBANK', typ: 'SHRT', set: 'REV',  risk: '1.0R', pnl: '-2.1K', status: 'LOSS' },
    { sym: 'TATAMOT',  typ: 'LONG', set: 'GAP',  risk: '2.0R', pnl: '+22K',  status: 'WIN' },
  ];

  // Hardcoded to prevent SSR hydration mismatch
  const calendarDays = [
    0, 0, 0, 1, -1, 2, 1, 
    1, 2, -1, 1, 1, 1, 2, 
    -1, 1, 2, 1, -1, -1, 1, 
    2, 1, 1, 2, 1, -1, 1, 
    2, 2, 1, 1, 0, 0, 0
  ];

  return (
    <section className="experience section" ref={sectionRef} aria-label="Command Center" id="experience">
      <div className="container">
        <div className="experience__header">
          <span className="section-label">The Command Center</span>
          <h2 className="experience__title">
            All your data.<br />At a single glance.
          </h2>
          <p className="experience__sub">
            Serious traders do not have time for fluffy metrics. The TraderLabs dashboard is designed for maximum data density, giving you instantaneous feedback on your portfolio health, recent executions, and behavioral patterns.
          </p>
        </div>

        <div className={`exp__dashboard ${inView ? 'exp__dashboard--active' : ''}`}>
          {/* Top Bar: Portfolio */}
          <div className="exp__dash-top">
            <div className="exp__metric">
              <span className="exp__metric-label">NET P&L (MTD)</span>
              <span className="exp__metric-val color-up">+₹1,42,500</span>
            </div>
            <div className="exp__metric">
              <span className="exp__metric-label">WIN RATE</span>
              <span className="exp__metric-val">68.4%</span>
            </div>
            <div className="exp__metric">
              <span className="exp__metric-label">PROFIT FACTOR</span>
              <span className="exp__metric-val">2.41</span>
            </div>
            <div className="exp__metric">
              <span className="exp__metric-label">OPEN RISK</span>
              <span className="exp__metric-val">-0.8R</span>
            </div>
          </div>

          <div className="exp__dash-grid">
            {/* Left: Trade Log */}
            <div className="exp__panel exp__panel-log">
              <div className="exp__panel-header">
                <span>RECENT EXECUTIONS</span>
                <span>VIEW ALL ↗</span>
              </div>
              <div className="exp__log-table">
                <div className="exp__log-row exp__log-head">
                  <span>SYM</span>
                  <span>TYPE</span>
                  <span>SETUP</span>
                  <span>RISK</span>
                  <span>P&L</span>
                </div>
                {trades.map((t, i) => (
                  <div key={i} className="exp__log-row">
                    <span style={{ color: 'var(--color-text-primary)' }}>{t.sym}</span>
                    <span>{t.typ}</span>
                    <span>{t.set}</span>
                    <span>{t.risk}</span>
                    <span className={t.status === 'WIN' ? 'color-up' : 'color-down'}>{t.pnl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Top: Calendar */}
            <div className="exp__panel exp__panel-cal">
              <div className="exp__panel-header">
                <span>P&L HEATMAP</span>
                <span>SEP 2026</span>
              </div>
              <div className="exp__cal-grid">
                {calendarDays.map((val, i) => (
                  <div 
                    key={i} 
                    className={`exp__cal-day ${val === 1 ? 'day-win' : val === -1 ? 'day-loss' : val === 2 ? 'day-even' : 'day-empty'}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Bottom: Insight */}
            <div className="exp__panel exp__panel-insight">
              <div className="exp__panel-header" style={{ color: 'var(--color-accent)' }}>
                <span>SYS_ALERT</span>
                <span>MISTAKE VAULT</span>
              </div>
              <p className="exp__insight-text">
                Your <span style={{ color: 'var(--color-text-primary)' }}>"FOMO Entries"</span> leak has cost you -2.4R this week. Wait for the 15m candle close before executing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
