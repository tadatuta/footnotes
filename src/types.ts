/* ===== Footnotes — Type Definitions ===== */

export interface Book {
    id: string;
    title: string;
    author: string;
    year: number;
    rating: number;
    coverUrl?: string;
    notes?: string;
    createdAt: string;
}

export interface UserData {
    books: Book[];
}

export interface TelegramLoginUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

export type SortField = 'createdAt' | 'rating' | 'title' | 'author' | 'year';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
    field: SortField;
    direction: SortDirection;
    label: string;
}

export interface AppState {
    books: Book[];
    user: TelegramLoginUser | null;
    sortField: SortField;
    sortDirection: SortDirection;
    searchQuery: string;
}

export type StateSubscriber = (state: AppState) => void;

export type Route =
    | { name: 'main' }
    | { name: 'add' }
    | { name: 'edit'; bookId: string }
    | { name: 'stats' }
    | { name: 'login' };
