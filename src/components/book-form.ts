/* ===== Footnotes — Book Form Component ===== */

import { renderRating } from './rating';
import { createLogger } from '../logger';
import type { Book } from '../types';

const log = createLogger('book-form');

export interface BookFormOptions {
    mode: 'create' | 'edit';
    book?: Book;
    onSubmit: (data: Omit<Book, 'id'>) => void;
    onDelete?: () => void;
}

export function renderBookForm(options: BookFormOptions): HTMLElement {
    const form = document.createElement('form');
    form.className = 'book-form';

    let currentRating = options.book?.rating ?? 0;
    let currentCoverUrl = options.book?.coverUrl;

    if (options.mode === 'edit') {
        form.appendChild(
            createCoverGroup(
                currentCoverUrl,
                (nextCoverUrl) => {
                    currentCoverUrl = nextCoverUrl;
                },
                options.book?.title
            )
        );
    }

    // Title field
    form.appendChild(
        createField('Название', 'text', 'title', 'Название книги', options.book?.title)
    );

    // Author field
    form.appendChild(
        createField('Автор', 'text', 'author', 'Имя автора', options.book?.author)
    );

    // Year field
    form.appendChild(
        createField('Год', 'number', 'year', 'Год издания', options.book?.year?.toString())
    );

    if (options.mode === 'edit') {
        form.appendChild(
            createField(
                'Дата добавления',
                'date',
                'createdAt',
                undefined,
                formatDateForInput(options.book?.createdAt)
            )
        );
    }

    // Notes textarea
    const notesGroup = document.createElement('div');
    notesGroup.className = 'book-form__group';

    const notesLabel = document.createElement('label');
    notesLabel.className = 'book-form__label';
    notesLabel.textContent = 'Заметки';
    notesGroup.appendChild(notesLabel);

    const notesWrapper = document.createElement('div');
    notesWrapper.className = 'book-form__input-wrapper';

    const notesInput = document.createElement('textarea');
    notesInput.className = 'book-form__textarea';
    notesInput.name = 'notes';
    notesInput.placeholder = 'Ваши заметки о книге...';
    notesInput.value = options.book?.notes ?? '';
    notesWrapper.appendChild(notesInput);
    notesGroup.appendChild(notesWrapper);

    form.appendChild(notesGroup);

    // Rating
    const ratingGroup = document.createElement('div');
    ratingGroup.className = 'book-form__group';

    const ratingLabel = document.createElement('label');
    ratingLabel.className = 'book-form__label';
    ratingLabel.textContent = 'Рейтинг';
    ratingGroup.appendChild(ratingLabel);

    const ratingWrapper = document.createElement('div');
    ratingWrapper.className = 'book-form__rating-wrapper';

    const rating = renderRating({
        value: currentRating,
        interactive: true,
        onChange: (val) => {
            currentRating = val;
        },
    });
    ratingWrapper.appendChild(rating);
    ratingGroup.appendChild(ratingWrapper);

    form.appendChild(ratingGroup);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'book-form__actions';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'button button--primary button--full-width';
    submitBtn.textContent = options.mode === 'create' ? 'Добавить' : 'Сохранить';
    actions.appendChild(submitBtn);

    if (options.mode === 'edit' && options.onDelete) {
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'button button--destructive button--full-width';
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', () => {
            if (confirm('Удалить эту книгу?')) {
                log.info('User confirmed book deletion');
                options.onDelete?.();
            }
        });
        actions.appendChild(deleteBtn);
    }

    form.appendChild(actions);

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const title = (formData.get('title') as string).trim();
        const author = (formData.get('author') as string).trim();
        const yearStr = (formData.get('year') as string).trim();
        const notes = (formData.get('notes') as string).trim();
        const createdAtDate = (formData.get('createdAt') as string | null)?.trim();

        if (!title || !author) {
            log.warn('Form validation failed: title or author empty');
            return;
        }

        const year = parseYear(yearStr);
        const createdAt = resolveCreatedAt(options.mode, createdAtDate, options.book?.createdAt);

        log.info(`Form submitted: "${title}" by ${author}, year=${year}, rating=${currentRating}`);

        options.onSubmit({
            title,
            author,
            year,
            rating: currentRating,
            notes: notes || undefined,
            coverUrl: currentCoverUrl,
            createdAt,
        });
    });

    return form;
}

