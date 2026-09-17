"use client";

import { useRef, useState, type FormEvent } from "react";

const messages = {
  accepted: "Нужно согласие на обработку данных.",
  name: "Укажите имя.",
  phone: "Укажите телефон или мессенджер.",
  task: "Коротко опишите задачу: регион, бюджет, горизонт, цель.",
} as const;

type FieldName = keyof typeof messages;

type LeadFormClientProps = {
  consentVersion: string;
  enabled: boolean;
  formId: string;
  sourcePath: string;
};

const fieldClassName = "flex flex-col gap-2 data-[invalid=true]:text-destructive";
const labelClassName = "text-label font-medium text-foreground";
const errorClassName = "text-body-sm text-destructive";
const controlClassName = "min-h-11 rounded-control bg-background px-3 text-body";
const submitClassName =
  "inline-flex min-h-14 w-full items-center justify-center rounded-control bg-accent px-6 text-label font-semibold text-accent-foreground transition-colors duration-fast ease-standard hover:bg-accent/90 disabled:pointer-events-none disabled:opacity-60";
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
  enabled,
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
        message: "Форма готова технически, но отправка включается только после согласования Leads API и юридических текстов.",
        state: "warning",
      });
      form.dataset.state = "server-disabled";
      return;
    }

    setSubmitting(true);
    form.dataset.state = "submitting";

    try {
      const response = await fetch("/api/public/leads", {
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
      action="/api/public/leads"
      className="rounded-large bg-card p-6 text-foreground shadow-sm md:p-8"
      data-consent-version={consentVersion}
      data-lead-form
      data-leads-enabled={String(enabled)}
      data-state="default"
      id={formId}
      method="post"
      noValidate
      onSubmit={handleSubmit}
    >
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">Данные для инвестиционного разбора</legend>

        <div className={fieldClassName} data-lead-field>
          <label className={labelClassName} htmlFor="name">Имя</label>
          <input className={controlClassName} id="name" name="name" placeholder="Как к вам обращаться" autoComplete="name" aria-describedby="name-error" aria-invalid="false" />
          <p className={errorClassName} data-error-for="name" hidden id="name-error" role="alert" />
        </div>

        <div className={fieldClassName} data-lead-field>
          <label className={labelClassName} htmlFor="phone">Телефон или мессенджер</label>
          <input className={controlClassName} id="phone" name="phone" placeholder="+7 или @username" autoComplete="tel" aria-describedby="phone-error" aria-invalid="false" />
          <p className={errorClassName} data-error-for="phone" hidden id="phone-error" role="alert" />
        </div>

        <div className={fieldClassName} data-lead-field>
          <label className={labelClassName} htmlFor="email">Email</label>
          <input className={controlClassName} id="email" name="email" placeholder="Если удобнее получить ответ письмом" autoComplete="email" aria-describedby="email-help" aria-invalid="false" />
          <p className="text-body-sm text-muted-foreground" id="email-help">Необязательно.</p>
        </div>

        <div className={fieldClassName} data-lead-field>
          <label className={labelClassName} htmlFor="task">Задача</label>
          <textarea className={controlClassName} id="task" name="task" placeholder="Регион, бюджет, цель, горизонт, что уже смотрели" rows={5} aria-describedby="task-help task-error" aria-invalid="false" />
          <p className="text-body-sm text-muted-foreground" id="task-help">
            Не указывайте чувствительные персональные данные. Для старта достаточно инвестиционной задачи.
          </p>
          <p className={errorClassName} data-error-for="task" hidden id="task-error" role="alert" />
        </div>

        <div className="grid grid-cols-[auto_1fr] items-start gap-3 data-[invalid=true]:text-destructive" data-lead-field>
          <input className="mt-1 size-5 cursor-pointer accent-brand-navy" id="accepted" name="accepted" type="checkbox" aria-describedby="accepted-help accepted-error" aria-invalid="false" />
          <div className="flex min-h-11 flex-col gap-1">
            <label className={labelClassName} htmlFor="accepted">Согласен на обработку данных</label>
            <p className="text-body-sm text-muted-foreground" id="accepted-help">
              Я принимаю <a className="text-link underline-offset-4 hover:underline" href="/consent/" target="_blank" rel="noreferrer">согласие на обработку персональных данных</a> и ознакомлен с <a className="text-link underline-offset-4 hover:underline" href="/privacy/" target="_blank" rel="noreferrer">политикой конфиденциальности</a>.
            </p>
            <p className={errorClassName} data-error-for="accepted" hidden id="accepted-error" role="alert" />
          </div>
        </div>

        <input autoComplete="off" className="hidden" name="company" tabIndex={-1} type="text" />
        <button className={submitClassName} data-lead-submit disabled={submitting} type="submit">
          {submitting ? "Отправляем..." : "Отправить задачу"}
        </button>

        <p
          className={statusClassName}
          data-lead-status
          data-state={status?.state ?? "default"}
          hidden={!status}
          role="status"
          aria-live="polite"
        >
          {status?.message}
        </p>
      </fieldset>
    </form>
  );
}
