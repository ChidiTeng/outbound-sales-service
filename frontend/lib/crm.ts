import {
  type SmartLeadContact,
  type SmartLeadActivity,
  type ProspectTier,
} from "./smart-leads";

export type CrmDealStage =
  | "discovery"
  | "demo_scheduled"
  | "proposal_sent"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export interface CrmDeal {
  id: string;
  businessId: string;
  company: string;
  industry: string;
  location: string;
  country: string;
  employees: string;
  website: string;
  revenue: string;
  dealValue: string;
  dealValueNum: number;
  stage: CrmDealStage;
  winProbability: number;
  tier: ProspectTier;
  expectedCloseDate: string;
  daysInStage: number;
  owner: string;
  primaryContact: SmartLeadContact;
  champion?: SmartLeadContact;
  dealTrigger: string;
  whyNow: string;
  techStack: string[];
  suggestedAction: string;
  aiDealSummary: string;
  status: "Active" | "At Risk" | "Contract Sent" | "Closing This Month" | "Won";
  lastTouchTime: string;
  activities: SmartLeadActivity[];
}

export interface BusinessCrmAnalytics {
  totalDeals: number;
  pipelineValue: string;
  pipelineValueNum: number;
  weightedPipelineValue: string;
  avgDealSize: string;
  winRatePercent: number;
  avgSalesCycleDays: number;
  stageBreakdown: {
    discovery: number;
    demo_scheduled: number;
    proposal_sent: number;
    negotiation: number;
    closed_won: number;
  };
  tierBreakdown: {
    enterprise: number;
    midMarket: number;
    growth: number;
  };
  dealHealth: {
    decisionMakerEngaged: number;
    budgetApproved: number;
    legalSecurityReview: number;
    atRiskStalled: number;
  };
}

export interface CrmVelocityDayPoint {
  day: string;
  dayLabel: string;
  stageProgressions: number;
  salesTouches: number;
  meetingsHeld: number;
  revenueMoved: number; // in $1k units
}

export interface OnboardedCrmBusiness {
  id: string;
  name: string;
  company: string;
  industry: string;
  country: string;
  website: string;
  owner: string;
  created: string;
  avatarColor: string;
  crmSystem: "HubSpot Enterprise" | "Salesforce Sales Cloud" | "Pipedrive Enterprise";
  lastSyncTime: string;
  analytics: BusinessCrmAnalytics;
  deals: CrmDeal[];
}

export function getBusinessCrmVelocityData(businessId: string): CrmVelocityDayPoint[] {
  const days = [
    "Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7",
    "Day 8", "Day 9", "Day 10", "Day 11", "Day 12", "Day 13", "Today"
  ];
  const labels = [
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"
  ];

  const seed = businessId === "nord-tech" ? 1.2 : businessId === "alpine" ? 0.9 : 1.05;
  const stageBases = [2, 4, 6, 5, 3, 1, 0, 3, 5, 7, 6, 4, 2, 5];

  return days.map((day, i) => {
    const stageProgressions = Math.round(stageBases[i] * seed);
    const salesTouches = Math.round(stageProgressions * 4.5 + 8);
    const meetingsHeld = Math.max(1, Math.round(stageProgressions * 0.9));
    const revenueMoved = Math.round((stageProgressions * 32 + 15) * seed);
    return {
      day,
      dayLabel: labels[i],
      stageProgressions,
      salesTouches,
      meetingsHeld,
      revenueMoved,
    };
  });
}

