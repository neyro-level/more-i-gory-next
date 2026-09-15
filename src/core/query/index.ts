import type { SelectType, Where } from "payload";

export type PublicQueryContract<Select extends SelectType> = Readonly<{
  depth: number;
  limit: number;
  overrideAccess: false;
  pagination: false;
  select: Select;
  where: Where;
}>;
