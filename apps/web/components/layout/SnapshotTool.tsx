"use client";

import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { usePathname } from "next/navigation";

export default function SnapshotTool({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pathname = usePathname();

  const takeSnapshot = async (action: "download" | "copy" | "copylink" | "newtab" | "tweet") => {
    setIsOpen(false);
    setIsCapturing(true);

    try {
      if (action === "copylink" || action === "tweet") {
        if (!userId) {
          showToast("Error: Cannot generate public link without User ID.");
          setIsCapturing(false);
          return;
        }
        
        const publicUrl = `${window.location.origin}/shared/${userId}${pathname === '/' ? '/journal' : pathname}`;
        
        if (action === "copylink") {
          await navigator.clipboard.writeText(publicUrl);
          showToast("Public share link copied to clipboard!");
        } else if (action === "tweet") {
          const tweetText = encodeURIComponent(`Check out my trading performance on TraderLabs! 📈📊\n${publicUrl}`);
          window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank");
        }
        setIsCapturing(false);
        return;
      }

      // For download, copy, and newtab, we still use html2canvas to generate an image
      const element = document.querySelector(".app-content") as HTMLElement || document.body;
      
      const canvas = await html2canvas(element, { 
        useCORS: true, 
        scale: 2,
        backgroundColor: window.getComputedStyle(document.body).getPropertyValue('--bg-primary') || '#000000',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        width: element.scrollWidth,
        height: element.scrollHeight,
        // Scroll the element to top temporarily before capture if needed, though html2canvas usually handles it with the above options
      });
      
      if (action === "download") {
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `TraderLabs_Snapshot_${new Date().toISOString().split('T')[0]}.png`;
        link.click();
      } else if (action === "copy") {
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob })
              ]);
              showToast("Snapshot copied to clipboard!");
            } catch (err) {
              console.error("Failed to copy image: ", err);
              showToast("Failed to copy image. Browser not supported.");
            }
          }
        }, "image/png");
      } else if (action === "newtab") {
        canvas.toBlob((blob) => {
          if (blob) {
            // Browsers often block data/blob URLs from opening directly, so we write to a new window
            const newWindow = window.open();
            if (newWindow) {
              newWindow.document.write(`<body style="margin:0;display:flex;justify-content:center;background:#0e1117;"><img src="${URL.createObjectURL(blob)}" style="max-width:100%;height:auto;" /></body>`);
              newWindow.document.title = "TraderLabs Snapshot";
            }
          }
        }, "image/png");
      }
    } catch (e) {
      console.error("Failed to capture snapshot:", e);
      showToast("Failed to capture snapshot.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary btn-sm"
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          gap: 6, 
          borderRadius: 20, 
          padding: "6px 14px",
          opacity: isCapturing ? 0.5 : 1,
          cursor: isCapturing ? "not-allowed" : "pointer",
          height: "32px" // Fixed height to perfectly match Ask AI size
        }}
        disabled={isCapturing}
        title="Take a Snapshot"
      >
        {isCapturing ? (
          <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: "8px",
          width: "200px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
          zIndex: 100,
          overflow: "hidden",
          padding: "4px 0"
        }}>
          <button
            onClick={() => takeSnapshot("download")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "8px 16px",
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontSize: "13px",
              cursor: "pointer",
              textAlign: "left"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "var(--border-secondary)"}
            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download image
          </button>
          
          <button
            onClick={() => takeSnapshot("copy")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "8px 16px",
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontSize: "13px",
              cursor: "pointer",
              textAlign: "left"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "var(--border-secondary)"}
            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy image
          </button>
          
          <button
            onClick={() => takeSnapshot("copylink")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "8px 16px",
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontSize: "13px",
              cursor: "pointer",
              textAlign: "left"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "var(--border-secondary)"}
            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Copy link
          </button>
          
          <button
            onClick={() => takeSnapshot("newtab")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "8px 16px",
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontSize: "13px",
              cursor: "pointer",
              textAlign: "left"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "var(--border-secondary)"}
            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open in new tab
          </button>
          
          <button
            onClick={() => takeSnapshot("tweet")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "8px 16px",
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontSize: "13px",
              cursor: "pointer",
              textAlign: "left"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "var(--border-secondary)"}
            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
            Tweet Image
          </button>
        </div>
      )}

      {/* Custom Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          padding: "12px 20px",
          borderRadius: "8px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          zIndex: 999999,
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: 500,
          animation: "fadeInUp 0.2s ease-out"
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
