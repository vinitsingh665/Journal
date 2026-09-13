import { redirect, notFound } from "next/navigation";
import { prisma } from "@repo/database";

/**
 * Handles root shared dashboard links: /s/TOKEN
 * 
 * This runs as a Server Component on the Node.js runtime (NOT Edge middleware),
 * giving it full Prisma access for reliable token verification.
 * 
 * On success  → redirects to /shared/[userId]
 * On failure  → redirects to /expired
 */
export default async function SharedTokenRootPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token) {
    redirect("/expired");
  }

  let link: { userId: string; expiresAt: Date } | null = null;

  try {
    link = await prisma.sharedLink.findUnique({
      where: { token },
      select: { userId: true, expiresAt: true, targetPath: true },
    });
  } catch (e) {
    console.error("[SharedToken] DB lookup failed:", e);
    redirect("/expired");
  }

  if (!link || link.expiresAt < new Date()) {
    redirect("/expired");
  }

  if ((link as any).targetPath && (link as any).targetPath !== "") {
    // This token was generated for a specific sub-path, root access is denied
    redirect("/expired");
  }

  redirect(`/shared/${link.userId}?t=${token}`);
}
