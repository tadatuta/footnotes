/* ===== Footnotes — Edit Book Screen ===== */

import { renderHeader } from '../components/header';
import { renderNav } from '../components/nav';
import { renderBookForm } from '../components/book-form';
import { getBookById, updateBook, deleteBook, getState } from '../store';
import { saveUserData, isUnauthorizedError } from '../api';
import { navigateTo } from '../router';
import { createLogger } from '../logger';

const log = createLogger('screen:edit-book');

export function renderEditBookScreen(container: HTMLElement, bookId: string): void {
    log.info(`Rendering edit book screen for ID: ${bookId}`);
    container.innerHTML = '';

    const screen = document.createElement('div');
    screen.className = 'screen';

    const book = getBookById(bookId);

    if (!book) {
        log.warn(`Book not found: ${bookId}`);
        navigateTo({ name: 'main' });
        return;
    }

    // Header with back button
    const header = renderHeader({
        title: 'Редактирование',
        showBack: true,
        onBackClick: () => navigateTo({ name: 'main' }),
    });
    screen.appendChild(header);

    // Subtitle
    const subtitle = document.createElement('h1');
    subtitle.className = 'header__subtitle';
    subtitle.textContent = 'Редактирование';
    subtitle.style.padding = `0 var(--spacing-base) var(--spacing-md)`;
    screen.appendChild(subtitle);

    // Content
    const content = document.createElement('div');
    content.className = 'screen__content';

    const form = renderBookForm({
        mode: 'edit',
        book,
        onSubmit: async (data) => {
            log.info(`Updating book: "${data.title}"`);
            updateBook(bookId, data);

            // Save to backend
            try {
                const state = getState();
                await saveUserData({ books: state.books });
            } catch (e) {
                if (isUnauthorizedError(e)) {
                    log.warn('Stopping edit flow due to unauthorized session');
                    return;
                }

                log.error('Failed to save to backend', e);
            }

            navigateTo({ name: 'main' });
        },
        onDelete: async () => {
            log.info(`Deleting book: ${bookId}`);
            deleteBook(bookId);

            // Save to backend
            try {
                const state = getState();
                await saveUserData({ books: state.books });
            } catch (e) {
                if (isUnauthorizedError(e)) {
                    log.warn('Stopping delete flow due to unauthorized session');
                    return;
                }

                log.error('Failed to save to backend', e);
            }

            navigateTo({ name: 'main' });
        },
    });

    content.appendChild(form);
    screen.appendChild(content);

    // Bottom nav
    screen.appendChild(renderNav());

    container.appendChild(screen);
}
