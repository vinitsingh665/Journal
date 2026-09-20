"use client";
import React, { useEffect, useRef, useState } from 'react';
import './Differentiation.css';

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

/* System Spec Card */
function SpecCard({ id, title, data, body, delay, visible, color }) {
  return (
    <div
      className={`diff__spec-card ${visible ? 'diff__spec-card--visible' : ''}`}
      style={{ transitionDelay: delay, '--spec-color': color }}
    >
      <div className="diff__spec-header">
        <span className="diff__spec-id font-mono">SYS_MOD // {id}</span>
        <span className="diff__spec-status font-mono">ONLINE</span>
      </div>
      <h3 className="diff__spec-title">{title}</h3>
      <div className="diff__spec-data font-mono">
        <div className="diff__spec-data-line" style={{ background: color, width: data.width }} />
        <span>{data.text}</span>
      </div>
      <p className="diff__spec-body">{body}</p>
    </div>
  );
}

export default function Differentiation() {
  const [sectionRef, inView] = useInView(0.08);

  const specs = [
    {
      id: '01_DATA',
      title: 'Granular Performance Analytics',
      data: { text: 'STATS // R-Multiple tracking active', width: '85%' },
      body: 'Stop guessing if you are profitable. Log your entry, exit, stop-loss, and targets to automatically calculate your exact R-Multiple, Win Rate, and Risk-to-Reward ratio across all setups.',
      color: 'var(--color-up)',
    },
    {
      id: '02_NOTES',
      title: 'Universal Sticky Notes Layer',
      data: { text: 'GLOBAL // Overlay active', width: '60%' },
      body: 'Inspiration hits mid-session. Hit a hotkey and drop floating notes anywhere over your dashboard. Log emotional spikes directly into the Mistake Vault without breaking your workflow.',
      color: 'var(--color-accent)',
    },
    {
      id: '03_SHARE',
      title: 'Cryptographic Snapshot Sharing',
      data: { text: 'SHA-256 // Verified link generated', width: '100%' },
      body: 'Build absolute trust. Generate a secure, public link to your verified equity curve and win rate. Prove your edge to investors or followers without exposing sensitive account balances or open positions.',
      color: 'var(--color-text-secondary)',
    },
    {
      id: '04_PLAN',
      title: 'Dynamic Risk & Position Planner',
      data: { text: 'CALC // Max Risk: 1.5%', width: '40%' },
      body: 'Enter your conviction level and account size. The planner automatically outputs the exact share quantity for your next setup, preventing sizing errors before you click buy.',
      color: 'var(--color-down)',
    },
  ];

  return (
    <section
      className="differentiation section"
      ref={sectionRef}
      aria-label="System Capabilities"
      id="differentiation"
    >
      <div className="container">
        <div className="diff__header">
          <span className="section-label">System Specs</span>
          <h2 className="diff__title">
            Built for traders who treat this seriously.
          </h2>
        </div>

        <div className="diff__grid">
          {specs.map((spec, i) => (
            <SpecCard
              key={spec.id}
              {...spec}
              visible={inView}
              delay={`${i * 120}ms`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
