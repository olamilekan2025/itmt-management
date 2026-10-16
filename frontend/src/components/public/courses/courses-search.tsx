// "use client";

// import { Search, X } from "lucide-react";
// import { useState } from "react";

// interface CoursesSearchProps {
//   onSearchChange: (search: string) => void;
//   search: string;
// }

// export default function CoursesSearch({
//   onSearchChange,
//   search,
// }: CoursesSearchProps) {
//   const [localSearch, setLocalSearch] = useState(search);

//   const handleClear = () => {
//     setLocalSearch("");
//     onSearchChange("");
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSearchChange(localSearch);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="w-full">
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
//         <input
//           type="text"
//           value={localSearch}
//           onChange={(e) => setLocalSearch(e.target.value)}
//           placeholder="Search courses..."
//           aria-label="Search courses"
//           className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none placeholder:text-slate-400 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
//         />
//         {localSearch && (
//           <button
//             type="button"
//             onClick={handleClear}
//             aria-label="Clear search"
//             className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         )}
//       </div>
//     </form>
//   );
// }


"use client";

import { FormEvent, useEffect, useState } from "react";
import { Search, X } from "lucide-react";

interface CoursesSearchProps {
  onSearchChange: (search: string) => void;
  search: string;
}

export default function CoursesSearch({
  onSearchChange,
  search,
}: CoursesSearchProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Keep the box in step when the parent clears the search ("Clear" button).
  useEffect(() => {
    if (search === "") setLocalSearch("");
  }, [search]);

  // Search as the user types, without firing on every keystroke.
  useEffect(() => {
    const trimmed = localSearch.trim();
    if (trimmed === search) return;

    const timer = setTimeout(() => onSearchChange(trimmed), 350);
    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  const handleClear = () => {
    setLocalSearch("");
    onSearchChange("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearchChange(localSearch.trim());
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="w-full">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          placeholder="Search by course title or code"
          aria-label="Search courses"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm font-medium text-brand-navy outline-none transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/15"
        />

        {localSearch && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  );
}