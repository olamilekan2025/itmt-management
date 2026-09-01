import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdmissionsRequirements() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-sans text-3xl font-semibold leading-tight text-brand-navy sm:text-4xl">
            Admission requirements
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Admission requirements may vary depending on the programme, academic
            level, and current institutional policies.
          </p>
        </div>

        <div className="mt-12">
          <Card className="border-slate-200 bg-brand-light/50">
            <CardHeader>
              <CardTitle className="text-xl">General Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-600">
                Specific admission requirements will be published here according to the institution&apos;s configured admission policies. Please
                contact the admissions office or consult your programme
                department for detailed requirements applicable to your intended
                course of study.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
