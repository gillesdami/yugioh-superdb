import initSqlJs from "sql.js";
import { resolve, dirname } from "path";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import genTables from "./genTables.js";

const SQL = await initSqlJs();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const path = resolve(__dirname, "..", "yugioh-superdb.sqlite");

export async function loadDb() {
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
