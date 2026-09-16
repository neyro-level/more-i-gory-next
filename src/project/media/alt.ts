export type MediaAltInput = {
  alt?: unknown;
  decorative?: unknown;
};

export function assertMediaAlt(input: MediaAltInput): void {
  const alt = typeof input.alt === "string" ? input.alt : "";
  const decorative = input.decorative === true;

  if (decorative && alt !== "") {
    throw new Error("Decorative media must use an empty alt attribute.");
  }

  if (!decorative && alt.trim().length === 0) {
    throw new Error("Non-decorative media must include meaningful alt text.");
  }
}
