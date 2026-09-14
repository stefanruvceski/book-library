# Storyblok setup

The app reads a single content type. Nothing else in the space matters to it.

## 1. Create the `book` content type

In **Block Library → New block**, create a *Content type* called `book` with these fields:

| Field name     | Storyblok field type              | Notes |
| -------------- | --------------------------------- | ----- |
| `title`        | Text                              | Falls back to the story name if empty. |
| `author`       | Text                              | |
| `cover_image`  | Asset (images only)               | Optional — without it the app draws a typographic cover from the two colours below. |
| `spine_color`  | Native color picker *(or Text)*   | Hex, e.g. `#1e293b`. Defaults to `#1e293b`. |
| `accent_color` | Native color picker *(or Text)*   | Hex, e.g. `#f59e0b`. Used for foil stamping, rules and the reading glow. |
| `pages`        | Number                            | Drives the spine's thickness and height on the shelf. |
| `rating`       | Number                            | `0`–`5`, halves allowed (`4.5`). |
| `status`       | Single-Option (self)              | `Read`, `Reading`, `To Read`, `Abandoned`. |
| `genres`       | Multi-Options (self)              | Becomes the genre filter. A comma-separated Text field also works. |
| `date_read`    | Date/Time (date only)             | Sorts the default "Recently read" view. |
| `summary`      | Richtext *(or Textarea/Markdown)* | Your notes. Rendered on the right-hand page. |

Both the color-picker object (`{ "color": "#1e293b" }`) and a plain hex string are accepted, so
either field type works. Anything that isn't a valid hex value falls back to the defaults.

## 2. Put the stories in a folder

Create a folder called `books` and add one story per book. Override the folder name with
`STORYBLOK_BOOKS_FOLDER` if you prefer something else.

## 3. Point the app at the space

Copy `.env.example` to `.env.local` and fill in a Content Delivery API token
(**Settings → Access Tokens**). Use a *Preview* token with `STORYBLOK_VERSION=draft` while
authoring, a *Public* token with `published` in production. Regional spaces need
`STORYBLOK_API_URL` set to the matching host.

Until a token is present the app serves the demo shelf in `src/lib/mock-books.ts`, and the footer
says so.

## 4. Publish without redeploying

Set `STORYBLOK_REVALIDATE_SECRET`, then add a webhook in **Settings → Webhooks** for
*Story published* and *Story unpublished*:

```
https://<your-host>/api/revalidate?secret=<STORYBLOK_REVALIDATE_SECRET>
```

The endpoint purges the `books` cache tag and returns `401` for a wrong secret, `501` when the
secret is not configured at all. Content also revalidates on its own every 60 seconds.

## Example payload

```json
{
  "name": "Atomic Habits",
  "slug": "atomic-habits",
  "content": {
    "component": "book",
    "title": "Atomic Habits",
    "author": "James Clear",
    "cover_image": { "filename": "https://a.storyblok.com/f/.../cover.jpg", "alt": "Atomic Habits" },
    "spine_color": "#1e293b",
    "accent_color": "#f59e0b",
    "pages": 320,
    "rating": 5,
    "status": "Read",
    "genres": ["Self-Help", "Psychology"],
    "date_read": "2026-02-15",
    "summary": { "type": "doc", "content": [] }
  }
}
```
