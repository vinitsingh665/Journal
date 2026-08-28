"use client";

import { useState, FormEvent, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import "../login/login.css";

function ResetPasswordForm({ isDark, setIsDark }: { isDark: boolean, setIsDark: (val: boolean) => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const content = (() => {
    if (!token) {
      return (
        <div className="login-form-panel" style={{ textAlign: 'center' }}>
          <h2>Invalid Link</h2>
          <p className="subtitle" style={{ color: '#EF4444' }}>No reset token found in the URL. This link may be broken or expired.</p>
          <div style={{ marginTop: '24px' }}>
            <Link href="/forgot-password" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Request New Link
            </Link>
          </div>
        </div>
      );
    }

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      
      if (password !== confirmPassword) {
        setStatus("error");
        setMessage("Passwords do not match.");
        return;
      }

      if (password.length < 4) {
        setStatus("error");
        setMessage("Password must be at least 4 characters.");
        return;
      }

      setStatus("loading");
      setMessage("");

      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Failed to reset password.");
          return;
        }
        
        setStatus("success");
        setMessage("Your password has been successfully reset! You can now log in with your new password.");
      } catch {
        setStatus("error");
        setMessage("Network error. Please try again later.");
      }
    };

    return (
      <div className="login-form-panel">
        <div className="form-brand-icon">
          <img src="/brand-logo.png" alt="TraderLabs Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
        </div>
        <h2>Choose New Password</h2>
        
        {status === "success" ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "16px", borderRadius: "8px", color: "#10b981", marginBottom: "24px", lineHeight: "1.5" }}>
              {message}
            </div>
            <Link href="/login" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Go to Log In
            </Link>
          </div>
        ) : (
          <>
            <p className="subtitle" style={{ marginBottom: "24px" }}>
              Please enter your new password below.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>New Password</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input 
                    type="password" 
                    placeholder="Enter new password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    minLength={4}
                    disabled={status === "loading"}
                  />
                </div>
              </div>

              <div className="field">
                <label>Confirm Password</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input 
                    type="password" 
                    placeholder="Confirm new password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    minLength={4}
                    disabled={status === "loading"}
                  />
                </div>
              </div>

              {status === "error" && (
                <div style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                  {message}
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={status === "loading"}>
                {status === "loading" ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    );
  })();

  return (
    <div suppressHydrationWarning className={`login-page-root ${isDark ? "dark" : ""}`} data-theme={isDark ? "dark" : "light"}>
      {/* Advanced Background Chart */}
      <div className="advanced-chart">
        <div className="chart-grid"></div>

        <svg className="chart-curves" viewBox="0 0 800 450" preserveAspectRatio="none">
          <path d="M -50 400 Q 200 350 350 250 T 850 150" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
          <path d="M 0 450 Q 300 250 450 300 T 850 50" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15" />
        </svg>

        {/* Sequence of candles mimicking a real trading chart */}
        <div className="adv-candle" style={{ left: '10%', bottom: '25%', height: '40px', '--wick-top': '15px', '--wick-bottom': '25px' } as React.CSSProperties}></div>
        <div className="adv-candle" style={{ left: '17%', bottom: '30%', height: '70px', '--wick-top': '30px', '--wick-bottom': '10px' } as React.CSSProperties}></div>
        <div className="adv-candle down" style={{ left: '24%', bottom: '38%', height: '30px', '--wick-top': '10px', '--wick-bottom': '15px' } as React.CSSProperties}></div>
        <div className="adv-candle" style={{ left: '31%', bottom: '33%', height: '55px', '--wick-top': '20px', '--wick-bottom': '20px' } as React.CSSProperties}></div>
        <div className="adv-candle" style={{ left: '38%', bottom: '40%', height: '85px', '--wick-top': '15px', '--wick-bottom': '10px' } as React.CSSProperties}></div>
        <div className="adv-candle down" style={{ left: '45%', bottom: '50%', height: '35px', '--wick-top': '10px', '--wick-bottom': '40px' } as React.CSSProperties}></div>
        <div className="adv-candle down" style={{ left: '52%', bottom: '45%', height: '45px', '--wick-top': '25px', '--wick-bottom': '15px' } as React.CSSProperties}></div>
        <div className="adv-candle" style={{ left: '59%', bottom: '42%', height: '90px', '--wick-top': '20px', '--wick-bottom': '10px' } as React.CSSProperties}></div>
        <div className="adv-candle" style={{ left: '66%', bottom: '58%', height: '110px', '--wick-top': '35px', '--wick-bottom': '15px' } as React.CSSProperties}></div>
        <div className="adv-candle down" style={{ left: '73%', bottom: '72%', height: '40px', '--wick-top': '15px', '--wick-bottom': '25px' } as React.CSSProperties}></div>
        <div className="adv-candle" style={{ left: '80%', bottom: '68%', height: '75px', '--wick-top': '20px', '--wick-bottom': '10px' } as React.CSSProperties}></div>
        <div className="adv-candle" style={{ left: '87%', bottom: '80%', height: '45px', '--wick-top': '10px', '--wick-bottom': '15px' } as React.CSSProperties}></div>
        <div className="adv-candle" style={{ left: '94%', bottom: '85%', height: '95px', '--wick-top': '25px', '--wick-bottom': '15px' } as React.CSSProperties}></div>
      </div>

      {/* Header */}
      <header className="login-header-bar">
        <Link href="/" className="login-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src="/brand-logo.png" alt="TraderLabs Logo" style={{ width: '40px', height: '60px', objectFit: 'contain' }} />
          TraderLabs
        </Link>
        <div className="header-btns">
          <button type="button" className={`header-btn ${isDark ? 'active' : ''}`} onClick={() => {
            const newTheme = !isDark;
            setIsDark(newTheme);
            localStorage.setItem("auth-theme", newTheme ? "dark" : "light");
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="login-body">
        {/* Left column */}
        <div className="login-left-col">
          <div className="hero-block">
            <h1>Create a new<br /><span className="accent">password.</span></h1>
            <p>Make it strong. Keep it safe. Get back to trading.</p>
          </div>

          <div className="feat-list">
            <div className="feat-row">
              <div className="feat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <div className="feat-info">
                <h3>Strong Encryption</h3>
                <p>Your password is securely hashed using bcrypt.</p>
              </div>
            </div>
          </div>

          <div className="quote-card">
            <p className="q-text">"Security is paramount in trading. We keep your data safe."</p>
            <span className="q-author">– TraderLabs Security</span>
          </div>
        </div>

        {/* Floating notebook */}
        <div className="notebook-float">
          <img src={isDark ? "/notebook-dark.png" : "/notebook-light.png"} alt="Trading Journal Notebook" />
        </div>

        {/* Right column (form) */}
        <div className="login-right-col">
          {content}
        </div>
      </div>

      {/* Footer */}
      <footer className="login-footer-bar">
        <span>© 2026 TraderLabs. All rights reserved.</span>
        <div className="footer-nav">
          <Link href="/about/privacy">Privacy Policy</Link>
          <Link href="/about/terms">Terms of Service</Link>
          <Link href="/about/contact">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth-theme") === "dark";
    }
    return false;
  });
  
  }, []);

  return (
    <Suspense fallback={
      <div data-theme={isDark ? "dark" : "light"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    }>
      <ResetPasswordForm isDark={isDark} setIsDark={setIsDark} />
    </Suspense>
  );
}
