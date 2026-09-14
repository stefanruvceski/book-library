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

export function spineMetrics(book: Book): SpineMetrics {
  const pages = clamp(book.pages ?? 300, MIN_PAGES, MAX_PAGES);
  const thickness = (pages - MIN_PAGES) / (MAX_PAGES - MIN_PAGES);
  const jitter = hashUnit(book.slug);

  return {
    width: Math.round(42 + thickness * 48),
    height: Math.round(238 + jitter * 52 + thickness * 26),
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
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized.slice(0, 6);

  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) return 0;

  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ink color that stays legible on top of an arbitrary spine color. */
export function inkOn(hex: string): string {
  return luminance(hex) > 0.45 ? "#171310" : "#f8f5ef";
}

export function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "").slice(0, 6);
  const value = Number.parseInt(normalized.length === 3 ? normalized.repeat(2).slice(0, 6) : normalized, 16);
  if (Number.isNaN(value)) return hex;
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
