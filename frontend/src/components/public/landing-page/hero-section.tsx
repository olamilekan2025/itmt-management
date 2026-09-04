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

const SLIDE_DURATION = 8000;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HeroSection() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL is not configured.");
      setSlides([]);
      setIsLoading(false);
      return;
    }

    const loadSlides = async () => {
      try {
        const response = await fetch(`${API_URL}/hero-slides`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch hero slides: ${response.status}`
          );
        }

        const data = await response.json();

        setSlides(Array.isArray(data.slides) ? data.slides : []);
      } catch (error) {
        console.error("Failed to load hero slides:", error);
        setSlides([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSlides();
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [slides.length]);

  if (isLoading) {
    return (
      <section
        className="h-[640px] bg-brand-navy md:h-[600px]"
        aria-label="Loading hero"
      />
    );
  }

  if (slides.length === 0) {
    return (
      <section className="flex h-[640px] items-center justify-center bg-brand-navy md:h-[600px]">
        <p className="text-white/60">Welcome to ITMT.</p>
      </section>
    );
  }

  const active = slides[activeIndex];

  return (
    <section className="relative h-[640px] overflow-hidden bg-brand-navy md:h-[600px]">
      {/* Background images */}
      {slides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={index !== activeIndex}
        >
          <Image
            src={slide.imageUrl}
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

          {/* Slide controls */}
          {slides.length > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide._id}
                  type="button"
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={
                    index === activeIndex ? "true" : undefined
                  }
                  onClick={() => setActiveIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === activeIndex
                      ? "w-8 bg-brand-gold"
                      : "w-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

