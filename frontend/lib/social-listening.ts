import {
  type SmartLeadContact,
  type SmartLeadActivity,
  type ProspectTier,
} from "./smart-leads";

export type SocialPlatform = "linkedin" | "twitter" | "reddit" | "github" | "news";

export interface SocialMentionDetails {
  platform: SocialPlatform;
  authorHandle: string;
  authorFollowers?: string;
  postUrl: string;
  postedAt: string;
  contentSnippet: string;
  fullContent?: string;
  intentCategory: "competitor_switch" | "recommendation_request" | "pain_point" | "industry_trend";
  intentTrigger: string;
  engagementStats: {
    likes: number;
    comments: number;
    reposts: number;
  };
  sentiment: "Frustrated" | "Evaluating" | "Inquiring" | "Positive";
}

export interface SocialLead {
  id: string;
  businessId: string;
  company: string;
  industry: string;
  location: string;
  country: string;
  employees: string;
  website: string;
  revenue: string;
  fitScore: number;
  tier: ProspectTier;
  intentLevel: "Very High" | "High" | "Medium" | "Low";
  primaryContact: SmartLeadContact;
  socialMention: SocialMentionDetails;
  whyNow: string;
  techStack: string[];
  matchedKeywords: string[];
  suggestedAction: string;
  aiDraftedReply?: string;
  status: "New Match" | "In Cadence" | "Social Touched" | "Meeting Booked" | "Engaged" | "Uncontacted";
  lastActive: string;
  activities: SmartLeadActivity[];
}

export interface BusinessSocialAnalytics {
  totalProspects: number;
  highTierCount: number;
  middleTierCount: number;
  lowTierCount: number;
  highTierPercent: number;
  middleTierPercent: number;
  lowTierPercent: number;
  avgFitScore: number;
  socialMentionsCount: number;
  meetingsBooked: number;
  verifiedContactRate: number;
  signalBreakdown: {
    competitorSwitch: number;
    recommendations: number;
    painPoints: number;
    hiringSpikes: number;
  };
  channelBreakdown: {
    linkedin: number;
    twitter: number;
    reddit: number;
    github: number;
  };
}

export interface SocialVelocityDayPoint {
  day: string;
  dayLabel: string;
  mentions: number;
  cadenceTouches: number;
  socialReplies: number;
  meetings: number;
}

export function getBusinessSocialVelocityData(businessId: string): SocialVelocityDayPoint[] {
  const days = [
    "Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7",
    "Day 8", "Day 9", "Day 10", "Day 11", "Day 12", "Day 13", "Today"
  ];
  const labels = [
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"
  ];

  const seedMultiplier = businessId === "nord-tech" ? 1.25 : businessId === "alpine" ? 0.95 : 1.1;
  const mentionBases = [18, 31, 39, 35, 29, 10, 8, 24, 42, 45, 38, 33, 14, 29];

  return days.map((day, i) => {
    const mentions = Math.round(mentionBases[i] * seedMultiplier);
    const cadenceTouches = Math.round(mentions * (1.1 + (i % 3) * 0.12));
    const socialReplies = Math.max(1, Math.round(mentions * (0.28 + (i % 2) * 0.05)));
    const meetings = i % 3 === 0 ? Math.max(1, Math.round(socialReplies * 0.38)) : 0;
    return {
      day,
      dayLabel: labels[i],
      mentions,
      cadenceTouches,
      socialReplies,
      meetings,
    };
  });
}

export interface OnboardedListeningBusiness {
  id: string;
  name: string;
  company: string;
  industry: string;
  country: string;
  website: string;
  owner: string;
  created: string;
  avatarColor: string;
  emailsSent: number;
  monitoredKeywords: string[];
  analytics: BusinessSocialAnalytics;
  prospects: SocialLead[];
}

