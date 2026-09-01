import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <Card
      className="
        group relative overflow-hidden
        border-slate-200/80 bg-white
        shadow-none
        transition-all duration-300
        hover:-translate-y-1
        hover:border-brand-navy/20
        hover:shadow-xl hover:shadow-brand-navy/5
      "
    >
      {/* Hover accent */}
      <div
        className="
          absolute inset-x-0 top-0 h-0.5
          origin-left scale-x-0
          bg-brand-gold
          transition-transform duration-300
          group-hover:scale-x-100
        "
      />

      <CardHeader className="pb-3">
        {/* Icon */}
        <div
          className="
            flex h-12 w-12 items-center justify-center
            rounded-xl border border-brand-navy/10
            bg-brand-light
            transition-all duration-300
            group-hover:border-brand-navy
            group-hover:bg-brand-navy
          "
        >
          <Icon
            className="
              h-5 w-5 text-brand-navy
              transition-colors duration-300
              group-hover:text-brand-gold
            "
          />
        </div>

        <CardTitle
          className="
            pt-3 text-lg font-semibold
            text-brand-navy
          "
        >
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm leading-6 text-slate-600">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}