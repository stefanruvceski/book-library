"use client";

import { ArrowUpDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

export const SORTS = {
  recent: "Recently read",
  rating: "Highest rated",
  title: "Title A–Z",
  author: "Author A–Z",
  longest: "Longest",
} as const;

export type SortKey = keyof typeof SORTS;

interface ToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  genres: string[];
  activeGenre: string | null;
  onGenreChange: (genre: string | null) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  resultCount: number;
}

export function Toolbar({
  query,
  onQueryChange,
  genres,
  activeGenre,
  onGenreChange,
  sort,
  onSortChange,
  resultCount,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="group relative flex-1">
          <span className="sr-only">Search the library</span>
          <Search
            size={15}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-dust/35 transition-colors group-focus-within:text-brass"
          />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search title, author or note…"
            className="w-full rounded-full border border-dust/12 bg-room/60 py-2.5 pr-9 pl-10 font-sans text-sm text-dust placeholder:text-dust/30 focus:border-brass/40 focus:ring-1 focus:ring-brass/30 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-dust/35 transition-colors hover:text-brass"
            >
              <X size={14} />
            </button>
          )}
        </label>

        <label className="relative">
          <span className="sr-only">Sort books</span>
          <ArrowUpDown
            size={14}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-dust/35"
          />
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortKey)}
            className="appearance-none rounded-full border border-dust/12 bg-room/60 py-2.5 pr-8 pl-9 font-sans text-sm text-dust/80 focus:border-brass/40 focus:ring-1 focus:ring-brass/30 focus:outline-none"
          >
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value} className="bg-room text-dust">
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {genres.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <GenrePill active={activeGenre === null} onClick={() => onGenreChange(null)}>
            All
          </GenrePill>
          {genres.map((genre) => (
            <GenrePill
              key={genre}
              active={activeGenre === genre}
              onClick={() => onGenreChange(activeGenre === genre ? null : genre)}
            >
              {genre}
            </GenrePill>
          ))}
          <span className="ml-auto font-sans text-[0.62rem] tracking-[0.24em] text-dust/30 uppercase">
            {resultCount} {resultCount === 1 ? "volume" : "volumes"}
          </span>
        </div>
      )}
    </div>
  );
}

function GenrePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 font-sans text-[0.65rem] tracking-[0.16em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-brass focus-visible:outline-none",
        active
          ? "border-brass/60 bg-brass/12 text-brass"
          : "border-dust/12 text-dust/45 hover:border-dust/30 hover:text-dust/80",
      )}
    >
      {children}
    </button>
  );
}
