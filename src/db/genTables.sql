-- Language abbreviation (e.g., 'en', 'fr')
CREATE TABLE lang(
    id INTEGER PRIMARY KEY,
    abbr TEXT NOT NULL UNIQUE
);

-- monster types in english if it exists (e.g., Dragon, Warrior)
CREATE TABLE monster_type(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Card types (Normal,Effect,Fusion,Flip,Special summon,Ritual,Toon,Spirit,Union,Gemini,Synchro,Tuner,Xyz,Pendulum,Link)
CREATE TABLE type(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE 
);

-- Associates cards with their respective types (many-to-many relationship)
CREATE TABLE type_card(
    type_id INTEGER,
    card_id INTEGER,

    PRIMARY KEY (type_id, card_id),
    FOREIGN KEY(type_id) REFERENCES type(id),
    FOREIGN KEY(card_id) REFERENCES card(id)
);

-- Card attributes (LIGHT,EARTH,WIND,DARK,FIRE,WATER,DIVINE,Equip Spell,Normal Spell,Continuous Trap,Field Spell,Normal Trap,Ritual Spell,Continuous Spell,Counter Trap,Quick-Play Spell)
CREATE TABLE attribute(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Stores localized (translated) information for cards.
CREATE TABLE localization(
    id INTEGER PRIMARY KEY,
    card_id INTEGER,
    lang_id INTEGER,
    name TEXT,
    card_text TEXT,
    pendulum_effect TEXT,

    FOREIGN KEY(card_id) REFERENCES card(id),
    FOREIGN KEY(lang_id) REFERENCES lang(id)
);

-- Central table containing core card data
CREATE TABLE card(
    id INTEGER PRIMARY KEY, -- yugioh db.yugioh-card.com card id
    monster_type_id INTEGER, -- monster type id or null if the card is not a monster
    attribute_id INTEGER,
    -- level of the card if it is a non xyz, non link monster
    -- rank of the card if it is a xyz monster
    -- If this is a link monster level_rank_arrows is a flag for link monster, the flag is computed from 
    -- the numpads position of the arrows with the formula
    -- SUM(2^(x-1)) where x is every number on the numpad that match with a link arrow
    -- ex: bottom right+top arrow = 2^(3-1) + 2^(8-1) = 4 + 128 = 132
    level_rank_arrows INTEGER, -- null if not a monster
    atk INTEGER, -- null if atk is the special value "?" or if it is not a monster
    def INTEGER, -- null if def is the special value "?" or if it is not a monster
    pendulum_scale INTEGER, -- null if it is not a pendulum monster

    FOREIGN KEY(monster_type_id) REFERENCES monster_type(id),
    FOREIGN KEY(attribute_id) REFERENCES attribute(id)
);

-- A set of cards, usually a booster pack or structure deck
CREATE TABLE cardset(
    id INTEGER PRIMARY KEY, -- yugioh db.yugioh-card pack id (pid)
    name TEXT, -- ex: DESTINY SOLDIERS
    release_date DATE, -- ex: 2016-04-16 maybe null if not known
    lang_id INTEGER,

    FOREIGN KEY(lang_id) REFERENCES lang(id)
);

-- Rarity of a card
CREATE TABLE rarity(
    name TEXT NOT NULL, -- ex: SR
    long_name TEXT NOT NULL, -- ex: Super Rare

    PRIMARY KEY (name, long_name)
);

-- A card can have multiple editions in the same or different cardset, each edition have a rarity
CREATE TABLE edition_rarity(
    edition_rowid INTEGER,
    rarity_rowid INTEGER,

    PRIMARY KEY (edition_rowid, rarity_rowid),
    FOREIGN KEY(edition_rowid) REFERENCES edition(rowid),
    FOREIGN KEY(rarity_rowid) REFERENCES rarity(rowid)
);

-- A card can have multiple editions in the same or different cardset, each edition have a card number
CREATE TABLE edition(
    card_id INTEGER,
    cardset_id INTEGER,
    card_number TEXT NOT NULL, -- ex: AP08-EN001, null for some cards

    PRIMARY KEY (card_id, cardset_id, card_number),
    FOREIGN KEY(card_id) REFERENCES card(id),
    FOREIGN KEY(cardset_id) REFERENCES cardset(id)
);

-- The maximum number of card allowed in a deck, side deck or extra deck
CREATE TABLE limitation(
    banlist_id INTEGER,
    card_id INTEGER,
    limitation INTEGER, -- ex: 0 = forbidden, 1 = limited, 2 = semi_limited

    PRIMARY KEY (banlist_id, card_id),
    FOREIGN KEY(banlist_id) REFERENCES banlist(id)
);

-- A region of a banlist, ex: TCG (Trading Card Game), OCG (Official Card Game). OCG is for cards in ja, ko and ae; TCG is for cards in en, fr, de, it, es and pt.
CREATE TABLE region(
    id INTEGER PRIMARY KEY,
    region TEXT NOT NULL UNIQUE -- TCG, OCG
);

-- A banlist is a list of cards that are limited, semi-limited or forbidden in a specific region from a date and until another banlist is released
CREATE TABLE banlist(
    id INTEGER PRIMARY KEY,
    region_id INTEGER,
    effective_date DATE,
    until_date DATE, -- The day before the next banlist effective_date of the same region, or NULL if there is no next banlist

    FOREIGN KEY(region_id) REFERENCES region(id)
);
