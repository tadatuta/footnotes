/* ===== Footnotes — Bottom Navigation Component ===== */

import { icons } from '../icons';
import { navigateTo, getCurrentRoute } from '../router';

export function renderNav(): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'nav';

    const currentRoute = getCurrentRoute();

    const items = [
        { icon: icons.books, label: 'Находки', route: 'main' as const },
        { icon: icons.stats, label: 'Статистика', route: 'stats' as const },
        { icon: icons.add, label: 'Добавить', route: 'add' as const },
    ];

    items.forEach((item) => {
        const button = document.createElement('button');
        button.className = 'nav__item';

        if (currentRoute.name === item.route) {
            button.classList.add('nav__item--active');
        }

        const iconEl = document.createElement('span');
        iconEl.className = 'nav__icon';
        iconEl.innerHTML = item.icon;
        button.appendChild(iconEl);

        const label = document.createElement('span');
        label.className = 'nav__label';
        label.textContent = item.label;
        button.appendChild(label);

        button.addEventListener('click', () => {
            navigateTo({ name: item.route });
        });

        nav.appendChild(button);
    });

    return nav;
}
