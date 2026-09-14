"use client";

import { motion, useReducedMotion } from "framer-motion";

import { ROOM_DUST, WOOD_UPRIGHT } from "@/lib/textures";

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
      {/* Panelled wall behind the case */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #0e0a07 0%, #070504 55%, #050302 100%)" }}
      />
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{ backgroundImage: WOOD_UPRIGHT, backgroundSize: "260px 900px" }}
      />

      {/* Lamp above the shelves, with the slow unsteadiness of a filament */}
      <motion.div
        className="absolute -top-44 left-1/2 h-[72vh] w-[120vw] -translate-x-1/2 rounded-[50%] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(214,152,58,0.3), rgba(190,128,44,0.08) 55%, transparent 76%)",
        }}
        animate={reduceMotion ? undefined : { opacity: [0.82, 1, 0.9, 0.97, 0.85] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* A second, warmer source low and to the right — a reading lamp */}
      <div
        className="absolute right-[-10vw] bottom-[8vh] h-[52vh] w-[52vh] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(196,124,44,0.16), transparent 70%)" }}
      />

      {/* Floor bounce */}
      <div
        className="absolute inset-x-0 bottom-0 h-[32vh]"
        style={{ background: "linear-gradient(to top, rgba(201,162,39,0.07), transparent)" }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(115% 78% at 50% 28%, transparent 30%, rgba(5,3,2,0.92) 100%)" }}
      />

      {/* Everything in the room is very slightly dusty */}
      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{ backgroundImage: ROOM_DUST, backgroundSize: "200px 200px" }}
      />

      {!reduceMotion &&
        MOTES.map((mote, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full bg-brass/45 blur-[1px]"
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
