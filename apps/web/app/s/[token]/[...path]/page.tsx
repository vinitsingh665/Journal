import { redirect } from "next/navigation";
import { prisma } from "@repo/database";

/**
 * Handles all shared page links with a sub-path: /s/TOKEN/trades, /s/TOKEN/journal, etc.
 *
 * This runs as a Server Component on the Node.js runtime (NOT Edge middleware),
 * giving it full Prisma access for reliable token verification.
 *
 * On success  → redirects to /shared/[userId]/[...path]
 * On failure  → redirects to /expired
 */
export default async function SharedTokenPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string; path: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token, path } = await params;
  const resolvedSearchParams = await searchParams;

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

  const subPath = path ? path.join("/") : "";
  
  if ((link as any).targetPath) {
    if (subPath !== (link as any).targetPath && !subPath.startsWith((link as any).targetPath + "/")) {
      redirect("/expired");
    }
  }

  const targetBase = `/shared/${link.userId}${subPath ? `/${subPath}` : ""}`;

  // Forward query params (e.g. ?page=2&status=OPEN) so shared journal/trades
  // pagination and filtering work correctly
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v));
    } else {
      qs.set(key, value);
    }
  }

  // Always append the token for authorization downstream
  qs.set("t", token);

  const queryString = qs.toString();
  const targetUrl = queryString ? `${targetBase}?${queryString}` : targetBase;

  redirect(targetUrl);
}
