export const IS_DEBUG = false;

export const JWT_SECRET =
  process.env.JWT_SECRET || "1fef2b04-ce17-4365-bfa4-0394c7441dfd";

export const SALT_PASS_SEPARATOR = "~";

// a prefix on all transactional emails so that user can easily apply mailbox rules
export const EMAIL_SUBJECT_PREFIX = "[jasu]";

export const APP_SECRET =
  process.env.APP_SECRET || "e2b56457-9301-4724-aeb5-72fd8b3b315a";
export const API_PREFIX = "/api";
export const API_KEY = "c37861c7-7414-4a40-bbd8-3343662e4483";
export const API_HEADER = "x-api-key";

// Lifetime of the JWT token
export const JWT_EXPIRY = 15 * 60; // minutes in seconds
// Lifetime of the refresh token
export const JWT_REFRESH_EXPIRY = 30 * 24 * 60 * 60; // days in seconds
// The refresh token will be changed after this interval
export const JWT_REFRESH_INTERVAL = JWT_REFRESH_EXPIRY / 2;

export const RESULT_OK = { result: "ok" };
export const ERROR_NO_DB = { error: "no database connection" };
export const ERROR_TOKEN_EXPIRED = { error: "token expired" };
export const ERROR_USER_UNVERIFIED = { error: "user not verified" };
export const ERROR_DB_UPDATE = { error: "could not apply update" };
export const ERROR_INVALID_INPUT = { error: "invalid input" };
export const ERROR_INVALID_CREDENTIALS = { error: "invalid credentials" };
