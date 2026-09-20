"use client";
import React, { useEffect, useRef, useState } from 'react';
import './Problem.css';

function useInView(threshold = 0.15) {
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

export default function Problem() {
  const [sectionRef, inView] = useInView(0.1);

  // Fake chaotic data stream
  const noiseLines = [
    "TRADE 1: Bought Reliance at open.",
    "Felt confident but it instantly dropped.",
    "Why did I size up? Panic sold.",
    "Loss: -₹15,000",
    "---",
    "TRADE 2: HDFC broke resistance.",
    "Wanted to make back the Reliance loss. Revenge trading.",
    "Entered with double size. Sweating.",
    "Closed it early for +₹4,500. Couldn't hold.",
    "---",
    "Am I even profitable this month? Spreadsheet is a mess.",
  ];

  return (
    <section
      className="problem section"
      ref={sectionRef}
      aria-label="The Noise vs The Signal"
      id="problem"
    >
      <div className="container">
        <div className="problem__header">
          <span className="section-label">The Problem</span>
          <h2 className="problem__title">
            Trading produces raw noise.<br />
            You need a signal.
          </h2>
          <p className="problem__sub">
            Spreadsheets give you a headache. Scattered notes lose their meaning. 
            TraderLabs transforms your messy manual entries and emotional chaos into a crystal-clear, structured behavioral edge.
          </p>
        </div>

        <div className="problem__split">
          {/* Left: The Noise */}
          <div className={`problem__terminal problem__noise ${inView ? 'problem__terminal--active' : ''}`}>
            <div className="problem__terminal-header">
              <span className="font-mono">trader_brain_dump.txt</span>
              <span className="font-mono" style={{ color: 'var(--color-down)' }}>NOISE</span>
            </div>
            <div className="problem__terminal-body font-mono">
              {noiseLines.map((line, i) => (
                <div 
                  key={i} 
                  className="problem__noise-line"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  {line}
                </div>
              ))}
              <div className="problem__cursor" />
            </div>
          </div>

          {/* Right: The Signal */}
          <div className={`problem__terminal problem__signal ${inView ? 'problem__terminal--active' : ''}`} style={{ transitionDelay: '0.4s' }}>
            <div className="problem__terminal-header">
              <span className="font-mono">traderlabs_metrics.log</span>
              <span className="font-mono" style={{ color: 'var(--color-up)' }}>SIGNAL</span>
            </div>
            <div className="problem__terminal-body font-mono">
              <div className="problem__signal-block" style={{ animationDelay: '1.2s' }}>
                <span className="problem__signal-label">MONTHLY WIN RATE:</span>
                <span className="problem__signal-val">42.5% (Based on 48 trades)</span>
              </div>
              <div className="problem__signal-block" style={{ animationDelay: '1.6s' }}>
                <span className="problem__signal-label">AVERAGE R-MULTIPLE:</span>
                <span className="problem__signal-val" style={{ color: 'var(--color-up)' }}>+1.4R</span>
              </div>
              <div className="problem__signal-block" style={{ animationDelay: '2.0s' }}>
                <span className="problem__signal-label">RISK/REWARD RATIO:</span>
                <span className="problem__signal-val">1 : 2.2</span>
              </div>
              <div className="problem__signal-block" style={{ animationDelay: '2.4s', borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '16px' }}>
                <span className="problem__signal-label">NET PROFITABILITY:</span>
                <span className="problem__signal-val" style={{ color: 'var(--color-up)' }}>POSITIVE EXPECTANCY CONFIRMED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
