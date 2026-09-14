"use client";

import type { ReactNode } from "react";

import { WOOD_ALONG, WOOD_BACK, WOOD_UPRIGHT } from "@/lib/textures";

/**
 * The case the shelves sit in: planked back, stiles either side, a moulded
 * cornice and a plinth. Purely decorative, but it is what turns a row of books
 * into a piece of furniture.
 */
export function Bookcase({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {/* Cornice */}
      <div aria-hidden className="relative">
        <div
          className="h-2 rounded-t-[3px]"
          style={{ background: "linear-gradient(to bottom, #6b4728, #40291a)" }}
        />
        <div className="wood-board relative h-[13px]">
          <div
            className="grain-layer"
            style={{ backgroundImage: WOOD_ALONG, backgroundSize: "700px 90px", opacity: 0.4 }}
          />
        </div>
        <div
          className="h-1.5"
          style={{ background: "linear-gradient(to bottom, #1d120b, #0d0806)" }}
        />
      </div>

      <div className="relative flex">
        {/* Left stile */}
        <div aria-hidden className="wood-post relative w-4 shrink-0">
          <div
            className="grain-layer"
            style={{ backgroundImage: WOOD_UPRIGHT, backgroundSize: "90px 700px", opacity: 0.45 }}
          />
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Planked back, behind everything on the shelves */}
          <div aria-hidden className="wood-back absolute inset-0">
            <div
              className="grain-layer"
              style={{ backgroundImage: WOOD_BACK, backgroundSize: "480px 480px", opacity: 0.42 }}
            />
          </div>
          {/* The case is deep, so the top of every bay falls away into shadow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(130% 80% at 50% 5%, transparent 40%, rgba(0,0,0,0.42) 100%)",
            }}
          />
          <div className="relative px-2 pt-3">{children}</div>
        </div>

        {/* Right stile */}
        <div aria-hidden className="wood-post relative w-4 shrink-0">
          <div
            className="grain-layer"
            style={{ backgroundImage: WOOD_UPRIGHT, backgroundSize: "90px 700px", opacity: 0.45 }}
          />
        </div>
      </div>

      {/* Plinth */}
      <div aria-hidden className="relative">
        <div className="wood-board relative h-[14px]">
          <div
            className="grain-layer"
            style={{ backgroundImage: WOOD_ALONG, backgroundSize: "700px 90px", opacity: 0.4 }}
          />
        </div>
        <div
          className="h-6 rounded-b-[3px]"
          style={{
            background: "linear-gradient(to bottom, #2b1c12 0%, #180f0a 55%, #090605 100%)",
            boxShadow: "0 34px 54px -20px rgba(0,0,0,0.95)",
          }}
        />
      </div>
    </div>
  );
}
