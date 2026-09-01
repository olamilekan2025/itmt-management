import type { LucideIcon } from "lucide-react";

type AdminStatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
};

export default function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
}: AdminStatCardProps) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-brand-dark">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold tracking-tight text-brand-navy dark:text-white">
            {value}
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-light text-brand-navy transition-colors group-hover:bg-brand-navy group-hover:text-white dark:bg-white/10 dark:text-white dark:group-hover:bg-white dark:group-hover:text-brand-navy">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}