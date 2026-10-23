import React from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import "./landing.css";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import BrokersStrip from "@/components/landing/BrokersStrip";
import Problem from "@/components/landing/Problem";
import SpreadsheetComparison from "@/components/landing/SpreadsheetComparison";
import Experience from "@/components/landing/Experience";
import Differentiation from "@/components/landing/Differentiation";
import FinalCTA from "@/components/landing/FinalCTA";
import Reviews from "@/components/landing/Reviews";
import LandingFAQ from "@/components/landing/LandingFAQ";
import { LANDING_FAQS } from "@/components/landing/faqData";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "TraderLabs — Best Trading Journal for Indian Traders (NSE & F&O)",
  description:
    "Free trading journal for Indian equity, Nifty/BankNifty F&O & crypto traders. Track trades, automate R-multiples, calculate risk, and eliminate emotional overtrading.",
  keywords: [
    "trading journal india",
    "best trading journal for indian traders",
    "fno trading journal",
    "nifty options trading journal",
    "trade tracker india",
    "zerodha trading journal",
    "dhan trade tracker",
    "r multiple calculator trading",
    "stock market trade journal",
    "crypto trading journal india",
    "overtrading solution",
    "trading psychology tool",
    "TraderLabs"
  ],
  alternates: {
    canonical: "https://www.traderlabs.in",
  },
  openGraph: {
    title: "TraderLabs — Best Trading Journal for Indian Traders (NSE & F&O)",
    description:
      "Track trades, automate R-multiples, calculate risk, and eliminate emotional overtrading with India's best trading journal. Built for NSE, BSE, F&O & Crypto.",
    url: "https://www.traderlabs.in",
    siteName: "TraderLabs",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TraderLabs — Premium Trading Journal for Indian Traders",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TraderLabs — Best Trading Journal for Indian Traders (NSE & F&O)",
    description:
      "Track trades, automate R-multiples, and eliminate emotional overtrading. Free trading journal for Indian equity, F&O & crypto.",
    creator: "@TraderLabs",
    images: ["/og-image.png"],
  },
};

export default async function LandingPage() {
  const userId = await getCurrentUser();
  const isLoggedIn = !!userId;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.traderlabs.in/#website",
        "url": "https://www.traderlabs.in",
        "name": "TraderLabs",
        "description": "Best Trading Journal for Indian Traders (NSE, F&O, Crypto)",
        "inLanguage": "en-IN"
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://www.traderlabs.in/#software",
        "name": "TraderLabs",
        "operatingSystem": "Web",
        "applicationCategory": "FinanceApplication",
        "description": "A premium data-dense trading journal for Indian equity, crypto, and swing traders. Track R-Multiples, calculate risk, and eliminate emotional trading.",
        "url": "https://www.traderlabs.in",
        "featureList": [
          "Trade Journaling",
          "Risk Calculator",
          "R-Multiple Tracking",
          "P&L Calendar Heatmap",
          "CSV Import for Indian Brokers",
          "Broker Sync",
          "Trade Analytics",
          "Mistake Vault Tracking"
        ],
        "screenshot": "https://www.traderlabs.in/og-image.png",
        "softwareVersion": "2.0",
        "releaseNotes": "https://www.traderlabs.in/about/changelog",
        "inLanguage": "en-IN",
        "audience": {
          "@type": "Audience",
          "audienceType": "Indian Stock Market Traders"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "84"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.traderlabs.in/#faq",
        "mainEntity": LANDING_FAQS.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  return (
    <div className="app">
      {/* Advanced SEO Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav isLoggedIn={isLoggedIn} />
      <main>
        <Hero isLoggedIn={isLoggedIn} />
        <BrokersStrip />
        <Problem />
        <SpreadsheetComparison />
        <Experience />
        <Differentiation />
        <Reviews />
        <LandingFAQ />
        <FinalCTA />
      </main>
      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
}
