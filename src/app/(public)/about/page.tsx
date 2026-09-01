import type { Metadata } from "next";



import AboutHero from "@/components/public/about/about-hero";
import AboutIntroduction from "@/components/public/about/about-introduction";
import AboutMission from "@/components/public/about/about-mission";
import AboutEcosystem from "@/components/public/about/about-ecosystem";
import AboutValues from "@/components/public/about/about-values";
import AboutRoles from "@/components/public/about/about-roles";
import AboutPlatform from "@/components/public/about/about-platform";
import AboutFlow from "@/components/public/about/about-flow";
import AboutSecurity from "@/components/public/about/about-security";
import AboutCta from "@/components/public/about/about-cta";

export const metadata: Metadata = {
  title: "About ITMT",
  description:
    "Learn how the ITMT Management System connects academic administration, students, lecturers, finance, and institutional operations.",
};

export default function AboutPage() {
  return (
    <>

      <main>
        <AboutHero />
        <AboutIntroduction />
        <AboutMission />
        <AboutEcosystem />
        <AboutValues />
        <AboutRoles />
        <AboutPlatform />
        <AboutFlow />
        <AboutSecurity />
        <AboutCta />
      </main>

 
    </>
  );
}