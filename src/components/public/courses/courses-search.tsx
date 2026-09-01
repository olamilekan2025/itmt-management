"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

interface CoursesSearchProps {
  onSearchChange: (search: string) => void;
  search: string;
}

export default function CoursesSearch({
  onSearchChange,
  search,
}: CoursesSearchProps) {
  const [localSearch, setLocalSearch] = useState(search);

  const handleClear = () => {
    setLocalSearch("");
    onSearchChange("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search courses..."
          aria-label="Search courses"
          className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none placeholder:text-slate-400 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
        />
        {localSearch && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
