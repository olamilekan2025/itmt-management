import type { Metadata } from "next";

import ContactHero from "@/components/public/contact/contact-hero";
import ContactInfo from "@/components/public/contact/contact-info";
import ContactSection from "@/components/public/contact/Contact-section";

export const metadata: Metadata = {
  title: "Contact Us | ITMT Academy",
  description:
    "Get in touch with ITMT Academy for enquiries about admissions, programmes, courses, accounts, and student support.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-brand-light">
      <ContactHero />
      <ContactInfo />
      <ContactSection />
    </main>
  );
}