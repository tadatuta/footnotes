/* ===== Footnotes — State Store ===== */

import { createLogger } from './logger';
import type { AppState, Book, SortField, SortDirection, StateSubscriber } from './types';

const log = createLogger('store');

let state: AppState = {
    books: [],
    user: null,
    sortField: 'createdAt',
    sortDirection: 'desc',
    searchQuery: '',
};

const subscribers: Set<StateSubscriber> = new Set();

function notify(): void {
    log.debug(`Notifying ${subscribers.size} subscribers`);
    subscribers.forEach((fn) => fn(state));
}

/** Subscribe to state changes */
export function subscribe(fn: StateSubscriber): () => void {
    subscribers.add(fn);
    return () => {
        subscribers.delete(fn);
    };
}

/** Get current state (readonly snapshot) */
export function getState(): Readonly<AppState> {
    return state;
}

/** Set books list */
export function setBooks(books: Book[]): void {
    log.info(`Setting ${books.length} books`);
    state = { ...state, books };
    notify();
}

/** Add a new book */
export function addBook(book: Book): void {
    log.info(`Adding book: "${book.title}" by ${book.author}`);
    state = { ...state, books: [...state.books, book] };
    notify();
}

/** Update an existing book */
export function updateBook(id: string, updates: Partial<Book>): void {
    log.info(`Updating book ${id}`, updates);
    state = {
        ...state,
        books: state.books.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    };
    notify();
}

/** Delete a book */
export function deleteBook(id: string): void {
    log.info(`Deleting book ${id}`);
    state = {
        ...state,
        books: state.books.filter((b) => b.id !== id),
    };
    notify();
}

/** Set sort options */
export function setSort(field: SortField, direction: SortDirection): void {
    log.debug(`Setting sort: ${field} ${direction}`);
    state = { ...state, sortField: field, sortDirection: direction };
    notify();
}

/** Set search query */
export function setSearchQuery(query: string): void {
    state = { ...state, searchQuery: query };
    notify();
}

/** Set user */
export function setUser(user: AppState['user']): void {
    state = { ...state, user };
    if (user) {
        log.info(`User set: ${user.first_name} (${user.id})`);
    }
}

/** Get sorted and filtered books */
export function getFilteredBooks(): Book[] {
    let books = [...state.books];

    // Filter by search query
    if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase().trim();
        books = books.filter(
            (b) =>
                fuzzyMatch(b.title.toLowerCase(), query) ||
                fuzzyMatch(b.author.toLowerCase(), query)
        );
    }

    // Sort
    books.sort((a, b) => {
        const dir = state.sortDirection === 'asc' ? 1 : -1;
        switch (state.sortField) {
            case 'title':
                return dir * a.title.localeCompare(b.title);
            case 'author':
                return dir * a.author.localeCompare(b.author);
            case 'year':
                return dir * (a.year - b.year);
            case 'rating':
                return dir * (a.rating - b.rating);
            case 'createdAt':
            default:
                return dir * a.createdAt.localeCompare(b.createdAt);
        }
    });

    return books;
}

/** Get book by ID */
export function getBookById(id: string): Book | undefined {
    return state.books.find((b) => b.id === id);
}

/** Simple fuzzy match — checks if all characters of query appear in order in text */
function fuzzyMatch(text: string, query: string): boolean {
    let qi = 0;
    for (let ti = 0; ti < text.length && qi < query.length; ti++) {
        if (text[ti] === query[qi]) {
            qi++;
        }
    }
    return qi === query.length;
}
