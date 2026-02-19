/* ===== Footnotes — Add Book Screen ===== */

import { renderHeader } from '../components/header';
import { renderNav } from '../components/nav';
import { renderBookForm } from '../components/book-form';
import { addBook, updateBook, getState } from '../store';
import { saveUserData } from '../api';
import { fetchBookCover } from '../google-books';
import { navigateTo } from '../router';
import { createLogger } from '../logger';
import type { Book } from '../types';

const log = createLogger('screen:add-book');

export function renderAddBookScreen(container: HTMLElement): void {
    log.info('Rendering add book screen');
    container.innerHTML = '';

    const screen = document.createElement('div');
    screen.className = 'screen';

    // Header with back button
    const header = renderHeader({
        title: 'Новая находка',
        showBack: true,
        onBackClick: () => navigateTo({ name: 'main' }),
    });
    screen.appendChild(header);

    // Subtitle
    const subtitle = document.createElement('h1');
    subtitle.className = 'header__subtitle';
    subtitle.textContent = 'Новая находка';
    subtitle.style.padding = `0 var(--spacing-base) var(--spacing-md)`;
    screen.appendChild(subtitle);

    // Content
    const content = document.createElement('div');
    content.className = 'screen__content';

    const form = renderBookForm({
        mode: 'create',
        onSubmit: async (data) => {
            const id = crypto.randomUUID();
            const createdAt = new Date().toISOString();

            const newBook: Book = {
                ...data,
                id,
                createdAt,
            };

            log.info(`Creating book: "${newBook.title}"`);
            addBook(newBook);

            // Save to backend
            try {
                const state = getState();
                await saveUserData({ books: state.books });
            } catch (e) {
                log.error('Failed to save to backend', e);
            }

            // Try to fetch cover in background
            fetchBookCover(data.title, data.author).then((coverUrl) => {
                if (coverUrl) {
                    log.info(`Cover fetched for "${data.title}": ${coverUrl}`);
                    updateBook(id, { coverUrl });
                    // Save updated data
                    const state = getState();
                    saveUserData({ books: state.books }).catch((err: unknown) => {
                        log.error('Failed to save cover update', err);
                    });
                }
            }).catch((e: unknown) => {
                log.warn('Cover fetch failed', e);
            });

            navigateTo({ name: 'main' });
        },
    });

    content.appendChild(form);
    screen.appendChild(content);

    // Bottom nav
    screen.appendChild(renderNav());

    container.appendChild(screen);
}
