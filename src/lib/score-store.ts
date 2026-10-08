"use client";

import { createLocalStore } from "@/lib/local-store";
import { parseScores, type Scores } from "@/lib/scores";

const store = createLocalStore<Scores>("tierdex:scores:v1", parseScores, {});

export const useScores = store.use;
export const updateScores = store.update;
