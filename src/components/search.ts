/* ===== Footnotes — Search Component ===== */

import { icons } from '../icons';

export interface SearchOptions {
    placeholder?: string;
    onInput: (query: string) => void;
}

export function renderSearch(options: SearchOptions): HTMLElement {
    const container = document.createElement('div');
    container.className = 'search';

    const wrapper = document.createElement('div');
    wrapper.className = 'search__input-wrapper';

    // Search icon
    const iconEl = document.createElement('span');
    iconEl.className = 'search__icon';
    iconEl.innerHTML = icons.search;
    wrapper.appendChild(iconEl);

    // Input
    const input = document.createElement('input');
    input.className = 'search__input';
    input.type = 'search';
    input.placeholder = options.placeholder || 'Поиск';
    input.autocomplete = 'off';

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'search__clear';
    clearBtn.textContent = '✕';
    clearBtn.setAttribute('aria-label', 'Очистить');

    let debounceTimer: ReturnType<typeof setTimeout>;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const value = input.value;

        // Show/hide clear button
        clearBtn.className = `search__clear${value ? ' search__clear--visible' : ''}`;

        debounceTimer = setTimeout(() => {
            options.onInput(value);
        }, 200);
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.className = 'search__clear';
        options.onInput('');
        input.focus();
    });

    wrapper.appendChild(input);
    wrapper.appendChild(clearBtn);
    container.appendChild(wrapper);

    return container;
}
