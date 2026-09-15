"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Plus, Trash2 } from "lucide-react";

import type { SceneBay } from "@/lib/types";

/**
 * Measures shelf bays on a photograph.
 *
 * Every number in `scene.json` is a fraction of the image, which is impossible
 * to guess and tedious to find by editing and reloading. Here you drag the
 * edges of each bay onto the boards in the photo and copy the result out.
 *
 * Not linked from anywhere and marked noindex — it is a workshop tool.
 */

type Handle = { bay: number; edge: "left" | "right" | "baseline" | "top" } | null;

const DEFAULT_BAY: SceneBay = { left: 0.08, right: 0.92, baseline: 0.5, clearance: 0.3, dim: true };

export function Calibrator() {
  const [image, setImage] = useState("/scene/library.jpg");
  const [loaded, setLoaded] = useState<{ src: string; width: number; height: number } | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [bays, setBays] = useState<SceneBay[]>([DEFAULT_BAY]);
  const [dragging, setDragging] = useState<Handle>(null);
  const [copied, setCopied] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);

  // Intrinsic size goes straight into the scene file, so read it off the image.
  // Results are tagged with the path they came from, so switching images needs
  // no state reset — anything for a different path simply stops matching.
  useEffect(() => {
    const probe = new window.Image();
    probe.onload = () => setLoaded({ src: image, width: probe.naturalWidth, height: probe.naturalHeight });
    probe.onerror = () => setFailedSrc(image);
    probe.src = image;

    return () => {
      probe.onload = null;
      probe.onerror = null;
    };
  }, [image]);

  const size = loaded?.src === image ? loaded : null;
  const failed = !size && failedSrc === image;

  const update = useCallback((index: number, patch: Partial<SceneBay>) => {
    setBays((current) => current.map((bay, i) => (i === index ? { ...bay, ...patch } : bay)));
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!dragging || !frameRef.current) return;

      const rect = frameRef.current.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
      const bay = bays[dragging.bay];
      if (!bay) return;

      if (dragging.edge === "left") update(dragging.bay, { left: Math.min(x, bay.right - 0.02) });
      if (dragging.edge === "right") update(dragging.bay, { right: Math.max(x, bay.left + 0.02) });
      if (dragging.edge === "baseline") {
        update(dragging.bay, { baseline: Math.max(y, bay.clearance + 0.01) });
      }
      if (dragging.edge === "top") {
        update(dragging.bay, { clearance: Math.max(0.02, bay.baseline - y) });
      }
    },
    [bays, dragging, update],
  );

  const json = JSON.stringify(
    {
      image,
      width: size?.width ?? 2000,
      height: size?.height ?? 1333,
      credit: "Photo by <name> on <source>",
      grade: { tint: "#c98a3a", strength: 0.18, shade: 0.12 },
      bays: bays.map((bay) => ({
        left: round(bay.left),
        right: round(bay.right),
        baseline: round(bay.baseline),
        clearance: round(bay.clearance),
        dim: bay.dim !== false,
      })),
    },
    null,
    2,
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-dust">Calibrate the scene</h1>
      <p className="mt-3 max-w-2xl font-display text-dust/55 italic">
        Drag the edges of each bay onto a shelf in the photograph: the bottom line sits on the
        board the books stand on, the top line marks the headroom above it. Then paste the JSON
        into <code className="not-italic">public/scene/scene.json</code>.
      </p>

      <label className="mt-8 block">
        <span className="font-sans text-[0.6rem] tracking-[0.28em] text-dust/40 uppercase">
          Image path, relative to public/
        </span>
        <input
          value={image}
          onChange={(event) => setImage(event.target.value)}
          spellCheck={false}
          className="mt-2 w-full rounded-md border border-dust/15 bg-room/70 px-3 py-2 font-mono text-sm text-dust focus:border-brass/50 focus:outline-none"
        />
      </label>

      {failed && (
        <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200/80">
          Nothing loaded from <code>{image}</code>. Put the file under <code>public/</code> — a file
          at <code>public/scene/library.jpg</code> is served from <code>/scene/library.jpg</code>.
        </p>
      )}

      {size && (
        <>
          <div
            ref={frameRef}
            onPointerMove={onPointerMove}
            onPointerUp={() => setDragging(null)}
            onPointerLeave={() => setDragging(null)}
            className="relative mt-6 w-full touch-none overflow-hidden rounded-sm select-none"
            style={{ aspectRatio: `${size.width} / ${size.height}` }}
          >
            {/* Plain img: this tool points at arbitrary local paths while you experiment. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />

            {bays.map((bay, index) => (
              <div
                key={index}
                className="absolute border-2 border-brass/80 bg-brass/10"
                style={{
                  left: `${bay.left * 100}%`,
                  width: `${(bay.right - bay.left) * 100}%`,
                  top: `${(bay.baseline - bay.clearance) * 100}%`,
                  height: `${bay.clearance * 100}%`,
                }}
              >
                <span className="absolute -top-6 left-0 rounded bg-brass px-1.5 py-0.5 font-sans text-[0.6rem] font-semibold text-room">
                  Bay {index + 1}
                </span>

                <Grip className="-top-1 left-0 h-2 w-full cursor-ns-resize" onDown={() => setDragging({ bay: index, edge: "top" })} />
                <Grip className="-bottom-1 left-0 h-2 w-full cursor-ns-resize" onDown={() => setDragging({ bay: index, edge: "baseline" })} />
                <Grip className="top-0 -left-1 h-full w-2 cursor-ew-resize" onDown={() => setDragging({ bay: index, edge: "left" })} />
                <Grip className="top-0 -right-1 h-full w-2 cursor-ew-resize" onDown={() => setDragging({ bay: index, edge: "right" })} />
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setBays((current) => [...current, { ...DEFAULT_BAY, baseline: 0.8 }])}
              className="flex items-center gap-1.5 rounded-full border border-dust/15 px-3 py-1.5 font-sans text-[0.65rem] tracking-[0.16em] text-dust/70 uppercase hover:border-brass/50 hover:text-brass"
            >
              <Plus size={13} /> Add bay
            </button>
            {bays.length > 1 && (
              <button
                type="button"
                onClick={() => setBays((current) => current.slice(0, -1))}
                className="flex items-center gap-1.5 rounded-full border border-dust/15 px-3 py-1.5 font-sans text-[0.65rem] tracking-[0.16em] text-dust/70 uppercase hover:border-red-400/50 hover:text-red-300"
              >
                <Trash2 size={13} /> Remove last
              </button>
            )}
            <span className="font-sans text-[0.6rem] tracking-[0.2em] text-dust/30 uppercase">
              {size.width} × {size.height}
            </span>
          </div>

          <div className="relative mt-6">
            <pre className="overflow-x-auto rounded-md border border-dust/12 bg-room/70 p-4 font-mono text-xs leading-relaxed text-dust/80">
              {json}
            </pre>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(json).then(
                  () => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1600);
                  },
                  () => setCopied(false),
                );
              }}
              className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-dust/15 bg-room px-3 py-1.5 font-sans text-[0.6rem] tracking-[0.16em] text-dust/70 uppercase hover:border-brass/50 hover:text-brass"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}

function Grip({ className, onDown }: { className: string; onDown: () => void }) {
  return (
    <span
      onPointerDown={(event) => {
        event.preventDefault();
        onDown();
      }}
      className={`absolute bg-brass/70 hover:bg-brass ${className}`}
    />
  );
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
