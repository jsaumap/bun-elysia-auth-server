import { Elysia, t } from "elysia";
import { getDB } from "../database/sqlite";
import { uuidv4 } from "../utils/misc";
import {
  getUserJWT,
  getUserRefreshToken,
  hashPassword,
  validateRefreshToken,
  validateToken,
} from "../utils/auth";
import { UserStatus, UserType } from "../types/user";
import Database from "bun:sqlite";
import {
  ERROR_DB_UPDATE,
  ERROR_INVALID_CREDENTIALS,
  ERROR_INVALID_INPUT,
  RESULT_OK,
} from "../utils/constants";
import { getUserBy } from "../utils/db";

export const authController = new Elysia({ prefix: "/auth" })
  .post("/signup", ({ body }) => authSignup(body), {
    body: t.Object({
      firstName: t.String(),
      lastName: t.String(),
      email: t.String(),
      password: t.String(),
    }),
  })
  .post("/verify", ({ body }) => authVerify(body), {
    body: t.Object({
      verifyCode: t.String(),
    }),
  })
  .post("/login", ({ body }) => authLogin(body), {
    body: t.Object({
      inputEmail: t.String(),
      inputPass: t.String(),
    }),
  })
  .post("/logout", ({ request: { headers } }) => authLogout(headers))
  .post("/authForgotPassword", ({ body }) => authForgotPassword(body), {
    body: t.Object({
      email: t.String(),
    }),
  })
  .post("/authResetPassword", ({ body }) => authSignup(body), {
    body: t.Object({
      firstName: t.String(),
      lastName: t.String(),
      email: t.String(),
      password: t.String(),
    }),
  })
  .post("/authRefresh", ({ body }) => authRefresh(body), {
    body: t.Object({
      refreshToken: t.String(),
    }),
  });

const emailExists = (db: ReturnType<typeof getDB>, email: string) => {
  return false;
  //return db.get("SELECT * FROM users WHERE email = ?", email);
};

const addUser = async (
  db: ReturnType<typeof getDB>,
  email: string,
  password: string,
  verifyCode: string,
  firstname: string = "",
  lastname: string = ""
): Promise<any | string> => {
  const uid = uuidv4();
  const sql = `INSERT INTO tbl_user (uid, firstname, lastname, email, pass, verify_code, session , status) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING uid`;

  const query = db.query(sql);
  const result = query.get(
    uid,
    firstname,
    lastname,
    email,
    password,
    verifyCode,
    "session",
    UserStatus.Pending
  );

  return result;
};

const deleteUser = () => {};

const updateUser = () => {};

const updatePassword = () => {};

const authSignup = async (body: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => {
  const db = getDB();
  const { firstName, lastName, email, password } = body;
  if (await emailExists(db, email)) {
    throw new Error("Email already exists");
  }
  const salt = uuidv4(false);
  const hashedPassword = hashPassword(password, salt);
  const savedPassword = `${salt}${"SALT_PASS_SEPARATOR"}${hashedPassword}`;

  const verifyCode = uuidv4(false);

  const addResult = await addUser(
    db,
    email.toLowerCase(),
    savedPassword,
    verifyCode,
    firstName.trim(),
    lastName.trim()
  );
  if (!addResult || typeof addResult === "string")
    return { error: `error: ${addResult}` };

  // send verification email
  /* sendEmail(
    inputEmail,
    "Please verify your email",
    `call authVerify API with this code to verify your email ${verifyCode}`
  ); */

  return { result: addResult.value };
};

const authVerify = ({ verifyCode }: { verifyCode: string }) => {
  const db = getDB();
  const sql =
    `UPDATE tbl_user SET status = '${UserStatus.Verified}', verify_code = null WHERE ` +
    `verify_code = $1 AND status = '${UserStatus.Pending}' RETURNING uid`;
  console.log(sql);
  const query = db.query(sql);
  try {
    const result = query.run(verifyCode);
    return { status: true, result };
  } catch (error) {
    console.log(error);
    return { status: false, error };
  }
};

const saveRefreshToken = (
  db: Database,
  uid: string,
  refreshToken: string
): any => {
  const sql = `UPDATE tbl_user SET session = $1 WHERE uid = $2 RETURNING uid`;
  const query = db.query(sql);
  const result = query.get(refreshToken, uid);
  return result;
};

const authLogin = ({
  inputEmail,
  inputPass,
}: {
  inputEmail: string;
  inputPass: string;
}) => {
  const db = getDB();
  const sql = `SELECT rowid,* FROM tbl_user WHERE email = $1`;
  const query = db.query(sql);
  const user = query.get(inputEmail) as UserType;
  if (!user) {
    return { status: false, error: "User not found" };
  }
  const [salt, hashedPassword] = user.pass.split("SALT_PASS_SEPARATOR");
  const hashedInputPass = hashPassword(inputPass, salt);
  if (hashedInputPass !== hashedPassword) {
    return { status: false, error: "Wrong password" };
  }
  // Check if user is activated only after password has been verified
  if (user.status !== UserStatus.Verified) {
    return { status: false, error: "User not verified" };
  }
  // Generate JWT and refreshToken for user
  const userJwt = getUserJWT(user.rowid, user.uid);
  const userRefreshToken = getUserRefreshToken(user.uid);

  const saveResult = saveRefreshToken(db, user.uid, userRefreshToken);
  if (!saveResult) return ERROR_DB_UPDATE;
  return {
    status: true,
    result: { userUid: user.uid, userJwt, userRefreshToken },
  };
};

const authLogout = (headers: Headers) => {
  const authorization = headers.get("authorization");
  if (!authorization) return { status: false, error: "User not authorized(1)" };
  const token = authorization.split(" ")[1];
  if (!token) return { status: false, error: "User not authorized(2)" };
  const userOrError = validateToken(token);
  if (userOrError.error) {
    return ERROR_INVALID_CREDENTIALS;
  }
  const { uid } = userOrError.result;
  const db = getDB();

  const resultSave = saveRefreshToken(db, uid, "");
  if (!resultSave) return ERROR_DB_UPDATE;
  return {
    status: true,
    result: { message: "Session ended" },
  };
};

const authRefresh = async ({ refreshToken }: { refreshToken: string }) => {
  const db = getDB();
  const rtResult = validateRefreshToken(refreshToken);
  if (rtResult.error || !rtResult.userId) return ERROR_INVALID_INPUT;

  // refresh token passes all tests. Check if it exists in database to confirm authenticity
  const userInfo = await getUserBy(db, "session", refreshToken);
  if (!userInfo) return ERROR_INVALID_CREDENTIALS;
  const { uid, rowid } = userInfo;

  // compare user uuid in token with database
  if (rtResult.userId !== uid) return ERROR_INVALID_CREDENTIALS;

  // Generate JWT and refreshToken for user
  const userJwt = getUserJWT(rowid, uid);
  const now = new Date();
  if (now < rtResult.renewDate!) {
    return { result: { token: userJwt, refreshToken: refreshToken } };
  }
  const userRefreshToken = getUserRefreshToken(uid);

  const resultSave = saveRefreshToken(db, uid, userRefreshToken);
  if (!resultSave) return ERROR_DB_UPDATE;

  return { userJwt, userRefreshToken };
};

const authForgotPassword = ({ email }: { email: string }) => {};

const authResetPassword = () => {};
