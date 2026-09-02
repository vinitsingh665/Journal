"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/utils";

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState("");
  const [preview, setPreview] = useState<{
    totalRows: number;
    headers: string[];
    sampleRows: Record<string, string>[];
    detectedFormat: string | null;
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    totalRows: number;
    newExecutions: number;
    duplicates: number;
    errors: number;
    tradesCreated: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setError("");
    setResult(null);

    const text = await f.text();
    setCsvContent(text);

    // Send to preview endpoint
    try {
      const res = await fetch("/api/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f && (f.name.endsWith(".csv") || f.type === "text/csv")) {
        handleFile(f);
      } else {
        setError("Please upload a CSV file");
      }
    },
    [handleFile]
  );

  const handleImport = async () => {
    if (!csvContent) return;
    setImporting(true);
    setError("");

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Import Trades</h1>
      </div>

      {/* Upload Zone */}
      {!preview && !result && (
        <div className="card">
          <div className="card-body">
            <div
              className={`upload-zone ${dragOver ? "drag-over" : ""}`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".csv";
                input.onchange = (e) => {
                  const f = (e.target as HTMLInputElement).files?.[0];
                  if (f) handleFile(f);
                };
                input.click();
              }}
              id="csv-upload-zone"
            >
              <svg className="upload-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <p className="upload-zone-text">
                Drop your CSV file here or click to browse
              </p>
              <p className="upload-zone-hint">
                Supports Zerodha Console, Groww, Angel One, and generic CSV formats
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card mt-4" style={{ borderColor: "var(--color-negative)" }}>
          <div className="card-body" style={{ color: "var(--color-negative)" }}>
            <strong>Error:</strong> {error}
            <button className="btn btn-ghost btn-sm mt-2" onClick={() => { setError(""); setPreview(null); setFile(null); }}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && !result && (
        <div className="card mt-4">
          <div className="card-header">
            <div>
              <span className="card-title">Import Preview</span>
              <span className="card-subtitle" style={{ marginLeft: 8 }}>
                {file?.name}
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <button
                className="btn btn-secondary"
                onClick={() => { setPreview(null); setFile(null); }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleImport}
                disabled={importing}
                id="btn-import"
              >
                {importing ? "Importing..." : `Import ${preview.totalRows} Trades`}
              </button>
            </div>
          </div>

          {/* Format Detection */}
          <div className="card-body" style={{ borderBottom: "1px solid var(--border-secondary)" }}>
            <div className="flex gap-6">
              <div>
                <span className="stat-label">Detected Format</span>
                <div className="stat-value">{preview.detectedFormat || "Generic CSV"}</div>
              </div>
              <div>
                <span className="stat-label">Total Rows</span>
                <div className="stat-value">{preview.totalRows}</div>
              </div>
              <div>
                <span className="stat-label">Columns</span>
                <div className="stat-value">{preview.headers.length}</div>
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {preview.headers.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.sampleRows.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {preview.headers.map((h) => (
                      <td key={h}>{row[h] || ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Result */}
      {result && (
        <div className="card mt-4">
          <div className="card-header">
            <span className="card-title" style={{ color: "var(--color-positive)" }}>
              ✓ Import Complete
            </span>
          </div>
          <div className="card-body">
            <div className="stat-grid">
              <div className="stat-item">
                <span className="stat-label">Total Rows</span>
                <span className="stat-value">{result.totalRows}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">New Executions</span>
                <span className="stat-value text-positive">{result.newExecutions}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Duplicates Skipped</span>
                <span className="stat-value">{result.duplicates}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Trades Created</span>
                <span className="stat-value text-positive">{result.tradesCreated}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn btn-secondary" onClick={() => { setResult(null); setPreview(null); setFile(null); }}>
                Import More
              </button>
              <button className="btn btn-primary" onClick={() => router.push("/trades")}>
                View Trades
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
