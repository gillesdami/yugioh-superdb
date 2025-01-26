import { writeFileSync, readFileSync } from "fs";
import initSqlJs from "sql.js";
import { resolve } from "path";

export default async function genTables() {
    const SQL = await initSqlJs();
    const db = new SQL.Database();

    const tables_sql = readFileSync(resolve(import.meta.dirname, "genTables.sql"), "utf-8");
    db.run(tables_sql);

    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync("yugioh-superdb.sqlite", buffer);
}
