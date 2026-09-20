"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import './FinalCTA.css';

export default function FinalCTA() {
  return (
    <section className="final-cta section" aria-label="Get started" id="cta">
      <div className="container final-cta__container">
        {/* Large editorial number */}
        <div className="final-cta__ornament font-mono" aria-hidden="true">
          log<span className="final-cta__ornament-dot">.</span>001
        </div>

        {/* Copy */}
        <div className="final-cta__copy">
          <h2 className="final-cta__headline">
            Your next trade is data.<br />
            <span className="final-cta__headline-sub">Are you capturing it?</span>
          </h2>

          <p className="final-cta__body">
            Start with your next trade. Log it. Reflect on it. In 30 days you'll
            know your actual edge — not the one you think you have.
          </p>

          <div className="final-cta__actions">
            <Link href="/login" id="cta-primary" className="btn-primary final-cta__btn">
              Start journaling — it's free
              <ArrowRight size={15} />
            </Link>
          </div>

          <p className="final-cta__footnote font-mono">
            No credit card required · Free during beta
          </p>
        </div>

        {/* Right: terminal-style mini log */}
        <div className="final-cta__terminal" aria-hidden="true">
          <div className="final-cta__terminal-bar">
            <span className="final-cta__terminal-dot" style={{ background: '#ff5f57' }} />
            <span className="final-cta__terminal-dot" style={{ background: '#febc2e' }} />
            <span className="final-cta__terminal-dot" style={{ background: '#28c840' }} />
            <span className="final-cta__terminal-title font-mono">traderlabs — trade_001.log</span>
          </div>
          <div className="final-cta__terminal-body font-mono">
            <p><span className="tc-dim">$</span> <span className="tc-cmd">traderlabs new-trade</span></p>
            <p className="tc-dim">→ Symbol: <span className="tc-val">RELIANCE</span></p>
            <p className="tc-dim">→ Exchange: <span className="tc-val">NSE</span></p>
            <p className="tc-dim">→ Direction: <span className="tc-val">Long</span></p>
            <p className="tc-dim">→ Setup: <span className="tc-val">VCP — Weekly breakout</span></p>
            <p className="tc-dim">→ Risk: <span className="tc-val">₹4,800 (1.0R)</span></p>
            <p className="tc-dim">→ Entry thesis: <span className="tc-val">_</span></p>
            <br />
            <p className="tc-accent">✓ Trade logged. Journal open.</p>
            <p className="tc-dim">Time to reflect. Good luck.</p>
            <span className="tc-cursor">▮</span>
          </div>
        </div>
      </div>
    </section>
  );
}
