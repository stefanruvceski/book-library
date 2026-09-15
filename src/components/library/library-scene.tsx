"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { Library } from "lucide-react";

import type { Book, RichTextNode, Scene } from "@/lib/types";
import { packShelves, spineMetrics } from "@/lib/utils";

import { AmbientRoom } from "./ambient-room";
import { Bookcase } from "./bookcase";
import { PhotoBookcase } from "./photo-bookcase";
import { OpenBook } from "./open-book";
import { Shelf } from "./shelf";
import { SORTS, Toolbar, type SortKey } from "./toolbar";

/** Empty shelves below the collection are what make the case read as furniture. */
const MIN_SHELVES = 2;

interface LibrarySceneProps {
  books: Book[];
  /** Where the data came from — surfaced as a small badge in the footer. */
  source: "storyblok" | "demo";
  /**
   * A photographic backplate, when the user has supplied one. With a scene the
   * case and the room are the photograph; without one they are drawn in CSS.
   */
  scene: Scene | null;
}

/**
 * The room behind a photographic scene: the same image, thrown far out of
 * focus and dimmed, so the page sits inside the photograph rather than on a
 * flat colour that does not match it.
 */
function PhotoRoom({ image }: { image: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -inset-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})`, filter: "blur(48px) brightness(0.3) saturate(0.85)" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(115% 78% at 50% 28%, transparent 25%, rgba(4,3,2,0.9) 100%)" }}
      />
    </div>
  );
}

/** Flattens rich text so notes are searchable alongside title and author. */
function plainText(value: Book["summary"]): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  const walk = (nodes: RichTextNode[] | undefined): string =>
    (nodes ?? []).map((node) => `${node.text ?? ""} ${walk(node.content)}`).join(" ");

  return walk(value.content);
}

export function LibraryScene({ books, source, scene }: LibrarySceneProps) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("recent");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shelfWidth, setShelfWidth] = useState(0);

  const shelfRef = useRef<HTMLDivElement>(null);

  // Shelves are packed against the measured width, so rows reflow on resize.
  useLayoutEffect(() => {
    const element = shelfRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setShelfWidth(entry.contentRect.width);
    });
    observer.observe(element);
    setShelfWidth(element.clientWidth);

    return () => observer.disconnect();
  }, []);

  const searchIndex = useMemo(
    () =>
      new Map(
        books.map((book) => [
          book.id,
          `${book.title} ${book.author} ${book.genres.join(" ")} ${plainText(book.summary)}`.toLowerCase(),
        ]),
      ),
    [books],
  );

  const genres = useMemo(
    () => [...new Set(books.flatMap((book) => book.genres))].sort((a, b) => a.localeCompare(b)),
    [books],
  );

  const visibleBooks = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = books.filter((book) => {
      if (genre && !book.genres.includes(genre)) return false;
      if (!needle) return true;
      return (searchIndex.get(book.id) ?? "").includes(needle);
    });

    const sorters: Record<SortKey, (a: Book, b: Book) => number> = {
      recent: (a, b) => (b.dateRead ?? "").localeCompare(a.dateRead ?? ""),
      rating: (a, b) => b.rating - a.rating || a.title.localeCompare(b.title),
      title: (a, b) => a.title.localeCompare(b.title),
      author: (a, b) => a.author.localeCompare(b.author) || a.title.localeCompare(b.title),
      longest: (a, b) => (b.pages ?? 0) - (a.pages ?? 0),
    };

    return [...filtered].sort(sorters[sort]);
  }, [books, genre, query, searchIndex, sort]);

  /** Usable width inside the case, after the stiles and the shelf's own padding. */
  const shelfInner = shelfWidth - 20;

  const shelves = useMemo(() => {
    const packed = packShelves(visibleBooks, (book) => spineMetrics(book).width, shelfInner);
    // A case has as many shelves as it has, whether or not you have books for
    // them. Padding to a minimum keeps it furniture rather than a single plank.
    while (packed.length < MIN_SHELVES) packed.push([]);
    return packed;
  }, [visibleBooks, shelfInner]);

  const selectedIndex = visibleBooks.findIndex((book) => book.id === selectedId);
  const selected = selectedIndex >= 0 ? visibleBooks[selectedIndex] : null;

  /* --- Deep links: /?book=slug, kept in sync without a server round-trip --- */

  const openBook = useCallback((book: Book) => {
    setSelectedId(book.id);
    const url = new URL(window.location.href);
    url.searchParams.set("book", book.slug);
    window.history.pushState({ book: book.slug }, "", url);
  }, []);

  const closeBook = useCallback(() => {
    setSelectedId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("book");
    window.history.pushState({}, "", url);
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      const slug = new URLSearchParams(window.location.search).get("book");
      const match = slug ? books.find((book) => book.slug === slug) : null;
      setSelectedId(match?.id ?? null);
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [books]);

  const step = useCallback(
    (delta: number) => {
      if (visibleBooks.length < 2 || selectedIndex < 0) return;
      const next = visibleBooks[(selectedIndex + delta + visibleBooks.length) % visibleBooks.length];
      openBook(next);
    },
    [openBook, selectedIndex, visibleBooks],
  );

  const stats = useMemo(() => {
    const read = books.filter((book) => book.status === "Read");
    const pages = read.reduce((total, book) => total + (book.pages ?? 0), 0);
    const rated = read.filter((book) => book.rating > 0);
    const average = rated.length
      ? rated.reduce((total, book) => total + book.rating, 0) / rated.length
      : 0;
    return { count: read.length, pages, average };
  }, [books]);

  return (
    <LayoutGroup>
      {scene ? <PhotoRoom image={scene.image} /> : <AmbientRoom />}

      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pt-16 pb-24 sm:px-8">
        <header className="mb-12">
          <p className="flex items-center gap-2 font-sans text-[0.62rem] tracking-[0.42em] text-brass/70 uppercase">
            <Library size={13} /> The Dark Library
          </p>
          <h1 className="mt-5 max-w-2xl font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-dust sm:text-6xl">
            Everything I&rsquo;ve read, standing on a shelf.
          </h1>
          <p className="mt-5 max-w-xl font-display text-base leading-relaxed text-dust/50 italic">
            Pull a book down and it opens to my notes. {stats.count} finished,{" "}
            {stats.pages.toLocaleString("en-GB")} pages read, averaging {stats.average.toFixed(1)} out of five.
          </p>
        </header>

        <div className="mb-14">
          <Toolbar
            query={query}
            onQueryChange={setQuery}
            genres={genres}
            activeGenre={genre}
            onGenreChange={setGenre}
            sort={sort}
            onSortChange={setSort}
            resultCount={visibleBooks.length}
          />
        </div>

        {/* The bookcase — a photograph if one was supplied, otherwise drawn */}
        {scene ? (
          visibleBooks.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-28 text-center font-display text-lg text-dust/35 italic"
            >
              Nothing on the shelf matches that. Try a different search.
            </motion.p>
          ) : (
            <PhotoBookcase
              scene={scene}
              books={visibleBooks}
              selectedId={selectedId}
              onSelect={openBook}
            />
          )
        ) : (
        <Bookcase>
          <div ref={shelfRef} className="relative" style={{ perspective: 1800 }}>
            {visibleBooks.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-28 text-center font-display text-lg text-dust/35 italic"
              >
                Nothing on the shelf matches that. Try a different search.
              </motion.p>
            ) : (
              <ul className="flex flex-col" style={{ transformStyle: "preserve-3d" }}>
                {shelves.map((shelfBooks, index) => (
                  <Shelf
                    key={`shelf-${index}`}
                    index={index}
                    books={shelfBooks}
                    selectedId={selectedId}
                    onSelect={openBook}
                    available={shelfInner}
                  />
                ))}
              </ul>
            )}
          </div>
        </Bookcase>
        )}

        <footer className="mt-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-dust/8 pt-6 font-sans text-[0.6rem] tracking-[0.22em] text-dust/25 uppercase">
          <span>
            {sort in SORTS ? SORTS[sort] : ""} · {visibleBooks.length} shown
          </span>
          <span className="ml-auto flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${source === "storyblok" ? "bg-emerald-400/70" : "bg-brass/60"}`}
            />
            {source === "storyblok" ? "Live from Storyblok" : "Demo shelf · add a Storyblok token for live data"}
          </span>
        </footer>
      </main>

      {selected && (
        <OpenBook
          key={selected.id}
          book={selected}
          onClose={closeBook}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          position={{ index: selectedIndex, total: visibleBooks.length }}
        />
      )}
    </LayoutGroup>
  );
}
