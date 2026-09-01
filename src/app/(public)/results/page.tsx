import type { Metadata } from "next";

import ResultsHero from "@/components/public/results/results-hero";
import ResultsInformation from "@/components/public/results/results-information";
import ResultsProcess from "@/components/public/results/results-process";
import ResultsSecurity from "@/components/public/results/results-security";
import ResultsFaq from "@/components/public/results/results-faq";
import ResultsCta from "@/components/public/results/results-cta";

export const metadata: Metadata = {
  title: "Results | ITMT Management System",
  description:
    "Access and verify your academic results securely through the ITMT platform. View your grades, scores, and academic performance by semester.",
};

export default function ResultsPage() {
  return (
    <main>
      <ResultsHero />
      <ResultsInformation />
      <ResultsProcess />
      <ResultsSecurity />
      <ResultsFaq />
      <ResultsCta />
    </main>
  );
}