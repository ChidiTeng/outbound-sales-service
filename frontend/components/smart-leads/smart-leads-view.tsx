"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ONBOARDED_BUSINESSES_DATA,
  type OnboardedBusiness,
  type SmartLead,
  type ProspectTier,
} from "@/lib/smart-leads";
import { ProspectDrawer } from "./prospect-drawer";

export function SmartLeadsView() {
  const businesses = ONBOARDED_BUSINESSES_DATA;
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(businesses[0]?.id || "nord-tech");

  // Left-pane filters (Businesses)
  const [businessSearchQuery, setBusinessSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [businessSortBy, setBusinessSortBy] = useState<"prospects" | "fit" | "emails">("prospects");

  // Right-pane filters (Prospects under selected business)
  const [selectedTier, setSelectedTier] = useState<"all" | ProspectTier>("all");
  const [prospectSearchQuery, setProspectSearchQuery] = useState("");
  const [signalTriggerFilter, setSignalTriggerFilter] = useState<string>("all");

  // Selection & bulk triage
  const [selectedProspectIds, setSelectedProspectIds] = useState<string[]>([]);
  const [drawerProspect, setDrawerProspect] = useState<SmartLead | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState("enterprise-cadence");
  const [enrolledSuccess, setEnrolledSuccess] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Active business reference
  const selectedBusiness = useMemo(() => {
    return businesses.find((b) => b.id === selectedBusinessId) || businesses[0];
  }, [businesses, selectedBusinessId]);

  // Reset selected prospect IDs when changing business
  useEffect(() => {
    setSelectedProspectIds([]);
    setSelectedTier("all");
    setProspectSearchQuery("");
    setSignalTriggerFilter("all");
  }, [selectedBusinessId]);

  // Filtered Businesses on the Left
  const filteredBusinesses = useMemo(() => {
    const q = businessSearchQuery.trim().toLowerCase();
    return businesses
      .filter((b) => {
        const matchesQuery =
          !q ||
          b.company.toLowerCase().includes(q) ||
          b.name.toLowerCase().includes(q) ||
          b.industry.toLowerCase().includes(q) ||
          b.owner.toLowerCase().includes(q);

        const matchesIndustry =
          selectedIndustry === "all" || b.industry.toLowerCase() === selectedIndustry.toLowerCase();

        return matchesQuery && matchesIndustry;
      })
      .sort((a, b) => {
        if (businessSortBy === "prospects") return b.analytics.totalProspects - a.analytics.totalProspects;
        if (businessSortBy === "fit") return b.analytics.avgFitScore - a.analytics.avgFitScore;
        if (businessSortBy === "emails") return b.emailsSent - a.emailsSent;
        return 0;
      });
  }, [businesses, businessSearchQuery, selectedIndustry, businessSortBy]);

  // Filtered Prospects on the Right for the selected business
  const filteredProspects = useMemo(() => {
    if (!selectedBusiness) return [];
    const q = prospectSearchQuery.trim().toLowerCase();

    return selectedBusiness.prospects.filter((lead) => {
      const matchesTier = selectedTier === "all" || lead.tier === selectedTier;

      const matchesQuery =
        !q ||
        lead.company.toLowerCase().includes(q) ||
        lead.industry.toLowerCase().includes(q) ||
        lead.location.toLowerCase().includes(q) ||
        lead.primaryContact.name.toLowerCase().includes(q) ||
        lead.intentTrigger.toLowerCase().includes(q) ||
        lead.techStack.some((t) => t.toLowerCase().includes(q));

      const matchesSignal =
        signalTriggerFilter === "all" ||
        (signalTriggerFilter === "hiring" && lead.matchedPresets.includes("hiring")) ||
        (signalTriggerFilter === "funding" && lead.matchedPresets.includes("funding")) ||
        (signalTriggerFilter === "expansion" && lead.matchedPresets.includes("expansion")) ||
        (signalTriggerFilter === "tenders" && lead.matchedPresets.includes("tenders"));

      return matchesTier && matchesQuery && matchesSignal;
    });
  }, [selectedBusiness, selectedTier, prospectSearchQuery, signalTriggerFilter]);

  const allFilteredSelected =
    filteredProspects.length > 0 && filteredProspects.every((l) => selectedProspectIds.includes(l.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedProspectIds([]);
    } else {
      setSelectedProspectIds(filteredProspects.map((l) => l.id));
    }
  }

  function toggleSelectLead(id: string) {
    if (selectedProspectIds.includes(id)) {
      setSelectedProspectIds(selectedProspectIds.filter((item) => item !== id));
    } else {
      setSelectedProspectIds([...selectedProspectIds, id]);
    }
  }

  function handleCopyEmail(email: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  }

  function handleLaunchEnrollment() {
    const count = selectedProspectIds.length || 1;
    setIsEnrollModalOpen(false);
    setEnrolledSuccess(count);
    setTimeout(() => {
      setEnrolledSuccess(null);
    }, 6000);
  }

  const distinctIndustries = useMemo(() => {
    const set = new Set<string>();
    businesses.forEach((b) => set.add(b.industry));
    return Array.from(set);
  }, [businesses]);

  return (
    <div className="smart-leads-container">
      {/* Top Banner: Engine Status & Overall Metrics */}
      <header className="smart-leads-header">
        <div>
          <div className="smart-leads-badge">
            <span className="pulsing-dot" />
            Smart Leads Engine • Multi-Business Prospect Intelligence Hub
          </div>
          <h1>Smart Leads Engine</h1>
          <p>
            Monitor onboarded client businesses, evaluate their tiered prospect pools (High, Middle, and Low Intent), and inspect real-time account interactions.
          </p>
        </div>
      </header>

      {/* Success Notification Banner */}
      {enrolledSuccess !== null && (
        <div className="enrollment-success-banner" role="status" aria-live="polite">
          <div className="success-icon">✓</div>
          <div className="success-text">
            <strong>Successfully Enrolled {enrolledSuccess} Prospect Accounts!</strong>
            <p>
              Target accounts have been pushed to your automated Outreach Cadence. You can track email opens and responses directly on the dashboard.
            </p>
          </div>
          <Link href="/sales-engine" className="view-in-dashboard-btn">
            Open Outreach Dashboard ➜
          </Link>
        </div>
      )}

      {/* Main Left-to-Right Master-Detail Workspace */}
      <div className="smart-leads-workspace">
        {/* =========================================================================
            LEFT MASTER PANE: Onboarded Businesses Selector & Filters
           ========================================================================= */}
        <aside className="smart-leads-master-pane" aria-label="Onboarded Businesses List">
          <div className="pane-header-box">
            <div className="pane-title-row">
              <h2>Onboarded Businesses</h2>
              <span className="count-badge">{businesses.length} Active</span>
            </div>
            <p className="pane-subtitle">
              Select a business to view its tiered prospect intelligence and live account touches.
            </p>

            {/* Business Search Bar */}
            <div className="master-search-wrap">
              <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={businessSearchQuery}
                onChange={(e) => setBusinessSearchQuery(e.target.value)}
                placeholder="Search businesses, owners, or industries…"
                aria-label="Search onboarded businesses"
              />
              {businessSearchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setBusinessSearchQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Business Filter Controls */}
            <div className="master-filters-row">
              <div className="filter-select-wrap">
                <label htmlFor="industry-filter" className="sr-only">Industry</label>
                <select
                  id="industry-filter"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="master-filter-select"
                >
                  <option value="all">All Industries</option>
                  {distinctIndustries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div className="filter-select-wrap">
                <label htmlFor="sort-filter" className="sr-only">Sort by</label>
                <select
                  id="sort-filter"
                  value={businessSortBy}
                  onChange={(e) => setBusinessSortBy(e.target.value as any)}
                  className="master-filter-select"
                >
                  <option value="prospects">Sort: Prospects Pool</option>
                  <option value="fit">Sort: Avg Fit Score</option>
                  <option value="emails">Sort: Emails Sent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Business Cards List */}
          <div className="business-cards-list" role="listbox" aria-label="Select an onboarded business">
            {filteredBusinesses.length === 0 ? (
              <div className="empty-master-state">
                <p>No onboarded businesses found matching your filter criteria.</p>
                <button
                  type="button"
                  className="reset-master-filter-btn"
                  onClick={() => {
                    setBusinessSearchQuery("");
                    setSelectedIndustry("all");
                  }}
                >
                  Reset Business Filters
                </button>
              </div>
            ) : (
              filteredBusinesses.map((b) => {
                const isSelected = b.id === selectedBusiness.id;
                const { analytics } = b;

                return (
                  <button
                    key={b.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`business-selector-card ${isSelected ? "is-selected" : ""}`}
                    onClick={() => setSelectedBusinessId(b.id)}
                  >
                    <div className="card-top-row">
                      <div className="biz-avatar" style={{ backgroundColor: b.avatarColor }}>
                        {b.company.charAt(0)}
                      </div>
                      <div className="biz-info">
                        <strong className="biz-company-name">{b.company}</strong>
                        <span className="biz-legal-name">{b.name}</span>
                        <div className="biz-meta-tags">
                          <span>{b.industry}</span>
                          <span>•</span>
                          <span>{b.country}</span>
                        </div>
                      </div>
                      {isSelected && <span className="active-dot-indicator" title="Currently selected" />}
                    </div>

                    {/* Micro-bar: High / Mid / Low Tier Distribution */}
                    <div className="biz-prospects-bar-wrap">
                      <div className="bar-labels">
                        <span className="total-pool-label">
                          <strong>{analytics.totalProspects}</strong> Prospects
                        </span>
                        <span className="tier-breakdown-mini">
                          <span className="text-high">{analytics.highTierCount} High</span>
                          {" / "}
                          <span className="text-mid">{analytics.middleTierCount} Mid</span>
                          {" / "}
                          <span className="text-low">{analytics.lowTierCount} Low</span>
                        </span>
                      </div>
                      <div className="mini-segmented-progress" aria-hidden="true">
                        <div
                          className="segment-high"
                          style={{ width: `${analytics.highTierPercent}%` }}
                          title={`High Intent: ${analytics.highTierPercent}%`}
                        />
                        <div
                          className="segment-mid"
                          style={{ width: `${analytics.middleTierPercent}%` }}
                          title={`Middle Intent: ${analytics.middleTierPercent}%`}
                        />
                        <div
                          className="segment-low"
                          style={{ width: `${analytics.lowTierPercent}%` }}
                          title={`Low Intent: ${analytics.lowTierPercent}%`}
                        />
                      </div>
                    </div>

                    {/* Email telemetry without repeating dashboard clutter */}
                    <div className="biz-card-footer">
                      <span className="biz-owner">Owner: {b.owner}</span>
                      <span className="biz-emails-count">
                        ✉ <strong>{b.emailsSent.toLocaleString()}</strong> sent
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* =========================================================================
            RIGHT DETAIL PANE: Selected Business Intelligence & Tiered Prospects
           ========================================================================= */}
        <main className="smart-leads-detail-pane" aria-label="Business Prospects and Analytics">
          {/* Selected Business Profile & Quick Telemetry Header */}
          <div className="business-profile-header">
            <div className="profile-main-info">
              <div className="profile-avatar" style={{ backgroundColor: selectedBusiness.avatarColor }}>
                {selectedBusiness.company.charAt(0)}
              </div>
              <div>
                <div className="profile-title-row">
                  <h1>{selectedBusiness.company}</h1>
                  <span className="industry-badge">{selectedBusiness.industry}</span>
                  <span className="country-badge">{selectedBusiness.country}</span>
                </div>
                <p className="profile-meta">
                  Managed by <strong>{selectedBusiness.owner}</strong> • Onboarded: {selectedBusiness.created} •{" "}
                  <a
                    href={`https://${selectedBusiness.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="website-link"
                  >
                    {selectedBusiness.website} ↗
                  </a>
                </p>
              </div>
            </div>

            {/* Clean Telemetry Cards (Keeps number of emails as is, no repetition of dashboard details) */}
            <div className="clean-telemetry-strip">
              <div className="telemetry-pill">
                <span className="telemetry-label">No of Emails</span>
                <strong className="telemetry-val">{selectedBusiness.emailsSent.toLocaleString()}</strong>
                <span className="telemetry-sub">Sent across cadences</span>
              </div>
              <div className="telemetry-pill highlight">
                <span className="telemetry-label">Prospects Pool</span>
                <strong className="telemetry-val">{selectedBusiness.analytics.totalProspects}</strong>
                <span className="telemetry-sub text-purple">Verified ICP Accounts</span>
              </div>
              <div className="telemetry-pill">
                <span className="telemetry-label">Avg AI Fit Score</span>
                <strong className="telemetry-val">{selectedBusiness.analytics.avgFitScore}%</strong>
                <span className="telemetry-sub text-mint">Buying Intent Match</span>
              </div>
              <div className="telemetry-pill">
                <span className="telemetry-label">Meetings Booked</span>
                <strong className="telemetry-val">{selectedBusiness.analytics.meetingsBooked}</strong>
                <span className="telemetry-sub">From Smart Leads</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              ANALYTICS & CHARTS SECTION: High, Middle, and Low Level Prospects
             ========================================================================= */}
          <section className="prospect-analytics-section" aria-label="Prospect Analytics and Tier Distribution">
            <div className="analytics-grid">
              {/* Donut Chart: High / Middle / Low Distribution */}
              <div className="chart-card donut-chart-card">
                <div className="card-header">
                  <h3>Prospect Tier Distribution</h3>
                  <span className="card-badge">Intent Quality</span>
                </div>

                <div className="donut-and-legend">
                  {/* SVG Donut Chart */}
                  <div className="svg-donut-wrap">
                    <svg viewBox="0 0 120 120" className="donut-svg" aria-hidden="true">
                      {/* Base Circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="transparent"
                        stroke="#031f26"
                        strokeWidth="16"
                      />
                      {/* High Tier Segment (Purple) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="transparent"
                        stroke="#c974f4"
                        strokeWidth="16"
                        strokeDasharray={`${(selectedBusiness.analytics.highTierPercent * 282.7) / 100} 282.7`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                      {/* Middle Tier Segment (Amber) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="16"
                        strokeDasharray={`${(selectedBusiness.analytics.middleTierPercent * 282.7) / 100} 282.7`}
                        strokeDashoffset={`-${(selectedBusiness.analytics.highTierPercent * 282.7) / 100}`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                      {/* Low Tier Segment (Slate) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="transparent"
                        stroke="#64748b"
                        strokeWidth="16"
                        strokeDasharray={`${(selectedBusiness.analytics.lowTierPercent * 282.7) / 100} 282.7`}
                        strokeDashoffset={`-${((selectedBusiness.analytics.highTierPercent + selectedBusiness.analytics.middleTierPercent) * 282.7) / 100}`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="donut-center-stat">
                      <strong>{selectedBusiness.analytics.totalProspects}</strong>
                      <span>Total Pool</span>
                    </div>
                  </div>

                  {/* Interactive Legend that filters the table below */}
                  <div className="donut-legend-list">
                    <button
                      type="button"
                      className={`legend-item-btn ${selectedTier === "high" ? "is-active" : ""}`}
                      onClick={() => setSelectedTier(selectedTier === "high" ? "all" : "high")}
                    >
                      <span className="legend-color-dot dot-high" />
                      <div className="legend-text">
                        <strong>High-Level ({selectedBusiness.analytics.highTierPercent}%)</strong>
                        <span>{selectedBusiness.analytics.highTierCount} accounts • Score ≥ 90%</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`legend-item-btn ${selectedTier === "middle" ? "is-active" : ""}`}
                      onClick={() => setSelectedTier(selectedTier === "middle" ? "all" : "middle")}
                    >
                      <span className="legend-color-dot dot-mid" />
                      <div className="legend-text">
                        <strong>Middle-Level ({selectedBusiness.analytics.middleTierPercent}%)</strong>
                        <span>{selectedBusiness.analytics.middleTierCount} accounts • Score 70–89%</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`legend-item-btn ${selectedTier === "low" ? "is-active" : ""}`}
                      onClick={() => setSelectedTier(selectedTier === "low" ? "all" : "low")}
                    >
                      <span className="legend-color-dot dot-low" />
                      <div className="legend-text">
                        <strong>Low-Level ({selectedBusiness.analytics.lowTierPercent}%)</strong>
                        <span>{selectedBusiness.analytics.lowTierCount} accounts • Score &lt; 70%</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tier Cards Breakdown */}
              <div className="chart-card tier-cards-card">
                <div className="card-header">
                  <h3>Prospect Intent Tiers & Action Priority</h3>
                  <span className="card-badge">Conversion Velocity</span>
                </div>

                <div className="tier-cards-stack">
                  {/* High Tier Card */}
                  <div
                    className={`tier-highlight-box high-box ${selectedTier === "high" ? "is-active" : ""}`}
                    onClick={() => setSelectedTier(selectedTier === "high" ? "all" : "high")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="tier-box-header">
                      <span className="tier-tag high-tag">🔥 High-Level Priority</span>
                      <strong>{selectedBusiness.analytics.highTierCount} Accounts</strong>
                    </div>
                    <p className="tier-box-desc">
                      Active hiring surges, verified funding rounds, or tender publications. Prime for multi-touch cadences.
                    </p>
                    <div className="tier-box-footer">
                      <span>Avg Score: <strong>94%</strong></span>
                      <span className="click-action-hint">Click to filter ➜</span>
                    </div>
                  </div>

                  {/* Middle Tier Card */}
                  <div
                    className={`tier-highlight-box mid-box ${selectedTier === "middle" ? "is-active" : ""}`}
                    onClick={() => setSelectedTier(selectedTier === "middle" ? "all" : "middle")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="tier-box-header">
                      <span className="tier-tag mid-tag">⚡ Middle-Level Priority</span>
                      <strong>{selectedBusiness.analytics.middleTierCount} Accounts</strong>
                    </div>
                    <p className="tier-box-desc">
                      Solid ICP firmographic fit with moderate triggers. Recommended for personalized nurture sequences.
                    </p>
                    <div className="tier-box-footer">
                      <span>Avg Score: <strong>81%</strong></span>
                      <span className="click-action-hint">Click to filter ➜</span>
                    </div>
                  </div>

                  {/* Low Tier Card */}
                  <div
                    className={`tier-highlight-box low-box ${selectedTier === "low" ? "is-active" : ""}`}
                    onClick={() => setSelectedTier(selectedTier === "low" ? "all" : "low")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="tier-box-header">
                      <span className="tier-tag low-tag">💤 Low-Level Priority</span>
                      <strong>{selectedBusiness.analytics.lowTierCount} Accounts</strong>
                    </div>
                    <p className="tier-box-desc">
                      Baseline industry match; currently dormant signals. Best suited for automated cold check-ins.
                    </p>
                    <div className="tier-box-footer">
                      <span>Avg Score: <strong>64%</strong></span>
                      <span className="click-action-hint">Click to filter ➜</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buying Signals Breakdown */}
              <div className="chart-card signals-breakdown-card">
                <div className="card-header">
                  <h3>Active Buying Signals Breakdown</h3>
                  <span className="card-badge">{selectedBusiness.analytics.buyingSignalsCount} Live Triggers</span>
                </div>

                <div className="signals-bars-list">
                  <div className="signal-bar-item">
                    <div className="signal-label-row">
                      <span>📈 Active Hiring Surges</span>
                      <strong>{selectedBusiness.analytics.signalBreakdown.hiring} accounts</strong>
                    </div>
                    <div className="signal-progress-track">
                      <div
                        className="signal-progress-fill hiring-fill"
                        style={{
                          width: `${(selectedBusiness.analytics.signalBreakdown.hiring / selectedBusiness.analytics.buyingSignalsCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="signal-bar-item">
                    <div className="signal-label-row">
                      <span>💰 Growth & Funding Rounds</span>
                      <strong>{selectedBusiness.analytics.signalBreakdown.funding} accounts</strong>
                    </div>
                    <div className="signal-progress-track">
                      <div
                        className="signal-progress-fill funding-fill"
                        style={{
                          width: `${(selectedBusiness.analytics.signalBreakdown.funding / selectedBusiness.analytics.buyingSignalsCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="signal-bar-item">
                    <div className="signal-label-row">
                      <span>🏢 Facility & Regional Expansion</span>
                      <strong>{selectedBusiness.analytics.signalBreakdown.expansion} accounts</strong>
                    </div>
                    <div className="signal-progress-track">
                      <div
                        className="signal-progress-fill expansion-fill"
                        style={{
                          width: `${(selectedBusiness.analytics.signalBreakdown.expansion / selectedBusiness.analytics.buyingSignalsCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="signal-bar-item">
                    <div className="signal-label-row">
                      <span>📑 Public Procurement & Tenders</span>
                      <strong>{selectedBusiness.analytics.signalBreakdown.tenders} accounts</strong>
                    </div>
                    <div className="signal-progress-track">
                      <div
                        className="signal-progress-fill tenders-fill"
                        style={{
                          width: `${(selectedBusiness.analytics.signalBreakdown.tenders / selectedBusiness.analytics.buyingSignalsCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              PROSPECT FILTERS & TRIAGE BAR
             ========================================================================= */}
          <div className="prospect-controls-bar">
            {/* Tier Tabs (All, High, Middle, Low) */}
            <div className="tier-tabs-group" role="tablist" aria-label="Prospect Tier Filter">
              <button
                type="button"
                role="tab"
                aria-selected={selectedTier === "all"}
                className={`tier-filter-tab ${selectedTier === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedTier("all")}
              >
                All Prospects ({selectedBusiness.prospects.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedTier === "high"}
                className={`tier-filter-tab high ${selectedTier === "high" ? "is-active" : ""}`}
                onClick={() => setSelectedTier("high")}
              >
                🔥 High-Level ({selectedBusiness.prospects.filter((p) => p.tier === "high").length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedTier === "middle"}
                className={`tier-filter-tab mid ${selectedTier === "middle" ? "is-active" : ""}`}
                onClick={() => setSelectedTier("middle")}
              >
                ⚡ Middle-Level ({selectedBusiness.prospects.filter((p) => p.tier === "middle").length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedTier === "low"}
                className={`tier-filter-tab low ${selectedTier === "low" ? "is-active" : ""}`}
                onClick={() => setSelectedTier("low")}
              >
                💤 Low-Level ({selectedBusiness.prospects.filter((p) => p.tier === "low").length})
              </button>
            </div>

            {/* Search & Trigger Select */}
            <div className="prospect-search-and-select">
              <div className="prospect-search-input-wrap">
                <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={prospectSearchQuery}
                  onChange={(e) => setProspectSearchQuery(e.target.value)}
                  placeholder="Filter prospects by company, decision maker, signal…"
                  aria-label="Filter prospects"
                />
                {prospectSearchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setProspectSearchQuery("")}
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={signalTriggerFilter}
                onChange={(e) => setSignalTriggerFilter(e.target.value)}
                className="signal-trigger-select"
                aria-label="Filter by signal trigger"
              >
                <option value="all">All Intent Triggers</option>
                <option value="hiring">📈 Active Hiring Surge</option>
                <option value="funding">💰 Recent Funding Round</option>
                <option value="expansion">🏢 Facility Expansion</option>
                <option value="tenders">📑 Public RFP / Tenders</option>
              </select>
            </div>
          </div>

          {/* Triage Toolbar (Bulk selection & Quick Actions) */}
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
                  Select All Filtered ({filteredProspects.length})
                </span>
              </label>
              <span className="selected-summary">
                {selectedProspectIds.length} accounts selected
              </span>
            </div>

            <div className="triage-right">
              <button
                type="button"
                className="quick-select-btn"
                onClick={() =>
                  setSelectedProspectIds(
                    filteredProspects.filter((l) => l.tier === "high").map((l) => l.id)
                  )
                }
              >
                ⚡ Select All High-Intent ({filteredProspects.filter((l) => l.tier === "high").length})
              </button>
              <button
                type="button"
                className="quick-select-btn secondary"
                onClick={() => setSelectedProspectIds([])}
                disabled={selectedProspectIds.length === 0}
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* =========================================================================
              PROSPECTS LIST & ACCOUNT ACTIVITY STREAM
              ("Everything that the individual accounts does; we should see it here")
             ========================================================================= */}
          <div className="smart-leads-grid">
            {filteredProspects.length === 0 ? (
              <div className="leads-empty-state">
                <p>No prospects found matching the current tier or search criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTier("all");
                    setProspectSearchQuery("");
                    setSignalTriggerFilter("all");
                  }}
                >
                  Reset Prospect Filters
                </button>
              </div>
            ) : (
              filteredProspects.map((prospect) => {
                const isSelected = selectedProspectIds.includes(prospect.id);
                const isHighTier = prospect.tier === "high";
                const isMidTier = prospect.tier === "middle";

                return (
                  <article
                    key={prospect.id}
                    className={`smart-lead-card ${isSelected ? "is-selected" : ""} ${
                      isHighTier ? "tier-high-card" : isMidTier ? "tier-mid-card" : "tier-low-card"
                    }`}
                    onClick={() => toggleSelectLead(prospect.id)}
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
                          onChange={() => toggleSelectLead(prospect.id)}
                        />
                        <span className="checkbox-custom" />
                      </label>

                      <div className="lead-company-info">
                        <div
                          className="lead-avatar"
                          style={{ backgroundColor: prospect.primaryContact.avatarColor }}
                        >
                          {prospect.company.charAt(0)}
                        </div>
                        <div>
                          <h2>{prospect.company}</h2>
                          <p className="lead-meta">
                            {prospect.location} • {prospect.employees} employees • {prospect.revenue}
                          </p>
                        </div>
                      </div>

                      {/* AI Fit Score Badge */}
                      <div
                        className={`fit-score-badge ${
                          isHighTier ? "top-tier" : isMidTier ? "mid-tier" : "low-tier"
                        }`}
                      >
                        <span className="fit-score-number">⚡ {prospect.fitScore}%</span>
                        <span className="fit-score-label">
                          {isHighTier ? "High Intent" : isMidTier ? "Middle Intent" : "Low Intent"}
                        </span>
                      </div>
                    </div>

                    {/* Intent Signal & Why Now */}
                    <div className="lead-intent-box">
                      <div className="intent-trigger-tag">
                        <span className="fire-icon">🔥</span>
                        <strong>Trigger:</strong> {prospect.intentTrigger}
                      </div>
                      <p className="why-now-text">
                        <strong>Why reach out now:</strong> {prospect.whyNow}
                      </p>
                    </div>

                    {/* Decision Maker Contact Dossier */}
                    <div className="lead-contact-box" onClick={(e) => e.stopPropagation()}>
                      <div
                        className="contact-avatar"
                        style={{ backgroundColor: prospect.primaryContact.avatarColor }}
                      >
                        {prospect.primaryContact.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="contact-details">
                        <div className="contact-header">
                          <strong>{prospect.primaryContact.name}</strong>
                          {prospect.primaryContact.verified && (
                            <span className="verified-badge">✓ Verified Contact</span>
                          )}
                        </div>
                        <span className="contact-title">{prospect.primaryContact.title}</span>
                        <div className="contact-reachouts">
                          <button
                            type="button"
                            className="contact-pill"
                            onClick={(e) => handleCopyEmail(prospect.primaryContact.email, e)}
                            title="Click to copy email"
                          >
                            ✉ {prospect.primaryContact.email}
                            {copiedEmail === prospect.primaryContact.email && (
                              <span className="copied-tag">Copied!</span>
                            )}
                          </button>
                          <a href={`tel:${prospect.primaryContact.phone}`} className="contact-pill">
                            📞 {prospect.primaryContact.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Account Activity Timeline ("Everything that the individual accounts does; we should see it here") */}
                    <div className="account-activity-feed" onClick={(e) => e.stopPropagation()}>
                      <div className="activity-feed-header">
                        <span className="activity-feed-title">
                          📡 Live Account Touches & Activity ({prospect.activities.length})
                        </span>
                        <button
                          type="button"
                          className="open-dossier-link"
                          onClick={() => setDrawerProspect(prospect)}
                        >
                          View Full Dossier ➜
                        </button>
                      </div>

                      <div className="activity-mini-stream">
                        {prospect.activities.slice(0, 2).map((act) => (
                          <div key={act.id} className="activity-mini-item">
                            <span
                              className="activity-badge-dot"
                              style={{ backgroundColor: act.badgeColor }}
                            />
                            <div className="activity-item-content">
                              <span className="activity-time-str">{act.time}</span>
                              <strong className="activity-title-str">{act.title}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer: Tech Stack & Actions */}
                    <div className="lead-card-footer" onClick={(e) => e.stopPropagation()}>
                      <div className="tech-stack-pills">
                        {prospect.techStack.map((tech) => (
                          <span key={tech} className="tech-pill">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="lead-quick-actions">
                        <a
                          href={`https://${prospect.website}`}
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
                              setSelectedProspectIds([...selectedProspectIds, prospect.id]);
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
        </main>
      </div>

      {/* Sticky Bottom Action Bar for Bulk Outreach */}
      <aside className={`smart-leads-sticky-bar ${selectedProspectIds.length > 0 ? "is-active" : ""}`}>
        <div className="sticky-bar-left">
          <div className="sticky-selection-count">
            <strong>{selectedProspectIds.length}</strong>
            <span>{selectedProspectIds.length === 1 ? "Lead" : "Leads"} Selected</span>
          </div>
          <span className="sticky-hint">
            Ready to be enrolled into automated sales cadences for {selectedBusiness.company}.
          </span>
        </div>

        <div className="sticky-bar-actions">
          <button
            type="button"
            className="sticky-btn secondary"
            onClick={() => {
              const csvData = selectedBusiness.prospects
                .filter((l) => selectedProspectIds.includes(l.id))
                .map((l) => `${l.company},${l.primaryContact.name},${l.primaryContact.email}`)
                .join("\n");
              const blob = new Blob([`Company,Contact Name,Email\n${csvData}`], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${selectedBusiness.id}-smart-leads.csv`;
              a.click();
            }}
          >
            Export Selected (CSV)
          </button>
          <button
            type="button"
            className="sticky-btn primary"
            onClick={() => setIsEnrollModalOpen(true)}
          >
            Enroll in Outbound Sequence ({selectedProspectIds.length})
          </button>
        </div>
      </aside>

      {/* Full Dossier Activity Drawer for an Individual Prospect Account */}
      <ProspectDrawer
        isOpen={Boolean(drawerProspect)}
        onClose={() => setDrawerProspect(null)}
        prospect={drawerProspect}
        onEnroll={(p) => {
          setSelectedProspectIds([p.id]);
          setIsEnrollModalOpen(true);
        }}
      />

      {/* Cadence Enrollment Modal */}
      {isEnrollModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsEnrollModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-content cadence-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "540px" }}
          >
            <div className="cadence-icon-wrap">⚡</div>
            <h3>Enroll {selectedProspectIds.length} Prospect{selectedProspectIds.length === 1 ? "" : "s"}</h3>
            <p className="cadence-modal-desc">
              Select the outreach cadence sequence to automatically initiate contact touches for{" "}
              <strong>{selectedBusiness.company}</strong>.
            </p>

            <div className="sequence-selector-list">
              {[
                {
                  id: "enterprise-cadence",
                  title: "Enterprise Multi-Touch Cadence",
                  badge: "Email + Phone + Social",
                  desc: "4-step sequence over 12 days. High personalization with buying intent trigger references.",
                },
                {
                  id: "in-person-intro",
                  title: "In-Person Executive Sync Sequence",
                  badge: "Targeted Outreach",
                  desc: "Focused on securing face-to-face meetings and commercial demos for top-tier decision makers.",
                },
                {
                  id: "fast-track",
                  title: "High-Intent Fast-Track Cadence",
                  badge: "Rapid 3-Day Cycle",
                  desc: "Direct outreach for accounts with urgent hiring or funding signals within the last 14 days.",
                },
              ].map((seq) => (
                <label
                  key={seq.id}
                  className={`sequence-option ${selectedSequence === seq.id ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="cadence-sequence"
                    value={seq.id}
                    checked={selectedSequence === seq.id}
                    onChange={() => setSelectedSequence(seq.id)}
                  />
                  <div className="seq-content">
                    <div className="seq-header">
                      <strong>{seq.title}</strong>
                      <span className="seq-badge">{seq.badge}</span>
                    </div>
                    <p>{seq.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="modal-actions">
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
                Confirm & Launch Sequence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
