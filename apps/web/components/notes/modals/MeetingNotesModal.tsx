"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import NoteModalBase from "./NoteModalBase";

interface ActionItem {
  id: string;
  text: string;
  assignee: string;
  done: boolean;
}

interface AgendaItem {
  id: string;
  text: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MeetingNotesModal({ open, onClose }: Props) {
  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = now.toTimeString().slice(0, 5);

  const [title, setTitle] = useState("Meeting Notes");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([{ id: "1", text: "" }]);
  const [discussion, setDiscussion] = useState("");
  const [actions, setActions] = useState<ActionItem[]>([{ id: "1", text: "", assignee: "", done: false }]);
  const [saving, setSaving] = useState(false);
  const attendeeRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleClose = useCallback(() => {
    setTitle("Meeting Notes");
    setDate(defaultDate);
    setTime(defaultTime);
    setAttendees([]);
    setAttendeeInput("");
    setAgenda([{ id: "1", text: "" }]);
    setDiscussion("");
    setActions([{ id: "1", text: "", assignee: "", done: false }]);
    onClose();
  }, [onClose, defaultDate, defaultTime]);

  const addAttendee = () => {
    const name = attendeeInput.trim();
    if (name && !attendees.includes(name)) {
      setAttendees((prev) => [...prev, name]);
    }
    setAttendeeInput("");
    attendeeRef.current?.focus();
  };

  const handleAttendeeKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addAttendee(); }
    if (e.key === "Backspace" && !attendeeInput && attendees.length) {
      setAttendees((prev) => prev.slice(0, -1));
    }
  };

  const buildContent = () => {
    const dateLabel = new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const nodes: any[] = [
      { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: `👥 ${title}` }] },
      { type: "paragraph", content: [{ type: "text", text: `📅 ${dateLabel} at ${time}` }] },
    ];
    if (attendees.length) {
      nodes.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "👤 Attendees" }] });
      nodes.push({ type: "paragraph", content: [{ type: "text", text: attendees.join(", ") }] });
    }
    const validAgenda = agenda.filter((a) => a.text.trim());
    if (validAgenda.length) {
      nodes.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "📌 Agenda" }] });
      nodes.push({
        type: "orderedList",
        content: validAgenda.map((a) => ({
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: a.text }] }],
        })),
      });
    }
    if (discussion.trim()) {
      nodes.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "🗒️ Discussion" }] });
      nodes.push({ type: "paragraph", content: [{ type: "text", text: discussion.trim() }] });
    }
    const validActions = actions.filter((a) => a.text.trim());
    if (validActions.length) {
      nodes.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "✅ Action Items" }] });
      nodes.push({
        type: "taskList",
        content: validActions.map((a) => ({
          type: "taskItem",
          attrs: { checked: a.done },
          content: [{
            type: "paragraph",
            content: [{ type: "text", text: a.assignee ? `${a.text} — @${a.assignee}` : a.text }],
          }],
        })),
      });
    }
    return { type: "doc", content: nodes };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: buildContent(), color: "#1e1b4b" }),
      });
      if (res.ok) { handleClose(); router.refresh(); }
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoteModalBase open={open} onClose={handleClose} size="xl">
      {/* Header */}
      <div className="nm-header nm-header--meeting">
        <div className="nm-header-icon nm-header-icon--meeting">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div className="nm-header-text">
          <input className="nm-title-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="nm-meeting-datetime">
            <input type="date" className="nm-date-input" value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="time" className="nm-date-input" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <button className="nm-close-btn" onClick={handleClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="nm-body nm-body--two-col">
        {/* Left column */}
        <div className="nm-col">
          {/* Attendees */}
          <div className="nm-section">
            <label className="nm-section-label">👤 Attendees</label>
            <div className="nm-attendee-box">
              {attendees.map((a) => (
                <span key={a} className="nm-attendee-chip">
                  {a}
                  <button onClick={() => setAttendees((prev) => prev.filter((x) => x !== a))}>×</button>
                </span>
              ))}
              <input
                ref={attendeeRef}
                className="nm-attendee-input"
                placeholder={attendees.length ? "Add more…" : "Type name, press Enter…"}
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyDown={handleAttendeeKey}
                onBlur={addAttendee}
              />
            </div>
          </div>

          {/* Agenda */}
          <div className="nm-section">
            <label className="nm-section-label">📌 Agenda</label>
            <div className="nm-agenda-list">
              {agenda.map((item, i) => (
                <div key={item.id} className="nm-agenda-row">
                  <span className="nm-agenda-num">{i + 1}.</span>
                  <input
                    className="nm-agenda-input"
                    placeholder="Agenda item…"
                    value={item.text}
                    onChange={(e) => setAgenda((prev) => prev.map((a) => a.id === item.id ? { ...a, text: e.target.value } : a))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setAgenda((prev) => [...prev, { id: Date.now().toString(), text: "" }]);
                      }
                      if (e.key === "Backspace" && !item.text && agenda.length > 1) {
                        setAgenda((prev) => prev.filter((a) => a.id !== item.id));
                      }
                    }}
                  />
                  {agenda.length > 1 && (
                    <button className="nm-row-delete" onClick={() => setAgenda((prev) => prev.filter((a) => a.id !== item.id))}>×</button>
                  )}
                </div>
              ))}
              <button className="nm-add-row-btn nm-add-row-btn--meeting" onClick={() => setAgenda((prev) => [...prev, { id: Date.now().toString(), text: "" }])}>
                + Add agenda item
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="nm-col">
          {/* Discussion */}
          <div className="nm-section">
            <label className="nm-section-label">🗒️ Discussion Notes</label>
            <textarea
              className="nm-textarea nm-textarea--meeting"
              placeholder="Key points discussed, decisions made…"
              value={discussion}
              rows={5}
              onChange={(e) => setDiscussion(e.target.value)}
            />
          </div>

          {/* Action items */}
          <div className="nm-section">
            <label className="nm-section-label">✅ Action Items</label>
            <div className="nm-action-list">
              {actions.map((action) => (
                <div key={action.id} className="nm-action-row">
                  <button
                    className={`nm-task-check nm-task-check--meeting ${action.done ? "nm-task-check--done" : ""}`}
                    onClick={() => setActions((prev) => prev.map((a) => a.id === action.id ? { ...a, done: !a.done } : a))}
                  >
                    {action.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                  <input
                    className="nm-action-text"
                    placeholder="Action item…"
                    value={action.text}
                    onChange={(e) => setActions((prev) => prev.map((a) => a.id === action.id ? { ...a, text: e.target.value } : a))}
                  />
                  <input
                    className="nm-action-assignee"
                    placeholder="@who"
                    value={action.assignee}
                    onChange={(e) => setActions((prev) => prev.map((a) => a.id === action.id ? { ...a, assignee: e.target.value } : a))}
                  />
                  {actions.length > 1 && (
                    <button className="nm-row-delete" onClick={() => setActions((prev) => prev.filter((a) => a.id !== action.id))}>×</button>
                  )}
                </div>
              ))}
              <button className="nm-add-row-btn nm-add-row-btn--meeting" onClick={() => setActions((prev) => [...prev, { id: Date.now().toString(), text: "", assignee: "", done: false }])}>
                + Add action item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="nm-footer">
        <span className="nm-footer-hint">{attendees.length} attendees · {actions.filter(a => a.text.trim()).length} action items</span>
        <div className="nm-footer-actions">
          <button className="nm-btn nm-btn--ghost" onClick={handleClose}>Cancel</button>
          <button className="nm-btn nm-btn--meeting" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Meeting Notes"}
          </button>
        </div>
      </div>
    </NoteModalBase>
  );
}
