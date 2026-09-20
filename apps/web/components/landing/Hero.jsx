"use client";
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

/* --- Mini Candlestick Chart SVG component --- */
function CandlestickChart() {
  const candles = [
    { x: 0,   open: 70, close: 55, high: 75, low: 50, up: false },
    { x: 28,  open: 55, close: 72, high: 78, low: 52, up: true  },
    { x: 56,  open: 72, close: 62, high: 76, low: 58, up: false },
    { x: 84,  open: 62, close: 85, high: 90, low: 60, up: true  },
    { x: 112, open: 85, close: 78, high: 88, low: 72, up: false },
    { x: 140, open: 78, close: 94, high: 98, low: 75, up: true  },
    { x: 168, open: 94, close: 88, high: 97, low: 84, up: false },
    { x: 196, open: 88, close: 105, high: 110, low: 85, up: true },
    { x: 224, open: 105, close: 98, high: 108, low: 94, up: false },
    { x: 252, open: 98, close: 118, high: 122, low: 96, up: true },
  ];

  const chartH = 140;
  const minVal = 48;
  const maxVal = 125;
  const range = maxVal - minVal;
  const toY = v => ((maxVal - v) / range) * chartH;

  return (
    <svg
      className="hero__chart"
      viewBox="-8 -8 292 156"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      aria-label="Candlestick chart showing upward trading performance"
    >
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((frac, i) => (
        <line
          key={i}
          x1={-8}
          y1={frac * chartH}
          x2={284}
          y2={frac * chartH}
          stroke="var(--color-border)"
          strokeWidth="0.75"
          strokeDasharray="4 6"
        />
      ))}

      {/* Candles */}
      {candles.map((c, i) => {
        const top = Math.min(toY(c.open), toY(c.close));
        const bottom = Math.max(toY(c.open), toY(c.close));
        const bodyH = Math.max(bottom - top, 2);
        const color = c.up ? 'var(--color-up)' : 'var(--color-down)';

        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={c.x + 8}
              y1={toY(c.high)}
              x2={c.x + 8}
              y2={toY(c.low)}
              stroke={color}
              strokeWidth="1"
              strokeLinecap="round"
            />
            {/* Body */}
            <rect
              x={c.x}
              y={top}
              width={16}
              height={bodyH}
              rx={2}
              fill={color}
              opacity={0.85}
            />
          </g>
        );
      })}

      {/* Entry/exit annotation */}
      <circle cx={84} cy={toY(85)} r={3} fill="var(--color-accent)" />
      <line x1={84} y1={toY(85)} x2={84} y2={toY(85) - 22} stroke="var(--color-accent)" strokeWidth="0.75" strokeDasharray="2 2" />
      <text x={88} y={toY(85) - 24} fontFamily="IBM Plex Mono" fontSize="7" fill="var(--color-accent)" letterSpacing="0.04em">ENTRY</text>

      <circle cx={260} cy={toY(118)} r={3} fill="var(--color-accent)" />
      <line x1={260} y1={toY(118)} x2={260} y2={toY(118) - 22} stroke="var(--color-accent)" strokeWidth="0.75" strokeDasharray="2 2" />
      <text x={230} y={toY(118) - 24} fontFamily="IBM Plex Mono" fontSize="7" fill="var(--color-accent)" letterSpacing="0.04em">EXIT +22.3%</text>
    </svg>
  );
}

/* --- Floating stat pills --- */
function StatPill({ label, value, positive, delay }) {
  return (
    <div className="hero__stat-pill" style={{ animationDelay: delay }}>
      <span className="hero__stat-label">{label}</span>
      <span className={`hero__stat-value ${positive ? 'hero__stat-value--up' : 'hero__stat-value--down'}`}>
        {value}
      </span>
    </div>
  );
}

export default function Hero({ isLoggedIn }) {
  const heroRef = useRef(null);

  // Subtle parallax on mouse move
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      const visual = hero.querySelector('.hero__visual');
      if (visual) {
        visual.style.transform = `translate(${x * 12}px, ${y * 8}px)`;
      }
    };

    const handleMouseLeave = () => {
      const visual = hero.querySelector('.hero__visual');
      if (visual) {
        visual.style.transform = 'translate(0, 0)';
      }
    };

    hero.addEventListener('mousemove', handleMouseMove);
    hero.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSmoothScroll = (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="hero" ref={heroRef} aria-label="Hero section">
      {/* Background grid */}
      <div className="hero__grid" aria-hidden="true" />

      <div className="container hero__container">
        {/* Left: copy */}
        <div className="hero__copy">
          <div className="tag hero__tag">
            <span className="hero__tag-dot" aria-hidden="true" />
            Trading Journal
          </div>

          <h1 className="hero__headline">
            Your edge is built in{' '}
            <em className="hero__headline-em">your journal.</em>
          </h1>

          <p className="hero__sub">
            TraderLabs is a powerful trading journal for Indian equity, crypto, and swing traders.
            Plan every trade, execute with discipline, and review your performance — all in one place.
          </p>

          <div className="hero__actions">
            {isLoggedIn ? (
              <Link href="/dashboard" id="hero-cta-primary" className="btn-primary">
                Go to Dashboard
                <ArrowRight size={15} />
              </Link>
            ) : (
              <Link href="/login" id="hero-cta-primary" className="btn-primary">
                Start journaling free
                <ArrowRight size={15} />
              </Link>
            )}
            <a href="#experience" id="hero-cta-secondary" className="btn-ghost" onClick={handleSmoothScroll}>
              See how it works
            </a>
          </div>

          <div className="hero__proof">
            <span className="hero__proof-text">
              Built for NSE, BSE &amp; Crypto traders
            </span>
          </div>
        </div>

        {/* Right: visual */}
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__chart-card">
            <div className="hero__chart-header">
              <span className="hero__chart-ticker font-mono">RELIANCE · NSE — VCP</span>
              <span className="hero__chart-return hero__stat-value--up">+18.6%</span>
            </div>
            <CandlestickChart />
            <div className="hero__chart-footer">
              <div className="hero__chart-meta font-mono">
                <span>Entry: ₹2,840</span>
                <span>Exit: ₹3,368</span>
                <span>Hold: 11d</span>
              </div>
            </div>
          </div>

          {/* Floating stats */}
          <StatPill label="Win rate" value="64.2%" positive delay="0.2s" />
          <StatPill label="Avg R:R" value="1:2.4" positive delay="0.4s" />
          <StatPill label="Trades logged" value="186" positive delay="0.6s" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll" aria-hidden="true">
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
