"use client";

import { useSyncExternalStore } from "react";
import { parseScores, type Scores } from "@/lib/scores";

const STORAGE_KEY = "tierdex:scores:v1";
const SERVER_SNAPSHOT: Scores = {};

const listeners = new Set<() => void>();
let cachedScores: Scores | null = null;

function readStoredScores(): Scores {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? parseScores(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function getSnapshot(): Scores {
  cachedScores ??= readStoredScores();
  return cachedScores;
}

function getServerSnapshot(): Scores {
  return SERVER_SNAPSHOT;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  cachedScores = null;
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
  };
}

export function updateScores(update: (scores: Scores) => Scores) {
  cachedScores = update(getSnapshot());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedScores));
  } catch {}
  notify();
}

export function useScores(): Scores {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
