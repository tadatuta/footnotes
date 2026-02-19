/* ===== Footnotes — Statistics Screen ===== */

import { renderHeader, renderPageTitle } from '../components/header';
import { renderNav } from '../components/nav';
import { getState } from '../store';
import { createLogger } from '../logger';
import type { Book } from '../types';

const log = createLogger('screen:stats');

export function renderStatsScreen(container: HTMLElement): void {
    log.info('Rendering stats screen');
    container.innerHTML = '';

    const screen = document.createElement('div');
    screen.className = 'screen';

    // Header
    const header = renderHeader({
        title: 'Статистика',
        showAvatar: true,
    });
    screen.appendChild(header);

    screen.appendChild(renderPageTitle('Статистика'));

    const state = getState();
    const books = state.books;

    const content = document.createElement('div');
    content.className = 'stats';

    if (books.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'stats__empty';
        empty.textContent = 'Добавьте книги, чтобы увидеть статистику';
        content.appendChild(empty);
    } else {
        // Summary cards
        const grid = document.createElement('div');
        grid.className = 'stats__grid';

        // Total books
        grid.appendChild(createStatCard(String(books.length), 'книг прочитано'));

        // Average rating
        const avgRating = books.reduce((sum, b) => sum + b.rating, 0) / books.length;
        grid.appendChild(createStatCard(avgRating.toFixed(1), 'средний рейтинг'));

        // Best book
        const bestBook = [...books].sort((a, b) => b.rating - a.rating)[0];
        if (bestBook) {
            grid.appendChild(createStatCard(`★ ${bestBook.rating}`, bestBook.title, true));
        }

        // Top author
        const authorCounts = new Map<string, number>();
        books.forEach((b) => {
            authorCounts.set(b.author, (authorCounts.get(b.author) ?? 0) + 1);
        });
        const topAuthor = [...authorCounts.entries()].sort((a, b) => b[1] - a[1])[0];
        if (topAuthor) {
            grid.appendChild(
                createStatCard(`${topAuthor[1]} кн.`, topAuthor[0], true)
            );
        }

        content.appendChild(grid);

        // Rating distribution
        const ratingDist = buildRatingDistribution(books);
        if (ratingDist.length > 0) {
            const ratingSection = document.createElement('div');
            ratingSection.className = 'stats__section';

            const ratingTitle = document.createElement('h3');
            ratingTitle.className = 'stats__section-title';
            ratingTitle.textContent = 'Распределение по рейтингу';
            ratingSection.appendChild(ratingTitle);

            const chart = document.createElement('div');
            chart.className = 'stats__bar-chart';

            const maxCount = Math.max(...ratingDist.map((r) => r.count));

            ratingDist.forEach((item) => {
                chart.appendChild(createBarRow(`${'★'.repeat(item.stars)}`, item.count, maxCount));
            });

            ratingSection.appendChild(chart);
            content.appendChild(ratingSection);
        }

        // Books by year
        const yearDist = buildYearDistribution(books);
        if (yearDist.length > 0) {
            const yearSection = document.createElement('div');
            yearSection.className = 'stats__section';

            const yearTitle = document.createElement('h3');
            yearTitle.className = 'stats__section-title';
            yearTitle.textContent = 'Книги по годам';
            yearSection.appendChild(yearTitle);

            const chart = document.createElement('div');
            chart.className = 'stats__bar-chart';

            const maxCount = Math.max(...yearDist.map((y) => y.count));

            yearDist.forEach((item) => {
                chart.appendChild(createBarRow(String(item.year), item.count, maxCount));
            });

            yearSection.appendChild(chart);
            content.appendChild(yearSection);
        }

        // Reading trend (by month added)
        const trendDist = buildMonthlyTrend(books);
        if (trendDist.length > 1) {
            const trendSection = document.createElement('div');
            trendSection.className = 'stats__section';

            const trendTitle = document.createElement('h3');
            trendTitle.className = 'stats__section-title';
            trendTitle.textContent = 'Тренд чтения';
            trendSection.appendChild(trendTitle);

            const chart = document.createElement('div');
            chart.className = 'stats__bar-chart';

            const maxCount = Math.max(...trendDist.map((t) => t.count));

            trendDist.forEach((item) => {
                chart.appendChild(createBarRow(item.label, item.count, maxCount));
            });

            trendSection.appendChild(chart);
            content.appendChild(trendSection);
        }
    }

    screen.appendChild(content);

    // Bottom nav
    screen.appendChild(renderNav());

    container.appendChild(screen);
}

function createStatCard(value: string, label: string, wide = false): HTMLElement {
    const card = document.createElement('div');
    card.className = `stats__card${wide ? ' stats__card--wide' : ''}`;

    const valueEl = document.createElement('div');
    valueEl.className = 'stats__card-value';
    valueEl.textContent = value;
    card.appendChild(valueEl);

    const labelEl = document.createElement('div');
    labelEl.className = 'stats__card-label';
    labelEl.textContent = label;
    card.appendChild(labelEl);

    return card;
}

function createBarRow(label: string, count: number, maxCount: number): HTMLElement {
    const row = document.createElement('div');
    row.className = 'stats__bar-row';

    const labelEl = document.createElement('span');
    labelEl.className = 'stats__bar-label';
    labelEl.textContent = label;
    row.appendChild(labelEl);

    const track = document.createElement('div');
    track.className = 'stats__bar-track';

    const fill = document.createElement('div');
    fill.className = 'stats__bar-fill';
    const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
    fill.style.width = `${pct}%`;
    track.appendChild(fill);
    row.appendChild(track);

    const valueEl = document.createElement('span');
    valueEl.className = 'stats__bar-value';
    valueEl.textContent = String(count);
    row.appendChild(valueEl);

    return row;
}

interface RatingDistItem {
    stars: number;
    count: number;
}

function buildRatingDistribution(books: Book[]): RatingDistItem[] {
    const dist = new Map<number, number>();
    books.forEach((b) => {
        dist.set(b.rating, (dist.get(b.rating) ?? 0) + 1);
    });
    return [5, 4, 3, 2, 1]
        .filter((s) => dist.has(s))
        .map((stars) => ({ stars, count: dist.get(stars)! }));
}

interface YearDistItem {
    year: number;
    count: number;
}

function buildYearDistribution(books: Book[]): YearDistItem[] {
    const dist = new Map<number, number>();
    books.forEach((b) => {
        if (b.year > 0) {
            dist.set(b.year, (dist.get(b.year) ?? 0) + 1);
        }
    });
    return [...dist.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([year, count]) => ({ year, count }));
}

interface TrendItem {
    label: string;
    count: number;
}

function buildMonthlyTrend(books: Book[]): TrendItem[] {
    const MONTH_NAMES = [
        'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
        'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
    ];

    const dist = new Map<string, number>();

    books.forEach((b) => {
        try {
            const date = new Date(b.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            dist.set(key, (dist.get(key) ?? 0) + 1);
        } catch {
            // Skip invalid dates
        }
    });

    return [...dist.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-12) // Last 12 months
        .map(([key, count]) => {
            const [, monthStr] = key.split('-');
            const monthIndex = parseInt(monthStr!, 10) - 1;
            return { label: MONTH_NAMES[monthIndex] ?? key, count };
        });
}
