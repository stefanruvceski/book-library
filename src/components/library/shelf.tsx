"use client";

import type { Book } from "@/lib/types";
import { WOOD_ALONG } from "@/lib/textures";
import { spineMetrics } from "@/lib/utils";

import { BookSpine } from "./book-spine";

interface ShelfProps {
  books: Book[];
  selectedId: string | null;
  onSelect: (book: Book) => void;
  /** Row index — sets the shelf's brass numeral and how much lamplight reaches it. */
  index: number;
  /** Usable width of the shelf, so a half-empty row can let its last book lean. */
  available: number;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/** One shelf: standing books on a stained board, with a brass numeral on the nose. */
export function Shelf({ books, selectedId, onSelect, index, available }: ShelfProps) {
  const used = books.reduce((total, book, i) => total + spineMetrics(book).width + (i ? 4 : 0), 0);
  const slack = available - used;

  // A row with room to spare lets its last volume fall against the gap, the way
  // a real shelf does once you take a book out.
  const leanLast = books.length > 1 && slack > 34;

  return (
    <li className="relative">
      <div className="relative flex items-end gap-[1px] pl-3" style={{ transformStyle: "preserve-3d" }}>
        {books.map((book, i) => (
          <BookSpine
            key={book.id}
            book={book}
            onSelect={onSelect}
            isSelected={selectedId === book.id}
            lean={leanLast && i === books.length - 1 ? 7 : 0}
          />
        ))}

        {/* Empty shelves are not a bug — a case has more shelves than you have books. */}
        {books.length === 0 && <div aria-hidden className="h-32" />}

        {/* Shadow the case throws down onto whatever stands in it */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-16"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.62), transparent)" }}
        />
        {/* Contact shadow where the books meet the board */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-7"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)" }}
        />
      </div>

      {/* The board */}
      <div aria-hidden className="relative">
        <div className="wood-board relative h-[15px] shadow-[0_24px_38px_-16px_rgba(0,0,0,0.95)]">
          <div
            className="grain-layer"
            style={{ backgroundImage: WOOD_ALONG, backgroundSize: "700px 90px", opacity: 0.42 }}
          />
          {/* Bullnose highlight along the front edge */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ backgroundColor: "rgba(255, 219, 160, 0.22)" }}
          />
          {/* Brass numeral plate, screwed to the nose of the board */}
          <div
            className="absolute top-1/2 left-7 flex h-[12px] -translate-y-1/2 items-center rounded-[1px] px-2 font-sans text-[0.46rem] tracking-[0.2em]"
            style={{
              background: "linear-gradient(180deg, #d9b45c, #9a7526 55%, #6d5017)",
              color: "#2a1c07",
              boxShadow: "0 1px 2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,240,200,0.45)",
            }}
          >
            {ROMAN[index] ?? index + 1}
          </div>
        </div>

        {/* Lamplight pooling under the board, dimmer the further down the case you go */}
        <div
          className="h-10"
          style={{
            background: `linear-gradient(to bottom, rgba(201,162,39,${Math.max(0.02, 0.09 - index * 0.018)}), transparent 75%)`,
          }}
        />
      </div>
    </li>
  );
}
