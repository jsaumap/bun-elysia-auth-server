import { Database } from "bun:sqlite";

/* interface DBResult extends QueryResult {
  error?: string;
} */
const IS_DEBUG = true;
let db: Database;

export const getDB = (): Database => {
  if (!db) {
    db = new Database("mydb.sqlite");
  }
  return db;
};
