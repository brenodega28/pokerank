"use client";

import { useSyncExternalStore } from "react";
import { emptyBoards, parseBoards, type Boards } from "@/lib/boards";

const STORAGE_KEY = "tierdex:boards:v1";
const SERVER_SNAPSHOT = emptyBoards();

const listeners = new Set<() => void>();
let cachedBoards: Boards | null = null;

function readStoredBoards(): Boards {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? parseBoards(JSON.parse(raw)) : emptyBoards();
  } catch {
    return emptyBoards();
  }
}

function getSnapshot(): Boards {
  cachedBoards ??= readStoredBoards();
  return cachedBoards;
}

function getServerSnapshot(): Boards {
  return SERVER_SNAPSHOT;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  cachedBoards = null;
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

export function updateBoards(update: (boards: Boards) => Boards) {
  cachedBoards = update(getSnapshot());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedBoards));
  } catch {}
  notify();
}

export function useBoards(): Boards {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
