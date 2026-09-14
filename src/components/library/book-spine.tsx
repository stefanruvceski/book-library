"use client";

import { motion, useReducedMotion } from "framer-motion";

import { CLOTH_WEAVE, LEATHER_GRAIN, PAPER_FIBRE } from "@/lib/textures";
import type { Book } from "@/lib/types";
import { legibleStamp, luminance, noiseFrom, shade, spineMetrics, surname, withAlpha } from "@/lib/utils";

/**
 * A book as it actually sits on a shelf.
 *
 * The important thing here is that no two are built the same way. A real shelf
 * is mostly plain cloth with a stamped title; fully tooled leather with raised
 * bands is the minority. Which binding a book got, how rubbed its gold is, how
 * far back it sits and how much it leans all come from its slug, so the shelf
 * is irregular but stable.
 */

type Binding = "plain" | "label" | "gilt" | "banded";

interface BookSpineProps {
  book: Book;
  onSelect: (book: Book) => void;
  /** True while this book is open in the reader — the shelf keeps its gap. */
  isSelected: boolean;
  /** Degrees of lean, for the last book on a shelf that isn't full. */
  lean?: number;
}

export function BookSpine({ book, onSelect, isSelected, lean = 0 }: BookSpineProps) {
  const { width, height } = spineMetrics(book);
  const reduceMotion = useReducedMotion();
  const rand = (salt: string) => noiseFrom(book.slug, salt);

  const binding = pickBinding(rand("binding"));
  const cloth = rand("material") < 0.42;
  /** How far back in the case this one sits — mostly read as extra shadow. */
  const recess = rand("recess") * 0.3;
  /** Gold rubs off with handling, but never so far that the title stops reading. */
  const gilding = 0.74 + rand("gilding") * 0.26;
  /** Even a packed shelf is never perfectly plumb. */
  const microTilt = (rand("tilt") - 0.5) * 1.7;

  const gold = legibleStamp(book.spineColor, book.accentColor);
  const stamped = withAlpha(gold, gilding);

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
      {/* Inner element owns the tilt and lean so neither fights the shared-layout transform. */}
      <motion.span
        className="absolute inset-0 block overflow-hidden rounded-r-[3px] rounded-l-[2px]"
        style={{
          backgroundColor: book.spineColor,
          transformOrigin: "bottom right",
          rotate: lean || microTilt,
          boxShadow: `inset 1px 0 0 ${withAlpha("#000000", 0.55)}, inset -1px 0 0 ${withAlpha(
            "#000000",
            0.55,
          )}, inset 0 0 0 1px ${withAlpha("#000000", 0.35)}`,
        }}
        initial={false}
        whileHover={reduceMotion ? undefined : { rotateY: -24, z: 26 }}
        whileFocus={reduceMotion ? undefined : { rotateY: -24, z: 26 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        {/* Material grain — irregular noise, not a repeating pattern */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: cloth ? CLOTH_WEAVE : LEATHER_GRAIN,
            backgroundSize: cloth ? "56px 56px" : "76px 76px",
            mixBlendMode: "soft-light",
            opacity: cloth ? 0.75 : 0.6,
          }}
        />

        {/* Dye never takes evenly across a hide */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(140% 45% at ${18 + rand("blotch") * 50}% ${
              10 + rand("blotchY") * 70
            }%, ${withAlpha("#ffffff", 0.07)}, transparent 70%),
               radial-gradient(120% 40% at ${70 - rand("blotch2") * 40}% ${
                 30 + rand("blotch2Y") * 60
               }%, ${withAlpha("#000000", 0.26)}, transparent 72%)`,
          }}
        />

        {/* Soft round of the spine. Wide stops — a hard gradient looks like plastic. */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background: cloth
              ? "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 9%, rgba(0,0,0,0.02) 30%, rgba(255,255,255,0.06) 52%, rgba(0,0,0,0.16) 78%, rgba(0,0,0,0.5) 93%, rgba(0,0,0,0.85) 100%)"
              : "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.28) 8%, rgba(255,255,255,0.04) 26%, rgba(255,255,255,0.17) 46%, rgba(0,0,0,0.06) 68%, rgba(0,0,0,0.42) 90%, rgba(0,0,0,0.88) 100%)",
          }}
        />

        {/* The lamp is overhead, so every spine is lit at the top and dark at the foot */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,246,225,0.1) 0%, rgba(255,246,225,0.03) 22%, transparent 45%, rgba(0,0,0,0.3) 82%, rgba(0,0,0,0.52) 100%)",
          }}
        />

        {/* Rubbed head and tail — where fingers hook the book off the shelf */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{
            height: 10 + rand("headwear") * 14,
            background: `linear-gradient(to bottom, ${withAlpha("#000000", 0.42)}, transparent)`,
          }}
        />
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{
            height: 8 + rand("tailwear") * 12,
            background: `linear-gradient(to top, ${withAlpha("#000000", 0.5)}, transparent)`,
          }}
        />

        <SpineFace binding={binding} book={book} gold={gold} stamped={stamped} width={width} rand={rand} />

        {/* The block of pages on the fore-edge, dirtier at the bottom */}
        <span
          className="pointer-events-none absolute inset-y-[2px] right-0 rounded-r-[3px]"
          style={{
            width: 3 + Math.round(rand("edge") * 2),
            backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.26) 0 1px, transparent 1px 2px),
               linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.4)),
               linear-gradient(90deg, rgba(0,0,0,0.6), #b3a281 48%, #7d6d4c)`,
          }}
        />

        {/* Sitting further back in the case just means less light reaches it */}
        {recess > 0.02 && (
          <span
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: withAlpha("#000000", recess) }}
          />
        )}

        {/* Candle bloom on hover */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{ boxShadow: `0 0 30px ${withAlpha(gold, 0.45)}, inset 0 0 22px ${withAlpha(gold, 0.14)}` }}
        />
      </motion.span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ *
 * Bindings
 * ------------------------------------------------------------------ */

