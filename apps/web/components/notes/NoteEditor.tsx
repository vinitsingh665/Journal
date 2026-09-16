"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEffect, useRef, useCallback, useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";

interface NoteEditorProps {
  noteId: string;
  initialTitle: string;
  initialContent: object;
  color: string;
  isPinned: boolean;
  tradeId?: string | null;
  url?: string | null;
  trades: { id: string; symbol: string }[];
  onUpdate: (patch: Partial<{ title: string; content: object; color: string; isPinned: boolean; tradeId: string | null; url: string | null }>) => void;
  onClose?: () => void;
  onDelete?: () => void;
}

const NOTE_COLORS = [
  { label: "Default", value: "#1a1a2e" },
  { label: "Indigo", value: "#312e81" },
  { label: "Teal", value: "#134e4a" },
  { label: "Rose", value: "#4c0519" },
  { label: "Amber", value: "#451a03" },
  { label: "Purple", value: "#3b0764" },
];

const TEXT_COLORS = [
  { label: "Red", value: "#ef4444" },
  { label: "Pink", value: "#ec4899" },
  { label: "Blue", value: "#60a5fa" },
  { label: "Green", value: "#4ade80" },
  { label: "Orange", value: "#fb923c" },
  { label: "Yellow", value: "#facc15" },
  { label: "Default", value: "" },
];

