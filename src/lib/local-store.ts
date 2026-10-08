"use client";

import { useSyncExternalStore } from "react";

export type LocalStore<T> = {
  use: () => T;
  update: (change: (current: T) => T) => void;
};

export function createLocalStore<T>(key: string, parse: (value: unknown) => T, empty: T): LocalStore<T> {
  const listeners = new Set<() => void>();
  let cached: T | null = null;

  const read = (): T => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? parse(JSON.parse(raw)) : empty;
    } catch {
      return empty;
    }
  };

  const getSnapshot = (): T => {
    cached ??= read();
    return cached;
  };

  const notify = () => listeners.forEach((listener) => listener());

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== key) return;
    cached = null;
    notify();
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if (listeners.size === 1) window.addEventListener("storage", handleStorage);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
    };
  };

  return {
    use: () => useSyncExternalStore(subscribe, getSnapshot, () => empty),
    update: (change) => {
      cached = change(getSnapshot());
      try {
        window.localStorage.setItem(key, JSON.stringify(cached));
      } catch {}
      notify();
    },
  };
}
