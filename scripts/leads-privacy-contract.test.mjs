import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const leadFormClient = read("src/ui/interactive/lead-form-client.tsx");
const intakeEndpoint = read("src/core/leads/intake-endpoint.ts");
const privacyPage = read("src/app/(site)/privacy/page.tsx");
const consentPage = read("src/app/(site)/consent/page.tsx");
const consentContract = read("packages/contracts/src/legal.ts");
const companyPage = read("src/app/(site)/o-kompanii/page.tsx");
const contactsPage = read("src/app/(site)/kontakty/page.tsx");

const analyticsSinks = [
  "gtag(",
  "dataLayer",
  "ym(",
  "metrika",
  "analytics.track",
  "navigator.sendBeacon",
];

test("lead form posts PII only to the internal public lead endpoint", () => {
  assert.match(leadFormClient, /fetch\("\/api\/public\/leads\/"/);

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
    assert.equal(call.includes("parsed.sourcePath"), false, "user-controlled source path must not be logged");
    assert.equal(call.includes("await request.json()"), false, "raw request body must not be logged");
  }

  assert.match(
    intakeEndpoint,
    /config\.logger\.info\("public lead accepted", \{ route: "public_lead_intake" \}\);/,
    "accepted log must use a fixed operational route label",
  );
});

test("privacy and consent pages publish approved legal operator details", () => {
  assert.match(privacyPage, /privacy-2026-09-17/);
  assert.match(consentPage, /ACTIVE_CONSENT_VERSION/);
  assert.match(consentContract, /pdn-consent-2026-09-17/);
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

test("company and contacts publish only sourced legal and contact facts", () => {
  assert.match(companyPage, /Колобова Ольга Викторовна/);
  assert.match(companyPage, /ОГРНИП 326237500327180/);
  assert.match(companyPage, /ИНН 352816594112/);
  assert.match(contactsPage, /\+7 964 668-66-81/);
  assert.match(contactsPage, /moregory-info@yandex\.com/);
  assert.match(contactsPage, /Набережная им\. В\. И\. Ленина, 13/);
  assert.match(contactsPage, /Пн–Пт 9:00–18:00, Сб 9:00–14:00/);
  assert.equal(contactsPage.includes("TODO после human gate"), false);
  assert.match(companyPage, /стаж, количество сделок, кейсы и показатели результата без источников не публикуются/);
  assert.match(contactsPage, /срок первого ответа заранее не обещаются/);
});
