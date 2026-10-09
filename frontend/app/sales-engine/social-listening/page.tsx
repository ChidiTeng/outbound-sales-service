import { SocialListeningView } from "@/components/social-listening/social-listening-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social Listening - AI Buying Intent Radar & Omnichannel Cadences",
  description: "Capture live buying intent across social platforms, resolve decision-makers to accounts, and enroll into dual-channel cadences.",
};

export default function SocialListeningPage() {
  return <SocialListeningView />;
}
