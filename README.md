# 📚 The Dark Library

An interactive 3D digital library. Books stand on a lit wooden bookcase; click a spine and it
flies off the shelf toward you, the cover swings open, and your notes are waiting on the page.

Built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Framer Motion** and **Storyblok**.

---

## Two ways to render the shelf

**A photograph.** Drop a library photo into `public/scene/`, measure the shelves
with the built-in `/calibrate` tool, and the case and the room become that
photograph — the interactive spines are placed onto bays measured on the image,
the page sits inside a defocused copy of it, and a colour grade puts the books in
the photo's light. See [`public/scene/README.md`](public/scene/README.md).

**Or nothing at all.** With no photograph the app draws its own bookcase, which
is what everything below describes. It is the default, and it needs no assets.

## What's in here

- **A real bookcase.** Planked back, stiles, cornice and plinth, all drawn in CSS — no textures to
  download. Spine thickness and height come from each book's page count, the shelf packs itself
  against the measured container width, and a row with room to spare lets its last volume lean.
- **No two books built the same.** Each one gets one of four bindings — plain cloth, a pasted
  spine label, flat gilt rules, or fully tooled raised bands — chosen from its slug, along with how
  rubbed its gold is, how far back it sits and how much it leans. Plain cloth is the commonest,
  because that is what a real shelf mostly is.
- **Materials, not patterns.** Leather grain, book cloth, laid paper and wood grain are all SVG
  `feTurbulence` noise. A repeating gradient always reads as a tileset — the eye finds the period
  instantly — whereas turbulence has none, so the grain comes out irregular the way the real
  materials are. Nothing is downloaded.
- **One continuous motion.** The spine and the open cover share a Framer Motion `layoutId`, so the
  book is never re-created: it flies from the shelf to the centre of the screen, opens, and flies
  home again when you close it.
- **A 3D cover that opens.** Wide screens swing the cover left off its spine to reveal the title
  page and the notes; narrow screens flip it up over the top edge instead. The back of the cover
  is an *Ex Libris* bookplate.
- **Covers without cover art.** If Storyblok has no `cover_image`, the front board is tooled from
  the book's own spine and accent colours — double fillet, corner fleurons, stamped title panel —
  so there are no placeholder images and no broken art.
- **Search across notes,** not just titles: the rich-text body is flattened into the search index.
- **Deep links.** Opening a book pushes `?book=<slug>`; the link opens straight into that book, and
  the back button closes it.
- **Keyboard and reduced motion.** `Esc` closes, `←`/`→` move through the shelf, everything is
  reachable by tab, and `prefers-reduced-motion` skips the flight entirely.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no configuration the app runs against the
demo shelf in `src/lib/mock-books.ts`, so there is nothing to set up to see it work.

## Connecting Storyblok

```bash
cp .env.example .env.local
# add STORYBLOK_PREVIEW_TOKEN
```

The content model and the publish webhook are documented in
[`docs/storyblok-schema.md`](docs/storyblok-schema.md). Short version: one `book` content type in a
`books` folder, and a Content Delivery API token in the environment.

Data is fetched server-side with `fetch`, cached under the `books` tag and revalidated every 60
seconds. `POST /api/revalidate?secret=…` purges that tag on publish.

## Layout

```
src/
├── app/
│   ├── api/revalidate/route.ts   Storyblok publish webhook
│   ├── calibrate/                workshop tool for measuring shelves on a photo
│   ├── layout.tsx                fonts, metadata
│   └── page.tsx                  server component — fetches, renders the scene
├── components/
│   ├── library/
│   │   ├── ambient-room.tsx      lamplight, vignette, drifting dust
│   │   ├── book-cover.tsx        image cover, or a generated typographic one
│   │   ├── book-spine.tsx        the shared-layout element that flies
│   │   ├── bookcase.tsx          back panel, uprights, plinth
│   │   ├── library-scene.tsx     state, filtering, shelf packing, deep links
│   │   ├── open-book.tsx         the 3D reader
│   │   ├── photo-bookcase.tsx    the case when it is a photograph
│   │   ├── rating-stars.tsx
│   │   ├── shelf.tsx             one row of books on a lit board
│   │   └── toolbar.tsx           search, genre pills, sort
│   └── rich-text.tsx             Storyblok rich text → React, no dependency
└── lib/
    ├── mock-books.ts             the demo shelf
    ├── scene.ts                  reads and validates public/scene/scene.json
    ├── textures.ts               SVG turbulence for leather, cloth, paper, wood
    ├── storyblok.ts              CDN v2 client + normalisation
    ├── types.ts
    ├── use-media-query.ts
    └── utils.ts                  spine geometry, shelf packing, colour maths
```

## Scripts

| Command         | Does                             |
| --------------- | -------------------------------- |
| `npm run dev`   | Dev server                       |
| `npm run build` | Production build                 |
| `npm start`     | Serve the production build       |
| `npm run lint`  | ESLint                           |
