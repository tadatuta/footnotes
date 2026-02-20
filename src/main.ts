/* ===== Footnotes — Main Entry Point ===== */

// Styles
import './styles/tokens.css';
import './styles/global.css';
import './styles/blocks/header.css';
import './styles/blocks/avatar.css';
import './styles/blocks/nav.css';
import './styles/blocks/book-card.css';
import './styles/blocks/book-table.css';
import './styles/blocks/rating.css';
import './styles/blocks/search.css';
import './styles/blocks/book-form.css';
import './styles/blocks/button.css';
import './styles/blocks/settings-sheet.css';
import './styles/blocks/stats.css';
import './styles/blocks/login.css';
import './styles/blocks/screen.css';

// Modules
import { isAuthenticated, getCurrentUser } from './auth';
import { loadUserData, isUnauthorizedError } from './api';
import { setBooks, setUser } from './store';
import { initRouter, navigateTo } from './router';
import { createLogger } from './logger';

// Screens
import { renderMainScreen } from './screens/main';
import { renderAddBookScreen } from './screens/add-book';
import { renderEditBookScreen } from './screens/edit-book';
import { renderStatsScreen } from './screens/stats';
import { renderLoginScreen } from './screens/login';

import type { Route } from './types';

const log = createLogger('main');

async function init(): Promise<void> {
    log.info('Footnotes app initializing...');

    const app = document.getElementById('app');
    if (!app) {
        log.error('Root #app element not found');
        return;
    }

    // Check auth
    if (!isAuthenticated()) {
        log.info('User not authenticated, showing login');
        initRouter((route) => renderRoute(app, route));
        navigateTo({ name: 'login' });
        return;
    }

    // Set user in store
    const user = getCurrentUser();
    setUser(user);
    log.info(`User authenticated: ${user?.first_name} (${user?.id})`);

    // Load data from backend
    try {
        const data = await loadUserData();
        setBooks(data.books || []);
        log.info(`Loaded ${data.books?.length ?? 0} books from backend`);
    } catch (e) {
        if (isUnauthorizedError(e)) {
            log.info('Initial load aborted due to unauthorized session');
            return;
        }

        log.error('Failed to load initial data', e);
        setBooks([]);
    }

    // Init router
    initRouter((route) => renderRoute(app, route));
}

function renderRoute(app: HTMLElement, route: Route): void {
    // Cleanup previous screen if needed
    const cleanup = (app as unknown as Record<string, unknown>)['__cleanup'];
    if (typeof cleanup === 'function') {
        cleanup();
        delete (app as unknown as Record<string, unknown>)['__cleanup'];
    }

    log.debug(`Rendering route: ${route.name}`);

    switch (route.name) {
        case 'main':
            renderMainScreen(app);
            break;
        case 'add':
            renderAddBookScreen(app);
            break;
        case 'edit':
            renderEditBookScreen(app, route.bookId);
            break;
        case 'stats':
            renderStatsScreen(app);
            break;
        case 'login':
            renderLoginScreen(app);
            break;
        default:
            log.warn(`Unknown route, redirecting to main`);
            renderMainScreen(app);
    }
}

// Boot
init().catch((e) => {
    log.error('Failed to initialize app', e);
});
