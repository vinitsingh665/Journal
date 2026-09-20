"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard shortcut Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && !loading && inputRef.current) {
      // Small timeout ensures focus is grabbed after the disabled state is fully removed from DOM
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isOpen, loading]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    const userMsg = prompt.trim();
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    
    setMessages(newMessages);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to process AI command");

      if (data.intent === "ASK_CLARIFICATION" || data.data?.intent === "ASK_CLARIFICATION") {
        const msg = data.message || data.data?.message;
        setMessages([...newMessages, { role: "assistant", content: msg }]);
      } else if (data.intent === "GET_QUOTE" || data.data?.intent === "GET_QUOTE") {
        const msg = data.message || data.data?.message;
        setMessages([...newMessages, { role: "assistant", content: msg }]);
      } else if (data.data?.intent === "CREATE_FORM_FILL") {
        const msg = data.data?.message || "Got all the details! Redirecting you to create the trade...";
        setMessages([...newMessages, { role: "assistant", content: msg }]);
        sessionStorage.setItem("aiTradePrefill", JSON.stringify(data.data.data));
        setTimeout(() => {
          setIsOpen(false);
          setMessages([]);
          if (pathname === "/trades/new") {
            window.location.reload();
          } else {
            router.push("/trades/new");
          }
        }, 1500);
      } else if (data.data?.intent === "EDIT_TRADE") {
        setMessages([...newMessages, { role: "assistant", content: data.data.message || "Redirecting you to the edit form..." }]);
        setTimeout(() => {
          setIsOpen(false);
          setMessages([]);
          router.push(`/trades/${data.data.tradeId}`);
        }, 1500);
      } else if (data.data?.intent === "CREATE_MISTAKE") {
        setMessages([...newMessages, { role: "assistant", content: "Got all the details! Redirecting you to log the mistake..." }]);
        sessionStorage.setItem("aiMistakePrefill", JSON.stringify(data.data.data));
        setTimeout(() => {
          setIsOpen(false);
          setMessages([]);
          if (pathname === "/mistakes") {
            window.location.reload();
          } else {
            router.push("/mistakes");
          }
        }, 1500);
      } else if (data.data?.intent === "CALCULATE_RISK") {
        const msg = data.data?.message || "Got it! Redirecting you to the Risk Calculator...";
        setMessages([...newMessages, { role: "assistant", content: msg }]);
        sessionStorage.setItem("aiRiskPrefill", JSON.stringify(data.data.data));
        setTimeout(() => {
          setIsOpen(false);
          setMessages([]);
          if (pathname === "/risk-calculator") {
            window.location.reload();
          } else {
            router.push("/risk-calculator");
          }
        }, 1500);
      } else if (data.data?.intent === "EXPORT_SCREENSHOT" || data.intent === "EXPORT_SCREENSHOT") {
        setMessages([...newMessages, { role: "assistant", content: "Taking a screenshot... Please wait a moment." }]);
        setIsOpen(false); // Hide AI assistant temporarily
        
        setTimeout(async () => {
          try {
            const element = document.querySelector(".app-content") as HTMLElement || document.body;
            const resolvedBg = window.getComputedStyle(document.body).backgroundColor;
            const bgColor = (resolvedBg && resolvedBg !== 'rgba(0, 0, 0, 0)' && resolvedBg !== 'transparent')
              ? resolvedBg
              : (document.documentElement.getAttribute('data-theme') === 'dark' ? '#09090B' : '#F5F6FA');

            const canvas = await html2canvas(element, {
              useCORS: true,
              scale: 2,
              backgroundColor: bgColor,
              onclone: (clonedDocument) => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                if (currentTheme) clonedDocument.documentElement.setAttribute('data-theme', currentTheme);
                clonedDocument.body.style.backgroundColor = bgColor;
                const clonedContent = clonedDocument.querySelector('.app-content') as HTMLElement;
                if (clonedContent) clonedContent.style.backgroundColor = bgColor;
                const clonedMain = clonedDocument.querySelector('.app-main') as HTMLElement;
                if (clonedMain) clonedMain.style.backgroundColor = bgColor;
              }
            });
            const imgData = canvas.toDataURL("image/png");
            
            const link = document.createElement("a");
            link.href = imgData;
            link.download = `TradingJournal_Screenshot_${new Date().toISOString().split('T')[0]}.png`;
            link.click();
            
            setIsOpen(true);
            setMessages([...newMessages, { role: "assistant", content: "Screenshot downloaded successfully!" }]);
          } catch (e) {
            setIsOpen(true);
            setMessages([...newMessages, { role: "assistant", content: "⚠️ Failed to capture screenshot." }]);
          }
        }, 500);
      } else if (data.data?.intent === "EXPORT_PDF" || data.intent === "EXPORT_PDF") {
        setMessages([...newMessages, { role: "assistant", content: "Generating PDF report... Please wait a moment." }]);
        setIsOpen(false); // Hide AI assistant temporarily
        
        setTimeout(async () => {
          try {
            const element = document.querySelector(".app-content") as HTMLElement || document.body;
            const resolvedBg = window.getComputedStyle(document.body).backgroundColor;
            const bgColor = (resolvedBg && resolvedBg !== 'rgba(0, 0, 0, 0)' && resolvedBg !== 'transparent')
              ? resolvedBg
              : (document.documentElement.getAttribute('data-theme') === 'dark' ? '#09090B' : '#F5F6FA');

            const canvas = await html2canvas(element, {
              useCORS: true,
              scale: 2,
              backgroundColor: bgColor,
              onclone: (clonedDocument) => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                if (currentTheme) clonedDocument.documentElement.setAttribute('data-theme', currentTheme);
                clonedDocument.body.style.backgroundColor = bgColor;
                const clonedContent = clonedDocument.querySelector('.app-content') as HTMLElement;
                if (clonedContent) clonedContent.style.backgroundColor = bgColor;
                const clonedMain = clonedDocument.querySelector('.app-main') as HTMLElement;
                if (clonedMain) clonedMain.style.backgroundColor = bgColor;
              }
            });
            const imgData = canvas.toDataURL("image/png");
            
            const pdf = new jsPDF({
              orientation: canvas.width > canvas.height ? "landscape" : "portrait",
              unit: "px",
              format: [canvas.width, canvas.height]
            });
            
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save(`TradingJournal_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            
            setIsOpen(true);
            setMessages([...newMessages, { role: "assistant", content: "PDF downloaded successfully!" }]);
          } catch (e) {
            setIsOpen(true);
            setMessages([...newMessages, { role: "assistant", content: "⚠️ Failed to generate PDF." }]);
          }
        }, 500);
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.message || "Command executed successfully." }]);
        setTimeout(() => {
          setIsOpen(false);
          setMessages([]);
          router.refresh(); 
        }, 2000);
      }
    } catch (err: any) {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-secondary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: 6, borderRadius: 20, padding: "6px 14px" }}
          title="Ask AI (Cmd/Ctrl + K)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span style={{ fontWeight: 600, fontSize: "var(--text-xs)", background: "linear-gradient(45deg, var(--accent-primary), #d946ef)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Ask AI
          </span>
          <span className="text-muted" style={{ fontSize: 10, marginLeft: 4 }}>⌘K</span>
        </button>
      </div>

      {isOpen && mounted && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, width: 0, height: 0, zIndex: 99999 }}>
          <Rnd
            default={{
              x: windowWidth - 480, // Default to right side
              y: 80,
              width: 450,
              height: 500,
            }}
            minWidth={300}
            minHeight={300}
            bounds="window"
            dragHandleClassName="ai-drag-handle"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <div 
              style={{ 
                width: "100%", 
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "var(--bg-primary)", 
                borderRadius: "16px", 
                border: "1px solid var(--border-color)", 
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", 
                overflow: "hidden" 
              }}
            >
              {/* Header / Drag Handle */}
              <div 
                className="ai-drag-handle"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "var(--bg-secondary)",
                  borderBottom: "1px solid var(--border-color)",
                  cursor: "grab",
                  userSelect: "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Groq AI Assistant</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-icon btn-sm"
                  style={{ width: 24, height: 24 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Chat History Area */}
              <div 
                ref={chatScrollRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: 40, fontSize: "var(--text-sm)" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto", marginBottom: 12, opacity: 0.5 }}>
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    Tell me about a trade or mistake you made. <br/> I'll ask for any missing details before logging it!
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} style={{ 
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      background: msg.role === "user" ? "#8b5cf6" : "var(--bg-secondary)",
                      color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                      padding: "8px 14px",
                      borderRadius: "16px",
                      borderBottomRightRadius: msg.role === "user" ? "4px" : "16px",
                      borderBottomLeftRadius: msg.role === "assistant" ? "4px" : "16px",
                      maxWidth: "85%",
                      fontSize: "var(--text-sm)",
                      lineHeight: 1.4
                    }}>
                      {msg.content}
                    </div>
                  ))
                )}
                {loading && (
                  <div style={{ alignSelf: "flex-start", background: "var(--bg-secondary)", padding: "10px 14px", borderRadius: "16px", borderBottomLeftRadius: "4px" }}>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border-color)", background: "var(--bg-primary)" }}>
                <div style={{ position: "relative", display: "flex", alignItems: "flex-end" }}>
                  <textarea
                    ref={inputRef}
                    placeholder="Type your message..."
                    value={prompt}
                    rows={1}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    style={{
                      width: "100%",
                      minHeight: "40px",
                      maxHeight: "120px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "20px",
                      background: "var(--bg-secondary)",
                      fontSize: "var(--text-sm)",
                      outline: "none",
                      color: "var(--text-primary)",
                      resize: "none",
                      padding: "10px 42px 10px 16px",
                      lineHeight: 1.4,
                      overflowY: "auto"
                    }}
                  />
                  
                  <button 
                    onClick={() => handleSubmit()}
                    className="btn btn-primary btn-icon" 
                    disabled={!prompt.trim() || loading} 
                    style={{ 
                      position: "absolute", 
                      right: 4, 
                      bottom: 4,  
                      borderRadius: "50%", 
                      width: 32, 
                      height: 32, 
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: prompt.trim() ? "#8b5cf6" : "var(--border-color)", 
                      color: "#fff", 
                      border: "none",
                      cursor: prompt.trim() && !loading ? "pointer" : "default"
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </Rnd>
        </div>,
        document.body
      )}
    </>
  );
}
