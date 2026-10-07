import type { Book } from './books';

const KEY = 'reading-list:v1';

export function loadBooks(storage: Storage = localStorage): Book[] {
  try {
    const raw = storage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Book[]) : [];
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[], storage: Storage = localStorage): void {
  storage.setItem(KEY, JSON.stringify(books));
}
