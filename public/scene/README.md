# Photographic scenes

Drop a photograph in here and the bookcase *becomes* that photograph: the case,
the room and the light are the picture, and the interactive spines are placed
onto shelves measured on it. With no photograph the app draws its own bookcase
in CSS instead, so this folder is entirely optional.

## 1. Choose a photograph you are allowed to use

This matters more than it sounds. A watermarked comp from Adobe Stock, Getty or
iStock is not licensed for a public site, and the watermark will be visible.
Either buy a licence, or take the photograph from a source that permits reuse:

| Source | Licence |
| ------ | ------- |
| [Unsplash](https://unsplash.com/s/photos/old-library) | Free for commercial use, no attribution required (credit is polite) |
| [Pexels](https://www.pexels.com/search/library/) | Free for commercial use |
| Your own camera | Yours |

Search terms that land the look: *old library*, *antique bookshelf*,
*library dark*, *leather bound books shelf*.

**What makes a photo work here**

- Shot square-on, not at a steep angle. Our books are drawn flat, so a shelf
  photographed in heavy perspective will not line up with them.
- At least one shelf with room on it, ideally one that is empty or sparse.
- Dark and warm suits the palette, but any tone works — grade it in the scene.
- 2000px wide or more.

Save it as `public/scene/library.jpg` (any name and format works; the path goes
in the scene file).

## 2. Measure the shelves

Run the app and open **`/calibrate`**. Point it at your image, then drag the
edges of each bay onto a shelf: the bottom line sits on the board the books will
stand on, the top line marks the headroom above it. Add a bay per shelf you want
to fill. Copy the JSON it prints.

## 3. Save it as `scene.json`

Paste into `public/scene/scene.json` — `scene.example.json` in this folder shows
the shape. Every number is a fraction of the image, so the scene scales to any
viewport.

| Field | Meaning |
| ----- | ------- |
| `image` | Public path, e.g. `/scene/library.jpg` |
| `width`, `height` | Intrinsic pixel size; sets the aspect ratio |
| `bays[].left` / `.right` | Horizontal extent of the usable shelf |
| `bays[].baseline` | The board's top surface — where books stand |
| `bays[].clearance` | Headroom above the board |
| `bays[].dim` | Darkens the photo behind the row so its own books do not show through. Set `false` for a bay that is already empty |
| `grade.tint` / `.strength` | Colour cast laid over the spines so they sit in the photo's light |
| `grade.shade` | Extra darkening, 0–1 |
| `credit` | Shown under the case. Fill this in for stock photography |

Bays are filled in the order you list them, and the last one takes any overflow.
A malformed file is reported in the server log and the app falls back to the
drawn bookcase rather than rendering a broken scene.
