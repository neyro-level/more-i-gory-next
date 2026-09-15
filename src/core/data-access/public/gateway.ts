import "server-only";

import type { SelectType, Where } from "payload";
import type { z } from "zod";

import type { PublicQueryContract } from "../../query/index.ts";

export type PublicReadResult<RawDocument> = Readonly<{
  docs: readonly RawDocument[];
}>;

export type PublicReadPort<RawDocument, Select extends SelectType> = (
  query: PublicQueryContract<Select>,
) => Promise<PublicReadResult<RawDocument>>;

export type PublicGatewayConfig<
  Input,
  RawDocument,
  DTO,
  Select extends SelectType,
> = Readonly<{
  depth: number;
  inputSchema: z.ZodType<Input>;
  isPublished: (document: RawDocument) => boolean;
  limit: number;
  map: (document: RawDocument) => unknown;
  outputSchema: z.ZodType<DTO>;
  publicationWhere: (input: Input) => Where;
  read: PublicReadPort<RawDocument, Select>;
  select: Select;
}>;

export interface PublicGateway<DTO> {
  findMany(input: unknown): Promise<readonly DTO[]>;
}

export function createPublicGateway<
  Input,
  RawDocument,
  DTO,
  Select extends SelectType,
>(config: PublicGatewayConfig<Input, RawDocument, DTO, Select>): PublicGateway<DTO> {
  if (!Number.isInteger(config.depth) || config.depth < 0) {
    throw new Error("Public Gateway depth must be a non-negative integer.");
  }
  if (!Number.isInteger(config.limit) || config.limit < 1) {
    throw new Error("Public Gateway limit must be a positive integer.");
  }

  return {
    async findMany(input) {
      const parsedInput = config.inputSchema.parse(input);
      const result = await config.read({
        depth: config.depth,
        limit: config.limit,
        overrideAccess: false,
        pagination: false,
        select: config.select,
        where: config.publicationWhere(parsedInput),
      });

      return result.docs
        .filter(config.isPublished)
        .map((document) => config.outputSchema.parse(config.map(document)));
    },
  };
}
