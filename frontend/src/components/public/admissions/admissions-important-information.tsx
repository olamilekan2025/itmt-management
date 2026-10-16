// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// const informationTopics = [
//   {
//     title: "Application Periods",
//     description: "Information about when applications open and close for each academic session will be published by the institution.",
//   },
//   {
//     title: "Academic Sessions",
//     description: "Details about current and upcoming academic sessions, including start and end dates, are available through the academic calendar.",
//   },
//   {
//     title: "Programme Availability",
//     description: "Not all programmes may be available for admission in every session. Check with the relevant department for availability.",
//   },
//   {
//     title: "Application Instructions",
//     description: "Follow the official application guidelines provided by the institution to ensure your application is complete and properly submitted.",
//   },
// ];

// export default function AdmissionsImportantInformation() {
//   return (
//     <section className="py-16 bg-white">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         <div className="mx-auto max-w-2xl text-center">
//           <h2 className="font-sans text-3xl font-semibold leading-tight text-brand-navy sm:text-4xl">
//             Important admissions information
//           </h2>
//           <p className="mt-4 text-base leading-7 text-slate-600">
//             Key details to keep in mind during the admissions process.
//           </p>
//         </div>

//         <div className="mt-12 grid gap-6 md:grid-cols-2">
//           {informationTopics.map((topic) => (
//             <Card key={topic.title} className="border-slate-200 transition-shadow hover:shadow-md">
//               <CardHeader>
//                 <CardTitle className="text-lg">{topic.title}</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-sm leading-6 text-slate-600">
//                   {topic.description}
//                 </p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         <Card className="mt-8 border-brand-navy/20 bg-brand-light">
//           <CardContent className="p-6">
//             <p className="text-center text-sm leading-6 text-slate-700">
//               <span className="font-semibold text-brand-navy">Note:</span>{" "}
//               Specific dates, fees, deadlines, and policies are determined by
//               the institution and will be communicated through official
//               channels. Please refer to the admissions office or official
//               institutional communications for the most current information.
//             </p>
//           </CardContent>
//         </Card>
//       </div>
//     </section>
//   );
// }


import { CalendarClock, CalendarDays, ClipboardList, GraduationCap, Info } from "lucide-react";

const informationTopics = [
  {
    icon: CalendarClock,
    title: "Application Periods",
    description:
      "Information about when applications open and close for each academic session will be published by the institution.",
  },
  {
    icon: CalendarDays,
    title: "Academic Sessions",
    description:
      "Details about current and upcoming academic sessions, including start and end dates, are available through the academic calendar.",
  },
  {
    icon: GraduationCap,
    title: "Programme Availability",
    description:
      "Not all programmes may be available for admission in every session. Check with the relevant department for availability.",
  },
  {
    icon: ClipboardList,
    title: "Application Instructions",
    description:
      "Follow the official application guidelines provided by the institution to ensure your application is complete and properly submitted.",
  },
];

export default function AdmissionsImportantInformation() {
  return (
    <section className="relative overflow-hidden bg-[#FFFFFF] py-20 sm:py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-brand-gold/[0.08] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-brand-navy sm:text-4xl lg:text-5xl">
            Important admissions information
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Key details to keep in mind during the admissions process.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2 lg:gap-7">
          {informationTopics.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group relative flex flex-col rounded-2xl border border-slate-200/70 border-t-[3px] border-t-brand-gold bg-white p-7 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_14px_32px_-16px_rgba(15,23,42,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-t-brand-navy hover:shadow-[0_26px_48px_-20px_rgba(15,23,42,0.22)] sm:p-8"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy transition-colors duration-300 group-hover:bg-brand-navy group-hover:text-brand-gold">
                <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-xl font-bold tracking-[-0.02em] text-brand-navy">{title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-8 flex max-w-5xl items-start gap-4 rounded-2xl border border-slate-200/80 border-l-[3px] border-l-brand-gold bg-[#FAFAFA] p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-[#8A6D1F]">
            <Info size={18} aria-hidden="true" />
          </span>
          <p className="text-sm leading-7 text-slate-600">
            <span className="font-bold text-brand-navy">Note:</span> Specific
            dates, fees, deadlines, and policies are determined by the
            institution and will be communicated through official channels.
            Please refer to the admissions office or official institutional
            communications for the most current information.
          </p>
        </div>
      </div>
    </section>
  );
}