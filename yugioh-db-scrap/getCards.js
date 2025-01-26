import { JSDOM } from "jsdom";
import { loadDb, saveDb } from "../db/dbutils.js";
//1
const db = loadDb();

const DEFAULT_START_ID = 4007;
const LOCALS = ["en", "fr", "ja", "de", "ae", "cn", "es", "it", "ko", "pt"];

getCards();

async function getCards() {
    const lastCardIdResult = db.exec("SELECT id FROM card_property SORTBY id LIMIT 1");
    const cid = lastCardIdResult?.[0]?.values?.[0] ?? DEFAULT_START_ID;
    const ctm = new CardTypeManager();

    while (true) {
        let local, doc;
        for (local of LOCALS) {
            doc = await getCardDoc(cid, local);
            if (doc !== null) {
                break;
            }
        }

        if (doc === null) {
            cid++;
            continue;
        }

        const boxProperties = getCardBoxProperties(doc);
        const cardProp = {
            attribute_id: undefined,
            level_ranl_arrows: null,
            atk: null,
            def: null,
            pend_scale: null
        };

        const cardTypes = ctm.getTranslatedIds(
            getCardDocTypes(doc),
            cid,
            local
        );


    }
}

async function getCardDoc(cid, local) {
    const setPageResponse = await fetch(`https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=${cid}&request_locale=${local}`);
    const setPage = await setPageResponse.text();
    const document = new JSDOM(setPage).window.document;

    if (document.getElementsByClassName("no_data").length) {
        return null;
    }

    return document;
}

function getCardDocTypes(doc) {
    return doc.getElementsByClassName("species")[0].innerText.split(/ \/ | ／ /);
}

function getCardBoxProperties(doc) {
    const properties = [...doc.getElementsByClassName("item_box_value")];

    return {
        attribute_id: getAttributeId(properties[0].innerText),
        level_rank_arrows: properties[1],
        atk: null,
        def: null,
        pend_scale: null
    };
}

class CardTypeManager {
    async getTranslatedIds(types, cid, local) {
        const enTypes = await this.getTranslations(types, cid, local);
        return enTypes.map(t => this.getId(t));
    }

    async getTranslations(types, cid, local) {
        const enTypes = [];
        let enDoc;

        for (const [i, type] of Object.entries(types)) {
            if (!enDoc && !this.getCached(type, local)) {
                enDoc = await getCardDoc(cid, "en");
                if (cardDoc === null) {
                    console.warn(`could not retrieve type translations for ${type}`);
                    enTypes.push(type);
                    continue;
                }
            }

            if (!this.getCached(type, local)) {
                this.setCached(type, local, getCardDocTypes(enDoc)[i]);
            }

            enTypes.push(this.getCached(type, local));
        }

        return enTypes;
    }

    getCached(type, local) {
        return CardTypeManager.typeCache[`${local}:${type}`];
    }

    setCached(type, local, translation) {
        return CardTypeManager.typeCache[`${local}:${type}`] = translation;
    }

    getId(type) {
        db.run("INSERT OR IGNORE INTO card_type(name) VALUES (?)", [type]);
        const res = db.exec("SELECT id FROM card_type WHERE name = ?", [type]);
        return res[0].values[0][0];
    }
}

CardTypeManager.typeCache = {}
