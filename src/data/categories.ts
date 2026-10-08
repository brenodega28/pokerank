export const CATEGORY_IDS = ["pokedex", "region", "story", "soundtrack"] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type Category = {
  id: CategoryId;
  label: string;
  hint: string;
};

export const CATEGORIES: readonly Category[] = [
  { id: "pokedex", label: "Pokédex", hint: "The roster you can catch" },
  { id: "region", label: "Region", hint: "Map, towns and routes" },
  { id: "story", label: "Story", hint: "Plot, characters and pacing" },
  { id: "soundtrack", label: "Soundtrack", hint: "Music and sound" },
];

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}