export const ONBOARDED_LISTENING_BUSINESSES: OnboardedListeningBusiness[] = [
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
    emailsSent: 50000,
    monitoredKeywords: [
      "Siemens PLM",
      "Factory Automation",
      "CNC Tooling",
      "Predictive Maintenance",
      "Industrial Robotics",
    ],
    analytics: {
      totalProspects: 126,
      highTierCount: 58,
      middleTierCount: 46,
      lowTierCount: 22,
      highTierPercent: 46,
      middleTierPercent: 37,
      lowTierPercent: 17,
      avgFitScore: 91,
      socialMentionsCount: 248,
      meetingsBooked: 29,
      verifiedContactRate: 98.4,
      signalBreakdown: {
        competitorSwitch: 44,
        recommendations: 38,
        painPoints: 28,
        hiringSpikes: 16,
      },
      channelBreakdown: {
        linkedin: 112,
        twitter: 76,
        reddit: 42,
        github: 18,
      },
    },
    prospects: [
      {
        id: "soc-nt-1",
        businessId: "nord-tech",
        company: "Kaiser Precision Automation SE",
        industry: "Industrial Automation",
        location: "Frankfurt, Germany",
        country: "Germany",
        employees: "250–500",
        website: "kaiser-automation.de",
        revenue: "$35M–$50M",
        fitScore: 97,
        tier: "high",
        intentLevel: "Very High",
        whyNow: "VP of Supply Chain posted publicly on LinkedIn seeking immediate alternatives to Siemens PLM due to contract renewal price hikes and latency.",
        techStack: ["Siemens PLM", "SAP S/4HANA", "Salesforce"],
        matchedKeywords: ["Siemens PLM", "Factory Automation"],
        suggestedAction: "Send personalized LinkedIn connection referencing Siemens migration + enroll in 'PLM Alternative' dual sequence.",
        aiDraftedReply: "Hi Thomas, caught your post on Siemens PLM renewal friction. NordTech recently helped German assembly plants cut tooling sync latency by 45% while slashing annual license overhead. Happy to share a 3-page teardown if helpful.",
        status: "Engaged",
        lastActive: "2 hours ago",
        primaryContact: {
          name: "Thomas Becker",
          title: "VP Supply Chain & Operations",
          email: "t.becker@kaiser-automation.de",
          phone: "+49 69 4029 182",
          verified: true,
          avatarColor: "#2ae9c9",
          linkedin: "https://linkedin.com/in/thomas-becker-ops",
        },
        socialMention: {
          platform: "linkedin",
          authorHandle: "thomas-becker-ops",
          authorFollowers: "4,820",
          postUrl: "https://linkedin.com/posts/thomas-becker-automation-plm-switch",
          postedAt: "3 hours ago",
          contentSnippet: "We are re-evaluating our assembly floor PLM tooling this quarter. The licensing costs on our legacy Siemens PLM stack no longer make sense for our modular robotics lines. What modern European alternatives are teams using?",
          fullContent: "We are re-evaluating our assembly floor PLM tooling this quarter. The licensing costs on our legacy Siemens PLM stack no longer make sense for our modular robotics lines in Frankfurt and Stuttgart. What modern European alternatives are teams using that provide native SAP connectors?",
          intentCategory: "competitor_switch",
          intentTrigger: "Publicly soliciting Siemens PLM replacements for factory assembly lines",
          engagementStats: {
            likes: 47,
            comments: 23,
            reposts: 9,
          },
          sentiment: "Frustrated",
        },
        activities: [
          {
            id: "soc-act-1",
            type: "signal",
            title: "LinkedIn Buying Intent Signal Captured",
            time: "3 hours ago",
            channel: "LinkedIn Social Radar",
            author: "Thomas Becker",
            status: "High Intent",
            description: "Thomas Becker authored a viral discussion post searching for alternatives to Siemens PLM.",
            badgeColor: "#0284c7",
          },
          {
            id: "soc-act-2",
            type: "email",
            title: "Dual Outreach Cadence Queued",
            time: "1 hour ago",
            channel: "Email & LinkedIn Hook",
            author: "Automated Omnichannel",
            status: "Scheduled",
            description: "Day 1 intro email + LinkedIn connection note scheduled with reference to his public inquiry.",
            badgeColor: "#c974f4",
          },
          {
            id: "soc-act-3",
            type: "meeting",
            title: "LinkedIn InMail Reply Received",
            time: "35 mins ago",
            channel: "LinkedIn DM",
            author: "Thomas Becker",
            status: "Replied",
            description: "Thomas replied: 'Send over the teardown specs. Let's look at compatibilities Thursday.'",
            badgeColor: "#059669",
          },
        ],
      },
      {
        id: "soc-nt-2",
        businessId: "nord-tech",
        company: "Lumina Optics AG",
        industry: "Precision Manufacturing",
        location: "Zurich, Switzerland",
        country: "Switzerland",
        employees: "180–300",
        website: "lumina-optics.ch",
        revenue: "$20M–$35M",
        fitScore: 94,
        tier: "high",
        intentLevel: "Very High",
        whyNow: "Director of Strategic Procurement asked on X/Twitter for precision CNC tooling suppliers that support sub-micron optical tolerance calibration.",
        techStack: ["HubSpot Enterprise", "Oracle NetSuite", "AWS"],
        matchedKeywords: ["CNC Tooling", "Predictive Maintenance"],
        suggestedAction: "Drop contextual Twitter/X reply highlighting sub-micron tolerances + push to Day 1 Swiss Manufacturing email sequence.",
        aiDraftedReply: "@clara_optics We just published our sub-micron CNC calibration benchmark comparing thermal drift across European optical setups. Can DM the dataset if you're evaluating suppliers this week!",
        status: "In Cadence",
        lastActive: "Yesterday at 16:15",
        primaryContact: {
          name: "Clara Vogel",
          title: "Director of Strategic Procurement",
          email: "c.vogel@lumina-optics.ch",
          phone: "+41 44 820 4910",
          verified: true,
          avatarColor: "#c974f4",
          linkedin: "https://linkedin.com/in/clara-vogel-procure",
        },
        socialMention: {
          platform: "twitter",
          authorHandle: "@clara_optics",
          authorFollowers: "2,190",
          postUrl: "https://x.com/clara_optics/status/1892019823",
          postedAt: "Yesterday at 14:10",
          contentSnippet: "Expanding our Zurich optical calibration lines. Need precision CNC tooling partners with guaranteed thermal stability under 0.8 microns. Recommendations welcome from Swiss or German hardware folks!",
          intentCategory: "recommendation_request",
          intentTrigger: "Direct supplier recommendation request for sub-micron CNC calibration lines",
          engagementStats: {
            likes: 31,
            comments: 14,
            reposts: 5,
          },
          sentiment: "Evaluating",
        },
        activities: [
          {
            id: "soc-act-4",
            type: "signal",
            title: "X/Twitter Supplier Request Detected",
            time: "Yesterday at 14:10",
            channel: "X/Twitter Radar",
            author: "@clara_optics",
            status: "Signal Logged",
            description: "Keyword trigger: 'CNC tooling partners' + 'optical calibration'.",
            badgeColor: "#0284c7",
          },
          {
            id: "soc-act-5",
            type: "email",
            title: "Swiss Precision Email Cadence #1 Sent",
            time: "Yesterday at 16:15",
            channel: "Email",
            author: "Automated Cadence",
            status: "Delivered",
            description: "Email delivered with link to sub-micron optical calibration whitepaper.",
            badgeColor: "#c974f4",
          },
        ],
      },
      {
        id: "soc-nt-3",
        businessId: "nord-tech",
        company: "Bavaria Mechatronik GmbH",
        industry: "Automotive Components",
        location: "Munich, Germany",
        country: "Germany",
        employees: "500–1,000",
        website: "bavaria-mechatronik.de",
        revenue: "$75M–$120M",
        fitScore: 92,
        tier: "high",
        intentLevel: "High",
        whyNow: "Head of Robotics Engineering posted in r/robotics discussing recurring breakdown rates on competitor ABB controllers and asking about modular retrofits.",
        techStack: ["ABB RobotStudio", "Siemens S7", "KUKA"],
        matchedKeywords: ["Industrial Robotics", "Factory Automation"],
        suggestedAction: "Enroll in 'Controller Retrofit ROI' sequence + initiate LinkedIn outreach highlighting retrofit compatibility.",
        aiDraftedReply: "Interesting breakdown patterns. We've seen similar thermal degradation with standard controllers in Tier-1 automotive cells. A modular retrofit typically cuts maintenance stops by 70%.",
        status: "New Match",
        lastActive: "Today at 08:45",
        primaryContact: {
          name: "Lukas Brandt",
          title: "Head of Robotics & Assembly",
          email: "l.brandt@bavaria-mechatronik.de",
          phone: "+49 89 5501 928",
          verified: true,
          avatarColor: "#f59e0b",
          linkedin: "https://linkedin.com/in/lukas-brandt-robotics",
        },
        socialMention: {
          platform: "reddit",
          authorHandle: "u/bavaria_robotics_eng",
          postUrl: "https://reddit.com/r/robotics/comments/182k9x/abb_controller_failures/",
          postedAt: "6 hours ago",
          contentSnippet: "Anyone else seeing increased thermal failure rates on older assembly controllers under continuous 3-shift duty? Considering retrofitting with modern European modular modules instead of full line replacement.",
          intentCategory: "pain_point",
          intentTrigger: "Reddit thread seeking modular retrofit solutions for assembly line controllers",
          engagementStats: {
            likes: 68,
            comments: 32,
            reposts: 4,
          },
          sentiment: "Frustrated",
        },
        activities: [
          {
            id: "soc-act-6",
            type: "signal",
            title: "Reddit Hardware Pain Point Matched",
            time: "6 hours ago",
            channel: "Reddit Intent Radar",
            author: "u/bavaria_robotics_eng",
            status: "Account Resolved",
            description: "Resolved Reddit author handle to Lukas Brandt (Head of Robotics at Bavaria Mechatronik).",
            badgeColor: "#f59e0b",
          },
        ],
      },
      {
        id: "soc-nt-4",
        businessId: "nord-tech",
        company: "Stuttgart Tool & Die Works",
        industry: "Tooling & Hardware",
        location: "Stuttgart, Germany",
        country: "Germany",
        employees: "75–120",
        website: "stuttgart-tooldie.de",
        revenue: "$9M–$14M",
        fitScore: 82,
        tier: "middle",
        intentLevel: "Medium",
        whyNow: "Lead CNC operator asked on GitHub discussion board regarding open-source vibration telemetry plugins for predictive spindle maintenance.",
        techStack: ["SolidWorks", "Siemens Sinumerik", "Python"],
        matchedKeywords: ["Predictive Maintenance", "CNC Tooling"],
        suggestedAction: "Send technical GitHub/Email guide on CNC spindle vibration analytics.",
        status: "New Match",
        lastActive: "Yesterday at 11:10",
        primaryContact: {
          name: "Markus Zimmer",
          title: "Senior CNC Systems Engineer",
          email: "m.zimmer@stuttgart-tooldie.de",
          phone: "+49 711 8802 441",
          verified: true,
          avatarColor: "#42a8a1",
          linkedin: "https://linkedin.com/in/markus-zimmer-cnc",
        },
        socialMention: {
          platform: "github",
          authorHandle: "@mzimmer-cnc",
          postUrl: "https://github.com/industrial-telemetry/discussions/412",
          postedAt: "Yesterday at 10:30",
          contentSnippet: "Looking for production-tested MQTT telemetry libraries that connect Sinumerik CNC controllers to Grafana for spindle vibration anomaly detection.",
          intentCategory: "industry_trend",
          intentTrigger: "GitHub discussion seeking CNC spindle vibration predictive maintenance connectors",
          engagementStats: {
            likes: 12,
            comments: 8,
            reposts: 2,
          },
          sentiment: "Inquiring",
        },
        activities: [
          {
            id: "soc-act-7",
            type: "signal",
            title: "GitHub Developer Inquiry Tracked",
            time: "Yesterday at 10:30",
            channel: "GitHub Radar",
            author: "@mzimmer-cnc",
            status: "Logged",
            description: "Spindle anomaly telemetry discussion matched keyword 'Predictive Maintenance'.",
            badgeColor: "#2ae9c9",
          },
        ],
      },
      {
        id: "soc-nt-5",
        businessId: "nord-tech",
        company: "Rheinland Precision Bearings",
        industry: "Mechanical Components",
        location: "Cologne, Germany",
        country: "Germany",
        employees: "60–90",
        website: "rheinland-bearings.de",
        revenue: "$6M–$10M",
        fitScore: 68,
        tier: "low",
        intentLevel: "Low",
        whyNow: "Company account re-shared general Hanover Messe manufacturing trade fair press release without active pain points.",
        techStack: ["AutoCAD", "Excel"],
        matchedKeywords: ["Factory Automation"],
        suggestedAction: "Monitor for deeper intent spikes; queue in low-priority cold nurture.",
        status: "Uncontacted",
        lastActive: "3 days ago",
        primaryContact: {
          name: "Stefan Keller",
          title: "Plant Manager",
          email: "s.keller@rheinland-bearings.de",
          phone: "+49 221 409 110",
          verified: false,
          avatarColor: "#64748b",
        },
        socialMention: {
          platform: "linkedin",
          authorHandle: "rheinland-bearings",
          postUrl: "https://linkedin.com/posts/rheinland-messe-update",
          postedAt: "3 days ago",
          contentSnippet: "Looking forward to exploring Hanover Messe 2026 this spring to see what new automation innovations are showcased across Hall 9.",
          intentCategory: "industry_trend",
          intentTrigger: "General industry event attendance announcement",
          engagementStats: {
            likes: 9,
            comments: 1,
            reposts: 0,
          },
          sentiment: "Positive",
        },
        activities: [
          {
            id: "soc-act-8",
            type: "signal",
            title: "General Event Mention Logged",
            time: "3 days ago",
            channel: "LinkedIn",
            author: "Stefan Keller",
            status: "Low Priority",
            description: "Informational post without explicit software procurement intent.",
            badgeColor: "#64748b",
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
    emailsSent: 32000,
    monitoredKeywords: [
      "Cleanroom Automation",
      "LabVIEW Drivers",
      "Alpine Robotics",
      "Swiss MedTech",
      "Pharma Packaging",
    ],
    analytics: {
      totalProspects: 88,
      highTierCount: 39,
      middleTierCount: 34,
      lowTierCount: 15,
      highTierPercent: 44,
      middleTierPercent: 39,
      lowTierPercent: 17,
      avgFitScore: 89,
      socialMentionsCount: 172,
      meetingsBooked: 21,
      verifiedContactRate: 97.8,
      signalBreakdown: {
        competitorSwitch: 29,
        recommendations: 26,
        painPoints: 21,
        hiringSpikes: 12,
      },
      channelBreakdown: {
        linkedin: 82,
        twitter: 49,
        reddit: 27,
        github: 14,
      },
    },
    prospects: [
      {
        id: "soc-alp-1",
        businessId: "alpine",
        company: "Helvetic Micro-Systems AG",
        industry: "Precision Manufacturing",
        location: "Basel, Switzerland",
        country: "Switzerland",
        employees: "140–220",
        website: "helvetic-micro.ch",
        revenue: "$18M–$28M",
        fitScore: 96,
        tier: "high",
        intentLevel: "Very High",
        whyNow: "VP of Quality posted on LinkedIn celebrating new cleanroom facility expansion while highlighting urgent need for validated automation testing stations.",
        techStack: ["Siemens TIA Portal", "SAP", "LabVIEW"],
        matchedKeywords: ["Cleanroom Automation", "Swiss MedTech"],
        suggestedAction: "Send LinkedIn congratulations note + pitch cleanroom validated testing cells via dual cadence.",
        aiDraftedReply: "Congratulations on the Basel cleanroom expansion, Beatrix! If your team is evaluating ISO Class 5 validated automation stations, Alpine's pre-certified modules might save weeks of calibration validation.",
        status: "Engaged",
        lastActive: "Today at 09:30",
        primaryContact: {
          name: "Beatrix Steiner",
          title: "VP of Quality & Automation",
          email: "b.steiner@helvetic-micro.ch",
          phone: "+41 61 729 440",
          verified: true,
          avatarColor: "#2ae9c9",
          linkedin: "https://linkedin.com/in/beatrix-steiner-basel",
        },
        socialMention: {
          platform: "linkedin",
          authorHandle: "beatrix-steiner-basel",
          authorFollowers: "3,410",
          postUrl: "https://linkedin.com/posts/beatrix-steiner-basel-cleanroom-launch",
          postedAt: "Yesterday at 17:00",
          contentSnippet: "Thrilled to announce that Phase 2 of our Basel cleanroom facility is ahead of schedule! Now looking for certified hardware partners for automated micro-assembly test rigs compliant with ISO 14644.",
          intentCategory: "recommendation_request",
          intentTrigger: "Publicly procuring ISO cleanroom automated test stations for Swiss plant",
          engagementStats: {
            likes: 84,
            comments: 29,
            reposts: 11,
          },
          sentiment: "Evaluating",
        },
        activities: [
          {
            id: "alp-act-1",
            type: "signal",
            title: "LinkedIn Expansion Post Tracked",
            time: "Yesterday at 17:00",
            channel: "LinkedIn Social Radar",
            author: "Beatrix Steiner",
            status: "High Intent",
            description: "High intent signal: 'Looking for certified hardware partners for automated micro-assembly'.",
            badgeColor: "#0284c7",
          },
          {
            id: "alp-act-2",
            type: "meeting",
            title: "Social Outreach Converted to Intro Call",
            time: "Today at 09:30",
            channel: "Google Meet",
            author: "Beatrix Steiner",
            status: "Meeting Booked",
            description: "Sync scheduled with Beatrix and Alpine Lead Engineer for next Tuesday.",
            badgeColor: "#059669",
          },
        ],
      },
      {
        id: "soc-alp-2",
        businessId: "alpine",
        company: "Geneva BioInstruments SA",
        industry: "Medical Devices",
        location: "Geneva, Switzerland",
        country: "Switzerland",
        employees: "90–150",
        website: "geneva-bioinstruments.ch",
        revenue: "$12M–$19M",
        fitScore: 91,
        tier: "high",
        intentLevel: "High",
        whyNow: "Head of Device Engineering tweeted asking why Swiss precision robotic dispensing units have 18-week lead times from German incumbents.",
        techStack: ["SolidWorks", "Python", "Beckhoff"],
        matchedKeywords: ["Swiss MedTech", "Alpine Robotics"],
        suggestedAction: "Reach out via X and direct email with Alpine's 4-week guaranteed European dispatch guarantee.",
        status: "In Cadence",
        lastActive: "Yesterday at 15:20",
        primaryContact: {
          name: "Marc Dubuis",
          title: "Head of Device Engineering",
          email: "m.dubuis@geneva-bioinstruments.ch",
          phone: "+41 22 710 882",
          verified: true,
          avatarColor: "#c974f4",
          linkedin: "https://linkedin.com/in/marc-dubuis-geneva",
        },
        socialMention: {
          platform: "twitter",
          authorHandle: "@dubuis_medtech",
          authorFollowers: "1,420",
          postUrl: "https://x.com/dubuis_medtech/status/198239019",
          postedAt: "Yesterday at 12:40",
          contentSnippet: "Why are micro-dispensing robotic heads currently quoting 18-week delivery lead times across Europe? We have a diagnostic line launch blocked in Geneva.",
          intentCategory: "pain_point",
          intentTrigger: "Lead time frustration blocking diagnostic line rollout",
          engagementStats: {
            likes: 19,
            comments: 11,
            reposts: 3,
          },
          sentiment: "Frustrated",
        },
        activities: [
          {
            id: "alp-act-3",
            type: "signal",
            title: "Supply Chain Bottleneck Tweet Logged",
            time: "Yesterday at 12:40",
            channel: "X/Twitter",
            author: "@dubuis_medtech",
            status: "Active",
            description: "Mentioned 18-week lead time frustration for dispensing heads.",
            badgeColor: "#0284c7",
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
    emailsSent: 41200,
    monitoredKeywords: [
      "IVDR Compliance",
      "Clinical Diagnostics",
      "FHIR Interoperability",
      "Nordic MedTech",
      "EHR Integration",
    ],
    analytics: {
      totalProspects: 96,
      highTierCount: 45,
      middleTierCount: 35,
      lowTierCount: 16,
      highTierPercent: 47,
      middleTierPercent: 36,
      lowTierPercent: 17,
      avgFitScore: 92,
      socialMentionsCount: 210,
      meetingsBooked: 26,
      verifiedContactRate: 98.9,
      signalBreakdown: {
        competitorSwitch: 36,
        recommendations: 30,
        painPoints: 22,
        hiringSpikes: 18,
      },
      channelBreakdown: {
        linkedin: 98,
        twitter: 58,
        reddit: 34,
        github: 20,
      },
    },
    prospects: [
      {
        id: "soc-nex-1",
        businessId: "biz-5",
        company: "Kobenhavn Biosystems ApS",
        industry: "Life Sciences",
        location: "Copenhagen, Denmark",
        country: "Denmark",
        employees: "130–190",
        website: "kbh-biosystems.dk",
        revenue: "$16M–$24M",
        fitScore: 95,
        tier: "high",
        intentLevel: "Very High",
        whyNow: "Director of Digital Health authored a viral LinkedIn post breaking down EU IVDR compliance reporting headaches and looking for automated pipeline software.",
        techStack: ["HL7 / FHIR", "AWS MedTech", "Datadog"],
        matchedKeywords: ["IVDR Compliance", "Clinical Diagnostics"],
        suggestedAction: "Trigger LinkedIn engagement on IVDR post + enroll into 'IVDR Automation' dual sequence.",
        aiDraftedReply: "Spot on Frederik. Many Danish diagnostic teams spend over 40 hours monthly manually compiling IVDR audit manifests. Nexura's automated pipeline cuts this to under 15 minutes.",
        status: "Engaged",
        lastActive: "Yesterday at 14:05",
        primaryContact: {
          name: "Frederik Møller",
          title: "Director of Digital Health",
          email: "f.moller@kbh-biosystems.dk",
          phone: "+45 33 912 405",
          verified: true,
          avatarColor: "#2ae9c9",
          linkedin: "https://linkedin.com/in/frederik-moller-cph",
        },
        socialMention: {
          platform: "linkedin",
          authorHandle: "frederik-moller-cph",
          authorFollowers: "5,120",
          postUrl: "https://linkedin.com/posts/frederik-moller-ivdr-headache",
          postedAt: "Yesterday at 11:15",
          contentSnippet: "The EU IVDR compliance paper trail is consuming nearly 20% of our engineering bandwidth this quarter. Are other Nordic diagnostics firms building custom parsers or is there an enterprise automation platform worth checking out?",
          intentCategory: "competitor_switch",
          intentTrigger: "Publicly seeking enterprise automated software for EU IVDR compliance reporting",
          engagementStats: {
            likes: 62,
            comments: 31,
            reposts: 12,
          },
          sentiment: "Frustrated",
        },
        activities: [
          {
            id: "nex-act-1",
            type: "signal",
            title: "IVDR Compliance Post Detected",
            time: "Yesterday at 11:15",
            channel: "LinkedIn Social Radar",
            author: "Frederik Møller",
            status: "High Intent",
            description: "Captured high buying intent query on IVDR automation.",
            badgeColor: "#0284c7",
          },
        ],
      },
      {
        id: "soc-nex-2",
        businessId: "biz-5",
        company: "Oslo Medical Informatics AS",
        industry: "Enterprise Software",
        location: "Oslo, Norway",
        country: "Norway",
        employees: "60–90",
        website: "oslo-medinfo.no",
        revenue: "$8M–$12M",
        fitScore: 88,
        tier: "middle",
        intentLevel: "High",
        whyNow: "Head of Product posted on X asking about FHIR REST API connectors to bridge Norwegian clinic EHR systems.",
        techStack: ["PostgreSQL", "Next.js", "FHIR"],
        matchedKeywords: ["FHIR Interoperability", "EHR Integration"],
        suggestedAction: "Send technical FHIR connector demo via X and invite to product preview.",
        status: "New Match",
        lastActive: "Today at 10:15",
        primaryContact: {
          name: "Ingrid Bakke",
          title: "Head of Product",
          email: "i.bakke@oslo-medinfo.no",
          phone: "+47 22 840 190",
          verified: true,
          avatarColor: "#42a8a1",
          linkedin: "https://linkedin.com/in/ingrid-bakke-oslo",
        },
        socialMention: {
          platform: "twitter",
          authorHandle: "@ingrid_medtech",
          authorFollowers: "1,880",
          postUrl: "https://x.com/ingrid_medtech/status/192840192",
          postedAt: "Today at 09:40",
          contentSnippet: "Integrating Scandinavian EHR systems via FHIR APIs is an absolute minefield of dialect variations. Any teams solved native Norwegian clinic data mapping cleanly?",
          intentCategory: "pain_point",
          intentTrigger: "EHR FHIR integration challenge public tweet",
          engagementStats: {
            likes: 24,
            comments: 9,
            reposts: 3,
          },
          sentiment: "Inquiring",
        },
        activities: [
          {
            id: "nex-act-2",
            type: "signal",
            title: "FHIR Interoperability Tweet Tracked",
            time: "Today at 09:40",
            channel: "X/Twitter",
            author: "@ingrid_medtech",
            status: "Active",
            description: "Mentioned EHR dialect challenges in Norway.",
            badgeColor: "#0284c7",
          },
        ],
      },
    ],
  },
];
