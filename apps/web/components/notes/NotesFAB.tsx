"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Lazy-load modals to keep initial bundle small
const StickyNoteModal = dynamic(() => import("./modals/StickyNoteModal"), { ssr: false });

type NoteType = "blank" | "journal" | "todo" | "sticky";

const NOTE_OPTIONS: { type: NoteType; label: string; icon: React.ReactNode; accent: boolean }[] = [
  {
    type: "sticky",
    label: "Sticky Note",
    accent: true,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z" />
        <polyline points="15 3 15 9 21 9" />
      </svg>
    ),
  },
];

export default function NotesFAB() {
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/notes?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
    const handleUpdate = () => fetchNotes();
    window.addEventListener("notesUpdated", handleUpdate);
    return () => window.removeEventListener("notesUpdated", handleUpdate);
  }, []);

  const openNewNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const openExistingNote = (note: any) => {
    setEditingNote(note);
    setIsModalOpen(true);
    setOpen(false);
  };

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 300);
  };

  return (
    <>
      <div
        className="notes-fab-root"
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* List of notes shown on hover */}
        <div
          style={{
            position: "absolute",
            bottom: "70px",
            right: 0,
            background: "var(--bg-card, #1f2937)",
            border: "1px solid var(--border-secondary, #374151)",
            borderRadius: "12px",
            width: "260px",
            maxHeight: "350px",
            overflowY: "auto",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transform: open ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)",
            transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transformOrigin: "bottom right",
            zIndex: 10002
          }}
        >
          <div style={{ padding: "12px", borderBottom: "1px solid var(--border-secondary, #374151)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary, #f9fafb)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>My Sticky Notes</span>
            <span style={{ fontSize: "11px", background: "rgba(249,115,22,0.15)", color: "#f97316", padding: "2px 8px", borderRadius: "10px" }}>{notes.length}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {notes.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted, #9ca3af)", fontSize: "12px" }}>
                No notes yet. Click the + button to create one!
              </div>
            ) : (
              notes.map(note => (
                <div
                  key={note.id}
                  onClick={() => openExistingNote(note)}
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid var(--border-secondary, #374151)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "background 0.15s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-tertiary, #374151)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: note.color || "#f97316", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary, #f3f4f6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {note.title || "Untitled Note"}
                    </div>
                    {note.isPinned && note.url && (
                      <div style={{ fontSize: "10px", color: "var(--text-muted, #9ca3af)", marginTop: "2px" }}>
                        Pinned on: {note.url}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main FAB button */}
        <button
          className="notes-fab-btn"
          onClick={openNewNote}
          aria-label="Create sticky note"
          title="Create sticky note"
        >
          <svg className="notes-fab-icon notes-fab-icon--pencil" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <StickyNoteModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          existingNote={editingNote}
        />
      )}
    </>
  );
}

