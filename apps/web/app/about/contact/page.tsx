"use client";

import { Mail, MessageCircle, AtSign, BookOpen, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "General Question",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message || !formData.email) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          type: 'contact',
          subject: formData.category,
          body: formData.message,
          senderName: formData.name || 'Anonymous',
          senderEmail: formData.email
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

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
          <AtSign size={24} color="#ef4444" />
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
      <form 
        onSubmit={handleSubmit}
        style={{ 
        background: "var(--bg-secondary)", 
        border: "1px solid var(--border-secondary)", 
        borderRadius: "var(--radius-lg)", 
        padding: "var(--space-6)", 
        width: "100%", 
        maxWidth: 600
      }}>
        {isSuccess ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
            <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 8 }}>Message Sent!</h2>
            <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
              Thanks for reaching out. We've received your message and will get back to you shortly.
            </p>
            <button 
              type="button"
              onClick={() => {
                setIsSuccess(false);
                setFormData({ name: "", email: "", category: "General Question", message: "" });
              }}
              style={{ marginTop: 24, padding: "8px 16px", background: "transparent", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", cursor: "pointer" }}
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-5)" }}>Send a Message</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>YOUR NAME</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Rahul Sharma" 
                  style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }} 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>EMAIL</label>
                <input 
                  type="email"
                  required
                  className="form-input" 
                  placeholder="you@example.com" 
                  style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }} 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
              <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>CATEGORY</label>
              <select 
                className="form-select" 
                style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }}
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>General Question</option>
                <option>Billing Issue</option>
                <option>Technical Support</option>
                <option>Feature Request</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "var(--space-5)" }}>
              <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>MESSAGE</label>
              <textarea 
                required
                className="form-input form-textarea" 
                placeholder="Describe your issue or question..." 
                style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)", minHeight: 120 }}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary" 
              style={{ 
                background: "#f97316",
                color: "#fff", 
                border: "none",
                padding: "8px 24px",
                fontWeight: 600,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer"
              }}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
