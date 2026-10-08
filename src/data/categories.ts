export const CATEGORY_IDS = ["pokedex", "region", "story", "soundtrack", "progression", "difficulty", "graphics"] as const;

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
  { id: "progression", label: "Progression", hint: "Pacing, gyms and post-game" },
  { id: "difficulty", label: "Difficulty", hint: "How satisfying the challenge is" },
  { id: "graphics", label: "Graphics", hint: "Sprites, art style and animation" },
];
