CREATE TABLE lang(
    id INTEGER PRIMARY KEY,
    abbr TEXT NOT NULL UNIQUE -- ex: fr
);

-- card informations

CREATE TABLE monster_type(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE -- english card type if the card type exist in english else in japanese, ex: Dragon
);

CREATE TABLE type(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE -- english card type, ex: Cyberse
);

---- a table to join 1 card to many types
CREATE TABLE type_card(
    type_id INTEGER,
    card_id INTEGER,

    PRIMARY KEY (type_id, card_id),
    FOREIGN KEY(type_id) REFERENCES type(id),
    FOREIGN KEY(card_id) REFERENCES card(id)
);

CREATE TABLE attribute(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE -- english card attribute ex: light, continuousspell, etc...
);

-- this table describle the card informations that are subject to change depending on the locale
CREATE TABLE localization(
    id INTEGER PRIMARY KEY,
    card_id INTEGER,
    lang_id INTEGER,
    name TEXT, -- ex: Fiendish Chain
    card_text TEXT, -- ex: Draw 2 cards.
    pendulum_effect TEXT, -- null if not concerned

    FOREIGN KEY(card_id) REFERENCES card(id),
    FOREIGN KEY(lang_id) REFERENCES lang(id)
);

CREATE TABLE card(
    id INTEGER PRIMARY KEY, -- yugioh db.yugioh-card id
    monster_type_id INTEGER, -- monster type or null if not concerned
    attribute_id INTEGER, -- card attribute
    -- level_rank_arrows is a flag for link monster, the flag is computed from 
    -- the numpads position of the arrows with the formula
    -- SUM(2^(x-1)) where x is every number on the numpad that match with a link arrow
    level_rank_arrows INTEGER, -- null if not concerned
    atk INTEGER, -- null if "?" or not concerned
    def INTEGER, -- null if "?" or not concerned
    pendulum_scale, -- null if not concerned

    FOREIGN KEY(monster_type_id) REFERENCES monster_type(id),
    FOREIGN KEY(attribute_id) REFERENCES attribute(id)
);

-- sets infomations

CREATE TABLE cardset(
    id INTEGER PRIMARY KEY,
    name TEXT, -- ex: DESTINY SOLDIERS
    release_date DATE,
    lang_id INTEGER,

    FOREIGN KEY(lang_id) REFERENCES lang(id)
);

CREATE TABLE rarity(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE -- ex: SR
);

CREATE TABLE edition(
    id INTEGER PRIMARY KEY,
    card_id INTEGER,
    card_number TEXT NOT NULL UNIQUE, -- ex: AP08-EN001
    cardset_id INTEGER,
    rarity_id INTEGER,

    FOREIGN KEY(card_id) REFERENCES card(id),
    FOREIGN KEY(cardset_id) REFERENCES cardset(id),
    FOREIGN KEY(rarity_id) REFERENCES rarity(id)
);

-- ban list informations

CREATE TABLE limitation(
    id INTEGER PRIMARY KEY,
    banlist_id INTEGER,
    card_id INTEGER, -- REFERENCES card(id)
    limitation INTEGER, -- ex: 0 = forbidden, 1 = limited, 2 = semi_limited

    FOREIGN KEY(banlist_id) REFERENCES banlist(id)
);

CREATE TABLE region(
    id INTEGER PRIMARY KEY,
    region TEXT NOT NULL UNIQUE -- TCG, OCG, MD
);

CREATE TABLE banlist(
    id INTEGER PRIMARY KEY,
    region_id INTEGER,
    effective_date DATE,

    FOREIGN KEY(region_id) REFERENCES region(id)
);
