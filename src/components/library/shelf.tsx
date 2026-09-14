"use client";

import type { Book } from "@/lib/types";

import { BookSpine } from "./book-spine";

interface ShelfProps {
  books: Book[];
  selectedId: string | null;
  onSelect: (book: Book) => void;
  /** Row index — used only to stagger the ambient underlight a little. */
  index: number;
}

/** One shelf: a row of standing books resting on a lit wooden board. */
export function Shelf({ books, selectedId, onSelect, index }: ShelfProps) {
  return (
    <li className="relative">
      <div className="relative flex items-end gap-[4px] pl-2" style={{ transformStyle: "preserve-3d" }}>
        {books.map((book) => (
          <BookSpine
            key={book.id}
            book={book}
            onSelect={onSelect}
            isSelected={selectedId === book.id}
          />
        ))}

        {/* Contact shadow where the books meet the board */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }}
        />
      </div>

      {/* The board itself */}
      <div aria-hidden className="relative">
        <div
          className="h-[13px] rounded-[2px] shadow-shelf"
          style={{
            background:
              "linear-gradient(to bottom, #3a2b21 0%, #2a1f18 38%, #17100c 39%, #221812 100%)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 22px 34px -16px rgba(0,0,0,0.95)",
          }}
        />
        {/* Light pooling under the board, fading down the wall */}
        <div
          className="h-9 opacity-70"
          style={{
            background: `linear-gradient(to bottom, rgba(217,164,65,${Math.max(0.03, 0.1 - index * 0.012)}), transparent 70%)`,
          }}
        />
      </div>
    </li>
  );
}
