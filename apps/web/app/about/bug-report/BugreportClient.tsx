"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Bug, Send, AlertTriangle, ArrowRight, Sparkles, RefreshCw } from "lucide-react";

export default function BugReportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    severity: "Low — Minor visual issue",
    affectedPage: "Select page...",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.email.trim() || !formData.stepsToReproduce.trim()) {
      setErrorMsg("Please fill in the required fields: Email, Bug Title, and Steps to Reproduce.");
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          type: 'bug',
          subject: formData.title.trim(),
          body: formData.stepsToReproduce.trim(),
          senderName: formData.name.trim() || 'Anonymous',
          senderEmail: formData.email.trim(),
          severity: formData.severity,
          affectedPage: formData.affectedPage === "Select page..." ? "General / Other" : formData.affectedPage,
          stepsToReproduce: formData.stepsToReproduce.trim(),
          expectedBehavior: formData.expectedBehavior.trim(),
          actualBehavior: formData.actualBehavior.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg("Failed to submit report. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .bug-container {
          animation: fadeIn 0.25s ease-out;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }

        .bug-header {
          text-align: center;
          margin-bottom: 24px;
          width: 100%;
          max-width: 600px;
          padding: 0 4px;
        }

        .bug-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(249, 115, 22, 0.12);
          border: 1px solid rgba(249, 115, 22, 0.28);
          color: #f97316;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 9999px;
          margin-bottom: 12px;
          letter-spacing: 0.02em;
        }

        .bug-title {
          font-size: clamp(24px, 5.5vw, 34px);
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--text-primary);
          margin: 0 0 8px 0;
          line-height: 1.15;
        }

        .bug-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
          margin: 0 auto;
          max-width: 480px;
        }

        .bug-tip-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid var(--border-secondary);
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 20px;
          width: 100%;
          max-width: 700px;
          box-sizing: border-box;
          font-size: 12.5px;
          color: var(--text-muted);
          line-height: 1.45;
        }

        .bug-form-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-secondary);
          border-radius: 18px;
          padding: 28px;
          width: 100%;
          max-width: 700px;
          box-sizing: border-box;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }

        .bug-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .bug-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .bug-form-row .bug-form-group {
          margin-bottom: 0;
        }

        .bug-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .bug-req {
          color: #f97316;
        }

        .bug-input,
        .bug-select,
        .bug-textarea {
          width: 100%;
          box-sizing: border-box;
          background: var(--bg-primary);
          border: 1px solid var(--border-secondary);
          color: var(--text-primary);
          font-size: 15px; /* >=15px prevents iOS Safari auto-zoom */
          padding: 11px 14px;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          font-family: inherit;
        }

        .bug-input:focus,
        .bug-select:focus,
        .bug-textarea:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.18);
        }

        .bug-input::placeholder,
        .bug-textarea::placeholder {
          color: var(--text-muted);
          opacity: 0.65;
        }

        .bug-textarea {
          resize: vertical;
          line-height: 1.5;
        }

        .bug-submit-btn {
          width: auto;
          min-height: 46px;
          padding: 12px 28px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 3px 12px rgba(249, 115, 22, 0.35);
          transition: transform 0.12s ease, opacity 0.15s ease, box-shadow 0.15s ease;
        }

        .bug-submit-btn:hover:not(:disabled) {
          box-shadow: 0 4px 16px rgba(249, 115, 22, 0.45);
        }

        .bug-submit-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .bug-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .bug-actions-wrapper {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
        }

        @media (max-width: 640px) {
          .bug-header {
            margin-bottom: 16px;
          }
          .bug-form-card {
            padding: 16px 14px;
            border-radius: 14px;
          }
          .bug-form-row {
            grid-template-columns: 1fr;
            gap: 14px;
            margin-bottom: 14px;
          }
          .bug-form-group {
            margin-bottom: 14px;
          }
          .bug-submit-btn {
            width: 100% !important;
          }
          .bug-actions-wrapper {
            flex-direction: column;
            width: 100%;
          }
          .bug-success-actions {
            flex-direction: column;
            width: 100%;
          }
          .bug-success-actions a,
          .bug-success-actions button {
            width: 100% !important;
            justify-content: center;
          }
        }
      `}</style>

      <div className="bug-container">
        {/* Header */}
        <div className="bug-header">
          <div className="bug-badge">
            <Bug size={14} />
            <span>Issue Tracker</span>
          </div>
          <h1 className="bug-title">Report a Bug 🐛</h1>
          <p className="bug-subtitle">
            Encountered something broken or incorrect? Share the details below so our engineering team can fix it quickly.
          </p>
        </div>

        {/* Pro Tip Callout */}
        <div className="bug-tip-banner">
          <Sparkles size={16} color="#f97316" style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            <strong>Pro Tip:</strong> Mention the affected page, device, or browser (e.g. Chrome on iPhone) and specific steps to help us diagnose faster.
          </span>
        </div>

        {/* Form or Success Box */}
        <div className="bug-form-card">
          {isSuccess ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 12px", textAlign: "center" }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                boxShadow: "0 0 24px rgba(16, 185, 129, 0.2)"
              }}>
                <CheckCircle2 size={36} color="#10b981" />
              </div>
              <h2 style={{ fontSize: "var(--text-xl, 20px)", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-primary)" }}>
                Bug Report Submitted!
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 440, lineHeight: 1.5, margin: "0 0 24px 0" }}>
                Thank you for helping us improve TraderLabs. Our team has received your ticket and will investigate.
              </p>

              <div className="bug-success-actions" style={{ display: "flex", gap: 12, width: "100%", maxWidth: 380, justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      name: "",
                      email: "",
                      title: "",
                      severity: "Low — Minor visual issue",
                      affectedPage: "Select page...",
                      stepsToReproduce: "",
                      expectedBehavior: "",
                      actualBehavior: ""
                    });
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 20px",
                    background: "transparent",
                    border: "1px solid var(--border-secondary)",
                    borderRadius: 10,
                    color: "var(--text-primary)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <RefreshCw size={15} />
                  <span>Report Another Bug</span>
                </button>

                <Link
                  href="/dashboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 20px",
                    background: "var(--text-primary)",
                    color: "var(--bg-primary)",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none"
                  }}
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 16
                }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Name & Email Row */}
              <div className="bug-form-row">
                <div className="bug-form-group">
                  <label className="bug-label">Your Name (Optional)</label>
                  <input
                    type="text"
                    className="bug-input"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="bug-form-group">
                  <label className="bug-label">
                    Email Address <span className="bug-req">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="bug-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Bug Title */}
              <div className="bug-form-group">
                <label className="bug-label">
                  Bug Title / Summary <span className="bug-req">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="bug-input"
                  placeholder="e.g. Chart not rendering on mobile Safari"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Severity & Affected Page Row */}
              <div className="bug-form-row">
                <div className="bug-form-group">
                  <label className="bug-label">Severity Level</label>
                  <select
                    className="bug-select"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  >
                    <option value="Low — Minor visual issue">🟢 Low — Minor visual issue</option>
                    <option value="Medium — Feature partially broken">🟡 Medium — Feature partially broken</option>
                    <option value="High — Key feature broken">🟠 High — Key feature broken</option>
                    <option value="Critical — App crash or trade data loss">🔴 Critical — App crash / Trade data loss</option>
                  </select>
                </div>
                <div className="bug-form-group">
                  <label className="bug-label">Affected Section / Page</label>
                  <select
                    className="bug-select"
                    value={formData.affectedPage}
                    onChange={(e) => setFormData({ ...formData, affectedPage: e.target.value })}
                  >
                    <option value="Select page...">Select page...</option>
                    <option value="Dashboard">Dashboard</option>
                    <option value="Trades & Executions">Trades & Executions</option>
                    <option value="Positions & Live P&L">Positions & Live P&L</option>
                    <option value="Trading Journal">Trading Journal</option>
                    <option value="Calendar">Calendar</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Mistakes & Psychology">Mistakes & Psychology</option>
                    <option value="Risk Calculator">Risk Calculator</option>
                    <option value="Notes & Trading Rules">Notes & Trading Rules</option>
                    <option value="Settings & Account">Settings & Account</option>
                    <option value="Broker / DhanHQ Sync">Broker / DhanHQ Sync</option>
                    <option value="Authentication & Login">Authentication & Login</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Steps to Reproduce */}
              <div className="bug-form-group">
                <label className="bug-label">
                  Steps to Reproduce <span className="bug-req">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className="bug-textarea"
                  placeholder="1. Open Trades page&#10;2. Click on 'New Trade'&#10;3. Enter symbol NIFTY&#10;4. Observe error message"
                  value={formData.stepsToReproduce}
                  onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                />
              </div>

              {/* Expected vs Actual Row */}
              <div className="bug-form-row">
                <div className="bug-form-group">
                  <label className="bug-label">Expected Behavior</label>
                  <textarea
                    rows={3}
                    className="bug-textarea"
                    placeholder="What should have happened?"
                    value={formData.expectedBehavior}
                    onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                  />
                </div>
                <div className="bug-form-group">
                  <label className="bug-label">Actual Behavior</label>
                  <textarea
                    rows={3}
                    className="bug-textarea"
                    placeholder="What actually occurred?"
                    value={formData.actualBehavior}
                    onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="bug-actions-wrapper">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bug-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Submitting Report...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Bug Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
