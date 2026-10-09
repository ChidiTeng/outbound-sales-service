"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ONBOARDED_LISTENING_BUSINESSES,
  getBusinessSocialVelocityData,
  type OnboardedListeningBusiness,
  type SocialLead,
  type SocialPlatform,
  type SocialVelocityDayPoint,
} from "@/lib/social-listening";
import type { ProspectTier } from "@/lib/smart-leads";
import { SocialDossierDrawer } from "./social-dossier-drawer";

export function SocialListeningView() {
  const businesses = ONBOARDED_LISTENING_BUSINESSES;
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(businesses[0]?.id || "nord-tech");

  // Left-pane filters (Businesses)
  const [businessSearchQuery, setBusinessSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [businessSortBy, setBusinessSortBy] = useState<"prospects" | "fit" | "mentions">("prospects");

  // Right-pane filters (Social Leads under selected business)
  const [selectedTier, setSelectedTier] = useState<"all" | ProspectTier>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | SocialPlatform>("all");
  const [signalCategoryFilter, setSignalCategoryFilter] = useState<string>("all");
  const [leadSearchQuery, setLeadSearchQuery] = useState("");

  // Table Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  // Animated Charts State
  const [velocityMetric, setVelocityMetric] = useState<"mentions" | "cadenceTouches" | "socialReplies">("mentions");
  const [hoveredVelocityPoint, setHoveredVelocityPoint] = useState<SocialVelocityDayPoint | null>(null);
  const [hoveredDonutTier, setHoveredDonutTier] = useState<ProspectTier | null>(null);

  // Selection & bulk triage
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [drawerLead, setDrawerLead] = useState<SocialLead | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState("competitor-switch-cadence");
  const [enableEmailCadence, setEnableEmailCadence] = useState(true);
  const [enableSocialHook, setEnableSocialHook] = useState(true);
  const [enrolledSuccess, setEnrolledSuccess] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [hoveredQuote, setHoveredQuote] = useState<{
    lead: SocialLead;
    rect: { top: number; left: number; bottom: number; width: number; height: number };
  } | null>(null);

  // Active business reference
  const selectedBusiness = useMemo(() => {
    return businesses.find((b) => b.id === selectedBusinessId) || businesses[0];
  }, [businesses, selectedBusinessId]);

  // Reset filters when business changes
  useEffect(() => {
    setSelectedLeadIds([]);
    setSelectedTier("all");
    setSelectedPlatform("all");
    setSignalCategoryFilter("all");
    setLeadSearchQuery("");
    setPage(1);
    setHoveredVelocityPoint(null);
    setHoveredDonutTier(null);
    setHoveredQuote(null);
  }, [selectedBusinessId]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedTier, selectedPlatform, signalCategoryFilter, leadSearchQuery, pageSize]);

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
        if (businessSortBy === "mentions") return b.analytics.socialMentionsCount - a.analytics.socialMentionsCount;
        return 0;
      });
  }, [businesses, businessSearchQuery, selectedIndustry, businessSortBy]);

  // Filtered Social Leads on the Right
  const filteredLeads = useMemo(() => {
    if (!selectedBusiness) return [];
    const q = leadSearchQuery.trim().toLowerCase();

    return selectedBusiness.prospects.filter((lead) => {
      const matchesTier = selectedTier === "all" || lead.tier === selectedTier;
      const matchesPlatform = selectedPlatform === "all" || lead.socialMention.platform === selectedPlatform;
      const matchesCategory =
        signalCategoryFilter === "all" || lead.socialMention.intentCategory === signalCategoryFilter;

      const matchesQuery =
        !q ||
        lead.company.toLowerCase().includes(q) ||
        lead.industry.toLowerCase().includes(q) ||
        lead.location.toLowerCase().includes(q) ||
        lead.primaryContact.name.toLowerCase().includes(q) ||
        lead.socialMention.contentSnippet.toLowerCase().includes(q) ||
        lead.socialMention.intentTrigger.toLowerCase().includes(q) ||
        lead.matchedKeywords.some((k) => k.toLowerCase().includes(q));

      return matchesTier && matchesPlatform && matchesCategory && matchesQuery;
    });
  }, [selectedBusiness, selectedTier, selectedPlatform, signalCategoryFilter, leadSearchQuery]);

  // 14-Day Velocity data
  const velocityData = useMemo(() => {
    return getBusinessSocialVelocityData(selectedBusiness.id);
  }, [selectedBusiness.id]);

  const maxVelocityValue = useMemo(() => {
    return Math.max(...velocityData.map((d) => d[velocityMetric]), 1);
  }, [velocityData, velocityMetric]);

  const totalFilteredCount = filteredLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedLeads = useMemo(() => {
    return filteredLeads.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filteredLeads, safePage, pageSize]);

  function getPaginationPages(current: number, total: number) {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, "...", total];
    }
    if (current >= total - 2) {
      return [1, "...", total - 3, total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  }

  const allFilteredSelected =
    filteredLeads.length > 0 && filteredLeads.every((l) => selectedLeadIds.includes(l.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  }

  function toggleSelectLead(id: string) {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((item) => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  }

  function handleCopyEmail(email: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  }

  function handleLaunchEnrollment() {
    const count = selectedLeadIds.length || 1;
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
            Social Listening Radar • Multi-Business Omnichannel Intent Hub
          </div>
          <h1>Social Listening Engine</h1>
          <p>
            Capture real-time buying intent across LinkedIn, X/Twitter, Reddit, and developer forums for your onboarded client businesses, resolve authors to verified enterprise accounts, and launch high-converting omnichannel outreach.
          </p>
        </div>
      </header>

      {/* Success Notification Banner */}
      {enrolledSuccess !== null && (
        <div className="enrollment-success-banner" role="status" aria-live="polite">
          <div className="success-icon">✓</div>
          <div className="success-text">
            <strong>Successfully Enrolled {enrolledSuccess} Target Accounts into Dual Cadence!</strong>
            <p>
              Simultaneous cold email sequence and contextual social action hook (LinkedIn Note + Twitter/X engagement) queued with real-time intent telemetry.
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
        <aside className="smart-leads-master-pane" aria-label="Onboarded Client Businesses List">
          <div className="pane-header-box">
            <div className="pane-title-row">
              <h2>Onboarded Businesses</h2>
              <span className="count-badge">{businesses.length} Active</span>
            </div>
            <p className="pane-subtitle">
              Select a client business to inspect monitored social streams, intent triggers, and resolved accounts.
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
                <label htmlFor="soc-industry-filter" className="sr-only">Industry</label>
                <select
                  id="soc-industry-filter"
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
                <label htmlFor="soc-sort-filter" className="sr-only">Sort by</label>
                <select
                  id="soc-sort-filter"
                  value={businessSortBy}
                  onChange={(e) => setBusinessSortBy(e.target.value as any)}
                  className="master-filter-select"
                >
                  <option value="prospects">Sort: Social Leads</option>
                  <option value="fit">Sort: Avg AI Intent</option>
                  <option value="mentions">Sort: Mentions Count</option>
                </select>
              </div>
            </div>
          </div>

          {/* Business Cards List */}
          <div className="business-cards-list" role="listbox" aria-label="Select an onboarded business">
            {filteredBusinesses.length === 0 ? (
              <div className="empty-master-state">
                <p>No client businesses found matching your filter criteria.</p>
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
                          <strong>{analytics.totalProspects}</strong> Social Leads
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

                    {/* Keywords & Mentions telemetry */}
                    <div className="biz-card-footer">
                      <span className="biz-owner">{b.monitoredKeywords.length} Active Trackers</span>
                      <span className="biz-emails-count">
                        📡 <strong>{analytics.socialMentionsCount}</strong> hits
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
        <main className="smart-leads-detail-pane" aria-label="Social Intelligence and Discovered Accounts">
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
                {/* Active Monitored Keyword Pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {selectedBusiness.monitoredKeywords.map((kw) => (
                    <span
                      key={kw}
                      style={{
                        fontSize: "11px",
                        background: "rgba(42, 233, 201, 0.08)",
                        color: "#2ae9c9",
                        border: "1px solid rgba(42, 233, 201, 0.25)",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontWeight: 500,
                      }}
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Clean Telemetry Cards */}
            <div className="clean-telemetry-strip">
              <div className="telemetry-pill">
                <span className="telemetry-label">Monitored Trackers</span>
                <strong className="telemetry-val">{selectedBusiness.monitoredKeywords.length}</strong>
                <span className="telemetry-sub">Brand & Competitor Topics</span>
              </div>
              <div className="telemetry-pill highlight">
                <span className="telemetry-label">Discovered Accounts</span>
                <strong className="telemetry-val">{selectedBusiness.analytics.totalProspects}</strong>
                <span className="telemetry-sub text-purple">Resolved ICP Leads</span>
              </div>
              <div className="telemetry-pill">
                <span className="telemetry-label">Avg AI Intent Score</span>
                <strong className="telemetry-val">{selectedBusiness.analytics.avgFitScore}%</strong>
                <span className="telemetry-sub text-mint">Buying Intent Match</span>
              </div>
              <div className="telemetry-pill">
                <span className="telemetry-label">Meetings Converted</span>
                <strong className="telemetry-val">{selectedBusiness.analytics.meetingsBooked}</strong>
                <span className="telemetry-sub">From Social Triggers</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              ANALYTICS & CHARTS SECTION: Animated Charts & Velocity Analytics
             ========================================================================= */}
          <section className="prospect-analytics-section" aria-label="Social Intent Analytics and Tier Distribution">
            <div className="analytics-grid">
              {/* 1. Animated Donut Chart & Dual Radial Gauges Card */}
              <div className="chart-card donut-chart-card">
                <div className="card-header">
                  <div>
                    <h3>Intent Tier & Channel Coverage</h3>
                    <span className="card-subtitle-small">Intent Quality & Verified Decision Maker Reach</span>
                  </div>
                  <span className="card-badge pulse-badge">Live Social Radar</span>
                </div>

                <div className="donut-and-legend">
                  {/* Interactive Animated SVG Donut Chart */}
                  <div className="svg-donut-wrap">
                    <svg viewBox="0 0 120 120" className="donut-svg animated-donut" aria-hidden="true">
                      {/* Base Track */}
                      <circle cx="60" cy="60" r="45" fill="transparent" stroke="#031f26" strokeWidth="14" />
                      {/* High Tier Segment (Purple) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="transparent"
                        stroke="#c974f4"
                        strokeWidth="14"
                        strokeDasharray={`${(selectedBusiness.analytics.highTierPercent * 282.7) / 100} 282.7`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                        className={`donut-anim-segment high-segment ${hoveredDonutTier === "high" ? "is-hovered" : ""}`}
                        onMouseEnter={() => setHoveredDonutTier("high")}
                        onMouseLeave={() => setHoveredDonutTier(null)}
                      />
                      {/* Middle Tier Segment (Amber) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="14"
                        strokeDasharray={`${(selectedBusiness.analytics.middleTierPercent * 282.7) / 100} 282.7`}
                        strokeDashoffset={`-${(selectedBusiness.analytics.highTierPercent * 282.7) / 100}`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                        className={`donut-anim-segment mid-segment ${hoveredDonutTier === "middle" ? "is-hovered" : ""}`}
                        onMouseEnter={() => setHoveredDonutTier("middle")}
                        onMouseLeave={() => setHoveredDonutTier(null)}
                      />
                      {/* Low Tier Segment (Slate) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="transparent"
                        stroke="#64748b"
                        strokeWidth="14"
                        strokeDasharray={`${(selectedBusiness.analytics.lowTierPercent * 282.7) / 100} 282.7`}
                        strokeDashoffset={`-${((selectedBusiness.analytics.highTierPercent + selectedBusiness.analytics.middleTierPercent) * 282.7) / 100}`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                        className={`donut-anim-segment low-segment ${hoveredDonutTier === "low" ? "is-hovered" : ""}`}
                        onMouseEnter={() => setHoveredDonutTier("low")}
                        onMouseLeave={() => setHoveredDonutTier(null)}
                      />
                    </svg>

                    {/* Donut Center Rollup Stat */}
                    <div className="donut-center-stat animated-stat">
                      <strong>
                        {hoveredDonutTier === "high"
                          ? selectedBusiness.analytics.highTierCount
                          : hoveredDonutTier === "middle"
                          ? selectedBusiness.analytics.middleTierCount
                          : hoveredDonutTier === "low"
                          ? selectedBusiness.analytics.lowTierCount
                          : selectedBusiness.analytics.totalProspects}
                      </strong>
                      <span>
                        {hoveredDonutTier === "high"
                          ? "High Intent"
                          : hoveredDonutTier === "middle"
                          ? "Mid Intent"
                          : hoveredDonutTier === "low"
                          ? "Low Intent"
                          : "Total Leads"}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Legend that filters the table below */}
                  <div className="donut-legend-list">
                    <button
                      type="button"
                      className={`legend-item-btn ${selectedTier === "high" ? "is-active" : ""}`}
                      onClick={() => setSelectedTier(selectedTier === "high" ? "all" : "high")}
                      onMouseEnter={() => setHoveredDonutTier("high")}
                      onMouseLeave={() => setHoveredDonutTier(null)}
                    >
                      <span className="legend-color-dot dot-high animated-pulse-dot" />
                      <div className="legend-text">
                        <strong>High-Intent ({selectedBusiness.analytics.highTierPercent}%)</strong>
                        <span>{selectedBusiness.analytics.highTierCount} accounts • Score ≥ 90%</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`legend-item-btn ${selectedTier === "middle" ? "is-active" : ""}`}
                      onClick={() => setSelectedTier(selectedTier === "middle" ? "all" : "middle")}
                      onMouseEnter={() => setHoveredDonutTier("middle")}
                      onMouseLeave={() => setHoveredDonutTier(null)}
                    >
                      <span className="legend-color-dot dot-mid animated-pulse-dot" />
                      <div className="legend-text">
                        <strong>Middle-Intent ({selectedBusiness.analytics.middleTierPercent}%)</strong>
                        <span>{selectedBusiness.analytics.middleTierCount} accounts • Score 70–89%</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`legend-item-btn ${selectedTier === "low" ? "is-active" : ""}`}
                      onClick={() => setSelectedTier(selectedTier === "low" ? "all" : "low")}
                      onMouseEnter={() => setHoveredDonutTier("low")}
                      onMouseLeave={() => setHoveredDonutTier(null)}
                    >
                      <span className="legend-color-dot dot-low" />
                      <div className="legend-text">
                        <strong>Low-Intent ({selectedBusiness.analytics.lowTierPercent}%)</strong>
                        <span>{selectedBusiness.analytics.lowTierCount} accounts • Score &lt; 70%</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Micro Animated Radial Gauges */}
                <div className="dual-radial-gauges">
                  <div className="radial-gauge-item">
                    <div className="gauge-svg-wrap">
                      <svg viewBox="0 0 64 64" className="gauge-svg">
                        <circle cx="32" cy="32" r="26" fill="transparent" stroke="#042028" strokeWidth="6" />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          fill="transparent"
                          stroke="#2ae9c9"
                          strokeWidth="6"
                          strokeDasharray={`${(selectedBusiness.analytics.avgFitScore * 163.3) / 100} 163.3`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          transform="rotate(-90 32 32)"
                          className="radial-gauge-anim-mint"
                        />
                      </svg>
                      <span className="gauge-center-text">{selectedBusiness.analytics.avgFitScore}%</span>
                    </div>
                    <div className="gauge-label-col">
                      <strong>AI Intent Accuracy</strong>
                      <span>Buying intent match</span>
                    </div>
                  </div>

                  <div className="radial-gauge-item">
                    <div className="gauge-svg-wrap">
                      <svg viewBox="0 0 64 64" className="gauge-svg">
                        <circle cx="32" cy="32" r="26" fill="transparent" stroke="#042028" strokeWidth="6" />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          fill="transparent"
                          stroke="#c974f4"
                          strokeWidth="6"
                          strokeDasharray={`${(selectedBusiness.analytics.verifiedContactRate * 163.3) / 100} 163.3`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          transform="rotate(-90 32 32)"
                          className="radial-gauge-anim-purple"
                        />
                      </svg>
                      <span className="gauge-center-text">{selectedBusiness.analytics.verifiedContactRate}%</span>
                    </div>
                    <div className="gauge-label-col">
                      <strong>Resolved Decision Makers</strong>
                      <span>Direct email & phone</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Animated 14-Day Velocity & Social Touches Chart */}
              <div className="chart-card velocity-chart-card">
                <div className="card-header">
                  <div>
                    <h3>14-Day Social & Cadence Velocity</h3>
                    <span className="card-subtitle-small">Social posts matched & omnichannel outreach engagement</span>
                  </div>
                  {/* Metric Switcher Tabs */}
                  <div className="velocity-metric-tabs" role="tablist" aria-label="Velocity Metric Selector">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={velocityMetric === "mentions"}
                      className={`velocity-tab-btn ${velocityMetric === "mentions" ? "is-active" : ""}`}
                      onClick={() => setVelocityMetric("mentions")}
                    >
                      Social Hits
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={velocityMetric === "cadenceTouches"}
                      className={`velocity-tab-btn ${velocityMetric === "cadenceTouches" ? "is-active" : ""}`}
                      onClick={() => setVelocityMetric("cadenceTouches")}
                    >
                      Cadence Touches
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={velocityMetric === "socialReplies"}
                      className={`velocity-tab-btn ${velocityMetric === "socialReplies" ? "is-active" : ""}`}
                      onClick={() => setVelocityMetric("socialReplies")}
                    >
                      Replies & DMs
                    </button>
                  </div>
                </div>

                {/* Animated Bars Container */}
                <div className="velocity-bars-container" role="region" aria-label="Daily touch activity bars">
                  <div className="velocity-bars-row">
                    {velocityData.map((pt, idx) => {
                      const val = pt[velocityMetric];
                      const heightPercent = Math.max(14, Math.round((val / maxVelocityValue) * 100));
                      const isHovered = hoveredVelocityPoint?.day === pt.day;

                      return (
                        <div
                          key={pt.day}
                          className={`velocity-bar-col ${isHovered ? "is-hovered" : ""}`}
                          onMouseEnter={() => setHoveredVelocityPoint(pt)}
                          onMouseLeave={() => setHoveredVelocityPoint(null)}
                          style={{ "--bar-index": idx } as React.CSSProperties}
                        >
                          <div className="bar-track-wrap">
                            <div
                              className={`velocity-bar-fill fill-${velocityMetric === "mentions" ? "touches" : velocityMetric === "cadenceTouches" ? "opens" : "meetings"}`}
                              style={{
                                height: `${heightPercent}%`,
                                animationDelay: `${idx * 40}ms`,
                              }}
                            >
                              {val > 0 && <span className="bar-val-bubble">{val}</span>}
                            </div>
                          </div>
                          <span className="bar-day-label">{pt.dayLabel}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dynamic Tooltip on Hover */}
                  {hoveredVelocityPoint && (
                    <div className="velocity-floating-tooltip" role="tooltip">
                      <div className="tooltip-header">
                        <strong>{hoveredVelocityPoint.day} ({hoveredVelocityPoint.dayLabel})</strong>
                        <span className="tooltip-stat-badge">{hoveredVelocityPoint.mentions} Social Hits</span>
                      </div>
                      <div className="tooltip-metrics-row">
                        <span>📡 Mentions: <strong>{hoveredVelocityPoint.mentions}</strong></span>
                        <span>✉ Touches: <strong>{hoveredVelocityPoint.cadenceTouches}</strong></span>
                        <span>💬 Direct Replies: <strong>{hoveredVelocityPoint.socialReplies}</strong></span>
                        <span>📅 Meetings: <strong>{hoveredVelocityPoint.meetings}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Velocity Telemetry Footer */}
                <div className="velocity-footer-strip">
                  <div className="velocity-mini-stat">
                    <span className="stat-label">14-Day Hits</span>
                    <strong className="stat-num">
                      {velocityData.reduce((acc, curr) => acc + curr.mentions, 0)} signals
                    </strong>
                  </div>
                  <div className="velocity-mini-stat">
                    <span className="stat-label">Daily Avg</span>
                    <strong className="stat-num text-mint">
                      {Math.round(velocityData.reduce((acc, curr) => acc + curr.mentions, 0) / 14)} / day
                    </strong>
                  </div>
                  <div className="velocity-mini-stat">
                    <span className="stat-label">Reply Conversion</span>
                    <strong className="stat-num text-purple">
                      {Math.round(
                        (velocityData.reduce((acc, curr) => acc + curr.socialReplies, 0) /
                          Math.max(1, velocityData.reduce((acc, curr) => acc + curr.mentions, 0))) *
                          100
                      )}%
                    </strong>
                  </div>
                  <div className="velocity-mini-stat">
                    <span className="stat-label">Direct Meetings</span>
                    <strong className="stat-num text-amber">
                      +{velocityData.reduce((acc, curr) => acc + curr.meetings, 0)} booked
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3. Tier Action Priority Cards with Hover Glow */}
              <div className="chart-card tier-cards-card">
                <div className="card-header">
                  <div>
                    <h3>Intent Tiers & Priority</h3>
                    <span className="card-subtitle-small">Engagement recommendation</span>
                  </div>
                  <span className="card-badge">Omnichannel Cadence</span>
                </div>

                <div className="tier-cards-stack">
                  {/* High Tier Card */}
                  <div
                    className={`tier-highlight-box high-box ${selectedTier === "high" ? "is-active" : ""}`}
                    onClick={() => setSelectedTier(selectedTier === "high" ? "all" : "high")}
                    role="button"
                    tabIndex={0}
                    aria-label="Filter high intent accounts"
                  >
                    <div className="tier-box-header">
                      <span className="tier-tag high-tag">🔥 High-Level Priority</span>
                      <strong>{selectedBusiness.analytics.highTierCount} Accounts</strong>
                    </div>
                    <p className="tier-box-desc">
                      Active competitor frustration, immediate vendor recommendation requests, or urgent RFP posts. Prime for Dual Cadence (Email + LinkedIn Hook).
                    </p>
                    <div className="tier-box-footer">
                      <span>Avg Score: <strong>95%</strong></span>
                      <span className="click-action-hint">Click to filter ➜</span>
                    </div>
                  </div>

                  {/* Middle Tier Card */}
                  <div
                    className={`tier-highlight-box mid-box ${selectedTier === "middle" ? "is-active" : ""}`}
                    onClick={() => setSelectedTier(selectedTier === "middle" ? "all" : "middle")}
                    role="button"
                    tabIndex={0}
                    aria-label="Filter middle intent accounts"
                  >
                    <div className="tier-box-header">
                      <span className="tier-tag mid-tag">⚡ Middle-Level Priority</span>
                      <strong>{selectedBusiness.analytics.middleTierCount} Accounts</strong>
                    </div>
                    <p className="tier-box-desc">
                      Category evaluation inquiries, developer telemetry questions, or workflow pain points. Recommended for value-driven content sequences.
                    </p>
                    <div className="tier-box-footer">
                      <span>Avg Score: <strong>83%</strong></span>
                      <span className="click-action-hint">Click to filter ➜</span>
                    </div>
                  </div>

                  {/* Low Tier Card */}
                  <div
                    className={`tier-highlight-box low-box ${selectedTier === "low" ? "is-active" : ""}`}
                    onClick={() => setSelectedTier(selectedTier === "low" ? "all" : "low")}
                    role="button"
                    tabIndex={0}
                    aria-label="Filter low intent accounts"
                  >
                    <div className="tier-box-header">
                      <span className="tier-tag low-tag">💤 Low-Level Priority</span>
                      <strong>{selectedBusiness.analytics.lowTierCount} Accounts</strong>
                    </div>
                    <p className="tier-box-desc">
                      General trade fair announcements and passive industry trend posts. Best suited for low-frequency brand nurturing.
                    </p>
                    <div className="tier-box-footer">
                      <span>Avg Score: <strong>66%</strong></span>
                      <span className="click-action-hint">Click to filter ➜</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Social Buying Signals Breakdown */}
              <div className="chart-card signals-breakdown-card">
                <div className="card-header">
                  <div>
                    <h3>Social Signal Breakdown</h3>
                    <span className="card-subtitle-small">Market triggers detected across social listening streams</span>
                  </div>
                  <span className="card-badge pulse-badge">{selectedBusiness.analytics.socialMentionsCount} Live Hits</span>
                </div>

                <div className="signals-bars-list">
                  <div className="signal-bar-item">
                    <div className="signal-label-row">
                      <span>🔄 Competitor Frustration & Churn</span>
                      <strong>{selectedBusiness.analytics.signalBreakdown.competitorSwitch} accounts</strong>
                    </div>
                    <div className="signal-progress-track">
                      <div
                        className="signal-progress-fill hiring-fill animated-shimmer-bar"
                        style={{
                          width: `${(selectedBusiness.analytics.signalBreakdown.competitorSwitch / Math.max(1, selectedBusiness.analytics.totalProspects)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="signal-bar-item">
                    <div className="signal-label-row">
                      <span>💡 Tooling & Partner Recommendations</span>
                      <strong>{selectedBusiness.analytics.signalBreakdown.recommendations} accounts</strong>
                    </div>
                    <div className="signal-progress-track">
                      <div
                        className="signal-progress-fill funding-fill animated-shimmer-bar"
                        style={{
                          width: `${(selectedBusiness.analytics.signalBreakdown.recommendations / Math.max(1, selectedBusiness.analytics.totalProspects)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="signal-bar-item">
                    <div className="signal-label-row">
                      <span>🚨 Workflow Bottlenecks & Pain Points</span>
                      <strong>{selectedBusiness.analytics.signalBreakdown.painPoints} accounts</strong>
                    </div>
                    <div className="signal-progress-track">
                      <div
                        className="signal-progress-fill expansion-fill animated-shimmer-bar"
                        style={{
                          width: `${(selectedBusiness.analytics.signalBreakdown.painPoints / Math.max(1, selectedBusiness.analytics.totalProspects)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="signal-bar-item">
                    <div className="signal-label-row">
                      <span>📈 Stack Expansion & Hiring Mentions</span>
                      <strong>{selectedBusiness.analytics.signalBreakdown.hiringSpikes} accounts</strong>
                    </div>
                    <div className="signal-progress-track">
                      <div
                        className="signal-progress-fill tenders-fill animated-shimmer-bar"
                        style={{
                          width: `${(selectedBusiness.analytics.signalBreakdown.hiringSpikes / Math.max(1, selectedBusiness.analytics.totalProspects)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              WHITE TABLE COMPONENT: Paginated Discovered Accounts & Social Radar Directory
             ========================================================================= */}
          <section className="prospects-white-card" aria-label="Discovered Accounts & Social Radar Directory">
            {/* Header: Title, Intent Tier Tabs & Controls */}
            <div className="prospects-card-header">
              <div className="prospects-header-left">
                <div className="prospects-title-group">
                  <h2>Discovered Accounts & Social Radar</h2>
                  <span className="prospects-count-badge">
                    {filteredLeads.length} {filteredLeads.length === 1 ? "Account" : "Accounts"}
                  </span>
                </div>

                {/* Intent Tier Filter Tabs */}
                <div className="prospects-tier-tabs" role="tablist" aria-label="Filter by Intent Tier">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedTier === "all"}
                    className={`tier-tab-pill ${selectedTier === "all" ? "is-active" : ""}`}
                    onClick={() => {
                      setSelectedTier("all");
                      setPage(1);
                    }}
                  >
                    All Accounts ({selectedBusiness.prospects.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedTier === "high"}
                    className={`tier-tab-pill tier-high ${selectedTier === "high" ? "is-active" : ""}`}
                    onClick={() => {
                      setSelectedTier("high");
                      setPage(1);
                    }}
                  >
                    🔥 High-Level ({selectedBusiness.prospects.filter((p) => p.tier === "high").length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedTier === "middle"}
                    className={`tier-tab-pill tier-mid ${selectedTier === "middle" ? "is-active" : ""}`}
                    onClick={() => {
                      setSelectedTier("middle");
                      setPage(1);
                    }}
                  >
                    ⚡ Middle-Level ({selectedBusiness.prospects.filter((p) => p.tier === "middle").length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedTier === "low"}
                    className={`tier-tab-pill tier-low ${selectedTier === "low" ? "is-active" : ""}`}
                    onClick={() => {
                      setSelectedTier("low");
                      setPage(1);
                    }}
                  >
                    💤 Low-Level ({selectedBusiness.prospects.filter((p) => p.tier === "low").length})
                  </button>
                </div>
              </div>

              {/* Header Right: Platform Tabs, Category Selector & Search */}
              <div className="prospects-header-right">
                {/* Social Platform Tabs */}
                <div className="social-platform-tabs" role="tablist" aria-label="Filter by Social Platform">
                  <button
                    type="button"
                    role="tab"
                    className={`social-platform-pill ${selectedPlatform === "all" ? "is-active" : ""}`}
                    onClick={() => {
                      setSelectedPlatform("all");
                      setPage(1);
                    }}
                  >
                    All Platforms
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={`social-platform-pill plat-linkedin ${selectedPlatform === "linkedin" ? "is-active" : ""}`}
                    onClick={() => {
                      setSelectedPlatform(selectedPlatform === "linkedin" ? "all" : "linkedin");
                      setPage(1);
                    }}
                  >
                    LinkedIn
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={`social-platform-pill plat-twitter ${selectedPlatform === "twitter" ? "is-active" : ""}`}
                    onClick={() => {
                      setSelectedPlatform(selectedPlatform === "twitter" ? "all" : "twitter");
                      setPage(1);
                    }}
                  >
                    X / Twitter
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={`social-platform-pill plat-reddit ${selectedPlatform === "reddit" ? "is-active" : ""}`}
                    onClick={() => {
                      setSelectedPlatform(selectedPlatform === "reddit" ? "all" : "reddit");
                      setPage(1);
                    }}
                  >
                    Reddit
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={`social-platform-pill plat-github ${selectedPlatform === "github" ? "is-active" : ""}`}
                    onClick={() => {
                      setSelectedPlatform(selectedPlatform === "github" ? "all" : "github");
                      setPage(1);
                    }}
                  >
                    GitHub
                  </button>
                </div>

                <select
                  value={signalCategoryFilter}
                  onChange={(e) => {
                    setSignalCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="prospects-trigger-select"
                  aria-label="Filter by signal category"
                >
                  <option value="all">All Intent Triggers</option>
                  <option value="competitor_switch">🔄 Competitor Frustration / Churn</option>
                  <option value="recommendation_request">💡 Recommendation Requests</option>
                  <option value="pain_point">🚨 Workflow Pain Points</option>
                  <option value="industry_trend">📈 Industry Discussions</option>
                </select>

                <div className="prospects-search-box">
                  <svg
                    className="search-icon"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={leadSearchQuery}
                    onChange={(e) => {
                      setLeadSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search account, author, keyword, or snippet…"
                    aria-label="Search social leads"
                  />
                  {leadSearchQuery && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => {
                        setLeadSearchQuery("");
                        setPage(1);
                      }}
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Triage Sub-Bar: Bulk selection, Quick High-Intent selector & Rows per page */}
            <div className="prospects-triage-bar">
              <div className="triage-bar-left">
                <label className="table-checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all filtered accounts"
                  />
                  <span className="table-checkbox-label">
                    Select All Filtered ({totalFilteredCount})
                  </span>
                </label>
                {selectedLeadIds.length > 0 && (
                  <span className="triage-selection-badge">
                    {selectedLeadIds.length} {selectedLeadIds.length === 1 ? "account" : "accounts"} selected
                  </span>
                )}
                <button
                  type="button"
                  className="triage-quick-btn"
                  onClick={() =>
                    setSelectedLeadIds(
                      filteredLeads.filter((l) => l.tier === "high").map((l) => l.id)
                    )
                  }
                  title="Select all accounts with High Intent tier"
                >
                  ⚡ Select High-Intent ({filteredLeads.filter((l) => l.tier === "high").length})
                </button>
                {selectedLeadIds.length > 0 && (
                  <button
                    type="button"
                    className="triage-clear-btn"
                    onClick={() => setSelectedLeadIds([])}
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              <div className="triage-bar-right">
                <div className="page-size-selector">
                  <label htmlFor="soc-page-size-select">Rows per page:</label>
                  <select
                    id="soc-page-size-select"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                {selectedLeadIds.length > 0 && (
                  <button
                    type="button"
                    className="triage-enroll-cta"
                    onClick={() => setIsEnrollModalOpen(true)}
                  >
                    🚀 Dual Enroll Selected ({selectedLeadIds.length})
                  </button>
                )}
              </div>
            </div>

            {/* Table Content or Empty State */}
            {filteredLeads.length === 0 ? (
              <div className="table-empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No social leads match your current criteria</h3>
                <p>Try resetting the intent tier, social platform, or keyword search.</p>
                <button
                  type="button"
                  className="empty-reset-btn"
                  onClick={() => {
                    setSelectedTier("all");
                    setSelectedPlatform("all");
                    setSignalCategoryFilter("all");
                    setLeadSearchQuery("");
                    setPage(1);
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="prospects-table-wrapper">
                <table className="prospects-white-table" role="grid" aria-label="Social Leads Table">
                  <thead>
                    <tr>
                      <th className="th-check" style={{ width: "44px" }}>
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="th-company" style={{ width: "26%" }}>
                        Company & Firmographics
                      </th>
                      <th className="th-signal" style={{ width: "32%" }}>
                        Social Intent & Quoted Post
                      </th>
                      <th className="th-contact" style={{ width: "20%" }}>
                        Verified Decision Maker
                      </th>
                      <th className="th-fit" style={{ width: "10%" }}>
                        Intent Fit
                      </th>
                      <th className="th-actions" style={{ width: "12%", textAlign: "right" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLeads.map((lead) => {
                      const isSelected = selectedLeadIds.includes(lead.id);
                      const isHigh = lead.tier === "high";
                      const isMid = lead.tier === "middle";
                      const plat = lead.socialMention.platform;

                      return (
                        <tr
                          key={lead.id}
                          className={`prospect-row ${isSelected ? "is-selected" : ""}`}
                          onClick={() => setDrawerLead(lead)}
                          tabIndex={0}
                          aria-label={`View dossier for ${lead.company}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setDrawerLead(lead);
                            }
                          }}
                        >
                          {/* 1. Multi-select Checkbox */}
                          <td className="td-check" onClick={(e) => e.stopPropagation()}>
                            <label className="table-checkbox-wrap">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectLead(lead.id)}
                                aria-label={`Select ${lead.company}`}
                              />
                            </label>
                          </td>

                          {/* 2. Company Name, Avatar & Firmographics */}
                          <td className="td-company">
                            <div className="company-cell-inner">
                              <div
                                className="company-avatar-box"
                                style={{ backgroundColor: lead.primaryContact.avatarColor }}
                                aria-hidden="true"
                              >
                                {lead.company.charAt(0)}
                              </div>
                              <div className="company-meta-col">
                                <div className="company-headline-row">
                                  <strong className="company-name-text">
                                    {lead.company}
                                  </strong>
                                  <span className="company-industry-tag">
                                    {lead.industry}
                                  </span>
                                </div>
                                <p className="company-sub-meta">
                                  {lead.location} • {lead.employees} emp • {lead.revenue}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 3. Social Intent & Quoted Post Snippet */}
                          <td className="td-signal">
                            <div className="signal-cell-inner">
                              <div className="signal-trigger-row" style={{ gap: "8px" }}>
                                <span className={`social-platform-tag tag-${plat}`}>
                                  {plat === "linkedin"
                                    ? "LinkedIn"
                                    : plat === "twitter"
                                    ? "X / Twitter"
                                    : plat === "reddit"
                                    ? "Reddit"
                                    : "GitHub"}
                                </span>
                                <span
                                  className={`table-fit-pill ${
                                    isHigh ? "pill-high" : isMid ? "pill-mid" : "pill-low"
                                  }`}
                                  style={{ padding: "1px 6px", fontSize: "10px" }}
                                >
                                  {isHigh ? "🔥 High-Intent" : isMid ? "⚡ Mid-Intent" : "💤 Low-Intent"}
                                </span>
                                <span style={{ fontSize: "10.5px", color: "#64748b", marginLeft: "auto" }}>
                                  {lead.socialMention.postedAt}
                                </span>
                              </div>

                              {/* Quoted Post Box with clean 2-line ellipsis and hover popover trigger */}
                              <div
                                className={`social-mention-quote-box border-${plat}`}
                                onMouseEnter={(e) => {
                                  const r = e.currentTarget.getBoundingClientRect();
                                  setHoveredQuote({
                                    lead,
                                    rect: { top: r.top, left: r.left, bottom: r.bottom, width: r.width, height: r.height },
                                  });
                                }}
                                onMouseLeave={() => setHoveredQuote(null)}
                              >
                                "{lead.socialMention.contentSnippet}"
                              </div>

                              {/* Trigger line */}
                              <div className="social-trigger-meta-row">
                                <strong>Trigger:</strong>
                                <span>{lead.socialMention.intentTrigger}</span>
                              </div>
                            </div>
                          </td>

                          {/* 4. Verified Decision Maker */}
                          <td className="td-contact" onClick={(e) => e.stopPropagation()}>
                            <div className="contact-cell-inner">
                              <div className="contact-name-row">
                                <strong className="contact-name-text">{lead.primaryContact.name}</strong>
                                {lead.primaryContact.verified && (
                                  <span className="contact-verified-badge" title="Verified buyer contact">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <span className="contact-title-text">{lead.primaryContact.title}</span>
                              <div className="contact-micro-actions">
                                <button
                                  type="button"
                                  className="contact-copy-pill"
                                  onClick={(e) => handleCopyEmail(lead.primaryContact.email, e)}
                                  title="Click to copy email address"
                                >
                                  ✉ {copiedEmail === lead.primaryContact.email ? "Copied!" : "Email"}
                                </button>
                                {lead.primaryContact.linkedin && (
                                  <a
                                    href={lead.primaryContact.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-website-link"
                                    title="Open LinkedIn profile"
                                  >
                                    in ↗
                                  </a>
                                )}
                                <a
                                  href={`https://${lead.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="contact-website-link"
                                  title="Open website"
                                >
                                  Site ↗
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* 5. Intent Fit Score & Cadence Status */}
                          <td className="td-fit">
                            <div className="fit-cell-inner">
                              <span
                                className={`table-fit-pill ${
                                  isHigh ? "pill-high" : isMid ? "pill-mid" : "pill-low"
                                }`}
                              >
                                ⚡ {lead.fitScore}% Fit
                              </span>
                              <span
                                className={`table-status-pill status-${lead.status.toLowerCase().replace(/\s+/g, "-")}`}
                              >
                                {lead.status}
                              </span>
                            </div>
                          </td>

                          {/* 6. Actions */}
                          <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                            <div className="actions-cell-inner">
                              <button
                                type="button"
                                className="table-drawer-cta-btn"
                                onClick={() => setDrawerLead(lead)}
                                title="Open social lead dossier in right slide-over drawer"
                              >
                                Dossier ➜
                              </button>
                              <button
                                type="button"
                                className="table-sequence-cta-btn"
                                onClick={() => {
                                  setSelectedLeadIds([lead.id]);
                                  setIsEnrollModalOpen(true);
                                }}
                                title="Enroll into omnichannel sequence (Email + Social Hook)"
                              >
                                + Dual Enroll
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {filteredLeads.length > 0 && (
              <div className="prospects-table-pagination" role="navigation" aria-label="Social leads pagination">
                <div className="pagination-info-left">
                  Showing <strong>{(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, totalFilteredCount)}</strong> of{" "}
                  <strong>{totalFilteredCount}</strong> social accounts
                </div>

                <div className="pagination-controls-center">
                  <button
                    type="button"
                    className="page-nav-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    aria-label="Previous page"
                  >
                    ‹ Prev
                  </button>

                  <div className="page-numbers-group">
                    {getPaginationPages(safePage, totalPages).map((p, idx) =>
                      typeof p === "number" ? (
                        <button
                          key={p}
                          type="button"
                          className={`page-number-btn ${p === safePage ? "is-active" : ""}`}
                          onClick={() => setPage(p)}
                          aria-label={`Page ${p}`}
                          aria-current={p === safePage ? "page" : undefined}
                        >
                          {p}
                        </button>
                      ) : (
                        <span key={`ellipsis-${idx}`} className="page-ellipsis">
                          …
                        </span>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    className="page-nav-btn"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    aria-label="Next page"
                  >
                    Next ›
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Slide-Over Dossier Drawer */}
      <SocialDossierDrawer
        isOpen={drawerLead !== null}
        onClose={() => setDrawerLead(null)}
        lead={drawerLead}
        onEnroll={(lead) => {
          setSelectedLeadIds([lead.id]);
          setIsEnrollModalOpen(true);
        }}
      />

      {/* Dual Cadence Enrollment Modal */}
      {isEnrollModalOpen && (
        <div className="enroll-modal-backdrop" onClick={() => setIsEnrollModalOpen(false)}>
          <div className="enroll-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Launch Omnichannel Outbound Cadence</h2>
                <p>
                  Simultaneously enroll target accounts into cold email cadences and automated social action hooks.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsEnrollModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="enrolling-count-banner">
                <span>Enrolling Target Accounts:</span>
                <strong>{selectedLeadIds.length} Accounts Queued</strong>
              </div>

              {/* Dual Channel Toggles (Both Email Sequence & Social Action Hook) */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
                <strong style={{ fontSize: "12px", color: "#0f172a", display: "block", marginBottom: "10px" }}>
                  Select Omnichannel Outreach Channels:
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "12.5px", color: "#1e293b" }}>
                    <input
                      type="checkbox"
                      checked={enableEmailCadence}
                      onChange={(e) => setEnableEmailCadence(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#7c3aed" }}
                    />
                    <div>
                      <strong>📧 Direct Outbound Email Cadence</strong>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                        Day 1 intro email citing the author's exact post snippet with personalized value hook.
                      </div>
                    </div>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "12.5px", color: "#1e293b" }}>
                    <input
                      type="checkbox"
                      checked={enableSocialHook}
                      onChange={(e) => setEnableSocialHook(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#7c3aed" }}
                    />
                    <div>
                      <strong>🤝 Contextual Social Action Hook (LinkedIn Connection / DM)</strong>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                        Queue personalized connection note and track engagement responses directly in CRM.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Sequence Selector */}
              <div className="sequence-picker-wrap">
                <label htmlFor="soc-sequence-select">Select Outbound Sequence</label>
                <select
                  id="soc-sequence-select"
                  value={selectedSequence}
                  onChange={(e) => setSelectedSequence(e.target.value)}
                >
                  <option value="competitor-switch-cadence">
                    🔄 Competitor Switch Sequence (4-Step Multi-touch: Email + Social Hook)
                  </option>
                  <option value="vendor-recommendation-cadence">
                    💡 Vendor Recommendation Response Sequence (3-Step Fast Cadence)
                  </option>
                  <option value="pain-point-cadence">
                    🚨 Workflow Bottleneck Resolution Cadence (5-Step Enterprise Cadence)
                  </option>
                </select>
              </div>

              <div className="cadence-steps-preview">
                <h4>Sequence Workflow Summary:</h4>
                <ul>
                  <li>
                    <strong>Step 1 (Immediate):</strong> Contextual Social Connection Note referencing live inquiry post.
                  </li>
                  <li>
                    <strong>Step 2 (+2 hours):</strong> Day 1 Intro Email with relevant case study & calibration data.
                  </li>
                  <li>
                    <strong>Step 3 (+3 days):</strong> Automated follow-up referencing technical benchmark report.
                  </li>
                  <li>
                    <strong>Step 4 (+6 days):</strong> Meeting sync offer with client lead specialist.
                  </li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
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
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
                  color: "#ffffff",
                }}
                onClick={handleLaunchEnrollment}
              >
                Launch Dual Cadence Now ➜
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Social Post Full Text Popover */}
      {hoveredQuote && (
        <div
          className="social-quote-floating-popover"
          style={{
            top: `${Math.min(
              typeof window !== "undefined" ? window.innerHeight - 260 : 600,
              Math.max(12, hoveredQuote.rect.bottom + 8)
            )}px`,
            left: `${Math.max(
              16,
              Math.min(
                typeof window !== "undefined" ? window.innerWidth - 460 : 800,
                hoveredQuote.rect.left - 10
              )
            )}px`,
          }}
          onMouseEnter={() => {}}
          onMouseLeave={() => setHoveredQuote(null)}
          role="tooltip"
          aria-label="Full post preview"
        >
          <div className="quote-popover-header">
            <div className="quote-popover-author">
              <span className={`social-platform-tag tag-${hoveredQuote.lead.socialMention.platform}`}>
                {hoveredQuote.lead.socialMention.platform === "linkedin"
                  ? "LinkedIn"
                  : hoveredQuote.lead.socialMention.platform === "twitter"
                  ? "X / Twitter"
                  : hoveredQuote.lead.socialMention.platform === "reddit"
                  ? "Reddit"
                  : "GitHub"}
              </span>
              <strong>{hoveredQuote.lead.primaryContact.name}</strong>
              <span>({hoveredQuote.lead.socialMention.authorHandle})</span>
            </div>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              {hoveredQuote.lead.socialMention.postedAt}
            </span>
          </div>

          <p className="quote-popover-text">
            "{hoveredQuote.lead.socialMention.fullContent || hoveredQuote.lead.socialMention.contentSnippet}"
          </p>

          <div className="quote-popover-footer">
            <div>
              <span>👍 {hoveredQuote.lead.socialMention.engagementStats.likes} likes</span> •{" "}
              <span>💬 {hoveredQuote.lead.socialMention.engagementStats.comments} comments</span> •{" "}
              <span>🔁 {hoveredQuote.lead.socialMention.engagementStats.reposts} reposts</span>
            </div>
            <a
              href={hoveredQuote.lead.socialMention.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              View Live Post ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
