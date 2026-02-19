/* ===== Footnotes — Login Screen ===== */

import { IS_DEV, TELEGRAM_BOT_USERNAME } from '../config';
import { initTelegramLoginWidget, onTelegramAuth } from '../auth';
import { createLogger } from '../logger';

const log = createLogger('screen:login');

export function renderLoginScreen(container: HTMLElement): void {
    log.info('Rendering login screen');
    container.innerHTML = '';

    const screen = document.createElement('div');
    screen.className = 'login';

    // Logo
    const logo = document.createElement('div');
    logo.className = 'login__logo';
    logo.textContent = '📖';
    screen.appendChild(logo);

    // Title
    const title = document.createElement('h1');
    title.className = 'login__title';
    title.textContent = 'Footnotes';
    screen.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.className = 'login__subtitle';
    subtitle.textContent = 'Ваш дневник чтения. Записывайте находки, ставьте оценки, следите за прогрессом.';
    screen.appendChild(subtitle);

    // Telegram Login Widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'login__widget';

    if (TELEGRAM_BOT_USERNAME) {
        initTelegramLoginWidget(widgetContainer);
    } else {
        const noBot = document.createElement('p');
        noBot.style.color = 'var(--color-text-tertiary)';
        noBot.style.fontSize = 'var(--font-size-sm)';
        noBot.textContent = 'Telegram Bot ID не настроен';
        widgetContainer.appendChild(noBot);
    }

    screen.appendChild(widgetContainer);

    // Dev mode bypass button
    if (IS_DEV) {
        const devBtn = document.createElement('button');
        devBtn.className = 'button button--secondary login__dev-button';
        devBtn.textContent = 'Войти как Dev User';
        devBtn.addEventListener('click', () => {
            log.info('Dev login bypass');
            onTelegramAuth({
                id: 12345,
                first_name: 'Dev',
                last_name: 'User',
                username: 'devuser',
                auth_date: Math.floor(Date.now() / 1000),
                hash: 'dev_hash',
            });
        });
        screen.appendChild(devBtn);
    }

    container.appendChild(screen);
}
