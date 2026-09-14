"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { Book } from "@/lib/types";
import { bandCount, inkOn, shade, spineMetrics, surname, withAlpha } from "@/lib/utils";

interface BookSpineProps {
  book: Book;
  onSelect: (book: Book) => void;
  /** True while this book is open in the reader — the shelf keeps its gap. */
  isSelected: boolean;
  /** Degrees of lean, for the last book on a shelf that isn't full. */
  lean?: number;
}

/**
 * A book as a binder would have made it: leather over boards, raised bands
 * across the spine dividing it into compartments, gold fillets either side of
 * each band, a contrasting label for the title, and a blind-tooled ornament in
 * the spare compartment.
 */
export function BookSpine({ book, onSelect, isSelected, lean = 0 }: BookSpineProps) {
  const { width, height } = spineMetrics(book);
  const reduceMotion = useReducedMotion();

  const gold = book.accentColor;
  const ink = inkOn(book.spineColor);
  const bands = bandCount(height);
  const label = shade(book.spineColor, -0.34);
  const narrow = width < 52;

  // A binder sizes the type to the panel rather than truncating the title, so
  // long titles are stamped smaller and allowed to run to a second line.
  const titleSize = stampSize(book.title.length, narrow);
  const stampedAuthor = surname(book.author);

  // The shared-layout element must exist in exactly one place at a time, so
  // while the reader is open the shelf leaves a hole the same size as the book.
  if (isSelected) {
    return <div aria-hidden style={{ width, height }} className="shrink-0" />;
  }

  return (
    <motion.button
      type="button"
      layoutId={`book-${book.id}`}
      onClick={() => onSelect(book)}
      aria-label={`Open ${book.title} by ${book.author}`}
      className="group relative shrink-0 cursor-pointer rounded-r-[3px] rounded-l-[2px] outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-room"
      style={{ width, height, transformStyle: "preserve-3d", transformOrigin: "bottom center" }}
      whileHover={reduceMotion ? undefined : { y: -14 }}
      whileFocus={reduceMotion ? undefined : { y: -14 }}
      whileTap={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
    >
      {/* Inner element owns the tilt and the lean so neither fights the shared-layout transform. */}
      <motion.span
        className="absolute inset-0 block overflow-hidden rounded-r-[3px] rounded-l-[2px]"
        style={{
          backgroundColor: book.spineColor,
          transformOrigin: "bottom right",
          rotate: lean,
          boxShadow: `inset 0 0 0 1px ${withAlpha("#000000", 0.45)}`,
        }}
        initial={false}
        whileHover={reduceMotion ? undefined : { rotateY: -26, z: 26 }}
        whileFocus={reduceMotion ? undefined : { rotateY: -26, z: 26 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        {/* Mottled leather: no two panels of a hide take dye the same way. */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(120% 40% at 20% 12%, ${withAlpha("#ffffff", 0.1)}, transparent 70%),
               radial-gradient(90% 30% at 80% 78%, ${withAlpha("#000000", 0.3)}, transparent 70%),
               repeating-linear-gradient(102deg, ${withAlpha("#000000", 0.06)} 0 2px, transparent 2px 5px)`,
          }}
        />

        {/* Cylindrical shading: dark at the hinge, a highlight down the rounded back. */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.06) 18%, rgba(255,255,255,0.16) 42%, rgba(0,0,0,0.06) 70%, rgba(0,0,0,0.54) 100%)",
          }}
        />

        {/* Head and tail caps, darkened where the leather turns over the boards. */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-2"
          style={{ background: `linear-gradient(to bottom, ${withAlpha("#000000", 0.45)}, transparent)` }}
        />
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2.5"
          style={{ background: `linear-gradient(to top, ${withAlpha("#000000", 0.5)}, transparent)` }}
        />

        {/* --- the tooled spine itself --- */}
        {/*
          Compartments are proportional, not fixed: a 240px spine and a 320px
          one both need a readable title, so the title and author flex and only
          the bands and ornaments hold a set height.
        */}
        <span className="absolute inset-x-0 top-2 bottom-2.5 flex flex-col items-stretch px-[3px]">
          <Fillet gold={gold} />

          {bands >= 4 && (
            <>
              <Band gold={gold} />
              <span className="flex h-6 shrink-0 items-center justify-center">
                <Ornament gold={gold} variant={0} />
              </span>
            </>
          )}

          <Band gold={gold} />
          {/* Title label — a panel of darker morocco, gold-stamped */}
          <span
            className="relative flex min-h-0 flex-[6] items-center justify-center overflow-hidden"
            style={{
              backgroundColor: label,
              boxShadow: `inset 0 0 0 1px ${withAlpha(gold, 0.5)}, inset 0 0 12px ${withAlpha("#000000", 0.4)}`,
            }}
          >
            <span
              className="vertical-text max-h-full overflow-hidden px-px py-1 text-center font-display font-semibold tracking-[0.02em]"
              style={{
                color: gold,
                fontSize: titleSize,
                lineHeight: 1.12,
                maxWidth: "100%",
                textShadow: `0 1px 0 ${withAlpha("#000000", 0.7)}`,
              }}
            >
              {book.title}
            </span>
          </span>

          <Band gold={gold} />
          {/* Author compartment */}
          <span className="flex min-h-0 flex-[3] items-center justify-center overflow-hidden">
            <span
              className="vertical-text max-h-full overflow-hidden text-center font-display uppercase"
              style={{
                color: withAlpha(gold, 0.8),
                fontSize: stampedAuthor.length > 6 ? "0.46rem" : "0.56rem",
                letterSpacing: "0.08em",
                lineHeight: 1.15,
              }}
            >
              {stampedAuthor}
            </span>
          </span>

          <Band gold={gold} />
          {/* Tail compartment: a tool, and the extent in the binder's shorthand */}
          <span className="flex h-8 shrink-0 flex-col items-center justify-center gap-1">
            <Ornament gold={gold} variant={1} />
            {book.pages != null && (
              <span
                className="font-sans text-[0.38rem] tracking-[0.08em]"
                style={{ color: withAlpha(gold, 0.55) }}
              >
                {book.pages}
              </span>
            )}
          </span>

          <Fillet gold={gold} />
        </span>

        {/* Fore-edge: the block of pages, gilt at the top and grubby below */}
        <span
          className="pointer-events-none absolute inset-y-[2px] right-0 w-[4px] rounded-r-[3px]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0 1px, transparent 1px 2px),
               linear-gradient(90deg, rgba(0,0,0,0.5), #d9c9a4 45%, #a89267)`,
          }}
        />

        {/* Blind-tooled hairline where the leather meets the board */}
        <span
          className="pointer-events-none absolute inset-y-0 left-[3px] w-px"
          style={{ backgroundColor: withAlpha(ink, 0.12) }}
        />

        {/* Candle bloom on hover */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{
            boxShadow: `0 0 30px ${withAlpha(gold, 0.5)}, inset 0 0 22px ${withAlpha(gold, 0.16)}`,
          }}
        />
      </motion.span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */

/** Type size for a gold-stamped title, chosen so it fits its panel. */
function stampSize(length: number, narrow: boolean): string {
  const scale = narrow ? 0.9 : 1;
  const base = length <= 14 ? 0.88 : length <= 20 ? 0.8 : length <= 28 ? 0.7 : length <= 38 ? 0.62 : 0.55;
  return `${(base * scale).toFixed(2)}rem`;
}

/** A raised band across the spine — the cord the sections are sewn onto. */
function Band({ gold }: { gold: string }) {
  return (
    <span aria-hidden className="relative my-[3px] block h-[7px] shrink-0">
      <span
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.24) 32%, rgba(255,255,255,0.08) 58%, rgba(0,0,0,0.5) 100%)",
        }}
      />
      <span className="absolute inset-x-0 top-[-2px] h-px" style={{ backgroundColor: withAlpha(gold, 0.55) }} />
      <span className="absolute inset-x-0 bottom-[-2px] h-px" style={{ backgroundColor: withAlpha(gold, 0.55) }} />
    </span>
  );
}

/** Double gold rule at the head and tail of the spine. */
function Fillet({ gold }: { gold: string }) {
  return (
    <span aria-hidden className="block shrink-0 py-[3px]">
      <span className="block h-px" style={{ backgroundColor: withAlpha(gold, 0.8) }} />
      <span className="mt-[2px] block h-px" style={{ backgroundColor: withAlpha(gold, 0.4) }} />
    </span>
  );
}

/** Small gold tool struck in the empty compartments. */
function Ornament({ gold, variant }: { gold: string; variant: number }) {
  if (variant === 0) {
    return (
      <span aria-hidden className="flex items-center gap-[3px]">
        <span className="h-[3px] w-[3px] rotate-45" style={{ backgroundColor: withAlpha(gold, 0.75) }} />
        <span className="h-[5px] w-[5px] rotate-45" style={{ backgroundColor: withAlpha(gold, 0.85) }} />
        <span className="h-[3px] w-[3px] rotate-45" style={{ backgroundColor: withAlpha(gold, 0.75) }} />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="h-[9px] w-[9px] rotate-45 rounded-[1px]"
      style={{ boxShadow: `inset 0 0 0 1px ${withAlpha(gold, 0.7)}` }}
    />
  );
}
