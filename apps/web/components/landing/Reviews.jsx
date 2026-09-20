"use client";
import React, { useState } from 'react';
import './Reviews.css';

const reviews = [
  {
    id: 'rev_01',
    text: "Bhai, this journal completely fixed my overtrading. Tracking my R-Multiple showed me I was holding losers way too long.",
    author: "Rahul D.",
    role: "Intraday Trader",
    handle: "@rahul_trades"
  },
  {
    id: 'rev_02',
    text: "Pehle PNL dekh ke darr lagta tha, ab everything is structured. The metrics don't lie. Positive expectancy confirmed!",
    author: "Sneha S.",
    role: "Swing Trader",
    handle: "@snehas_setups"
  },
  {
    id: 'rev_03',
    text: "I was using Google Sheets for 2 years. TraderLabs is 10x faster and actually helps me analyze my edge.",
    author: "Vikram P.",
    role: "FnO Trader",
    handle: "@vikram_fno"
  },
  {
    id: 'rev_04',
    text: "The terminal aesthetic is incredible. Feels like a Bloomberg terminal for retail traders. Mast UI hai.",
    author: "Amit K.",
    role: "Crypto Trader",
    handle: "@amit_crypto"
  },
  {
    id: 'rev_05',
    text: "If you are serious about risk management, you need this. It exposes your emotional leaks instantly.",
    author: "Priya S.",
    role: "Equity Trader",
    handle: "@priya_invests"
  },
  {
    id: 'rev_06',
    text: "Mera win rate 40% tha, but R-multiple check karne ke baad samajh aaya ki I'm still profitable. Confidence level 100% now.",
    author: "Rohan G.",
    role: "Option Buyer",
    handle: "@rohan_options"
  },
  {
    id: 'rev_07',
    text: "Finally a journal that understands what we need. Perfect for tracking Nifty and BankNifty setups accurately.",
    author: "Aditi V.",
    role: "Index Trader",
    handle: "@aditi_trades"
  },
  {
    id: 'rev_08',
    text: "Stop-loss trail karna seekh gaya main. This tool forces you to be disciplined with your risk-reward ratio.",
    author: "Karan M.",
    role: "Scalper",
    handle: "@karan_scalps"
  },
  {
    id: 'rev_09',
    text: "Data is king. TraderLabs gives me the raw, unfiltered truth about my trading behavior without any fluff.",
    author: "Nisha R.",
    role: "Swing Trader",
    handle: "@nisha_rao"
  },
  {
    id: 'rev_10',
    text: "Ekdum solid product. The way it breaks down my performance by setup has completely changed how I trade.",
    author: "Sanjay J.",
    role: "Intraday Equities",
    handle: "@sanjay_j"
  }
];

export default function Reviews() {
  const [showAll, setShowAll] = useState(false);
  const visibleReviews = showAll ? reviews : reviews.slice(0, 6);

  return (
    <section className="reviews section" aria-label="Wall of Love" id="reviews">
      <div className="container">
        <div className="reviews__header">
          <span className="section-label">Wall of Love</span>
          <h2 className="reviews__title">
            Trusted by serious traders.
          </h2>
        </div>

        <div className="reviews__grid">
          {visibleReviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-card__body">
                <div className="review-card__stars" aria-hidden="true">
                  ★★★★★
                </div>
                <p className="review-card__text">
                  "{review.text}"
                </p>
                <div className="review-card__author">
                  <div className="review-card__avatar">
                    {review.author.charAt(0)}
                  </div>
                  <div className="review-card__info">
                    <span className="review-card__name">{review.author}</span>
                    <span className="review-card__role">{review.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!showAll && (
          <div className="reviews__actions">
            <button className="btn-ghost" onClick={() => setShowAll(true)}>
              Show more reviews
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
