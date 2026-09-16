"use client";

import { formatDate, cn } from "@/lib/utils";

interface NoteCardProps {
  id: string;
  title: string;
  color: string;
  isPinned: boolean;
  updatedAt: string;
  contentPreview: string;
  tradeSymbol?: string | null;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function NoteCard({
  title,
  color,
  isPinned,
  updatedAt,
  contentPreview,
  tradeSymbol,
  isSelected,
  onClick,
  onDelete,
}: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn("note-card", isSelected && "note-card--active")}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="note-card-header">
        <div className="note-card-title">
          {isPinned && (
            <span className="note-pin-icon" title="Pinned">
              📌
            </span>
          )}
          <span>{title || "Untitled"}</span>
        </div>
        <button
          className="note-delete-btn"
          title="Delete note"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
      {tradeSymbol && (
        <div className="note-trade-badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3z"/><path d="M3 9h18M9 3v18"/></svg>
          {tradeSymbol}
        </div>
      )}
      {contentPreview && (
        <p className="note-card-preview">{contentPreview}</p>
      )}
      <div className="note-card-date">{formatDate(updatedAt)}</div>
    </div>
  );
}
