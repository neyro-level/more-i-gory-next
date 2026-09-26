"use client";

import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const messages = {
  accepted: "Нужно согласие на обработку данных.",
  name: "Укажите имя.",
  phone: "Укажите телефон или мессенджер.",
  task: "Коротко опишите задачу: регион, бюджет, горизонт, цель.",
} as const;

type FieldName = keyof typeof messages;

type LeadFormClientProps = {
  consentVersion: string;
  enabled?: boolean;
  formId: string;
  sourcePath: string;
};

const controlClassName = "min-h-11 rounded-control text-body";
const statusClassName =
  "rounded-card border border-transparent bg-muted p-4 text-body-sm text-muted-foreground data-[state=error]:border-destructive/30 data-[state=error]:bg-destructive/10 data-[state=error]:text-destructive data-[state=success]:border-success/30 data-[state=success]:bg-success/10 data-[state=success]:text-foreground data-[state=warning]:border-warning/40 data-[state=warning]:bg-warning/15 data-[state=warning]:text-warning-foreground";

function setFieldState(form: HTMLFormElement, field: FieldName, hasError: boolean) {
  const input = form.elements.namedItem(field);
  const error = form.querySelector(`[data-error-for="${field}"]`);

  if (input instanceof HTMLElement) {
    input.setAttribute("aria-invalid", String(hasError));
    const fieldContainer = input.closest("[data-lead-field]");
    if (fieldContainer instanceof HTMLElement) {
      fieldContainer.dataset.invalid = String(hasError);
    }
  }

  if (error instanceof HTMLElement) {
    error.textContent = hasError ? messages[field] : "";
    error.hidden = !hasError;
  }
}

