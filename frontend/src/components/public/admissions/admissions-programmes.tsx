"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { publicApiGet } from "@/lib/api";

interface Programme {
  _id: string;
  name: string;
  code: string;
  award?: string;
  durationYears?: number;
  description?: string;
  department: {
    name: string;
    code: string;
  };
}

export default function AdmissionsProgrammes() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProgrammes() {
      try {
        const data = await publicApiGet<{ success: boolean; programmes: Programme[] }>("/api/programmes/public");
        if (data.success) {
          setProgrammes(data.programmes);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProgrammes();
  }, []);

  return (
    <section className="py-16 bg-brand-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-sans text-3xl font-semibold leading-tight text-brand-navy sm:text-4xl">
            Explore academic opportunities
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Explore the academic programmes available through the institution&apos;s
            current academic structure.
          </p>
        </div>

        <div className="mt-12">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : error ? (
            <Card className="border-slate-200 bg-white">
              <CardContent className="py-12 text-center">
                <p className="text-sm text-slate-600">
                  Unable to load programme information at this time.
                </p>
              </CardContent>
            </Card>
          ) : programmes.length === 0 ? (
            <Card className="border-slate-200 bg-white">
              <CardContent className="py-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-4 text-sm text-slate-600">
                  Programme information will appear here as the institution&apos;s academic offerings are configured.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {programmes.slice(0, 6).map((programme) => (
                <Card key={programme._id} className="border-slate-200 bg-white transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{programme.name}</CardTitle>
                        <p className="mt-1 text-xs font-medium text-brand-gold">
                          {programme.code}
                        </p>
                      </div>
                      {programme.award && (
                        <span className="inline-flex rounded-full bg-brand-light px-2.5 py-1 text-xs font-medium text-brand-navy">
                          {programme.award}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-500">
                      {programme.department.name}
                    </p>
                    {programme.durationYears && (
                      <p className="mt-2 text-xs text-slate-600">
                        {programme.durationYears} year{programme.durationYears > 1 ? "s" : ""}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-lg border border-brand-navy/15 bg-white px-6 py-3 text-sm font-medium text-brand-navy transition-colors hover:bg-slate-50"
          >
            Explore Courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
