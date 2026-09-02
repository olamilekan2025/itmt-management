import { Compass, Eye } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function AboutMission() {
  return (
    <section className="bg-brand-light py-20 md:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Mission */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-7 sm:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand-navy">
                <Compass className="h-6 w-6" />
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                Our Mission
              </p>

              <h2 className="mt-3 text-2xl font-semibold text-brand-navy sm:text-3xl">
                Simplify institutional management.
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                To simplify academic and institutional management through
                reliable, accessible, and thoughtfully designed technology.
              </p>
            </CardContent>
          </Card>

          {/* Vision */}
          <Card className="border-brand-navy bg-brand-navy text-white shadow-lg">
            <CardContent className="p-7 sm:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-brand-gold">
                <Eye className="h-6 w-6" />
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                Our Vision
              </p>

              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                A connected digital institution.
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-white/65">
                To create a connected digital environment where students,
                lecturers, administrators, and institutions can work more
                efficiently.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}