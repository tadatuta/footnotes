/* ===== Footnotes — Configuration ===== */

/** Backend API URL. Set via environment or override here. */
export const API_URL = import.meta.env.VITE_API_URL as string || 'http://localhost:3000';

/** Telegram Bot ID (numeric part before ':' in bot token). */
export const TELEGRAM_BOT_ID = import.meta.env.VITE_TELEGRAM_BOT_ID as string || '';

/** Google Books API key (optional). */
export const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY as string || '';

/** Is development mode. */
export const IS_DEV = import.meta.env.DEV;
