/* ===== Footnotes — API Client ===== */

import { API_URL } from './config';
import { getAuthHeader } from './auth';
import { createLogger } from './logger';
import type { UserData } from './types';

const log = createLogger('api');

async function request<T>(method: string, body?: unknown): Promise<T> {
    const url = API_URL;
    const authData = getAuthHeader();

    log.debug(`${method} ${url}`, body ? { body } : undefined);

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (authData) {
        headers['X-Telegram-Auth-Data'] = authData;
    }

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        log.error(`API error ${response.status}`, errorText);
        throw new Error(`API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as T;
    log.debug(`${method} ${url} response`, data);
    return data;
}

/** Load user data from backend */
export async function loadUserData(): Promise<UserData> {
    log.info('Loading user data...');
    try {
        const data = await request<UserData>('GET');
        log.info(`Loaded ${data.books?.length ?? 0} books`);
        return data;
    } catch (e) {
        log.error('Failed to load user data', e);
        return { books: [] };
    }
}

/** Save user data to backend */
export async function saveUserData(data: UserData): Promise<void> {
    log.info(`Saving user data (${data.books.length} books)...`);
    try {
        await request<{ success: boolean }>('POST', data);
        log.info('User data saved successfully');
    } catch (e) {
        log.error('Failed to save user data', e);
        throw e;
    }
}
