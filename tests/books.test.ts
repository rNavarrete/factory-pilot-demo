import { addBook, bookCountLabel, removeBook, removeFinished, renameBook, setStatus } from '../src/books';
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

describe('renameBook', () => {
  // Newest first: [Emma (reading), Dune (to-read)]
  function twoBooks() {
    const books = addBook(addBook([], 'Dune', 'Frank Herbert', now), 'Emma', 'Jane Austen', now);
    return setStatus(books, books[0].id, 'reading', now);
  }

  it('ac1: returns a new array where the book has the given title and author', () => {
    const books = twoBooks();
    const result = renameBook(books, books[1].id, 'Dune Messiah', 'F. Herbert');
    expect(result).not.toBe(books);
    expect(result[1].title).toBe('Dune Messiah');
    expect(result[1].author).toBe('F. Herbert');
  });

  it('ac2: leaves other books and other fields of the renamed book unchanged', () => {
    const books = twoBooks();
    const result = renameBook(books, books[0].id, 'Persuasion', 'J. Austen');
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual(books[1]);
    expect(result[0]).toEqual({ ...books[0], title: 'Persuasion', author: 'J. Austen' });
  });

  it('ac3: does not change the array it is given or any book in it', () => {
    const books = twoBooks();
    const snapshot = structuredClone(books);
    const firstBook = books[0];
    renameBook(books, books[0].id, 'Persuasion', 'J. Austen');
    expect(books).toEqual(snapshot);
    expect(books[0]).toBe(firstBook);
  });

  it('ac4: throws an Error when the title is empty', () => {
    const books = twoBooks();
    expect(() => renameBook(books, books[0].id, '', 'Jane Austen')).toThrow(Error);
  });

  it('ac5: throws an Error when the author is empty', () => {
    const books = twoBooks();
    expect(() => renameBook(books, books[0].id, 'Emma', '')).toThrow(Error);
  });

  it('ac6: throws an Error when no book has that id', () => {
    const books = twoBooks();
    expect(() => renameBook(books, 'missing-id', 'Emma', 'Jane Austen')).toThrow(Error);
    expect(() => renameBook([], 'missing-id', 'Emma', 'Jane Austen')).toThrow(Error);
  });
});

describe('removeBook', () => {
  it('removes only the given book', () => {
    const books = addBook(addBook([], 'Dune', 'Frank Herbert', now), 'Emma', 'Jane Austen', now);
    expect(removeBook(books, books[0].id).map((b) => b.title)).toEqual(['Dune']);
  });
});

describe('removeFinished', () => {
  // Newest first: [Ulysses (done), Emma (to-read), Dune (reading)]
  function threeBooks() {
    const books = addBook(
      addBook(addBook([], 'Dune', 'Frank Herbert', now), 'Emma', 'Jane Austen', now),
      'Ulysses',
      'James Joyce',
      now,
    );
    return setStatus(setStatus(books, books[0].id, 'done', now), books[2].id, 'reading', now);
  }

  it('ac1: keeps only books that are not done, in their original order', () => {
    const books = threeBooks();
    expect(removeFinished(books).map((b) => b.title)).toEqual(['Emma', 'Dune']);
    const twoDone = setStatus(books, books[1].id, 'done', now);
    expect(removeFinished(twoDone).map((b) => b.title)).toEqual(['Dune']);
    expect(removeFinished([])).toEqual([]);
  });

  it('ac2: does not change the array it is given', () => {
    const books = threeBooks();
    const snapshot = structuredClone(books);
    const result = removeFinished(books);
    expect(result).not.toBe(books);
    expect(books).toEqual(snapshot);
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

describe('bookCountLabel', () => {
  it('says "1 book" for one and "N books" for two or more (ac1)', () => {
    expect(bookCountLabel(1)).toBe('1 book');
    expect(bookCountLabel(2)).toBe('2 books');
    expect(bookCountLabel(42)).toBe('42 books');
  });

  it('says "No books yet" for an empty list (ac2)', () => {
    expect(bookCountLabel(0)).toBe('No books yet');
  });

  it('throws for a negative or fractional count (ac3)', () => {
    expect(() => bookCountLabel(-1)).toThrow();
    expect(() => bookCountLabel(1.5)).toThrow();
  });
});
