import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function DashboardPreview() {
  return (
    <div className="relative w-full max-w-lg">
      {/* Main dashboard card */}
      <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-6 shadow-2xl">
        {/* Dashboard header */}
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-medium text-white/60">Dashboard</p>
            <p className="text-sm font-semibold text-white">ITMT Overview</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/20">
            <Activity className="h-4 w-4 text-brand-gold" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-gold" />
              <p className="text-xs text-white/60">Students</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">2,847</p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-gold" />
              <p className="text-xs text-white/60">Active Courses</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">156</p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-brand-gold" />
              <p className="text-xs text-white/60">Registered</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">1,234</p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-brand-gold" />
              <p className="text-xs text-white/60">Outstanding</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">$45K</p>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-white/60">Recent Results</p>
            <TrendingUp className="h-3 w-3 text-brand-gold" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/80">Computer Science 301</span>
              <span className="text-brand-gold">Published</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/80">Mathematics 201</span>
              <span className="text-brand-gold">Published</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/80">Physics 101</span>
              <span className="text-white/40">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating stat card */}
      <div className="absolute -bottom-4 -left-4 rounded-xl border border-brand-gold/30 bg-brand-navy/90 backdrop-blur-sm p-4 shadow-xl animate-float">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gold/20">
            <TrendingUp className="h-5 w-5 text-brand-gold" />
          </div>
          <div>
            <p className="text-xs text-white/60">Growth</p>
            <p className="text-sm font-semibold text-white">+12.5%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
