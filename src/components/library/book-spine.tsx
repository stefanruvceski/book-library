"use client";

import { motion, useReducedMotion } from "framer-motion";

import { CLOTH_WEAVE, LEATHER_GRAIN, PAPER_FIBRE, WOOD_UPRIGHT } from "@/lib/textures";
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
  /** Shrinks the whole binding to fit a bay measured on a photograph. */
  scale?: number;
}

export function BookSpine({ book, onSelect, isSelected, lean = 0, scale = 1 }: BookSpineProps) {
  const { width, height } = spineMetrics(book, scale);
  const reduceMotion = useReducedMotion();
  const rand = (salt: string) => noiseFrom(book.slug, salt);

  const binding = pickBinding(rand("binding"));
  const cloth = rand("material") < 0.42;
  /** How far back in the case this one sits — mostly read as extra shadow. */
  const recess = rand("recess") * 0.3;
  /** Gold rubs off with handling, but never so far that the title stops reading. */
  const gilding = 0.74 + rand("gilding") * 0.26;
  /** Even a packed shelf is never perfectly plumb. */
  const microTilt = (rand("tilt") - 0.5) * 2.4;

  /*
   * A book is not a rectangle. The cloth turns over the boards at the head and
   * tail, the corners get bumped, and no two are cut alike — so the silhouette
   * is rounded unevenly rather than with one radius.
   */
  const radius = [
    `${(1 + rand("r1") * 1.8).toFixed(1)}px ${(1.5 + rand("r2") * 2).toFixed(1)}px`,
    `${(1 + rand("r3") * 1.5).toFixed(1)}px ${(1 + rand("r4") * 1.5).toFixed(1)}px /`,
    `${(2 + rand("r5") * 3).toFixed(1)}px ${(2.5 + rand("r6") * 3.5).toFixed(1)}px`,
    `${(1.5 + rand("r7") * 2).toFixed(1)}px ${(1.5 + rand("r8") * 2).toFixed(1)}px`,
  ].join(" ");

  /** Boards are not planed flat and books do not all sit squarely on them. */
  const seating = Math.round(rand("seating") * 3) - 1;
  /** Nobody pushes every book to the same depth. */
  const pushedIn = Math.round(rand("depth") * 4);

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
      className="group relative shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-room"
      style={{
        width,
        height,
        marginBottom: seating,
        borderRadius: radius,
        transformStyle: "preserve-3d",
        transformOrigin: "bottom center",
      }}
      whileHover={reduceMotion ? undefined : { y: -14 }}
      whileFocus={reduceMotion ? undefined : { y: -14 }}
      whileTap={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
    >
      {/* Inner element owns the tilt and lean so neither fights the shared-layout transform. */}
      <motion.span
        className="absolute inset-0 block overflow-hidden"
        style={{
          backgroundColor: book.spineColor,
          borderRadius: radius,
          transformOrigin: "bottom right",
          rotate: lean || microTilt,
          // Casting onto its neighbours is what turns a row of rectangles into
          // books standing against each other.
          boxShadow: `-6px 0 10px -4px ${withAlpha("#000000", 0.95)}, 6px 0 10px -4px ${withAlpha(
            "#000000",
            0.92,
          )}, inset 1px 0 0 ${withAlpha("#000000", 0.5)}, inset -1px 0 0 ${withAlpha(
            "#000000",
            0.5,
          )}`,
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
            backgroundSize: cloth ? "34px 34px" : "46px 46px",
            mixBlendMode: "soft-light",
            opacity: cloth ? 1 : 0.9,
          }}
        />

        {/* Dust, fading and handling all streak vertically down a standing book */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: WOOD_UPRIGHT,
            backgroundSize: `${Math.round(width * 1.6)}px ${Math.round(height * 1.3)}px`,
            mixBlendMode: "multiply",
            opacity: 0.3 + rand("streak") * 0.22,
          }}
        />

        {/* Dye never takes evenly across a hide */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(150% 34% at ${18 + rand("blotch") * 50}% ${
              8 + rand("blotchY") * 40
            }%, ${withAlpha("#ffffff", 0.13)}, transparent 72%),
               radial-gradient(130% 30% at ${70 - rand("blotch2") * 40}% ${
                 30 + rand("blotch2Y") * 55
               }%, ${withAlpha("#000000", 0.34)}, transparent 74%),
               radial-gradient(90% 26% at ${25 + rand("blotch3") * 55}% ${
                 55 + rand("blotch3Y") * 40
               }%, ${withAlpha("#000000", 0.22)}, transparent 70%)`,
          }}
        />

        {/* Soft round of the spine. Wide stops — a hard gradient looks like plastic. */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background: cloth
              ? "linear-gradient(90deg, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.2) 13%, rgba(255,255,255,0.035) 44%, rgba(0,0,0,0.14) 74%, rgba(0,0,0,0.62) 100%)"
              : "linear-gradient(90deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.18) 12%, rgba(255,255,255,0.085) 42%, rgba(255,255,255,0.03) 58%, rgba(0,0,0,0.16) 76%, rgba(0,0,0,0.66) 100%)",
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

        {/* The head of a spine is domed where the cloth turns over the boards */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-5"
          style={{
            background: `radial-gradient(120% 150% at 50% 100%, transparent 58%, ${withAlpha(
              "#000000",
              0.75,
            )} 100%)`,
          }}
        />

        {/* Dust along the top edge — the surest sign a shelf is real */}
        <span
          className="pointer-events-none absolute inset-x-[2px] top-0"
          style={{
            height: 1 + Math.round(rand("dust") * 1.6),
            background: `linear-gradient(90deg, transparent, ${withAlpha(
              "#d8ccb2",
              0.16 + rand("dustAmt") * 0.3,
            )} 28%, ${withAlpha("#d8ccb2", 0.1 + rand("dustAmt") * 0.24)} 72%, transparent)`,
          }}
        />

        {/* Bumped corners: the two places every old book is worn */}
        <span
          className="pointer-events-none absolute top-0 left-0"
          style={{
            width: 7 + rand("bumpA") * 7,
            height: 7 + rand("bumpA") * 9,
            background: `radial-gradient(120% 120% at 0% 0%, ${withAlpha("#c9b795", 0.1)}, transparent 72%)`,
          }}
        />
        <span
          className="pointer-events-none absolute right-0 bottom-0"
          style={{
            width: 6 + rand("bumpB") * 8,
            height: 6 + rand("bumpB") * 8,
            background: `radial-gradient(120% 120% at 100% 100%, ${withAlpha("#c9b795", 0.08)}, transparent 70%)`,
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

        <SpineFace
          binding={binding}
          book={book}
          gold={gold}
          stamped={stamped}
          width={width}
          scale={scale}
          rand={rand}
        />

        {/* The block of pages on the fore-edge, dirtier at the bottom */}
        <span
          className="pointer-events-none absolute inset-y-[2px] right-0 rounded-r-[3px]"
          style={{
            width: 2 + Math.round(rand("edge") * 2),
            right: pushedIn,
            opacity: 0.5 + rand("edgeLit") * 0.35,
            backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0 1px, transparent 1px 2px),
               linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6)),
               linear-gradient(90deg, rgba(0,0,0,0.7), #6f6247 55%, #443b29)`,
          }}
        />

        {/* A book pushed in sits in its neighbours' shadow */}
        {pushedIn > 0 && (
          <span
            className="pointer-events-none absolute inset-y-0 right-0"
            style={{
              width: pushedIn,
              background: `linear-gradient(90deg, transparent, ${withAlpha("#000000", 0.8)})`,
            }}
          />
        )}

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
  scale: number;
  rand: (salt: string) => number;
}

