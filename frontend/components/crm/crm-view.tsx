"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ONBOARDED_CRM_BUSINESSES,
  getBusinessCrmVelocityData,
  getStageLabel,
  type OnboardedCrmBusiness,
  type CrmDeal,
  type CrmDealStage,
  type CrmVelocityDayPoint,
} from "@/lib/crm";
import type { ProspectTier } from "@/lib/smart-leads";
import { CrmDossierDrawer } from "./crm-dossier-drawer";

export function CrmView() {
  const businesses = ONBOARDED_CRM_BUSINESSES;
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(businesses[0]?.id || "nord-tech");

  // Left-pane filters (Businesses)
  const [businessSearchQuery, setBusinessSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [businessSortBy, setBusinessSortBy] = useState<"deals" | "pipeline" | "winRate">("pipeline");

  // Right-pane filters (Deals under selected business)
  const [selectedTier, setSelectedTier] = useState<"all" | ProspectTier>("all");
  const [selectedStage, setSelectedStage] = useState<"all" | CrmDealStage>("all");
  const [dealSearchQuery, setDealSearchQuery] = useState("");

  // Table Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  // Animated Charts State
  const [velocityMetric, setVelocityMetric] = useState<"stageProgressions" | "salesTouches" | "revenueMoved">("stageProgressions");
  const [hoveredVelocityPoint, setHoveredVelocityPoint] = useState<CrmVelocityDayPoint | null>(null);
  const [hoveredDonutTier, setHoveredDonutTier] = useState<ProspectTier | null>(null);

  // View Mode: Table Directory vs Kanban Stage Board
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [isSyncing, setIsSyncing] = useState(false);

  // Selection & bulk triage
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [drawerDeal, setDrawerDeal] = useState<CrmDeal | null>(null);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [targetStageToAdvance, setTargetStageToAdvance] = useState<CrmDealStage>("negotiation");
  const [advancedSuccess, setAdvancedSuccess] = useState<{ count: number; stage: string } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Active business reference
  const selectedBusiness = useMemo(() => {
    return businesses.find((b) => b.id === selectedBusinessId) || businesses[0];
  }, [businesses, selectedBusinessId]);

  // Reset filters when business changes
  useEffect(() => {
    setSelectedDealIds([]);
    setSelectedTier("all");
    setSelectedStage("all");
    setDealSearchQuery("");
    setPage(1);
    setHoveredVelocityPoint(null);
    setHoveredDonutTier(null);
  }, [selectedBusinessId]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedTier, selectedStage, dealSearchQuery, pageSize]);

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
        if (businessSortBy === "deals") return b.analytics.totalDeals - a.analytics.totalDeals;
        if (businessSortBy === "pipeline") return b.analytics.pipelineValueNum - a.analytics.pipelineValueNum;
        if (businessSortBy === "winRate") return b.analytics.winRatePercent - a.analytics.winRatePercent;
        return 0;
      });
  }, [businesses, businessSearchQuery, selectedIndustry, businessSortBy]);

  // Filtered Deals on the Right
  const filteredDeals = useMemo(() => {
    if (!selectedBusiness) return [];
    const q = dealSearchQuery.trim().toLowerCase();

    return selectedBusiness.deals.filter((deal) => {
      const matchesTier = selectedTier === "all" || deal.tier === selectedTier;
      const matchesStage = selectedStage === "all" || deal.stage === selectedStage;

      const matchesQuery =
        !q ||
        deal.company.toLowerCase().includes(q) ||
        deal.industry.toLowerCase().includes(q) ||
        deal.location.toLowerCase().includes(q) ||
        deal.primaryContact.name.toLowerCase().includes(q) ||
        deal.dealTrigger.toLowerCase().includes(q) ||
        deal.owner.toLowerCase().includes(q);

      return matchesTier && matchesStage && matchesQuery;
    });
  }, [selectedBusiness, selectedTier, selectedStage, dealSearchQuery]);

  // 14-Day Velocity data
  const velocityData = useMemo(() => {
    return getBusinessCrmVelocityData(selectedBusiness.id);
  }, [selectedBusiness.id]);

  const maxVelocityValue = useMemo(() => {
    return Math.max(...velocityData.map((d) => d[velocityMetric]), 1);
  }, [velocityData, velocityMetric]);

  const totalFilteredCount = filteredDeals.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedDeals = useMemo(() => {
    return filteredDeals.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filteredDeals, safePage, pageSize]);

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
    filteredDeals.length > 0 && filteredDeals.every((d) => selectedDealIds.includes(d.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedDealIds([]);
    } else {
      setSelectedDealIds(filteredDeals.map((d) => d.id));
    }
  }

  function toggleSelectDeal(id: string) {
    if (selectedDealIds.includes(id)) {
      setSelectedDealIds(selectedDealIds.filter((item) => item !== id));
    } else {
      setSelectedDealIds([...selectedDealIds, id]);
    }
  }

  function handleCopyEmail(email: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  }

  function handleAdvanceStageSubmit() {
    const count = selectedDealIds.length || 1;
    const stageLabel = getStageLabel(targetStageToAdvance).label;
    setIsAdvanceModalOpen(false);
    setAdvancedSuccess({ count, stage: stageLabel });
    setTimeout(() => {
      setAdvancedSuccess(null);
    }, 7000);
  }

  function handleTriggerSync() {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
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
          <div className="smart-leads-badge" style={{ background: "rgba(124, 58, 237, 0.15)", color: "#a855f7", borderColor: "rgba(124, 58, 237, 0.3)" }}>
            <span className="pulsing-dot" style={{ background: "#a855f7" }} />
            Enterprise CRM Hub • Live Pipeline Telemetry & Bi-Directional Sync
          </div>
          <h1>Customer Relationship Management Engine</h1>
          <p>
            Seamlessly monitor enterprise sales pipelines for your onboarded client businesses, track deal velocity across pipeline stages, resolve economic buyers, and advance multi-threaded opportunities.
          </p>
        </div>
      </header>

      {/* Success Notification Banner */}
      {advancedSuccess !== null && (
        <div className="enrollment-success-banner" role="status" aria-live="polite">
          <div className="success-icon">✓</div>
          <div className="success-text">
            <strong>Successfully Advanced {advancedSuccess.count} Opportunities to "{advancedSuccess.stage}"!</strong>
            <p>
              CRM stages updated and sync telemetry transmitted to {selectedBusiness.crmSystem}. Relevant sales sequences and legal checklists have been notified.
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
              Select a client business to inspect active pipelines, deal stages, and revenue velocity.
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
                <label htmlFor="crm-industry-filter" className="sr-only">Industry</label>
                <select
                  id="crm-industry-filter"
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
                <label htmlFor="crm-sort-filter" className="sr-only">Sort by</label>
                <select
                  id="crm-sort-filter"
                  value={businessSortBy}
                  onChange={(e) => setBusinessSortBy(e.target.value as any)}
                  className="master-filter-select"
                >
                  <option value="pipeline">Sort: Pipeline Value</option>
                  <option value="deals">Sort: Total Deals</option>
                  <option value="winRate">Sort: Win Rate %</option>
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

                    {/* Micro-bar: Pipeline Value & Stage Breakdown */}
                    <div className="biz-prospects-bar-wrap">
                      <div className="bar-labels">
                        <span className="total-pool-label">
                          <strong>{analytics.pipelineValue}</strong> Pipeline
                        </span>
                        <span className="tier-breakdown-mini">
                          <span className="text-high">{analytics.stageBreakdown.negotiation} Neg</span>
                          {" / "}
                          <span className="text-mid">{analytics.stageBreakdown.proposal_sent} Prop</span>
                          {" / "}
                          <span className="text-low">{analytics.totalDeals} Deals</span>
                        </span>
                      </div>
                      <div className="mini-segmented-progress" aria-hidden="true">
                        <div
                          className="segment-high"
                          style={{ width: `${Math.round((analytics.stageBreakdown.negotiation / analytics.totalDeals) * 100)}%` }}
                          title={`Negotiation: ${analytics.stageBreakdown.negotiation}`}
                        />
                        <div
                          className="segment-mid"
                          style={{ width: `${Math.round((analytics.stageBreakdown.proposal_sent / analytics.totalDeals) * 100)}%` }}
                          title={`Proposal Sent: ${analytics.stageBreakdown.proposal_sent}`}
                        />
                        <div
                          className="segment-low"
                          style={{ width: `${Math.round(((analytics.totalDeals - analytics.stageBreakdown.negotiation - analytics.stageBreakdown.proposal_sent) / analytics.totalDeals) * 100)}%` }}
                          title="Other Stages"
                        />
                      </div>
                    </div>

                    {/* CRM Integration & Sync telemetry */}
                    <div className="biz-card-footer">
                      <span className="biz-owner" style={{ color: "#7c3aed", fontWeight: 600 }}>
                        ☁ {b.crmSystem.split(" ")[0]}
                      </span>
                      <span className="biz-emails-count">
                        🔄 <strong>{b.lastSyncTime}</strong>
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* =========================================================================
            RIGHT DETAIL PANE: Selected Business CRM Intelligence & Deals Pipeline
           ========================================================================= */}
        <main className="smart-leads-detail-pane" aria-label="CRM Opportunities and Revenue Pipeline">
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
                  <span className="crm-badge" style={{ background: "rgba(124, 58, 237, 0.1)", color: "#a855f7", border: "1px solid rgba(124, 58, 237, 0.25)", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px" }}>
                    ☁ {selectedBusiness.crmSystem}
                  </span>
                </div>
                <p className="profile-meta">
                  Managed by <strong>{selectedBusiness.owner}</strong> • Synced: {selectedBusiness.lastSyncTime} •{" "}
                  <a
                    href={`https://${selectedBusiness.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="website-link"
                  >
                    {selectedBusiness.website} ↗
                  </a>
                </p>
                {/* Stage Rollup Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  <span style={{ fontSize: "11px", background: "rgba(124, 58, 237, 0.08)", color: "#7c3aed", border: "1px solid rgba(124, 58, 237, 0.2)", padding: "2px 8px", borderRadius: "10px", fontWeight: 500 }}>
                    {selectedBusiness.analytics.stageBreakdown.discovery} Discovery
                  </span>
                  <span style={{ fontSize: "11px", background: "rgba(2, 132, 199, 0.08)", color: "#0284c7", border: "1px solid rgba(2, 132, 199, 0.2)", padding: "2px 8px", borderRadius: "10px", fontWeight: 500 }}>
                    {selectedBusiness.analytics.stageBreakdown.demo_scheduled} Demo
                  </span>
                  <span style={{ fontSize: "11px", background: "rgba(245, 158, 11, 0.08)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.2)", padding: "2px 8px", borderRadius: "10px", fontWeight: 500 }}>
                    {selectedBusiness.analytics.stageBreakdown.proposal_sent} Proposal
                  </span>
                  <span style={{ fontSize: "11px", background: "rgba(16, 185, 129, 0.08)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "2px 8px", borderRadius: "10px", fontWeight: 500 }}>
                    {selectedBusiness.analytics.stageBreakdown.negotiation} Negotiation
                  </span>
                </div>
              </div>
            </div>

            {/* Clean Telemetry Cards */}
            <div className="clean-telemetry-strip">
              <div className="telemetry-pill highlight">
                <span className="telemetry-label">Active Pipeline</span>
                <strong className="telemetry-val">{selectedBusiness.analytics.pipelineValue}</strong>
                <span className="telemetry-sub text-purple">{selectedBusiness.analytics.totalDeals} Open Deals</span>
              </div>
              <div className="telemetry-pill">
                <span className="telemetry-label">Weighted Forecast</span>
                <strong className="telemetry-val">{selectedBusiness.analytics.weightedPipelineValue}</strong>
                <span className="telemetry-sub text-mint">Risk-Adjusted ACV</span>
              </div>
              <div className="telemetry-pill">
                <span className="telemetry-label">Win Rate %</span>
                <strong className="telemetry-val">{selectedBusiness.analytics.winRatePercent}%</strong>
                <span className="telemetry-sub">Avg Cycle: {selectedBusiness.analytics.avgSalesCycleDays}d</span>
              </div>
              <div className="telemetry-pill">
                <span className="telemetry-label">Average Deal Size</span>
                <strong className="telemetry-val">{selectedBusiness.analytics.avgDealSize}</strong>
                <span className="telemetry-sub">Per Account</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              ANALYTICS & CHARTS SECTION: Animated Charts & Velocity Analytics
             ========================================================================= */}
          <section className="prospect-analytics-section" aria-label="Pipeline Analytics and Stage Velocity">
            <div className="analytics-grid">
              {/* 1. Animated Donut Chart & Dual Radial Gauges Card */}
              <div className="chart-card donut-chart-card">
                <div className="card-header">
                  <div>
                    <h3>Deal Tier & Account Scale</h3>
                    <span className="card-subtitle-small">Contract Size & Decision Maker Coverage</span>
                  </div>
                  <span className="card-badge pulse-badge" style={{ background: "rgba(124, 58, 237, 0.15)", color: "#7c3aed" }}>
                    Live CRM Radar
                  </span>
                </div>

                <div className="donut-and-legend">
                  {/* Interactive Animated SVG Donut Chart */}
                  <div className="svg-donut-wrap">
                    <svg viewBox="0 0 120 120" className="donut-svg animated-donut" aria-hidden="true">
                      {/* Base Track */}
                      <circle cx="60" cy="60" r="45" fill="transparent" stroke="#031f26" strokeWidth="14" />
                      {/* Enterprise Tier Segment (Purple) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="transparent"
                        stroke="#c974f4"
                        strokeWidth="14"
                        strokeDasharray={`${(selectedBusiness.analytics.tierBreakdown.enterprise / selectedBusiness.analytics.totalDeals) * 282.7} 282.7`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                        className={`donut-anim-segment high-segment ${hoveredDonutTier === "high" ? "is-hovered" : ""}`}
                        onMouseEnter={() => setHoveredDonutTier("high")}
                        onMouseLeave={() => setHoveredDonutTier(null)}
                      />
                      {/* Mid Market Tier Segment (Amber) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="14"
                        strokeDasharray={`${(selectedBusiness.analytics.tierBreakdown.midMarket / selectedBusiness.analytics.totalDeals) * 282.7} 282.7`}
                        strokeDashoffset={`-${((selectedBusiness.analytics.tierBreakdown.enterprise) / selectedBusiness.analytics.totalDeals) * 282.7}`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                        className={`donut-anim-segment mid-segment ${hoveredDonutTier === "middle" ? "is-hovered" : ""}`}
                        onMouseEnter={() => setHoveredDonutTier("middle")}
                        onMouseLeave={() => setHoveredDonutTier(null)}
                      />
                      {/* Growth Tier Segment (Slate) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="transparent"
                        stroke="#64748b"
                        strokeWidth="14"
                        strokeDasharray={`${(selectedBusiness.analytics.tierBreakdown.growth / selectedBusiness.analytics.totalDeals) * 282.7} 282.7`}
                        strokeDashoffset={`-${(((selectedBusiness.analytics.tierBreakdown.enterprise + selectedBusiness.analytics.tierBreakdown.midMarket)) / selectedBusiness.analytics.totalDeals) * 282.7}`}
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
                          ? selectedBusiness.analytics.tierBreakdown.enterprise
                          : hoveredDonutTier === "middle"
                          ? selectedBusiness.analytics.tierBreakdown.midMarket
                          : hoveredDonutTier === "low"
                          ? selectedBusiness.analytics.tierBreakdown.growth
                          : selectedBusiness.analytics.totalDeals}
                      </strong>
                      <span>
                        {hoveredDonutTier === "high"
                          ? "Enterprise"
                          : hoveredDonutTier === "middle"
                          ? "Mid-Market"
                          : hoveredDonutTier === "low"
                          ? "Growth"
                          : "Total Deals"}
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
                        <strong>Enterprise ({Math.round((selectedBusiness.analytics.tierBreakdown.enterprise / selectedBusiness.analytics.totalDeals) * 100)}%)</strong>
                        <span>{selectedBusiness.analytics.tierBreakdown.enterprise} deals • ACV ≥ $150K</span>
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
                        <strong>Mid-Market ({Math.round((selectedBusiness.analytics.tierBreakdown.midMarket / selectedBusiness.analytics.totalDeals) * 100)}%)</strong>
                        <span>{selectedBusiness.analytics.tierBreakdown.midMarket} deals • ACV $50K–$150K</span>
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
                        <strong>Growth ({Math.round((selectedBusiness.analytics.tierBreakdown.growth / selectedBusiness.analytics.totalDeals) * 100)}%)</strong>
                        <span>{selectedBusiness.analytics.tierBreakdown.growth} deals • ACV &lt; $50K</span>
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
                          strokeDasharray={`${(selectedBusiness.analytics.winRatePercent * 163.3) / 100} 163.3`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          transform="rotate(-90 32 32)"
                          className="radial-gauge-anim-mint"
                        />
                      </svg>
                      <span className="gauge-center-text">{selectedBusiness.analytics.winRatePercent}%</span>
                    </div>
                    <div className="gauge-label-col">
                      <strong>Historical Win Rate</strong>
                      <span>Qualified stage close %</span>
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
                          strokeDasharray={`${Math.round((selectedBusiness.analytics.dealHealth.decisionMakerEngaged / selectedBusiness.analytics.totalDeals) * 163.3)} 163.3`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          transform="rotate(-90 32 32)"
                          className="radial-gauge-anim-purple"
                        />
                      </svg>
                      <span className="gauge-center-text">
                        {Math.round((selectedBusiness.analytics.dealHealth.decisionMakerEngaged / selectedBusiness.analytics.totalDeals) * 100)}%
                      </span>
                    </div>
                    <div className="gauge-label-col">
                      <strong>Champion Coverage</strong>
                      <span>Direct VP & C-Level buy-in</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Animated 14-Day Velocity & Activity Chart */}
              <div className="chart-card velocity-chart-card">
                <div className="card-header">
                  <div>
                    <h3>14-Day Sales Velocity & Pipeline Touches</h3>
                    <span className="card-subtitle-small">Opportunities progressed & sales engagement throughput</span>
                  </div>
                  {/* Metric Switcher Tabs */}
                  <div className="velocity-metric-tabs" role="tablist" aria-label="Velocity Metric Selector">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={velocityMetric === "stageProgressions"}
                      className={`velocity-tab-btn ${velocityMetric === "stageProgressions" ? "is-active" : ""}`}
                      onClick={() => setVelocityMetric("stageProgressions")}
                    >
                      Stage Advances
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={velocityMetric === "salesTouches"}
                      className={`velocity-tab-btn ${velocityMetric === "salesTouches" ? "is-active" : ""}`}
                      onClick={() => setVelocityMetric("salesTouches")}
                    >
                      Sales Touches
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={velocityMetric === "revenueMoved"}
                      className={`velocity-tab-btn ${velocityMetric === "revenueMoved" ? "is-active" : ""}`}
                      onClick={() => setVelocityMetric("revenueMoved")}
                    >
                      Revenue Moved ($k)
                    </button>
                  </div>
                </div>

                {/* Animated Bars Container */}
                <div className="velocity-bars-container" role="region" aria-label="Daily CRM velocity activity bars">
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
                              className={`velocity-bar-fill fill-${velocityMetric === "stageProgressions" ? "touches" : velocityMetric === "salesTouches" ? "opens" : "meetings"}`}
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
                        <span className="tooltip-stat-badge">{hoveredVelocityPoint.stageProgressions} Moves</span>
                      </div>
                      <div className="tooltip-metrics-row">
                        <span>🚀 Stage Moves: <strong>{hoveredVelocityPoint.stageProgressions}</strong></span>
                        <span>✉ Touches: <strong>{hoveredVelocityPoint.salesTouches}</strong></span>
                        <span>📅 Meetings: <strong>{hoveredVelocityPoint.meetingsHeld}</strong></span>
                        <span>💰 Moved: <strong>${hoveredVelocityPoint.revenueMoved}K</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Velocity Telemetry Footer */}
                <div className="velocity-footer-strip">
                  <div className="velocity-mini-stat">
                    <span className="stat-label">14-Day Progressions</span>
                    <strong className="stat-num">
                      {velocityData.reduce((acc, curr) => acc + curr.stageProgressions, 0)} stages
                    </strong>
                  </div>
                  <div className="velocity-mini-stat">
                    <span className="stat-label">Total Touches</span>
                    <strong className="stat-num text-mint">
                      {velocityData.reduce((acc, curr) => acc + curr.salesTouches, 0)} touches
                    </strong>
                  </div>
                  <div className="velocity-mini-stat">
                    <span className="stat-label">Meetings Held</span>
                    <strong className="stat-num text-purple">
                      {velocityData.reduce((acc, curr) => acc + curr.meetingsHeld, 0)} held
                    </strong>
                  </div>
                  <div className="velocity-mini-stat">
                    <span className="stat-label">Pipeline Velocity</span>
                    <strong className="stat-num text-amber">
                      ${velocityData.reduce((acc, curr) => acc + curr.revenueMoved, 0)}K moved
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3. Stage Action Priority Cards with Hover Glow */}
              <div className="chart-card tier-cards-card">
                <div className="card-header">
                  <div>
                    <h3>Deal Priority & Stage Actions</h3>
                    <span className="card-subtitle-small">Targeted enterprise motion</span>
                  </div>
                  <span className="card-badge" style={{ background: "rgba(124, 58, 237, 0.15)", color: "#7c3aed" }}>
                    Stage Gating
                  </span>
                </div>

                <div className="tier-cards-stack">
                  {/* High Tier Card */}
                  <div
                    className={`tier-highlight-box high-box ${selectedTier === "high" ? "is-active" : ""}`}
                    onClick={() => setSelectedTier(selectedTier === "high" ? "all" : "high")}
                    role="button"
                    tabIndex={0}
                    aria-label="Filter high tier enterprise accounts"
                  >
                    <div className="tier-box-header">
                      <span className="tier-tag high-tag">🏆 Enterprise Priorities</span>
                      <strong>{selectedBusiness.analytics.tierBreakdown.enterprise} Deals</strong>
                    </div>
                    <p className="tier-box-desc">
                      Multi-threaded opportunities in contract redlines or executive review. Requires high-touch legal and security alignment.
                    </p>
                    <div className="tier-box-footer">
                      <span>Avg Value: <strong>$180K+</strong></span>
                      <span className="click-action-hint">Click to filter ➜</span>
                    </div>
                  </div>

                  {/* Middle Tier Card */}
                  <div
                    className={`tier-highlight-box mid-box ${selectedTier === "middle" ? "is-active" : ""}`}
                    onClick={() => setSelectedTier(selectedTier === "middle" ? "all" : "middle")}
                    role="button"
                    tabIndex={0}
                    aria-label="Filter mid market accounts"
                  >
                    <div className="tier-box-header">
                      <span className="tier-tag mid-tag">⚡ Mid-Market Expansion</span>
                      <strong>{selectedBusiness.analytics.tierBreakdown.midMarket} Deals</strong>
                    </div>
                    <p className="tier-box-desc">
                      Scoping calls and technical demonstrations completed. Primed for customized business case delivery and proposal sign-off.
                    </p>
                    <div className="tier-box-footer">
                      <span>Avg Value: <strong>$85K</strong></span>
                      <span className="click-action-hint">Click to filter ➜</span>
                    </div>
                  </div>

                  {/* Low Tier Card */}
                  <div
                    className={`tier-highlight-box low-box ${selectedTier === "low" ? "is-active" : ""}`}
                    onClick={() => setSelectedTier(selectedTier === "low" ? "all" : "low")}
                    role="button"
                    tabIndex={0}
                    aria-label="Filter growth velocity accounts"
                  >
                    <div className="tier-box-header">
                      <span className="tier-tag low-tag">🚀 Velocity Deals</span>
                      <strong>{selectedBusiness.analytics.tierBreakdown.growth} Deals</strong>
                    </div>
                    <p className="tier-box-desc">
                      Self-serve or fast-cycle accounts needing automated follow-up sequences and standardized contract execution.
                    </p>
                    <div className="tier-box-footer">
                      <span>Avg Cycle: <strong>14 Days</strong></span>
                      <span className="click-action-hint">Click to filter ➜</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Deal Health & Risk Factor Breakdown */}
              <div className="chart-card signals-breakdown-card">
                <div className="card-header">
                  <div>
                    <h3>Deal Health & Milestone Gates</h3>
                    <span className="card-subtitle-small">Enterprise qualification criteria status</span>
                  </div>
                  <span className="card-badge pulse-badge">
                    {selectedBusiness.analytics.dealHealth.decisionMakerEngaged} Active Gates
                  </span>
                </div>

                <div className="signals-bars-list">
                  <div className="signal-bar-item">
                    <div className="signal-label-row">
                      <span>👤 Economic Buyer & Champion Engaged</span>
                      <strong>{selectedBusiness.analytics.dealHealth.decisionMakerEngaged} deals</strong>
                    </div>
                    <div className="signal-progress-track">
                      <div
                        className="signal-progress-fill hiring-fill animated-shimmer-bar"
                        style={{
                          width: `${(selectedBusiness.analytics.dealHealth.decisionMakerEngaged / Math.max(1, selectedBusiness.analytics.totalDeals)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="signal-bar-item">
                    <div className="signal-label-row">
                      <span>💳 Formal Budget & Capex Approved</span>
                      <strong>{selectedBusiness.analytics.dealHealth.budgetApproved} deals</strong>
                    </div>
                    <div className="signal-progress-track">
                      <div
                        className="signal-progress-fill funding-fill animated-shimmer-bar"
                        style={{
                          width: `${(selectedBusiness.analytics.dealHealth.budgetApproved / Math.max(1, selectedBusiness.analytics.totalDeals)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="signal-bar-item">
                    <div className="signal-label-row">
                      <span>🔒 Legal, Privacy & InfoSec Review Cleared</span>
                      <strong>{selectedBusiness.analytics.dealHealth.legalSecurityReview} deals</strong>
                    </div>
                    <div className="signal-progress-track">
                      <div
                        className="signal-progress-fill expansion-fill animated-shimmer-bar"
                        style={{
                          width: `${(selectedBusiness.analytics.dealHealth.legalSecurityReview / Math.max(1, selectedBusiness.analytics.totalDeals)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="signal-bar-item">
                    <div className="signal-label-row">
                      <span>⚠️ Stalled or Past Expected Close Date</span>
                      <strong style={{ color: "#ef4444" }}>{selectedBusiness.analytics.dealHealth.atRiskStalled} deals</strong>
                    </div>
                    <div className="signal-progress-track">
                      <div
                        className="signal-progress-fill tenders-fill animated-shimmer-bar"
                        style={{
                          background: "linear-gradient(90deg, #ef4444, #f87171)",
                          width: `${(selectedBusiness.analytics.dealHealth.atRiskStalled / Math.max(1, selectedBusiness.analytics.totalDeals)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              WHITE TABLE COMPONENT: Paginated Deals & Opportunities Directory
             ========================================================================= */}
          <section className="prospects-white-card" aria-label="Opportunities & Pipeline Directory">
            {/* Header: Title, Stage Filter Tabs & Controls */}
            <div className="prospects-card-header">
              <div className="prospects-header-left">
                <div className="prospects-title-group">
                  <h2>Active Opportunities & Pipeline Directory</h2>
                  <span className="prospects-count-badge">
                    {filteredDeals.length} {filteredDeals.length === 1 ? "Opportunity" : "Opportunities"}
                  </span>
                </div>

                {/* Tier Filter Tabs */}
                <div className="prospects-tier-tabs" role="tablist" aria-label="Filter by Tier">
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
                    All Deals ({selectedBusiness.deals.length})
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
                    🏆 Enterprise ({selectedBusiness.deals.filter((d) => d.tier === "high").length})
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
                    ⚡ Mid-Market ({selectedBusiness.deals.filter((d) => d.tier === "middle").length})
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
                    🚀 Growth ({selectedBusiness.deals.filter((d) => d.tier === "low").length})
                  </button>
                </div>
              </div>

              {/* Header Right: View Switcher, Stage Selector & Search */}
              <div className="prospects-header-right">
                {/* View Mode Toggle */}
                <div className="crm-view-mode-toggle" role="radiogroup" aria-label="Pipeline View Mode">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={viewMode === "table"}
                    className={`crm-view-mode-btn ${viewMode === "table" ? "is-active" : ""}`}
                    onClick={() => setViewMode("table")}
                    title="Table Directory View"
                  >
                    📋 Table
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={viewMode === "kanban"}
                    className={`crm-view-mode-btn ${viewMode === "kanban" ? "is-active" : ""}`}
                    onClick={() => setViewMode("kanban")}
                    title="Kanban Board View"
                  >
                    📊 Kanban Board
                  </button>
                </div>

                <select
                  value={selectedStage}
                  onChange={(e) => {
                    setSelectedStage(e.target.value as any);
                    setPage(1);
                  }}
                  className="prospects-trigger-select"
                  aria-label="Filter by CRM deal stage"
                >
                  <option value="all">All Pipeline Stages</option>
                  <option value="discovery">🔍 Discovery</option>
                  <option value="demo_scheduled">📅 Demo Scheduled</option>
                  <option value="proposal_sent">📄 Proposal Sent</option>
                  <option value="negotiation">🤝 Negotiation / Redlines</option>
                  <option value="closed_won">🏆 Closed Won</option>
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
                    value={dealSearchQuery}
                    onChange={(e) => {
                      setDealSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search company, contact, or trigger…"
                    aria-label="Search opportunities"
                  />
                  {dealSearchQuery && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => {
                        setDealSearchQuery("");
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

            {/* Triage Sub-Bar: Bulk selection, Quick High-Value selector & Rows per page */}
            <div className="prospects-triage-bar">
              <div className="triage-bar-left">
                <label className="table-checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all filtered opportunities"
                  />
                  <span className="table-checkbox-label">
                    Select All Filtered ({totalFilteredCount})
                  </span>
                </label>
                {selectedDealIds.length > 0 && (
                  <span className="triage-selection-badge">
                    {selectedDealIds.length} {selectedDealIds.length === 1 ? "deal" : "deals"} selected
                  </span>
                )}
                <button
                  type="button"
                  className="triage-quick-btn"
                  onClick={() =>
                    setSelectedDealIds(
                      filteredDeals.filter((d) => d.tier === "high").map((d) => d.id)
                    )
                  }
                  title="Select all enterprise opportunities"
                >
                  🏆 Select Enterprise ({filteredDeals.filter((d) => d.tier === "high").length})
                </button>
                {selectedDealIds.length > 0 && (
                  <button
                    type="button"
                    className="triage-clear-btn"
                    onClick={() => setSelectedDealIds([])}
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              <div className="triage-bar-right">
                <div className="page-size-selector">
                  <label htmlFor="crm-page-size-select">Rows per page:</label>
                  <select
                    id="crm-page-size-select"
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

                {selectedDealIds.length > 0 && (
                  <button
                    type="button"
                    className="triage-enroll-cta"
                    style={{ background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)", color: "#ffffff" }}
                    onClick={() => setIsAdvanceModalOpen(true)}
                  >
                    🚀 Advance Selected Stages ({selectedDealIds.length})
                  </button>
                )}
              </div>
            </div>

            {/* Real-Time Two-Way Webhook Sync Telemetry Banner */}
            <div className="crm-sync-banner">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: isSyncing ? "#f59e0b" : "#10b981",
                    boxShadow: isSyncing ? "0 0 8px #f59e0b" : "0 0 8px #10b981",
                  }}
                />
                <span>
                  <strong>Bi-Directional Webhook Sync:</strong> Real-time integration active with{" "}
                  <strong>{selectedBusiness.crmSystem}</strong>. Telemetry synced {selectedBusiness.lastSyncTime}.
                </span>
              </div>
              <button
                type="button"
                className="crm-sync-btn"
                onClick={handleTriggerSync}
                disabled={isSyncing}
              >
                {isSyncing ? "Syncing Webhook..." : "🔄 Force Webhook Sync"}
              </button>
            </div>

            {/* KANBAN BOARD VIEW */}
            {viewMode === "kanban" ? (
              <div className="crm-kanban-board" role="region" aria-label="CRM Stage Pipeline Board">
                {(
                  [
                    { id: "discovery", title: "Discovery", icon: "🔍", color: "#64748b" },
                    { id: "demo_scheduled", title: "Demo Scheduled", icon: "📅", color: "#0284c7" },
                    { id: "proposal_sent", title: "Proposal Sent", icon: "📄", color: "#f59e0b" },
                    { id: "negotiation", title: "Negotiation", icon: "🤝", color: "#7c3aed" },
                    { id: "closed_won", title: "Closed Won", icon: "🏆", color: "#059669" },
                  ] as const
                ).map((col) => {
                  const stageDeals = filteredDeals.filter((d) => d.stage === col.id);
                  const stageAcvSum = stageDeals.reduce((sum, d) => sum + d.dealValueNum, 0);
                  const stageAcvFormatted =
                    stageAcvSum >= 1000000
                      ? `$${(stageAcvSum / 1000000).toFixed(2)}M`
                      : `$${Math.round(stageAcvSum / 1000)}K`;

                  return (
                    <div key={col.id} className="crm-kanban-column">
                      <div className="crm-kanban-col-header">
                        <div className="crm-kanban-col-title">
                          <span>{col.icon}</span>
                          <span>{col.title}</span>
                          <span className="crm-kanban-col-count">{stageDeals.length}</span>
                        </div>
                        <span className="crm-kanban-col-acv">{stageAcvFormatted}</span>
                      </div>

                      <div className="crm-kanban-col-cards">
                        {stageDeals.map((deal) => {
                          const isHigh = deal.tier === "high";
                          const isMid = deal.tier === "middle";

                          return (
                            <div
                              key={deal.id}
                              className="crm-kanban-card"
                              onClick={() => setDrawerDeal(deal)}
                              tabIndex={0}
                              role="button"
                              aria-label={`Open dossier for ${deal.company}`}
                            >
                              <div className="crm-kanban-card-top">
                                <span className="crm-kanban-card-company">{deal.company}</span>
                                <span className="crm-kanban-card-val">{deal.dealValue}</span>
                              </div>

                              <div className="crm-kanban-card-contact">
                                👤 {deal.primaryContact.name} • {deal.primaryContact.title}
                              </div>

                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                                <span
                                  className={`table-fit-pill ${
                                    isHigh ? "pill-high" : isMid ? "pill-mid" : "pill-low"
                                  }`}
                                  style={{ padding: "1px 6px", fontSize: "10px" }}
                                >
                                  {isHigh ? "🏆 Enterprise" : isMid ? "⚡ Mid-Market" : "🚀 Growth"}
                                </span>
                                <span
                                  className={`table-fit-pill ${
                                    deal.winProbability >= 80 ? "pill-high" : deal.winProbability >= 60 ? "pill-mid" : "pill-low"
                                  }`}
                                  style={{ padding: "1px 6px", fontSize: "10px" }}
                                >
                                  ⚡ {deal.winProbability}% Win
                                </span>
                              </div>

                              <div className="crm-kanban-card-footer">
                                <span>⏱ {deal.daysInStage}d in stage</span>
                                <span style={{ color: "#7c3aed", fontWeight: 700 }}>Dossier ➜</span>
                              </div>
                            </div>
                          );
                        })}

                        {stageDeals.length === 0 && (
                          <div
                            style={{
                              padding: "24px 12px",
                              textAlign: "center",
                              color: "#94a3b8",
                              fontSize: "11px",
                              fontStyle: "italic",
                            }}
                          >
                            No deals in this stage
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* TABLE DIRECTORY VIEW */}
            {viewMode === "table" && (
              <>
                {/* Table Content or Empty State */}
            {filteredDeals.length === 0 ? (
              <div className="table-empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No opportunities match your current criteria</h3>
                <p>Try resetting the stage filter or search term.</p>
                <button
                  type="button"
                  className="empty-reset-btn"
                  onClick={() => {
                    setSelectedTier("all");
                    setSelectedStage("all");
                    setDealSearchQuery("");
                    setPage(1);
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="prospects-table-wrapper">
                <table className="prospects-white-table" role="grid" aria-label="Opportunities Table">
                  <thead>
                    <tr>
                      <th className="th-check" style={{ width: "44px" }}>
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="th-company" style={{ width: "26%" }}>
                        Company & Deal Value
                      </th>
                      <th className="th-signal" style={{ width: "30%" }}>
                        Stage & Buying Trigger
                      </th>
                      <th className="th-contact" style={{ width: "22%" }}>
                        Economic Buyer / Champion
                      </th>
                      <th className="th-fit" style={{ width: "10%" }}>
                        Win Likelihood
                      </th>
                      <th className="th-actions" style={{ width: "12%", textAlign: "right" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDeals.map((deal) => {
                      const isSelected = selectedDealIds.includes(deal.id);
                      const stageDetails = getStageLabel(deal.stage);
                      const isHigh = deal.tier === "high";
                      const isMid = deal.tier === "middle";

                      return (
                        <tr
                          key={deal.id}
                          className={`prospect-row ${isSelected ? "is-selected" : ""}`}
                          onClick={() => setDrawerDeal(deal)}
                          tabIndex={0}
                          aria-label={`View dossier for ${deal.company}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setDrawerDeal(deal);
                            }
                          }}
                        >
                          {/* 1. Multi-select Checkbox */}
                          <td className="td-check" onClick={(e) => e.stopPropagation()}>
                            <label className="table-checkbox-wrap">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectDeal(deal.id)}
                                aria-label={`Select ${deal.company}`}
                              />
                            </label>
                          </td>

                          {/* 2. Company Name, Avatar & Value */}
                          <td className="td-company">
                            <div className="company-cell-inner">
                              <div
                                className="company-avatar-box"
                                style={{ backgroundColor: deal.primaryContact.avatarColor }}
                                aria-hidden="true"
                              >
                                {deal.company.charAt(0)}
                              </div>
                              <div className="company-meta-col">
                                <div className="company-headline-row">
                                  <strong className="company-name-text">
                                    {deal.company}
                                  </strong>
                                  <span className="company-industry-tag">
                                    {deal.industry}
                                  </span>
                                </div>
                                <p className="company-sub-meta">
                                  <strong>{deal.dealValue} ACV</strong> • {deal.location} • {deal.employees} emp
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 3. Stage & Buying Trigger */}
                          <td className="td-signal">
                            <div className="signal-cell-inner">
                              <div className="signal-trigger-row" style={{ gap: "8px" }}>
                                <span
                                  className="social-platform-tag"
                                  style={{
                                    backgroundColor: stageDetails.bg,
                                    color: stageDetails.color,
                                    borderColor: stageDetails.border,
                                  }}
                                >
                                  {stageDetails.label}
                                </span>
                                <span
                                  className={`table-fit-pill ${
                                    isHigh ? "pill-high" : isMid ? "pill-mid" : "pill-low"
                                  }`}
                                  style={{ padding: "1px 6px", fontSize: "10px" }}
                                >
                                  {isHigh ? "🏆 Enterprise" : isMid ? "⚡ Mid-Market" : "🚀 Growth"}
                                </span>
                                <span style={{ fontSize: "10.5px", color: "#64748b", marginLeft: "auto" }}>
                                  {deal.daysInStage}d in stage
                                </span>
                              </div>

                              {/* AI Deal Summary */}
                              <div
                                className="social-mention-quote-box"
                                style={{ borderLeftColor: stageDetails.color }}
                              >
                                "{deal.aiDealSummary}"
                              </div>

                              {/* Trigger line */}
                              <div className="social-trigger-meta-row">
                                <strong>Trigger:</strong>
                                <span>{deal.dealTrigger}</span>
                              </div>
                            </div>
                          </td>

                          {/* 4. Verified Decision Maker */}
                          <td className="td-contact" onClick={(e) => e.stopPropagation()}>
                            <div className="contact-cell-inner">
                              <div className="contact-name-row">
                                <strong className="contact-name-text">{deal.primaryContact.name}</strong>
                                {deal.primaryContact.verified && (
                                  <span className="contact-verified-badge" title="Verified Economic Buyer">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <span className="contact-title-text">{deal.primaryContact.title}</span>
                              <div className="contact-micro-actions">
                                <button
                                  type="button"
                                  className="contact-copy-pill"
                                  onClick={(e) => handleCopyEmail(deal.primaryContact.email, e)}
                                  title="Click to copy email address"
                                >
                                  ✉ {copiedEmail === deal.primaryContact.email ? "Copied!" : "Email"}
                                </button>
                                {deal.primaryContact.linkedin && (
                                  <a
                                    href={deal.primaryContact.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-website-link"
                                    title="Open LinkedIn profile"
                                  >
                                    in ↗
                                  </a>
                                )}
                                <a
                                  href={`https://${deal.website}`}
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

                          {/* 5. Win Likelihood & Status */}
                          <td className="td-fit">
                            <div className="fit-cell-inner">
                              <span
                                className={`table-fit-pill ${
                                  deal.winProbability >= 80 ? "pill-high" : deal.winProbability >= 60 ? "pill-mid" : "pill-low"
                                }`}
                              >
                                ⚡ {deal.winProbability}% Win
                              </span>
                              <span
                                className="table-status-pill status-engaged"
                                style={{ fontSize: "10.5px" }}
                              >
                                {deal.status}
                              </span>
                            </div>
                          </td>

                          {/* 6. Actions */}
                          <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                            <div className="actions-cell-inner">
                              <button
                                type="button"
                                className="table-drawer-cta-btn"
                                onClick={() => setDrawerDeal(deal)}
                                title="Open CRM opportunity dossier"
                              >
                                Dossier ➜
                              </button>
                              <button
                                type="button"
                                className="table-sequence-cta-btn"
                                style={{ background: "#f5f3ff", color: "#7c3aed", borderColor: "#ddd6fe" }}
                                onClick={() => {
                                  setSelectedDealIds([deal.id]);
                                  setIsAdvanceModalOpen(true);
                                }}
                                title="Advance CRM stage"
                              >
                                + Advance
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
            {filteredDeals.length > 0 && (
              <div className="prospects-table-pagination" role="navigation" aria-label="Opportunities pagination">
                <div className="pagination-info-left">
                  Showing <strong>{(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, totalFilteredCount)}</strong> of{" "}
                  <strong>{totalFilteredCount}</strong> opportunities
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
            </>
            )}
          </section>
        </main>
      </div>

      {/* Slide-Over Dossier Drawer */}
      <CrmDossierDrawer
        isOpen={drawerDeal !== null}
        onClose={() => setDrawerDeal(null)}
        deal={drawerDeal}
        onAdvanceStage={(deal) => {
          setSelectedDealIds([deal.id]);
          setIsAdvanceModalOpen(true);
        }}
      />

      {/* Advance Stage Modal */}
      {isAdvanceModalOpen && (
        <div className="enroll-modal-backdrop" onClick={() => setIsAdvanceModalOpen(false)}>
          <div className="enroll-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Advance CRM Pipeline Stage</h2>
                <p>
                  Transition selected accounts to the next milestone and trigger automated CRM workflow updates.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAdvanceModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="enrolling-count-banner" style={{ background: "rgba(124, 58, 237, 0.08)", borderColor: "rgba(124, 58, 237, 0.25)" }}>
                <span style={{ color: "#7c3aed" }}>Advancing Opportunities:</span>
                <strong style={{ color: "#6b21a8" }}>{selectedDealIds.length} Accounts Queued</strong>
              </div>

              {/* Target Stage Selector */}
              <div className="sequence-picker-wrap">
                <label htmlFor="crm-advance-stage-select">Select Destination Stage</label>
                <select
                  id="crm-advance-stage-select"
                  value={targetStageToAdvance}
                  onChange={(e) => setTargetStageToAdvance(e.target.value as any)}
                >
                  <option value="demo_scheduled">📅 Demo Scheduled (Scoping walkthrough)</option>
                  <option value="proposal_sent">📄 Proposal Sent (Commercial quote & ROI teardown)</option>
                  <option value="negotiation">🤝 Negotiation (Legal review & MSA redlines)</option>
                  <option value="closed_won">🏆 Closed Won (Execute agreement & onboarding kick-off)</option>
                </select>
              </div>

              <div className="cadence-steps-preview">
                <h4>Automated CRM Actions on Transition:</h4>
                <ul>
                  <li>
                    <strong>Bi-directional Sync:</strong> Live stage update pushed to {selectedBusiness.crmSystem}.
                  </li>
                  <li>
                    <strong>Stakeholder Notification:</strong> Slack/Email alert triggered to Opportunity Owner ({selectedBusiness.owner}).
                  </li>
                  <li>
                    <strong>Cadence Adaptation:</strong> Outbound sequences automatically paused or shifted to onboarding mode.
                  </li>
                  <li>
                    <strong>Forecast Rollup:</strong> Weighted pipeline value recalculation reflected in executive dashboard.
                  </li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setIsAdvanceModalOpen(false)}
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
                onClick={handleAdvanceStageSubmit}
              >
                Confirm Stage Progression ➜
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
