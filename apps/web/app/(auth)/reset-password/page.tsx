"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import "../login/login.css";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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
}

export default function ResetPasswordPage() {
  return (
    <div className="login-page-root dark">
      <div className="login-body" style={{ justifyContent: 'center' }}>
        <div className="login-right-col" style={{ flex: 'none', width: '100%', maxWidth: '450px' }}>
          <Suspense fallback={<div style={{ textAlign: 'center', color: '#a1a1aa' }}>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
