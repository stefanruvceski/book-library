"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import type { Book, Scene } from "@/lib/types";
import { MAX_SPINE_HEIGHT, packShelves, spineMetrics, withAlpha } from "@/lib/utils";

import { BookSpine } from "./book-spine";
import { PhotographicPass } from "./photographic";

interface PhotoBookcaseProps {
  scene: Scene;
  books: Book[];
  selectedId: string | null;
  onSelect: (book: Book) => void;
}

/** Never shrink the bindings past the point where the stamping stops reading. */
const MIN_SCALE = 0.42;

/**
 * The bookcase, when it is a photograph.
 *
 * The image is the case and the room; the bays measured on it say where the
 * boards are. Books are laid into those bays at whatever scale makes the
 * collection fit, so the same photo works for twelve books or ninety.
 */
export function PhotoBookcase({ scene, books, selectedId, onSelect }: PhotoBookcaseProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(0);

  useLayoutEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => setFrameWidth(entry.contentRect.width));
    observer.observe(element);
    setFrameWidth(element.clientWidth);
    return () => observer.disconnect();
  }, []);

  const frameHeight = frameWidth * (scene.height / scene.width);

  /**
   * One scale for the whole case, so books do not change size between shelves.
   * Fitted against the shortest bay's headroom, then reduced further if the
   * collection is wider than the shelves are long.
   */
  const scale = useMemo(() => {
    if (!frameHeight) return 1;

    const headroom = Math.min(...scene.bays.map((bay) => bay.clearance)) * frameHeight;
    const byHeight = headroom / MAX_SPINE_HEIGHT;

    const shelfLength = scene.bays.reduce((total, bay) => total + (bay.right - bay.left) * frameWidth, 0);
    const naturalLength = books.reduce((total, book) => total + spineMetrics(book).width + 1, 0);
    const byLength = naturalLength > 0 ? shelfLength / naturalLength : 1;

    return Math.max(MIN_SCALE, Math.min(byHeight, byLength, 1));
  }, [books, frameHeight, frameWidth, scene.bays]);

  /** Fill each bay in turn, in the order the bays are listed. */
  const filled = useMemo(() => {
    if (!frameWidth) return scene.bays.map(() => [] as Book[]);

    const remaining = [...books];

    return scene.bays.map((bay, index) => {
      // The last bay takes everything left over rather than dropping books.
      if (index === scene.bays.length - 1) return remaining.splice(0, remaining.length);

      const width = (bay.right - bay.left) * frameWidth;
      const [row = []] = packShelves(remaining, (book) => spineMetrics(book, scale).width, width, 1);
      remaining.splice(0, row.length);
      return row;
    });
  }, [books, frameWidth, scale, scene.bays]);

  const grade = scene.grade;

  return (
    <figure className="m-0">
      <div
        ref={frameRef}
        className="relative w-full overflow-hidden rounded-sm"
        style={{ aspectRatio: `${scene.width} / ${scene.height}`, perspective: 1800 }}
      >
        <Image
          src={scene.image}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />

        {scene.bays.map((bay, index) => {
          const row = filled[index] ?? [];
          const rowWidth = row.reduce((total, book) => total + spineMetrics(book, scale).width + 1, 0);
          const left = bay.left * frameWidth;
          const width = (bay.right - bay.left) * frameWidth;
          const bottom = (1 - bay.baseline) * frameHeight;
          const height = bay.clearance * frameHeight;

          return (
            <div
              key={index}
              className="absolute"
              style={{ left, width, bottom, height, transformStyle: "preserve-3d" }}
            >
              {/*
                Clear the photograph's own books out from behind ours — but only
                behind ours. Blacking out the whole bay throws away the picture;
                feathering the far edge lets the row sit among the books that
                are already on that shelf.
              */}
              {bay.dim && row.length > 0 && (
                <div
                  aria-hidden
                  className="absolute top-0 left-0 -bottom-1"
                  style={{
                    width: Math.min(width, rowWidth + 26 * scale),
                    background:
                      "linear-gradient(180deg, rgba(5,4,3,0.94) 0%, rgba(7,5,4,0.9) 60%, rgba(3,2,1,0.96) 100%)",
                    boxShadow: "inset 0 16px 24px -10px rgba(0,0,0,0.9)",
                    maskImage:
                      "linear-gradient(90deg, #000 0%, #000 calc(100% - 26px), transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(90deg, #000 0%, #000 calc(100% - 26px), transparent 100%)",
                  }}
                />
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-end gap-px">
                {row.map((book, position) => (
                  <BookSpine
                    key={book.id}
                    book={book}
                    onSelect={onSelect}
                    isSelected={selectedId === book.id}
                    scale={scale}
                    lean={
                      position === row.length - 1 && row.length > 1 && width - rowWidth > 34 * scale
                        ? 7
                        : 0
                    }
                  />
                ))}
              </div>

              {/* Where the books meet the board */}
              {row.length > 0 && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-0"
                  style={{
                    width: Math.min(width, rowWidth + 12 * scale),
                    height: Math.max(6, height * 0.07),
                    background: "linear-gradient(to top, rgba(0,0,0,0.72), transparent)",
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Grade the spines into the photograph's light rather than onto it */}
        {grade?.tint && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{ backgroundColor: withAlpha(grade.tint, grade.strength ?? 0.18) }}
          />
        )}
        {/* The drawn spines get the same grain as the photograph they sit in */}
        <PhotographicPass />

        {grade?.shade ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: withAlpha("#050302", grade.shade) }}
          />
        ) : null}
      </div>

      {scene.credit && (
        <figcaption className="mt-3 text-right font-sans text-[0.58rem] tracking-[0.22em] text-dust/25 uppercase">
          {scene.credit}
        </figcaption>
      )}
    </figure>
  );
}
