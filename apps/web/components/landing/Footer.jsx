"use client";
import React from 'react';
import Link from 'next/link';
import './Footer.css';

export default function Footer({ isLoggedIn }) {
  const year = new Date().getFullYear();

  const handleSmoothScroll = (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link href="/" className="footer__logo font-mono" aria-label="TraderLabs home">
            <img src="/brand-logo.png" alt="" style={{ height: '32px', objectFit: 'contain' }} />
            TraderLabs
          </Link>
          <p className="footer__tagline">Plan. Execute. Improve.</p>
        </div>

        <nav className="footer__links" aria-label="Footer navigation">
          <div className="footer__col">
            <span className="footer__col-title font-mono">Product</span>
            <a href="#experience" className="footer__link" onClick={handleSmoothScroll}>Features</a>
            <a href="#differentiation" className="footer__link" onClick={handleSmoothScroll}>Why TraderLabs</a>
            {isLoggedIn ? (
              <Link href="/dashboard" className="footer__link">Dashboard</Link>
            ) : (
              <Link href="/login" className="footer__link">Get Started</Link>
            )}
            <Link href="/about/changelog" className="footer__link">Changelog</Link>
          </div>
          <div className="footer__col">
            <span className="footer__col-title font-mono">Company</span>
            <Link href="/about/contact" className="footer__link">Contact</Link>
            <Link href="/about/privacy" className="footer__link">Privacy</Link>
            <Link href="/about/terms" className="footer__link">Terms</Link>
          </div>
        </nav>
      </div>

      <div className="container footer__bottom">
        <span className="footer__copyright font-mono">
          © {year} TraderLabs · All rights reserved.
        </span>
        <span className="footer__disclaimer font-mono">
          Not financial advice. Trade responsibly.
        </span>
      </div>
    </footer>
  );
}
