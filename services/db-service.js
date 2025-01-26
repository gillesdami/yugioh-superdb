import { loadDb, saveDb } from '../db/dbutils.js';

export class DbService {
  async open() {
    this.db = await loadDb();
  }

  async insertCard(cardData) {
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

  async close() {
    saveDb(this.db);
  }
}