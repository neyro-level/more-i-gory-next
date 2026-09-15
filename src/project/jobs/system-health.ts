import type { TaskConfig } from "payload";

type SystemHealthTask = {
  input: Record<string, never>;
  output: { status: string };
};

export const systemHealthTask: TaskConfig<SystemHealthTask> = {
  slug: "systemHealth",
  inputSchema: [],
  outputSchema: [{ name: "status", type: "text", required: true }],
  retries: 0,
  handler: async () => ({ output: { status: "ok" } }),
};
