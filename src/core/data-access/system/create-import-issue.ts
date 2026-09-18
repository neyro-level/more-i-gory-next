type PayloadLike = {
  create: (args: {
    collection: "import-issues";
    data: Record<string, unknown>;
    overrideAccess: true;
  }) => Promise<{ id?: number | string }>;
};

export async function createImportIssue(
  payload: PayloadLike,
  data: Record<string, unknown>,
): Promise<{ id?: number | string }> {
  return payload.create({
    collection: "import-issues",
    data,
    overrideAccess: true,
  });
}
