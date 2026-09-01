import prisma from "@repo/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Image
              src="/logo2.png"
              alt="TraderLabs"
              width={40}
              height={40}
              style={{ objectFit: 'contain' }}
              priority
            />
            <span style={{ fontWeight: 600, fontSize: "1.2rem", display: 'flex', alignItems: 'center', gap: '8px' }}>
              TraderLabs <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "1rem" }}>| {user.name}'s Shared Dashboard</span>
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
