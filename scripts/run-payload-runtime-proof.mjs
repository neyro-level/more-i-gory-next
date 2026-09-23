import assert from "node:assert/strict";
import { getPayload } from "payload";

const required = [
  "DATABASE_URI",
  "PAYLOAD_PROOF_OWNER_EMAIL",
  "PAYLOAD_PROOF_OWNER_PASSWORD",
  "PAYLOAD_PROOF_EDITOR_EMAIL",
  "PAYLOAD_PROOF_EDITOR_PASSWORD",
];

for (const name of required) {
  if (!process.env[name]) throw new Error(`${name} is required.`);
}

const ownerEmail = process.env.PAYLOAD_PROOF_OWNER_EMAIL;
const ownerPassword = process.env.PAYLOAD_PROOF_OWNER_PASSWORD;
const editorEmail = process.env.PAYLOAD_PROOF_EDITOR_EMAIL;
const editorPassword = process.env.PAYLOAD_PROOF_EDITOR_PASSWORD;
const lockoutEmail = `lockout-${editorEmail}`;

const config = (await import("../payload.config.ts")).default;
const payload = await getPayload({ config });

try {
  const ownerLogin = await payload.login({
    collection: "users",
    data: { email: ownerEmail, password: ownerPassword },
  });
  assert.ok(ownerLogin.token);
  assert.equal(ownerLogin.user?.role, "owner");
  const owner = ownerLogin.user;
  assert.ok(owner);

  const editor = await payload.create({
    collection: "users",
    data: { email: editorEmail, password: editorPassword, role: "editor" },
    overrideAccess: false,
    user: owner,
  });
  const lockoutUser = await payload.create({
    collection: "users",
    data: { email: lockoutEmail, password: editorPassword, role: "editor" },
    overrideAccess: false,
    user: owner,
  });

  const editorLogin = await payload.login({
    collection: "users",
    data: { email: editorEmail, password: editorPassword },
  });
  assert.ok(editorLogin.token);
  assert.equal(editorLogin.user?.role, "editor");

  const session = await payload.auth({
    headers: new Headers({ Authorization: `JWT ${ownerLogin.token}` }),
  });
  assert.equal(session.user?.id, owner.id);

  await assert.rejects(() =>
    payload.create({
      collection: "users",
      data: {
        email: `denied-${editorEmail}`,
        password: editorPassword,
        role: "editor",
      },
      overrideAccess: false,
      user: editor,
    }),
  );

  for (let attempt = 0; attempt < 5; attempt += 1) {
    await assert.rejects(() =>
      payload.login({
        collection: "users",
        data: { email: lockoutEmail, password: `${editorPassword}-wrong` },
      }),
    );
  }
  await assert.rejects(() =>
    payload.login({
      collection: "users",
      data: { email: lockoutEmail, password: editorPassword },
    }),
  );
  const locked = await payload.findByID({
    collection: "users",
    id: lockoutUser.id,
    overrideAccess: false,
    showHiddenFields: true,
    user: owner,
  });
  assert.equal(locked.loginAttempts, 5);
  assert.ok(locked.lockUntil);

  const resetToken = await payload.forgotPassword({
    collection: "users",
    data: { email: editorEmail },
    disableEmail: true,
    overrideAccess: false,
  });
  assert.ok(resetToken);
  const replacementPassword = `${editorPassword}-reset`;
  await payload.resetPassword({
    collection: "users",
    data: { password: replacementPassword, token: resetToken },
    overrideAccess: false,
  });
  const resetLogin = await payload.login({
    collection: "users",
    data: { email: editorEmail, password: replacementPassword },
  });
  assert.equal(resetLogin.user?.id, editor.id);

  const users = await payload.find({ collection: "users", limit: 10, overrideAccess: false, user: owner });
  const siteSettings = await payload.findGlobal({ slug: "site-settings", overrideAccess: false, user: owner });
  assert.equal(users.totalDocs, 3);
  assert.equal(siteSettings.siteName, "Море и Горы");
  assert.ok(payload.config.editor);

  process.stdout.write(`${JSON.stringify({
    adminConfig: "PASS",
    deniedAccess: "PASS",
    editorLogin: "PASS",
    lexicalEditor: "PASS",
    lockout: "PASS",
    ownerLogin: "PASS",
    passwordReset: "PASS",
    session: "PASS",
    usersAndGlobals: "PASS",
    verdict: "PASS",
  })}\n`);
} finally {
  await payload.destroy();
}
