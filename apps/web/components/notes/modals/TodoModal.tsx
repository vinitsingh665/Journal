"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import NoteModalBase from "./NoteModalBase";

type Priority = "high" | "medium" | "low";

interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  high: { label: "High", color: "#ef4444" },
  medium: { label: "Medium", color: "#f59e0b" },
  low: { label: "Low", color: "#22c55e" },
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TodoModal({ open, onClose }: Props) {
  const [title, setTitle] = useState("To-do List");
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "", done: false, priority: "medium" },
  ]);
  const [inputText, setInputText] = useState("");
  const [inputPriority, setInputPriority] = useState<Priority>("medium");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleClose = useCallback(() => {
    setTitle("To-do List");
    setTasks([{ id: "1", text: "", done: false, priority: "medium" }]);
    setInputText("");
    onClose();
  }, [onClose]);

  const addTask = () => {
    if (!inputText.trim()) return;
    setTasks((prev) => [...prev, { id: Date.now().toString(), text: inputText.trim(), done: false, priority: inputPriority }]);
    setInputText("");
    inputRef.current?.focus();
  };

  const handleInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addTask();
  };

  const toggleTask = (id: string) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const updateText = (id: string, text: string) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, text } : t));

  const buildContent = () => {
    const validTasks = tasks.filter((t) => t.text.trim());
    return {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: `✅ ${title}` }] },
        {
          type: "taskList",
          content: validTasks.map((t) => ({
            type: "taskItem",
            attrs: { checked: t.done },
            content: [{
              type: "paragraph",
              content: [{ type: "text", text: `${t.text}${t.priority !== "medium" ? ` [${t.priority.toUpperCase()}]` : ""}` }],
            }],
          })),
        },
      ],
    };
  };

  const handleSave = async () => {
    const validTasks = tasks.filter((t) => t.text.trim());
    if (!validTasks.length) return;
    setSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: buildContent(), color: "#052e16" }),
      });
      if (res.ok) { handleClose(); router.refresh(); }
    } finally {
      setSaving(false);
    }
  };

  const done = tasks.filter((t) => t.done && t.text.trim()).length;
  const total = tasks.filter((t) => t.text.trim()).length;

  return (
    <NoteModalBase open={open} onClose={handleClose} size="md">
      {/* Header */}
      <div className="nm-header nm-header--todo">
        <div className="nm-header-icon nm-header-icon--todo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <input className="nm-title-input" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="nm-close-btn" onClick={handleClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="nm-body">
        {/* Add task input */}
        <div className="nm-todo-add-row">
          <select
            className="nm-priority-select"
            value={inputPriority}
            onChange={(e) => setInputPriority(e.target.value as Priority)}
            style={{ borderColor: PRIORITY_CONFIG[inputPriority].color }}
          >
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <input
            ref={inputRef}
            className="nm-todo-input"
            placeholder="Add a task and press Enter…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleInputKey}
          />
          <button className="nm-todo-add-btn" onClick={addTask} disabled={!inputText.trim()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="nm-progress-row">
            <div className="nm-progress-bar">
              <div className="nm-progress-fill" style={{ width: `${(done / total) * 100}%` }} />
            </div>
            <span className="nm-progress-text">{done}/{total} done</span>
          </div>
        )}

        {/* Task list */}
        <div className="nm-task-list">
          {tasks.map((task) => (
            <div key={task.id} className={`nm-task-row ${task.done ? "nm-task-row--done" : ""}`}>
              <button
                className={`nm-task-check ${task.done ? "nm-task-check--done" : ""}`}
                onClick={() => toggleTask(task.id)}
              >
                {task.done && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <div
                className="nm-task-priority-dot"
                style={{ background: PRIORITY_CONFIG[task.priority].color }}
                title={PRIORITY_CONFIG[task.priority].label}
              />
              <input
                className="nm-task-text-input"
                value={task.text}
                placeholder="Task description…"
                onChange={(e) => updateText(task.id, e.target.value)}
              />
              <button className="nm-task-delete" onClick={() => deleteTask(task.id)} title="Remove">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="nm-footer">
        <span className="nm-footer-hint">{total} task{total !== 1 ? "s" : ""}</span>
        <div className="nm-footer-actions">
          <button className="nm-btn nm-btn--ghost" onClick={handleClose}>Cancel</button>
          <button className="nm-btn nm-btn--todo" onClick={handleSave} disabled={saving || total === 0}>
            {saving ? "Saving…" : "Save List"}
          </button>
        </div>
      </div>
    </NoteModalBase>
  );
}
