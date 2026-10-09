import {
  addBook,
  formatDate,
  removeBook,
  removeFinished,
  setStatus,
  STATUSES,
  type Book,
  type Status,
} from './books';
import { loadBooks, saveBooks } from './storage';

let books: Book[] = loadBooks();

const list = document.querySelector<HTMLUListElement>('#books')!;
const form = document.querySelector<HTMLFormElement>('#add-form')!;
const error = document.querySelector<HTMLParagraphElement>('#error')!;
const summary = document.querySelector<HTMLParagraphElement>('#summary')!;
const clearFinished = document.querySelector<HTMLButtonElement>('#clear-finished')!;

function update(next: Book[]): void {
  books = next;
  saveBooks(books);
  render();
}

function render(): void {
  summary.textContent = `${books.length} book${books.length === 1 ? '' : 's'}`;
  clearFinished.disabled = !books.some((b) => b.status === 'done');
  list.replaceChildren(
    ...books.map((book) => {
      const li = document.createElement('li');
      li.dataset.id = book.id;

      const meta = document.createElement('span');
      meta.className = 'meta';
      const strong = document.createElement('strong');
      strong.textContent = book.title;
      const small = document.createElement('small');
      small.textContent = ` by ${book.author} · added ${formatDate(book.addedAt)}`;
      meta.append(strong, small);

      const select = document.createElement('select');
      select.setAttribute('aria-label', `Status of ${book.title}`);
      for (const s of STATUSES) {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        opt.selected = s === book.status;
        select.append(opt);
      }
      select.addEventListener('change', () => update(setStatus(books, book.id, select.value as Status)));

      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.addEventListener('click', () => update(removeBook(books, book.id)));

      li.append(meta, select, del);
      return li;
    }),
  );
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  try {
    update(addBook(books, String(data.get('title') ?? ''), String(data.get('author') ?? '')));
    error.textContent = '';
    form.reset();
  } catch (err) {
    error.textContent = (err as Error).message;
  }
});

clearFinished.addEventListener('click', () => update(removeFinished(books)));

render();
