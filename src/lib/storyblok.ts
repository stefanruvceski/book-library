import "server-only";

import { MOCK_BOOKS } from "@/lib/mock-books";
import type {
  Book,
  BookStatus,
  StoryblokBookContent,
  StoryblokColor,
  StoryblokStoriesResponse,
  StoryblokStory,
} from "@/lib/types";

/**
 * Storyblok Content Delivery API v2 client.
 *
 * Deliberately dependency-free: a couple of `fetch` calls with Next's data cache
 * beat pulling in an SDK for two endpoints. When no token is configured the app
 * falls back to `MOCK_BOOKS` so `npm run dev` works on a fresh clone.
 */

const TOKEN = process.env.STORYBLOK_PREVIEW_TOKEN ?? process.env.NEXT_PUBLIC_STORYBLOK_TOKEN;
const API_BASE = process.env.STORYBLOK_API_URL ?? "https://api.storyblok.com";
/** `draft` surfaces unpublished edits; `published` is the live cache. */
const VERSION = process.env.STORYBLOK_VERSION === "draft" ? "draft" : "published";
/** Folder holding the book stories inside the space. */
const BOOKS_FOLDER = process.env.STORYBLOK_BOOKS_FOLDER ?? "books";

export const BOOKS_CACHE_TAG = "books";
const REVALIDATE_SECONDS = 60;

export const isStoryblokConfigured = Boolean(TOKEN);

const STATUSES: BookStatus[] = ["Read", "Reading", "To Read", "Abandoned"];

const FALLBACK_SPINE = "#1e293b";
const FALLBACK_ACCENT = "#f59e0b";

function readColor(value: StoryblokColor, fallback: string): string {
  const raw = typeof value === "string" ? value : value?.color;
  const trimmed = raw?.trim();
  if (!trimmed) return fallback;
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed) ? trimmed : fallback;
}

function readNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readStatus(value: unknown): BookStatus {
  const match = STATUSES.find((status) => status.toLowerCase() === String(value ?? "").toLowerCase());
  return match ?? "Read";
}

function readGenres(value: StoryblokBookContent["genres"]): string[] {
  if (Array.isArray(value)) return value.map((genre) => String(genre).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((genre) => genre.trim())
      .filter(Boolean);
  }
  return [];
}

/** Storyblok serves assets over a CDN that also does resizing — ask for a sane width. */
function optimizeAsset(filename: string): string {
  if (!filename.includes("a.storyblok.com")) return filename;
  if (filename.endsWith(".svg")) return filename;
  return `${filename}/m/800x0/filters:quality(82)`;
}

export function normalizeBook(story: StoryblokStory<StoryblokBookContent>): Book {
  const content = story.content ?? ({ component: "book" } as StoryblokBookContent);
  const filename = content.cover_image?.filename?.trim();

  return {
    id: story.uuid || story.slug,
    slug: story.slug,
    title: content.title?.trim() || story.name,
    author: content.author?.trim() || "Unknown author",
    coverImage: filename
      ? { url: optimizeAsset(filename), alt: content.cover_image?.alt?.trim() || `${content.title ?? story.name} cover` }
      : null,
    spineColor: readColor(content.spine_color ?? null, FALLBACK_SPINE),
    accentColor: readColor(content.accent_color ?? null, FALLBACK_ACCENT),
    pages: readNumber(content.pages),
    rating: Math.min(5, Math.max(0, readNumber(content.rating) ?? 0)),
    status: readStatus(content.status),
    genres: readGenres(content.genres),
    dateRead: content.date_read?.slice(0, 10) || null,
    summary: content.summary ?? null,
  };
}

async function storyblokFetch<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!TOKEN) return null;

  const url = new URL(`/v2/cdn/${path}`, API_BASE);
  url.searchParams.set("token", TOKEN);
  url.searchParams.set("version", VERSION);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS, tags: [BOOKS_CACHE_TAG] },
    });

    if (!response.ok) {
      console.error(`[storyblok] ${path} responded ${response.status} ${response.statusText}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("[storyblok] request failed", error);
    return null;
  }
}

/**
 * Every book in the collection, newest read first.
 * Falls back to the bundled demo shelf when Storyblok is unreachable or unconfigured.
 */
export async function getBooks(): Promise<{ books: Book[]; source: "storyblok" | "demo" }> {
  const data = await storyblokFetch<StoryblokStoriesResponse<StoryblokBookContent>>("stories", {
    content_type: "book",
    starts_with: `${BOOKS_FOLDER}/`,
    per_page: "100",
    sort_by: "content.date_read:desc",
  });

  const stories = data?.stories ?? [];
  if (!stories.length) return { books: MOCK_BOOKS, source: "demo" };

  return { books: stories.map(normalizeBook), source: "storyblok" };
}
