/* ===== Footnotes — Telegram Auth ===== */

import { IS_DEV, TELEGRAM_BOT_ID } from './config';
import { createLogger } from './logger';
import type { TelegramLoginUser } from './types';

const log = createLogger('auth');

const STORAGE_KEY = 'footnotes_tg_auth';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/** Save auth data to localStorage */
function saveAuth(user: TelegramLoginUser): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        log.info('Auth data saved', { userId: user.id });
    } catch (e) {
        log.error('Failed to save auth data', e);
    }
}

/** Load auth data from localStorage */
function loadAuth(): TelegramLoginUser | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as TelegramLoginUser;
    } catch (e) {
        log.error('Failed to load auth data', e);
        return null;
    }
}

/** Check if auth session is still valid (not expired) */
function isSessionValid(user: TelegramLoginUser): boolean {
    const now = Math.floor(Date.now() / 1000);
    const age = now - user.auth_date;
    return age < SESSION_MAX_AGE;
}

/** Get currently authenticated user */
export function getCurrentUser(): TelegramLoginUser | null {
    if (IS_DEV && !TELEGRAM_BOT_ID) {
        log.debug('Dev mode: returning mock user');
        return {
            id: 12345,
            first_name: 'Dev',
            last_name: 'User',
            username: 'devuser',
            auth_date: Math.floor(Date.now() / 1000),
            hash: 'dev_hash',
        };
    }

    const user = loadAuth();
    if (!user) return null;

    if (!isSessionValid(user)) {
        log.info('Auth session expired');
        logout();
        return null;
    }

    return user;
}

/** Check if user is authenticated */
export function isAuthenticated(): boolean {
    return getCurrentUser() !== null;
}

/** Get auth data string for API headers */
export function getAuthHeader(): string {
    const user = getCurrentUser();
    if (!user) return '';
    return JSON.stringify(user);
}

/** Telegram Login Widget callback */
export function onTelegramAuth(user: TelegramLoginUser): void {
    log.info('Telegram auth callback received', { userId: user.id, username: user.username });
    saveAuth(user);
    window.location.hash = '#/';
    window.location.reload();
}

/** Initialize Telegram Login Widget in the given container */
export function initTelegramLoginWidget(container: HTMLElement): void {
    if (!TELEGRAM_BOT_ID) {
        log.warn('Telegram Bot ID not configured, login widget not rendered');
        return;
    }

    // Make callback available globally for the widget
    (window as unknown as Record<string, unknown>)['onTelegramAuth'] = onTelegramAuth;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_ID);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    container.appendChild(script);
    log.debug('Telegram Login Widget initialized');
}

/** Logout: clear auth data */
export function logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    log.info('User logged out');
}
