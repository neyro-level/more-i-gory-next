import type { SafeOutboundClient } from "@/core/security/outbound-http";

export type DeliveryCertainty = "confirmed" | "not_delivered" | "unknown";

export type LeadDeliveryPayload = Readonly<{
  consent: {
    acceptedAt: string;
    version: string;
  };
  deliveryId: number | string;
  idempotencyKey: string;
  lead: {
    email?: string;
    message: string;
    name: string;
    phone: string;
    sourcePath: string;
  };
  leadId: number | string;
}>;

export type LeadDeliveryResult = Readonly<{
  deliveryCertainty: "confirmed";
  externalRef?: string;
}>;

export type LeadDeliveryFailureInput = Readonly<{
  deliveryCertainty: Exclude<DeliveryCertainty, "confirmed">;
  redactedMessage: string;
  retryable: boolean;
  safeCode: string;
}>;

export class LeadDeliveryFailure extends Error {
  readonly deliveryCertainty: Exclude<DeliveryCertainty, "confirmed">;
  readonly redactedMessage: string;
  readonly retryable: boolean;
  readonly safeCode: string;

  constructor(input: LeadDeliveryFailureInput) {
    super(input.redactedMessage);
    this.name = "LeadDeliveryFailure";
    this.deliveryCertainty = input.deliveryCertainty;
    this.redactedMessage = input.redactedMessage;
    this.retryable = input.retryable;
    this.safeCode = input.safeCode;
  }
}

export interface LeadDeliveryChannel {
  readonly id: string;
  deliver(payload: LeadDeliveryPayload): Promise<LeadDeliveryResult>;
}

type TelegramLeadDeliveryConfig = Readonly<{
  botToken: string;
  chatId: string;
  maxResponseBytes?: number;
  outbound: SafeOutboundClient;
  timeoutMs?: number;
}>;

type TelegramApiResponse = Readonly<{
  ok?: boolean;
  result?: {
    message_id?: number | string;
  };
}>;

const telegramApiOrigin = "https://api.telegram.org";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function assertTelegramSecretShape(botToken: string, chatId: string) {
  if (!/^[A-Za-z0-9:_-]+$/.test(botToken) || !/^-?[A-Za-z0-9:_-]+$/.test(chatId)) {
    throw new LeadDeliveryFailure({
      deliveryCertainty: "not_delivered",
      redactedMessage: "Telegram delivery credentials are invalid.",
      retryable: false,
      safeCode: "telegram_invalid_config",
    });
  }
}

function telegramSendMessageUrl(botToken: string): URL {
  const url = new URL(telegramApiOrigin);
  url.pathname = `/bot${encodeURIComponent(botToken)}/sendMessage`;
  return url;
}

function formatTelegramLeadMessage(payload: LeadDeliveryPayload): string {
  return [
    "Новая заявка с сайта Море и Горы",
    `Lead ID: ${payload.leadId}`,
    `Источник: ${payload.lead.sourcePath}`,
    `Имя: ${payload.lead.name}`,
    `Телефон: ${payload.lead.phone}`,
    payload.lead.email ? `Email: ${payload.lead.email}` : "Email: не указан",
    `Задача: ${payload.lead.message}`,
    `Consent: ${payload.consent.version} от ${payload.consent.acceptedAt}`,
  ].join("\n");
}

function telegramFailure(input: {
  deliveryCertainty: Exclude<DeliveryCertainty, "confirmed">;
  retryable: boolean;
  safeCode: string;
}) {
  return new LeadDeliveryFailure({
    ...input,
    redactedMessage: "Telegram lead delivery failed.",
  });
}

export function createTelegramLeadDeliveryChannel(config: TelegramLeadDeliveryConfig): LeadDeliveryChannel {
  assertTelegramSecretShape(config.botToken, config.chatId);

  return {
    id: "telegram",
    async deliver(payload) {
      try {
        const response = await config.outbound.request({
          body: encoder.encode(JSON.stringify({
            chat_id: config.chatId,
            disable_web_page_preview: true,
            text: formatTelegramLeadMessage(payload),
          })),
          headers: { "content-type": "application/json" },
          maxResponseBytes: config.maxResponseBytes ?? 16_384,
          method: "POST",
          timeoutMs: config.timeoutMs ?? 10_000,
          url: telegramSendMessageUrl(config.botToken),
        });

        let parsed: TelegramApiResponse;
        try {
          parsed = JSON.parse(decoder.decode(response.body)) as TelegramApiResponse;
        } catch {
          throw telegramFailure({
            deliveryCertainty: "unknown",
            retryable: true,
            safeCode: "telegram_invalid_response",
          });
        }

        if (response.status >= 200 && response.status < 300 && parsed.ok === true) {
          const messageId = parsed.result?.message_id;
          return {
            deliveryCertainty: "confirmed",
            externalRef: messageId == null ? undefined : `telegram:${messageId}`,
          };
        }

        throw telegramFailure({
          deliveryCertainty: response.status >= 500 || response.status === 429 ? "unknown" : "not_delivered",
          retryable: response.status >= 500 || response.status === 429,
          safeCode: "telegram_rejected",
        });
      } catch (error) {
        if (error instanceof LeadDeliveryFailure) throw error;

        throw telegramFailure({
          deliveryCertainty: "unknown",
          retryable: true,
          safeCode: "telegram_unavailable",
        });
      }
    },
  };
}
