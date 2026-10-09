import { CrmView } from "@/components/crm/crm-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM & Enterprise Pipeline Hub - SalesEngine",
  description: "Monitor enterprise sales pipelines, track deal velocity across pipeline stages, resolve economic buyers, and advance multi-threaded opportunities.",
};

export default function CrmPage() {
  return <CrmView />;
}
