"use client";

import { useEffect, useState } from "react";
import type { SocialLead } from "@/lib/social-listening";
import type { SmartLeadActivity } from "@/lib/smart-leads";

interface SocialDossierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: SocialLead | null | undefined;
  onEnroll: (lead: SocialLead) => void;
}

export function SocialDossierDrawer({
  isOpen,
  onClose,
  lead,
  onEnroll,
}: SocialDossierDrawerProps) {
  const [activeTab, setActiveTab] = useState<"all" | "signals" | "outreach" | "notes">("all");
  const [newNote, setNewNote] = useState("");
  const [userNotes, setUserNotes] = useState<{ id: string; text: string; time: string; author: string }[]>([]);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedAiReply, setCopiedAiReply] = useState(false);

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

  if (!lead) return null;

  function handleCopyEmail() {
    if (!lead) return;
    navigator.clipboard.writeText(lead.primaryContact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }

  function handleCopyAiReply() {
    if (!lead?.aiDraftedReply) return;
    navigator.clipboard.writeText(lead.aiDraftedReply);
    setCopiedAiReply(true);
    setTimeout(() => setCopiedAiReply(false), 2000);
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    const noteObj = {
      id: `note-${Date.now()}`,
      text: newNote.trim(),
      time: "Just now",
      author: "Sales Intelligence",
    };
    setUserNotes([noteObj, ...userNotes]);
    setNewNote("");
  }

  const activities: SmartLeadActivity[] = lead.activities || [];

  const filteredActivities = activities.filter((act) => {
    if (activeTab === "all") return true;
    if (activeTab === "signals") return act.type === "signal" || act.type === "visit";
    if (activeTab === "outreach") return act.type === "email" || act.type === "meeting" || act.type === "call";
    return true;
  });

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return { name: "LinkedIn", color: "#0077b5" };
      case "twitter":
        return { name: "X / Twitter", color: "#0284c7" };
      case "reddit":
        return { name: "Reddit", color: "#ea580c" };
      case "github":
        return { name: "GitHub", color: "#7c3aed" };
      default:
        return { name: "Web / News", color: "#0d9488" };
    }
  };

  const platformInfo = getPlatformLabel(lead.socialMention.platform);

  const tierColor =
    lead.tier === "high"
      ? { text: "#7e22ce", bg: "#faf5ff", border: "#e9d5ff", label: "High Intent Priority" }
      : lead.tier === "middle"
      ? { text: "#b45309", bg: "#fffbeb", border: "#fde68a", label: "Middle Intent Priority" }
      : { text: "#475569", bg: "#f8fafc", border: "#cbd5e1", label: "Low Intent Priority" };

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
        aria-label={`Social Lead Dossier for ${lead.company}`}
      >
        {/* Drawer Header */}
        <div className="drawer-header" style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
          <div className="drawer-header-left" style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
            <div
              className="drawer-company-avatar"
              style={{ backgroundColor: lead.primaryContact.avatarColor }}
              aria-hidden="true"
            >
              {lead.company.charAt(0)}
            </div>
            <div className="drawer-title-group" style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
              <div className="drawer-title-row" style={{ flexWrap: "wrap", gap: "6px" }}>
                <h2 style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {lead.company}
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
                  ⚡ {lead.fitScore}% • {tierColor.label}
                </span>
              </div>
              <p style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {lead.location} • {lead.industry} • {lead.revenue} •{" "}
                <a
                  href={`https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-meta-link"
                >
                  {lead.website} ↗
                </a>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close dossier drawer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="drawer-body">
          {/* 1. Live Social Intent Card */}
          <div className="readiness-card">
            <div className="readiness-header">
              <span className="readiness-badge">
                ⚡ {lead.fitScore}% Intent Match • {platformInfo.name} Radar
              </span>
              <span className="readiness-owner">
                Sentiment: <strong>{lead.socialMention.sentiment}</strong>
              </span>
            </div>

            {/* Quoted Social Post Box */}
            <div
              className={`drawer-social-quote-box border-${lead.socialMention.platform}`}
            >
              "{lead.socialMention.fullContent || lead.socialMention.contentSnippet}"
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
                Posted by <strong>{lead.primaryContact.name}</strong> ({lead.socialMention.authorHandle}) • {lead.socialMention.postedAt}
              </span>
              <a
                href={lead.socialMention.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="drawer-meta-link"
                style={{ flexShrink: 0 }}
              >
                View Live Post ↗
              </a>
            </div>

            <div className="readiness-metrics-grid">
              <div className="metric-pill">
                <span>Buying Intent Trigger</span>
                <strong className="truncate-text" title={lead.socialMention.intentTrigger}>
                  {lead.socialMention.intentTrigger}
                </strong>
              </div>
              <div className="metric-pill">
                <span>Social Engagement</span>
                <strong className="truncate-text">
                  {lead.socialMention.engagementStats.likes} likes • {lead.socialMention.engagementStats.comments} replies
                </strong>
              </div>
              <div className="metric-pill">
                <span>Account Scale</span>
                <strong className="truncate-text">{lead.employees} employees</strong>
              </div>
              <div className="metric-pill">
                <span>Annual Revenue</span>
                <strong className="truncate-text">{lead.revenue}</strong>
              </div>
            </div>
          </div>

          {/* 2. AI Contextual Outreach Hook */}
          {lead.aiDraftedReply && (
            <div className="stakeholders-section">
              <h3>✨ AI Contextual Outreach Hook</h3>
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
                    Recommended Social & Outbound Opener
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAiReply}
                    className="contact-copy-pill"
                    style={{ background: "#ffffff", borderColor: "#f0abfc", color: "#86198f" }}
                  >
                    {copiedAiReply ? "✓ Copied!" : "Copy Pitch"}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "#3b0764", lineHeight: "1.5", fontStyle: "italic", wordBreak: "break-word", overflowWrap: "break-word" }}>
                  "{lead.aiDraftedReply}"
                </p>
                <div style={{ marginTop: "10px", fontSize: "11px", color: "#701a75", wordBreak: "break-word" }}>
                  💡 <strong>Action:</strong> {lead.suggestedAction}
                </div>
              </div>
            </div>
          )}

          {/* 3. Verified Decision Maker Section */}
          <div className="stakeholders-section">
            <h3>Verified Decision Maker</h3>
            <div className="stakeholder-list">
              <div className="stakeholder-card">
                <div
                  className="stakeholder-avatar"
                  style={{ backgroundColor: lead.primaryContact.avatarColor }}
                >
                  {lead.primaryContact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="stakeholder-info">
                  <strong>{lead.primaryContact.name}</strong>
                  <span>{lead.primaryContact.title}</span>
                </div>
                {lead.primaryContact.verified && (
                  <span className="stakeholder-tag primary-contact">✓ Verified Contact</span>
                )}
              </div>
            </div>

            {/* Direct Contact Actions */}
            <div className="contact-actions-row" style={{ marginTop: "10px" }}>
              <button
                type="button"
                className="contact-action-badge"
                onClick={handleCopyEmail}
                title="Click to copy email address"
              >
                ✉ {lead.primaryContact.email}
                {copiedEmail && <span className="copied-note">Copied!</span>}
              </button>
              <a
                href={`tel:${lead.primaryContact.phone}`}
                className="contact-action-badge"
                title="Call phone number"
              >
                📞 {lead.primaryContact.phone}
              </a>
              {lead.primaryContact.linkedin && (
                <a
                  href={lead.primaryContact.linkedin}
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

          {/* 4. Matched Trackers & Tech Stack */}
          <div className="stakeholders-section">
            <h3>Matched Keywords & Detected Tech Stack</h3>
            <div className="tech-stack-row">
              {lead.matchedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="tech-stack-tag"
                  style={{ background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" }}
                >
                  #{kw}
                </span>
              ))}
              {lead.techStack.map((tech) => (
                <span key={tech} className="tech-stack-tag">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* 5. Activities & Timeline */}
          <div className="timeline-nav">
            <div className="section-header-split" style={{ marginBottom: "8px" }}>
              <h3>Touch History & Social Signals</h3>
              <div className="timeline-tabs" role="tablist">
                {(["all", "signals", "outreach", "notes"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    className={`timeline-tab ${activeTab === tab ? "is-active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "all" ? "All" : tab === "signals" ? "Signals" : tab === "outreach" ? "Outreach" : "Notes"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Note Input Form */}
          <form className="quick-note-form" onSubmit={handleAddNote}>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Log an SDR memo, touchpoint note, or intent trigger detail…"
            />
            <button type="submit" disabled={!newNote.trim()}>
              Add Note
            </button>
          </form>

          {/* User Added Notes Stream */}
          {userNotes.length > 0 && (activeTab === "all" || activeTab === "notes") && (
            <div className="user-notes-stream">
              {userNotes.map((note) => (
                <div key={note.id} className="timeline-event-card user-note">
                  <div className="event-meta">
                    <span className="event-type-badge note-badge">Internal Note</span>
                    <span className="event-time">{note.time} by {note.author}</span>
                  </div>
                  <p className="event-desc">{note.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Touchpoint Timeline Feed */}
          <div className="timeline-stream">
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
            <span>Status</span>
            <strong>{lead.status}</strong>
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
              onClick={() => {
                onEnroll(lead);
                onClose();
              }}
            >
              🚀 Launch Dual Cadence ➜
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
