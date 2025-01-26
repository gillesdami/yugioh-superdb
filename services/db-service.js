import { loadDb, saveDb } from '../db/dbutils.js';

export class DbService {
  constructor() {
    this.db = loadDb();
  }

  async insertCard(cardData) {
    try {
      this.db.exec('BEGIN TRANSACTION');
      
      // Insert base card data
      this.db.exec(`
        INSERT OR IGNORE INTO card (
          id, monster_type_id, attribute_id, 
          level_rank_arrows, atk, def, pendulum_scale
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        cardData.id,
        cardData.monsterTypeId,
        cardData.attributeId,
        cardData.levelRankArrows,
        cardData.atk,
        cardData.def,
        cardData.pendulumScale
      ]);

      // Insert localizations
      for (const localeData of cardData.localizations) {
        this.db.exec(`
          INSERT OR REPLACE INTO localization (
            card_id, lang_id, name, card_text, pendulum_effect
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          cardData.id,
          localeData.langId,
          localeData.name,
          localeData.cardText,
          localeData.pendulumEffect
        ]);
      }

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
      throw new Error('Invalid card ID');
    }

    // Validate required fields
    if (!cardData.localizations || !cardData.localizations.length) {
      throw new Error('Missing localizations');
    }

    return true;
  }

  async close() {
    saveDb(this.db);
  }
}