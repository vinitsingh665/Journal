"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas";

export default function SnapshotTool({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const takeSnapshot = async (action: "download" | "copy" | "copylink" | "tweet") => {
    setIsOpen(false);
    setIsCapturing(true);

    try {
      if (action === "copylink" || action === "tweet") {
        if (!userId) {
          alert("Error: User ID not found. Cannot generate public link.");
          setIsCapturing(false);
          return;
        }
        try {
          const currentPath = window.location.pathname;
          let cleanPath = currentPath;
          if (cleanPath.startsWith('/dashboard')) {
             cleanPath = cleanPath.replace('/dashboard', '');
          }
          
          const targetPathForDb = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;

          const res = await fetch("/api/shared/generate-link", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetPath: targetPathForDb || null })
          });
          if (!res.ok) throw new Error("Failed to generate link");
          
          const { token } = await res.json();

          const publicUrl = `${window.location.origin}/s/${token}${cleanPath === '/' ? '' : cleanPath}`;
          
          if (action === "copylink") {
            try {
              if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(publicUrl);
              } else {
                throw new Error("clipboard API not available");
              }
            } catch (err) {
              console.error("Clipboard API failed, using fallback:", err);
              const textArea = document.createElement("textarea");
              textArea.value = publicUrl;
              textArea.style.position = "fixed";
              textArea.style.left = "-9999px";
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              try {
                document.execCommand('copy');
              } catch (fallbackErr) {
                console.error("Fallback copy failed:", fallbackErr);
                alert("Failed to copy link. Here it is: " + publicUrl);
              }
              document.body.removeChild(textArea);
            }
            
            setNotification("Link copied! It will expire in 24 hours.");
            setTimeout(() => setNotification(null), 4000);
            setIsCapturing(false);
            return;
          } else if (action === "tweet") {
            const tweetText = encodeURIComponent(`Check out my trading performance on traderlabs.in! 📈📊\n${publicUrl}`);
            window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank");
            
            // Continue below to capture image
          }
        } catch (e) {
          console.error(e);
          alert("Error generating temporary link.");
          setIsCapturing(false);
          return;
        }
      }

      // Capture image for download, copy, and tweet
      setNotification(action === "tweet" ? "Generating snapshot for tweet..." : "Capturing snapshot...");
      const element = document.querySelector(".app-content") as HTMLElement || document.body;
      
      // Resolve the actual background color from the live document — CSS vars can't be
      // reliably read via getPropertyValue from stylesheets in all browsers, but
      // getComputedStyle on the body always returns a resolved rgb() value.
      const resolvedBg = window.getComputedStyle(document.body).backgroundColor;
      // If the body background is transparent (rgba(0,0,0,0)), use a hardcoded dark color
      const bgColor = (resolvedBg && resolvedBg !== 'rgba(0, 0, 0, 0)' && resolvedBg !== 'transparent')
        ? resolvedBg
        : (document.documentElement.getAttribute('data-theme') === 'dark' ? '#09090B' : '#F5F6FA');

      const canvas = await html2canvas(element, { 
        useCORS: true, 
        scale: 2,
        backgroundColor: bgColor,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (clonedDocument) => {
          const currentTheme = document.documentElement.getAttribute('data-theme');
          // Copy data-theme to the cloned html element
          if (currentTheme) {
            clonedDocument.documentElement.setAttribute('data-theme', currentTheme);
          }
          // Explicitly set background on body and .app-content in the clone using
          // the resolved color — this is the only reliable way to prevent white gaps
          clonedDocument.body.style.backgroundColor = bgColor;
          const clonedContent = clonedDocument.querySelector('.app-content') as HTMLElement;
          if (clonedContent) {
            clonedContent.style.backgroundColor = bgColor;
          }
          const clonedMain = clonedDocument.querySelector('.app-main') as HTMLElement;
          if (clonedMain) {
            clonedMain.style.backgroundColor = bgColor;
          }
        }
      });
      
      if (action === "download") {
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `TraderLabs_Snapshot_${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        setNotification("Snapshot downloaded!");
        setTimeout(() => setNotification(null), 3000);
      } else if (action === "copy" || action === "tweet") {
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob })
              ]);
              if (action === "tweet") {
                setNotification("Image copied! Go to the Twitter tab and press Ctrl+V to paste.");
                setTimeout(() => setNotification(null), 8000);
              } else {
                setNotification("Snapshot copied to clipboard!");
                setTimeout(() => setNotification(null), 3000);
              }
            } catch (err) {
              console.error(err);
              setNotification(action === "tweet" 
                ? "Failed to copy image. You might need to allow clipboard permissions." 
                : "Failed to copy image. Please try again.");
              setTimeout(() => setNotification(null), 4000);
            }
          }
        }, "image/png", 1.0);
      }
    } catch (e) {
      console.error("Failed to capture snapshot:", e);
      alert("Failed to capture snapshot.");
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

      {mounted && notification && createPortal(
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999999,
          pointerEvents: "none"
        }}>
          <div style={{
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            padding: "16px 24px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontWeight: 500,
            animation: "fadeIn 0.2s ease-out",
            pointerEvents: "auto"
          }}>
            <div style={{ 
              background: "rgba(16, 185, 129, 0.1)", 
              color: "#10b981", 
              borderRadius: "50%", 
              width: 32, 
              height: 32, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            {notification}
            <button 
              onClick={() => setNotification(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                marginLeft: "8px",
                padding: "4px",
                display: "flex"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
