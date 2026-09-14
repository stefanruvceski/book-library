import type { Book } from "@/lib/types";

/** Minimal `clsx` — not worth a dependency for what this app needs. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

/**
 * Physical dimensions of a book on the shelf, derived from its page count so
 * the shelf reads as a real collection rather than a row of identical tiles.
 */
export interface SpineMetrics {
  /** Spine thickness in px. */
  width: number;
  /** Book height in px. */
  height: number;
}

const MIN_PAGES = 120;
const MAX_PAGES = 900;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Deterministic 0–1 noise from a string, so heights vary but never jump between renders. */
function hashUnit(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000) / 1000;
}

/**
 * A stable pseudo-random value in 0–1 for a given seed and salt.
 *
 * Every irregularity on the shelf — which binding a book has, how rubbed its
 * gold is, how far back it sits — comes from here, so it is decided once by the
 * book's slug and never changes between renders or between server and client.
 */
export function noiseFrom(seed: string, salt: string): number {
  return hashUnit(`${seed}::${salt}`);
}

export function spineMetrics(book: Book): SpineMetrics {
  const pages = clamp(book.pages ?? 300, MIN_PAGES, MAX_PAGES);
  const thickness = (pages - MIN_PAGES) / (MAX_PAGES - MIN_PAGES);
  const jitter = hashUnit(book.slug);

  // Real shelves vary far more than page counts alone would suggest — trim
  // sizes differ, so the jitter carries as much weight as the extent does.
  return {
    width: Math.round(36 + thickness * 54 + hashUnit(`${book.slug}:w`) * 10),
    height: Math.round(214 + jitter * 74 + thickness * 30),
  };
}

/**
 * Greedy shelf packing: fill a row until the next spine would overflow.
 * Called with a measured container width so shelves reflow responsively.
 */
export function packShelves<T>(items: T[], widthOf: (item: T) => number, available: number, gap = 4): T[][] {
  if (available <= 0) return items.length ? [items] : [];

  const shelves: T[][] = [];
  let current: T[] = [];
  let used = 0;

  for (const item of items) {
    const width = widthOf(item);
    const next = used === 0 ? width : used + gap + width;

    if (current.length && next > available) {
      shelves.push(current);
      current = [item];
      used = width;
      continue;
    }

    current.push(item);
    used = next;
  }

  if (current.length) shelves.push(current);
  return shelves;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function formatReadDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : DATE_FORMAT.format(date);
}

/** Perceived luminance (0–1) — used to pick readable foil against a spine color. */
export function luminance(hex: string): number {
  const rgb = channels(hex);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Tooling colour that actually reads against the binding it is struck on.
 *
 * Dark blind-tooling on tan calf is period-correct but disappears if the two
 * are close in value, so a low-contrast pair is pushed further apart rather
 * than swapped for something that would look wrong.
 */
export function legibleStamp(spine: string, accent: string): string {
  const delta = luminance(accent) - luminance(spine);
  if (Math.abs(delta) > 0.16) return accent;
  return shade(accent, delta >= 0 ? 0.42 : -0.48);
}

/** Ink color that stays legible on top of an arbitrary spine color. */
export function inkOn(hex: string): string {
  return luminance(hex) > 0.45 ? "#171310" : "#f8f5ef";
}

/** Parses a 3- or 6-digit hex into RGB channels; null when it isn't one. */
function channels(hex: string): [number, number, number] | null {
  const normalized = hex.replace("#", "").slice(0, 6);
  const full = normalized.length === 3 ? normalized.repeat(2).slice(0, 6) : normalized;
  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value) || full.length !== 6) return null;
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

/** Moves a colour toward black (negative) or white (positive) by `amount` (0–1). */
export function shade(hex: string, amount: number): string {
  const rgb = channels(hex);
  if (!rgb) return hex;
  const target = amount < 0 ? 0 : 255;
  const strength = Math.abs(amount);
  return toHex(rgb.map((channel) => channel + (target - channel) * strength) as [number, number, number]);
}

export function withAlpha(hex: string, alpha: number): string {
  const rgb = channels(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/** Name particles that belong with the surname they precede. */
const PARTICLES = new Set([
  "le", "la", "de", "del", "della", "di", "da", "dos", "das",
  "van", "von", "der", "den", "ten", "ter", "du", "st",
]);

/**
 * What a binder stamps in the author compartment: the surname alone, because
 * that is all a spine has room for. Joint authors are left as written.
 */
export function surname(author: string): string {
  if (author.includes("&") || author.includes(",")) return author;

  const parts = author.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return author;

  const last = parts[parts.length - 1];
  const previous = parts[parts.length - 2]?.replace(/\.$/, "").toLowerCase();

  return previous && PARTICLES.has(previous) ? `${parts[parts.length - 2]} ${last}` : last;
}

/**
 * How many raised bands (hubs) run across a spine. A real binder fits them to
 * the height of the book, so taller volumes get more compartments.
 */
export function bandCount(height: number): number {
  if (height < 250) return 3;
  if (height < 290) return 4;
  return 5;
}
