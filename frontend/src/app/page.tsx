import {
  Features,
  FinalCTA,
  Footer,
  GlowBackdrop,
  Hero,
  HowItWorks,
  LandingScrollRestore,
  LandingSectionFade,
  Navbar,
  PreFailureSection,
  TrustStrip,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <LandingScrollRestore />
      <GlowBackdrop />
      <Navbar />
      <main className="relative flex-1">
        <LandingSectionFade>
          <Hero />
        </LandingSectionFade>
        <LandingSectionFade>
          <TrustStrip />
        </LandingSectionFade>
        <LandingSectionFade>
          <Features />
        </LandingSectionFade>
        <LandingSectionFade>
          <HowItWorks />
        </LandingSectionFade>
        <LandingSectionFade>
          <PreFailureSection />
        </LandingSectionFade>
        <LandingSectionFade>
          <FinalCTA />
        </LandingSectionFade>
      </main>
      <Footer />
    </>
  );
}
