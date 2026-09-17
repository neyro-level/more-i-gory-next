import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const leadFormClient = read("src/ui/interactive/lead-form-client.tsx");
const intakeEndpoint = read("src/core/leads/intake-endpoint.ts");
const privacyPage = read("src/app/(site)/privacy/page.tsx");
const consentPage = read("src/app/(site)/consent/page.tsx");

const analyticsSinks = [
  "gtag(",
  "dataLayer",
  "ym(",
  "metrika",
  "analytics.track",
  "navigator.sendBeacon",
];

test("lead form posts PII only to the internal public lead endpoint", () => {
  assert.match(leadFormClient, /fetch\("\/api\/public\/leads"/);

  for (const sink of analyticsSinks) {
    assert.equal(
      leadFormClient.includes(sink),
      false,
      `lead form must not call analytics sink ${sink}`,
    );
  }
});

test("public lead intake logs only safe operational context", () => {
  const loggerCalls = [...intakeEndpoint.matchAll(/config\.logger\.(?:info|warn|error)\(([\s\S]*?)\);/g)].map((match) => match[1]);

  assert.ok(loggerCalls.length > 0, "expected explicit lead intake logging contract");

  for (const call of loggerCalls) {
    assert.equal(call.includes("parsed.name"), false, "name must not be logged");
    assert.equal(call.includes("parsed.phone"), false, "phone must not be logged");
    assert.equal(call.includes("parsed.email"), false, "email must not be logged");
    assert.equal(call.includes("parsed.message"), false, "message must not be logged");
    assert.equal(call.includes("await request.json()"), false, "raw request body must not be logged");
  }

  assert.match(
    intakeEndpoint,
    /config\.logger\.info\("public lead accepted", \{ sourcePath: parsed\.sourcePath \}\);/,
    "accepted log may include sourcePath only",
  );
});

test("privacy and consent pages publish approved legal operator details", () => {
  assert.match(privacyPage, /privacy-2026-09-17/);
  assert.match(consentPage, /pdn-consent-2026-09-17/);
  assert.match(privacyPage, /Колобова Ольга Викторовна/);
  assert.match(consentPage, /Колобовой Ольге Викторовне/);
  assert.match(privacyPage, /moregory-info@yandex\.com/);
  assert.match(consentPage, /moregory-info@yandex\.com/);

  for (const page of [privacyPage, consentPage]) {
    assert.equal(page.includes("Human gate"), false, "legal pages must not expose placeholder gate text");
    assert.equal(page.includes("не опубликован"), false, "legal pages must not say text is unpublished");
    assert.equal(/расч[её]тн|корр\.?\s*сч[её]т|БИК|ВТБ/i.test(page), false, "bank details must not be published");
  }
});

test("lead form references active legal documents and consent version", () => {
  assert.match(leadFormClient, /href="\/consent\/"/);
  assert.match(leadFormClient, /href="\/privacy\/"/);
  assert.equal(
    leadFormClient.includes("Отправка включается только после согласования текста согласия"),
    false,
    "lead form must not claim legal texts are still pending",
  );
});
