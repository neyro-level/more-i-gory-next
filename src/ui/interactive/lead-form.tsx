"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const leadSchema = z.object({
  accepted: z.literal(true, {
    error: "Нужно согласие на обработку данных.",
  }),
  name: z.string().min(2, "Укажите имя."),
  phone: z.string().min(6, "Укажите телефон или мессенджер."),
  task: z.string().min(20, "Коротко опишите задачу: регион, бюджет, горизонт, цель."),
});

type LeadFormState = {
  errors: Partial<Record<keyof z.infer<typeof leadSchema>, string>>;
  status: "idle" | "submitting" | "success" | "error" | "disabled";
  message?: string;
};

const leadsEnabled = process.env.NEXT_PUBLIC_LEADS_ENABLED === "true";

export function LeadForm() {
  const [state, setState] = useState<LeadFormState>({ errors: {}, status: "idle" });

  async function handleSubmit(formData: FormData) {
    const accepted = formData.get("accepted") === "on";
    const parsed = leadSchema.safeParse({
      accepted,
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      task: String(formData.get("task") ?? ""),
    });

    if (!parsed.success) {
      const errors: LeadFormState["errors"] = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof typeof errors;
        errors[field] = issue.message;
      }
      setState({ errors, status: "error", message: "Проверьте поля формы." });
      return;
    }

    if (!leadsEnabled) {
      setState({
        errors: {},
        status: "disabled",
        message: "Форма готова технически, но отправка включается только после human gate по Leads API и юридическим текстам.",
      });
      return;
    }

    setState({ errors: {}, status: "submitting" });

    try {
      const response = await fetch("/api/leads", {
        body: JSON.stringify({
          ...parsed.data,
          acceptedAt: new Date().toISOString(),
          consentVersion: "draft-2026-09-10",
          source: "more-i-gory-next-static",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Lead endpoint returned an error.");
      }

      setState({ errors: {}, status: "success", message: "Заявка отправлена. Мы вернёмся с первым шагом после обработки." });
    } catch {
      setState({ errors: {}, status: "error", message: "Не удалось отправить заявку. Попробуйте позже или напишите напрямую." });
    }
  }

  return (
    <form action={handleSubmit} className="rounded-[1.75rem] bg-white p-6 text-foreground shadow-sm md:p-8">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Имя</FieldLabel>
          <Input id="name" name="name" placeholder="Как к вам обращаться" autoComplete="name" />
          {state.errors.name ? <FieldError>{state.errors.name}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Телефон или мессенджер</FieldLabel>
          <Input id="phone" name="phone" placeholder="+7 или @username" autoComplete="tel" />
          {state.errors.phone ? <FieldError>{state.errors.phone}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="task">Задача</FieldLabel>
          <Textarea id="task" name="task" placeholder="Регион, бюджет, цель, горизонт, что уже смотрели" rows={5} />
          <FieldDescription>Не указывайте чувствительные персональные данные. Для старта достаточно инвестиционной задачи.</FieldDescription>
          {state.errors.task ? <FieldError>{state.errors.task}</FieldError> : null}
        </Field>

        <Field orientation="horizontal">
          <Checkbox name="accepted" id="accepted" />
          <FieldContent>
            <FieldLabel htmlFor="accepted">Согласен на обработку данных</FieldLabel>
            <FieldDescription>
              Отправка включается только после согласования текста согласия и политики конфиденциальности.
            </FieldDescription>
            {state.errors.accepted ? <FieldError>{state.errors.accepted}</FieldError> : null}
          </FieldContent>
        </Field>

        <Button type="submit" size="lg" className="rounded-full bg-brand-coral text-white hover:bg-brand-coral/90" disabled={state.status === "submitting"}>
          {state.status === "submitting" ? "Отправляем..." : "Отправить задачу"}
        </Button>

        {state.message ? (
          <p className="rounded-2xl bg-muted p-4 text-sm leading-6 text-muted-foreground" role="status">
            {state.message}
          </p>
        ) : null}
      </FieldGroup>
    </form>
  );
}