function SpineFace({ binding, book, gold, stamped, width, scale, rand }: FaceProps) {
  const narrow = width < 52 * scale;
  const title = <Title book={book} colour={stamped} narrow={narrow} scale={scale} />;


  if (binding === "plain") {
    return (
      <span className="absolute inset-x-0 top-6 bottom-6 flex flex-col items-stretch px-[3px]">
        <span className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">{title}</span>
        {rand("plainAuthor") > 0.45 && <Author book={book} colour={withAlpha(gold, 0.5)} scale={scale} />}
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
            boxShadow: `0 1px 3px ${withAlpha("#000000", 0.6)}, inset 0 0 0 1px ${withAlpha(
              morocco ? gold : "#6d5a34",
              morocco ? 0.28 : 0.2,
            )}, inset 0 0 8px ${withAlpha("#000000", 0.35)}`,
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
          <Title book={book} colour={ink} narrow={narrow} scale={scale} />
        </span>
        <span className="min-h-0 flex-[7]" />
        {rand("labelAuthor") > 0.4 && <Author book={book} colour={withAlpha(gold, 0.45)} scale={scale} />}
      </span>
    );
  }

  if (binding === "gilt") {
    return (
      <span className="absolute inset-x-0 top-4 bottom-4 flex flex-col items-stretch px-[4px]">
        <RuleGroup colour={stamped} count={2 + Math.round(rand("headRules"))} />
        <span className="flex min-h-0 flex-1 items-center justify-center overflow-hidden py-2">{title}</span>
        <RuleGroup colour={stamped} count={2} />
        <Author book={book} colour={withAlpha(gold, 0.55)} scale={scale} />
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
        <Author book={book} colour={withAlpha(gold, 0.62)} scale={scale} />
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

function Title({ book, colour, narrow, scale }: { book: Book; colour: string; narrow: boolean; scale: number }) {
  const shrink = (narrow ? 0.9 : 1) * scale;
  // A binder strikes type by hand. Perfectly centred, perfectly square
  // lettering is the single most synthetic thing on a drawn spine.
  const skew = (noiseFrom(book.slug, "stampSkew") - 0.5) * 1.1;
  const drift = (noiseFrom(book.slug, "stampDrift") - 0.5) * 5;
  const length = book.title.length;
  const base = length <= 14 ? 0.86 : length <= 20 ? 0.78 : length <= 28 ? 0.68 : length <= 38 ? 0.6 : 0.53;

  // Gold catches the light unevenly across the round of the spine. Blind
  // tooling in dark ink does not — giving it a white sheen just erases it.
  const metallic = luminance(colour) > 0.22;

  return (
    <span
      className="vertical-text max-h-full overflow-hidden px-px py-1 text-center font-display font-semibold tracking-[0.02em]"
      style={{
        rotate: `${skew.toFixed(2)}deg`,
        translate: `0 ${drift.toFixed(1)}px`,
        fontSize: `${(base * shrink).toFixed(2)}rem`,
        lineHeight: 1.12,
        maxWidth: "100%",
        ...(metallic
          ? {
              backgroundImage: `linear-gradient(90deg, transparent 12%, ${withAlpha(
                "#ffffff",
                0.55,
              )} 46%, transparent 76%)`,
              backgroundColor: colour,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }
          : {
              color: colour,
              // Blind tooling is pressed into the cloth, so it is caught by the
              // light on one side and shadowed on the other.
              textShadow: "0 1px 0 rgba(255,255,255,0.16), 0 -1px 0 rgba(0,0,0,0.45)",
            }),
      }}
    >
      {book.title}
    </span>
  );
}

function Author({ book, colour, scale }: { book: Book; colour: string; scale: number }) {
  const stampedAuthor = surname(book.author);

  return (
    <span className="flex shrink-0 items-center justify-center overflow-hidden py-1">
      <span
        className="vertical-text max-h-full overflow-hidden text-center font-display uppercase"
        style={{
          color: colour,
          fontSize: `${((stampedAuthor.length > 6 ? 0.46 : 0.54) * scale).toFixed(2)}rem`,
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