/** Plain cloth is the commonest thing on any shelf; full tooling is rare. */
function pickBinding(value: number): Binding {
  if (value < 0.34) return "plain";
  if (value < 0.6) return "label";
  if (value < 0.8) return "gilt";
  return "banded";
}

interface FaceProps {
  binding: Binding;
  book: Book;
  gold: string;
  stamped: string;
  width: number;
  rand: (salt: string) => number;
}

function SpineFace({ binding, book, gold, stamped, width, rand }: FaceProps) {
  const narrow = width < 52;
  const title = <Title book={book} colour={stamped} narrow={narrow} />;


  if (binding === "plain") {
    return (
      <span className="absolute inset-x-0 top-6 bottom-6 flex flex-col items-stretch px-[3px]">
        <span className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">{title}</span>
        {rand("plainAuthor") > 0.45 && <Author book={book} colour={withAlpha(gold, 0.5)} />}
      </span>
    );
  }

  if (binding === "label") {
    const morocco = rand("labelKind") > 0.32;
    const face = morocco ? shade(book.spineColor, -0.52) : "#9a8760";
    const ink = morocco ? withAlpha(legibleStamp(face, gold), 0.92) : "#241c11";

    return (
      <span className="absolute inset-x-0 top-5 bottom-5 flex flex-col items-stretch px-[4px]">
        <span style={{ height: `${10 + rand("labelTop") * 12}%` }} />
        <span
          className="relative flex min-h-0 flex-[4] items-center justify-center overflow-hidden rounded-[1px]"
          style={{
            backgroundColor: face,
            boxShadow: `0 1px 2px ${withAlpha("#000000", 0.55)}, inset 0 0 0 1px ${withAlpha(
              morocco ? gold : "#6d5a34",
              morocco ? 0.42 : 0.3,
            )}`,
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: morocco ? LEATHER_GRAIN : PAPER_FIBRE,
              backgroundSize: "60px 60px",
              mixBlendMode: "soft-light",
              opacity: 0.6,
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.4), transparent 30%, rgba(0,0,0,0.35))" }}
          />
          <Title book={book} colour={ink} narrow={narrow} />
        </span>
        <span className="min-h-0 flex-[7]" />
        {rand("labelAuthor") > 0.4 && <Author book={book} colour={withAlpha(gold, 0.45)} />}
      </span>
    );
  }

  if (binding === "gilt") {
    return (
      <span className="absolute inset-x-0 top-4 bottom-4 flex flex-col items-stretch px-[4px]">
        <RuleGroup colour={stamped} count={2 + Math.round(rand("headRules"))} />
        <span className="flex min-h-0 flex-1 items-center justify-center overflow-hidden py-2">{title}</span>
        <RuleGroup colour={stamped} count={2} />
        <Author book={book} colour={withAlpha(gold, 0.55)} />
        <RuleGroup colour={withAlpha(gold, 0.3)} count={1} />
      </span>
    );
  }

  // banded — the fully tooled one
  const compartments = rand("bands") > 0.5 ? 2 : 1;

  return (
    <span className="absolute inset-x-0 top-3 bottom-3 flex flex-col items-stretch px-[3px]">
      <RuleGroup colour={withAlpha(gold, 0.45)} count={1} />
      <Band gold={stamped} />
      <span
        className="relative flex min-h-0 flex-[6] items-center justify-center overflow-hidden"
        style={{
          backgroundColor: shade(book.spineColor, -0.36),
          boxShadow: `inset 0 0 0 1px ${withAlpha(gold, 0.4)}, inset 0 0 14px ${withAlpha("#000000", 0.45)}`,
        }}
      >
        {title}
      </span>
      <Band gold={stamped} />
      <span className="flex min-h-0 flex-[3] items-center justify-center overflow-hidden">
        <Author book={book} colour={withAlpha(gold, 0.62)} />
      </span>
      {Array.from({ length: compartments }).map((_, index) => (
        <span key={index} className="contents">
          <Band gold={stamped} />
          <span className="flex h-7 shrink-0 items-center justify-center">
            <Ornament gold={withAlpha(gold, 0.6)} />
          </span>
        </span>
      ))}
      <Band gold={stamped} />
      <RuleGroup colour={withAlpha(gold, 0.45)} count={1} />
    </span>
  );
}

