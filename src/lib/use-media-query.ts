"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Matches a media query on the client.
 *
 * `useSyncExternalStore` keeps this hydration-safe: the server snapshot is
 * always `false`, and the real value arrives on the first client render.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
