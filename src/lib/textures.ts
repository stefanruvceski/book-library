/**
 * Material textures, generated as SVG noise rather than tiled gradients.
 *
 * A `repeating-linear-gradient` always reads as a pattern — the eye finds the
 * period immediately, which is what makes CSS "wood" look like a game tileset.
 * `feTurbulence` has no period, so grain, hide and cloth come out irregular the
 * way the real materials are. Each texture is one small tile the browser
 * rasterises once and repeats.
 */

function svgUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}")`;
}

function noise({
  width,
  height,
  frequency,
  octaves = 4,
  seed = 1,
  opacity = 1,
  contrast = 1,
}: {
  width: number;
  height: number;
  /** `x y` — an anisotropic frequency stretches the noise into grain lines. */
  frequency: string;
  octaves?: number;
  seed?: number;
  opacity?: number;
  /**
   * Steepens the noise's transfer curve. Flat mid-grey noise composited with
   * soft-light just hazes a surface; pushing it toward the extremes is what
   * makes it read as grain, weave or pebbling.
   */
  contrast?: number;
}): string {
  const transfer =
    contrast === 1
      ? ""
      : ["R", "G", "B"]
          .map(
            (channel) =>
              `<feFunc${channel} type="linear" slope="${contrast}" intercept="${(
                (1 - contrast) /
                2
              ).toFixed(3)}" />`,
          )
          .join("");

  return svgUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <filter id="n" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="${frequency}"
          numOctaves="${octaves}" seed="${seed}" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        ${transfer ? `<feComponentTransfer>${transfer}</feComponentTransfer>` : ""}
      </filter>
      <rect width="100%" height="100%" filter="url(#n)" opacity="${opacity}" />
    </svg>
  `);
}

/** Fine pebbled grain, the way dyed goatskin takes an impression. */
export const LEATHER_GRAIN = noise({
  width: 140,
  height: 140,
  frequency: "0.85",
  octaves: 4,
  seed: 3,
  contrast: 2.4,
});

/** Coarser, squarer noise — book cloth is a woven material. */
export const CLOTH_WEAVE = noise({
  width: 120,
  height: 120,
  frequency: "0.62 0.9",
  octaves: 2,
  seed: 11,
  contrast: 2.8,
});

/** Laid paper for pasted spine labels. */
export const PAPER_FIBRE = noise({ width: 160, height: 160, frequency: "0.7 0.35", octaves: 5, seed: 7 });

/** Grain stretched along the length of a board: slow across, fast down. */
export const WOOD_ALONG = noise({ width: 700, height: 90, frequency: "0.006 0.55", octaves: 5, seed: 21 });

/** The same, rotated for uprights. */
export const WOOD_UPRIGHT = noise({ width: 90, height: 700, frequency: "0.55 0.006", octaves: 5, seed: 5 });

/** Deep, soft blotches for the planked back of the case. */
export const WOOD_BACK = noise({ width: 480, height: 480, frequency: "0.012 0.3", octaves: 6, seed: 17 });

/** Airborne dust and the general grubbiness of a room nobody cleans. */
export const ROOM_DUST = noise({ width: 200, height: 200, frequency: "0.9", octaves: 3, seed: 31 });

/**
 * Film grain. Single-octave noise at close to pixel frequency — the thing that
 * is present in every photograph and in no vector drawing, and the cheapest way
 * to stop clean CSS reading as a rendering.
 */
export const FILM_GRAIN = noise({ width: 180, height: 180, frequency: "0.98", octaves: 1, seed: 43 });
