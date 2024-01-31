import Database from "bun:sqlite";

export const getUserBy = async (
  db: Database,
  field: string,
  value: string
): Promise<any | string> => {
  const queryUserBy = `SELECT rowid,* FROM tbl_user WHERE ${field} = $1`;
  const query = db.query(queryUserBy);
  const result = query.get(value);
  return result;
};
