"use client";

import { useState, useRef, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TaskList } from "@tiptap/extension-task-list";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { CustomTaskItem } from "./CustomTaskItem";
import { useRouter } from "next/navigation";
import StickyNoteModal from "./modals/StickyNoteModal";

interface PinnedNoteProps {
  note: any;
  onUpdate: (id: string, data: any) => void;
}

export default function PinnedStickyNote({ note, onUpdate }: PinnedNoteProps) {
  const [position, setPosition] = useState({ x: note.positionX || 100, y: note.positionY || 100 });
  const [isMinimized, setIsMinimized] = useState(note.isMinimized || false);
  const router = useRouter();

  // Drag state
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const clickStartPos = useRef({ x: 0, y: 0 }); // Track click distance to differentiate click vs drag

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TaskList,
      TextStyle,
      Color,
      CustomTaskItem.configure({ nested: true }),
    ],
    content: note.content,
    editable: false,
    editorProps: {
      attributes: {
        class: "nm-sticky-editor-content",
        style: `color: ${note.color === "#4b5563" ? "#ffffff" : "#374151"}; font-size: 14px; padding: 0; min-height: auto;`,
      },
    },
    onUpdate: ({ editor: e }) => {
      onUpdate(note.id, { content: e.getJSON() });
    }
  });

  useEffect(() => {
    if (editor && note.content) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(note.content);
      // Only set content if it's actually different to avoid unnecessary re-renders
      if (currentContent !== newContent) {
        editor.commands.setContent(note.content);
      }
    }
  }, [note.content, editor]);

  const [screenSize, setScreenSize] = useState({ width: 1200, height: 800 });

  const [size, setSize] = useState({ w: note.width || 32, h: note.height || 32 });
  const isResizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    // On mount, set true screen size and clamp initial position if out of bounds
    const handleResize = () => setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener("resize", handleResize);

    const dotSize = 32;
    let x = position.x;
    let y = position.y;
    let changed = false;

    if (x < 0) { x = 0; changed = true; }
    if (y < 0) { y = 0; changed = true; }
    if (x > window.innerWidth - dotSize) { x = window.innerWidth - dotSize; changed = true; }
    if (y > window.innerHeight - dotSize) { y = window.innerHeight - dotSize; changed = true; }

    if (changed) {
      setPosition({ x, y });
      onUpdate(note.id, { positionX: x, positionY: y });
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [note.id, position.x, position.y, onUpdate]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, input, label, .nm-custom-checkbox")) return;

    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    clickStartPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isResizing.current = true;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isResizing.current) {
      let newW = resizeStart.current.w + (e.clientX - resizeStart.current.x);
      let newH = resizeStart.current.h + (e.clientY - resizeStart.current.y);
      if (newW < 32) newW = 32;
      if (newH < 32) newH = 32;
      setSize({ w: newW, h: newH });
      return;
    }

    if (!isDragging.current) return;
    
    let newX = e.clientX - dragStart.current.x;
    let newY = e.clientY - dragStart.current.y;
    
    // Clamp to screen bounds
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX > window.innerWidth - size.w) newX = window.innerWidth - size.w;
    if (newY > window.innerHeight - size.h) newY = window.innerHeight - size.h;

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isResizing.current) {
      isResizing.current = false;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      onUpdate(note.id, { width: size.w, height: size.h });
      return;
    }

    if (!isDragging.current) return;
    isDragging.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    onUpdate(note.id, { positionX: position.x, positionY: position.y });
  };

  const handleUnpin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(note.id, { isPinned: false, url: null });
    router.refresh();
  };

  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this sticky note?")) return;
    try {
      await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
      window.dispatchEvent(new Event("notesUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  const isDark = note.color === "#4b5563";
  const iconColor = isDark ? "#d1d5db" : "#4b5563";
  const borderColor = isDark ? "#374151" : "rgba(0,0,0,0.1)";

  const isNearTop = position.y < 300;
  const isNearLeft = position.x < 150;
  const isNearRight = position.x > screenSize.width - 150;

  const tooltipVerticalStyle = isNearTop 
    ? { top: "100%", paddingTop: "12px" } 
    : { bottom: "100%", paddingBottom: "12px" };
    
  const tooltipHorizontalStyle = isNearLeft 
    ? { left: "0", transform: "none" }
    : isNearRight 
      ? { right: "0", left: "auto", transform: "none" }
      : { left: "50%", transform: "translateX(-50%)" };

  const isExpanded = size.w >= 80 || size.h >= 80;

  return (
    <>
      <div
        className="pinned-note-minimized"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          width: size.w,
          height: size.h,
          borderRadius: isExpanded ? "8px" : "50%",
          background: note.color,
          boxShadow: isExpanded ? "0 8px 24px rgba(0,0,0,0.15)" : "0 4px 12px rgba(0,0,0,0.2)",
          cursor: isExpanded ? "auto" : "grab",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${borderColor}`,
          padding: isExpanded ? "8px" : "0",
          flexDirection: "column"
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button, input, label, .nm-custom-checkbox")) return;
          const dx = e.clientX - clickStartPos.current.x;
          const dy = e.clientY - clickStartPos.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 5) {
            setIsEditing(true);
          }
        }}
      >
        {isExpanded && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.08,
            borderRadius: "inherit", overflow: "hidden",
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: "multiply", zIndex: 1
          }} />
        )}

        {isExpanded ? (
          <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", position: "relative", zIndex: 2 }}>
            {/* Header Actions when Hovered */}
            <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end", opacity: isHovered ? 1 : 0, transition: "opacity 0.2s", marginBottom: "4px", paddingBottom: "4px", borderBottom: `1px dashed ${borderColor}` }}>
              <div style={{ flex: 1, cursor: "move" }} onPointerDown={handlePointerDown} />
              <button 
                onClick={() => setIsEditing(true)} 
                style={{ background: "transparent", border: "none", color: iconColor, cursor: "pointer", padding: "2px", borderRadius: "4px" }} 
                title="Edit"
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              </button>
              <button 
                onClick={handleUnpin} 
                style={{ background: "transparent", border: "none", color: iconColor, cursor: "pointer", padding: "2px", borderRadius: "4px" }} 
                title="Unpin"
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"/></svg>
              </button>
              <button 
                onClick={handleDelete} 
                style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "2px", borderRadius: "4px" }} 
                title="Delete"
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", fontSize: "13px", wordBreak: "break-word", color: isDark ? "#ffffff" : "#374151" }}>
              <EditorContent editor={editor} />
            </div>
          </div>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"/>
            <polyline points="15 3 15 9 21 9"/>
          </svg>
        )}

        {/* Hover Menu (Only show when minimized) */}
        {isHovered && !isDragging.current && !isExpanded && (
          <div style={{
            position: "absolute",
            zIndex: 10000,
            ...tooltipVerticalStyle,
            ...tooltipHorizontalStyle,
          }} 
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
          >
            <div style={{
              background: note.color,
              borderRadius: "8px",
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              border: `1px solid ${borderColor}`,
              width: "max-content",
              minWidth: "160px",
              maxWidth: "260px",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.08,
                background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                mixBlendMode: "multiply", zIndex: 1
              }} />

              <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end", paddingBottom: "6px", borderBottom: `1px dashed ${borderColor}`, position: "relative", zIndex: 2 }}>
                <button onClick={() => setIsEditing(true)} style={{ background: "transparent", border: "none", color: iconColor, cursor: "pointer", padding: "4px", borderRadius: "4px" }} title="Edit" onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.06)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
                <button onClick={handleUnpin} style={{ background: "transparent", border: "none", color: iconColor, cursor: "pointer", padding: "4px", borderRadius: "4px" }} title="Unpin" onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.06)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"/></svg></button>
                <button onClick={handleDelete} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px", borderRadius: "4px" }} title="Delete" onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.06)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
              </div>

              <div style={{ fontSize: "13px", padding: "2px 4px 4px 4px", maxHeight: "200px", overflowY: "auto", textAlign: "left", wordBreak: "break-word", position: "relative", zIndex: 2 }}>
                <EditorContent editor={editor} />
              </div>
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 0 16px 16px", borderColor: `transparent transparent ${borderColor} transparent`, zIndex: 3 }} />
            </div>
          </div>
        )}

        {/* Resize Handle */}
        <div 
          onPointerDown={handleResizePointerDown}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "14px",
            height: "14px",
            cursor: "nwse-resize",
            zIndex: 10,
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s"
          }}
        >
          {/* Subtle resize indicator */}
          <div style={{ position: "absolute", bottom: "4px", right: "4px", width: "4px", height: "4px", borderRadius: "50%", background: iconColor, opacity: 0.5 }} />
        </div>
      </div>

      {/* Edit Modal Rendered Locally */}
      {isEditing && (
        <StickyNoteModal
          existingNote={note}
          open={isEditing}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}
