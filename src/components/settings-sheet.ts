/* ===== Footnotes — Settings Sheet Component ===== */

import type { SortField, SortDirection } from '../types';
import { getState, setSort } from '../store';
import { createLogger } from '../logger';

const log = createLogger('settings-sheet');

export interface SortOptionItem {
    field: SortField;
    direction: SortDirection;
    label: string;
}

const SORT_OPTIONS: SortOptionItem[] = [
    { field: 'createdAt', direction: 'desc', label: 'По дате добавления ↓' },
    { field: 'createdAt', direction: 'asc', label: 'По дате добавления ↑' },
    { field: 'rating', direction: 'desc', label: 'По рейтингу ↓' },
    { field: 'rating', direction: 'asc', label: 'По рейтингу ↑' },
    { field: 'title', direction: 'asc', label: 'По названию А → Я' },
    { field: 'title', direction: 'desc', label: 'По названию Я → А' },
    { field: 'author', direction: 'asc', label: 'По автору А → Я' },
    { field: 'year', direction: 'desc', label: 'По году ↓' },
    { field: 'year', direction: 'asc', label: 'По году ↑' },
];

let sheetEl: HTMLElement | null = null;

export function openSettingsSheet(): void {
    if (sheetEl) {
        sheetEl.classList.add('settings-sheet--open');
        return;
    }

    const state = getState();

    const sheet = document.createElement('div');
    sheet.className = 'settings-sheet settings-sheet--open';

    const overlay = document.createElement('div');
    overlay.className = 'settings-sheet__overlay';
    overlay.addEventListener('click', closeSettingsSheet);
    sheet.appendChild(overlay);

    const content = document.createElement('div');
    content.className = 'settings-sheet__content';

    const handle = document.createElement('div');
    handle.className = 'settings-sheet__handle';
    content.appendChild(handle);

    const title = document.createElement('h2');
    title.className = 'settings-sheet__title';
    title.textContent = 'Сортировка';
    content.appendChild(title);

    const list = document.createElement('div');
    list.className = 'settings-sheet__list';

    SORT_OPTIONS.forEach((option) => {
        const item = document.createElement('button');
        item.className = 'settings-sheet__item';

        const isActive =
            state.sortField === option.field && state.sortDirection === option.direction;
        if (isActive) {
            item.classList.add('settings-sheet__item--active');
        }

        const labelEl = document.createElement('span');
        labelEl.textContent = option.label;
        item.appendChild(labelEl);

        const checkEl = document.createElement('span');
        checkEl.className = 'settings-sheet__check';
        checkEl.textContent = '✓';
        item.appendChild(checkEl);

        item.addEventListener('click', () => {
            log.info(`Sort changed: ${option.field} ${option.direction}`);
            setSort(option.field, option.direction);
            closeSettingsSheet();
        });

        list.appendChild(item);
    });

    content.appendChild(list);
    sheet.appendChild(content);

    document.body.appendChild(sheet);
    sheetEl = sheet;
}

export function closeSettingsSheet(): void {
    if (sheetEl) {
        sheetEl.classList.remove('settings-sheet--open');
        setTimeout(() => {
            sheetEl?.remove();
            sheetEl = null;
        }, 350);
    }
}
