import type { Book, RichTextDoc, RichTextNode } from "@/lib/types";

/**
 * Demo shelf used whenever Storyblok is not configured (or returns nothing),
 * so the library is never empty on a fresh clone. The shape matches exactly
 * what `normalizeBook()` produces from a real `book` story.
 *
 * Covers are intentionally imageless: the binding is drawn from
 * `spineColor`/`accentColor`, so the demo needs no network and no third-party
 * image rights. The colours are period bindings — dyed goat and calf over
 * boards, tooled in gold — rather than modern dust-jacket colours.
 */

/* --- tiny rich-text builders, so the data below stays readable --- */

const text = (value: string, marks?: string[]): RichTextNode => ({
  type: "text",
  text: value,
  ...(marks ? { marks: marks.map((type) => ({ type })) } : {}),
});

const p = (...children: (string | RichTextNode)[]): RichTextNode => ({
  type: "paragraph",
  content: children.map((child) => (typeof child === "string" ? text(child) : child)),
});

const h = (level: number, value: string): RichTextNode => ({
  type: "heading",
  attrs: { level },
  content: [text(value)],
});

const quote = (value: string): RichTextNode => ({
  type: "blockquote",
  content: [p(value)],
});

const bullets = (...items: string[]): RichTextNode => ({
  type: "bullet_list",
  content: items.map((item) => ({
    type: "list_item",
    content: [p(item)],
  })),
});

const doc = (...content: RichTextNode[]): RichTextDoc => ({ type: "doc", content });

/* ----------------------------------------------------------------- */

