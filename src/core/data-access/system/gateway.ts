import "server-only";

import { z } from "zod";

import type {
  BootstrapOwnerInput,
  BootstrapOwnerResult,
} from "./bootstrap-owner.ts";

export const systemOperationScopes = [
  "bootstrap",
  "maintenance",
  "jobs-recovery",
  "migration-helper",
] as const;

export type SystemOperationScope = (typeof systemOperationScopes)[number];

const bootstrapOwnerRequestSchema = z
  .object({
    input: z
      .object({
        email: z.email(),
        password: z.string().min(12),
      })
      .strict(),
    operation: z.literal("bootstrap.owner"),
  })
  .strict();

export type SystemOperationAudit = Readonly<{
  operation: "bootstrap.owner";
  outcome: BootstrapOwnerResult["status"];
  scope: "bootstrap";
}>;

export type SystemOperationHandlers = Readonly<{
  "bootstrap.owner": (input: BootstrapOwnerInput) => Promise<BootstrapOwnerResult>;
}>;

export interface SystemGateway {
  run(request: unknown): Promise<SystemOperationAudit>;
}

export class UnlistedSystemOperationError extends Error {
  constructor(operation: unknown) {
    super(`System operation is not registered: ${String(operation)}`);
    this.name = "UnlistedSystemOperationError";
  }
}

export function createSystemGateway(handlers: SystemOperationHandlers): SystemGateway {
  return {
    async run(request) {
      const operation =
        typeof request === "object" && request !== null && "operation" in request
          ? request.operation
          : undefined;

      if (operation !== "bootstrap.owner") {
        throw new UnlistedSystemOperationError(operation);
      }

      const parsed = bootstrapOwnerRequestSchema.parse(request);
      const result = await handlers["bootstrap.owner"](parsed.input);

      return {
        operation: "bootstrap.owner",
        outcome: result.status,
        scope: "bootstrap",
      };
    },
  };
}

const systemGateway = createSystemGateway({
  "bootstrap.owner": async (input) => {
    const { bootstrapOwner } = await import("./bootstrap-owner.ts");
    return bootstrapOwner(input);
  },
});

export const runSystemOperation = systemGateway.run;
