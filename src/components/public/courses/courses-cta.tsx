import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CoursesCta() {
  return (
    <section className="border-t border-slate-100 bg-gradient-to-b from-white to-brand-light py-20">
<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
<div className="rounded-3xl bg-gradient-to-r from-brand-navy to-brand-blue px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to explore your academic journey?
          </h2>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            Access the ITMT platform to manage your academic activities and stay
            connected with your institution.
          </p>

<div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-gold px-6 py-3 text-sm font-medium text-brand-navy shadow-sm transition-all hover:bg-white hover:shadow-md"
            >
              Access Your Portal
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              Learn About ITMT
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
