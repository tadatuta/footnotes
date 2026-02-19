/* ===== Footnotes — Main Screen ===== */

import { renderHeader, renderPageTitle } from '../components/header';
import { renderNav } from '../components/nav';
import { renderSearch } from '../components/search';
import { renderBookCard } from '../components/book-card';
import { openSettingsSheet } from '../components/settings-sheet';
import { getFilteredBooks, setSearchQuery, subscribe } from '../store';
import { createLogger } from '../logger';

const log = createLogger('screen:main');

export function renderMainScreen(container: HTMLElement): void {
    log.info('Rendering main screen');
    container.innerHTML = '';

    const screen = document.createElement('div');
    screen.className = 'screen';

    // Header
    const header = renderHeader({
        title: 'Мои находки',
        showAvatar: true,
        showSettings: true,
        onSettingsClick: () => {
            log.debug('Settings button clicked');
            openSettingsSheet();
        },
    });
    screen.appendChild(header);

    // Page title
    screen.appendChild(renderPageTitle('Мои находки'));

    // Search
    const search = renderSearch({
        placeholder: 'Поиск по названию или автору',
        onInput: (query) => {
            log.debug(`Search query: "${query}"`);
            setSearchQuery(query);
        },
    });
    screen.appendChild(search);

    // Content area
    const content = document.createElement('div');
    content.className = 'screen__content';

    const bookList = document.createElement('div');
    bookList.className = 'screen__book-list';
    content.appendChild(bookList);
    screen.appendChild(content);

    // Bottom nav
    screen.appendChild(renderNav());

    container.appendChild(screen);

    // Render books
    function updateBookList(): void {
        const books = getFilteredBooks();
        bookList.innerHTML = '';

        if (books.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'screen__empty';

            const emptyIcon = document.createElement('div');
            emptyIcon.className = 'screen__empty-icon';
            emptyIcon.textContent = '📚';
            empty.appendChild(emptyIcon);

            const emptyText = document.createElement('p');
            emptyText.className = 'screen__empty-text';
            emptyText.textContent = 'Пока нет ни одной находки. Добавьте свою первую книгу!';
            empty.appendChild(emptyText);

            bookList.appendChild(empty);
            return;
        }

        books.forEach((book) => {
            bookList.appendChild(renderBookCard(book));
        });

        log.debug(`Rendered ${books.length} book cards`);
    }

    updateBookList();

    // Subscribe to state changes
    const unsubscribe = subscribe(() => {
        updateBookList();
    });

    // Cleanup on re-render (store reference for potential future use)
    (container as unknown as Record<string, unknown>)['__cleanup'] = unsubscribe;
}
