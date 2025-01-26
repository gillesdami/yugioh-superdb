import initSqlJs from "sql.js";
import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";
import genTables from "./genTables.js";

const SQL = await initSqlJs();
const path = resolve(import.meta.dirname, "..", "yugioh-superdb.sqlite");

export function loadDb() {
    try {
        const dbbuf = readFileSync(path);
        return new SQL.Database(dbbuf);
    } catch {
        return genTables();
    }
};

export function saveDb(db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(path, buffer);
};
