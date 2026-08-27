"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  // Check if setup is needed on mount
  useState(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((data) => {
        setIsSetup(!data.hasUser);
        setCheckingSetup(false);
      })
      .catch(() => {
        setIsSetup(true);
        setCheckingSetup(false);
      });
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isSetup ? "/api/auth/setup" : "/api/auth/login";
      const body = isSetup
        ? { name: name || "Trader", password }
        : { password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: "center" }}>
          <div className="login-logo" style={{ display: 'flex', justifyContent: 'center' }}>
            <Image src="/logo2.png" alt="TraderLabs" width={96} height={96} style={{ objectFit: 'contain' }} priority />
          </div>
          <p style={{ color: "rgba(148, 163, 184, 0.8)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Image src="/logo2.png" alt="TraderLabs" width={96} height={96} style={{ objectFit: 'contain' }} priority />
          <p className="login-logo-tagline">
            {isSetup
              ? "Create your account to get started"
              : "Plan. Execute. Review. Improve."}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} id="login-form">
          {isSetup && (
            <input
              type="text"
              className="login-input"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              id="login-name"
              autoFocus
            />
          )}

          <input
            type="password"
            className="login-input"
            placeholder={isSetup ? "Create a password" : "Enter your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="login-password"
            autoFocus={!isSetup}
            required
            minLength={4}
          />

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
            id="login-submit"
          >
            {loading
              ? "Please wait..."
              : isSetup
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
