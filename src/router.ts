/* ===== Footnotes — Hash Router ===== */

import { createLogger } from './logger';
import type { Route } from './types';

const log = createLogger('router');

type RouteHandler = (route: Route) => void;

let handler: RouteHandler | null = null;

/** Parse location hash into a Route object */
export function parseHash(hash: string): Route {
    const path = hash.replace(/^#\/?/, '') || '';

    if (path === '' || path === '/') {
        return { name: 'main' };
    }

    if (path === 'add') {
        return { name: 'add' };
    }

    if (path === 'stats') {
        return { name: 'stats' };
    }

    if (path === 'login') {
        return { name: 'login' };
    }

    const bookMatch = path.match(/^book\/(.+)$/);
    if (bookMatch?.[1]) {
        return { name: 'edit', bookId: bookMatch[1] };
    }

    log.warn(`Unknown route: ${hash}, falling back to main`);
    return { name: 'main' };
}

/** Navigate to a route */
export function navigateTo(route: Route): void {
    let hash: string;
    switch (route.name) {
        case 'main':
            hash = '#/';
            break;
        case 'add':
            hash = '#/add';
            break;
        case 'edit':
            hash = `#/book/${route.bookId}`;
            break;
        case 'stats':
            hash = '#/stats';
            break;
        case 'login':
            hash = '#/login';
            break;
    }

    log.debug(`Navigating to ${hash}`);
    window.location.hash = hash;
}

/** Initialize the router with a route change handler */
export function initRouter(routeHandler: RouteHandler): void {
    handler = routeHandler;

    window.addEventListener('hashchange', () => {
        const route = parseHash(window.location.hash);
        log.info(`Route changed: ${route.name}`);
        handler?.(route);
    });

    // Handle initial route
    const initialRoute = parseHash(window.location.hash);
    log.info(`Initial route: ${initialRoute.name}`);
    handler(initialRoute);
}

/** Get current route */
export function getCurrentRoute(): Route {
    return parseHash(window.location.hash);
}
