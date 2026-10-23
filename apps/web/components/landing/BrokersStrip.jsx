"use client";
import React from 'react';
import './BrokersStrip.css';

const BROKERS = [
  { name: 'Zerodha Kite', tag: 'CSV Import' },
  { name: 'Dhan', tag: 'Direct Sync / CSV' },
  { name: 'Groww', tag: 'CSV Import' },
  { name: 'Angel One', tag: 'CSV Import' },
  { name: 'Upstox', tag: 'CSV Import' },
  { name: 'Fyers', tag: 'CSV Import' },
  { name: 'TradingView', tag: 'Chart Webhooks' },
  { name: 'Binance & Crypto', tag: 'CSV / Manual' },
];

export default function BrokersStrip() {
  return (
    <section className="brokers-strip" aria-label="Supported Brokers & Platforms">
      <div className="container brokers-strip__container">
        <p className="brokers-strip__label font-mono">
          SEAMLESS TRADE IMPORT &amp; SYNC FOR INDIA'S TOP BROKERS &amp; PLATFORMS
        </p>
        <div className="brokers-strip__list">
          {BROKERS.map((broker) => (
            <div key={broker.name} className="broker-pill">
              <span className="broker-pill__dot" aria-hidden="true" />
              <span className="broker-pill__name">{broker.name}</span>
              <span className="broker-pill__tag font-mono">{broker.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
