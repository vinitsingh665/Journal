"use client";

import { Mail, MessageCircle, Twitter, BookOpen } from "lucide-react";

export default function ContactPage() {
  return (
    <div style={{ animation: "fadeIn 0.3s ease-out", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>Contact Support</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", maxWidth: 500, margin: "0 auto" }}>
          We're here to help. Reach out via any channel below or send us a message.
        </p>
      </div>

      {/* Grid of contact options */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "var(--space-4)", 
        width: "100%", 
        maxWidth: 600,
        marginBottom: "var(--space-6)"
      }}>
        {/* Email Card */}
        <div style={{ 
          background: "var(--bg-secondary)", 
          border: "1px solid var(--border-secondary)", 
          borderRadius: "var(--radius-lg)", 
          padding: "var(--space-5)", 
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-2)"
        }}>
          <Mail size={24} color="#f97316" />
          <div style={{ fontWeight: 600, fontSize: "var(--text-md)" }}>Email</div>
          <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>support@traderlabs.in</div>
        </div>

        {/* Live Chat Card */}
        <div style={{ 
          background: "var(--bg-secondary)", 
          border: "1px solid var(--border-secondary)", 
          borderRadius: "var(--radius-lg)", 
          padding: "var(--space-5)", 
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-2)"
        }}>
          <MessageCircle size={24} className="text-muted" />
          <div style={{ fontWeight: 600, fontSize: "var(--text-md)" }}>Live Chat</div>
          <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>Mon-Fri, 9AM-5PM IST</div>
        </div>

        {/* Twitter Card */}
        <div style={{ 
          background: "var(--bg-secondary)", 
          border: "1px solid var(--border-secondary)", 
          borderRadius: "var(--radius-lg)", 
          padding: "var(--space-5)", 
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-2)"
        }}>
          <Twitter size={24} color="#ef4444" />
          <div style={{ fontWeight: 600, fontSize: "var(--text-md)" }}>Twitter / X</div>
          <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>@traderlabs</div>
        </div>

        {/* Help Center Card */}
        <div style={{ 
          background: "var(--bg-secondary)", 
          border: "1px solid var(--border-secondary)", 
          borderRadius: "var(--radius-lg)", 
          padding: "var(--space-5)", 
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-2)"
        }}>
          <BookOpen size={24} className="text-muted" />
          <div style={{ fontWeight: 600, fontSize: "var(--text-md)" }}>Help Center</div>
          <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>Browse FAQs & Guides →</div>
        </div>
      </div>

      {/* Send a Message Form */}
      <div style={{ 
        background: "var(--bg-secondary)", 
        border: "1px solid var(--border-secondary)", 
        borderRadius: "var(--radius-lg)", 
        padding: "var(--space-6)", 
        width: "100%", 
        maxWidth: 600
      }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-5)" }}>Send a Message</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>YOUR NAME</label>
            <input className="form-input" placeholder="e.g. Rahul Sharma" style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>EMAIL</label>
            <input className="form-input" placeholder="you@example.com" style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
          <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>CATEGORY</label>
          <select className="form-select" style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }}>
            <option>General Question</option>
            <option>Billing Issue</option>
            <option>Technical Support</option>
            <option>Feature Request</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: "var(--space-5)" }}>
          <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>MESSAGE</label>
          <textarea 
            className="form-input form-textarea" 
            placeholder="Describe your issue or question..." 
            style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)", minHeight: 120 }}
          ></textarea>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ 
            background: "#f97316", // Accent orange from screenshot
            color: "#fff", 
            border: "none",
            padding: "8px 24px",
            fontWeight: 600
          }}
          onClick={(e) => e.preventDefault()}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
