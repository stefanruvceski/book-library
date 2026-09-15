import Image from "next/image";

import type { Book } from "@/lib/types";
import { cn, inkOn, shade, withAlpha } from "@/lib/utils";

/**
 * The front board of a book.
 *
 * With a `cover_image` from Storyblok we show it. Without one — which is the
 * whole demo shelf — we tool a cover the way a binder would: a double gold
 * fillet round the edge, corner fleurons, and the title stamped on a panel of
 * darker morocco.
 */
export function BookCover({ book, className }: { book: Book; className?: string }) {
  if (book.coverImage) {
    return (
      <div className={cn("relative overflow-hidden bg-room", className)}>
        <Image
          src={book.coverImage.url}
          alt={book.coverImage.alt}
          fill
          sizes="(max-width: 768px) 70vw, 340px"
          className="object-cover"
          priority={false}
        />
      </div>
    );
  }

  const gold = book.accentColor;
  const ink = inkOn(book.spineColor);
  const panel = shade(book.spineColor, -0.3);

  return (
    <div
      className={cn("relative flex flex-col items-center justify-between overflow-hidden p-7", className)}
      style={{ backgroundColor: book.spineColor, color: ink }}
    >
      {/* Grained hide */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(115% 70% at 22% 8%, ${withAlpha("#ffffff", 0.13)}, transparent 62%),
             radial-gradient(90% 60% at 88% 96%, ${withAlpha("#000000", 0.36)}, transparent 68%),
             repeating-linear-gradient(58deg, ${withAlpha("#000000", 0.05)} 0 2px, transparent 2px 6px),
             repeating-linear-gradient(148deg, ${withAlpha("#ffffff", 0.022)} 0 2px, transparent 2px 7px)`,
        }}
      />

      {/* Double fillet round the boards */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3.5 border"
        style={{ borderColor: withAlpha(gold, 0.55) }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[1.15rem] border"
        style={{ borderColor: withAlpha(gold, 0.22) }}
      />

      {/* Corner fleurons */}
      {[
        "top-[1.5rem] left-[1.5rem]",
        "top-[1.5rem] right-[1.5rem]",
        "bottom-[1.5rem] left-[1.5rem]",
        "bottom-[1.5rem] right-[1.5rem]",
      ].map((position) => (
        <span
          key={position}
          aria-hidden
          className={cn("pointer-events-none absolute h-2 w-2 rotate-45", position)}
          style={{ boxShadow: `inset 0 0 0 1px ${withAlpha(gold, 0.6)}` }}
        />
      ))}

      <p
        className="relative mt-3 font-sans text-[0.55rem] tracking-[0.4em] uppercase"
        style={{ color: withAlpha(gold, 0.7) }}
      >
        {book.genres[0] ?? "Volume"}
      </p>

      {/* Stamped title panel */}
      <div
        className="relative w-full px-5 py-7 text-center"
        style={{
          backgroundColor: panel,
          boxShadow: `inset 0 0 0 1px ${withAlpha(gold, 0.45)}, inset 0 0 26px ${withAlpha("#000000", 0.5)}`,
        }}
      >
        <h3
          className="font-display text-3xl leading-[1.1] font-semibold tracking-tight text-balance"
          style={{ color: gold, textShadow: `0 1px 0 ${withAlpha("#000000", 0.7)}` }}
        >
          {book.title}
        </h3>
        <div className="mx-auto mt-4 h-px w-12" style={{ backgroundColor: withAlpha(gold, 0.55) }} />
        <p
          className="mt-4 font-sans text-[0.62rem] tracking-[0.28em] uppercase"
          style={{ color: withAlpha(gold, 0.72) }}
        >
          {book.author}
        </p>
      </div>

      <div className="relative mb-3 flex items-center gap-3">
        <span className="h-px w-6" style={{ backgroundColor: withAlpha(gold, 0.35) }} />
        <span
          className="font-sans text-[0.5rem] tracking-[0.32em] uppercase"
          style={{ color: withAlpha(gold, 0.62) }}
        >
          {book.pages ? `${book.pages} pp` : book.status}
        </span>
        <span className="h-px w-6" style={{ backgroundColor: withAlpha(gold, 0.35) }} />
      </div>
    </div>
  );
}