function createField(
    label: string,
    inputType: string,
    name: string,
    placeholder?: string,
    value?: string
): HTMLElement {
    const group = document.createElement('div');
    group.className = 'book-form__group';

    const labelEl = document.createElement('label');
    labelEl.className = 'book-form__label';
    labelEl.textContent = label;
    group.appendChild(labelEl);

    const wrapper = document.createElement('div');
    wrapper.className = 'book-form__input-wrapper';

    const input = document.createElement('input');
    input.className = 'book-form__input';
    input.type = inputType;
    input.name = name;
    if (placeholder) {
        input.placeholder = placeholder;
    }
    if (value) input.value = value;
    if (inputType === 'number') {
        input.inputMode = 'numeric';
    }

    wrapper.appendChild(input);
    group.appendChild(wrapper);

    return group;
}

function createCoverGroup(
    initialCoverUrl: string | undefined,
    onChange: (coverUrl: string | undefined) => void,
    bookTitle?: string
): HTMLElement {
    const group = document.createElement('div');
    group.className = 'book-form__group';

    const labelEl = document.createElement('label');
    labelEl.className = 'book-form__label';
    labelEl.textContent = 'Обложка';
    group.appendChild(labelEl);

    const cover = document.createElement('div');
    cover.className = 'book-form__cover';
    group.appendChild(cover);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'book-form__cover-remove';
    removeBtn.textContent = 'Удалить обложку';
    group.appendChild(removeBtn);

    let coverUrl = initialCoverUrl;

    const renderCover = (): void => {
        cover.innerHTML = '';

        if (coverUrl) {
            const img = document.createElement('img');
            img.className = 'book-form__cover-img';
            img.src = coverUrl;
            img.alt = bookTitle ? `Обложка: ${bookTitle}` : 'Обложка книги';
            cover.appendChild(img);
            removeBtn.hidden = false;
            return;
        }

        const placeholder = document.createElement('div');
        placeholder.className = 'book-form__cover-placeholder';
        placeholder.textContent = 'Нет обложки';
        cover.appendChild(placeholder);
        removeBtn.hidden = true;
    };

    removeBtn.addEventListener('click', () => {
        coverUrl = undefined;
        onChange(coverUrl);
        renderCover();
    });

    renderCover();
    return group;
}

function parseYear(yearStr: string): number {
    if (!yearStr) return 0;

    const parsedYear = parseInt(yearStr, 10);
    return Number.isNaN(parsedYear) ? 0 : parsedYear;
}

function formatDateForInput(createdAt?: string): string {
    if (!createdAt) return '';

    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function resolveCreatedAt(
    mode: BookFormOptions['mode'],
    createdAtDate: string | undefined,
    existingCreatedAt?: string
): string {
    if (mode === 'edit') {
        if (createdAtDate) {
            return toIsoFromDateInput(createdAtDate, existingCreatedAt);
        }
        return existingCreatedAt ?? new Date().toISOString();
    }

    return new Date().toISOString();
}

function toIsoFromDateInput(createdAtDate: string, existingCreatedAt?: string): string {
    const [yearStr, monthStr, dayStr] = createdAtDate.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    if (!year || !month || !day) {
        return existingCreatedAt ?? new Date().toISOString();
    }

    const base = existingCreatedAt ? new Date(existingCreatedAt) : new Date();
    if (Number.isNaN(base.getTime())) {
        return new Date(year, month - 1, day).toISOString();
    }

    base.setFullYear(year, month - 1, day);
    return base.toISOString();
}
