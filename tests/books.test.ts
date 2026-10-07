import { addBook, removeBook, setStatus } from '../src/books';
import { loadBooks, saveBooks } from '../src/storage';

const now = new Date('2026-03-15T12:00:00Z');

describe('addBook', () => {
  it('adds a new to-read book at the top', () => {
    const books = addBook(addBook([], 'Dune', 'Frank Herbert', now), 'Emma', 'Jane Austen', now);
    expect(books.map((b) => b.title)).toEqual(['Emma', 'Dune']);
    expect(books[0].status).toBe('to-read');
    expect(books[0].addedAt).toBe(now.toISOString());
  });

  it('rejects a missing title or author', () => {
    expect(() => addBook([], '', 'Someone')).toThrow();
    expect(() => addBook([], 'Something', '')).toThrow();
  });
});

describe('setStatus', () => {
  it('sets finishedAt when a book is marked done and clears it otherwise', () => {
    const [book] = addBook([], 'Dune', 'Frank Herbert', now);
    const done = setStatus([book], book.id, 'done', now);
    expect(done[0].finishedAt).toBe(now.toISOString());
    const reading = setStatus(done, book.id, 'reading', now);
    expect(reading[0].finishedAt).toBeUndefined();
  });
});

describe('removeBook', () => {
  it('removes only the given book', () => {
    const books = addBook(addBook([], 'Dune', 'Frank Herbert', now), 'Emma', 'Jane Austen', now);
    expect(removeBook(books, books[0].id).map((b) => b.title)).toEqual(['Dune']);
  });
});

describe('storage', () => {
  it('round-trips books and survives corrupt data', () => {
    const books = addBook([], 'Dune', 'Frank Herbert', now);
    saveBooks(books);
    expect(loadBooks()).toEqual(books);
    localStorage.setItem('reading-list:v1', '{not json');
    expect(loadBooks()).toEqual([]);
  });
});
