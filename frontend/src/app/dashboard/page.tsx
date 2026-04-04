import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { GlowBackdrop } from "@/components/landing/GlowBackdrop";
import { Navbar } from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "Dashboard | LifeOS",
  description: "Your LifeOS academic control center. Plans, risk, drafts, and momentum in one view.",
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <GlowBackdrop />
      <Navbar />
      <DashboardClient />
    </div>
  );
}
