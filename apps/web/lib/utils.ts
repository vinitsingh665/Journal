// ─── CURRENCY FORMATTING ────────────────────────────

export function formatINR(
  value: number,
  opts?: { compact?: boolean; showSign?: boolean }
): string {
  const { compact = false, showSign = false } = opts || {};

  if (compact) {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : showSign && value > 0 ? "+" : "";
    if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
    if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L`;
    if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`;
    return `${sign}₹${abs.toFixed(2)}`;
  }

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  if (showSign && value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted.replace("₹", "₹")}`;
  return formatted;
}

// ─── NUMBER FORMATTING ──────────────────────────────

export function formatNumber(
  value: number,
  decimals: number = 2
): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(
  value: number,
  showSign: boolean = true
): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

// ─── DATE FORMATTING ────────────────────────────────

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)}, ${formatTime(date)}`;
}

export function formatHoldingPeriod(ms: number | bigint | null): string {
  if (!ms) return "—";
  const totalMs = Number(ms);
  const totalMinutes = totalMs / (1000 * 60);
  
  if (totalMinutes < 60) return `${Math.round(totalMinutes)}m`;
  
  const totalHours = totalMinutes / 60;
  if (totalHours < 24) return `${Math.round(totalHours)}h`;
  
  const days = Math.floor(totalHours / 24);
  const hours = Math.round(totalHours % 24);
  if (days === 1) return hours > 0 ? `1d ${hours}h` : "1d";
  return `${days}d`;
}

// ─── TRADE HELPERS ──────────────────────────────────

export function getPnlClass(value: number): string {
  if (value > 0) return "text-positive";
  if (value < 0) return "text-negative";
  return "";
}

export function getDirectionBadge(direction: string): string {
  return direction === "LONG" ? "badge-long" : "badge-short";
}

export function getStatusBadge(status: string): string {
  switch (status) {
    case "OPEN": return "badge-open";
    case "CLOSED": return "badge-closed";
    case "PARTIAL": return "badge-partial";
    default: return "";
  }
}

// ─── MISC ───────────────────────────────────────────

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
