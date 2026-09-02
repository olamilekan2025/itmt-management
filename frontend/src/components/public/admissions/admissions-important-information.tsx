import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const informationTopics = [
  {
    title: "Application Periods",
    description: "Information about when applications open and close for each academic session will be published by the institution.",
  },
  {
    title: "Academic Sessions",
    description: "Details about current and upcoming academic sessions, including start and end dates, are available through the academic calendar.",
  },
  {
    title: "Programme Availability",
    description: "Not all programmes may be available for admission in every session. Check with the relevant department for availability.",
  },
  {
    title: "Application Instructions",
    description: "Follow the official application guidelines provided by the institution to ensure your application is complete and properly submitted.",
  },
];

export default function AdmissionsImportantInformation() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-sans text-3xl font-semibold leading-tight text-brand-navy sm:text-4xl">
            Important admissions information
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Key details to keep in mind during the admissions process.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {informationTopics.map((topic) => (
            <Card key={topic.title} className="border-slate-200 transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{topic.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">
                  {topic.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-brand-navy/20 bg-brand-light">
          <CardContent className="p-6">
            <p className="text-center text-sm leading-6 text-slate-700">
              <span className="font-semibold text-brand-navy">Note:</span>{" "}
              Specific dates, fees, deadlines, and policies are determined by
              the institution and will be communicated through official
              channels. Please refer to the admissions office or official
              institutional communications for the most current information.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
