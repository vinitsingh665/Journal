import { prisma } from "@repo/database";
import { redirect } from "next/navigation";

export async function verifySharedAccess(userId: string, currentPath: string, token: string | undefined | null) {
  if (!token) {
    redirect("/expired");
  }

  const link = await prisma.sharedLink.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true, targetPath: true }
  });

  if (!link || link.userId !== userId || link.expiresAt < new Date()) {
    redirect("/expired");
  }

  if (link.targetPath && link.targetPath !== "") {
    // Exact match or subpath match (e.g. currentPath "journal/123", targetPath "journal")
    if (currentPath !== link.targetPath && !currentPath.startsWith(link.targetPath + "/")) {
      redirect("/expired");
    }
  }
}
