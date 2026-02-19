/* ===== Footnotes — Google Books Cover Lookup ===== */

import { GOOGLE_BOOKS_API_KEY } from './config';
import { createLogger } from './logger';

const log = createLogger('google-books');

interface GoogleBooksVolume {
    volumeInfo?: {
        imageLinks?: {
            thumbnail?: string;
            smallThumbnail?: string;
        };
    };
}

interface GoogleBooksResponse {
    totalItems: number;
    items?: GoogleBooksVolume[];
}

/**
 * Fetch book cover URL from Google Books API.
 * Uses API key if configured, otherwise falls back to keyless request.
 * Returns undefined if no cover found.
 */
export async function fetchBookCover(title: string, author: string): Promise<string | undefined> {
    const query = encodeURIComponent(`${title} ${author}`);
    let url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1&fields=totalItems,items(volumeInfo/imageLinks)`;

    if (GOOGLE_BOOKS_API_KEY) {
        url += `&key=${GOOGLE_BOOKS_API_KEY}`;
    }

    log.debug(`Searching cover for "${title}" by ${author}`);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            log.warn(`Google Books API returned ${response.status}`);
            return undefined;
        }

        const data = await response.json() as GoogleBooksResponse;

        if (data.totalItems === 0 || !data.items?.[0]) {
            log.debug('No cover found');
            return undefined;
        }

        const imageLinks = data.items[0].volumeInfo?.imageLinks;
        const coverUrl = imageLinks?.thumbnail || imageLinks?.smallThumbnail;

        if (coverUrl) {
            // Convert http to https
            const secureCoverUrl = coverUrl.replace(/^http:/, 'https:');
            log.info(`Cover found: ${secureCoverUrl}`);
            return secureCoverUrl;
        }

        log.debug('No image links in response');
        return undefined;
    } catch (e) {
        log.error('Failed to fetch book cover', e);
        return undefined;
    }
}
