import { LibraryScene } from "@/components/library/library-scene";
import { getBooks } from "@/lib/storyblok";

/** Storyblok content is revalidated on a timer and by the webhook in `api/revalidate`. */
export const revalidate = 60;

export default async function HomePage() {
  const { books, source } = await getBooks();

  return <LibraryScene books={books} source={source} />;
}
