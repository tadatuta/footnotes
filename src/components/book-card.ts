/* ===== Footnotes — Book Card Component ===== */

import { icons } from '../icons';
import { navigateTo } from '../router';
import { renderRating } from './rating';
import type { Book } from '../types';

export function renderBookCard(book: Book): HTMLElement {
    const card = document.createElement('article');
    card.className = 'book-card';
    card.setAttribute('data-book-id', book.id);

    // Cover
    const cover = document.createElement('div');
    cover.className = 'book-card__cover';

    if (book.coverUrl) {
        const img = document.createElement('img');
        img.className = 'book-card__cover-img';
        img.src = book.coverUrl;
        img.alt = book.title;
        img.loading = 'lazy';
        img.onerror = () => {
            img.remove();
            const placeholder = document.createElement('div');
            placeholder.className = 'book-card__cover-placeholder';
            placeholder.textContent = icons.bookPlaceholder;
            cover.appendChild(placeholder);
        };
        cover.appendChild(img);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'book-card__cover-placeholder';
        placeholder.textContent = icons.bookPlaceholder;
        cover.appendChild(placeholder);
    }

    card.appendChild(cover);

    // Info
    const info = document.createElement('div');
    info.className = 'book-card__info';

    const title = document.createElement('h3');
    title.className = 'book-card__title';
    title.textContent = book.title;
    info.appendChild(title);

    const author = document.createElement('p');
    author.className = 'book-card__author';
    author.textContent = book.author;
    info.appendChild(author);

    const meta = document.createElement('div');
    meta.className = 'book-card__meta';

    if (book.year) {
        const year = document.createElement('span');
        year.className = 'book-card__year';
        year.textContent = String(book.year);
        meta.appendChild(year);
    }

    const rating = renderRating({ value: book.rating });
    meta.appendChild(rating);

    info.appendChild(meta);
    card.appendChild(info);

    // Click handler — navigate to edit screen
    card.addEventListener('click', () => {
        navigateTo({ name: 'edit', bookId: book.id });
    });

    return card;
}
