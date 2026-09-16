"use client";

import { useState, useCallback, useEffect } from "react";
import NoteCard from "./NoteCard";
import NoteEditor from "./NoteEditor";

interface NoteStub {
  id: string;
  title: string;
  color: string;
  isPinned: boolean;
  updatedAt: string;
  tradeId: string | null;
  url: string | null;
  content: any;
  trade: { symbol: string } | null;
}

interface Trade {
  id: string;
  symbol: string;
}

// Extract a plain-text preview from Tiptap JSON
function extractPreview(content: any): string {
  if (!content || !content.content) return "";
  const texts: string[] = [];
  const walk = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.type === "text" && node.text) texts.push(node.text);
      if (node.content) walk(node.content);
      if (texts.join("").length > 80) return;
    }
  };
  walk(content.content);
  const preview = texts.join("").trim().slice(0, 80);
  return preview.length < texts.join("").trim().length ? preview + "…" : preview;
}

export default function NotesClient({
  initialNotes,
  trades,
}: {
  initialNotes: NoteStub[];
  trades: Trade[];
}) {
  const [notes, setNotes] = useState<NoteStub[]>(initialNotes);
  const [selectedId, setSelectedId] = useState<string | null>(initialNotes.length > 0 ? initialNotes[0]?.id : null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pinned" | "tags">("all");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const handleUpdate = async () => {
      try {
        const res = await fetch(`/api/notes?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setNotes(data);
        }
      } catch (err) {
        console.error("Failed to sync notes:", err);
      }
    };
    window.addEventListener("notesUpdated", handleUpdate);
    return () => window.removeEventListener("notesUpdated", handleUpdate);
  }, []);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const filteredNotes = notes.filter((n) => {
    if (filter === "pinned" && !n.isPinned) return false;
    // For 'tags', assuming we filter by notes with tags or it's a placeholder filter for now
    const searchMatch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                        extractPreview(n.content).toLowerCase().includes(search.toLowerCase());
    return searchMatch;
  });

  const createNote = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled", content: { type: "doc", content: [] } }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotes((prev) => [{ ...note, trade: null }, ...prev]);
        setSelectedId(note.id);
        window.dispatchEvent(new Event("notesUpdated"));
      }
    } finally {
      setCreating(false);
    }
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) {
      setSelectedId(notes.find((n) => n.id !== id)?.id ?? null);
    }
    window.dispatchEvent(new Event("notesUpdated"));
  };

  const handleUpdate = useCallback(
    (id: string, patch: Partial<NoteStub>) => {
      // Immediately save to DB (auto-save in NoteEditor handles debounce)
      if (patch.isPinned !== undefined || patch.color !== undefined || patch.tradeId !== undefined || patch.url !== undefined) {
        fetch(`/api/notes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        }).then(() => window.dispatchEvent(new Event("notesUpdated")));
      }
      setNotes((prev) =>
        prev
          .map((n) => (n.id === id ? { ...n, ...patch } : n))
          .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
      );
    },
    []
  );

  return (
    <div className="notes-page-root">
      {/* Global Page Header */}
      <div className="notes-page-header">
        <div className="notes-header-left">
          <div className="notes-header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div className="notes-header-text">
            <h1>Notes</h1>
            <p>Capture ideas, insights, and lessons on your trading journey.</p>
          </div>
        </div>
        <div className="notes-header-right">
          <div className="notes-header-quote">
            "A disciplined mind writes things down."
          </div>
          <button 
            className="notes-new-btn"
            onClick={createNote}
            disabled={creating}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {creating ? "Creating..." : "New Note"}
          </button>
        </div>
      </div>

      <div className="notes-layout">
        {/* Sidebar */}
        <div className="notes-sidebar">
          <div className="notes-sidebar-filters">
            <button className={`notes-filter-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              All
            </button>
            <button className={`notes-filter-tab ${filter === "pinned" ? "active" : ""}`} onClick={() => setFilter("pinned")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"/></svg>
              Pinned
            </button>
            <button className={`notes-filter-tab ${filter === "tags" ? "active" : ""}`} onClick={() => setFilter("tags")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              Tags
            </button>
          </div>
          
          <div className="notes-search-wrap">
            <input
              className="notes-search"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {notes.length === 0 && search === "" ? (
            <div className="notes-sidebar-empty">
              <svg className="notes-sidebar-empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <h3>No notes yet</h3>
              <p>Create your first note to start building your knowledge base.</p>
              <button 
                className="notes-create-outline-btn"
                onClick={createNote}
                disabled={creating}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {creating ? "Creating..." : "Create Note"}
              </button>
            </div>
          ) : (
            <div className="notes-list">
              {filteredNotes.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", padding: "40px 20px" }}>
                  No notes match your filter or search.
                </div>
              )}
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  color={note.color}
                  isPinned={note.isPinned}
                  updatedAt={note.updatedAt}
                  contentPreview={extractPreview(note.content)}
                  tradeSymbol={note.trade?.symbol ?? null}
                  isSelected={selectedId === note.id}
                  onClick={() => setSelectedId(note.id)}
                  onDelete={() => deleteNote(note.id)}
                />
              ))}
            </div>
          )}
          {notes.length > 0 && search === "" && (
            <div style={{ padding: "16px 20px", fontSize: "12px", color: "var(--text-muted, #64748b)", borderTop: "1px solid var(--border-secondary, #1e293b)", flexShrink: 0 }}>
              {filteredNotes.length} note{filteredNotes.length !== 1 && "s"}
            </div>
          )}
        </div>

        {/* Editor panel */}
        <div className="notes-editor-area">
          {selectedNote ? (
            <NoteEditor
              key={selectedNote.id}
              noteId={selectedNote.id}
              initialTitle={selectedNote.title}
              initialContent={selectedNote.content}
              color={selectedNote.color}
              isPinned={selectedNote.isPinned}
              url={selectedNote.url}
              tradeId={selectedNote.tradeId}
              trades={trades}
              onUpdate={(patch) => handleUpdate(selectedNote.id, patch as any)}
              onClose={() => setSelectedId(null)}
              onDelete={() => {
                deleteNote(selectedNote.id);
                setSelectedId(null);
              }}
            />
          ) : (
            <div className="notes-main-empty">
              <div className="notes-empty-hero">
                <div className="notes-empty-graphic">
                  <div className="graphic-glow"></div>
                  <div className="graphic-card-bg"></div>
                  <div className="graphic-card-fg">
                    Ideas<br/>Today,<br/>Better Trades<br/>Tomorrow.
                    <svg width="60" height="20" viewBox="0 0 100 20" style={{position: "absolute", bottom: "16px", right: "20px"}}>
                      <path d="M5 15 Q 50 -5, 95 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <h2>Your thoughts, in one place.</h2>
                <p>Write down trade ideas, strategies, lessons, or anything that helps you become a better trader.</p>
                
                <button 
                  className="notes-new-btn"
                  onClick={createNote}
                  disabled={creating}
                  style={{ padding: "12px 32px", fontSize: "15px" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  {creating ? "Creating..." : "Create Your First Note"}
                </button>
              </div>

              <div className="notes-empty-features">
                <div className="notes-feature-card">
                  <svg className="notes-feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                  <h4>Write freely</h4>
                  <p>Capture ideas, setups, or market thoughts.</p>
                </div>
                <div className="notes-feature-card">
                  <svg className="notes-feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                  <h4>Organize with tags</h4>
                  <p>Keep notes structured and easy to find.</p>
                </div>
                <div className="notes-feature-card">
                  <svg className="notes-feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"/></svg>
                  <h4>Pin important notes</h4>
                  <p>Always keep key insights on top.</p>
                </div>
                <div className="notes-feature-card">
                  <svg className="notes-feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                  <h4>Review & improve</h4>
                  <p>Turn your notes into better decisions.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