export const MOCK_BOOKS: Book[] = [
  {
    id: "demo-atomic-habits",
    slug: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: null,
    spineColor: "#2c4032",
    accentColor: "#c9a227",
    pages: 320,
    rating: 5,
    status: "Read",
    genres: ["Self-Help", "Psychology"],
    dateRead: "2026-02-15",
    summary: doc(
      h(3, "Why it stuck"),
      p(
        "The argument is almost embarrassingly simple: you do not rise to the level of your goals, you ",
        text("fall to the level of your systems", ["bold"]),
        ". Everything else in the book is scaffolding around that sentence.",
      ),
      bullets(
        "Make it obvious — design the environment before relying on willpower.",
        "Make it attractive — pair a habit you need with one you want.",
        "Make it easy — shrink the first step until refusing feels absurd.",
        "Make it satisfying — what gets rewarded immediately gets repeated.",
      ),
      quote("Every action you take is a vote for the type of person you wish to become."),
      p(
        "The chapter on identity-based habits is the one I keep returning to. Changing ",
        text("what you do", ["italic"]),
        " is fragile; changing who you believe you are is self-reinforcing.",
      ),
    ),
  },
  {
    id: "demo-dune",
    slug: "dune",
    title: "Dune",
    author: "Frank Herbert",
    coverImage: null,
    spineColor: "#7a3b1c",
    accentColor: "#e0b654",
    pages: 688,
    rating: 5,
    status: "Read",
    genres: ["Science Fiction", "Classics"],
    dateRead: "2026-01-08",
    summary: doc(
      p(
        "Ecology as politics, politics as religion, religion as a weapon aimed centuries into the future. Herbert writes prophecy as a trap rather than a gift, and Paul spends the whole novel walking into it with his eyes open.",
      ),
      quote("A beginning is the time for taking the most delicate care that the balances are correct."),
      p(
        "What surprised me on this reread: how much of the book is interiority. Half the plot happens in italicised thought, everyone reading everyone else, and the desert doing the rest.",
      ),
    ),
  },
  {
    id: "demo-thinking-fast-slow",
    slug: "thinking-fast-and-slow",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    coverImage: null,
    spineColor: "#1f2a3c",
    accentColor: "#b9963f",
    pages: 499,
    rating: 4,
    status: "Read",
    genres: ["Psychology", "Economics"],
    dateRead: "2025-11-22",
    summary: doc(
      h(3, "Two systems, one narrator"),
      p(
        "System 1 answers before you have finished asking. System 2 audits it, badly, and only when it feels like getting up.",
      ),
      bullets(
        "Anchoring survives even when you know the anchor is random.",
        "We substitute an easy question for a hard one and never notice the swap.",
        "The remembering self, not the experiencing self, decides what to do next time.",
      ),
      p(
        "Some of the priming research has aged poorly since publication, which is worth holding in mind — but the core framing of judgement under uncertainty still does real work.",
      ),
    ),
  },
  {
    id: "demo-pragmatic-programmer",
    slug: "the-pragmatic-programmer",
    title: "The Pragmatic Programmer",
    author: "Hunt & Thomas",
    coverImage: null,
    spineColor: "#234034",
    accentColor: "#cbae5c",
    pages: 352,
    rating: 5,
    status: "Read",
    genres: ["Software", "Craft"],
    dateRead: "2025-09-30",
    summary: doc(
      p("Still the best book about the parts of the job that are not typing."),
      bullets(
        "Don't Repeat Yourself is about knowledge, not about characters on screen.",
        "Tracer bullets over big-bang integration: get something end-to-end, then aim.",
        "Care about your craft, and leave the campsite cleaner than you found it.",
      ),
      quote("Don't live with broken windows."),
    ),
  },
  {
    id: "demo-piranesi",
    slug: "piranesi",
    title: "Piranesi",
    author: "Susanna Clarke",
    coverImage: null,
    spineColor: "#3b2a4a",
    accentColor: "#cbb26a",
    pages: 245,
    rating: 5,
    status: "Read",
    genres: ["Fantasy", "Literary"],
    dateRead: "2026-03-02",
    summary: doc(
      p(
        "A house of infinite halls, tides in the basement, clouds on the upper floors, and a narrator so gentle that the horror creeps up from underneath.",
      ),
      quote("The Beauty of the House is immeasurable; its Kindness infinite."),
      p("Short, strange, and completely self-assured. I finished it in two sittings and immediately missed it."),
    ),
  },
  {
    id: "demo-designing-data-intensive",
    slug: "designing-data-intensive-applications",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    coverImage: null,
    spineColor: "#4e1f26",
    accentColor: "#d0ae57",
    pages: 616,
    rating: 5,
    status: "Read",
    genres: ["Software", "Distributed Systems"],
    dateRead: "2025-07-14",
    summary: doc(
      h(3, "The one that changed how I argue"),
      p(
        "Kleppmann's trick is refusing to sell a solution. Every chapter is a set of trade-offs with the costs left visible, which is why the book survives the technology it describes.",
      ),
      bullets(
        "Replication lag is a product decision long before it is an ops problem.",
        "Serializability, linearizability and consensus are three different promises — say which one you mean.",
        "Logs are the honest primitive; most databases are opinions layered on top of one.",
      ),
    ),
  },
  {
    id: "demo-the-name-of-the-wind",
    slug: "the-name-of-the-wind",
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    coverImage: null,
    spineColor: "#5a3520",
    accentColor: "#e2c274",
    pages: 662,
    rating: 4,
    status: "Read",
    genres: ["Fantasy"],
    dateRead: "2025-05-19",
    summary:
      "A story about a man telling the story of himself, which is the point and also the problem. The prose sings, the magic system is delightful, and Kvothe is insufferable in a way I think is intentional. Still waiting, like everyone else.",
  },
  {
    id: "demo-sapiens",
    slug: "sapiens",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    coverImage: null,
    spineColor: "#8a6236",
    accentColor: "#3d2a12",
    pages: 443,
    rating: 4,
    status: "Read",
    genres: ["History", "Anthropology"],
    dateRead: "2025-03-11",
    summary: doc(
      p(
        "Best read as a provocation rather than a textbook. The claim that does stay with me: money, nations and corporations are all the same technology — shared fiction that lets strangers cooperate at scale.",
      ),
      quote("Fiction has enabled us not merely to imagine things, but to do so collectively."),
    ),
  },
  {
    id: "demo-the-left-hand-of-darkness",
    slug: "the-left-hand-of-darkness",
    title: "The Left Hand of Darkness",
    author: "Ursula K. Le Guin",
    coverImage: null,
    spineColor: "#26343d",
    accentColor: "#c2ab6d",
    pages: 304,
    rating: 5,
    status: "Read",
    genres: ["Science Fiction", "Classics"],
    dateRead: "2026-04-06",
    summary: doc(
      p(
        "Two people dragging a sledge across a glacier, and somewhere in that crossing the entire argument of the novel quietly lands.",
      ),
      quote("Light is the left hand of darkness, and darkness the right hand of light."),
      p("Le Guin builds the anthropology first and lets the plot be the consequence. Nobody does it better."),
    ),
  },
  {
    id: "demo-refactoring",
    slug: "refactoring",
    title: "Refactoring",
    author: "Martin Fowler",
    coverImage: null,
    spineColor: "#1c1815",
    accentColor: "#b99a49",
    pages: 448,
    rating: 4,
    status: "Read",
    genres: ["Software", "Craft"],
    dateRead: "2025-10-27",
    summary: doc(
      p("A catalogue, not a narrative — which is exactly why it works as a reference you reach for mid-change."),
      bullets(
        "If a refactor needs a big-bang commit, it is not a refactor.",
        "Tests are the seatbelt; without them you are just editing.",
        "Naming is the cheapest refactor available and the one most often skipped.",
      ),
    ),
  },
  {
    id: "demo-project-hail-mary",
    slug: "project-hail-mary",
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverImage: null,
    spineColor: "#1e3a3a",
    accentColor: "#cfae5a",
    pages: 476,
    rating: 4,
    status: "Read",
    genres: ["Science Fiction"],
    dateRead: "2026-05-21",
    summary:
      "Pure competence porn with a genuinely moving friendship at the centre. The problem-solving loop is relentless and I did not mind once. Rocky is the best alien in recent fiction.",
  },
  {
    id: "demo-shape-of-a-life",
    slug: "the-creative-act",
    title: "The Creative Act",
    author: "Rick Rubin",
    coverImage: null,
    spineColor: "#cfc3a6",
    accentColor: "#5a4526",
    pages: 432,
    rating: 3,
    status: "Reading",
    genres: ["Art", "Craft"],
    dateRead: null,
    summary: doc(
      p(
        "Aphorism after aphorism, and your mileage will depend entirely on your tolerance for that form. Mine fluctuates by the page.",
      ),
      quote("The audience comes last."),
      p("Reading it slowly, a few pages at a time, which is probably the only way it works."),
    ),
  },
];