/* ------------------------------------------------------------------ */

function Title({ book, colour, narrow }: { book: Book; colour: string; narrow: boolean }) {
  const scale = narrow ? 0.9 : 1;
  const length = book.title.length;
  const base = length <= 14 ? 0.86 : length <= 20 ? 0.78 : length <= 28 ? 0.68 : length <= 38 ? 0.6 : 0.53;

  // Gold catches the light unevenly across the round of the spine. Blind
  // tooling in dark ink does not — giving it a white sheen just erases it.
  const metallic = luminance(colour) > 0.22;

  return (
    <span
      className="vertical-text max-h-full overflow-hidden px-px py-1 text-center font-display font-semibold tracking-[0.02em]"
      style={
        metallic
          ? {
              backgroundImage: `linear-gradient(90deg, transparent 12%, ${withAlpha(
                "#ffffff",
                0.55,
              )} 46%, transparent 76%)`,
              backgroundColor: colour,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              fontSize: `${(base * scale).toFixed(2)}rem`,
              lineHeight: 1.12,
              maxWidth: "100%",
            }
          : {
              color: colour,
              textShadow: "0 1px 0 rgba(255,255,255,0.14)",
              fontSize: `${(base * scale).toFixed(2)}rem`,
              lineHeight: 1.12,
              maxWidth: "100%",
            }
      }
    >
      {book.title}
    </span>
  );
}

function Author({ book, colour }: { book: Book; colour: string }) {
  const stampedAuthor = surname(book.author);

  return (
    <span className="flex shrink-0 items-center justify-center overflow-hidden py-1">
      <span
        className="vertical-text max-h-full overflow-hidden text-center font-display uppercase"
        style={{
          color: colour,
          fontSize: stampedAuthor.length > 6 ? "0.46rem" : "0.54rem",
          letterSpacing: "0.09em",
          lineHeight: 1.15,
        }}
      >
        {stampedAuthor}
      </span>
    </span>
  );
}

/** A raised band across the spine — the cord the sections are sewn onto. */
function Band({ gold }: { gold: string }) {
  return (
    <span aria-hidden className="relative my-[3px] block h-[7px] shrink-0">
      <span
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.2) 34%, rgba(255,255,255,0.05) 60%, rgba(0,0,0,0.46) 100%)",
        }}
      />
      <span className="absolute inset-x-0 top-[-2px] h-px" style={{ backgroundColor: gold }} />
      <span className="absolute inset-x-0 bottom-[-2px] h-px" style={{ backgroundColor: gold }} />
    </span>
  );
}

/** One to three gold rules struck together across the spine. */
function RuleGroup({ colour, count }: { colour: string; count: number }) {
  return (
    <span aria-hidden className="block shrink-0 py-[3px]">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className="block h-px"
          style={{ backgroundColor: colour, marginTop: index ? 2 : 0, opacity: index ? 0.55 : 1 }}
        />
      ))}
    </span>
  );
}

/** A small gold tool struck in an empty compartment. */
function Ornament({ gold }: { gold: string }) {
  return (
    <span aria-hidden className="flex items-center gap-[3px]">
      <span className="h-[3px] w-[3px] rotate-45" style={{ backgroundColor: gold }} />
      <span className="h-[5px] w-[5px] rotate-45" style={{ boxShadow: `inset 0 0 0 1px ${gold}` }} />
      <span className="h-[3px] w-[3px] rotate-45" style={{ backgroundColor: gold }} />
    </span>
  );
}
