/* ===== Footnotes — Logger ===== */

import { IS_DEV } from './config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const MIN_LEVEL: LogLevel = IS_DEV ? 'debug' : 'warn';

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatMsg(level: LogLevel, module: string, msg: string): string {
    const ts = new Date().toISOString();
    return `[${ts}] [${level.toUpperCase()}] [${module}] ${msg}`;
}

export function createLogger(module: string) {
    return {
        debug(msg: string, ...args: unknown[]) {
            if (shouldLog('debug')) {
                console.debug(formatMsg('debug', module, msg), ...args);
            }
        },
        info(msg: string, ...args: unknown[]) {
            if (shouldLog('info')) {
                console.info(formatMsg('info', module, msg), ...args);
            }
        },
        warn(msg: string, ...args: unknown[]) {
            if (shouldLog('warn')) {
                console.warn(formatMsg('warn', module, msg), ...args);
            }
        },
        error(msg: string, ...args: unknown[]) {
            if (shouldLog('error')) {
                console.error(formatMsg('error', module, msg), ...args);
            }
        },
    };
}
