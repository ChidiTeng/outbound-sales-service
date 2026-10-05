"use client";

import { useEffect, useState } from "react";
import type { SmartLead, SmartLeadActivity } from "@/lib/smart-leads";

interface ProspectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: SmartLead | null | undefined;
  onEnroll: (prospect: SmartLead) => void;
}

export function ProspectDrawer({
  isOpen,
  onClose,
  prospect,
  onEnroll,
}: ProspectDrawerProps) {
  const [activeTab, setActiveTab] = useState<"all" | "emails" | "signals" | "notes">("all");
  const [newNote, setNewNote] = useState("");
  const [userNotes, setUserNotes] = useState<{ id: string; text: string; time: string; author: string }[]>([]);
  const [copiedEmail, setCopiedEmail] = useState(false);

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

  if (!prospect) return null;

  function handleCopyEmail() {
    if (!prospect) return;
    navigator.clipboard.writeText(prospect.primaryContact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    const noteObj = {
      id: `note-${Date.now()}`,
      text: newNote.trim(),
      time: "Just now",
      author: "Sales Engineering",
    };
    setUserNotes([noteObj, ...userNotes]);
    setNewNote("");
  }

  const activities: SmartLeadActivity[] = prospect.activities || [];

  const filteredActivities = activities.filter((act) => {
    if (activeTab === "all") return true;
    if (activeTab === "emails") return act.type === "email";
    if (activeTab === "signals") return act.type === "signal" || act.type === "visit";
    return true;
  });

  const tierColor =
    prospect.tier === "high"
      ? { text: "#f5d0fe", bg: "rgba(201, 116, 244, 0.18)", border: "rgba(201, 116, 244, 0.55)", label: "High Intent Priority" }
      : prospect.tier === "middle"
      ? { text: "#fde68a", bg: "rgba(245, 158, 11, 0.18)", border: "rgba(245, 158, 11, 0.5)", label: "Middle Intent Priority" }
      : { text: "#94a3b8", bg: "rgba(100, 116, 139, 0.18)", border: "rgba(100, 116, 139, 0.4)", label: "Low Intent Priority" };

  return (
    <>
      <div
        className={`drawer-backdrop ${isOpen ? "is-visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`activity-drawer-panel prospect-drawer-panel ${isOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Prospect Dossier for ${prospect.company}`}
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div
              className="drawer-company-avatar"
              style={{ backgroundColor: prospect.primaryContact.avatarColor }}
            >
              {prospect.company.charAt(0)}
            </div>
            <div>
              <div className="drawer-title-row">
                <h2>{prospect.company}</h2>
                <span
                  className="prospect-tier-pill"
                  style={{
                    backgroundColor: tierColor.bg,
                    color: tierColor.text,
                    borderColor: tierColor.border,
                  }}
                >
                  ⚡ {prospect.fitScore}% • {tierColor.label}
                </span>
              </div>
              <p className="drawer-subtitle">
                {prospect.location} • {prospect.industry} • {prospect.revenue}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Decision Maker Contact Section */}
          <section className="drawer-section">
            <h3 className="section-title">Verified Decision Maker</h3>
            <div className="prospect-contact-card">
              <div
                className="contact-avatar-large"
                style={{ backgroundColor: prospect.primaryContact.avatarColor }}
              >
                {prospect.primaryContact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="contact-info-col">
                <div className="contact-name-row">
                  <strong>{prospect.primaryContact.name}</strong>
                  {prospect.primaryContact.verified && (
                    <span className="verified-pill">✓ Verified Contact</span>
                  )}
                </div>
                <span className="contact-role-text">
                  {prospect.primaryContact.title}
                </span>

                <div className="contact-actions-row">
                  <button
                    type="button"
                    className="contact-action-badge"
                    onClick={handleCopyEmail}
                  >
                    ✉ {prospect.primaryContact.email}
                    {copiedEmail && <span className="copied-note">Copied!</span>}
                  </button>
                  <a
                    href={`tel:${prospect.primaryContact.phone}`}
                    className="contact-action-badge"
                  >
                    📞 {prospect.primaryContact.phone}
                  </a>
                  <a
                    href={`https://${prospect.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-action-badge"
                  >
                    🌐 {prospect.website} ↗
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Buying Intent & Trigger */}
          <section className="drawer-section">
            <h3 className="section-title">Buying Signal & Intent Intelligence</h3>
            <div className="prospect-intent-highlight">
              <div className="intent-trigger-headline">
                <span className="intent-icon">🔥</span>
                <strong>Trigger:</strong> {prospect.intentTrigger}
              </div>
              <p className="intent-rationale-body">
                <strong>Why reach out now:</strong> {prospect.whyNow}
              </p>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="drawer-section">
            <h3 className="section-title">Verified Tech Stack & Infrastructure</h3>
            <div className="tech-stack-row">
              {prospect.techStack.map((tech) => (
                <span key={tech} className="tech-stack-tag">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Account Activity Timeline */}
          <section className="drawer-section">
            <div className="section-header-split">
              <h3 className="section-title">Account Activity & Live Touches</h3>
              <div className="timeline-tabs" role="tablist">
                <button
                  type="button"
                  className={`timeline-tab ${activeTab === "all" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("all")}
                >
                  All ({activities.length + userNotes.length})
                </button>
                <button
                  type="button"
                  className={`timeline-tab ${activeTab === "emails" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("emails")}
                >
                  Emails
                </button>
                <button
                  type="button"
                  className={`timeline-tab ${activeTab === "signals" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("signals")}
                >
                  Signals
                </button>
                <button
                  type="button"
                  className={`timeline-tab ${activeTab === "notes" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("notes")}
                >
                  Notes ({userNotes.length})
                </button>
              </div>
            </div>

            {/* Quick Add Note */}
            <form onSubmit={handleAddNote} className="quick-note-form" style={{ marginBottom: "14px" }}>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log a touchpoint or internal note on this account…"
              />
              <button type="submit" disabled={!newNote.trim()}>
                Add Note
              </button>
            </form>

            {/* Activity Stream */}
            <div className="timeline-stream">
              {/* User Notes */}
              {(activeTab === "all" || activeTab === "notes") &&
                userNotes.map((note) => (
                  <div key={note.id} className="timeline-event-card note-card">
                    <div className="event-meta">
                      <span className="event-type-badge" style={{ color: "#c974f4" }}>
                        Internal Note
                      </span>
                      <span className="event-status">{note.author}</span>
                      <span className="event-time" style={{ marginLeft: "auto" }}>
                        {note.time}
                      </span>
                    </div>
                    <p className="event-description">{note.text}</p>
                  </div>
                ))}

              {/* System Activities */}
              {activeTab !== "notes" &&
                filteredActivities.map((act) => (
                  <div key={act.id} className="timeline-event-card">
                    <div className="event-meta">
                      <span
                        className="event-type-badge"
                        style={{ color: act.badgeColor }}
                      >
                        {act.channel}
                      </span>
                      <span className="event-status">{act.status}</span>
                      <span className="event-time" style={{ marginLeft: "auto" }}>
                        {act.time}
                      </span>
                    </div>
                    <strong className="event-title">{act.title}</strong>
                    <p className="event-description">{act.description}</p>
                  </div>
                ))}

              {filteredActivities.length === 0 && userNotes.length === 0 && (
                <div className="empty-activities-notice">
                  No activity records logged for this filter yet.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Drawer Footer Actions */}
        <div className="drawer-footer">
          <div className="drawer-footer-status">
            <span>Current Status:</span>
            <strong>{prospect.status}</strong>
          </div>
          <button
            type="button"
            className="drawer-enroll-cta"
            onClick={() => {
              onEnroll(prospect);
              onClose();
            }}
          >
            + Enroll in Automated Cadence
          </button>
        </div>
      </div>
    </>
  );
}
