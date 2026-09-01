"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Slide {
  image: string;
  eyebrow: string;
  headline: string;
  subtext: string;
}

const SLIDES: Slide[] = [
  {
    image: "/images/itmt-hero1.png",
    eyebrow: "Institute of Transport and Management Technology",
    headline:
      "Empowering the future of transport and management through education.",
    subtext:
      "A modern academic environment built to connect students, lecturers, and administrators through a smarter digital experience.",
  },
  {
    image: "",
    eyebrow: "Academic Excellence",
    headline:
      "Building knowledge, skills, and professionals for a changing world.",
    subtext:
      "ITMT provides an environment where students can develop the academic knowledge and practical skills needed to succeed in transport, management, and related fields.",
  },
  {
    image: "/images/itmt-hero3.png",
    eyebrow: "Connected Education",
    headline:
      "One institution. One connected academic experience.",
    subtext:
      "From admissions and course registration to academic records and student services, ITMT brings essential institutional processes together in one place.",
  },
];

const SLIDE_DURATION = 8000;

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, []);

  const active = SLIDES[activeIndex];

  return (
    <section className="relative h-[640px] overflow-hidden bg-brand-navy md:h-[600px]">
      {/* Background images */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* Dark brand overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(29, 31, 34, 0.92) 0%, rgba(39, 47, 58, 0.75) 45%, rgba(50, 56, 65, 0.35) 100%)",
        }}
      />

      {/* Hero content */}
      <div className="relative flex h-full items-center">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-6 text-center">
          {/* Main content */}
          <div className="flex w-full max-w-4xl flex-col items-center">
            <p
              key={`eyebrow-${activeIndex}`}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold transition-opacity duration-700"
            >
              {active.eyebrow}
            </p>

            <h1
              key={`headline-${activeIndex}`}
              className="mt-4 max-w-4xl font-serif text-4xl font-medium leading-tight text-white transition-opacity duration-700 md:text-5xl lg:text-6xl"
            >
              {active.headline}
            </h1>

            <p
              key={`subtext-${activeIndex}`}
              className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 transition-opacity duration-700 md:text-lg"
            >
              {active.subtext}
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/login"
                className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-brand-navy transition-all duration-200 hover:bg-white/90 hover:shadow-lg"
              >
                Sign in to your dashboard
              </Link>

              <a
                href="#offices"
                className="text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Slide indicators */}
          <div className="mt-16 flex items-center justify-center gap-2">
            {SLIDES.map((slide, index) => (
              <button
                key={slide.image}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === activeIndex
                    ? "w-8 bg-brand-gold"
                    : "w-1.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}