import { getDB } from "../database/sqlite";

const allTables = `CREATE TABLE IF NOT EXISTS tbl_user (
    uid TEXT PRIMARY KEY,
    verify_code TEXT,
    lastname TEXT NOT NULL,
    pass TEXT NOT NULL,
    session TEXT NOT NULL,
    email TEXT NOT NULL,
    firstname TEXT NOT NULL,
    status TEXT NOT NULL
);`;

export const createTables = async () => {
  const query = getDB().query(allTables);
  query.run();
  return true;
};
