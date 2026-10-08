"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

export default function FAQClient({ faqs }: { faqs: FAQ[] }) {
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
