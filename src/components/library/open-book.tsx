"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, Star, X } from "lucide-react";

import { RichText } from "@/components/rich-text";
import { useMediaQuery } from "@/lib/use-media-query";
import type { Book } from "@/lib/types";
import { cn, formatReadDate, withAlpha } from "@/lib/utils";

import { BookCover } from "./book-cover";
import { RatingStars } from "./rating-stars";

/** Page geometry. Two of these side by side make the open spread. */
const PAGE = { width: 340, height: 480 };
const PAGE_SM = { width: 300, height: 424 };
/** Time the book spends flying in from the shelf before the cover swings open. */
const FLIGHT_MS = 460;
const CLOSE_MS = 340;

interface OpenBookProps {
  book: Book;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  position: { index: number; total: number };
}

export function OpenBook({ book, onClose, onPrev, onNext, position }: OpenBookProps) {
  const reduceMotion = useReducedMotion();
  const isWide = useMediaQuery("(min-width: 900px)");
  const page = isWide ? PAGE : PAGE_SM;
  const gutter = 2;
  const spreadWidth = isWide ? page.width * 2 + gutter : page.width;

  const [flightComplete, setFlightComplete] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // With motion reduced there is no flight to wait for — the book is simply open.
  const opened = (flightComplete || Boolean(reduceMotion)) && !closing;

  // Fly in from the shelf first, then let the cover swing open.
  useEffect(() => {
    if (reduceMotion) return;
    const timer = setTimeout(() => setFlightComplete(true), FLIGHT_MS);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  /**
   * Close the cover first, then unmount. The unmount has to be the moment the
   * shelf spine comes back, otherwise two elements share one `layoutId` and the
   * flight home never happens.
   */
  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(onClose, reduceMotion ? 0 : CLOSE_MS);
  }, [closing, onClose, reduceMotion]);

  useEffect(() => () => void (closeTimer.current && clearTimeout(closeTimer.current)), []);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // Lock the room behind the reader while it is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
      }
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNext, onPrev, requestClose]);

  const readDate = formatReadDate(book.dateRead);
  /** Distance from the centred (closed) cover to the left page. */
  const coverSlide = (spreadWidth - page.width) / 2;
  /**
   * Wide screens swing the cover left off its spine; narrow ones have no room
   * for that, so the cover flips up over the top edge instead. Either way the
   * swung cover projects past the spread, so the assembly is nudged the other
   * way to stay optically centred.
   */
  const spreadShift = opened && isWide ? page.width * 0.464 : 0;
  const spreadLift = opened && !isWide ? page.height * 0.4 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10 sm:px-8">
      <motion.button
        type="button"
        aria-label="Close and return to the shelf"
        onClick={requestClose}
        className="absolute inset-0 cursor-zoom-out bg-room-deep/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${book.title} by ${book.author}`}
        tabIndex={-1}
        className="relative outline-none"
        style={{ perspective: 2400 }}
      >
        {/* Warm reading light thrown by the open book */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-24 -z-10 rounded-full blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: opened ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          style={{
            background: `radial-gradient(closest-side, ${withAlpha(book.accentColor, 0.22)}, transparent 72%)`,
          }}
        />

        <motion.div
          className="relative"
          style={{ width: spreadWidth, height: page.height, transformStyle: "preserve-3d" }}
          animate={{ x: spreadShift, y: spreadLift }}
          transition={{ type: "spring", stiffness: 70, damping: 18 }}
        >
          {/* ---------------- Left leaf: the title page ---------------- */}
          {isWide && (
            <PageSheet
              side="left"
              page={page}
              visible={opened}
              className="flex flex-col justify-between p-9"
            >
              <div>
                <p
                  className="font-sans text-[0.6rem] tracking-[0.34em] text-ink/45 uppercase"
                  style={{ color: withAlpha(book.accentColor, 0.9) }}
                >
                  {book.status}
                </p>
                <h2 className="mt-6 font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-ink">
                  {book.title}
                </h2>
                <p className="mt-4 font-display text-lg italic text-ink/70">{book.author}</p>
                <div className="mt-6 flex items-center gap-2">
                  <span className="h-px w-10" style={{ backgroundColor: withAlpha(book.accentColor, 0.7) }} />
                  <span
                    className="h-1.5 w-1.5 rotate-45"
                    style={{ backgroundColor: withAlpha(book.accentColor, 0.8) }}
                  />
                  <span className="h-px w-10" style={{ backgroundColor: withAlpha(book.accentColor, 0.7) }} />
                </div>
              </div>

              <dl className="space-y-3 text-sm text-ink/75">
                <Fact icon={<Star size={13} />} label="Rating">
                  <RatingStars rating={book.rating} onPaper size={13} />
                </Fact>
                {book.pages != null && (
                  <Fact icon={<BookOpen size={13} />} label="Length">
                    {book.pages} pages
                  </Fact>
                )}
                {readDate && (
                  <Fact icon={<CalendarDays size={13} />} label="Finished">
                    {readDate}
                  </Fact>
                )}
              </dl>

              {book.genres.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {book.genres.map((genre) => (
                    <li
                      key={genre}
                      className="rounded-full border border-ink/20 px-2.5 py-1 font-sans text-[0.62rem] tracking-[0.12em] text-ink/70 uppercase"
                    >
                      {genre}
                    </li>
                  ))}
                </ul>
              )}
            </PageSheet>
          )}

          {/* ---------------- Right leaf: the notes ---------------- */}
          <PageSheet
            side={isWide ? "right" : "single"}
            page={page}
            visible={opened}
            delay={0.1}
            className="flex flex-col"
          >
            {!isWide && (
              <header className="border-b border-ink/12 px-6 pt-6 pb-4">
                <h2 className="font-display text-2xl leading-tight font-semibold text-ink">{book.title}</h2>
                <p className="mt-1 font-display text-sm italic text-ink/70">{book.author}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] text-ink/60">
                  <RatingStars rating={book.rating} onPaper size={12} />
                  {book.pages != null && <span>{book.pages} pages</span>}
                  {readDate && <span>{readDate}</span>}
                </div>
              </header>
            )}

            <div className="px-7 pt-7 pb-2">
              <p className="font-sans text-[0.58rem] tracking-[0.34em] text-ink/40 uppercase">Notes</p>
            </div>

            <div className="relative min-h-0 flex-1">
              <div className="page-scroll h-full overflow-y-auto px-7 pb-10 font-display text-[0.95rem] leading-[1.75] text-ink/90">
                {book.summary ? (
                  <RichText document={book.summary} />
                ) : (
                  <p className="italic text-ink/50">No notes yet — this one is still settling.</p>
                )}
              </div>
              {/* Soft edge so a long note visibly runs past the bottom of the page. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
                style={{ background: "linear-gradient(to top, var(--color-parchment), transparent)" }}
              />
            </div>
          </PageSheet>

          {/* ---------------- The cover, flown in from the shelf ---------------- */}
          <motion.div
            layoutId={`book-${book.id}`}
            className="absolute top-0 rounded-r-[4px] rounded-l-[2px]"
            style={{
              left: coverSlide,
              width: page.width,
              height: page.height,
              transformStyle: "preserve-3d",
              zIndex: 10,
            }}
            transition={{ type: "spring", stiffness: 190, damping: 26 }}
          >
            {/* Slides the cover from the middle of the spread onto the left page. */}
            <motion.div
              className="relative h-full w-full preserve-3d"
              animate={{ x: opened && isWide ? -coverSlide : 0 }}
              transition={{ type: "spring", stiffness: 70, damping: 18 }}
            >
            <motion.div
              className="relative h-full w-full preserve-3d"
              style={{ transformOrigin: isWide ? "left center" : "center top" }}
              initial={{ rotateX: 0, rotateY: 0 }}
              animate={
                isWide
                  ? { rotateY: opened ? -158 : 0, rotateX: 0 }
                  : { rotateX: opened ? -150 : 0, rotateY: 0 }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 60, damping: 16, restDelta: 0.4 }
              }
            >
              {/* Front */}
              <div
                className="backface-hidden absolute inset-0 overflow-hidden rounded-r-[4px] rounded-l-[2px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.95)]"
                style={{ backgroundColor: book.spineColor }}
              >
                <BookCover book={book} className="h-full w-full" />
                {/* Hinge shading along the spine edge */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-6"
                  style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.55), transparent)" }}
                />
              </div>

              {/* Back of the cover — the bookplate */}
              <div
                className="backface-hidden paper-grain absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-l-[4px] rounded-r-[2px] bg-parchment-shade px-8 text-center"
                style={{ transform: isWide ? "rotateY(180deg)" : "rotateX(180deg)" }}
              >
                <p className="font-sans text-[0.55rem] tracking-[0.4em] text-ink/45 uppercase">Ex Libris</p>
                <div className="h-px w-10" style={{ backgroundColor: withAlpha(book.accentColor, 0.6) }} />
                <p className="font-display text-xl italic text-ink/70">{book.author}</p>
                <p className="max-w-[16rem] font-sans text-[0.6rem] leading-relaxed tracking-[0.12em] text-ink/40 uppercase">
                  {book.genres.join(" · ")}
                </p>
              </div>
            </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

      </div>

      {/* ---------------- Controls, pinned to the viewport ---------------- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ delay: closing ? 0 : 0.25 }}
        className="pointer-events-none absolute inset-0"
      >
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close book"
          className="pointer-events-auto absolute top-5 right-5 flex items-center gap-1.5 rounded-full border border-dust/15 bg-room/70 px-3.5 py-1.5 font-sans text-[0.65rem] tracking-[0.18em] text-dust/70 uppercase backdrop-blur transition-colors hover:border-brass/50 hover:text-brass focus-visible:ring-2 focus-visible:ring-brass focus-visible:outline-none sm:top-8 sm:right-8"
        >
          <X size={13} /> Close
        </button>

        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 font-sans text-[0.62rem] tracking-[0.28em] text-dust/35 uppercase sm:bottom-8">
          {position.index + 1} / {position.total}
        </span>

        <NavButton side="left" onClick={onPrev} disabled={position.total < 2} />
        <NavButton side="right" onClick={onNext} disabled={position.total < 2} />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PageSheet({
  side,
  page,
  visible,
  delay = 0,
  className,
  children,
}: {
  side: "left" | "right" | "single";
  page: { width: number; height: number };
  visible: boolean;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const gutterShade =
    side === "left"
      ? "linear-gradient(to left, rgba(60,45,28,0.20), transparent 12%)"
      : side === "right"
        ? "linear-gradient(to right, rgba(60,45,28,0.20), transparent 12%)"
        : "none";

  return (
    <motion.div
      className={cn(
        "paper-grain absolute top-0 overflow-hidden bg-parchment text-ink shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)]",
        side === "left" && "left-0 rounded-l-[3px]",
        side === "right" && "right-0 rounded-r-[3px]",
        side === "single" && "left-0 rounded-[3px]",
        className,
      )}
      style={{ width: page.width, height: page.height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: visible ? 0.45 : 0.16, delay: visible ? delay : 0 }}
    >
      {children}
      {/* Foxing: old paper darkens and spots toward its edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 85% at 50% 45%, transparent 55%, rgba(120,92,50,0.16) 88%, rgba(96,72,38,0.28) 100%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: gutterShade }} />
    </motion.div>
  );
}

function Fact({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-ink/40">{icon}</span>
      <dt className="w-20 font-sans text-[0.58rem] tracking-[0.2em] text-ink/45 uppercase">{label}</dt>
      <dd className="flex items-center font-display">{children}</dd>
    </div>
  );
}

function NavButton({
  side,
  onClick,
  disabled,
}: {
  side: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous book" : "Next book"}
      className={cn(
        "pointer-events-auto absolute top-1/2 hidden -translate-y-1/2 rounded-full border border-dust/12 bg-room/60 p-2.5 text-dust/50 backdrop-blur transition-colors hover:border-brass/50 hover:text-brass focus-visible:ring-2 focus-visible:ring-brass focus-visible:outline-none disabled:pointer-events-none disabled:opacity-25 sm:block",
        side === "left" ? "left-4 sm:left-8" : "right-4 sm:right-8",
      )}
    >
      <Icon size={18} />
    </button>
  );
}
