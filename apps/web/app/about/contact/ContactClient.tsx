"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  MessageCircle, 
  AtSign, 
  BookOpen, 
  CheckCircle2, 
  Send, 
  ArrowRight, 
  RefreshCw, 
  ExternalLink,
  Sparkles,
  AlertTriangle
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "General Question",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim() || !formData.email.trim()) {
      setErrorMsg("Please provide your email address and message.");
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
          type: 'contact',
          subject: formData.category,
          body: formData.message.trim(),
          senderName: formData.name.trim() || 'Anonymous',
          senderEmail: formData.email.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg("Failed to send message. Please try again.");
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
        .contact-container {
          animation: fadeIn 0.25s ease-out;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }

        .contact-header {
          text-align: center;
          margin-bottom: 24px;
          width: 100%;
          max-width: 600px;
          padding: 0 4px;
        }

        .contact-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.28);
          color: #818cf8;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 9999px;
          margin-bottom: 12px;
          letter-spacing: 0.02em;
        }

        .contact-title {
          font-size: clamp(24px, 5.5vw, 34px);
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--text-primary);
          margin: 0 0 8px 0;
          line-height: 1.15;
        }

        .contact-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
          margin: 0 auto;
          max-width: 480px;
        }

        /* Channels Grid */
        .contact-channels-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          width: 100%;
          max-width: 680px;
          margin-bottom: 24px;
          box-sizing: border-box;
        }

        .contact-channel-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-secondary);
          border-radius: 14px;
          padding: 16px 14px;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-decoration: none;
          color: inherit;
          transition: all 0.18s ease;
          position: relative;
          box-sizing: border-box;
        }

        .contact-channel-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .contact-channel-card:active {
          transform: scale(0.98);
        }

        .contact-channel-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .contact-channel-icon-pill {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contact-channel-title {
          font-weight: 700;
          font-size: 14px;
          color: var(--text-primary);
        }

        .contact-channel-sub {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.35;
          word-break: break-word;
        }

        .contact-channel-cta {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 600;
          color: #818cf8;
          margin-top: 2px;
        }

        /* Form Card */
        .contact-form-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-secondary);
          border-radius: 18px;
          padding: 28px;
          width: 100%;
          max-width: 680px;
          box-sizing: border-box;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }

        .contact-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .contact-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .contact-form-row .contact-form-group {
          margin-bottom: 0;
        }

        .contact-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .contact-req {
          color: #f97316;
        }

        .contact-input,
        .contact-select,
        .contact-textarea {
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

        .contact-input:focus,
        .contact-select:focus,
        .contact-textarea:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .contact-input::placeholder,
        .contact-textarea::placeholder {
          color: var(--text-muted);
          opacity: 0.65;
        }

        .contact-textarea {
          resize: vertical;
          line-height: 1.5;
        }

        .contact-submit-btn {
          width: auto;
          min-height: 46px;
          padding: 12px 28px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
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
          box-shadow: 0 3px 12px rgba(99, 102, 241, 0.35);
          transition: transform 0.12s ease, opacity 0.15s ease, box-shadow 0.15s ease;
        }

        .contact-submit-btn:hover:not(:disabled) {
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.5);
        }

        .contact-submit-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .contact-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .contact-actions-wrapper {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
        }

        @media (max-width: 640px) {
          .contact-header {
            margin-bottom: 16px;
          }
          .contact-channels-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 18px;
          }
          .contact-channel-card {
            padding: 12px 10px;
            border-radius: 12px;
          }
          .contact-channel-title {
            font-size: 13px;
          }
          .contact-channel-sub {
            font-size: 11px;
          }
          .contact-form-card {
            padding: 16px 14px;
            border-radius: 14px;
          }
          .contact-form-row {
            grid-template-columns: 1fr;
            gap: 14px;
            margin-bottom: 14px;
          }
          .contact-form-group {
            margin-bottom: 14px;
          }
          .contact-submit-btn {
            width: 100% !important;
          }
          .contact-actions-wrapper {
            flex-direction: column;
            width: 100%;
          }
          .contact-success-actions {
            flex-direction: column;
            width: 100%;
          }
          .contact-success-actions a,
          .contact-success-actions button {
            width: 100% !important;
            justify-content: center;
          }
        }

        @media (max-width: 360px) {
          .contact-channels-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="contact-container">
        {/* Header */}
        <div className="contact-header">
          <div className="contact-badge">
            <Sparkles size={14} />
            <span>Support Hub</span>
          </div>
          <h1 className="contact-title">Contact Support</h1>
          <p className="contact-subtitle">
            Need assistance, have a question, or want to suggest a feature? Reach out directly via our channels or drop a message below.
          </p>
        </div>

        {/* 4 Support Channels */}
        <div className="contact-channels-grid">
          {/* Email Card */}
          <a
            href="mailto:support@traderlabs.in"
            className="contact-channel-card"
          >
            <div className="contact-channel-top">
              <div className="contact-channel-icon-pill" style={{ background: "rgba(249, 115, 22, 0.15)", color: "#f97316" }}>
                <Mail size={18} />
              </div>
              <ExternalLink size={13} color="var(--text-muted)" />
            </div>
            <div>
              <div className="contact-channel-title">Email Us</div>
              <div className="contact-channel-sub">support@traderlabs.in</div>
            </div>
            <div className="contact-channel-cta">
              <span>Send Email</span>
              <ArrowRight size={11} />
            </div>
          </a>

          {/* Live Chat Card */}
          <div
            className="contact-channel-card"
            style={{ cursor: "default" }}
          >
            <div className="contact-channel-top">
              <div className="contact-channel-icon-pill" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                <MessageCircle size={18} />
              </div>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 10,
                fontWeight: 700,
                color: "#10b981",
                background: "rgba(16, 185, 129, 0.12)",
                padding: "2px 6px",
                borderRadius: 9999
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }}></span>
                Online
              </span>
            </div>
            <div>
              <div className="contact-channel-title">Live Chat</div>
              <div className="contact-channel-sub">Mon–Fri, 9AM–5PM IST</div>
            </div>
            <div className="contact-channel-cta" style={{ color: "var(--text-muted)" }}>
              <span>In-App Support</span>
            </div>
          </div>

          {/* Twitter / X Card */}
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-channel-card"
          >
            <div className="contact-channel-top">
              <div className="contact-channel-icon-pill" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
                <AtSign size={18} />
              </div>
              <ExternalLink size={13} color="var(--text-muted)" />
            </div>
            <div>
              <div className="contact-channel-title">Twitter / X</div>
              <div className="contact-channel-sub">@traderlabs</div>
            </div>
            <div className="contact-channel-cta" style={{ color: "#ef4444" }}>
              <span>Direct Message</span>
              <ArrowRight size={11} />
            </div>
          </a>

          {/* Help Center Card */}
          <Link
            href="/about/faq"
            className="contact-channel-card"
          >
            <div className="contact-channel-top">
              <div className="contact-channel-icon-pill" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                <BookOpen size={18} />
              </div>
              <ArrowRight size={13} color="var(--text-muted)" />
            </div>
            <div>
              <div className="contact-channel-title">Help Center</div>
              <div className="contact-channel-sub">FAQs & user guides</div>
            </div>
            <div className="contact-channel-cta">
              <span>View FAQs</span>
              <ArrowRight size={11} />
            </div>
          </Link>
        </div>

        {/* Send a Message Card */}
        <div className="contact-form-card">
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
                Message Sent Successfully!
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 440, lineHeight: 1.5, margin: "0 0 24px 0" }}>
                Thanks for reaching out! Our team has received your query and will reply to your email address shortly.
              </p>

              <div className="contact-success-actions" style={{ display: "flex", gap: 12, width: "100%", maxWidth: 380, justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({ name: "", email: "", category: "General Question", message: "" });
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
                  <span>Send Another Message</span>
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: "var(--text-lg, 18px)", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                  Send a Direct Message
                </h2>
              </div>

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
              <div className="contact-form-row">
                <div className="contact-form-group">
                  <label className="contact-label">Your Name</label>
                  <input
                    type="text"
                    className="contact-input"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="contact-form-group">
                  <label className="contact-label">
                    Email Address <span className="contact-req">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="contact-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="contact-form-group">
                <label className="contact-label">Topic / Category</label>
                <select
                  className="contact-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="General Question">💬 General Question / Inquiry</option>
                  <option value="Technical Support">⚙️ Technical Support & Troubleshooting</option>
                  <option value="Feature Request">💡 Feature Request & Suggestions</option>
                  <option value="Billing & Account">💳 Account, Security & Billing</option>
                  <option value="Broker Sync Issue">📈 DhanHQ / Broker Sync</option>
                </select>
              </div>

              {/* Message */}
              <div className="contact-form-group">
                <label className="contact-label">
                  Message <span className="contact-req">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className="contact-textarea"
                  placeholder="Describe your question or feedback..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {/* Submit Button */}
              <div className="contact-actions-wrapper">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="contact-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Message</span>
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
