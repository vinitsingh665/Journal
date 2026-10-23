"use client";

import { LATEST_VERSION } from "@/app/about/changelog/ChangelogClient";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeProvider";
import {
  Activity,
  User,
  TrendingUp,
  Zap,
  Palette,
  Info,
  Check,
  Moon,
  Sun,
  Monitor,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  Camera,
  ChevronRight,
  Shield,
  Sliders,
  DollarSign,
  Percent,
  Lock,
  Sparkles
} from "lucide-react";

interface SettingsClientProps {
  user: { name?: string | null; email?: string | null; isGuest?: boolean };
  initialSettings: any;
}

export default function SettingsClient({ user, initialSettings }: SettingsClientProps) {
  const router = useRouter();
  const { theme, setTheme, accent, setAccent } = useTheme();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams?.get("tab") || "General");
  const [mobileTab, setMobileTab] = useState<"Profile" | "Trading" | "Broker API" | "Appearance" | "About">("Profile");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDhanToken, setShowDhanToken] = useState(false);
  const [mobileAvatarPicker, setMobileAvatarPicker] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.href = "/login";
      } else {
        alert("Failed to delete account.");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting account", error);
      alert("Failed to delete account.");
      setIsDeleting(false);
    }
  };

  // Form states (mocked + real)
  const isGuest = user.isGuest === true;
  const [name, setName] = useState(user.name || "Trader");
  const [email] = useState(user.email || "trader@example.com"); // Email is not editable
  const [tradingStyle, setTradingStyle] = useState(initialSettings?.tradingStyle || "Swing Trading");
  const [experience, setExperience] = useState("Intermediate");
  const [about, setAbout] = useState(initialSettings?.about || "Focus on price action, VCP setups and volume analysis.");
  const [avatar, setAvatar] = useState(initialSettings?.avatar || "");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const PREDEFINED_AVATARS = [
    // Notionists (Clean, Notion-style)
    "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Jack&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Jude&backgroundColor=d1d4f9",
    // Micah (Stylish, modern illustration)
    "https://api.dicebear.com/7.x/micah/svg?seed=Oliver&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/micah/svg?seed=Sasha&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/micah/svg?seed=Max&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/micah/svg?seed=Luna&backgroundColor=ffd5dc",
    // Avataaars (Classic cartoon heads)
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper&backgroundColor=ffd5dc",
    // Adventurer (Fun, playful characters)
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Cookie&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Peanut&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Oreo&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Muffin&backgroundColor=d1d4f9",
    // Bottts (Cute robots)
    "https://api.dicebear.com/7.x/bottts/svg?seed=Shadow&backgroundColor=ffd5dc",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Spark&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Bolt&backgroundColor=ffdfbf",
    // Miniavs (Minimalist characters)
    "https://api.dicebear.com/7.x/miniavs/svg?seed=Finn&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/miniavs/svg?seed=Sam&backgroundColor=ffd5dc",
    "https://api.dicebear.com/7.x/miniavs/svg?seed=Charlie&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/miniavs/svg?seed=Alex&backgroundColor=ffdfbf"
  ];

  const [defaultAccount, setDefaultAccount] = useState("Main Trading Account");
  const [defaultTimeframe, setDefaultTimeframe] = useState("1 Day");
  const [defaultMarket, setDefaultMarket] = useState("NSE");
  const [dateFormat, setDateFormat] = useState("31 Aug 2026 (DD MMM YYYY)");
  const [timeFormat, setTimeFormat] = useState("12 Hour (01:30 PM)");
  const [currency, setCurrency] = useState(initialSettings?.currency || "INR (â‚¹)");
  const [showPnlIn, setShowPnlIn] = useState("Currency");

  // Quick settings states
  const [autoCalculateR, setAutoCalculateR] = useState(true);
  const [markHolidays, setMarkHolidays] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(true);
  const [enableAi, setEnableAi] = useState(true);
  const [syncDevices, setSyncDevices] = useState(false);

  // Additional settings states
  const [defaultCapital, setDefaultCapital] = useState(initialSettings?.defaultCapital || 500000);
  const [defaultRisk, setDefaultRisk] = useState("1.0");
  const [defaultRR, setDefaultRR] = useState("2.0");
  const [maxDailyLoss, setMaxDailyLoss] = useState("5000");
  const [defaultBrokerFee, setDefaultBrokerFee] = useState("20");
  const [deductFees, setDeductFees] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState("Hourly");
  const [emailSummary, setEmailSummary] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  
  // Integrations
  const [dhanClientId, setDhanClientId] = useState(initialSettings?.dhanClientId || "");
  const [dhanAccessToken, setDhanAccessToken] = useState(initialSettings?.dhanAccessToken || "");

  // Security / Password states
  const [currentPassword, setCurrentPassword] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("user_pwd") || localStorage.getItem("user_pwd") || "";
    }
    return "";
  });
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const currentPwdRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("user_pwd") || localStorage.getItem("user_pwd");
      if (saved) {
        setCurrentPassword(saved);
      }
    }
    const timer = setTimeout(() => {
      if (currentPwdRef.current?.value && !currentPassword) {
        setCurrentPassword(currentPwdRef.current.value);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdatePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPassword) {
      setPasswordStatus({ type: "error", message: "Please enter a new password." });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordStatus({ type: "error", message: "Password must be at least 4 characters long." });
      return;
    }
    setPasswordLoading(true);
    setPasswordStatus(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordStatus({ type: "error", message: data.error || "Failed to update password." });
        return;
      }
      setPasswordStatus({ type: "success", message: "Password updated successfully!" });
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("user_pwd", newPassword);
          localStorage.setItem("user_pwd", newPassword);
        } catch {}
      }
      setCurrentPassword(newPassword);
      setNewPassword("");
    } catch {
      setPasswordStatus({ type: "error", message: "Failed to connect to server. Please try again." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = ["General", "Trading", "Import & Sync", "Notifications", "Security", "Billing", "Data & Export", "Appearance", "About"];

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, tradingStyle, about, avatar, defaultCapital: Number(defaultCapital), dhanClientId, dhanAccessToken }),
      });

      if (res.ok) {
        // Refresh the router so the layout (Sidebar/Topbar) refetches the user
        router.refresh();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save settings", error);
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ active, onChange }: { active: boolean, onChange: (val: boolean) => void }) => (
    <div className={cn("settings-toggle", active && "active")} onClick={() => !isGuest && onChange(!active)}>
      <div className="settings-toggle-knob"></div>
    </div>
  );

  return (
    <div>
      {/* Toast Notification */}
      {saveSuccess && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#10B981',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontWeight: 600,
          animation: 'toastSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <style>{`
            @keyframes toastSlideUp {
              0% { transform: translate(-50%, 100%); opacity: 0; }
              100% { transform: translate(-50%, 0); opacity: 1; }
            }
          `}</style>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Settings saved successfully
        </div>
      )}

      {/* Desktop View */}
      <div className="settings-desktop-view">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, margin: 0 }}>Settings {isGuest && <span style={{ fontSize: "0.8rem", background: "var(--color-primary)", color: "white", padding: "2px 8px", borderRadius: "10px", marginLeft: "8px" }}>Guest Mode</span>}</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Manage your account, preferences and application settings.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || isGuest}>
          {saving ? "Saving..." : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "var(--space-4)", borderBottom: "1px solid var(--border-secondary)", marginBottom: "var(--space-6)", overflowX: "auto" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "var(--space-3) var(--space-2)",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid var(--accent-primary)" : "2px solid transparent",
              color: activeTab === tab ? "var(--accent-primary)" : "var(--text-secondary)",
              fontWeight: activeTab === tab ? 600 : 500,
              fontSize: "var(--text-sm)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              whiteSpace: "nowrap",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {isGuest && activeTab === "General" && (
          <div style={{ marginBottom: "var(--space-4)", padding: "var(--space-3)", background: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.3)", borderRadius: "var(--radius-md)", color: "#b45309", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>Profile settings cannot be changed in Guest mode. Please create an account to customize your profile.</span>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "General" ? (
          <div className="settings-grid">
            {/* LEFT COLUMN */}
            <div className="settings-section">

              {/* PROFILE CARD */}
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>PROFILE</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Update your profile information and preferences.</p>

                <div className="card card-body">
                  <div style={{ display: "flex", gap: "var(--space-5)", marginBottom: "var(--space-5)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", width: "120px" }}>
                      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid var(--border-secondary)" }}>
                        {avatar ? (
                          <img src={avatar} alt="Profile Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        )}
                      </div>
                      <div className="avatar-actions" style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ width: "100%", padding: "6px 8px" }}
                          onClick={() => !isGuest && setShowAvatarPicker(!showAvatarPicker)}
                          disabled={isGuest}
                        >
                          Change Photo
                        </button>
                        <button className="btn btn-secondary btn-sm" style={{ padding: "6px 8px", color: "var(--color-negative)" }} onClick={() => !isGuest && setAvatar("")} disabled={isGuest}>
                          Remove
                        </button>
                      </div>
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                      {showAvatarPicker && (
                        <div style={{ marginBottom: "var(--space-2)", padding: "var(--space-4)", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-secondary)" }}>
                          <p style={{ fontSize: "var(--text-sm)", fontWeight: 500, marginBottom: "var(--space-3)", color: "var(--text-secondary)" }}>Choose an Avatar</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
                            {PREDEFINED_AVATARS.map((url, i) => (
                              <button
                                key={i}
                                onClick={() => { setAvatar(url); setShowAvatarPicker(false); }}
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  borderRadius: "50%",
                                  padding: 0,
                                  border: avatar === url ? "3px solid var(--accent-primary)" : "1px solid var(--border-secondary)",
                                  overflow: "hidden",
                                  cursor: "pointer",
                                  transition: "all var(--transition-fast)",
                                  background: "var(--bg-primary)"
                                }}
                              >
                                <img src={url} alt={`Avatar option ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "var(--space-4)" }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Name</label>
                          <input className="form-input" value={name} onChange={e => setName(e.target.value)} disabled={isGuest} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Email</label>
                          <input
                            className="form-input"
                            value={email}
                            readOnly
                            title="Your login email cannot be changed"
                            style={{
                              backgroundColor: "var(--bg-secondary)",
                              color: "var(--text-muted)",
                              cursor: "not-allowed",
                              opacity: 0.7
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "var(--space-4)" }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Trading Style</label>
                          <select className="form-select" value={tradingStyle} onChange={e => setTradingStyle(e.target.value)} disabled={isGuest}>
                            <option>Swing Trading</option>
                            <option>Day Trading</option>
                            <option>Position Trading</option>
                            <option>Scalping</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Experience Level</label>
                          <select className="form-select" value={experience} onChange={e => setExperience(e.target.value)} disabled={isGuest}>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                            <option>Professional</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">About</label>
                    <textarea className="form-input form-textarea" value={about} onChange={e => setAbout(e.target.value)} disabled={isGuest}></textarea>
                  </div>
                </div>
              </div>

              {/* PREFERENCES CARD */}
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>PREFERENCES</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Customize your default settings and behavior.</p>

                <div className="card card-body" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Default Account
                      </div>
                      <div className="settings-row-desc">Select the account to show by default.</div>
                    </div>
                    <select className="form-select" value={defaultAccount} onChange={e => setDefaultAccount(e.target.value)} style={{ width: 220 }} disabled={isGuest}>
                      <option>Main Trading Account</option>
                      <option>Retirement Account</option>
                    </select>
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Default Timeframe
                      </div>
                      <div className="settings-row-desc">Select the timeframe for charts by default.</div>
                    </div>
                    <select className="form-select" value={defaultTimeframe} onChange={e => setDefaultTimeframe(e.target.value)} style={{ width: 220 }} disabled={isGuest}>
                      <option>1 Day</option>
                      <option>1 Week</option>
                      <option>1 Month</option>
                      <option>15 Min</option>
                    </select>
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        Default Market
                      </div>
                      <div className="settings-row-desc">Select the market you primarily trade.</div>
                    </div>
                    <select className="form-select" value={defaultMarket} onChange={e => setDefaultMarket(e.target.value)} style={{ width: 220 }} disabled={isGuest}>
                      <option>NSE</option>
                      <option>BSE</option>
                      <option>NASDAQ</option>
                      <option>NYSE</option>
                      <option>CRYPTO</option>
                    </select>
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Date Format
                      </div>
                      <div className="settings-row-desc">Choose your preferred date format.</div>
                    </div>
                    <select className="form-select" value={dateFormat} onChange={e => setDateFormat(e.target.value)} style={{ width: 220 }} disabled={isGuest}>
                      <option>31 Aug 2026 (DD MMM YYYY)</option>
                      <option>08/31/2026 (MM/DD/YYYY)</option>
                      <option>31/08/2026 (DD/MM/YYYY)</option>
                      <option>2026-08-31 (YYYY-MM-DD)</option>
                    </select>
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        Time Format
                      </div>
                      <div className="settings-row-desc">Choose your preferred time format.</div>
                    </div>
                    <select className="form-select" value={timeFormat} onChange={e => setTimeFormat(e.target.value)} style={{ width: 220 }} disabled={isGuest}>
                      <option>12 Hour (01:30 PM)</option>
                      <option>24 Hour (13:30)</option>
                    </select>
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        Currency
                      </div>
                      <div className="settings-row-desc">Choose your preferred currency.</div>
                    </div>
                    <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: 220 }} disabled={isGuest}>
                      <option>INR (â‚¹)</option>
                      <option>USD ($)</option>
                      <option>EUR (â‚¬)</option>
                      <option>GBP (Â£)</option>
                    </select>
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        Show P&L in
                      </div>
                      <div className="settings-row-desc">Choose how you want to see P&L values.</div>
                    </div>
                    <div className="segmented-control" style={{ width: 220 }}>
                      <button
                        className={cn("segmented-btn", showPnlIn === "Currency" && "active")}
                        onClick={() => !isGuest && setShowPnlIn("Currency")}
                        style={{ flex: 1 }}
                        disabled={isGuest}
                      >Currency</button>
                      <button
                        className={cn("segmented-btn", showPnlIn === "R Multiple" && "active")}
                        onClick={() => !isGuest && setShowPnlIn("R Multiple")}
                        style={{ flex: 1 }}
                        disabled={isGuest}
                      >R Multiple</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="settings-section">

              {/* ACCOUNT SUMMARY */}
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>ACCOUNT SUMMARY</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Your current plan and usage overview.</p>

                <div className="card card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "var(--radius-lg)", background: "var(--accent-primary-light)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M22 4v16M4 4l8 4 8-4M4 20l8-4 8 4M12 8v8" /></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--text-primary)" }}>Pro Plan</div>
                        <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>Renews on 12 Sep 2026</div>
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ color: "var(--accent-primary)", borderColor: "var(--border-secondary)", boxShadow: "var(--shadow-sm)" }}>Manage Plan</button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-5)" }}>
                    <div>
                      <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 4, fontWeight: 500 }}>Trades</div>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>1,248 / 5,000</div>
                      <div className="settings-progress-bar-bg">
                        <div className="settings-progress-bar-fill" style={{ width: "25%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 4, fontWeight: 500 }}>Storage</div>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>2.4 GB / 10 GB</div>
                      <div className="settings-progress-bar-bg">
                        <div className="settings-progress-bar-fill" style={{ width: "24%", background: "var(--accent-primary)" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 4, fontWeight: 500 }}>AI Credits</div>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>3,250 / 10,000</div>
                      <div className="settings-progress-bar-bg">
                        <div className="settings-progress-bar-fill" style={{ width: "32%", background: "var(--accent-primary)" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK SETTINGS */}
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>QUICK SETTINGS</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Enable or disable key features.</p>

                <div className="card card-body">
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                        Auto Calculate R-Multiple
                      </div>
                      <div className="settings-row-desc">Automatically calculate R based on risk and reward.</div>
                    </div>
                    <Toggle active={autoCalculateR} onChange={setAutoCalculateR} />
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        Mark Market Holidays
                      </div>
                      <div className="settings-row-desc">Show market holidays on calendar.</div>
                    </div>
                    <Toggle active={markHolidays} onChange={setMarkHolidays} />
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Confirm Before Deleting
                      </div>
                      <div className="settings-row-desc">Show confirmation dialog before deleting trades.</div>
                    </div>
                    <Toggle active={confirmDelete} onChange={setConfirmDelete} />
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
                        Enable AI Insights
                      </div>
                      <div className="settings-row-desc">Get AI powered insights and suggestions.</div>
                    </div>
                    <Toggle active={enableAi} onChange={setEnableAi} />
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.25-4.28"></path></svg>
                        Sync Across Devices
                      </div>
                      <div className="settings-row-desc">Keep your data synchronized across devices.</div>
                    </div>
                    <Toggle active={syncDevices} onChange={setSyncDevices} />
                  </div>
                </div>
              </div>

              {/* DANGER ZONE */}
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>DANGER ZONE</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Irreversible and dangerous actions.</p>

                <div className="card card-body settings-danger-card">
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Clear Local Cache
                      </div>
                      <div className="settings-row-desc">Remove temporary files and cached data.</div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>Clear Cache</button>
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title settings-danger-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        Delete Account
                      </div>
                      <div className="settings-row-desc">Permanently delete your account and all data.</div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: "var(--color-negative)", borderColor: "rgba(239, 68, 68, 0.2)", fontWeight: 600, background: "rgba(239, 68, 68, 0.05)" }}
                      onClick={() => !isGuest && setShowDeleteConfirm(true)}
                      disabled={isGuest}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Trading" ? (
          <div className="settings-grid">
            <div className="settings-section">
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>RISK MANAGEMENT</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Configure your default risk parameters.</p>

                <div className="card card-body" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Default Trading Capital</div>
                      <div className="settings-row-desc">Your total available trading capital.</div>
                    </div>
                    <input type="number" className="form-input" style={{ width: 120 }} value={defaultCapital} onChange={e => setDefaultCapital(e.target.value)} disabled={isGuest} />
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Default Risk per Trade (%)</div>
                      <div className="settings-row-desc">Used for auto-calculating position sizes.</div>
                    </div>
                    <input type="number" className="form-input" style={{ width: 120 }} value={defaultRisk} onChange={e => setDefaultRisk(e.target.value)} disabled={isGuest} />
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Default R:R Target</div>
                      <div className="settings-row-desc">Your minimum expected reward-to-risk ratio.</div>
                    </div>
                    <input type="number" className="form-input" style={{ width: 120 }} value={defaultRR} onChange={e => setDefaultRR(e.target.value)} disabled={isGuest} />
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Max Daily Loss Limit</div>
                      <div className="settings-row-desc">Get warned when you hit this loss threshold.</div>
                    </div>
                    <input type="number" className="form-input" style={{ width: 120 }} value={maxDailyLoss} onChange={e => setMaxDailyLoss(e.target.value)} disabled={isGuest} />
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>FEES & COMMISSIONS</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Manage broker fees for accurate P&L tracking.</p>

                <div className="card card-body" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Default Broker Fee (Per side)</div>
                      <div className="settings-row-desc">Flat fee applied to every buy/sell order.</div>
                    </div>
                    <input type="number" className="form-input" style={{ width: 120 }} value={defaultBrokerFee} onChange={e => setDefaultBrokerFee(e.target.value)} disabled={isGuest} />
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Auto-deduct Fees</div>
                      <div className="settings-row-desc">Automatically subtract estimated fees from Net P&L.</div>
                    </div>
                    <Toggle active={deductFees} onChange={setDeductFees} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Import & Sync" ? (
          <div className="settings-grid">
            <div className="settings-section">
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>BROKER CONNECTIONS</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Link your brokers for automatic trade syncing.</p>

                <div className="card card-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", width: "100%" }}>
                      <div style={{ width: 40, height: 40, background: "#f8f9fa", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#119933" }}>D</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>DhanHQ (Real-Time API)</span>
                          {dhanClientId && dhanAccessToken ? (
                            <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "2px 8px", borderRadius: "10px" }}>Configured</span>
                          ) : (
                            <span style={{ fontSize: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "2px 8px", borderRadius: "10px" }}>Not Configured</span>
                          )}
                        </div>
                        <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: "var(--space-3)" }}>
                          Sync your trades instantly using Dhan's free trading API.
                        </div>
                        <div style={{ display: "flex", gap: "var(--space-3)" }}>
                          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: "0.75rem" }}>Client ID</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              style={{ padding: "6px 10px", fontSize: "0.85rem" }} 
                              placeholder="1100XXXXX"
                              value={dhanClientId}
                              onChange={(e) => setDhanClientId(e.target.value)}
                              disabled={isGuest}
                            />
                          </div>
                          <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: "0.75rem" }}>Access Token</label>
                            <input 
                              type="password" 
                              className="form-input" 
                              style={{ padding: "6px 10px", fontSize: "0.85rem" }} 
                              placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                              value={dhanAccessToken}
                              onChange={(e) => setDhanAccessToken(e.target.value)}
                              disabled={isGuest}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                      <div style={{ width: 40, height: 40, background: "#f3ba2f", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#000" }}>B</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>Binance</div>
                        <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>Not connected</div>
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" disabled={isGuest}>Connect</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="settings-section">
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>SYNC SETTINGS</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Configure background synchronization.</p>

                <div className="card card-body" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Background Auto-Sync</div>
                      <div className="settings-row-desc">Automatically fetch new trades from connected brokers.</div>
                    </div>
                    <Toggle active={autoSync} onChange={setAutoSync} />
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Sync Frequency</div>
                      <div className="settings-row-desc">How often to check for new data.</div>
                    </div>
                    <select className="form-select" style={{ width: 150 }} value={syncFrequency} onChange={e => setSyncFrequency(e.target.value)} disabled={isGuest}>
                      <option>Live (Real-time)</option>
                      <option>Hourly</option>
                      <option>Daily</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Notifications" ? (
          <div className="settings-grid">
            <div className="settings-section">
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>EMAIL NOTIFICATIONS</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Control what we send to your inbox.</p>

                <div className="card card-body" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Daily Summary</div>
                      <div className="settings-row-desc">Receive a summary of your P&L at the end of each day.</div>
                    </div>
                    <Toggle active={emailSummary} onChange={setEmailSummary} />
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Risk Alerts</div>
                      <div className="settings-row-desc">Get notified when you hit your daily loss limit.</div>
                    </div>
                    <Toggle active={emailAlerts} onChange={setEmailAlerts} />
                  </div>
                </div>
              </div>
            </div>
            <div className="settings-section">
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>APP NOTIFICATIONS</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>In-app alerts and sounds.</p>

                <div className="card card-body" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Push Notifications</div>
                      <div className="settings-row-desc">Browser notifications for trade executions.</div>
                    </div>
                    <Toggle active={pushNotifications} onChange={setPushNotifications} />
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Sound Effects</div>
                      <div className="settings-row-desc">Play sounds when a trade is opened or closed.</div>
                    </div>
                    <Toggle active={soundEffects} onChange={setSoundEffects} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Security" ? (
          <div className="settings-grid">
            <div className="settings-section">
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>AUTHENTICATION</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Manage your password and security settings.</p>

                <div className="card card-body" style={{ display: "flex", flexDirection: "column" }}>
                  <form onSubmit={handleUpdatePassword} autoComplete="on" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    {/* Hidden username for browser password manager association */}
                    <input type="text" name="username" value={email} autoComplete="username" style={{ display: "none" }} readOnly />

                    {passwordStatus && (
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          backgroundColor: passwordStatus.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                          color: passwordStatus.type === "success" ? "#10B981" : "#EF4444",
                          border: `1px solid ${passwordStatus.type === "success" ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
                        }}
                      >
                        {passwordStatus.message}
                      </div>
                    )}

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="currentPassword" style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>
                        Current Password
                      </label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                          ref={currentPwdRef}
                          id="currentPassword"
                          name="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          className="form-input"
                          style={{ width: "100%", paddingRight: "40px" }}
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          onFocus={(e) => {
                            if (e.target.value && e.target.value !== currentPassword) {
                              setCurrentPassword(e.target.value);
                            }
                          }}
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px",
                          }}
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="newPassword" style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>
                        New Password
                      </label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                          id="newPassword"
                          name="new-password"
                          type={showNewPassword ? "text" : "password"}
                          className="form-input"
                          style={{ width: "100%", paddingRight: "40px" }}
                          placeholder="Enter new password (min. 4 characters)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                          minLength={4}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px",
                          }}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ paddingTop: "var(--space-2)" }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={passwordLoading}
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                      >
                        {passwordLoading ? (
                          <>
                            <RefreshCw size={15} className="animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="settings-section">
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>ACTIVE SESSIONS</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Devices currently logged into your account.</p>

                <div className="card card-body">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "var(--space-3)", borderBottom: "1px solid var(--border-secondary)", marginBottom: "var(--space-3)" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Windows PC • Chrome</div>
                      <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>Mumbai, India (Current)</div>
                    </div>
                    <span className="badge badge-open">Active</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>iPhone 14 • Safari</div>
                      <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>Mumbai, India (2 hours ago)</div>
                    </div>
                    <button className="btn btn-secondary btn-sm">Revoke</button>
                  </div>
                  <button className="btn btn-secondary mt-4" style={{ width: "100%", color: "var(--color-negative)" }}>Revoke All Other Sessions</button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Billing" ? (
          <div className="settings-grid">
            <div className="settings-section">
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>SUBSCRIPTION</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Manage your plan and billing cycle.</p>

                <div className="card card-body" style={{ background: "linear-gradient(135deg, rgba(var(--accent-primary-rgb), 0.05), transparent)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-6)" }}>
                    <div>
                      <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: "0 0 4px 0", color: "var(--accent-primary)" }}>Pro Plan</h3>
                      <p className="text-muted" style={{ margin: 0, fontSize: "var(--text-sm)" }}>Billed annually (â‚¹2,999/yr)</p>
                    </div>
                    <span className="badge badge-long">Active</span>
                  </div>

                  <div style={{ marginBottom: "var(--space-6)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>Usage: AI Analysis Credits</span>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>32%</span>
                    </div>
                    <div className="settings-progress-bar-bg" style={{ height: 8 }}>
                      <div className="settings-progress-bar-fill" style={{ width: "32%", background: "var(--accent-primary)" }}></div>
                    </div>
                    <div className="text-muted mt-2" style={{ fontSize: "var(--text-xs)" }}>3,250 of 10,000 credits used. Resets on 12 Sep.</div>
                  </div>

                  <div style={{ display: "flex", gap: "var(--space-3)" }}>
                    <button className="btn btn-primary">Change Plan</button>
                    <button className="btn btn-secondary">Cancel Subscription</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>PAYMENT METHOD</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Manage your credit cards.</p>

                <div className="card card-body">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-3)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-4)" }}>
                    <div style={{ width: 40, height: 28, background: "#1a1f36", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 10, fontStyle: "italic" }}>VISA</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ 4242</div>
                      <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>Expires 12/28</div>
                    </div>
                    <button className="btn btn-ghost btn-sm">Edit</button>
                  </div>
                  <button className="btn btn-secondary" style={{ width: "100%" }}>+ Add New Method</button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Data & Export" ? (
          <div className="settings-grid">
            <div className="settings-section">
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>EXPORT TRADES</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Download your trading history for taxes or external analysis.</p>

                <div className="card card-body">
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">CSV Export</div>
                      <div className="settings-row-desc">Raw trade data in spreadsheet format.</div>
                    </div>
                    <button className="btn btn-secondary btn-sm">Download CSV</button>
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">PDF Tax Report</div>
                      <div className="settings-row-desc">Formatted document with total P&L and fees.</div>
                    </div>
                    <button className="btn btn-secondary btn-sm">Generate PDF</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="settings-section">
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>ACCOUNT BACKUP</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Keep a safe offline copy of your entire journal.</p>

                <div className="card card-body">
                  <div style={{ padding: "var(--space-4)", background: "rgba(var(--accent-primary-rgb), 0.05)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-4)" }}>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "var(--text-sm)", fontWeight: 600 }}>Full JSON Backup</h4>
                    <p className="text-muted" style={{ margin: 0, fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                      Download a raw JSON file containing every trade, execution, mistake, and journal entry in your account. You can use this file to restore your account later.
                    </p>
                  </div>
                  <button className="btn btn-primary" style={{ width: "100%" }}>Create Full Backup</button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Appearance" ? (
          <div className="settings-grid">
            <div className="settings-section">
              <div>
                <h2 className="settings-row-title" style={{ marginBottom: "var(--space-2)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>THEME & LAYOUT</h2>
                <p className="settings-row-desc" style={{ marginBottom: "var(--space-4)" }}>Customize how the application looks.</p>

                <div className="card card-body" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Color Theme</div>
                      <div className="settings-row-desc">Select your preferred color scheme.</div>
                    </div>
                    <select className="form-select" style={{ width: 160 }} value={theme} onChange={e => setTheme(e.target.value as any)}>
                      <option value="system">System Default</option>
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                    </select>
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Accent Color</div>
                      <div className="settings-row-desc">Primary color for buttons and highlights.</div>
                    </div>
                    <select className="form-select" style={{ width: 160 }} value={accent} onChange={e => setAccent(e.target.value as any)}>
                      <option value="blue">Blue (Default)</option>
                      <option value="indigo">Indigo</option>
                      <option value="emerald">Emerald</option>
                      <option value="violet">Violet</option>
                    </select>
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-text">
                      <div className="settings-row-title">Compact Mode</div>
                      <div className="settings-row-desc">Reduce padding to fit more data on screen.</div>
                    </div>
                    <Toggle active={compactMode} onChange={setCompactMode} />
                  </div>
                </div>
              </div>
            </div>


          </div>
        ) : activeTab === "About" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "var(--space-12)", paddingBottom: "var(--space-12)" }}>
            {/* Logo */}
            <div style={{
              width: 100,
              height: 100,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "var(--space-2)",
              overflow: "hidden"
            }}>
              <img src="/about-logo.png" alt="App Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* App Name */}
            <h2 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, margin: 0, marginBottom: "var(--space-4)" }}>TraderLabs</h2>

            {/* Version Badge */}
            <div style={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.03)",
              padding: "4px 16px",
              borderRadius: 8,
              marginBottom: "var(--space-10)"
            }}>
              <span style={{ color: "var(--accent-primary)", fontWeight: 700, fontFamily: "monospace", fontSize: "14px" }}>{LATEST_VERSION}</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-12)" }}>
              <a href="/about/contact" className="card card-body" style={{ textDecoration: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 24px", minWidth: 160 }}>
                <span style={{ fontWeight: 700 }}>Contact Support</span>
              </a>
              <a href="/about/bug-report" className="card card-body" style={{ textDecoration: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 24px", minWidth: 160 }}>
                <span style={{ fontWeight: 700 }}>Report a Bug</span>
              </a>
            </div>

            {/* Links */}
            <div style={{ display: "flex", gap: "var(--space-6)" }}>
              <a href="/about/terms" className="text-muted" style={{ textDecoration: "none", fontSize: "var(--text-sm)", transition: "color 0.2s" }}>Terms of Service</a>
              <a href="/about/privacy" className="text-muted" style={{ textDecoration: "none", fontSize: "var(--text-sm)", transition: "color 0.2s" }}>Privacy Policy</a>
              <a href="/about/changelog" className="text-muted" style={{ textDecoration: "none", fontSize: "var(--text-sm)", transition: "color 0.2s" }}>Changelog</a>
            </div>
          </div>
        ) : null}
      </div>
    </div>

      {/* Mobile View */}
      <div className="settings-mobile-view">
        {/* Mobile Header Bar */}
        <div className="settings-mobile-header">
          <div className="settings-mobile-header-text">
            <h2 className="settings-mobile-header-title">
              {mobileTab === "Profile" && "Profile & Account"}
              {mobileTab === "Trading" && "Trading & Risk"}
              {mobileTab === "Broker API" && "Broker Integration"}
              {mobileTab === "Appearance" && "App Appearance"}
              {mobileTab === "About" && "About TraderLabs"}
            </h2>
            <span className="settings-mobile-header-desc">
              {mobileTab === "Profile" && "Personal info, preferences & defaults"}
              {mobileTab === "Trading" && "Capital sizing, risk rules & broker fees"}
              {mobileTab === "Broker API" && "Sync orders with DhanHQ real-time API"}
              {mobileTab === "Appearance" && "Dark/Light themes & accent color palette"}
              {mobileTab === "About" && `TraderLabs ${LATEST_VERSION} • Support & info`}
            </span>
          </div>

          <button
            className="btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 15px",
              borderRadius: "var(--radius-full)",
              fontSize: "13px",
              fontWeight: 700,
              backgroundColor: saveSuccess ? "#10B981" : "var(--accent-primary)",
              color: "#ffffff",
              border: "none",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              flexShrink: 0
            }}
            onClick={handleSave}
            disabled={saving || isGuest}
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check size={14} />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Tabs Pill Bar */}
        <div className="settings-mobile-tabs">
          {[
            { id: "Profile", label: "Profile", icon: User },
            { id: "Trading", label: "Trading", icon: TrendingUp },
            { id: "Broker API", label: "Broker API", icon: Zap },
            { id: "Appearance", label: "Appearance", icon: Palette },
            { id: "About", label: "About", icon: Info },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = mobileTab === t.id;
            return (
              <button
                key={t.id}
                className={cn("settings-mobile-tab-btn", isActive && "active")}
                onClick={() => setMobileTab(t.id as any)}
              >
                <Icon size={14} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Guest Warning on Mobile */}
        {isGuest && (
          <div style={{
            marginBottom: "14px",
            padding: "10px 14px",
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "var(--radius-md)",
            color: "#b45309",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "12px",
            fontWeight: 500
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>Guest Mode: profile modifications cannot be saved.</span>
          </div>
        )}

        {/* TAB 1: PROFILE */}
        {mobileTab === "Profile" && (
          <div>
            {/* Profile Info Card */}
            <div className="settings-mobile-card">
              <div className="settings-mobile-card-header">
                <div className="settings-mobile-card-icon">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="settings-mobile-card-title">TRADER PROFILE</h3>
                  <p className="settings-mobile-card-desc">Your public name, avatar and trading persona.</p>
                </div>
              </div>

              {/* Avatar Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "var(--bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  border: "2px solid var(--border-secondary)",
                  boxShadow: "var(--shadow-sm)",
                  flexShrink: 0
                }}>
                  {avatar ? (
                    <img src={avatar} alt="Profile Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <User size={36} className="text-muted" />
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: "var(--radius-full)"
                    }}
                    onClick={() => !isGuest && setMobileAvatarPicker(!mobileAvatarPicker)}
                    disabled={isGuest}
                  >
                    <Camera size={14} />
                    {mobileAvatarPicker ? "Close Avatars" : "Choose Avatar"}
                  </button>

                  {avatar && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{
                        color: "var(--color-negative)",
                        fontSize: "11px",
                        padding: "2px 6px",
                        alignSelf: "flex-start"
                      }}
                      onClick={() => !isGuest && setAvatar("")}
                      disabled={isGuest}
                    >
                      Remove Avatar
                    </button>
                  )}
                </div>
              </div>

              {/* Avatar Picker Drawer */}
              {mobileAvatarPicker && (
                <div style={{
                  marginBottom: "16px",
                  padding: "12px",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-secondary)"
                }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Select an Avatar
                  </div>
                  <div className="settings-avatar-grid">
                    {PREDEFINED_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => { setAvatar(url); setMobileAvatarPicker(false); }}
                        className={cn("settings-avatar-option", avatar === url && "active")}
                      >
                        <img src={url} alt={`Avatar option ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name & Email */}
              <div className="settings-mobile-field">
                <label className="settings-mobile-label">Full Name</label>
                <input
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={isGuest}
                  placeholder="Your Name"
                />
              </div>

              <div className="settings-mobile-field">
                <label className="settings-mobile-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Email</span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "none", fontWeight: 500 }}>Read-only</span>
                </label>
                <input
                  className="form-input"
                  value={email}
                  readOnly
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-muted)",
                    cursor: "not-allowed",
                    opacity: 0.8
                  }}
                />
              </div>

              {/* Trading Style & Experience */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div className="settings-mobile-field" style={{ marginBottom: 0 }}>
                  <label className="settings-mobile-label">Trading Style</label>
                  <select className="form-select" value={tradingStyle} onChange={e => setTradingStyle(e.target.value)} disabled={isGuest}>
                    <option>Swing Trading</option>
                    <option>Day Trading</option>
                    <option>Position Trading</option>
                    <option>Scalping</option>
                  </select>
                </div>

                <div className="settings-mobile-field" style={{ marginBottom: 0 }}>
                  <label className="settings-mobile-label">Experience</label>
                  <select className="form-select" value={experience} onChange={e => setExperience(e.target.value)} disabled={isGuest}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Professional</option>
                  </select>
                </div>
              </div>

              {/* Bio / About */}
              <div className="settings-mobile-field" style={{ marginBottom: 0 }}>
                <label className="settings-mobile-label">About / Bio</label>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  value={about}
                  onChange={e => setAbout(e.target.value)}
                  disabled={isGuest}
                  placeholder="Focus on price action, VCP setups and volume analysis."
                />
              </div>
            </div>

            {/* Display & Market Defaults Card */}
            <div className="settings-mobile-card">
              <div className="settings-mobile-card-header">
                <div className="settings-mobile-card-icon">
                  <Sliders size={16} />
                </div>
                <div>
                  <h3 className="settings-mobile-card-title">MARKET DEFAULTS</h3>
                  <p className="settings-mobile-card-desc">Preferred market, timeframe and currency display.</p>
                </div>
              </div>

              <div className="settings-mobile-row">
                <div className="settings-mobile-row-info">
                  <div className="settings-mobile-row-title">Primary Market</div>
                  <div className="settings-mobile-row-desc">Default exchange for new trades</div>
                </div>
                <select className="form-select" style={{ width: 130 }} value={defaultMarket} onChange={e => setDefaultMarket(e.target.value)} disabled={isGuest}>
                  <option>NSE</option>
                  <option>BSE</option>
                  <option>NASDAQ</option>
                  <option>NYSE</option>
                  <option>CRYPTO</option>
                </select>
              </div>

              <div className="settings-mobile-row">
                <div className="settings-mobile-row-info">
                  <div className="settings-mobile-row-title">Chart Timeframe</div>
                  <div className="settings-mobile-row-desc">Default period for setups</div>
                </div>
                <select className="form-select" style={{ width: 130 }} value={defaultTimeframe} onChange={e => setDefaultTimeframe(e.target.value)} disabled={isGuest}>
                  <option>1 Day</option>
                  <option>1 Week</option>
                  <option>1 Month</option>
                  <option>15 Min</option>
                </select>
              </div>

              <div className="settings-mobile-row">
                <div className="settings-mobile-row-info">
                  <div className="settings-mobile-row-title">Base Currency</div>
                  <div className="settings-mobile-row-desc">Currency used in metrics</div>
                </div>
                <select className="form-select" style={{ width: 130 }} value={currency} onChange={e => setCurrency(e.target.value)} disabled={isGuest}>
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>

              <div className="settings-mobile-row">
                <div className="settings-mobile-row-info">
                  <div className="settings-mobile-row-title">Show P&L in</div>
                  <div className="settings-mobile-row-desc">Display metric on trades</div>
                </div>
                <div className="segmented-control" style={{ width: 150 }}>
                  <button
                    className={cn("segmented-btn", showPnlIn === "Currency" && "active")}
                    onClick={() => !isGuest && setShowPnlIn("Currency")}
                    style={{ flex: 1, padding: "5px 8px", fontSize: "12px" }}
                    disabled={isGuest}
                  >
                    Currency
                  </button>
                  <button
                    className={cn("segmented-btn", showPnlIn === "R Multiple" && "active")}
                    onClick={() => !isGuest && setShowPnlIn("R Multiple")}
                    style={{ flex: 1, padding: "5px 8px", fontSize: "12px" }}
                    disabled={isGuest}
                  >
                    R-Multiple
                  </button>
                </div>
              </div>
            </div>

            {/* Security & Password Card (Mobile) */}
            <div className="settings-mobile-card">
              <div className="settings-mobile-card-header">
                <div className="settings-mobile-card-icon">
                  <Shield size={16} />
                </div>
                <div>
                  <h3 className="settings-mobile-card-title">SECURITY & PASSWORD</h3>
                  <p className="settings-mobile-card-desc">Update your account login password.</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} autoComplete="on">
                <input type="text" name="username" value={email} autoComplete="username" style={{ display: "none" }} readOnly />

                {passwordStatus && (
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 500,
                      marginBottom: "12px",
                      backgroundColor: passwordStatus.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                      color: passwordStatus.type === "success" ? "#10B981" : "#EF4444",
                      border: `1px solid ${passwordStatus.type === "success" ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
                    }}
                  >
                    {passwordStatus.message}
                  </div>
                )}

                <div className="settings-mobile-field">
                  <label className="settings-mobile-label">Current Password</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      name="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      className="form-input"
                      style={{ width: "100%", paddingRight: "40px" }}
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        padding: "4px",
                      }}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="settings-mobile-field">
                  <label className="settings-mobile-label">New Password</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      name="new-password"
                      type={showNewPassword ? "text" : "password"}
                      className="form-input"
                      style={{ width: "100%", paddingRight: "40px" }}
                      placeholder="New password (min. 4 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={4}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        padding: "4px",
                      }}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={passwordLoading}
                  style={{ width: "100%", marginTop: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  {passwordLoading ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </div>

            {/* Danger Zone Card */}
            <div className="settings-mobile-card" style={{ borderColor: "rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.02)" }}>
              <div className="settings-mobile-card-header">
                <div className="settings-mobile-card-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h3 className="settings-mobile-card-title" style={{ color: "#ef4444" }}>DANGER ZONE</h3>
                  <p className="settings-mobile-card-desc">Irreversible account actions.</p>
                </div>
              </div>

              <div className="settings-mobile-row">
                <div className="settings-mobile-row-info">
                  <div className="settings-mobile-row-title">Clear Local Cache</div>
                  <div className="settings-mobile-row-desc">Remove stored offline temporary data</div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    alert("Local cache cleared successfully.");
                  }}
                >
                  Clear Cache
                </button>
              </div>

              <div className="settings-mobile-row">
                <div className="settings-mobile-row-info">
                  <div className="settings-mobile-row-title" style={{ color: "#ef4444" }}>Delete Account</div>
                  <div className="settings-mobile-row-desc">Permanently erase your account and all data</div>
                </div>
                <button
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    fontWeight: 700,
                    fontSize: "12px"
                  }}
                  onClick={() => !isGuest && setShowDeleteConfirm(true)}
                  disabled={isGuest}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRADING */}
        {mobileTab === "Trading" && (
          <div>
            {/* Capital & Risk Parameters */}
            <div className="settings-mobile-card">
              <div className="settings-mobile-card-header">
                <div className="settings-mobile-card-icon">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3 className="settings-mobile-card-title">CAPITAL & RISK PARAMETERS</h3>
                  <p className="settings-mobile-card-desc">Core sizing and limits used in calculations and alerts.</p>
                </div>
              </div>

              <div className="settings-mobile-field">
                <label className="settings-mobile-label">Default Trading Capital (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={defaultCapital}
                  onChange={e => setDefaultCapital(e.target.value)}
                  disabled={isGuest}
                  placeholder="500000"
                />
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total capital available for sizing (saves to your account).</span>
              </div>

              <div className="settings-mobile-field">
                <label className="settings-mobile-label">Default Risk Per Trade (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={defaultRisk}
                  onChange={e => setDefaultRisk(e.target.value)}
                  disabled={isGuest}
                  placeholder="1.0"
                />
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Standard risk percentage per setup (e.g. 1.0%).</span>
              </div>

              <div className="settings-mobile-field">
                <label className="settings-mobile-label">Target Reward-to-Risk (R:R)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={defaultRR}
                  onChange={e => setDefaultRR(e.target.value)}
                  disabled={isGuest}
                  placeholder="2.0"
                />
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Your minimum target reward multiplier (e.g. 2.0).</span>
              </div>

              <div className="settings-mobile-field" style={{ marginBottom: 0 }}>
                <label className="settings-mobile-label">Max Daily Loss Limit (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={maxDailyLoss}
                  onChange={e => setMaxDailyLoss(e.target.value)}
                  disabled={isGuest}
                  placeholder="5000"
                />
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Discipline threshold to prevent catastrophic loss days.</span>
              </div>
            </div>

            {/* Brokerage & Fees */}
            <div className="settings-mobile-card">
              <div className="settings-mobile-card-header">
                <div className="settings-mobile-card-icon">
                  <DollarSign size={16} />
                </div>
                <div>
                  <h3 className="settings-mobile-card-title">FEES & EXECUTION</h3>
                  <p className="settings-mobile-card-desc">Deduct brokerage fees for true Net P&L calculations.</p>
                </div>
              </div>

              <div className="settings-mobile-row">
                <div className="settings-mobile-row-info">
                  <div className="settings-mobile-row-title">Default Broker Fee</div>
                  <div className="settings-mobile-row-desc">Flat brokerage applied per order side (₹)</div>
                </div>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: 90, textAlign: "right" }}
                  value={defaultBrokerFee}
                  onChange={e => setDefaultBrokerFee(e.target.value)}
                  disabled={isGuest}
                />
              </div>

              <div className="settings-mobile-row">
                <div className="settings-mobile-row-info">
                  <div className="settings-mobile-row-title">Auto-deduct Fees</div>
                  <div className="settings-mobile-row-desc">Subtract estimated charges from Net P&L</div>
                </div>
                <Toggle active={deductFees} onChange={setDeductFees} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BROKER API */}
        {mobileTab === "Broker API" && (
          <div>
            <div className="settings-mobile-card">
              <div className="settings-mobile-card-header">
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#10b981",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "16px",
                  flexShrink: 0
                }}>
                  D
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 className="settings-mobile-card-title">DHANHQ REAL-TIME API</h3>
                    {dhanClientId && dhanAccessToken ? (
                      <span style={{ fontSize: "10px", fontWeight: 700, background: "#10B981", color: "#ffffff", padding: "2px 8px", borderRadius: "10px" }}>Configured</span>
                    ) : (
                      <span style={{ fontSize: "10px", fontWeight: 700, background: "#EF4444", color: "#ffffff", padding: "2px 8px", borderRadius: "10px" }}>Not Configured</span>
                    )}
                  </div>
                  <p className="settings-mobile-card-desc">Automatic live trade sync via Dhan's free trading API.</p>
                </div>
              </div>

              <div className="settings-mobile-field">
                <label className="settings-mobile-label">Dhan Client ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1100XXXXXX"
                  value={dhanClientId}
                  onChange={e => setDhanClientId(e.target.value)}
                  disabled={isGuest}
                />
              </div>

              <div className="settings-mobile-field">
                <label className="settings-mobile-label">Access Token (JWT)</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showDhanToken ? "text" : "password"}
                    className="form-input"
                    style={{ paddingRight: "40px" }}
                    placeholder="Paste your 30-day Dhan token"
                    value={dhanAccessToken}
                    onChange={e => setDhanAccessToken(e.target.value)}
                    disabled={isGuest}
                  />
                  <button
                    type="button"
                    onClick={() => setShowDhanToken(!showDhanToken)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: 4
                    }}
                  >
                    {showDhanToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Instructions Callout */}
              <div style={{
                marginTop: "14px",
                padding: "12px",
                background: "rgba(var(--accent-primary-rgb), 0.06)",
                border: "1px solid rgba(var(--accent-primary-rgb), 0.15)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start"
              }}>
                <Info size={16} style={{ color: "var(--accent-primary)", flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  <strong>How to generate keys:</strong> Log into <em>web.dhan.co</em> → Profile → DhanHQ APIs → Generate Access Token. Paste both Client ID & Token here and tap <strong>Save</strong> above.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APPEARANCE */}
        {mobileTab === "Appearance" && (
          <div>
            {/* Theme Card */}
            <div className="settings-mobile-card">
              <div className="settings-mobile-card-header">
                <div className="settings-mobile-card-icon">
                  <Moon size={16} />
                </div>
                <div>
                  <h3 className="settings-mobile-card-title">THEME MODE</h3>
                  <p className="settings-mobile-card-desc">Choose between dark, light or auto system preference.</p>
                </div>
              </div>

              <div className="settings-theme-selector">
                {[
                  { id: "system", label: "System", icon: Monitor },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "light", label: "Light", icon: Sun },
                ].map(t => {
                  const Icon = t.icon;
                  const isSelected = theme === t.id;
                  return (
                    <div
                      key={t.id}
                      className={cn("settings-theme-card", isSelected && "active")}
                      onClick={() => setTheme(t.id as any)}
                    >
                      <Icon size={20} />
                      <span>{t.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accent Palette Card */}
            <div className="settings-mobile-card">
              <div className="settings-mobile-card-header">
                <div className="settings-mobile-card-icon">
                  <Palette size={16} />
                </div>
                <div>
                  <h3 className="settings-mobile-card-title">ACCENT PALETTE</h3>
                  <p className="settings-mobile-card-desc">Brand highlight color for buttons, badges and focus rings.</p>
                </div>
              </div>

              <div className="settings-accent-selector">
                {[
                  { id: "blue", label: "Blue", color: "#3B82F6" },
                  { id: "indigo", label: "Indigo", color: "#6366F1" },
                  { id: "emerald", label: "Emerald", color: "#10B981" },
                  { id: "violet", label: "Violet", color: "#8B5CF6" },
                ].map(acc => {
                  const isSelected = accent === acc.id;
                  return (
                    <div
                      key={acc.id}
                      className={cn("settings-accent-card", isSelected && "active")}
                      onClick={() => setAccent(acc.id as any)}
                    >
                      <div style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        backgroundColor: acc.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        boxShadow: isSelected ? "0 0 0 2px var(--bg-card), 0 0 0 4px " + acc.color : "none"
                      }}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span style={{ marginTop: 4 }}>{acc.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compact Mode */}
            <div className="settings-mobile-card">
              <div className="settings-mobile-row">
                <div className="settings-mobile-row-info">
                  <div className="settings-mobile-row-title">Compact Density</div>
                  <div className="settings-mobile-row-desc">Tighter spacing to display more trades on screen</div>
                </div>
                <Toggle active={compactMode} onChange={setCompactMode} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ABOUT */}
        {mobileTab === "About" && (
          <div>
            {/* Brand Card */}
            <div className="settings-mobile-card" style={{ textAlign: "center", padding: "24px 16px" }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                margin: "0 auto 12px auto",
                overflow: "hidden",
                boxShadow: "var(--shadow-md)"
              }}>
                <img src="/about-logo.png" alt="TraderLabs" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 6px 0" }}>TraderLabs</h3>
              <div style={{
                display: "inline-block",
                border: "1px solid var(--border-secondary)",
                background: "var(--bg-secondary)",
                padding: "3px 12px",
                borderRadius: 20,
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                color: "var(--accent-primary)",
                marginBottom: "10px"
              }}>
                {LATEST_VERSION}
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
                Next-generation trading journal for data-driven, disciplined market execution.
              </p>
            </div>

            {/* Quick Links Card */}
            <div className="settings-mobile-card" style={{ padding: 0, overflow: "hidden" }}>
              <a
                href="/about/contact"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border-secondary)",
                  color: "var(--text-primary)",
                  textDecoration: "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "13px", fontWeight: 600 }}>
                  <User size={16} className="text-muted" />
                  <span>Contact Support</span>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </a>

              <a
                href="/about/bug-report"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border-secondary)",
                  color: "var(--text-primary)",
                  textDecoration: "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "13px", fontWeight: 600 }}>
                  <AlertTriangle size={16} className="text-muted" />
                  <span>Report a Bug</span>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </a>

              <a
                href="/about/changelog"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  color: "var(--text-primary)",
                  textDecoration: "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "13px", fontWeight: 600 }}>
                  <Sparkles size={16} className="text-muted" />
                  <span>Release Notes & Changelog</span>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </a>
            </div>

            {/* Legal Footer */}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", padding: "12px 0 24px 0" }}>
              <a href="/about/terms" className="text-muted" style={{ textDecoration: "none", fontSize: "12px" }}>Terms of Service</a>
              <span className="text-muted" style={{ fontSize: "12px" }}>•</span>
              <a href="/about/privacy" className="text-muted" style={{ textDecoration: "none", fontSize: "12px" }}>Privacy Policy</a>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            backgroundColor: "var(--bg-primary)",
            padding: "var(--space-6)",
            borderRadius: "var(--radius-lg)",
            maxWidth: "400px",
            width: "90%",
            border: "1px solid var(--border-primary)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)", color: "var(--color-negative)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <h3 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 600 }}>Delete Account?</h3>
            </div>

            <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-5)", lineHeight: 1.5 }}>
              Are you absolutely sure you want to permanently delete your account? This will erase all of your trades, plans, journals, and settings. <strong>This action cannot be undone.</strong>
            </p>

            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{ backgroundColor: "var(--color-negative)", color: "white", border: "none" }}
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

