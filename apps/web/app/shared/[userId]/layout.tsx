import prisma from "@repo/database";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SharedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true }
  });
  
  if (!user) {
    notFound();
  }

  return (
    <div className="app-layout" style={{ display: 'block' }}>
      <div className="app-main" style={{ marginLeft: 0 }}>
        <header className="topbar" style={{ padding: "0 24px", justifyContent: "center", borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>
              TraderLabs <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>| {user.name}'s Shared Dashboard</span>
            </span>
          </div>
        </header>
        <main className="app-content" style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
