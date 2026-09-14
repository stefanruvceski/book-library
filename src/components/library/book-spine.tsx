"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { Book } from "@/lib/types";
import { inkOn, spineMetrics, withAlpha } from "@/lib/utils";

interface BookSpineProps {
  book: Book;
  onSelect: (book: Book) => void;
  /** True while this book is open in the reader — the shelf keeps its gap. */
  isSelected: boolean;
}

export function BookSpine({ book, onSelect, isSelected }: BookSpineProps) {
  const { width, height } = spineMetrics(book);
  const reduceMotion = useReducedMotion();
  const ink = inkOn(book.spineColor);

  // The shared-layout element must exist in exactly one place at a time, so while
  // the reader is open the shelf leaves a hole the same size as the book.
  if (isSelected) {
    return <div aria-hidden style={{ width, height }} className="shrink-0" />;
  }

  return (
    <motion.button
      type="button"
      layoutId={`book-${book.id}`}
      onClick={() => onSelect(book)}
      aria-label={`Open ${book.title} by ${book.author}`}
      className="group relative shrink-0 cursor-pointer rounded-r-[3px] rounded-l-[2px] outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-room-deep"
      style={{
        width,
        height,
        transformStyle: "preserve-3d",
        transformOrigin: "bottom center",
      }}
      whileHover={reduceMotion ? undefined : { y: -14 }}
      whileFocus={reduceMotion ? undefined : { y: -14 }}
      whileTap={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
    >
      {/* Inner element owns the tilt so it never fights the shared-layout transform. */}
      <motion.span
        className="absolute inset-0 block overflow-hidden rounded-r-[3px] rounded-l-[2px]"
        style={{
          backgroundColor: book.spineColor,
          transformOrigin: "right center",
          boxShadow: `inset 0 0 0 1px ${withAlpha("#000000", 0.35)}`,
        }}
        initial={false}
        whileHover={reduceMotion ? undefined : { rotateY: -26, z: 26 }}
        whileFocus={reduceMotion ? undefined : { rotateY: -26, z: 26 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        {/* Cylindrical shading: dark at the hinge, a highlight down the middle. */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 18%, rgba(255,255,255,0.14) 44%, rgba(0,0,0,0.10) 72%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {/* Foil bands, top and bottom */}
        <span
          className="absolute inset-x-1.5 top-3 h-px"
          style={{ backgroundColor: withAlpha(book.accentColor, 0.85) }}
        />
        <span
          className="absolute inset-x-1.5 top-4.5 h-px"
          style={{ backgroundColor: withAlpha(book.accentColor, 0.35) }}
        />
        <span
          className="absolute inset-x-1.5 bottom-3 h-px"
          style={{ backgroundColor: withAlpha(book.accentColor, 0.85) }}
        />

        {/* Title running down the spine */}
        <span className="absolute inset-x-0 top-8 bottom-8 flex items-center justify-center px-1">
          <span
            className="vertical-text max-h-full overflow-hidden font-display text-[0.72rem] leading-none font-semibold tracking-[0.06em] text-ellipsis whitespace-nowrap"
            style={{ color: ink }}
          >
            {book.title}
          </span>
        </span>

        {/* Author initials at the foot, like a real imprint */}
        <span
          className="absolute inset-x-0 bottom-5 text-center font-sans text-[0.42rem] tracking-[0.12em] uppercase opacity-70"
          style={{ color: ink }}
        >
          {book.author
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 3)}
        </span>

        {/* Page block peeking out on the fore-edge */}
        <span
          className="pointer-events-none absolute inset-y-[2px] right-0 w-[3px] rounded-r-[3px]"
          style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0.4), #d8cdb6 40%, #b8ab90)",
          }}
        />

        {/* Warm bloom that only shows on hover */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{
            boxShadow: `0 0 26px ${withAlpha(book.accentColor, 0.55)}, inset 0 0 18px ${withAlpha(book.accentColor, 0.18)}`,
          }}
        />
      </motion.span>
    </motion.button>
  );
}
