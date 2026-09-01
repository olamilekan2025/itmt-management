"use client";

import { FormEvent, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send message.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Unable to send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_25px_70px_-25px_rgba(15,23,42,0.18)] sm:p-12 lg:p-16">
        {/* Decorative glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl"
        />

        <div className="relative mx-auto flex max-w-lg flex-col items-center text-center">
          {/* Success icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-brand-gold/20 blur-xl" />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-brand-gold/20 bg-brand-gold/10">
              <CheckCircle2 className="h-10 w-10 text-brand-gold" />
            </div>
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">
            Message Received
          </p>

          <h2 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
            Thank you for reaching out
          </h2>

          <p className="mt-4 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
            Your message has been successfully submitted to the ITMT team.
            We&apos;ll review your enquiry and get back to you as soon as
            possible.
          </p>

          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setFormData(initialFormData);
            }}
            className="group mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-brand-navy px-7 text-sm font-semibold text-white shadow-lg shadow-brand-navy/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
          >
            Send another message
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_25px_70px_-25px_rgba(15,23,42,0.18)]">
      {/* Top accent */}
      <div className="h-1.5 w-full bg-brand-gold" />

      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-brand-gold/[0.06] blur-3xl"
      />

      <div className="relative p-6 sm:p-8 lg:p-10">
        {/* Heading */}
        <div className="mb-9">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-brand-gold" />

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">
              Contact ITMT
            </p>
          </div>

          <h2 className="mt-4 font-sans text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
            Let&apos;s start a conversation
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            Whether you have a question about admissions, programmes,
            courses, or the ITMT platform, we&apos;re here to help.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-7 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-700"
          >
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
            <span className="leading-6">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name + Email */}
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              id="name"
              label="Full Name"
              required
              icon={<User className="h-4 w-4" />}
            >
              <input
                id="name"
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className={inputClass}
              />
            </FormField>

            <FormField
              id="email"
              label="Email Address"
              required
              icon={<Mail className="h-4 w-4" />}
            >
              <input
                id="email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass}
              />
            </FormField>
          </div>

          {/* Phone + Subject */}
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              id="phone"
              label="Phone Number"
              icon={<Phone className="h-4 w-4" />}
            >
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 800 000 0000"
                className={inputClass}
              />
            </FormField>

            <FormField
              id="subject"
              label="Subject"
              required
              icon={<MessageSquare className="h-4 w-4" />}
            >
              <input
                id="subject"
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="What can we help you with?"
                className={inputClass}
              />
            </FormField>
          </div>

          {/* Message */}
          <FormField
            id="message"
            label="Your Message"
            required
            icon={<MessageSquare className="h-4 w-4" />}
          >
            <textarea
              id="message"
              name="message"
              required
              rows={7}
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us how we can help you..."
              className={`${inputClass} min-h-[180px] resize-none py-3.5`}
            />
          </FormField>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light">
                  <Mail className="h-4 w-4 text-brand-navy" />
                </div>

                <div>
                  <p className="text-sm font-medium text-brand-navy">
                    We&apos;re here to help
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-slate-400">
                    Our team typically responds within one business day.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-navy px-7 text-sm font-semibold text-white shadow-lg shadow-brand-navy/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable field component                                                   */
/* -------------------------------------------------------------------------- */

function FormField({
  id,
  label,
  required,
  icon,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-slate-700"
      >
        <span className="text-slate-400">{icon}</span>

        {label}

        {required && <span className="text-brand-gold">*</span>}
      </label>

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared input styling                                                       */
/* -------------------------------------------------------------------------- */

const inputClass =
  "h-13 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-slate-50 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/[0.06]";