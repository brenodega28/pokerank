"use client";

import { createLocalStore } from "@/lib/local-store";
import { NO_SCORES, isScoringMode, parseScores, type Scores, type ScoringMode } from "@/lib/scores";

const scoreStore = createLocalStore<Scores>("pokeranked:scores:v2", parseScores, NO_SCORES);

export const useScores = scoreStore.use;
export const updateScores = scoreStore.update;

const modeStore = createLocalStore<ScoringMode>(
  "pokeranked:mode:v1",
  (value) => (isScoringMode(value) ? value : "simple"),
  "simple",
);

export const useScoringMode = modeStore.use;

export function setScoringMode(mode: ScoringMode) {
  modeStore.update(() => mode);
}
