# 📚 The Dark Library

An interactive 3D digital library. Books stand on a lit wooden bookcase; click a spine and it
flies off the shelf toward you, the cover swings open, and your notes are waiting on the page.

Built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Framer Motion** and **Storyblok**.

---

## What's in here

- **A real shelf.** Spine thickness and height come from each book's page count, and the shelf
  packs itself against the measured container width — resize the window and the rows reflow.
- **One continuous motion.** The spine and the open cover share a Framer Motion `layoutId`, so the
  book is never re-created: it flies from the shelf to the centre of the screen, opens, and flies
  home again when you close it.
- **A 3D cover that opens.** Wide screens swing the cover left off its spine to reveal the title
  page and the notes; narrow screens flip it up over the top edge instead. The back of the cover
  is an *Ex Libris* bookplate.
- **Covers without cover art.** If Storyblok has no `cover_image`, a typographic clothbound cover
  is drawn from the book's own spine and accent colours — no placeholder images, no broken art.
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
│   │   ├── rating-stars.tsx
│   │   ├── shelf.tsx             one row of books on a lit board
│   │   └── toolbar.tsx           search, genre pills, sort
│   └── rich-text.tsx             Storyblok rich text → React, no dependency
└── lib/
    ├── mock-books.ts             the demo shelf
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
