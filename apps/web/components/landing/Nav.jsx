"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';
import './Nav.css';

export default function Nav({ isLoggedIn }) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  const navLinks = [
    { label: 'The Problem', href: '#problem' },
    { label: 'Features', href: '#experience' },
    { label: 'System Specs', href: '#differentiation' },
  ];

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`} role="banner">
      <div className="container nav__inner">
        {/* Logo */}
        <Link href="/" className="nav__logo" aria-label="TraderLabs home">
          <span className="nav__logo-mark">
            <img src="/brand-logo.png" alt="" style={{ height: '32px', objectFit: 'contain' }} />
          </span>
          <span className="nav__logo-text">TraderLabs</span>
        </Link>

        {/* Desktop nav */}
        <nav className="nav__links" aria-label="Main navigation">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} className="nav__link" onClick={handleSmoothScroll}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right controls */}
        <div className="nav__controls">
          <button
            id="theme-toggle"
            className="nav__icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-primary nav__cta">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="btn-primary nav__cta">
              Start free
            </Link>
          )}
          <button
            id="menu-toggle"
            className="nav__icon-btn nav__menu-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="nav__mobile" role="dialog" aria-label="Mobile navigation">
          <nav>
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="nav__mobile-link"
                onClick={handleSmoothScroll}
              >
                {link.label}
              </a>
            ))}
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn-primary" onClick={() => setMenuOpen(false)}>
                Start free
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
