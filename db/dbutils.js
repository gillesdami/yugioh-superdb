import initSqlJs from "sql.js";
import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";

const SQL = await initSqlJs();
const path = resolve(import.meta.dirname, "..", "yugioh-superdb.sqlite");

export function loadDb() {
    const dbbuf = readFileSync(path);
    return new SQL.Database(dbbuf);
};

export function saveDb(db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(path, buffer);
};
