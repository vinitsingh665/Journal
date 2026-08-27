"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeProvider";

interface SettingsClientProps {
  user: { name?: string | null; email?: string | null };
  initialSettings: any;
}

export default function SettingsClient({ user, initialSettings }: SettingsClientProps) {
  const router = useRouter();
  const { theme, setTheme, accent, setAccent } = useTheme();
  const [activeTab, setActiveTab] = useState("Appearance");
  const [saving, setSaving] = useState(false);

  // Form states (mocked + real)
  const [name, setName] = useState(user.name || "Trader");
  const [email, setEmail] = useState(user.email || "trader@example.com");
  const [tradingStyle, setTradingStyle] = useState("Swing Trading");
  const [experience, setExperience] = useState("Intermediate");
  const [about, setAbout] = useState("Focus on price action, VCP setups and volume analysis.");

  const [defaultAccount, setDefaultAccount] = useState("Main Trading Account");
  const [defaultTimeframe, setDefaultTimeframe] = useState("1 Day");
  const [defaultMarket, setDefaultMarket] = useState("NSE");
  const [dateFormat, setDateFormat] = useState("31 Aug 2026 (DD MMM YYYY)");
  const [timeFormat, setTimeFormat] = useState("12 Hour (01:30 PM)");
  const [currency, setCurrency] = useState(initialSettings?.currency || "INR (₹)");
  const [showPnlIn, setShowPnlIn] = useState("Currency");

  // Quick settings states
  const [autoCalculateR, setAutoCalculateR] = useState(true);
  const [markHolidays, setMarkHolidays] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(true);
  const [enableAi, setEnableAi] = useState(true);
  const [syncDevices, setSyncDevices] = useState(false);

  // Additional settings states
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

  const tabs = ["General", "Trading", "Import & Sync", "Notifications", "Security", "Billing", "Data & Export", "Appearance"];

  const handleSave = async () => {
    setSaving(true);
    // Mock save delay
    setTimeout(() => {
      setSaving(false);
      // In a real implementation, this would call an API to update settings
    }, 600);
  };

  const Toggle = ({ active, onChange }: { active: boolean, onChange: (val: boolean) => void }) => (
    <div className={cn("settings-toggle", active && "active")} onClick={() => onChange(!active)}>
      <div className="settings-toggle-knob"></div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, margin: 0 }}>Settings</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Manage your account, preferences and application settings.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
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
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {/* Placeholder Avatar */}
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ width: "100%", padding: "6px 8px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      Change Photo
                    </button>
                  </div>
                  
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    <div style={{ display: "flex", gap: "var(--space-4)" }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Name</label>
                        <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Email</label>
                        <input className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "var(--space-4)" }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Trading Style</label>
                        <select className="form-select" value={tradingStyle} onChange={e => setTradingStyle(e.target.value)}>
                          <option>Swing Trading</option>
                          <option>Day Trading</option>
                          <option>Position Trading</option>
                          <option>Scalping</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Experience Level</label>
                        <select className="form-select" value={experience} onChange={e => setExperience(e.target.value)}>
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
                  <textarea className="form-input form-textarea" value={about} onChange={e => setAbout(e.target.value)}></textarea>
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
                  <select className="form-select" value={defaultAccount} onChange={e => setDefaultAccount(e.target.value)} style={{ width: 220 }}>
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
                  <select className="form-select" value={defaultTimeframe} onChange={e => setDefaultTimeframe(e.target.value)} style={{ width: 220 }}>
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
                  <select className="form-select" value={defaultMarket} onChange={e => setDefaultMarket(e.target.value)} style={{ width: 220 }}>
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
                  <select className="form-select" value={dateFormat} onChange={e => setDateFormat(e.target.value)} style={{ width: 220 }}>
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
                  <select className="form-select" value={timeFormat} onChange={e => setTimeFormat(e.target.value)} style={{ width: 220 }}>
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
                  <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: 220 }}>
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
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
                      onClick={() => setShowPnlIn("Currency")}
                      style={{ flex: 1 }}
                    >Currency</button>
                    <button 
                      className={cn("segmented-btn", showPnlIn === "R Multiple" && "active")}
                      onClick={() => setShowPnlIn("R Multiple")}
                      style={{ flex: 1 }}
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
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M22 4v16M4 4l8 4 8-4M4 20l8-4 8 4M12 8v8"/></svg>
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
                  <button className="btn btn-secondary btn-sm" style={{ color: "var(--color-negative)", borderColor: "rgba(239, 68, 68, 0.2)", fontWeight: 600, background: "rgba(239, 68, 68, 0.05)" }}>Delete Account</button>
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
                    <div className="settings-row-title">Default Risk per Trade (%)</div>
                    <div className="settings-row-desc">Used for auto-calculating position sizes.</div>
                  </div>
                  <input type="number" className="form-input" style={{ width: 120 }} value={defaultRisk} onChange={e => setDefaultRisk(e.target.value)} />
                </div>
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title">Default R:R Target</div>
                    <div className="settings-row-desc">Your minimum expected reward-to-risk ratio.</div>
                  </div>
                  <input type="number" className="form-input" style={{ width: 120 }} value={defaultRR} onChange={e => setDefaultRR(e.target.value)} />
                </div>
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title">Max Daily Loss Limit</div>
                    <div className="settings-row-desc">Get warned when you hit this loss threshold.</div>
                  </div>
                  <input type="number" className="form-input" style={{ width: 120 }} value={maxDailyLoss} onChange={e => setMaxDailyLoss(e.target.value)} />
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
                  <input type="number" className="form-input" style={{ width: 120 }} value={defaultBrokerFee} onChange={e => setDefaultBrokerFee(e.target.value)} />
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
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                    <div style={{ width: 40, height: 40, background: "#f8f9fa", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1e3a8a" }}>Z</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Zerodha (Kite)</div>
                      <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>Not connected</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm">Connect</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                    <div style={{ width: 40, height: 40, background: "#f3ba2f", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#000" }}>B</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Binance</div>
                      <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>Not connected</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm">Connect</button>
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
                  <select className="form-select" style={{ width: 150 }} value={syncFrequency} onChange={e => setSyncFrequency(e.target.value)}>
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
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-row-title">Two-Factor Authentication</div>
                    <div className="settings-row-desc">Add an extra layer of security to your account.</div>
                  </div>
                  <Toggle active={twoFactorAuth} onChange={setTwoFactorAuth} />
                </div>
                
                <div style={{ marginTop: "var(--space-4)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border-secondary)" }}>
                  <div className="settings-row-title" style={{ marginBottom: "var(--space-4)" }}>Change Password</div>
                  <div className="form-group mb-3">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-input" />
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-input" />
                  </div>
                  <button className="btn btn-primary mt-2">Update Password</button>
                </div>
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
                    <p className="text-muted" style={{ margin: 0, fontSize: "var(--text-sm)" }}>Billed annually (₹2,999/yr)</p>
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
                    <div style={{ fontWeight: 600 }}>•••• •••• •••• 4242</div>
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
      ) : null}
    </div>
  );
}
