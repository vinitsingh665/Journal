"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskList } from "@tiptap/extension-task-list";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { CustomTaskItem } from "../CustomTaskItem";
import NoteModalBase from "./NoteModalBase";

const STICKY_COLORS = [
  { name: "Yellow", bg: "#fef08a", border: "#fde047" },
  { name: "Pink",   bg: "#fbcfe8", border: "#f9a8d4" },
  { name: "Blue",   bg: "#bae6fd", border: "#7dd3fc" },
  { name: "Green",  bg: "#bbf7d0", border: "#86efac" },
  { name: "Purple", bg: "#e9d5ff", border: "#d8b4fe" },
  { name: "Salmon", bg: "#fca5a5", border: "#f87171" },
  { name: "Gray",   bg: "#4b5563", border: "#374151", dark: true },
];

const MAX_CHARS = 280;

interface Props {
  open: boolean;
  onClose: () => void;
  existingNote?: any;
}

export default function StickyNoteModal({ open, onClose, existingNote }: Props) {
  // Initialize color from existing note if available
  const initialColorIdx = existingNote 
    ? STICKY_COLORS.findIndex(c => c.bg === existingNote.color) 
    : 0;
    
  const [colorIdx, setColorIdx] = useState(initialColorIdx >= 0 ? initialColorIdx : 0);
  const [textLength, setTextLength] = useState(0);
  
  // Drag state - initialize to 0,0 so it centers properly
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const router = useRouter();
  const color = STICKY_COLORS[colorIdx];
  const isDark = color.dark;
  const textColor = isDark ? "#ffffff" : "#374151";
  const iconColor = isDark ? "#d1d5db" : "#4b5563";

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TaskList,
      TextStyle,
      Color,
      CustomTaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Write your note here..." }),
    ],
    content: existingNote?.content || "",
    editorProps: {
      attributes: {
        class: "nm-sticky-editor-content",
        style: `color: ${textColor};`,
      },
    },
    onUpdate: ({ editor }) => {
      setTextLength(editor.getText().length);
    },
  });

  useEffect(() => {
    if (editor && existingNote) {
      setTextLength(editor.getText().length);
    }
  }, [editor, existingNote]);

  const handleClose = useCallback(() => {
    if (!existingNote) {
      editor?.commands.clearContent();
      setColorIdx(0);
      setTextLength(0);
      setPosition({ x: 0, y: 0 });
    }
    onClose();
  }, [editor, onClose, existingNote]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!(e.target as HTMLElement).closest(".nm-sticky-header")) return;
    if ((e.target as HTMLElement).closest("button")) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleSave = async (shouldPin: boolean = false) => {
    const text = editor?.getText() || "";
    if (!text.trim()) return;

    const content = editor?.getJSON() ?? { type: "doc", content: [] };
    const title = text.trim().slice(0, 40) + (text.trim().length > 40 ? "…" : "");

    // Capture modal position BEFORE closing (for new pinned notes)
    const modalEl = document.querySelector(".nm-sticky-modal .nm-modal-content");
    const rect = modalEl?.getBoundingClientRect();
    const finalX = rect ? rect.left : (window.innerWidth / 2) - 125;
    const finalY = rect ? rect.top : (window.innerHeight / 2) - 150;

    // ✅ Close modal immediately — don't wait for the API response
    handleClose();

    if (existingNote) {
      // ✅ Instantly reflect changes on the floating note (color, content, title)
      const pinChanges = shouldPin && !existingNote.isPinned
        ? { isPinned: true, isMinimized: true, url: window.location.pathname, positionX: finalX, positionY: finalY }
        : {};

      window.dispatchEvent(new CustomEvent("noteOptimisticUpdate", {
        detail: {
          id: existingNote.id,
          changes: { title, content, color: color.bg, ...pinChanges },
        },
      }));

      try {
        await fetch(`/api/notes/${existingNote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, color: color.bg, ...pinChanges }),
        });
        // Sync final server state
        window.dispatchEvent(new Event("notesUpdated"));
      } catch (err) {
        console.error("Failed to save note:", err);
        // Rollback: refetch true state
        window.dispatchEvent(new Event("notesUpdated"));
      }
    } else {
      // ✅ For new pinned notes: immediately show a temp dot on screen — no waiting for API
      const tempId = shouldPin ? `temp-${Date.now()}` : null;

      if (tempId) {
        window.dispatchEvent(new CustomEvent("noteOptimisticUpdate", {
          detail: {
            id: tempId,
            changes: {
              id: tempId,
              title,
              content,
              color: color.bg,
              url: window.location.pathname,
              positionX: finalX,
              positionY: finalY,
              isPinned: true,
              isMinimized: true,
              width: 32,
              height: 32,
            },
            addIfMissing: true,
          },
        }));
      }

      try {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            color: color.bg,
            url: window.location.pathname,
            positionX: finalX,
            positionY: finalY,
            isPinned: shouldPin,
            isMinimized: shouldPin,
          }),
        });

        if (res.ok && shouldPin) {
          const newNote = await res.json();
          // Remove temp dot and add real note (with real DB id)
          if (tempId) {
            window.dispatchEvent(new CustomEvent("noteOptimisticUpdate", {
              detail: { id: tempId, action: "delete" },
            }));
          }
          window.dispatchEvent(new CustomEvent("noteOptimisticUpdate", {
            detail: { id: newNote.id, changes: newNote, addIfMissing: true },
          }));
        }

        router.refresh();
        window.dispatchEvent(new Event("notesUpdated"));
      } catch (err) {
        // Remove temp dot on failure
        if (tempId) {
          window.dispatchEvent(new CustomEvent("noteOptimisticUpdate", {
            detail: { id: tempId, action: "delete" },
          }));
        }
        console.error("Failed to save note:", err);
      }
    }
  };

  const remaining = MAX_CHARS - textLength;

  return (
    <NoteModalBase 
      open={open} 
      onClose={handleClose} 
      size="sm"
      className="nm-sticky-modal"
      hideBackdrop={true}
      style={{ 
        background: color.bg, 
        borderColor: color.border,
        transform: (position.x !== 0 || position.y !== 0) ? `translate(${position.x}px, ${position.y}px)` : undefined,
        transition: isDragging.current ? "none" : undefined
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        {/* Seamless Header */}
        <div className="nm-sticky-header" style={{ cursor: "move" }}>
          <div className="nm-sticky-date" style={{ color: iconColor }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'text-bottom' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
          <div className="nm-sticky-header-actions">
            <svg className="nm-sticky-header-icon" style={{ color: iconColor }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"/>
              <polyline points="15 3 15 9 21 9"/>
            </svg>
            <div className="nm-sticky-divider" style={{ backgroundColor: iconColor, opacity: 0.3 }} />
            <button className="nm-close-btn nm-close-btn--sticky" onClick={handleClose} style={{ color: iconColor }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

      {/* Writing Area */}
      <div className="nm-sticky-body">
        <EditorContent editor={editor} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Floating Toolbar Pill */}
      <div className="nm-sticky-toolbar-container">
        <div className={`nm-sticky-toolbar ${isDark ? "nm-sticky-toolbar--dark" : ""}`}>
          
          {/* Formatting buttons */}
          <div className="nm-sticky-tools">
            <select className="nm-sticky-select">
              <option>Poppins</option>
            </select>
            <label 
              className="nm-sticky-tool-btn" 
              title="Text Color"
              style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h16"/>
                <path d="M7 20l5-16 5 16"/>
                <path d="M9 13h6"/>
              </svg>
              <div style={{ position: 'absolute', bottom: '4px', left: '6px', right: '6px', height: '3px', borderRadius: '2px', backgroundColor: editor?.getAttributes('textStyle').color || (isDark ? "#ffffff" : "#374151") }} />
              <input 
                type="color" 
                onChange={(e) => editor?.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                value={editor?.getAttributes('textStyle').color || (isDark ? "#ffffff" : "#374151")}
                style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
              />
            </label>
            
            {editor && (
              <>
                <button className={`nm-sticky-tool-btn ${editor.isActive("bold") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}><b>B</b></button>
                <button className={`nm-sticky-tool-btn ${editor.isActive("italic") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}><i>I</i></button>
                <button className={`nm-sticky-tool-btn ${editor.isActive("underline") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}><u>U</u></button>
                
                <div className="nm-sticky-tool-divider" />
                
                <button className={`nm-sticky-tool-btn ${editor.isActive("bulletList") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
                <button className={`nm-sticky-tool-btn ${editor.isActive("orderedList") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
                </button>
                <button className={`nm-sticky-tool-btn ${editor.isActive("taskList") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleTaskList().run(); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </button>
              </>
            )}
          </div>
          
          {/* Color picker & Icons */}
          <div className="nm-sticky-bottom-row">
            <div className="nm-sticky-colors">
              {STICKY_COLORS.map((c, i) => (
                <button
                  key={c.name}
                  className={`nm-sticky-color-dot ${i === colorIdx ? "nm-sticky-color-dot--active" : ""}`}
                  style={{ background: c.bg }}
                  onClick={() => setColorIdx(i)}
                  title={c.name}
                />
              ))}
            </div>

            <div className="nm-sticky-tool-divider" />
            
            <button className="nm-sticky-icon-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>
            <button className="nm-sticky-icon-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></button>
            <button className="nm-sticky-icon-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button>
          </div>
        </div>
        
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
          <div className="nm-sticky-char-count" style={{ color: remaining < 40 ? "#ef4444" : iconColor, fontSize: "12px", fontWeight: 600 }}>
            {textLength}/{MAX_CHARS}
          </div>
          
          <div style={{ display: "flex", gap: "8px" }}>
            {!existingNote && (
              <button
                className="nm-sticky-save"
                onClick={() => handleSave(false)}
                disabled={textLength === 0}
                style={{ background: "transparent", color: iconColor, border: `2px solid ${iconColor}`, marginLeft: 0 }}
              >
                Save
              </button>
            )}
            <button
              className="nm-sticky-save"
              onClick={() => handleSave(true)}
              disabled={textLength === 0}
              style={{ marginLeft: 0 }}
            >
              {existingNote ? "Save" : "Pin"}
            </button>
          </div>
        </div>
      </div>

      </div>

      {/* Fold corner decoration */}
      <div className="nm-sticky-fold" style={{ borderColor: `transparent transparent ${color.border} transparent` }} />
    </NoteModalBase>
  );
}
