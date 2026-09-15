import { LibraryScene } from "@/components/library/library-scene";
import { loadScene } from "@/lib/scene";
import { getBooks } from "@/lib/storyblok";

/** Storyblok content is revalidated on a timer and by the webhook in `api/revalidate`. */
export const revalidate = 60;

export default async function HomePage() {
  const [{ books, source }, scene] = await Promise.all([getBooks(), loadScene()]);

  return <LibraryScene books={books} source={source} scene={scene} />;
}
