"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface NoteModalBaseProps {
  open: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  style?: React.CSSProperties;
  hideBackdrop?: boolean;
  children: React.ReactNode;
}

export default function NoteModalBase({ open, onClose, size = "lg", className = "", style, hideBackdrop = false, children }: NoteModalBaseProps) {
  // Lock scroll
  useEffect(() => {
    if (open && !hideBackdrop) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open, hideBackdrop]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className={`note-modal-backdrop ${open ? "note-modal-backdrop--open" : ""}`}
      onMouseDown={(e) => { if (e.target === e.currentTarget && !hideBackdrop) onClose(); }}
      style={hideBackdrop ? { background: "transparent", backdropFilter: "none", pointerEvents: "none" } : undefined}
    >
      <div 
        className={`note-modal-card note-modal-card--${size} ${open ? "note-modal-card--open" : ""} ${className}`}
        style={{ ...(hideBackdrop ? { pointerEvents: "auto" } : {}), ...style }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
