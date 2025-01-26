import { BaseScraper } from './base-scraper.js';
import { writeFile } from 'fs/promises';

export class TranslationScraper extends BaseScraper {
    constructor() {
        super();
        this.BASE_URL = 'https://www.db.yugioh-card.com/yugiohdb/card_search.action?wname=CardSearch&request_locale=LOC';
        this.PRESET_TRANSLATIONS = {
            Trap: {
                ja: '罠',
                ko: '함정',
                ea: 'Trap',
                en: 'Trap',
                de: 'Fallen',
                fr: 'Piège',
                it: 'Trappola',
                es: 'Trampa',
                pt: 'Justo'
            },
            Spell: {
                ja: '魔法',
                ko: '마법',
                ea: 'Spell',
                en: 'Spell',
                de: 'Zauber',
                fr: 'Magie',
                it: 'Magia',
                es: 'Mágica',
                pt: 'Magia'
            }
        };
    }

    async extractTranslationData(document) {
        const extractor = (...cats) => cats.flatMap(cat => [...document.querySelector(cat).querySelectorAll('li > span')])
            .map(li => ([li.querySelector('input').value, li.textContent.trim()]))
            .reduce((acc, val) => { acc[val[0]] = val[1]; return acc; }, {});

        return {
            attribute: extractor('#filter_attribute', '#filter_effect_set'),
            monster_type: extractor('#filter_specis'),
            type: extractor('#filter_other'),
        };
    }

    async scrapeLocale(locale) {
        try {
            const url = this.getLocaleUrl(this.BASE_URL, locale);
            const document = await this.parseHTML(url);
            return await this.extractTranslationData(document);
        } catch (error) {
            this.handleScrapingError(error, { locale });
            return null;
        }
    }

    async scrapeAll() {
        const results = {};

        for (const locale of this.LOCALES) {
            const data = await this.scrapeLocale(locale);
            if (data) {
                for (const [transationName, localeMap] of Object.entries(this.PRESET_TRANSLATIONS)) {
                    data[transationName] = localeMap[locale];
                }

                results[locale] = data;
            }
        }

        return results;
    }

    async saveToFile(data, path = 'translations.json') {
        try {
            await writeFile(path, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            this.handleScrapingError(error, { filePath: path });
            return false;
        }
    }
}