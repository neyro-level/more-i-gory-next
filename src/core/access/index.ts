import type { Access } from "payload";

export const isOwnerAccess: Access = ({ req }) =>
  req.user?.collection === "users" && req.user.role === "owner";

export const ownerOrSelfAccess: Access = ({ req }) => {
  if (req.user?.collection !== "users") return false;
  if (req.user.role === "owner") return true;
  return { id: { equals: req.user.id } };
};
