"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import "./login.css";

function GoogleButton({ setError, setLoading }: { setError: (s: string) => void, setLoading: (b: boolean) => void }) {
  const router = useRouter();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setLoading(true);
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: tokenResponse.access_token }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Google authentication failed"); return; }
        router.push("/");
        router.refresh();
      } catch { setError("Failed to connect with Google."); }
      finally { setLoading(false); }
    },
    onError: () => setError("Google Login Failed"),
  });

  return (
    <button type="button" className="social-btn" onClick={() => login()}>
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Continue with Google
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((data) => { setIsSetup(!data.hasUser); setCheckingSetup(false); })
      .catch(() => { setIsSetup(true); setCheckingSetup(false); });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isSetup ? "/api/auth/setup" : "/api/auth/login";
      const body = isSetup ? { name: name || "Trader", email, password } : { email, password };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      router.push("/");
      router.refresh();
    } catch { setError("Failed to connect. Please try again."); }
    finally { setLoading(false); }
  };

  const handleGuestLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Guest login failed"); return; }
      router.push("/");
      router.refresh();
    } catch { setError("Failed to connect. Please try again."); }
    finally { setLoading(false); }
  };

  if (checkingSetup) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff' }}><p style={{ color: "#9CA3AF" }}>Loading...</p></div>;
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`login-page-root ${isDark ? "dark" : ""}`}>

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
          <div className="login-brand">
            <img src="/brand-logo.png" alt="TraderLabs Logo" style={{ width: '40px', height: '60px', objectFit: 'contain' }} />
            TraderLabs
          </div>
          <div className="header-btns">
            <button className={`header-btn ${isDark ? 'active' : ''}`} onClick={() => setIsDark(!isDark)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
            <button className="header-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              English
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="login-body">

          {/* Left column */}
          <div className="login-left-col">
            <div className="hero-block">
              <h1>Your trades.<br />Your journal.<br /><span className="accent">Your edge.</span></h1>
              <p>TraderLabs is your personal trading journal. Review, learn and improve with clarity.</p>
            </div>

            <div className="feat-list">
              <div className="feat-row">
                <div className="feat-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                </div>
                <div className="feat-info">
                  <h3>Journal Every Trade</h3>
                  <p>Log setups, notes, and outcomes with ease.</p>
                </div>
              </div>
              <div className="feat-row">
                <div className="feat-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                </div>
                <div className="feat-info">
                  <h3>Analyze & Improve</h3>
                  <p>Powerful analytics to find patterns and grow.</p>
                </div>
              </div>
              <div className="feat-row">
                <div className="feat-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div className="feat-info">
                  <h3>Track Your Journey</h3>
                  <p>Stay consistent and build your trading legacy.</p>
                </div>
              </div>
            </div>

            <div className="quote-card">
              <p className="q-text">The more I review, the better I trade.</p>
              <span className="q-author">– Every successful trader</span>
            </div>
          </div>

          {/* Floating notebook */}
          <div className="notebook-float">
            <img src={isDark ? "/notebook-dark.png" : "/notebook-light.png"} alt="Trading Journal Notebook" />
          </div>

          {/* Right column (form) */}
          <div className="login-right-col">
            <div className="login-form-panel">
              <div className="form-brand-icon">
                <img src="/brand-logo.png" alt="TraderLabs Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              </div>
              <h2>TraderLabs</h2>
              <p className="subtitle">{isSetup ? "Create your account to get started." : "Welcome back! Log in to your journal."}</p>

              <div className="social-group">
                {clientId && <GoogleButton setError={setError} setLoading={setLoading} />}

                <button type="button" className="social-btn" onClick={handleGuestLogin} disabled={loading} style={{ marginTop: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', color: 'var(--text-primary)' }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Continue as Guest
                </button>
              </div>

              <div className="or-divider"><span>or</span></div>

              <form onSubmit={handleSubmit}>
                {isSetup && (
                  <div className="field">
                    <label>Full Name</label>
                    <div className="input-wrap">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                  </div>
                )}

                <div className="field">
                  <label>Email</label>
                  <div className="input-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="field">
                  <label>
                    Password
                    {!isSetup && <a href="#" className="forgot">Forgot password?</a>}
                  </label>
                  <div className="input-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} />
                  </div>
                </div>

                {!isSetup && (
                  <label className="remember-row">
                    <input type="checkbox" defaultChecked /> Remember me
                  </label>
                )}

                {error && <div style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Please wait..." : (isSetup ? "Sign Up" : "Log In")}
                </button>
              </form>

              <div className="switch-text">
                {isSetup
                  ? <>Already have an account? <button onClick={() => setIsSetup(false)}>Login</button></>
                  : <>Don't have an account? <button onClick={() => setIsSetup(true)}>Sign up</button></>
                }
              </div>
            </div>
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
    </GoogleOAuthProvider>
  );
}
