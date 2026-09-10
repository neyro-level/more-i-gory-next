import redirectsData from "./redirects.json";
import { z } from "zod";

const redirectSchema = z.object({
  destination: z.string().startsWith("/"),
  permanent: z.boolean().default(true),
  source: z.string().startsWith("/"),
});

export const redirects = redirectSchema.array().parse(redirectsData);
