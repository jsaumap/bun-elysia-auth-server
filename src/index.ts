import { Elysia } from "elysia";
import { authController } from "./controllers/auth.controller";
import { createTables } from "./models/database";
import { getDB } from "./database/sqlite";
const db = getDB();

const seed = async () => {
  try {
    const created = await createTables(db);
    return { status: true, created };
  } catch (error) {
    console.log(error);
    return { status: false, error };
  }
};

const getAll = async () => {
  try {
    const sql = `SELECT rowid,  * FROM tbl_user`;
    const query = db.query(sql);
    const all = query.all();
    return { status: true, all };
  } catch (error) {
    console.log(error);
    return { status: false, error };
  }
};

const insertSeed = async () => {
  try {
    const sql = `INSERT INTO tbl_user (uid, verify_code, lastname, pass, session, email, firstname, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
    const query = db.query(sql);
    query.run(
      "1",
      "123",
      "Doe",
      "123",
      "123",
      "mail@mail.io",
      "John",
      "verified"
    );
    return { status: true };
  } catch (error) {
    console.log(error);
    return { status: false, error: error.message };
  }
};

const dropUserTable = async () => {
  try {
    const sql = `DROP TABLE tbl_user`;
    const query = db.query(sql);
    query.run();
    return { status: true };
  } catch (error) {
    console.log(error);
    return { status: false, error: error.message };
  }
};

const app = new Elysia()
  .use(authController)
  .get("/", seed)
  .get("/seed", insertSeed)
  .get("/drop", dropUserTable)
  .get("/all", getAll)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
