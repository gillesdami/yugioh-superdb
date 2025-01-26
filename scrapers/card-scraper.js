import { BaseScraper } from './base-scraper.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { type } from 'os';

export class CardScraper extends BaseScraper {
    constructor() {
        super();
        this.BASE_CARD_URL = 'https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=ID&request_locale=LOC';
        this.START_ID = 4007;
        this.currentId = this.START_ID;
        this.translations = this.loadTranslations();
    }

    loadTranslations() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const translationsPath = resolve(__dirname, '../translations.json');
        const translationsData = fs.readFileSync(translationsPath, 'utf-8');
        return JSON.parse(translationsData);
    }

    async scrapeCard(cardId) {
        const results = [];

        for (const locale of this.LOCALES) {
            try {
                const url = this.getCardUrl(cardId, locale);
                const document = await this.parseHTML(url);

                const cardData = {
                    id: cardId,
                    locale,
                    ...this.extractCardData(document)
                };

                this.translateScrapedCard(cardData, locale);

                results.push(cardData);
            } catch (error) {
                this.handleScrapingError(error, { cardId, locale });
            }
        }

        return results;
    }

    translateScrapedCard(cardData, locale) {
        const toTranslation = this.translations['en'];
        const fromTranslation = this.translations[locale];

        const isSpell = cardData.attribute.includes(fromTranslation.Spell);
        if (isSpell) {
            cardData.attribute = cardData.attribute.replace(fromTranslation.Spell, '').trim();
        }
        const isTrap = cardData.attribute.includes(fromTranslation.Trap);
        if (isTrap) {
            cardData.attribute = cardData.attribute.replace(fromTranslation.Trap, '').trim();
        }

        const attributeId = Object.entries(fromTranslation.attribute)
            .find(([_, value]) => value === cardData.attribute)?.[0];

        if (toTranslation.attribute[attributeId]) {
            cardData.attribute = toTranslation.attribute[attributeId];

            if (isSpell) {
                cardData.attribute += ` ${toTranslation.Spell}`;
            } else if (isTrap) {
                cardData.attribute += ` ${toTranslation.Trap}`;
            }
        } else {
            console.warn(`Warning: No translation found for attribute ${cardData.attribute}`);
        }

        if (cardData.monsterType) {
            const monsterTypeId = Object.entries(fromTranslation.monster_type)
                .find(([_, value]) => value === cardData.monsterType)?.[0];

            if (toTranslation.monster_type[monsterTypeId]) {
                cardData.monsterType = toTranslation.monster_type[monsterTypeId];
            } else {
                console.warn(`Warning: No translation found for monster_type ${cardData.monsterType}`);
            }
        }

        const typeIds = cardData.types.map(type =>
            Object.entries(fromTranslation.type)
                .find(([_, value]) => value === type)?.[0]
        );

        cardData.types = typeIds.map((typeId, i) => {
            if (toTranslation.type[typeId]) {
                return toTranslation.type[typeId];
            } else {
                console.warn(`Warning: No translation found for type ${cardData.types[i]}`);
                return undefined;
            }
        }).filter(type => type !== undefined);
    }

    getCardUrl(cardId, locale) {
        return this.BASE_CARD_URL
            .replace('ID', cardId)
            .replace('LOC', locale);
    }

    extractCardData(document) {
        const cardElement = document.querySelector('#CardSet');
        if (!cardElement) throw new Error('NoDataFound');

        const itemBoxes = document.querySelectorAll('.item_box_value');

        // Get basic card info
        const attribute = this.extractText(itemBoxes[0]);

        let levelRankArrows;
        if (itemBoxes[1]) {
            const linkIcon = itemBoxes[1]?.querySelector('.icon_img_set');
            if (linkIcon) {
                levelRankArrows = this.calculateLinkArrows(linkIcon)
            } else {
                levelRankArrows = this.extractNumber(itemBoxes[1]);
            }
        }

        const atk = this.extractNumber(itemBoxes[2]);
        const def = this.extractNumber(itemBoxes[3]);
        const pendulumScale = this.extractNumber(itemBoxes[4]);

        const name = this.extractText(cardElement, '#cardname h1').split('\n')[0];
        const cardText = [...document.querySelector('.CardText > .item_box_text')
            ?.childNodes].slice(2).map(tn => tn.textContent?.trim()).join('\n') ?? '';
        const pendulumEffect = this.extractText(cardElement, '.pen_effect > .item_box_text');

        const types = Array.from(cardElement.querySelectorAll('.species span'))
            .map(span => span.textContent.trim())
            .filter(type => type !== '／' && type !== '/');
        const monsterType = types.shift() ?? null

        return {
            atk,
            attribute,
            cardText,
            def,
            levelRankArrows,
            monsterType,
            name,
            pendulumEffect,
            pendulumScale,
            types,
        };
    }

    calculateLinkArrows(linkIcon) {
        const linkClass = Array.from(linkIcon.classList).find(c => c.startsWith('link'));
        if (!linkClass) return null;

        const arrowDigits = linkClass.replace('link', '');
        return arrowDigits
            .split('')
            .map(d => parseInt(d, 10))
            .reduce((sum, arrow) => sum + Math.pow(2, arrow - 1), 0);
    }

    extractNumber(element, selector) {
        const text = this.extractText(element, selector);
        if (!text) {
            return null;
        }

        const cleanText = text.replace(/[^0-9.]/g, '');
        const number = parseInt(cleanText, 10);
        return Number.isNaN(number) ? null : number;
    }

    extractFromItemBox(cardElement, title) {
        const itemBox = Array.from(cardElement.querySelectorAll('.item_box'))
            .find(box => box.querySelector('.item_box_title')?.textContent?.trim() === title);

        if (!itemBox) return null;

        const valueElement = itemBox.querySelector('.item_box_value');
        return valueElement?.textContent?.trim() || null;
    }

    async *scrapeCards(startId = this.START_ID) {
        this.currentId = startId;

        while (true) {
            try {
                const cardData = await this.scrapeCard(this.currentId);
                yield cardData;
                this.currentId++;
            } catch (error) {
                this.handleScrapingError(error, { cardId: this.currentId });
                break;
            }
        }
    }
}