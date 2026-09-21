"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Dhan sync is not working.",
    answer: "The Dhan sync feature is currently still in progress and will be available in a future update. We appreciate your patience."
  },
  {
    question: "Why in risk calculator risk per trade and stop loss is not linked to each other?",
    answer: "Risk per trade (how much capital you're willing to lose, e.g., 1% of your portfolio) and your stop loss (the technical level where your trade idea is invalidated) are independent variables. By keeping them unlinked, the calculator can dynamically figure out the exact position size (number of shares) needed to satisfy both your financial risk tolerance and your technical stop loss level."
  },
  {
    question: "How is position size calculated in the risk calculator?",
    answer: "Position size is calculated using the formula: Position Size = (Capital × Risk %) / |Entry Price - Stop Loss Price|. First, it calculates the total monetary risk you are taking on the trade. Then, it divides that amount by the risk per share (the difference between your entry and stop loss prices) to find out exactly how many shares you should buy."
  },
  {
    question: "How do I log a new trade?",
    answer: "You can easily add a new trade by clicking the 'New Trade' button in the top navigation bar, by navigating to the Trades page from the sidebar, or simply by asking our AI Assistant to log a new trade for you!"
  },
  {
    question: "Can I import trades from my broker?",
    answer: "Yes, you can use the 'Import Trades' feature found in the Tools section to upload CSV files from supported brokers. We are also working on automated sync features like Dhan sync."
  },
  {
    question: "How does the Calendar view help my trading?",
    answer: "The Calendar view provides a visual monthly breakdown of your Profit and Loss (P&L). It helps you easily spot trends, such as which days of the week are most profitable for your specific strategy."
  },
  {
    question: "How do I track my trading mistakes?",
    answer: "TraderLabs has a dedicated 'Mistakes' feature under the Analysis section. When logging a trade, you can tag any errors made. Over time, you can review this section to identify and eliminate costly habits."
  },
  {
    question: "Is my trading data secure and private?",
    answer: "Absolutely. We prioritize your privacy and security. All your financial data, journals, and personal details are encrypted and stored securely on our servers."
  },
  {
    question: "Can I share a specific trade with a mentor?",
    answer: "Yes! You can generate a secure shareable link for any of your trades to get feedback from mentors or friends without giving them access to your entire account."
  },
  {
    question: "How do I change my trading style or profile details?",
    answer: "Head over to the 'Settings' page located under the System section in your sidebar. From there, you can update your avatar, username, trading style, and other preferences."
  },
  {
    question: "What are 'Snapshots'?",
    answer: "Snapshots are a quick way to capture your charts and setups. You can take a screenshot and attach it directly to your trades or notes for future reference."
  },
  {
    question: "Is there a mobile app for TraderLabs?",
    answer: "Currently, TraderLabs is a progressive web application optimized for both desktop and mobile browsers. A native mobile app is on our roadmap for the future."
  },
  {
    question: "I forgot my password. How can I log in?",
    answer: "Simply click on the 'Forgot Password' link on the login page. We'll send an email with instructions to securely reset your password."
  },
  {
    question: "What is the 'My Buddy Companion'?",
    answer: "The Companion is a fun little digital pet that hangs out with you while you use the app. It's there purely for fun and to keep you company while you journal and review your trades!"
  },
  {
    question: "How can I contact support if I have a different issue?",
    answer: "You can reach out to us directly through the Contact page via Email (support@traderlabs.in) or drop us a message on Twitter / X (@traderlabs)."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Frequently Asked Questions</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 48 }}>Find answers to common questions about TraderLabs.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              style={{ 
                background: "var(--bg-secondary)", 
                border: "1px solid var(--border-secondary)", 
                borderRadius: "var(--radius-lg)", 
                overflow: "hidden"
              }}
            >
              <button
                onClick={() => toggleFaq(index)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 24px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  textAlign: "left"
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600 }}>{faq.question}</span>
                <span style={{ color: "var(--text-secondary)", flexShrink: 0, marginLeft: 16 }}>
                  {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                </span>
              </button>
              
              {isOpen && (
                <div style={{ padding: "0 24px 20px 24px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  <div style={{ paddingTop: 12, borderTop: "1px solid var(--border-secondary)" }}>
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
