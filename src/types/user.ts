export const UserStatus = {
  Pending: "P",
  Verified: "V",
  Blocked: "B",
  Deleted: "D",
} as const;

export type UserType = {
  uid: string;
  rowid: number;
  verify_code: string;
  lastname: string;
  pass: string;
  session: string;
  email: string;
  firstname: string;
  status: (typeof UserStatus)[keyof typeof UserStatus];
};
