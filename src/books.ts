export type Status = 'to-read' | 'reading' | 'done';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: Status;
  addedAt: string; // ISO timestamp
  finishedAt?: string; // ISO timestamp, set when status becomes 'done'
}

export const STATUSES: Status[] = ['to-read', 'reading', 'done'];

export function addBook(books: Book[], title: string, author: string, now = new Date()): Book[] {
  if (!title || !author) {
    throw new Error('Title and author are required');
  }
  const book: Book = {
    id: `${now.getTime()}-${books.length}`,
    title,
    author,
    status: 'to-read',
    addedAt: now.toISOString(),
  };
  return [book, ...books];
}

export function setStatus(books: Book[], id: string, status: Status, now = new Date()): Book[] {
  return books.map((b) => {
    if (b.id !== id) return b;
    const finishedAt = status === 'done' ? now.toISOString() : undefined;
    return { ...b, status, finishedAt };
  });
}

export function renameBook(books: Book[], id: string, title: string, author: string): Book[] {
  if (!title || !author) {
    throw new Error('Title and author are required');
  }
  if (!books.some((b) => b.id === id)) {
    throw new Error(`No book with id ${id}`);
  }
  return books.map((b) => (b.id === id ? { ...b, title, author } : b));
}

export function removeBook(books: Book[], id: string): Book[] {
  return books.filter((b) => b.id !== id);
}

export function removeFinished(books: Book[]): Book[] {
  return books.filter((b) => b.status !== 'done');
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth()).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function bookCountLabel(count: number): string {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error(`Invalid book count: ${count}`);
  }
  if (count === 0) return 'No books yet';
  return count === 1 ? '1 book' : `${count} books`;
}
