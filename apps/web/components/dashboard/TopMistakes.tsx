"use client";

import Link from "next/link";

interface Mistake {
  name: string;
  count: number;
  color: string;
}

export default function TopMistakes({ mistakes }: { mistakes: Mistake[] }) {
  return (
    <div className="card" id="top-mistakes">
      <div className="card-header">
        <span className="card-title">Top Mistakes This Month</span>
        <Link href="/dashboard/mistakes" className="btn btn-ghost btn-sm">
          View All
        </Link>
      </div>
      <div className="card-body">
        {mistakes.length > 0 ? (
          <div>
            {mistakes.map((m) => (
              <div key={m.name} className="mistake-item">
                <div className="mistake-icon" style={{ background: m.color }} />
                <span className="mistake-name">{m.name}</span>
                <span className="mistake-count">{m.count} trades</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted" style={{ textAlign: "center", padding: "var(--space-4)" }}>
            No mistakes tagged yet. Good discipline!
          </p>
        )}
      </div>
    </div>
  );
}