export const ONBOARDED_CRM_BUSINESSES: OnboardedCrmBusiness[] = [
  {
    id: "nord-tech",
    name: "NordTech Solutions GmbH",
    company: "Nord Tech",
    industry: "Industrial Equipment",
    country: "Germany",
    website: "nordtech-solutions.com",
    owner: "Michael Weber",
    created: "June 14, 2026",
    avatarColor: "#c9ae4d",
    crmSystem: "Salesforce Sales Cloud",
    lastSyncTime: "3 mins ago",
    analytics: {
      totalDeals: 38,
      pipelineValue: "$3.42M",
      pipelineValueNum: 3420000,
      weightedPipelineValue: "$2.15M",
      avgDealSize: "$90.0K",
      winRatePercent: 41,
      avgSalesCycleDays: 34,
      stageBreakdown: {
        discovery: 11,
        demo_scheduled: 9,
        proposal_sent: 8,
        negotiation: 6,
        closed_won: 4,
      },
      tierBreakdown: {
        enterprise: 18,
        midMarket: 14,
        growth: 6,
      },
      dealHealth: {
        decisionMakerEngaged: 28,
        budgetApproved: 19,
        legalSecurityReview: 12,
        atRiskStalled: 4,
      },
    },
    deals: [
      {
        id: "crm-deal-1",
        businessId: "nord-tech",
        company: "Kaiser Precision Automation SE",
        industry: "Industrial Automation",
        location: "Frankfurt, Germany",
        country: "Germany",
        employees: "250–500",
        website: "kaiser-automation.de",
        revenue: "$35M–$50M",
        dealValue: "$185,000",
        dealValueNum: 185000,
        stage: "negotiation",
        winProbability: 88,
        tier: "high",
        expectedCloseDate: "Nov 15, 2026",
        daysInStage: 12,
        owner: "Michael Weber",
        dealTrigger: "Siemens PLM contract expiration; modular automation replacement",
        whyNow: "Board approved budget for tooling modernisation. Final MSAs are with procurement and legal counsel.",
        techStack: ["Siemens PLM", "SAP S/4HANA", "Salesforce CRM", "Kubernetes"],
        suggestedAction: "Send customized redline review for standard indemnity clause + offer onboarding workshop voucher.",
        aiDealSummary: "Deal velocity is 40% faster than benchmark. Thomas Becker has championed internal migration and validated budget with finance.",
        status: "Contract Sent",
        lastTouchTime: "4 hours ago",
        primaryContact: {
          name: "Thomas Becker",
          title: "VP Supply Chain & Operations",
          email: "t.becker@kaiser-automation.de",
          phone: "+49 69 4029 182",
          verified: true,
          avatarColor: "#2ae9c9",
          linkedin: "https://linkedin.com/in/thomas-becker-ops",
        },
        champion: {
          name: "Anke Schreiber",
          title: "Lead Industrial Process Engineer",
          email: "a.schreiber@kaiser-automation.de",
          phone: "+49 69 4029 199",
          verified: true,
          avatarColor: "#9333ea",
          linkedin: "https://linkedin.com/in/anke-schreiber-plm",
        },
        activities: [
          {
            id: "act-crm-1",
            type: "email",
            title: "MSA Redlines Sent to Legal",
            time: "4 hours ago",
            channel: "Enterprise Counsel Email",
            author: "Michael Weber",
            status: "Pending Review",
            description: "Transmitted finalized data privacy addendum and SLA commitments to Kaiser General Counsel.",
            badgeColor: "#0284c7",
          },
          {
            id: "act-crm-2",
            type: "meeting",
            title: "Executive Alignment & ROI Walkthrough",
            time: "Yesterday at 14:00",
            channel: "Zoom Enterprise Sync",
            author: "Michael Weber",
            status: "Completed",
            description: "VP Operations and Head of IT reviewed 3-year TCO comparison showing 38% software savings.",
            badgeColor: "#10b981",
          },
          {
            id: "act-crm-3",
            type: "signal",
            title: "Security Questionnaire Approved",
            time: "3 days ago",
            channel: "SOC 2 Trust Portal",
            author: "Compliance Bot",
            status: "Passed",
            description: "Kaiser InfoSec verified ISO 27001 and GDPR subprocessor safeguards without exceptions.",
            badgeColor: "#8b5cf6",
          },
        ],
      },
      {
        id: "crm-deal-2",
        businessId: "nord-tech",
        company: "Bavaria Mechatronik GmbH",
        industry: "Automotive Systems",
        location: "Munich, Germany",
        country: "Germany",
        employees: "500–1,000",
        website: "bavaria-mechatronik.de",
        revenue: "$70M–$100M",
        dealValue: "$240,000",
        dealValueNum: 240000,
        stage: "proposal_sent",
        winProbability: 76,
        tier: "high",
        expectedCloseDate: "Nov 30, 2026",
        daysInStage: 8,
        owner: "Michael Weber",
        dealTrigger: "High tooling failure rate during EV subassembly shift runs",
        whyNow: "Q4 plant downtime audit flagged $420k losses in line sync latency. Budget unlocked for quick-deploy fix.",
        techStack: ["Beckhoff TwinCAT", "CATIA", "Oracle NetSuite", "Jira"],
        suggestedAction: "Follow up with Technical Director on the telemetry pilot trial results delivered on Monday.",
        aiDealSummary: "Technical validation completed successfully with 99.4% precision telemetry. Proposal currently with Procurement committee.",
        status: "Active",
        lastTouchTime: "1 day ago",
        primaryContact: {
          name: "Stefan Wagner",
          title: "Head of Assembly Operations",
          email: "s.wagner@bavaria-mechatronik.de",
          phone: "+49 89 7721 440",
          verified: true,
          avatarColor: "#ea580c",
          linkedin: "https://linkedin.com/in/stefan-wagner-ops",
        },
        activities: [
          {
            id: "act-crm-4",
            type: "email",
            title: "Formal Commercial Proposal Submitted",
            time: "1 day ago",
            channel: "HubSpot Sales Quote",
            author: "Michael Weber",
            status: "Delivered",
            description: "Delivered 2-tier pricing schedule with multi-year volume discounts and German on-site SLA.",
            badgeColor: "#0284c7",
          },
          {
            id: "act-crm-5",
            type: "meeting",
            title: "Technical Teardown Review",
            time: "4 days ago",
            channel: "On-site Plant Munich",
            author: "Michael Weber",
            status: "Completed",
            description: "Demonstrated live latency reduction from 120ms to 8ms on test robot cell #4.",
            badgeColor: "#10b981",
          },
        ],
      },
      {
        id: "crm-deal-3",
        businessId: "nord-tech",
        company: "Stuttgart Robotik AG",
        industry: "Robotics & Drives",
        location: "Stuttgart, Germany",
        country: "Germany",
        employees: "100–250",
        website: "stuttgart-robotik.de",
        revenue: "$15M–$25M",
        dealValue: "$115,000",
        dealValueNum: 115000,
        stage: "demo_scheduled",
        winProbability: 62,
        tier: "middle",
        expectedCloseDate: "Dec 18, 2026",
        daysInStage: 5,
        owner: "Michael Weber",
        dealTrigger: "Expanding to new automated logistics warehouse facility in Leipzig",
        whyNow: "Facility handover scheduled for January 2027. Need controls infrastructure procured before November 25.",
        techStack: ["KUKA KSS", "Rockwell PLC", "Siemens S7", "SAP ERP"],
        suggestedAction: "Prepare tailored Leipzig facility CAD layout demo before Thursday's stakeholder presentation.",
        aiDealSummary: "High urgency due to immovable plant launch deadline. CTO is lead stakeholder.",
        status: "Active",
        lastTouchTime: "2 days ago",
        primaryContact: {
          name: "Dr. Klaus Lindner",
          title: "Chief Technology Officer",
          email: "k.lindner@stuttgart-robotik.de",
          phone: "+49 711 9821 300",
          verified: true,
          avatarColor: "#3b82f6",
          linkedin: "https://linkedin.com/in/klaus-lindner-robotics",
        },
        activities: [
          {
            id: "act-crm-6",
            type: "call",
            title: "Discovery & Qualification Call",
            time: "2 days ago",
            channel: "Direct Phone Call",
            author: "Michael Weber",
            status: "Completed",
            description: "Confirmed BANT criteria: $120k budget allocated, decision committee consists of CTO and Head of Capex.",
            badgeColor: "#f59e0b",
          },
        ],
      },
      {
        id: "crm-deal-4",
        businessId: "nord-tech",
        company: "Hanseatic Motion Controls",
        industry: "Marine & Heavy Logistics",
        location: "Hamburg, Germany",
        country: "Germany",
        employees: "300–600",
        website: "hanseatic-motion.de",
        revenue: "$40M–$60M",
        dealValue: "$210,000",
        dealValueNum: 210000,
        stage: "discovery",
        winProbability: 45,
        tier: "middle",
        expectedCloseDate: "Jan 10, 2027",
        daysInStage: 14,
        owner: "Michael Weber",
        dealTrigger: "Retrofitting container gantry automation systems for Green Port initiative",
        whyNow: "Federal sustainability subsidies grant requires verified efficiency gains by Q1 2027.",
        techStack: ["ABB Drives", "Schneider Modicon", "Salesforce", "PowerBI"],
        suggestedAction: "Share offshore corrosion resistance whitepaper and schedule technical scoping call.",
        aiDealSummary: "Large potential expansion across 14 container berths if pilot contract validates marine endurance.",
        status: "Active",
        lastTouchTime: "3 days ago",
        primaryContact: {
          name: "Henrik Vostell",
          title: "Director of Terminal Engineering",
          email: "h.vostell@hanseatic-motion.de",
          phone: "+49 40 5512 809",
          verified: true,
          avatarColor: "#059669",
          linkedin: "https://linkedin.com/in/henrik-vostell",
        },
        activities: [
          {
            id: "act-crm-7",
            type: "email",
            title: "Outbound Qualification Response Received",
            time: "3 days ago",
            channel: "Email Cadence Step 2",
            author: "Henrik Vostell",
            status: "Replied",
            description: "Expressed interest in port gantry control pilot. Requested engineering specifications.",
            badgeColor: "#0284c7",
          },
        ],
      },
      {
        id: "crm-deal-5",
        businessId: "nord-tech",
        company: "Rheinland Precision Hydraulics",
        industry: "Heavy Machinery",
        location: "Cologne, Germany",
        country: "Germany",
        employees: "150–300",
        website: "rheinland-hydraulics.de",
        revenue: "$20M–$30M",
        dealValue: "$95,000",
        dealValueNum: 95000,
        stage: "closed_won",
        winProbability: 100,
        tier: "high",
        expectedCloseDate: "Oct 02, 2026",
        daysInStage: 7,
        owner: "Michael Weber",
        dealTrigger: "Emergency replacement of discontinued legacy Italian servo-valves",
        whyNow: "Production stopped on secondary press. NordTech shipped drop-in replacement units within 48 hours.",
        techStack: ["Bosch Rexroth", "Siemens S7-1500", "SAP Business One"],
        suggestedAction: "Initiate 30-day customer success check-in and explore annual maintenance contract upsell.",
        aiDealSummary: "Closed won in record 11 days. Customer is an ecstatic reference advocate ready for case study release.",
        status: "Won",
        lastTouchTime: "5 days ago",
        primaryContact: {
          name: "Marc Obermeier",
          title: "Plant Maintenance Manager",
          email: "m.obermeier@rheinland-hydraulics.de",
          phone: "+49 221 8830 119",
          verified: true,
          avatarColor: "#10b981",
          linkedin: "https://linkedin.com/in/marc-obermeier",
        },
        activities: [
          {
            id: "act-crm-8",
            type: "signal",
            title: "Order Purchase Agreement Executed",
            time: "5 days ago",
            channel: "DocuSign Enterprise",
            author: "Marc Obermeier",
            status: "Signed",
            description: "PO #RH-2026-991 signed for $95,000 initial hardware delivery and support package.",
            badgeColor: "#10b981",
          },
        ],
      },
    ],
  },
  {
    id: "alpine",
    name: "NordTech Solutions GmbH (Alpine Division)",
    company: "Alpine Solutions",
    industry: "Industrial Equipment",
    country: "Germany",
    website: "alpine-solutions.eu",
    owner: "Michael Weber",
    created: "June 14, 2026",
    avatarColor: "#42a8a1",
    crmSystem: "HubSpot Enterprise",
    lastSyncTime: "12 mins ago",
    analytics: {
      totalDeals: 26,
      pipelineValue: "$2.18M",
      pipelineValueNum: 2180000,
      weightedPipelineValue: "$1.34M",
      avgDealSize: "$83.8K",
      winRatePercent: 44,
      avgSalesCycleDays: 29,
      stageBreakdown: {
        discovery: 7,
        demo_scheduled: 6,
        proposal_sent: 5,
        negotiation: 5,
        closed_won: 3,
      },
      tierBreakdown: {
        enterprise: 11,
        midMarket: 10,
        growth: 5,
      },
      dealHealth: {
        decisionMakerEngaged: 20,
        budgetApproved: 14,
        legalSecurityReview: 8,
        atRiskStalled: 2,
      },
    },
    deals: [
      {
        id: "crm-deal-6",
        businessId: "alpine",
        company: "Helvetia CNC Bearbeitung AG",
        industry: "Precision Engineering",
        location: "Zurich, Switzerland",
        country: "Switzerland",
        employees: "120–250",
        website: "helvetia-cnc.ch",
        revenue: "$25M–$40M",
        dealValue: "$145,000",
        dealValueNum: 145000,
        stage: "negotiation",
        winProbability: 82,
        tier: "high",
        expectedCloseDate: "Nov 22, 2026",
        daysInStage: 9,
        owner: "Michael Weber",
        dealTrigger: "High Swiss franc exchange rate forcing 20% automation efficiency boost",
        whyNow: "Swiss cantonal innovation credit program expires at end of Q4 2026.",
        techStack: ["Heidenhain CNC", "Fanuc Robodrill", "Abacus ERP"],
        suggestedAction: "Finalize CHF currency hedging clause and provide delivery commitment for Q1 install.",
        aiDealSummary: "Executive alignment confirmed with COO. High probability of closing before November 25.",
        status: "Active",
        lastTouchTime: "6 hours ago",
        primaryContact: {
          name: "Beat Zürcher",
          title: "Chief Operating Officer",
          email: "b.zuercher@helvetia-cnc.ch",
          phone: "+41 44 201 9920",
          verified: true,
          avatarColor: "#0284c7",
          linkedin: "https://linkedin.com/in/beat-zuercher",
        },
        activities: [
          {
            id: "act-crm-9",
            type: "meeting",
            title: "Swiss Cantonal Grant Alignment Call",
            time: "6 hours ago",
            channel: "Google Meet",
            author: "Michael Weber",
            status: "Completed",
            description: "Confirmed grant eligibility documentation submitted to Zurich Dept of Economic Affairs.",
            badgeColor: "#10b981",
          },
        ],
      },
    ],
  },
  {
    id: "biz-5",
    name: "Nexura Health Technologies",
    company: "Nexura Health",
    industry: "Life Sciences",
    country: "Denmark",
    website: "nexurahealth.dk",
    owner: "Sarah Jenkins",
    created: "July 02, 2026",
    avatarColor: "#2ae9c9",
    crmSystem: "HubSpot Enterprise",
    lastSyncTime: "Just now",
    analytics: {
      totalDeals: 31,
      pipelineValue: "$4.10M",
      pipelineValueNum: 4100000,
      weightedPipelineValue: "$2.68M",
      avgDealSize: "$132.2K",
      winRatePercent: 48,
      avgSalesCycleDays: 42,
      stageBreakdown: {
        discovery: 9,
        demo_scheduled: 8,
        proposal_sent: 6,
        negotiation: 5,
        closed_won: 3,
      },
      tierBreakdown: {
        enterprise: 16,
        midMarket: 11,
        growth: 4,
      },
      dealHealth: {
        decisionMakerEngaged: 25,
        budgetApproved: 18,
        legalSecurityReview: 14,
        atRiskStalled: 3,
      },
    },
    deals: [
      {
        id: "crm-deal-7",
        businessId: "biz-5",
        company: "Nordic Biologics ApS",
        industry: "Biotech & Pharma",
        location: "Copenhagen, Denmark",
        country: "Denmark",
        employees: "300–600",
        website: "nordicbiologics.dk",
        revenue: "$45M–$65M",
        dealValue: "$290,000",
        dealValueNum: 290000,
        stage: "negotiation",
        winProbability: 85,
        tier: "high",
        expectedCloseDate: "Nov 28, 2026",
        daysInStage: 11,
        owner: "Sarah Jenkins",
        dealTrigger: "FDA 21 CFR Part 11 cold chain audit remediation",
        whyNow: "Regulatory audit report deadline requires validated real-time telemetry system deployed by December.",
        techStack: ["Veeva Vault", "LIMS Thermo", "SAP S/4HANA", "Azure IoT"],
        suggestedAction: "Deliver signed Annex 11 validation binder with GMP qualification test scripts.",
        aiDealSummary: "Mission-critical regulatory compliance driver. Quality Assurance VP has signed off on technical architecture.",
        status: "Contract Sent",
        lastTouchTime: "2 hours ago",
        primaryContact: {
          name: "Dr. Freja Lindegaard",
          title: "VP Quality & Regulatory Compliance",
          email: "f.lindegaard@nordicbiologics.dk",
          phone: "+45 33 12 90 40",
          verified: true,
          avatarColor: "#8b5cf6",
          linkedin: "https://linkedin.com/in/freja-lindegaard",
        },
        activities: [
          {
            id: "act-crm-10",
            type: "email",
            title: "Validation Master Plan Annex Transmitted",
            time: "2 hours ago",
            channel: "Secure Pharma Portal",
            author: "Sarah Jenkins",
            status: "Delivered",
            description: "Uploaded IQ/OQ/PQ validation protocol documentation and sensor calibration certificates.",
            badgeColor: "#0284c7",
          },
        ],
      },
    ],
  },
];

export function getStageLabel(stage: CrmDealStage) {
  switch (stage) {
    case "discovery":
      return { label: "Discovery", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" };
    case "demo_scheduled":
      return { label: "Demo Scheduled", color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" };
    case "proposal_sent":
      return { label: "Proposal Sent", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" };
    case "negotiation":
      return { label: "Negotiation", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" };
    case "closed_won":
      return { label: "Closed Won", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" };
    case "closed_lost":
      return { label: "Closed Lost", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
    default:
      return { label: "Pipeline", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" };
  }
}
