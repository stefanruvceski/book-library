import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Scene, SceneBay } from "@/lib/types";

/**
 * A photographic scene.
 *
 * Drawing a convincing bookcase in CSS has a ceiling, and we hit it. When a
 * photograph is supplied, the case and the room *are* the photograph, and the
 * interactive spines are positioned into bays measured on that image.
 *
 * Everything is expressed as a fraction of the image (0–1) so the scene scales
 * to any viewport and any photo resolution.
 */

const SCENE_FILE = path.join(process.cwd(), "public", "scene", "scene.json");

function isFiniteFraction(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function validateBay(bay: unknown): SceneBay | null {
  if (!bay || typeof bay !== "object") return null;
  const candidate = bay as Record<string, unknown>;

  if (
    !isFiniteFraction(candidate.left) ||
    !isFiniteFraction(candidate.right) ||
    !isFiniteFraction(candidate.baseline) ||
    !isFiniteFraction(candidate.clearance) ||
    candidate.right <= candidate.left ||
    candidate.clearance <= 0
  ) {
    return null;
  }

  return {
    left: candidate.left,
    right: candidate.right,
    baseline: candidate.baseline,
    clearance: candidate.clearance,
    dim: candidate.dim !== false,
  };
}

/**
 * Reads `public/scene/scene.json`, if the user has supplied one.
 *
 * Returns null — and the app falls back to the drawn bookcase — when the file
 * is absent or does not describe at least one usable bay. A malformed scene is
 * reported rather than silently ignored, because a typo in the geometry is
 * otherwise very hard to tell apart from "no photo yet".
 */
export async function loadScene(): Promise<Scene | null> {
  let raw: string;
  try {
    raw = await readFile(SCENE_FILE, "utf8");
  } catch {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const bays = Array.isArray(parsed.bays)
      ? parsed.bays.map(validateBay).filter((bay): bay is SceneBay => bay !== null)
      : [];

    if (typeof parsed.image !== "string" || !parsed.image.startsWith("/") || !bays.length) {
      console.error("[scene] public/scene/scene.json needs an `image` path and at least one valid bay");
      return null;
    }

    return {
      image: parsed.image,
      width: typeof parsed.width === "number" && parsed.width > 0 ? parsed.width : 2000,
      height: typeof parsed.height === "number" && parsed.height > 0 ? parsed.height : 1333,
      bays,
      grade: (parsed.grade as Scene["grade"]) ?? undefined,
      credit: typeof parsed.credit === "string" ? parsed.credit : undefined,
    };
  } catch (error) {
    console.error("[scene] public/scene/scene.json is not valid JSON", error);
    return null;
  }
}
