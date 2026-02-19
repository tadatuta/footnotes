/* ===== Footnotes — Book Table Component ===== */

import { navigateTo } from '../router';
import type { Book, SortField, SortDirection } from '../types';
import { setSort, getState } from '../store';
import { createLogger } from '../logger';

const log = createLogger('book-table');

function renderSortIcon(field: SortField, currentField: SortField, currentDirection: SortDirection): string {
    if (field !== currentField) return '';
    return currentDirection === 'asc' ? ' ↑' : ' ↓';
}

function handleSortClick(field: SortField) {
    const state = getState();
    let newDirection: SortDirection = 'asc';

    if (state.sortField === field && state.sortDirection === 'asc') {
        newDirection = 'desc';
    }

    log.debug(`Sorting by ${field} ${newDirection}`);
    setSort(field, newDirection);
}

export function renderBookTable(books: Book[]): HTMLElement {
    const state = getState();
    const container = document.createElement('div');
    container.className = 'book-table-container';

    if (books.length === 0) {
        return container; // Should be handled by parent, but safe-guarding
    }

    const table = document.createElement('table');
    table.className = 'book-table';

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const columns: { label: string; field: SortField }[] = [
        { label: 'Автор', field: 'author' },
        { label: 'Название', field: 'title' },
        { label: 'Год', field: 'year' },
        { label: 'Оценка', field: 'rating' },
        { label: 'Добавлено', field: 'createdAt' },
    ];

    columns.forEach(col => {
        const th = document.createElement('th');
        th.className = 'book-table__th';
        th.textContent = col.label + renderSortIcon(col.field, state.sortField, state.sortDirection);
        th.addEventListener('click', () => handleSortClick(col.field));
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');

    books.forEach(book => {
        const tr = document.createElement('tr');
        tr.className = 'book-table__row';
        tr.addEventListener('click', () => {
            navigateTo({ name: 'edit', bookId: book.id });
        });

        // Author
        const tdAuthor = document.createElement('td');
        tdAuthor.className = 'book-table__td';
        tdAuthor.textContent = book.author;
        tr.appendChild(tdAuthor);

        // Title
        const tdTitle = document.createElement('td');
        tdTitle.className = 'book-table__td';
        tdTitle.textContent = book.title;
        tr.appendChild(tdTitle);

        // Year
        const tdYear = document.createElement('td');
        tdYear.className = 'book-table__td book-table__td--center';
        tdYear.textContent = book.year ? String(book.year) : '—';
        tr.appendChild(tdYear);

        // Rating
        const tdRating = document.createElement('td');
        tdRating.className = 'book-table__td book-table__td--center';
        tdRating.textContent = book.rating > 0 ? '★'.repeat(book.rating) : '—';
        tr.appendChild(tdRating);

        // Date Added
        const tdDate = document.createElement('td');
        tdDate.className = 'book-table__td book-table__td--right';
        const dateObj = new Date(book.createdAt);
        tdDate.textContent = dateObj.toLocaleDateString('ru-RU');
        tr.appendChild(tdDate);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    return container;
}
