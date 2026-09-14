"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The room the shelves live in: a pool of lamplight, a heavy vignette and a
 * few motes of dust drifting through the beam.
 *
 * Mote positions are a fixed table rather than `Math.random()` so the server
 * and client render the same thing (no hydration mismatch) and the drift never
 * reshuffles between renders.
 */
const MOTES = [
  { left: 8, top: 22, size: 2, delay: 0, duration: 17 },
  { left: 17, top: 68, size: 3, delay: 2.4, duration: 21 },
  { left: 26, top: 12, size: 2, delay: 5.1, duration: 19 },
  { left: 34, top: 51, size: 4, delay: 1.2, duration: 24 },
  { left: 43, top: 81, size: 2, delay: 6.6, duration: 16 },
  { left: 51, top: 33, size: 3, delay: 3.3, duration: 22 },
  { left: 59, top: 62, size: 2, delay: 7.8, duration: 18 },
  { left: 67, top: 18, size: 3, delay: 4.5, duration: 25 },
  { left: 74, top: 74, size: 2, delay: 0.9, duration: 20 },
  { left: 82, top: 41, size: 4, delay: 5.7, duration: 23 },
  { left: 89, top: 27, size: 2, delay: 2.1, duration: 18 },
  { left: 95, top: 66, size: 3, delay: 6.9, duration: 21 },
];

export function AmbientRoom() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Lamp above the shelves */}
      <div
        className="absolute -top-40 left-1/2 h-[70vh] w-[120vw] -translate-x-1/2 rounded-[50%] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(217,164,65,0.22), rgba(217,164,65,0.06) 55%, transparent 75%)",
        }}
      />

      {/* Cold rim light from the left, so the spines have two-sided shading */}
      <div
        className="absolute top-1/4 -left-32 h-[60vh] w-[60vh] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(96,140,190,0.18), transparent 70%)" }}
      />

      {/* Floor bounce */}
      <div
        className="absolute inset-x-0 bottom-0 h-[35vh]"
        style={{ background: "linear-gradient(to top, rgba(217,164,65,0.07), transparent)" }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 80% at 50% 30%, transparent 35%, rgba(3,3,5,0.85) 100%)" }}
      />

      {!reduceMotion &&
        MOTES.map((mote, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full bg-brass/50 blur-[1px]"
            style={{
              left: `${mote.left}%`,
              top: `${mote.top}%`,
              width: mote.size,
              height: mote.size,
            }}
            animate={{
              y: [0, -34, 6, -18, 0],
              x: [0, 12, -8, 5, 0],
              opacity: [0, 0.65, 0.3, 0.55, 0],
            }}
            transition={{
              duration: mote.duration,
              delay: mote.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
    </div>
  );
}