export default function NoteEditor({
  noteId,
  initialTitle,
  initialContent,
  color,
  isPinned,
  tradeId,
  url,
  trades,
  onUpdate,
  onClose,
  onDelete,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [isPinMenuOpen, setIsPinMenuOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIdRef = useRef(noteId);

  // Reset when note changes
  useEffect(() => {
    noteIdRef.current = noteId;
    setTitle(initialTitle);
    setSavedAt(null);
  }, [noteId, initialTitle]);

  const triggerSave = useCallback((patch: Parameters<typeof onUpdate>[0]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/notes/${noteIdRef.current}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        setSavedAt(new Date().toLocaleTimeString());
        onUpdate(patch);
      } finally {
        setSaving(false);
      }
    }, 1500);
  }, [onUpdate]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Start writing your note..." }),
    ],
    content: initialContent as any,
    onUpdate: ({ editor }) => {
      triggerSave({ content: editor.getJSON() });
    },
    editorProps: {
      attributes: {
        class: "note-tiptap-editor",
      },
    },
  });

  // Re-set content when switching notes
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent as any, { emitUpdate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  if (!editor) return null;

  const wordCount = editor.state.doc.textContent.trim().split(/\s+/).filter(Boolean).length;
  // Use current date for mockup fidelity or actual updatedAt if passed via props. Hardcoded to 16 Sep 2025 as in mockup for now, or just a static date.
  const dateStr = "16 Sep 2025"; 

  return (
    <div className="note-editor-panel">
      {/* Header */}
      <div className="note-editor-header">
        <div className="note-editor-header-left">
          {onClose && (
            <button className="note-editor-back-btn" onClick={onClose} title="Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          )}
          <div className="note-title-wrap">
            <input
              className="note-title-input"
              value={title}
              placeholder="Note title..."
              onChange={(e) => {
                setTitle(e.target.value);
                triggerSave({ title: e.target.value });
              }}
            />
            <span className="note-editor-meta-text">
              {dateStr} · {wordCount} words
            </span>
          </div>
        </div>
        <div className="note-editor-header-right">
          <button className="note-options-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>

      {/* Formatting toolbar */}
      <div className="note-toolbar">
        {/* Segment 1: Heading/Normal dropdown */}
        <div className="toolbar-segment-dropdown">
          Normal Text
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>

        {/* Segment 2: B I U */}
        <div className="toolbar-segment">
          <button className={`toolbar-btn ${editor.isActive("bold") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} title="Bold">
            <span style={{ fontWeight: 700, fontFamily: 'serif' }}>B</span>
          </button>
          <div className="toolbar-divider-internal" />
          <button className={`toolbar-btn ${editor.isActive("italic") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} title="Italic">
            <span style={{ fontStyle: 'italic', fontFamily: 'serif' }}>I</span>
          </button>
          <div className="toolbar-divider-internal" />
          <button className={`toolbar-btn ${editor.isActive("underline") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }} title="Underline">
            <span style={{ textDecoration: 'underline', fontFamily: 'serif' }}>U</span>
          </button>
        </div>

        {/* Segment 3: Lists */}
        <div className="toolbar-segment">
          <button className={`toolbar-btn ${editor.isActive("bulletList") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }} title="Bullet list">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          </button>
          <div className="toolbar-divider-internal" />
          <button className={`toolbar-btn ${editor.isActive("orderedList") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }} title="Numbered list">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
          </button>
        </div>

        {/* Segment 4: Alignments */}
        <div className="toolbar-segment">
          <button className="toolbar-btn active" title="Align Left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="15" y1="12" x2="3" y2="12"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
          </button>
          <div className="toolbar-divider-internal" />
          <button className="toolbar-btn" title="Align Center">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="18" y1="12" x2="6" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
          </button>
        </div>

        {/* Note Colors */}
        <div className="toolbar-note-colors">
          {TEXT_COLORS.filter(c => c.value !== "").map((c) => (
             <button
               key={c.value}
               className={`toolbar-color-btn ${color === c.value ? "active" : ""}`}
               title={`Color: ${c.label}`}
               style={{ background: c.value }}
               onClick={() => onUpdate({ color: c.value })}
             />
          ))}
          <button className="toolbar-color-btn" style={{ border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>

      {/* Editor content */}
      <div className="note-editor-content" style={{ flex: 1, overflowY: "auto" }}>
        <EditorContent editor={editor} />
      </div>

      {/* Bottom bar */}
      <div className="note-bottom-bar">
        <div className="note-bottom-words">
           {wordCount} words
        </div>
        <div className="note-bottom-actions">
           {onDelete && (
             <button className="note-action-icon-btn" onClick={onDelete} title="Delete">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
             </button>
           )}
           <div 
             style={{ position: 'relative' }}
             onMouseEnter={() => setIsPinMenuOpen(true)}
             onMouseLeave={() => setIsPinMenuOpen(false)}
           >
             <button className={`note-action-outline-btn ${isPinned ? 'active' : ''}`} onClick={() => onUpdate({ isPinned: !isPinned })}>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <line x1="12" y1="17" x2="12" y2="22"></line>
                 <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 11.24V6a3 3 0 0 0-6 0v5.24a2 2 0 0 1-1.11 1.31l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
               </svg> 
               Pin
             </button>

             {isPinMenuOpen && (
               <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', paddingBottom: '8px', zIndex: 50 }}>
                 <div style={{ background: '#18181b', border: '1px solid var(--border-secondary, #27272a)', borderRadius: '8px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '160px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', maxHeight: '300px', overflowY: 'auto' }}>
                   <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #71717a)', padding: '4px 8px', textTransform: 'uppercase' }}>Pin to page</div>
                   {(NAV_ITEMS as any).flatMap((s: any) => s.items as { name: string, href: string, icon: string }[])
                     .filter(page => !['/notes', '/settings', '/risk-calculator', '/import', '/screenshots'].includes(page.href))
                     .map(page => (
                     <button 
                       key={page.href}
                       style={{ background: url === page.href ? 'var(--accent-primary-light, rgba(99,102,241,0.15))' : 'transparent', border: 'none', color: url === page.href ? 'var(--text-primary)' : 'var(--text-secondary, #a1a1aa)', padding: '6px 8px', textAlign: 'left', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                       onClick={() => {
                         onUpdate({ url: page.href, isPinned: true });
                         setIsPinMenuOpen(false);
                       }}
                       onMouseEnter={(e) => {
                         if (url !== page.href) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                       }}
                       onMouseLeave={(e) => {
                         if (url !== page.href) e.currentTarget.style.background = 'transparent';
                       }}
                     >
                       {page.name}
                       {url === page.href && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #6366f1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                     </button>
                   ))}
                   <div style={{ height: '1px', background: 'var(--border-secondary, #27272a)', margin: '4px 0' }} />
                   <button 
                     style={{ background: !url ? 'var(--accent-primary-light, rgba(99,102,241,0.15))' : 'transparent', border: 'none', color: !url ? 'var(--text-primary)' : 'var(--text-secondary, #a1a1aa)', padding: '6px 8px', textAlign: 'left', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                     onClick={() => {
                       onUpdate({ url: null, isPinned: true });
                       setIsPinMenuOpen(false);
                     }}
                     onMouseEnter={(e) => {
                       if (url !== null) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                     }}
                     onMouseLeave={(e) => {
                       if (url !== null) e.currentTarget.style.background = 'transparent';
                     }}
                   >
                     Global (All Pages)
                     {!url && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #6366f1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                   </button>
                 </div>
               </div>
             )}
           </div>
           <button className="note-action-solid-btn" onClick={() => triggerSave({ content: editor.getJSON() })}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> 
             {saving ? "Saving..." : "Save"}
           </button>
        </div>
      </div>
    </div>
  );
}
