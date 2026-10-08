export type Game = {
  id: string;
  code: string;
  name: string;
  gen: string;
  year: number;
  region: string;
  platform: string;
  c1: string;
  c2: string;
};

export const GAMES: readonly Game[] = [
  { id: "rb", code: "RB", name: "Red & Blue", gen: "I", year: 1996, region: "Kanto", platform: "Game Boy", c1: "#C8323C", c2: "#2E5FB8" },
  { id: "y", code: "Y", name: "Yellow", gen: "I", year: 1998, region: "Kanto", platform: "Game Boy", c1: "#E8C228", c2: "#E8C228" },
  { id: "gs", code: "GS", name: "Gold & Silver", gen: "II", year: 1999, region: "Johto & Kanto", platform: "Game Boy Color", c1: "#C9A43A", c2: "#A9AEB6" },
  { id: "c", code: "C", name: "Crystal", gen: "II", year: 2000, region: "Johto & Kanto", platform: "Game Boy Color", c1: "#5FC4D9", c2: "#5FC4D9" },
  { id: "rs", code: "RS", name: "Ruby & Sapphire", gen: "III", year: 2002, region: "Hoenn", platform: "Game Boy Advance", c1: "#B3203A", c2: "#1F4FA3" },
  { id: "frlg", code: "FRLG", name: "FireRed & LeafGreen", gen: "III", year: 2004, region: "Kanto", platform: "Game Boy Advance", c1: "#E0562B", c2: "#4FA34A" },
  { id: "e", code: "E", name: "Emerald", gen: "III", year: 2004, region: "Hoenn", platform: "Game Boy Advance", c1: "#1E9E6A", c2: "#1E9E6A" },
  { id: "dp", code: "DP", name: "Diamond & Pearl", gen: "IV", year: 2006, region: "Sinnoh", platform: "Nintendo DS", c1: "#6D8FD6", c2: "#E2A6B8" },
  { id: "pt", code: "Pt", name: "Platinum", gen: "IV", year: 2008, region: "Sinnoh", platform: "Nintendo DS", c1: "#8A8F99", c2: "#8A8F99" },
  { id: "hgss", code: "HGSS", name: "HeartGold & SoulSilver", gen: "IV", year: 2009, region: "Johto & Kanto", platform: "Nintendo DS", c1: "#D4A82A", c2: "#B8BFC9" },
  { id: "bw", code: "BW", name: "Black & White", gen: "V", year: 2010, region: "Unova", platform: "Nintendo DS", c1: "#22232A", c2: "#EDEBE4" },
  { id: "b2w2", code: "B2W2", name: "Black 2 & White 2", gen: "V", year: 2012, region: "Unova", platform: "Nintendo DS", c1: "#2B3A55", c2: "#E8DCCB" },
  { id: "xy", code: "XY", name: "X & Y", gen: "VI", year: 2013, region: "Kalos", platform: "Nintendo 3DS", c1: "#2F6DB5", c2: "#C62E3F" },
  { id: "oras", code: "ORAS", name: "Omega Ruby & Alpha Sapphire", gen: "VI", year: 2014, region: "Hoenn", platform: "Nintendo 3DS", c1: "#A81F2E", c2: "#234A9C" },
  { id: "sm", code: "SM", name: "Sun & Moon", gen: "VII", year: 2016, region: "Alola", platform: "Nintendo 3DS", c1: "#F0912C", c2: "#6B4FB3" },
  { id: "usum", code: "USUM", name: "Ultra Sun & Ultra Moon", gen: "VII", year: 2017, region: "Alola", platform: "Nintendo 3DS", c1: "#E8601F", c2: "#4A3A9E" },
  { id: "lgpe", code: "LGPE", name: "Let's Go, Pikachu! & Eevee!", gen: "VII", year: 2018, region: "Kanto", platform: "Nintendo Switch", c1: "#F2C230", c2: "#A8703C" },
  { id: "swsh", code: "SwSh", name: "Sword & Shield", gen: "VIII", year: 2019, region: "Galar", platform: "Nintendo Switch", c1: "#2E8FD0", c2: "#C2306A" },
  { id: "bdsp", code: "BDSP", name: "Brilliant Diamond & Shining Pearl", gen: "VIII", year: 2021, region: "Sinnoh", platform: "Nintendo Switch", c1: "#4C7BD6", c2: "#D98AB0" },
  { id: "la", code: "LA", name: "Legends: Arceus", gen: "VIII", year: 2022, region: "Hisui", platform: "Nintendo Switch", c1: "#C9B37A", c2: "#C9B37A" },
  { id: "sv", code: "SV", name: "Scarlet & Violet", gen: "IX", year: 2022, region: "Paldea", platform: "Nintendo Switch", c1: "#D2462F", c2: "#7C3FA8" },
  { id: "za", code: "Z-A", name: "Legends: Z-A", gen: "IX", year: 2025, region: "Kalos", platform: "Nintendo Switch", c1: "#4A9B6E", c2: "#4A9B6E" },
];

const gamesById = new Map(GAMES.map((game) => [game.id, game]));

export function findGame(id: string): Game | undefined {
  return gamesById.get(id);
}

export function isGameId(id: string): boolean {
  return gamesById.has(id);
}

export function gameMetaLine(game: Game): string {
  return `GEN ${game.gen} · ${game.platform.toUpperCase()} · ${game.year}`;
}
