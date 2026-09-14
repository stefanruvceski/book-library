import Image from "next/image";

import type { Book } from "@/lib/types";
import { cn, inkOn, withAlpha } from "@/lib/utils";

/**
 * The front of a book.
 *
 * If Storyblok supplies `cover_image` we show it. If it does not — which is the
 * case for the whole demo shelf — we draw a typographic clothbound cover from the
 * book's own two colors, so every book looks deliberate instead of broken.
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

  const ink = inkOn(book.spineColor);

  return (
    <div
      className={cn("relative flex flex-col justify-between overflow-hidden p-6", className)}
      style={{
        backgroundColor: book.spineColor,
        backgroundImage: `radial-gradient(120% 90% at 20% 0%, ${withAlpha("#ffffff", 0.14)}, transparent 60%),
           radial-gradient(90% 70% at 100% 100%, ${withAlpha(book.accentColor, 0.18)}, transparent 65%)`,
        color: ink,
      }}
    >
      <div
        className="pointer-events-none absolute inset-3 border"
        style={{ borderColor: withAlpha(book.accentColor, 0.45) }}
      />

      <div className="relative">
        <p
          className="font-sans text-[0.6rem] tracking-[0.34em] uppercase opacity-70"
          style={{ color: book.accentColor }}
        >
          {book.genres[0] ?? "Volume"}
        </p>
      </div>

      <div className="relative">
        <h3 className="font-display text-3xl leading-[1.08] font-semibold tracking-tight text-balance">
          {book.title}
        </h3>
        <div className="mt-4 h-px w-14" style={{ backgroundColor: book.accentColor }} />
        <p className="mt-4 font-sans text-[0.7rem] tracking-[0.22em] uppercase opacity-80">{book.author}</p>
      </div>

      <div className="relative flex items-end justify-between">
        <span className="font-display text-xs italic opacity-55">
          {book.pages ? `${book.pages} pages` : " "}
        </span>
        <span
          className="font-sans text-[0.55rem] tracking-[0.3em] uppercase opacity-60"
          style={{ color: book.accentColor }}
        >
          {book.status}
        </span>
      </div>
    </div>
  );
}
