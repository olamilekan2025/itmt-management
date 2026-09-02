import type { Metadata } from "next";


import ContactHero from "@/components/public/contact/contact-hero";
import ContactInfo from "@/components/public/contact/contact-info";
import ContactSection from "@/components/public/contact/Contact-section";

export default function ContactPage() {
  return (
    <>
      <ContactHero />

      <ContactInfo />
      <ContactSection/>

    </>
  );
}