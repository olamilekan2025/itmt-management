import PublicNavbar from "@/components/public/public-navbar";
import PublicFooter from "@/components/public/public-footer";

import HeroSection from "@/components/public/landing-page/hero-section";
import TrustStats from "@/components/public/landing-page/trust-stats";
import AboutPlatform from "@/components/public/landing-page/about-platform";
import FeaturesSection from "@/components/public/landing-page/features-section";
import PortalsSection from "@/components/public/landing-page/portals-section";
import HowItWorks from "@/components/public/landing-page/how-it-works";
import SecuritySection from "@/components/public/landing-page/security-section";
import CtaSection from "@/components/public/landing-page/cta-section";

export default function HomePage() {
  return (
    <>
      {/* <PublicNavbar /> */}

      <main>
        <HeroSection />
        <TrustStats />
        <AboutPlatform />
        <FeaturesSection />
        <PortalsSection />
        <HowItWorks />
        <SecuritySection />
        <CtaSection />
      </main>

      {/* <PublicFooter /> */}
    </>
  );
}