"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.email || !formData.stepsToReproduce) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          type: 'bug',
          subject: formData.title,
          body: formData.stepsToReproduce,
          senderName: formData.name || 'Anonymous',
          senderEmail: formData.email,
          severity: formData.severity,
          affectedPage: formData.affectedPage,
          stepsToReproduce: formData.stepsToReproduce,
          expectedBehavior: formData.expectedBehavior,
          actualBehavior: formData.actualBehavior
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
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>Report a Bug 🐛</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", maxWidth: 500, margin: "0 auto" }}>
          Found something broken? Help us fix it by providing details below.
        </p>
      </div>

      <form 
        onSubmit={handleSubmit}
        style={{ 
        background: "var(--bg-secondary)", 
        border: "1px solid var(--border-secondary)", 
        borderRadius: "var(--radius-lg)", 
        padding: "var(--space-6)", 
        width: "100%", 
        maxWidth: 700
      }}>
        {isSuccess ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
            <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 8 }}>Bug Report Submitted!</h2>
            <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
              Thank you for helping us improve. Our engineering team has been notified and will look into it.
            </p>
            <button 
              type="button"
              onClick={() => {
                setIsSuccess(false);
                setFormData({
                  name: "", email: "", title: "", severity: "Low — Minor visual issue", 
                  affectedPage: "Select page...", stepsToReproduce: "", expectedBehavior: "", actualBehavior: ""
                });
              }}
              style={{ marginTop: 24, padding: "8px 16px", background: "transparent", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", cursor: "pointer" }}
            >
              Report Another Bug
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>YOUR NAME (OPTIONAL)</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Rahul Sharma" 
                  style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }} 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>EMAIL (REQUIRED FOR UPDATES)</label>
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
              <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>BUG TITLE</label>
              <input 
                required
                className="form-input" 
                placeholder="e.g. Chart not loading on Markets page" 
                style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }} 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>SEVERITY</label>
                <select 
                  className="form-select" 
                  style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }}
                  value={formData.severity}
                  onChange={e => setFormData({...formData, severity: e.target.value})}
                >
                  <option>Low — Minor visual issue</option>
                  <option>Medium — Feature partially broken</option>
                  <option>High — Feature completely broken</option>
                  <option>Critical — App crashing / Data loss</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>AFFECTED PAGE</label>
                <select 
                  className="form-select" 
                  style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }}
                  value={formData.affectedPage}
                  onChange={e => setFormData({...formData, affectedPage: e.target.value})}
                >
                  <option>Select page...</option>
                  <option>Dashboard</option>
                  <option>Journal</option>
                  <option>Analytics</option>
                  <option>Settings</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
              <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>STEPS TO REPRODUCE</label>
              <textarea 
                required
                className="form-input form-textarea" 
                placeholder="1. Go to Markets page 2. Click on RELIANCE 3. Scroll down to chart section 4. Chart shows blank" 
                style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)", minHeight: 140 }}
                value={formData.stepsToReproduce}
                onChange={e => setFormData({...formData, stepsToReproduce: e.target.value})}
              ></textarea>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>EXPECTED BEHAVIOR</label>
                <textarea 
                  className="form-input form-textarea" 
                  placeholder="What should happen?" 
                  style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)", minHeight: 80 }}
                  value={formData.expectedBehavior}
                  onChange={e => setFormData({...formData, expectedBehavior: e.target.value})}
                ></textarea>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>ACTUAL BEHAVIOR</label>
                <textarea 
                  className="form-input form-textarea" 
                  placeholder="What actually happened?" 
                  style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)", minHeight: 80 }}
                  value={formData.actualBehavior}
                  onChange={e => setFormData({...formData, actualBehavior: e.target.value})}
                ></textarea>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary" 
              style={{ 
                background: "#f97316", // Accent orange
                color: "#fff", 
                border: "none",
                padding: "10px 24px",
                fontWeight: 600,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer"
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Bug Report"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
