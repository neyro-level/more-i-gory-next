import { env } from "../project/env.ts";

export const siteUrl = new URL(env.NEXT_PUBLIC_SERVER_URL).origin;
