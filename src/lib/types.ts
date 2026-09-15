/**
 * Domain types for the library.
 *
 * Everything the UI renders speaks `Book` — the normalized shape produced by
 * `normalizeBook()`. Raw Storyblok payloads never leak past `src/lib/storyblok.ts`.
 */

export type BookStatus = "Read" | "Reading" | "To Read" | "Abandoned";

export type RichTextMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type RichTextNode = {
  type: string;
  text?: string;
  content?: RichTextNode[];
  marks?: RichTextMark[];
  attrs?: Record<string, unknown>;
};

export type RichTextDoc = {
  type: "doc";
  content?: RichTextNode[];
};

export type BookSummary = RichTextDoc | string | null;

export interface Book {
  /** Storyblok story uuid (or a stable slug-derived id for mock data). */
  id: string;
  slug: string;
  title: string;
  author: string;
  coverImage: { url: string; alt: string } | null;
  /** Hex color of the physical spine on the shelf. */
  spineColor: string;
  /** Hex color used for foil stamping, rules and glow. */
  accentColor: string;
  pages: number | null;
  /** 0–5, halves allowed. */
  rating: number;
  status: BookStatus;
  genres: string[];
  /** ISO date (YYYY-MM-DD) the book was finished. */
  dateRead: string | null;
  summary: BookSummary;
}

/* ------------------------------------------------------------------ *
 * Raw Storyblok shapes
 * ------------------------------------------------------------------ */

/** Storyblok's native color picker returns an object; a text field returns a string. */
export type StoryblokColor = string | { color?: string | null } | null;

export interface StoryblokAsset {
  filename?: string | null;
  alt?: string | null;
  name?: string | null;
}

export interface StoryblokBookContent {
  component: "book";
  title?: string;
  author?: string;
  cover_image?: StoryblokAsset | null;
  spine_color?: StoryblokColor;
  accent_color?: StoryblokColor;
  pages?: number | string | null;
  rating?: number | string | null;
  status?: string | null;
  genres?: string[] | string | null;
  date_read?: string | null;
  summary?: RichTextDoc | string | null;
}

export interface StoryblokStory<T> {
  uuid: string;
  id: number;
  name: string;
  slug: string;
  full_slug: string;
  content: T;
  published_at?: string | null;
  first_published_at?: string | null;
}

export interface StoryblokStoriesResponse<T> {
  stories: StoryblokStory<T>[];
  total?: number;
}

export interface StoryblokStoryResponse<T> {
  story: StoryblokStory<T>;
}

/* ------------------------------------------------------------------ *
 * Photographic scene
 * ------------------------------------------------------------------ */

export interface SceneBay {
  /** Left edge of the usable shelf, as a fraction of image width. */
  left: number;
  /** Right edge, as a fraction of image width. */
  right: number;
  /** The board's top surface — where the books stand — as a fraction of height. */
  baseline: number;
  /** Headroom above the board before the next shelf, as a fraction of height. */
  clearance: number;
  /**
   * Paint the bay out before placing books in it. Leave this on unless the bay
   * is genuinely empty in the photograph, or the photo's own books will show
   * through the gaps.
   */
  dim?: boolean;
}

export interface Scene {
  /** Public path of the backplate, e.g. `/scene/library.jpg`. */
  image: string;
  /** Intrinsic size, used for the aspect ratio. */
  width: number;
  height: number;
  bays: SceneBay[];
  /**
   * Colour grade laid over the spines so they sit in the photograph's light
   * rather than on top of it.
   */
  grade?: {
    /** Hex tint multiplied over the books. */
    tint?: string;
    /** 0–1. */
    strength?: number;
    /** Extra darkening, 0–1. */
    shade?: number;
  };
  /** Credit line shown under the case. Fill this in for stock photography. */
  credit?: string;
}
