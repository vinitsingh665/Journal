"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import NoteModalBase from "./NoteModalBase";

const MOODS = [
  { emoji: "😄", label: "Great" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😔", label: "Low" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "😰", label: "Anxious" },
];

const SECTIONS = [
  { key: "market", label: "📈 Market Overview", placeholder: "What was the overall market doing? Trend, sector rotation, major levels…" },
  { key: "plan", label: "📋 Pre-Market Plan", placeholder: "What was your game plan? Watchlist, bias, key levels to watch…" },
  { key: "review", label: "💭 Post-Market Review", placeholder: "How did it go? What happened vs. what you expected…" },
  { key: "lessons", label: "💡 Lessons Learned", placeholder: "What did today teach you? Mistakes, wins, patterns noticed…" },
] as const;

type SectionKey = typeof SECTIONS[number]["key"];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DailyJournalModal({ open, onClose }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [mood, setMood] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<SectionKey, string>>({
    market: "", plan: "", review: "", lessons: "",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleClose = useCallback(() => {
    setDate(today);
    setMood(null);
    setSections({ market: "", plan: "", review: "", lessons: "" });
    onClose();
  }, [onClose, today]);

  const buildContent = () => {
    const dateLabel = new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const nodes: any[] = [
      { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: `📓 Daily Journal — ${dateLabel}` }] },
    ];
    if (mood) {
      nodes.push({ type: "paragraph", content: [{ type: "text", text: `Mood: ${mood}` }] });
    }
    for (const s of SECTIONS) {
      const text = sections[s.key].trim();
      nodes.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: s.label }] });
      nodes.push({ type: "paragraph", content: text ? [{ type: "text", text }] : [{ type: "text", text: "" }] });
    }
    return { type: "doc", content: nodes };
  };

  const handleSave = async () => {
    setSaving(true);
    const dateLabel = new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Daily Journal — ${dateLabel}`,
          content: buildContent(),
          color: "#451a03",
        }),
      });
      if (res.ok) {
        handleClose();
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const totalFilled = Object.values(sections).filter(v => v.trim().length > 0).length;

  return (
    <NoteModalBase open={open} onClose={handleClose} size="lg">
      {/* Header */}
      <div className="nm-header nm-header--journal">
        <div className="nm-header-icon nm-header-icon--journal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            <line x1="2" y1="8" x2="8" y2="8"/><line x1="2" y1="12" x2="6" y2="12"/>
          </svg>
        </div>
        <div className="nm-header-text">
          <span className="nm-header-title">Daily Journal</span>
          <input type="date" className="nm-date-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <button className="nm-close-btn" onClick={handleClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="nm-body">
        {/* Mood */}
        <div className="nm-section">
          <div className="nm-section-label">How are you feeling today?</div>
          <div className="nm-mood-row">
            {MOODS.map((m) => (
              <button
                key={m.emoji}
                className={`nm-mood-btn ${mood === m.emoji ? "nm-mood-btn--active" : ""}`}
                onClick={() => setMood(mood === m.emoji ? null : m.emoji)}
                title={m.label}
              >
                <span className="nm-mood-emoji">{m.emoji}</span>
                <span className="nm-mood-label">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Journal sections */}
        {SECTIONS.map((s) => (
          <div key={s.key} className="nm-section nm-section--journal">
            <label className="nm-section-label">{s.label}</label>
            <textarea
              className="nm-textarea nm-textarea--journal"
              placeholder={s.placeholder}
              value={sections[s.key]}
              rows={3}
              onChange={(e) => setSections((prev) => ({ ...prev, [s.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="nm-footer">
        <span className="nm-footer-hint">{totalFilled}/{SECTIONS.length} sections filled</span>
        <div className="nm-footer-actions">
          <button className="nm-btn nm-btn--ghost" onClick={handleClose}>Cancel</button>
          <button className="nm-btn nm-btn--journal" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Journal"}
          </button>
        </div>
      </div>
    </NoteModalBase>
  );
}
