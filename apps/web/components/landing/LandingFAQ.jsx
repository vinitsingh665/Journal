"use client";
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LANDING_FAQS } from './faqData';
import './LandingFAQ.css';

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState(0); // First item open by default

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="landing-faq section" aria-label="Frequently Asked Questions" id="faq">
      <div className="container landing-faq__container">
        <div className="landing-faq__header">
          <span className="section-label">FAQ</span>
          <h2 className="landing-faq__title">
            Frequently Asked Questions
          </h2>
          <p className="landing-faq__sub">
            Everything you need to know about the journal, risk management, and getting started.
          </p>
        </div>

        <div className="landing-faq__list" role="region" aria-label="FAQ Accordion">
          {LANDING_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className={`landing-faq__item ${isOpen ? 'landing-faq__item--open' : ''}`}
              >
                <button
                  type="button"
                  className="landing-faq__trigger"
                  onClick={() => toggleFAQ(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                >
                  <span className="landing-faq__question-text font-mono">
                    <span className="landing-faq__num">0{idx + 1}.</span> {faq.question}
                  </span>
                  <span className="landing-faq__icon" aria-hidden="true">
                    <ChevronDown size={18} className={`landing-faq__chevron ${isOpen ? 'landing-faq__chevron--rotated' : ''}`} />
                  </span>
                </button>
                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  className="landing-faq__content"
                  style={{ display: isOpen ? 'block' : 'none' }}
                >
                  <p className="landing-faq__answer-text">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
