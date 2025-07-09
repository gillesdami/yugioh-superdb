import { loadDb, saveDb } from '../db/dbutils.js';

export class DbService {
  async open() {
    this.db = await loadDb();
  }

  setExists(setName, locale) {
    const result = this.db.exec(`
        SELECT id FROM cardset
        WHERE name = ? AND lang_id = (
            SELECT id FROM lang WHERE abbr = ?
        )
    `, [setName, locale]);

    return result[0]?.values[0]?.[0] !== undefined;
}

  insertOrReplaceSetDetails(setDetails) {
    try {
      this.db.exec('BEGIN TRANSACTION');

      // Insert reference data
      this.db.exec(`INSERT OR IGNORE INTO lang (abbr) VALUES (?)`, [setDetails.locale]);
      const langResult = this.db.exec(`SELECT id FROM lang WHERE abbr = ?`, [setDetails.locale]);
      const langId = langResult[0]?.values[0]?.[0];

      let setResult = this.db.exec(`SELECT id FROM cardset WHERE name = ? AND lang_id = ?`, [setDetails.setName, langId]);
      let setId = setResult[0]?.values[0]?.[0];

      if (setId === undefined) {
        this.db.exec(`INSERT OR IGNORE INTO cardset (name, release_date, lang_id) VALUES (?, ?, ?)`, [setDetails.setName, setDetails.releaseDate, langId]);
        
        // Handle null release date properly in the query
        if (setDetails.releaseDate === null) {
          setResult = this.db.exec(`SELECT id FROM cardset WHERE name = ? AND release_date IS NULL AND lang_id = ?`, [setDetails.setName, langId]);
        } else {
          setResult = this.db.exec(`SELECT id FROM cardset WHERE name = ? AND release_date = ? AND lang_id = ?`, [setDetails.setName, setDetails.releaseDate, langId]);
        }
        setId = setResult[0]?.values[0]?.[0];
      }

      // Only insert editions if we have card IDs
      if (setDetails.cardIds && setDetails.cardIds.length > 0) {
        for (let i = 0; i < setDetails.cardIds.length; i++) {
          const cardId = setDetails.cardIds[i];
          
          // Skip if cardId is null or undefined
          if (cardId === null || cardId === undefined) {
            continue;
          }

          // Insert set details
          this.db.exec(`
              INSERT OR REPLACE INTO edition (
                  card_id, cardset_id, card_number
              ) VALUES (?, ?, ?)
          `, [
              cardId,
              setId,
              setDetails.cardNumber,
          ]);
        }
      }

      this.db.exec('COMMIT');
      saveDb(this.db);
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  insertCard(cardData) {
    try {
      this.db.exec('BEGIN TRANSACTION');

      // Insert reference data
      this.db.exec(`INSERT OR IGNORE INTO lang (abbr) VALUES (?)`, [cardData.locale]);
      const langResult = this.db.exec(`SELECT id FROM lang WHERE abbr = ?`, [cardData.locale]);
      const langId = langResult[0]?.values[0]?.[0];

      let monsterTypeId = null;
      if (cardData.monsterType) {
        this.db.exec(`INSERT OR IGNORE INTO monster_type (name) VALUES (?)`, [cardData.monsterType]);
        const mtResult = this.db.exec(`SELECT id FROM monster_type WHERE name = ?`, [cardData.monsterType]);
        monsterTypeId = mtResult[0]?.values[0]?.[0];
      }

      this.db.exec(`INSERT OR IGNORE INTO attribute (name) VALUES (?)`, [cardData.attribute]);
      const attrResult = this.db.exec(`SELECT id FROM attribute WHERE name = ?`, [cardData.attribute]);
      const attributeId = attrResult[0]?.values[0]?.[0];

      const typeIds = [];
      for (const typeName of cardData.types) {
        this.db.exec(`INSERT OR IGNORE INTO type (name) VALUES (?)`, [typeName]);
        const typeResult = this.db.exec(`SELECT id FROM type WHERE name = ?`, [typeName]);
        typeIds.push(typeResult[0]?.values[0]?.[0]);
      }

      // Insert base card data
      this.db.exec(`
        INSERT OR IGNORE INTO card (
          id, monster_type_id, attribute_id,
          level_rank_arrows, atk, def, pendulum_scale
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        cardData.id,
        monsterTypeId,
        attributeId,
        cardData.levelRankArrows,
        cardData.atk,
        cardData.def,
        cardData.pendulumScale
      ]);

      // Insert type relationships
      for (const typeId of typeIds) {
        this.db.exec(`
          INSERT OR IGNORE INTO type_card (type_id, card_id)
          VALUES (?, ?)
        `, [typeId, cardData.id]);
      }

      // Insert localizations
      this.db.exec(`
        INSERT OR REPLACE INTO localization (
          card_id, lang_id, name, card_text, pendulum_effect
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        cardData.id,
        langId,
        cardData.name,
        cardData.cardText,
        cardData.pendulumEffect
      ]);

      this.db.exec('COMMIT');
      saveDb(this.db);
      return true;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  async getLastProcessedCardId() {
    const result = this.db.exec(`
SELECT MAX(id) as max_id FROM card`);
    return result.length && result[0].values[0][0] ? result[0].values[0][0] : 4006;
  }

  async validateCardData(cardData) {
    // Basic validation
    if (!cardData.id || cardData.id < 4007) {
      throw new Error('Invalid card ID, received: ' + cardData.id);
    }

    // Validate required fields
    if (!cardData.locale || !cardData.locale.length) {
      throw new Error('Missing localizations');
    }

    return true;
  }

  getBanlistId(date, region) {
    const regionId = this.getOrCreateRegionId(region);
    const banlistResult = this.db.exec(`SELECT id FROM banlist WHERE effective_date = ? AND region_id = ?`, [date, regionId]);
    return banlistResult[0]?.values[0]?.[0];
  }

  getOrCreateBanlistId(date, region) {
    const regionId = this.getOrCreateRegionId(region);
    this.db.exec(`INSERT OR IGNORE INTO banlist (effective_date, region_id) VALUES (?, ?)`, [date, regionId]);
    const banlistResult = this.db.exec(`SELECT id FROM banlist WHERE effective_date = ? AND region_id = ?`, [date, regionId]);
    return banlistResult[0]?.values[0]?.[0];

  }

  getOrCreateRegionId(region) {
    this.db.exec(`INSERT OR IGNORE INTO region (region) VALUES (?)`, [region]);
    const regionResult = this.db.exec(`SELECT id FROM region WHERE region = ?`, [region]);
    return regionResult[0]?.values[0]?.[0];
  }

  saveLimitation(banlistId, cardId, listId) {
    const limitation = listId === 'list_forbidden' ? 0 : listId === 'list_limited' ? 1 : 2;
    this.db.exec(`INSERT OR IGNORE INTO limitation (banlist_id, card_id, limitation) VALUES (?, ?, ?)`, [banlistId, cardId, limitation]);
  }

  close() {
    saveDb(this.db);
  }
}