"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import NoteModalBase from "./NoteModalBase";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NewNoteModal({ open, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Start writing your note…" }),
    ],
    editorProps: { attributes: { class: "new-note-editor" } },
  });

  const handleClose = useCallback(() => {
    editor?.commands.clearContent();
    setTitle("");
    onClose();
  }, [editor, onClose]);

  const handleSave = async () => {
    const content = editor?.getJSON() ?? { type: "doc", content: [] };
    setSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "Untitled", content }),
      });
      if (res.ok) {
        handleClose();
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoteModalBase open={open} onClose={handleClose} size="lg">
      {/* Header */}
      <div className="nm-header nm-header--new">
        <div className="nm-header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
          </svg>
        </div>
        <input
          className="nm-title-input"
          placeholder="Note title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <button className="nm-close-btn" onClick={handleClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Toolbar */}
      <div className="nm-toolbar">
        {editor && (<>
          <button className={`nm-tb-btn ${editor.isActive("bold") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}><b>B</b></button>
          <button className={`nm-tb-btn ${editor.isActive("italic") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}><i>I</i></button>
          <button className={`nm-tb-btn ${editor.isActive("underline") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}><u>U</u></button>
          <div className="nm-tb-divider" />
          <button className={`nm-tb-btn ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}>H1</button>
          <button className={`nm-tb-btn ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}>H2</button>
          <div className="nm-tb-divider" />
          <button className={`nm-tb-btn ${editor.isActive("bulletList") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}>• —</button>
          <button className={`nm-tb-btn ${editor.isActive("orderedList") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}>1.</button>
          <button className={`nm-tb-btn ${editor.isActive("code") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleCode().run(); }}>&lt;/&gt;</button>
        </>)}
      </div>

      {/* Editor */}
      <div className="nm-editor-body">
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      <div className="nm-footer">
        <button className="nm-btn nm-btn--ghost" onClick={handleClose}>Cancel</button>
        <button className="nm-btn nm-btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Note"}
        </button>
      </div>
    </NoteModalBase>
  );
}
