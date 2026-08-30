"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXCHANGES } from "@/lib/constants";

interface AddExecutionModalProps {
  tradeId: string;
  symbol: string;
  exchange: string;
  direction: string;
  currentPrice?: number | null;
  openQty: number;
  onClose: () => void;
}

export default function AddExecutionModal({ tradeId, symbol, exchange, direction, currentPrice, openQty, onClose }: AddExecutionModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    side: direction === "LONG" ? "SELL" : "BUY", // Default to exit
    quantity: "",
    price: currentPrice ? Number(currentPrice.toFixed(2)).toString() : "",
    executionTime: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  });

  const isCrypto = exchange === "CRYPTO";
  const isExit = form.side === (direction === "LONG" ? "SELL" : "BUY");
  const maxQty = isExit ? openQty : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const quantity = isCrypto ? parseFloat(form.quantity) : parseInt(form.quantity, 10);
      
      if (isExit && quantity > openQty) {
        throw new Error(`Cannot exit more than ${openQty} units`);
      }

      const res = await fetch(`/api/trades/${tradeId}/executions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          side: form.side,
          quantity,
          price: parseFloat(form.price),
          executionTime: form.executionTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add execution");

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add Execution: {symbol}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            
            <div className="form-group">
              <label className="form-label">Side</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`btn ${form.side === "BUY" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setForm({ ...form, side: "BUY" })}
                  style={{ flex: 1, background: form.side === "BUY" ? "var(--color-positive)" : undefined }}
                >
                  BUY {direction === "LONG" ? "(Scale In)" : "(Exit)"}
                </button>
                <button
                  type="button"
                  className={`btn ${form.side === "SELL" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setForm({ ...form, side: "SELL" })}
                  style={{ flex: 1, background: form.side === "SELL" ? "var(--color-negative)" : undefined }}
                >
                  SELL {direction === "SHORT" ? "(Scale In)" : "(Exit)"}
                </button>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="100"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  onKeyDown={(e) => {
                    if (!isCrypto && e.key === '.') {
                      e.preventDefault();
                    }
                  }}
                  required
                  min={isCrypto ? "0" : "1"}
                  max={maxQty}
                  step={isCrypto ? "any" : "1"}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="150.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Execution Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={form.executionTime}
                onChange={(e) => setForm({ ...form, executionTime: e.target.value })}
              />
            </div>

            {error && (
              <div className="login-error" style={{ background: "var(--color-negative-bg)", color: "var(--color-negative)", border: "1px solid var(--color-negative)", marginTop: 0 }}>
                {error}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding..." : "Add Execution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
