"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import "../login/login.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Failed to request password reset.");
        return;
      }
      
      setStatus("success");
      setMessage("If an account exists for that email, we have sent a password reset link. Please check your inbox (and spam folder).");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again later.");
    }
  };

  return (
    <div className="login-page-root dark">
      <div className="login-body" style={{ justifyContent: 'center' }}>
        <div className="login-right-col" style={{ flex: 'none', width: '100%', maxWidth: '450px' }}>
          <div className="login-form-panel">
            <div className="form-brand-icon">
              <img src="/brand-logo.png" alt="TraderLabs Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
            </div>
            <h2>Reset Password</h2>
            
            {status === "success" ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "16px", borderRadius: "8px", color: "#10b981", marginBottom: "24px", lineHeight: "1.5" }}>
                  {message}
                </div>
                <Link href="/login" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  Return to Log In
                </Link>
              </div>
            ) : (
              <>
                <p className="subtitle" style={{ marginBottom: "24px" }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <label>Email</label>
                    <div className="input-wrap">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      <input 
                        type="email" 
                        placeholder="you@example.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
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
                    {status === "loading" ? "Sending link..." : "Send Reset Link"}
                  </button>
                </form>

                <div className="switch-text" style={{ marginTop: "24px" }}>
                  Remember your password? <Link href="/login" style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 600, cursor: 'pointer' }}>Log in</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