export function LeadFormClient({
  consentVersion,
  enabled = process.env.NEXT_PUBLIC_LEADS_ENABLED === "true",
  formId,
  sourcePath,
}: LeadFormClientProps) {
  const startedAt = useRef(new Date().toISOString());
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ message: string; state: "default" | "error" | "success" | "warning" } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus(null);
    form.dataset.state = "validating";

    const data = new FormData(form);
    const values = {
      accepted: data.get("accepted") === "on",
      email: String(data.get("email") ?? "").trim(),
      formStartedAt: startedAt.current,
      honeypot: String(data.get("company") ?? ""),
      message: String(data.get("task") ?? "").trim(),
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
    };
    const invalid = {
      accepted: !values.accepted,
      name: values.name.length < 2,
      phone: values.phone.length < 6,
      task: values.message.length < 20,
    };

    for (const [field, hasError] of Object.entries(invalid) as [FieldName, boolean][]) {
      setFieldState(form, field, hasError);
    }

    if (Object.values(invalid).some(Boolean)) {
      setStatus({ message: "Проверьте поля формы.", state: "error" });
      form.dataset.state = "validation-error";
      return;
    }

    if (!enabled) {
      setStatus({
        message: "Отправка временно недоступна. Используйте контакты на странице.",
        state: "warning",
      });
      form.dataset.state = "server-disabled";
      return;
    }

    setSubmitting(true);
    form.dataset.state = "submitting";

    try {
      const response = await fetch("/api/public/leads/", {
        body: JSON.stringify({
          consent: {
            accepted: values.accepted,
            acceptedAt: new Date().toISOString(),
            version: consentVersion,
          },
          email: values.email || undefined,
          formId,
          formStartedAt: values.formStartedAt,
          honeypot: values.honeypot || undefined,
          message: values.message,
          name: values.name,
          phone: values.phone,
          sourcePath,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) throw new Error("Lead endpoint returned an error.");
      form.reset();
      setStatus({ message: "Заявка отправлена. Мы вернёмся с первым шагом после обработки.", state: "success" });
      form.dataset.state = "success";
    } catch {
      setStatus({ message: "Не удалось отправить заявку. Попробуйте позже или напишите напрямую.", state: "error" });
      form.dataset.state = "server-error";
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-large bg-card p-6 text-foreground shadow-sm md:p-8"
      data-consent-version={consentVersion}
      data-lead-form
      data-leads-enabled={String(enabled)}
      data-state="default"
      id={formId}
      noValidate
      onSubmit={handleSubmit}
    >
      <FieldSet className="flex flex-col gap-6">
        <FieldLegend className="sr-only">Данные для инвестиционного разбора</FieldLegend>
        <FieldGroup className="gap-6">
          <Field data-lead-field>
            <Label className="text-label font-medium text-foreground" htmlFor="name">
              Имя
            </Label>
            <Input
              autoComplete="name"
              aria-describedby="name-error"
              aria-invalid="false"
              className={controlClassName}
              id="name"
              name="name"
              placeholder="Как к вам обращаться"
            />
            <FieldError data-error-for="name" hidden id="name-error">
              {messages.name}
            </FieldError>
          </Field>

          <Field data-lead-field>
            <Label className="text-label font-medium text-foreground" htmlFor="phone">
              Телефон или мессенджер
            </Label>
            <Input
              autoComplete="tel"
              aria-describedby="phone-error"
              aria-invalid="false"
              className={controlClassName}
              id="phone"
              inputMode="tel"
              name="phone"
              placeholder="+7 или @username"
              type="tel"
            />
            <FieldError data-error-for="phone" hidden id="phone-error">
              {messages.phone}
            </FieldError>
          </Field>

          <Field data-lead-field>
            <Label className="text-label font-medium text-foreground" htmlFor="email">
              Email
            </Label>
            <Input
              autoComplete="email"
              aria-describedby="email-help"
              aria-invalid="false"
              className={controlClassName}
              id="email"
              inputMode="email"
              name="email"
              placeholder="Если удобнее получить ответ письмом"
              type="email"
            />
            <FieldDescription id="email-help">Необязательно.</FieldDescription>
          </Field>

          <Field data-lead-field>
            <Label className="text-label font-medium text-foreground" htmlFor="task">
              Задача
            </Label>
            <Textarea
              aria-describedby="task-help task-error"
              aria-invalid="false"
              className={controlClassName}
              id="task"
              name="task"
              placeholder="Регион, бюджет, цель, горизонт, что уже смотрели"
              rows={5}
            />
            <FieldDescription id="task-help">
              Не указывайте чувствительные персональные данные. Для старта достаточно инвестиционной задачи.
            </FieldDescription>
            <FieldError data-error-for="task" hidden id="task-error">
              {messages.task}
            </FieldError>
          </Field>

          <Field className="grid grid-cols-[auto_1fr] items-start gap-3" data-lead-field orientation="horizontal">
            <Checkbox
              aria-describedby="accepted-help accepted-error"
              aria-invalid="false"
              className="mt-1 size-5"
              id="accepted"
              name="accepted"
            />
            <div className="flex min-h-11 flex-col gap-1">
              <Label className="text-label font-medium text-foreground" htmlFor="accepted">
                Согласен на обработку данных
              </Label>
              <FieldDescription id="accepted-help">
                Я принимаю{" "}
                <a className="text-link underline-offset-4 hover:underline" href="/consent/" rel="noreferrer" target="_blank">
                  согласие на обработку персональных данных
                </a>{" "}
                и ознакомлен с{" "}
                <a className="text-link underline-offset-4 hover:underline" href="/privacy/" rel="noreferrer" target="_blank">
                  политикой конфиденциальности
                </a>
                .
              </FieldDescription>
              <FieldError data-error-for="accepted" hidden id="accepted-error">
                {messages.accepted}
              </FieldError>
            </div>
          </Field>

          <Input autoComplete="off" className="hidden" name="company" tabIndex={-1} type="text" />
          <noscript>
            <p className={statusClassName} data-state="warning">
              Чтобы обсудить задачу без формы, позвоните по номеру +7 964 668-66-81 или напишите на moregory-info@yandex.com.
            </p>
          </noscript>
          {!enabled ? (
            <p className={statusClassName} data-state="warning" role="status">
              Отправка формы временно недоступна. Свяжитесь с нами через контакты на странице.
            </p>
          ) : null}
          <Button
            className="w-full min-h-14 duration-150 ease-standard"
            data-lead-submit
            disabled={!enabled || submitting}
            size="cta"
            type="submit"
            variant="accent"
          >
            {submitting ? "Отправляем..." : "Отправить задачу"}
          </Button>

          <p
            aria-live="polite"
            className={statusClassName}
            data-lead-status
            data-state={status?.state ?? "default"}
            hidden={!status}
            role="status"
          >
            {status?.message}
          </p>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
