export default function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-brand-navy">
      {/* Decorative background elements */}
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-white/5 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Get in touch
            </span>
          </div>

          <h1 className="font-sans text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            We&apos;re here to help.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            Have a question about admissions, courses, programmes, or your
            account? Send us a message and our team will be happy to assist
            you.
          </p>
        </div>
      </div>

      {/* Bottom transition */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
    </section>
  );
}