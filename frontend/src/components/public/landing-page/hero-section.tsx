
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Slide {
  _id: string;
  imageUrl: string;
  eyebrow: string;
  headline: string;
  subtext: string;
}

const SLIDE_DURATION = 7000;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FALLBACK_SLIDE: Slide = {
  _id: "itmt-default",
  imageUrl: "/itmt-image-hero.jpg",
  eyebrow: "ITMT Academy",
  headline: "Institute of Transport and Management Technology",
  subtext:
    "Excellence in transport, management, technology, and professional education.",
};

export default function HeroSection() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL is not configured.");
      return;
    }

    const controller = new AbortController();

    async function loadSlides() {
      try {
        const response = await fetch(`${API_URL}/api/hero-slides`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch hero slides: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data.slides)) {
          const validSlides = data.slides.filter(
            (slide: Slide) =>
              slide &&
              typeof slide._id === "string" &&
              typeof slide.imageUrl === "string" &&
              typeof slide.headline === "string" &&
              slide.imageUrl.trim().length > 0
          );

          setSlides(validSlides);
          setActiveIndex(0);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to load hero slides:", error);
        }
      }
    }

    void loadSlides();

    return () => controller.abort();
  }, []);

  // Use the local hero immediately while the API loads.
  const displaySlides = slides.length > 0 ? slides : [FALLBACK_SLIDE];
  const active = displaySlides[activeIndex] ?? displaySlides[0];

  useEffect(() => {
    if (displaySlides.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % displaySlides.length);
    }, SLIDE_DURATION);

    return () => window.clearInterval(interval);
  }, [displaySlides.length]);

  return (
    <section
      className="relative isolate min-h-[580px] overflow-hidden bg-[#101d32] sm:min-h-[620px] lg:min-h-[680px]"
      aria-label="ITMT introduction"
    >
      {/* Slide images */}
      {displaySlides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out motion-reduce:transition-none ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <Image
            src={slide.imageUrl}
            alt=""
            fill
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            quality={85}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ))}

      {/* Lighter overlay: protects text readability without hiding photos */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(90deg, rgba(10, 23, 43, 0.78) 0%, rgba(10, 23, 43, 0.58) 48%, rgba(10, 23, 43, 0.30) 100%)",
        }}
      />

      {/* Subtle bottom contrast */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#101d32]/40 via-transparent to-[#101d32]/10"
        aria-hidden="true"
      />

      {/* Hero content */}
      <div className="relative z-10 flex min-h-[580px] items-center justify-center px-5 py-20 sm:min-h-[620px] sm:px-8 lg:min-h-[680px]">
        <div
          className="mx-auto w-full max-w-5xl text-center"
          aria-live="off"
        >
          <p
            key={`eyebrow-${active._id}`}
            className="text-xs font-bold uppercase tracking-[0.24em] text-[#f5c76a] sm:text-sm"
          >
            {active.eyebrow}
          </p>

          <h1
            key={`headline-${active._id}`}
            className="mx-auto mt-5 max-w-4xl text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
          >
            {active.headline}
          </h1>

          <p
            key={`subtext-${active._id}`}
            className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8"
          >
            {active.subtext}
          </p>

          <div className="mt-9 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Link
              href="/auth/login"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#f5c76a] px-7 py-3.5 text-sm font-bold text-[#101d32] shadow-lg transition-colors hover:bg-[#ffda8c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d32]"
            >
              Sign in to your dashboard
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </Link>

            <a
              href="#offices"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/60 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              See how it works
            </a>
          </div>

          {/* Accessible slide controls */}
          {displaySlides.length > 1 && (
            <div
              className="mt-12 flex items-center justify-center gap-3"
              role="group"
              aria-label="Hero slide controls"
            >
              {displaySlides.map((slide, index) => (
                <button
                  key={slide._id}
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${slide.headline}`}
                  aria-pressed={index === activeIndex}
                  onClick={() => setActiveIndex(index)}
                  className={`flex h-11 min-w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c76a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d32]`}
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "w-8 bg-[#f5c76a]"
                        : "w-2 bg-white/60 hover:bg-white"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
