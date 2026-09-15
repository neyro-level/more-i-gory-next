import { getPayload } from "payload";
import config from "../../../../payload.config.ts";

type BootstrapOwnerInput = {
  email: string;
  password: string;
};

export async function bootstrapOwner({ email, password }: BootstrapOwnerInput) {
  const payload = await getPayload({ config });
  try {
    const owners = await payload.find({
      collection: "users",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { role: { equals: "owner" } },
    });

    if (owners.docs.length > 0) return { status: "exists" as const };

    await payload.create({
      collection: "users",
      data: { email, password, role: "owner" },
      overrideAccess: true,
    });

    return { status: "created" as const };
  } finally {
    await payload.destroy();
  }
}
