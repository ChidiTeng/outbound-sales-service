"use client";

import { useEffect, useState } from "react";
import type { CrmDeal } from "@/lib/crm";
import { getStageLabel } from "@/lib/crm";
import type { SmartLeadActivity } from "@/lib/smart-leads";

interface CrmDossierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deal: CrmDeal | null | undefined;
  onAdvanceStage: (deal: CrmDeal) => void;
}

export function CrmDossierDrawer({
  isOpen,
  onClose,
  deal,
  onAdvanceStage,
}: CrmDossierDrawerProps) {
  const [activeTab, setActiveTab] = useState<"all" | "deals" | "emails" | "notes">("all");
  const [newNote, setNewNote] = useState("");
  const [userNotes, setUserNotes] = useState<{ id: string; text: string; time: string; author: string }[]>([]);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedStrategy, setCopiedStrategy] = useState(false);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!deal) return null;

  const stageInfo = getStageLabel(deal.stage);

  function handleCopyEmail() {
    if (!deal) return;
    navigator.clipboard.writeText(deal.primaryContact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }

  function handleCopyStrategy() {
    if (!deal?.suggestedAction) return;
    navigator.clipboard.writeText(deal.suggestedAction);
    setCopiedStrategy(true);
    setTimeout(() => setCopiedStrategy(false), 2000);
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    const noteObj = {
      id: `note-${Date.now()}`,
      text: newNote.trim(),
      time: "Just now",
      author: "Enterprise Account Executive",
    };
    setUserNotes([noteObj, ...userNotes]);
    setNewNote("");
  }

  const activities: SmartLeadActivity[] = deal.activities || [];

  const filteredActivities = activities.filter((act) => {
    if (activeTab === "all") return true;
    if (activeTab === "deals") return act.type === "meeting" || act.type === "signal";
    if (activeTab === "emails") return act.type === "email" || act.type === "call";
    return true;
  });

  const tierColor =
    deal.tier === "high"
      ? { text: "#7e22ce", bg: "#faf5ff", border: "#e9d5ff", label: "Enterprise Tier" }
      : deal.tier === "middle"
      ? { text: "#b45309", bg: "#fffbeb", border: "#fde68a", label: "Mid-Market Tier" }
      : { text: "#475569", bg: "#f8fafc", border: "#cbd5e1", label: "Growth Tier" };

  return (
    <>
      {/* Blurred Backdrop */}
      <div
        className={`activity-drawer-backdrop ${isOpen ? "is-visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Over Drawer Panel */}
      <aside
        className={`activity-drawer prospect-drawer-panel ${isOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`CRM Opportunity Dossier for ${deal.company}`}
      >
        {/* Drawer Header */}
        <div className="drawer-header" style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
          <div className="drawer-header-left" style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
            <div
              className="drawer-company-avatar"
              style={{ backgroundColor: deal.primaryContact.avatarColor }}
              aria-hidden="true"
            >
              {deal.company.charAt(0)}
            </div>
            <div className="drawer-title-group" style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
              <div className="drawer-title-row" style={{ flexWrap: "wrap", gap: "6px" }}>
                <h2 style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {deal.company}
                </h2>
                <span
                  className="prospect-tier-pill"
                  style={{
                    backgroundColor: tierColor.bg,
                    color: tierColor.text,
                    borderColor: tierColor.border,
                    flexShrink: 0,
                  }}
                >
                  ⚡ {tierColor.label}
                </span>
                <span
                  className="prospect-tier-pill"
                  style={{
                    backgroundColor: stageInfo.bg,
                    color: stageInfo.color,
                    borderColor: stageInfo.border,
                    flexShrink: 0,
                  }}
                >
                  {stageInfo.label}
                </span>
              </div>
              <p style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {deal.location} • {deal.industry} • {deal.revenue} ARR •{" "}
                <a
                  href={`https://${deal.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-meta-link"
                >
                  {deal.website} ↗
                </a>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close CRM opportunity drawer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="drawer-body">
          {/* 1. Executive Deal Readiness & Health Card */}
          <div className="readiness-card" style={{ flexShrink: 0 }}>
            <div className="readiness-header">
              <span className="readiness-badge" style={{ background: "#f5f3ff", color: "#7c3aed", borderColor: "#ddd6fe" }}>
                ⚡ {deal.winProbability}% Win Likelihood • {deal.dealValue} ACV
              </span>
              <span className="readiness-owner">
                Stage Velocity: <strong>{deal.daysInStage}d in {stageInfo.label}</strong>
              </span>
            </div>

            {/* AI Deal Executive Summary */}
            <div className="drawer-social-quote-box" style={{ borderLeftColor: "#7c3aed", margin: "14px 0 10px" }}>
              "{deal.aiDealSummary}"
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "11px",
                color: "#64748b",
                marginBottom: "14px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span style={{ minWidth: 0, wordBreak: "break-word" }}>
                Opportunity Owner: <strong>{deal.owner}</strong> • Expected Close: <strong>{deal.expectedCloseDate}</strong>
              </span>
              <span style={{ fontSize: "11px", color: "#059669", fontWeight: 600 }}>
                Status: {deal.status}
              </span>
            </div>

            {/* 2x2 Opportunity Telemetry Grid */}
            <div className="readiness-metrics-grid">
              <div className="metric-pill">
                <span>Contract Value (ACV)</span>
                <strong className="truncate-text" style={{ color: "#0f172a", fontSize: "13px" }}>
                  {deal.dealValue}
                </strong>
              </div>
              <div className="metric-pill">
                <span>Buying Signal Trigger</span>
                <strong className="truncate-text" title={deal.dealTrigger}>
                  {deal.dealTrigger}
                </strong>
              </div>
              <div className="metric-pill">
                <span>Account Scale</span>
                <strong className="truncate-text">{deal.employees} employees</strong>
              </div>
              <div className="metric-pill">
                <span>Annual Revenue</span>
                <strong className="truncate-text">{deal.revenue}</strong>
              </div>
            </div>
          </div>

          {/* 2. AI Next Best Action & Closing Strategy Hook */}
          <div className="stakeholders-section" style={{ flexShrink: 0 }}>
            <h3>✨ AI Next Best Action & Deal Strategy</h3>
            <div
              style={{
                background: "#fdf4ff",
                border: "1px solid #f0abfc",
                borderRadius: "12px",
                padding: "14px",
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#86198f" }}>
                  Recommended Action for {stageInfo.label}
                </span>
                <button
                  type="button"
                  onClick={handleCopyStrategy}
                  className="contact-copy-pill"
                  style={{ background: "#ffffff", borderColor: "#f0abfc", color: "#86198f" }}
                >
                  {copiedStrategy ? "✓ Copied!" : "Copy Strategy"}
                </button>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "#3b0764", lineHeight: "1.55", fontStyle: "italic", wordBreak: "break-word", overflowWrap: "break-word" }}>
                "{deal.suggestedAction}"
              </p>
              <div style={{ marginTop: "10px", fontSize: "11px", color: "#701a75", wordBreak: "break-word" }}>
                💡 <strong>Urgency Driver:</strong> {deal.whyNow}
              </div>
            </div>
          </div>

          {/* 3. Key Stakeholders & Internal Champion */}
          <div className="stakeholders-section" style={{ flexShrink: 0 }}>
            <h3>Verified Stakeholders & Internal Champion</h3>
            <div className="stakeholder-list">
              {/* Primary Decision Maker */}
              <div className="stakeholder-card">
                <div
                  className="stakeholder-avatar"
                  style={{ backgroundColor: deal.primaryContact.avatarColor }}
                >
                  {deal.primaryContact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="stakeholder-info">
                  <strong>{deal.primaryContact.name}</strong>
                  <span>{deal.primaryContact.title}</span>
                </div>
                {deal.primaryContact.verified && (
                  <span className="stakeholder-tag primary-contact">✓ Economic Buyer</span>
                )}
              </div>

              {/* Internal Champion if present */}
              {deal.champion && (
                <div className="stakeholder-card" style={{ marginTop: "8px", borderColor: "#ddd6fe" }}>
                  <div
                    className="stakeholder-avatar"
                    style={{ backgroundColor: deal.champion.avatarColor }}
                  >
                    {deal.champion.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="stakeholder-info">
                    <strong>{deal.champion.name}</strong>
                    <span>{deal.champion.title}</span>
                  </div>
                  <span className="stakeholder-tag" style={{ background: "#f5f3ff", color: "#7c3aed", borderColor: "#ddd6fe" }}>
                    ⭐ Internal Champion
                  </span>
                </div>
              )}
            </div>

            {/* Direct Contact Actions */}
            <div className="contact-actions-row" style={{ marginTop: "10px" }}>
              <button
                type="button"
                className="contact-action-badge"
                onClick={handleCopyEmail}
                title="Click to copy email address"
              >
                ✉ {deal.primaryContact.email}
                {copiedEmail && <span className="copied-note">Copied!</span>}
              </button>
              <a
                href={`tel:${deal.primaryContact.phone}`}
                className="contact-action-badge"
                title="Call phone number"
              >
                📞 {deal.primaryContact.phone}
              </a>
              {deal.primaryContact.linkedin && (
                <a
                  href={deal.primaryContact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-action-badge"
                  title="Open LinkedIn profile"
                >
                  in LinkedIn ↗
                </a>
              )}
            </div>
          </div>

          {/* 4. Detected Tech Stack & Integrations */}
          <div className="stakeholders-section" style={{ flexShrink: 0 }}>
            <h3>Customer Tech Stack & Existing Tools</h3>
            <div className="tech-stack-row">
              {deal.techStack.map((tech) => (
                <span key={tech} className="tech-stack-tag">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* 5. Activities & Timeline */}
          <div className="timeline-nav" style={{ flexShrink: 0 }}>
            <div className="section-header-split" style={{ marginBottom: "8px" }}>
              <h3>Touch History & Deal Milestones</h3>
              <div className="timeline-tabs" role="tablist">
                {(["all", "deals", "emails", "notes"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    className={`timeline-tab ${activeTab === tab ? "is-active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "all" ? "All" : tab === "deals" ? "Deals & Meetings" : tab === "emails" ? "Emails" : "Notes"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Note Input Form */}
          <form className="quick-note-form" onSubmit={handleAddNote} style={{ flexShrink: 0 }}>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Log deal update, contract redline memo, or next step note…"
            />
            <button type="submit" disabled={!newNote.trim()}>
              Add Note
            </button>
          </form>

          {/* User Added Notes Stream */}
          {userNotes.length > 0 && (activeTab === "all" || activeTab === "notes") && (
            <div className="user-notes-stream" style={{ flexShrink: 0 }}>
              {userNotes.map((note) => (
                <div key={note.id} className="timeline-event-card user-note">
                  <div className="event-meta">
                    <span className="event-type-badge note-badge">AE Note</span>
                    <span className="event-time">{note.time} by {note.author}</span>
                  </div>
                  <p className="event-desc">{note.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Touchpoint Timeline Feed */}
          <div className="timeline-stream" style={{ flexShrink: 0 }}>
            {activeTab !== "notes" &&
              filteredActivities.map((act) => (
                <div key={act.id} className="timeline-event-card">
                  <div className="event-meta">
                    <span
                      className="event-type-badge"
                      style={{ borderColor: act.badgeColor, color: act.badgeColor }}
                    >
                      {act.channel}
                    </span>
                    <span className="event-status">{act.status}</span>
                    <span className="event-time">{act.time}</span>
                  </div>
                  <h4 className="event-title">{act.title}</h4>
                  <p className="event-desc">{act.description}</p>
                  <div className="event-footer">
                    <span>Logged by: <strong>{act.author}</strong></span>
                  </div>
                </div>
              ))}

            {filteredActivities.length === 0 && userNotes.length === 0 && (
              <div className="empty-activities-notice">
                No activity records logged for this filter yet.
              </div>
            )}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="drawer-footer">
          <div className="drawer-footer-status">
            <span>Current Stage</span>
            <strong>{stageInfo.label} ({deal.winProbability}% Win)</strong>
          </div>
          <div className="drawer-footer-actions">
            <button
              type="button"
              className="drawer-secondary-btn"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="drawer-primary-btn"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
                color: "#ffffff",
              }}
              onClick={() => {
                onAdvanceStage(deal);
                onClose();
              }}
            >
              🚀 Advance Deal Stage ➜
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
