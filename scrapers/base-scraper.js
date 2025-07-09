import { JSDOM } from 'jsdom';
import { setTimeout } from 'timers/promises';

export class BaseScraper {
    constructor() {
        this.MAX_RETRIES = 3;
        this.LOCALES = ['en', 'fr', 'ja', 'de', 'ae', 'cn', 'es', 'it', 'ko', 'pt'];
    }

    async fetchWithRetry(url, retries = this.MAX_RETRIES) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.text();
        } catch (error) {
            if (retries > 0) {
                await setTimeout(0);
                return this.fetchWithRetry(url, retries - 1);
            }
            throw error;
        }
    }

    async parseHTML(url) {
        try {
            const html = await this.fetchWithRetry(url);
            return new JSDOM(html).window.document;
        } catch (error) {
            throw new Error(`Failed to parse HTML: ${error.message}`);
        }
    }

    getLocaleUrl(baseUrl, locale) {
        return baseUrl.replace('LOC', locale);
    }

    handleScrapingError(error, context = {}) {
        if (error.message === 'NoDataFound') {
            console.warn('no data found', context);
            return;
        }

        const errorData = {
            timestamp: new Date().toISOString(),
            ...context
        };

        console.error('Scraping Error:', errorData, error);

        if (process.argv.includes('--stop-on-error')) {
            process.exit(1);
        }
    }

    extractText(element, selector) {
        if (!element) return null;

        if (selector) {
            element = element.querySelector(selector);
        }

        return element?.textContent?.trim() || null;
    }
}
