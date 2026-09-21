import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "FAQ | TraderLabs",
  description: "Frequently Asked Questions",
};

export default function FAQPage() {
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
    }
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Link href="/about/contact" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", textDecoration: "none", marginBottom: 32, fontSize: 14 }}>
        <ChevronLeft size={16} /> Back to Contact
      </Link>
      
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Frequently Asked Questions</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 48 }}>Find answers to common questions about TraderLabs.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {faqs.map((faq, index) => (
          <div key={index} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-lg)", padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{faq.question}</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
