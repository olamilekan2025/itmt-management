import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutCta() {
  return (
    <section className="border-t border-slate-100 bg-gradient-to-b from-white to-brand-light py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-navy to-brand-blue px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to experience a more connected institution?
          </h2>

          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            Explore the ITMT platform or take the next step toward becoming
            part of a more connected academic community.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#features"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-brand-gold px-6 text-sm font-semibold text-brand-navy transition-all hover:-translate-y-0.5 hover:bg-brand-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
            >
              Explore the Platform
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              href="/auth/login"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-6 text-sm font-medium text-white transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}