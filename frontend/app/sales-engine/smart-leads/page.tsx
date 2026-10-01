import { SmartLeadsView } from "@/components/smart-leads/smart-leads-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Leads - AI Discovery & Buying Intent",
  description: "Identify high-intent enterprise prospects and enroll them directly into automated outreach sequences.",
};

export default function SmartLeadsPage() {
  return <SmartLeadsView />;
}
