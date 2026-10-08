import React from "react";
import { getCurrentUser } from "@/lib/auth";
import "./landing.css";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Experience from "@/components/landing/Experience";
import Differentiation from "@/components/landing/Differentiation";
import FinalCTA from "@/components/landing/FinalCTA";
import Reviews from "@/components/landing/Reviews";
import Footer from "@/components/landing/Footer";

export default async function LandingPage() {
  const userId = await getCurrentUser();
  const isLoggedIn = !!userId;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TraderLabs",
    "operatingSystem": "Web",
    "applicationCategory": "FinanceApplication",
    "description": "A premium data-dense trading journal for Indian equity, crypto, and swing traders. Track R-Multiples, calculate risk, and eliminate emotional trading.",
    "url": "https://www.traderlabs.in",
    "featureList": [
      "Trade Journaling",
      "Risk Calculator",
      "R-Multiple Tracking",
      "P&L Calendar",
      "CSV Import",
      "Broker Sync",
      "Trade Analytics",
      "Mistake Tracking"
    ],
    "screenshot": "https://www.traderlabs.in/brand-logo.png",
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
        <Problem />
        <Experience />
        <Differentiation />
        <FinalCTA />
      </main>
      <Reviews />
      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
}
