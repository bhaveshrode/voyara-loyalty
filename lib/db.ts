import fs from "node:fs";
import path from "node:path";
import type { Database } from "@/lib/types";

const runtimePath = path.join(process.cwd(), "data", "platform.json");
const seedPath = path.join(process.cwd(), "data", "seed.json");

export function readDb(): Database {
  const target = fs.existsSync(runtimePath) ? runtimePath : seedPath;
  return JSON.parse(fs.readFileSync(target, "utf8")) as Database;
}

export function writeDb(database: Database) {
  fs.mkdirSync(path.dirname(runtimePath), { recursive: true });
  fs.writeFileSync(runtimePath, `${JSON.stringify(database, null, 2)}\n`);
}

export function updateDb(mutator: (database: Database) => void): Database {
  const database = readDb();
  mutator(database);
  writeDb(database);
  return database;
}
