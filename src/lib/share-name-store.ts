"use client";

import { createLocalStore } from "@/lib/local-store";
import { MAX_NAME_LENGTH } from "@/lib/share-link";

const store = createLocalStore<string>(
  "pokeranked:share-name:v1",
  (value) => (typeof value === "string" ? value.slice(0, MAX_NAME_LENGTH) : ""),
  "",
);

export const useShareName = store.use;

export function setShareName(name: string) {
  store.update(() => name.slice(0, MAX_NAME_LENGTH));
}
