"use client";

import type { ReactNode } from "react";

/**
 * The physical case the shelves sit in: back panel, two uprights and a top
 * board. Purely decorative, but it is what makes a half-filled shelf read as a
 * piece of furniture instead of an empty container.
 */
export function Bookcase({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {/* Back panel */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-sm"
        style={{
          background:
            "linear-gradient(160deg, #14100d 0%, #0c0908 45%, #100b09 100%)",
          boxShadow: "inset 0 2px 24px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(217,164,65,0.05)",
        }}
      />

      {/* Top board, with the lamp catching its front edge */}
      <div
        aria-hidden
        className="relative h-3.5 rounded-t-sm"
        style={{
          background: "linear-gradient(to bottom, #4a3627 0%, #33251b 45%, #1a1210 100%)",
          boxShadow: "0 -1px 0 rgba(255,255,255,0.07) inset",
        }}
      />

      <div className="relative flex">
        {/* Left upright */}
        <div
          aria-hidden
          className="w-3 shrink-0"
          style={{ background: "linear-gradient(90deg, #2e2118, #1a120e 70%, #120c09)" }}
        />

        <div className="min-w-0 flex-1 px-2 pt-3">{children}</div>

        {/* Right upright */}
        <div
          aria-hidden
          className="w-3 shrink-0"
          style={{ background: "linear-gradient(90deg, #120c09, #1a120e 30%, #2e2118)" }}
        />
      </div>

      {/* Plinth */}
      <div
        aria-hidden
        className="relative h-5 rounded-b-sm"
        style={{
          background: "linear-gradient(to bottom, #241a13 0%, #150e0b 60%, #0a0706 100%)",
          boxShadow: "0 30px 50px -20px rgba(0,0,0,0.95)",
        }}
      />
    </div>
  );
}
