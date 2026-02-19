/* ===== Footnotes — Header Component ===== */

import { getCurrentUser } from '../auth';
import { icons } from '../icons';

export interface HeaderOptions {
    title: string;
    showAvatar?: boolean;
    showSettings?: boolean;
    showBack?: boolean;
    onSettingsClick?: () => void;
    onBackClick?: () => void;
}

export function renderHeader(options: HeaderOptions): HTMLElement {
    const header = document.createElement('header');
    header.className = 'header';

    // Left side
    const left = document.createElement('div');
    left.className = 'header__left';

    if (options.showBack) {
        const backBtn = document.createElement('button');
        backBtn.className = 'header__back';
        backBtn.innerHTML = `<span class="header__back-icon"></span> Назад`;
        backBtn.addEventListener('click', () => {
            options.onBackClick?.();
        });
        left.appendChild(backBtn);
    }

    if (options.showAvatar) {
        const user = getCurrentUser();
        const avatar = document.createElement('div');
        avatar.className = 'avatar';

        if (user?.photo_url) {
            const img = document.createElement('img');
            img.className = 'avatar__img';
            img.src = user.photo_url;
            img.alt = user.first_name;
            avatar.appendChild(img);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'avatar__placeholder';
            const firstInitial = (user?.first_name || 'U')[0]!.toUpperCase();
            placeholder.textContent = firstInitial;
            avatar.appendChild(placeholder);
        }

        left.appendChild(avatar);
    }

    header.appendChild(left);

    // Right side
    const right = document.createElement('div');
    right.className = 'header__right';

    if (options.showSettings) {
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'settings-button';
        settingsBtn.innerHTML = icons.settings;
        settingsBtn.setAttribute('aria-label', 'Сортировка');
        settingsBtn.addEventListener('click', () => {
            options.onSettingsClick?.();
        });
        right.appendChild(settingsBtn);
    }

    header.appendChild(right);

    return header;
}

export function renderPageTitle(text: string): HTMLElement {
    const title = document.createElement('h1');
    title.className = 'header__title';
    title.textContent = text;
    title.style.padding = `0 var(--spacing-base) var(--spacing-md)`;
    return title;
}
