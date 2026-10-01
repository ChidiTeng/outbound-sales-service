"use client";

import { useState } from "react";
import Link from "next/link";
import { SMART_LEADS_DATA, type SmartLead } from "@/lib/smart-leads";

export function SmartLeadsView() {
  const [leads, setLeads] = useState<SmartLead[]>(SMART_LEADS_DATA);
  const [selectedIds, setSelectedIds] = useState<string[]>(["lead-1", "lead-2"]);
  const [activePreset, setActivePreset] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState("enterprise-cadence");
  const [enrolledSuccess, setEnrolledSuccess] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Filter leads by preset and search query
  const filteredLeads = leads.filter((lead) => {
    const matchesPreset =
      activePreset === "all" ||
      (activePreset === "dach" && lead.matchedPresets.includes("dach")) ||
      (activePreset === "high-intent" && lead.fitScore >= 90) ||
      (activePreset === "funding" && lead.matchedPresets.includes("funding")) ||
      (activePreset === "hiring" && lead.matchedPresets.includes("hiring"));

    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      lead.company.toLowerCase().includes(query) ||
      lead.industry.toLowerCase().includes(query) ||
      lead.location.toLowerCase().includes(query) ||
      lead.primaryContact.name.toLowerCase().includes(query) ||
      lead.intentTrigger.toLowerCase().includes(query);

    return matchesPreset && matchesQuery;
  });

  const allFilteredSelected =
    filteredLeads.length > 0 && filteredLeads.every((l) => selectedIds.includes(l.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  }

  function toggleSelectLead(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  function handleCopyEmail(email: string) {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  }

  function handleLaunchEnrollment() {
    const count = selectedIds.length;
    setIsEnrollModalOpen(false);
    setEnrolledSuccess(count);
    setTimeout(() => {
      setEnrolledSuccess(null);
    }, 6000);
  }

  return (
    <div className="smart-leads-container">
      {/* Header Banner */}
      <div className="smart-leads-header">
        <div>
          <div className="smart-leads-badge">
            <span className="pulsing-dot" />
            AI Lead Discovery & Buying Intent Engine
          </div>
          <h1>Smart Leads</h1>
          <p>
            Surface verified, high-intent accounts matched to your ICP. Review live buying signals and enroll them directly into automated outreach sequences.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="smart-leads-stats">
          <div className="stat-card">
            <span className="stat-label">Verified ICP Pool</span>
            <strong className="stat-value">1,480</strong>
            <span className="stat-sub">Accounts identified</span>
          </div>
          <div className="stat-card highlight">
            <span className="stat-label">Active Buying Signals</span>
            <strong className="stat-value">342</strong>
            <span className="stat-sub text-mint">Score &gt; 90%</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Contact Verification</span>
            <strong className="stat-value">98.4%</strong>
            <span className="stat-sub">Direct emails & phones</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Outreach Cadences</span>
            <strong className="stat-value">3 Ready</strong>
            <span className="stat-sub">Email, SMS & In-Person</span>
          </div>
        </div>
      </div>

      {/* Preset Filters & Search Bar */}
      <div className="smart-leads-filters-bar">
        <div className="filter-presets">
          {[
            { id: "all", label: "All Matches", count: 6 },
            { id: "high-intent", label: "🔥 High Intent (Score > 90%)", count: 4 },
            { id: "dach", label: "DACH Industrial Leaders", count: 5 },
            { id: "funding", label: "💰 Recent Funding Round", count: 2 },
            { id: "hiring", label: "📈 Active Hiring Surge", count: 2 },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`preset-btn ${activePreset === preset.id ? "is-active" : ""}`}
              onClick={() => setActivePreset(preset.id)}
            >
              {preset.label}
              <span className="preset-count">{preset.count}</span>
            </button>
          ))}
        </div>

        <div className="smart-leads-search-wrap">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, decision maker, industry, or signal…"
          />
          {searchQuery && (
            <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Triage / Select Bar */}
      <div className="triage-toolbar">
        <div className="triage-left">
          <label className="checkbox-wrap">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={toggleSelectAll}
            />
            <span className="checkbox-custom" />
            <span className="checkbox-label">
              Select All Filtered ({filteredLeads.length})
            </span>
          </label>
          <span className="selected-summary">
            {selectedIds.length} of {leads.length} accounts selected
          </span>
        </div>

        <div className="triage-right">
          <button
            type="button"
            className="quick-select-btn"
            onClick={() => setSelectedIds(leads.filter((l) => l.fitScore >= 90).map((l) => l.id))}
          >
            ⚡ Select Top High-Intent Leads
          </button>
          <button
            type="button"
            className="quick-select-btn secondary"
            onClick={() => setSelectedIds([])}
            disabled={selectedIds.length === 0}
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {enrolledSuccess !== null && (
        <div className="enrollment-success-banner" role="status" aria-live="polite">
          <div className="success-icon">✓</div>
          <div className="success-text">
            <strong>Successfully Enrolled {enrolledSuccess} Accounts!</strong>
            <p>
              Prospects have been pushed to your automated Outreach Cadence. You can now monitor touchpoints directly in the Dashboard.
            </p>
          </div>
          <Link href="/sales-engine" className="view-in-dashboard-btn">
            Open Outreach Dashboard ➜
          </Link>
        </div>
      )}

      {/* Leads Grid Cards */}
      <div className="smart-leads-grid">
        {filteredLeads.length === 0 ? (
          <div className="leads-empty-state">
            <p>No leads match the selected filter preset or search criteria.</p>
            <button type="button" onClick={() => { setActivePreset("all"); setSearchQuery(""); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const isSelected = selectedIds.includes(lead.id);

            return (
              <article
                key={lead.id}
                className={`smart-lead-card ${isSelected ? "is-selected" : ""}`}
                onClick={() => toggleSelectLead(lead.id)}
              >
                {/* Top Card Row */}
                <div className="lead-card-header">
                  <label
                    className="card-checkbox-wrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectLead(lead.id)}
                    />
                    <span className="checkbox-custom" />
                  </label>

                  <div className="lead-company-info">
                    <div className="lead-avatar" style={{ backgroundColor: lead.primaryContact.avatarColor }}>
                      {lead.company.charAt(0)}
                    </div>
                    <div>
                      <h2>{lead.company}</h2>
                      <p className="lead-meta">
                        {lead.location} • {lead.employees} employees • {lead.revenue}
                      </p>
                    </div>
                  </div>

                  {/* AI Fit Score Badge */}
                  <div className={`fit-score-badge ${lead.fitScore >= 92 ? "top-tier" : ""}`}>
                    <span className="fit-score-number">⚡ {lead.fitScore}%</span>
                    <span className="fit-score-label">{lead.intentLevel} Intent</span>
                  </div>
                </div>

                {/* Intent Signal & Why Now */}
                <div className="lead-intent-box">
                  <div className="intent-trigger-tag">
                    <span className="fire-icon">🔥</span>
                    <strong>Trigger:</strong> {lead.intentTrigger}
                  </div>
                  <p className="why-now-text">
                    <strong>Why reach out now:</strong> {lead.whyNow}
                  </p>
                </div>

                {/* Decision Maker Contact Dossier */}
                <div className="lead-contact-box" onClick={(e) => e.stopPropagation()}>
                  <div className="contact-avatar" style={{ backgroundColor: lead.primaryContact.avatarColor }}>
                    {lead.primaryContact.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="contact-details">
                    <div className="contact-header">
                      <strong>{lead.primaryContact.name}</strong>
                      <span className="verified-badge">✓ Verified Contact</span>
                    </div>
                    <span className="contact-title">{lead.primaryContact.title}</span>
                    <div className="contact-reachouts">
                      <button
                        type="button"
                        className="contact-pill"
                        onClick={() => handleCopyEmail(lead.primaryContact.email)}
                        title="Click to copy email"
                      >
                        ✉ {lead.primaryContact.email}
                        {copiedEmail === lead.primaryContact.email && (
                          <span className="copied-tag">Copied!</span>
                        )}
                      </button>
                      <a href={`tel:${lead.primaryContact.phone}`} className="contact-pill">
                        📞 {lead.primaryContact.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Tech Stack & Actions */}
                <div className="lead-card-footer" onClick={(e) => e.stopPropagation()}>
                  <div className="tech-stack-pills">
                    {lead.techStack.map((tech) => (
                      <span key={tech} className="tech-pill">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="lead-quick-actions">
                    <a
                      href={`https://${lead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-action-btn"
                      title="Visit company website"
                    >
                      Website ↗
                    </a>
                    <button
                      type="button"
                      className={`card-enroll-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        if (!isSelected) {
                          setSelectedIds([...selectedIds, lead.id]);
                        }
                        setIsEnrollModalOpen(true);
                      }}
                    >
                      {isSelected ? "Selected for Outreach" : "+ Add to Sequence"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <aside className={`smart-leads-sticky-bar ${selectedIds.length > 0 ? "is-active" : ""}`}>
        <div className="sticky-bar-left">
          <div className="sticky-selection-count">
            <strong>{selectedIds.length}</strong>
            <span>{selectedIds.length === 1 ? "Lead" : "Leads"} Selected</span>
          </div>
          <span className="sticky-hint">
            Ready to be enrolled into your automated multi-touch sales sequences.
          </span>
        </div>

        <div className="sticky-bar-actions">
          <button
            type="button"
            className="sticky-btn secondary"
            onClick={() => {
              const csvData = leads
                .filter((l) => selectedIds.includes(l.id))
                .map((l) => `${l.company},${l.primaryContact.name},${l.primaryContact.email}`)
                .join("\n");
              const blob = new Blob([`Company,Contact,Email\n${csvData}`], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "smart-leads-export.csv";
              a.click();
            }}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="sticky-btn primary"
            onClick={() => setIsEnrollModalOpen(true)}
          >
            🚀 Enroll in Outreach Cadence ({selectedIds.length})
          </button>
        </div>
      </aside>

      {/* Cadence Enrollment Modal */}
      {isEnrollModalOpen && (
        <div
          className="account-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enroll-modal-title"
        >
          <div className="account-modal-content" style={{ maxWidth: "520px" }}>
            <div className="modal-icon-wrap" aria-hidden="true">
              🚀
            </div>
            <h3 id="enroll-modal-title">Enroll {selectedIds.length} Leads into Outreach</h3>
            <p className="modal-desc">
              Select the outreach cadence to initiate. Personalized email, SMS, and in-person meeting tasks will be automatically scheduled in your Dashboard.
            </p>

            {/* Sequence Selector */}
            <div className="sequence-selector-list">
              {[
                {
                  id: "enterprise-cadence",
                  name: "Enterprise Multi-Touch Cadence",
                  description: "Day 1 Email • Day 3 SMS • Day 7 Phone / On-site Visit. Best for high-intent deals.",
                  badge: "Recommended",
                },
                {
                  id: "c-level-intro",
                  name: "Executive & C-Suite Introduction",
                  description: "Hyper-personalized 2-step executive email flow with bespoke pitch decks.",
                  badge: "High Conversion",
                },
                {
                  id: "cold-discovery",
                  name: "Automated Supply Chain Discovery",
                  description: "Broad exploratory sequence gauging upcoming RFP timelines and vendor contracts.",
                  badge: "Volume",
                },
              ].map((seq) => (
                <label
                  key={seq.id}
                  className={`sequence-option ${selectedSequence === seq.id ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="cadence"
                    value={seq.id}
                    checked={selectedSequence === seq.id}
                    onChange={(e) => setSelectedSequence(e.target.value)}
                  />
                  <div className="seq-content">
                    <div className="seq-header">
                      <strong>{seq.name}</strong>
                      <span className="seq-badge">{seq.badge}</span>
                    </div>
                    <p>{seq.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="modal-actions" style={{ marginTop: "20px" }}>
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setIsEnrollModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-confirm-btn"
                onClick={handleLaunchEnrollment}
              >
                Launch Cadence Now ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
