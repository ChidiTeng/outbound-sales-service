export interface SmartLeadContact {
  name: string;
  title: string;
  email: string;
  phone: string;
  verified: boolean;
  avatarColor: string;
}

export interface SmartLead {
  id: string;
  company: string;
  industry: string;
  location: string;
  country: string;
  employees: string;
  website: string;
  revenue: string;
  fitScore: number;
  intentLevel: "Very High" | "High" | "Medium";
  intentTrigger: string;
  whyNow: string;
  primaryContact: SmartLeadContact;
  techStack: string[];
  matchedPresets: string[];
}

export const SMART_LEADS_DATA: SmartLead[] = [
  {
    id: "lead-1",
    company: "Kaiser Precision Automation SE",
    industry: "Industrial Automation",
    location: "Frankfurt, Germany",
    country: "Germany",
    employees: "250–500",
    website: "kaiser-automation.de",
    revenue: "$35M–$50M",
    fitScore: 96,
    intentLevel: "Very High",
    intentTrigger: "Active Hiring: 4 Supply Chain & Procurement Leads",
    whyNow: "Expanded factory footprint in Stuttgart last week; actively procuring automated assembly pipeline equipment.",
    primaryContact: {
      name: "Thomas Becker",
      title: "VP Supply Chain & Operations",
      email: "t.becker@kaiser-automation.de",
      phone: "+49 69 4029 182",
      verified: true,
      avatarColor: "#2ae9c9",
    },
    techStack: ["SAP S/4HANA", "Salesforce", "Siemens PLM"],
    matchedPresets: ["all", "dach", "high-intent", "hiring"],
  },
  {
    id: "lead-2",
    company: "Lumina Optics AG",
    industry: "Precision Manufacturing",
    location: "Zurich, Switzerland",
    country: "Switzerland",
    employees: "180–300",
    website: "lumina-optics.ch",
    revenue: "$20M–$35M",
    fitScore: 94,
    intentLevel: "Very High",
    intentTrigger: "Closed €22M Series B Growth Round (14d ago)",
    whyNow: "Deploying newly raised capital into European sales acceleration and high-throughput optical testing lines.",
    primaryContact: {
      name: "Clara Vogel",
      title: "Director of Strategic Procurement",
      email: "c.vogel@lumina-optics.ch",
      phone: "+41 44 820 4910",
      verified: true,
      avatarColor: "#c974f4",
    },
    techStack: ["HubSpot Enterprise", "Oracle NetSuite", "AWS"],
    matchedPresets: ["all", "dach", "high-intent", "funding"],
  },
  {
    id: "lead-3",
    company: "Helios Clean Energy Systems GmbH",
    industry: "Renewable Energy",
    location: "Munich, Germany",
    country: "Germany",
    employees: "400–750",
    website: "helios-energy.com",
    revenue: "$60M–$90M",
    fitScore: 92,
    intentLevel: "High",
    intentTrigger: "Opened New Regional Office in Vienna",
    whyNow: "Entering Austrian and Central European industrial grid markets; scaling vendor pipeline and account outreach.",
    primaryContact: {
      name: "Stefan Lindner",
      title: "Head of Commercial Partnerships",
      email: "s.lindner@helios-energy.com",
      phone: "+49 89 5192 384",
      verified: true,
      avatarColor: "#dc9c56",
    },
    techStack: ["Microsoft Dynamics 365", "Azure", "Marketo"],
    matchedPresets: ["all", "dach", "high-intent", "expansion"],
  },
  {
    id: "lead-4",
    company: "Orbit Cyber Defense Ltd",
    industry: "Enterprise Cybersecurity",
    location: "Amsterdam, Netherlands",
    country: "Netherlands",
    employees: "120–200",
    website: "orbitdefense.io",
    revenue: "$15M–$25M",
    fitScore: 90,
    intentLevel: "High",
    intentTrigger: "Hiring 6 Enterprise SDRs & Account Executives",
    whyNow: "Ramping up EMEA outbound outbound campaigns to target mid-market banking and healthcare providers.",
    primaryContact: {
      name: "Sanne De Jong",
      title: "VP of Global Revenue",
      email: "s.dejong@orbitdefense.io",
      phone: "+31 20 894 1022",
      verified: true,
      avatarColor: "#42a8a1",
    },
    techStack: ["Salesforce CRM", "Apollo.io", "Gong"],
    matchedPresets: ["all", "high-intent", "hiring"],
  },
  {
    id: "lead-5",
    company: "Bavaria Heavy Logistics SE",
    industry: "Logistics & Transport",
    location: "Nuremberg, Germany",
    country: "Germany",
    employees: "600–1,200",
    website: "bavaria-logistics.de",
    revenue: "$110M–$150M",
    fitScore: 89,
    intentLevel: "High",
    intentTrigger: "New Fleet Modernization Tender Published",
    whyNow: "Published public RFP for warehouse telemetry and route optimization vendor contracts.",
    primaryContact: {
      name: "Markus Eichmann",
      title: "Director of Fleet Procurement",
      email: "m.eichmann@bavaria-logistics.de",
      phone: "+49 911 391 842",
      verified: true,
      avatarColor: "#c9ae4d",
    },
    techStack: ["SAP Transportation", "Salesforce", "Tableau"],
    matchedPresets: ["all", "dach", "high-intent"],
  },
  {
    id: "lead-6",
    company: "Vanguard Robotics Corp",
    industry: "Robotics & AI",
    location: "Berlin, Germany",
    country: "Germany",
    employees: "80–150",
    website: "vanguard-robotics.eu",
    revenue: "$12M–$20M",
    fitScore: 87,
    intentLevel: "Medium",
    intentTrigger: "Series A Financing Announced ($14M)",
    whyNow: "Commercializing autonomous mobile warehouse robots for pharmaceutical and electronics manufacturers.",
    primaryContact: {
      name: "Elena Rostova",
      title: "Co-Founder & Chief Product Officer",
      email: "e.rostova@vanguard-robotics.eu",
      phone: "+49 30 7820 449",
      verified: true,
      avatarColor: "#a842a2",
    },
    techStack: ["HubSpot", "Google Workspace", "Segment"],
    matchedPresets: ["all", "dach", "funding"],
  },
];
