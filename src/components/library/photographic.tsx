"use client";

import { FILM_GRAIN } from "@/lib/textures";

/**
 * The layer that makes drawn things look photographed.
 *
 * Three things are present in every photograph of a dark room and absent from
 * clean CSS: grain, bloom around the lit areas, and a little atmospheric haze
 * between the camera and the back of the scene. None of them are strong enough
 * to notice individually, which is the point.
 *
 * Kept as plain overlay elements rather than a `filter` on the container: a
 * filter would flatten the 3D transform context the spines hover in.
 */
export function PhotographicPass() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
      {/* Haze — air between the lens and the back of the case */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(196,158,104,0.035) 0%, transparent 26%, transparent 74%, rgba(10,7,4,0.26) 100%)",
        }}
      />

      {/* Bloom off the lit top of the case */}
      <div
        className="absolute inset-x-0 top-0 h-2/5 mix-blend-screen"
        style={{
          background: "radial-gradient(70% 100% at 50% 0%, rgba(214,168,94,0.055), transparent 72%)",
        }}
      />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.1] mix-blend-overlay"
        style={{ backgroundImage: FILM_GRAIN, backgroundSize: "128px 128px" }}
      />
    </div>
  );
}
