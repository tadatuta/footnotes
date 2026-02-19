/* ===== Footnotes — Star Rating Component ===== */

import { icons } from '../icons';

export interface RatingOptions {
    value: number;
    interactive?: boolean;
    onChange?: (value: number) => void;
}

export function renderRating(options: RatingOptions): HTMLElement {
    const container = document.createElement('div');
    container.className = `rating${options.interactive ? ' rating--interactive' : ''}`;

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = `rating__star${i <= options.value ? ' rating__star--filled' : ''}`;
        star.innerHTML = i <= options.value ? icons.star : icons.starOutline;

        if (options.interactive) {
            star.addEventListener('click', () => {
                // Allow toggling off the last star: if clicking the same value, set to 0
                const newValue = i === options.value ? 0 : i;
                options.onChange?.(newValue);
                updateStars(container, newValue);
            });
        }

        container.appendChild(star);
    }

    return container;
}

function updateStars(container: HTMLElement, value: number): void {
    const stars = container.querySelectorAll('.rating__star');
    stars.forEach((star, index) => {
        const filled = index + 1 <= value;
        star.className = `rating__star${filled ? ' rating__star--filled' : ''}`;
        star.innerHTML = filled ? icons.star : icons.starOutline;
    });
}
