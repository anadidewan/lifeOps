import {
  AccountabilityCoach,
  CloudSection,
  DashboardPreview,
  Features,
  FinalCTA,
  Footer,
  GlowBackdrop,
  Hero,
  HowItWorks,
  Navbar,
  PreFailureSection,
  TrustStrip,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <GlowBackdrop />
      <Navbar />
      <main className="relative flex-1">
        <Hero />
        <TrustStrip />
        <Features />
        <HowItWorks />
        <PreFailureSection />
        <DashboardPreview />
        <AccountabilityCoach />
        <CloudSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
