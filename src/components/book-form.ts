/* ===== Footnotes — Book Form Component ===== */

import { renderRating } from './rating';
import { createLogger } from '../logger';
import type { Book } from '../types';

const log = createLogger('book-form');

export interface BookFormOptions {
    mode: 'create' | 'edit';
    book?: Book;
    onSubmit: (data: Omit<Book, 'id' | 'createdAt'>) => void;
    onDelete?: () => void;
}

export function renderBookForm(options: BookFormOptions): HTMLElement {
    const form = document.createElement('form');
    form.className = 'book-form';

    let currentRating = options.book?.rating ?? 0;

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

        if (!title || !author) {
            log.warn('Form validation failed: title or author empty');
            return;
        }

        const year = yearStr ? parseInt(yearStr, 10) : 0;

        log.info(`Form submitted: "${title}" by ${author}, year=${year}, rating=${currentRating}`);

        options.onSubmit({
            title,
            author,
            year,
            rating: currentRating,
            notes: notes || undefined,
            coverUrl: options.book?.coverUrl,
        });
    });

    return form;
}

function createField(
    label: string,
    inputType: string,
    name: string,
    placeholder: string,
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
    input.placeholder = placeholder;
    if (value) input.value = value;
    if (inputType === 'number') {
        input.inputMode = 'numeric';
    }

    wrapper.appendChild(input);
    group.appendChild(wrapper);

    return group;
}
