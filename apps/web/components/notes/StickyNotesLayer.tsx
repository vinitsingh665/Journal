"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import PinnedStickyNote from "./PinnedStickyNote";

export default function StickyNotesLayer() {
  const pathname = usePathname();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/notes?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.filter((n: any) => n.isPinned));
      }
    } catch (err) {
      console.error("Failed to fetch spatial notes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch notes when URL changes or an event is fired
  useEffect(() => {
    fetchNotes();
    const handleUpdate = () => fetchNotes();
    window.addEventListener("notesUpdated", handleUpdate);
    return () => window.removeEventListener("notesUpdated", handleUpdate);
  }, [fetchNotes]);

  // Optimistic update — instantly apply changes from the edit modal without a full refetch
  useEffect(() => {
    const handleOptimistic = (e: Event) => {
      const { id, changes, addIfMissing, action } = (e as CustomEvent).detail ?? {};
      if (!id) return;

      // Handle optimistic delete — remove note from layer instantly
      if (action === "delete") {
        setNotes(prev => prev.filter(n => n.id !== id));
        return;
      }

      if (!changes) return;
      setNotes(prev => {
        const exists = prev.some(n => n.id === id);
        if (!exists && addIfMissing) {
          // New pinned note — add it straight to the layer
          return [...prev, changes];
        }
        return prev.map(n => n.id === id ? { ...n, ...changes } : n);
      });
    };
    window.addEventListener("noteOptimisticUpdate", handleOptimistic);
    return () => window.removeEventListener("noteOptimisticUpdate", handleOptimistic);
  }, []);

  const handleUpdateNote = async (id: string, updates: any) => {
    // Optimistic UI update
    setNotes(prev => {
      // If unpinning, remove it from the layer
      if (updates.isPinned === false) {
        return prev.filter(n => n.id !== id);
      }
      return prev.map(n => n.id === id ? { ...n, ...updates } : n);
    });

    try {
      await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("Failed to update spatial note:", err);
      fetchNotes(); // rollback on error
    }
  };

  const visibleNotes = notes.filter((n) => !n.url || n.url === pathname);

  if (loading || visibleNotes.length === 0) return null;

  return (
    <>
      {visibleNotes.map(note => (
        <PinnedStickyNote key={note.id} note={note} onUpdate={handleUpdateNote} />
      ))}
    </>
  );
}
