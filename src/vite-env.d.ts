/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_TELEGRAM_BOT_USERNAME: string;
    readonly VITE_GOOGLE_BOOKS_API_KEY: string;
    readonly VITE_BASE_PATH: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
