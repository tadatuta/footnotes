/* ===== Footnotes — Main Screen ===== */

import { renderHeader, renderPageTitle } from '../components/header';
import { renderNav } from '../components/nav';
import { renderSearch } from '../components/search';
import { renderBookCard } from '../components/book-card';
import { renderBookTable } from '../components/book-table';
import { openSettingsSheet } from '../components/settings-sheet';
import { getFilteredBooks, setSearchQuery, setViewMode, getState, subscribe } from '../store';
import { createLogger } from '../logger';
import { icons } from '../icons';

const log = createLogger('screen:main');

export function renderMainScreen(container: HTMLElement): void {
    log.info('Rendering main screen');
    container.innerHTML = '';

    const screen = document.createElement('div');
    screen.className = 'screen';

    // Header container setup for adding view toggle
    const headerContainer = document.createElement('div');
    headerContainer.className = 'header-container';

    const header = renderHeader({
        title: 'Мои находки',
        showAvatar: true,
        showSettings: true,
        onSettingsClick: () => {
            log.debug('Settings button clicked');
            openSettingsSheet();
        },
    });

    // Add view toggle next to settings
    const toggleViewBtn = document.createElement('button');
    toggleViewBtn.className = 'settings-button view-toggle-button';
    toggleViewBtn.setAttribute('aria-label', 'Переключить вид');

    // Initial icon state
    toggleViewBtn.innerHTML = getState().viewMode === 'list' ? icons.tableView : icons.listView;

    toggleViewBtn.addEventListener('click', () => {
        const newMode = getState().viewMode === 'list' ? 'table' : 'list';
        setViewMode(newMode);
        // The subscribe callback will handle the re-render.
    });

    // Style tweak to inject the toggle next to the settings button cleanly.
    // Assuming right side of header.
    const headerRight = header.querySelector('.header__right');
    if (headerRight) {
        headerRight.insertBefore(toggleViewBtn, headerRight.firstChild);
    }

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
        const state = getState();

        bookList.innerHTML = '';

        // Update view toggle icon
        if (toggleViewBtn) {
            toggleViewBtn.innerHTML = state.viewMode === 'list' ? icons.tableView : icons.listView;
        }

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

        if (state.viewMode === 'list') {
            bookList.className = 'screen__book-list screen__book-list--list';
            books.forEach((book) => {
                bookList.appendChild(renderBookCard(book));
            });
        } else {
            bookList.className = 'screen__book-list screen__book-list--table';
            bookList.appendChild(renderBookTable(books));
        }

        log.debug(`Rendered ${books.length} books in ${state.viewMode} mode`);
    }

    updateBookList();

    // Subscribe to state changes
    const unsubscribe = subscribe(() => {
        updateBookList();
    });

    // Cleanup on re-render (store reference for potential future use)
    (container as unknown as Record<string, unknown>)['__cleanup'] = unsubscribe;
}
