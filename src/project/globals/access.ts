import type { Access } from "payload";

export const isAuthenticatedUserAccess: Access = ({ req }) => req.user?.collection === "users";

export const isOwnerAccess: Access = ({ req }) =>
  req.user?.collection === "users" && req.user.role === "owner";

export const publicReadAccess: Access = ({ req }) => {
  if (req.payloadAPI === "local") return true;
  return isAuthenticatedUserAccess({ req });
};
