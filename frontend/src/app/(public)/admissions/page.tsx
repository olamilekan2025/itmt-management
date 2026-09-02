import type { Metadata } from "next";

import AdmissionsHero from "@/components/public/admissions/admissions-hero";
import AdmissionsIntroduction from "@/components/public/admissions/admissions-introduction";
import AdmissionsOverview from "@/components/public/admissions/admissions-overview";
import AdmissionsProgrammes from "@/components/public/admissions/admissions-programmes";
import AdmissionsRequirements from "@/components/public/admissions/admissions-requirements";
import AdmissionsProcess from "@/components/public/admissions/admissions-process";
import AdmissionsImportantInformation from "@/components/public/admissions/admissions-important-information";
import AdmissionsFaq from "@/components/public/admissions/admissions-faq";
import AdmissionsCta from "@/components/public/admissions/admissions-cta";

export const metadata: Metadata = {
  title: "Admissions | ITMT Management System",
  description:
    "Explore admission information, academic opportunities, and the steps required to begin your journey with ITMT.",
};

export default function AdmissionsPage() {
  return (
    <>
      <main>
        <AdmissionsHero />
        <AdmissionsIntroduction />
        <AdmissionsOverview />
        <AdmissionsProgrammes />
        <AdmissionsRequirements />
        <AdmissionsProcess />
        <AdmissionsImportantInformation />
        <AdmissionsFaq />
        <AdmissionsCta />
      </main>
    </>
  );
}