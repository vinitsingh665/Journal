import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@repo/database";
import { redirect } from "next/navigation";
import NotesClient from "@/components/notes/NotesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes | TraderLabs",
  description: "Your personal trading notes — ideas, reflections, and insights.",
};

export default async function NotesPage() {
  const userId = await getCurrentUser();
  if (!userId) redirect("/login");

  const [notes, trades] = await Promise.all([
    prisma.note.findMany({
      where: { userId },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      include: { trade: { select: { symbol: true } } },
    }),
    prisma.trade.findMany({
      where: { userId },
      select: { id: true, symbol: true },
      orderBy: { entryTime: "desc" },
      take: 100,
    }),
  ]);

  // Serialize dates
  const serializedNotes = notes.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  }));

  return (
    <NotesClient
      initialNotes={serializedNotes}
      trades={trades}
    />
  );
}
