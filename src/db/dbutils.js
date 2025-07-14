import initSqlJs from "sql.js";
import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";

const sqliteFile = resolve(import.meta.dirname, "..", "..", "dist", "assets", "yugioh-superdb.sqlite");

export async function loadDb() {
    const SQL = await initSqlJs();
    const dbbuf = readFileSync(sqliteFile);
    return new SQL.Database(dbbuf);
};

export function saveDb(db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(sqliteFile, buffer);
};
