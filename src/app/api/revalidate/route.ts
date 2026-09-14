import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { BOOKS_CACHE_TAG } from "@/lib/storyblok";

/**
 * Storyblok webhook target.
 *
 * Point a "Story published / unpublished" webhook at
 * `https://<host>/api/revalidate?secret=<STORYBLOK_REVALIDATE_SECRET>` and the
 * shelf updates without a redeploy.
 */
export async function POST(request: Request) {
  const expected = process.env.STORYBLOK_REVALIDATE_SECRET;

  if (!expected) {
    return NextResponse.json({ revalidated: false, reason: "revalidation is not configured" }, { status: 501 });
  }

  const provided =
    new URL(request.url).searchParams.get("secret") ?? request.headers.get("x-webhook-secret") ?? "";

  if (provided !== expected) {
    return NextResponse.json({ revalidated: false, reason: "invalid secret" }, { status: 401 });
  }

  // "max" serves stale content while the shelf refreshes in the background.
  revalidateTag(BOOKS_CACHE_TAG, "max");

  return NextResponse.json({ revalidated: true, tag: BOOKS_CACHE_TAG, now: Date.now() });
}
