import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const leadsEnabled = process.env.NEXT_PUBLIC_LEADS_ENABLED === "true";

const fieldClassName = "flex flex-col gap-2 data-[invalid=true]:text-destructive";
const labelClassName = "text-sm font-medium text-foreground";
const errorClassName = "text-sm text-destructive";
const controlClassName = "min-h-11 rounded-lg bg-background px-3 text-base md:text-base";

/**
 * Server-rendered form with a small framework-free enhancement script.
 * The submit button starts disabled, so no-JS clients cannot accidentally send PII.
 */
export function LeadForm() {
  return (
    <>
      <form
        action="/api/leads"
        className="rounded-feature bg-white p-6 text-foreground shadow-sm md:p-8"
        data-consent-version="draft-2026-09-10"
        data-lead-form
        data-leads-enabled={String(leadsEnabled)}
        method="post"
        noValidate
      >
        <fieldset className="flex flex-col gap-6">
          <legend className="sr-only">Данные для инвестиционного разбора</legend>

          <div className={fieldClassName} data-lead-field>
            <label className={labelClassName} htmlFor="name">Имя</label>
            <Input className={controlClassName} id="name" name="name" placeholder="Как к вам обращаться" autoComplete="name" aria-describedby="name-error" aria-invalid="false" />
            <p className={errorClassName} data-error-for="name" hidden id="name-error" role="alert" />
          </div>

          <div className={fieldClassName} data-lead-field>
            <label className={labelClassName} htmlFor="phone">Телефон или мессенджер</label>
            <Input className={controlClassName} id="phone" name="phone" placeholder="+7 или @username" autoComplete="tel" aria-describedby="phone-error" aria-invalid="false" />
            <p className={errorClassName} data-error-for="phone" hidden id="phone-error" role="alert" />
          </div>

          <div className={fieldClassName} data-lead-field>
            <label className={labelClassName} htmlFor="task">Задача</label>
            <Textarea className={controlClassName} id="task" name="task" placeholder="Регион, бюджет, цель, горизонт, что уже смотрели" rows={5} aria-describedby="task-help task-error" aria-invalid="false" />
            <p className="text-sm leading-6 text-muted-foreground" id="task-help">
              Не указывайте чувствительные персональные данные. Для старта достаточно инвестиционной задачи.
            </p>
            <p className={errorClassName} data-error-for="task" hidden id="task-error" role="alert" />
          </div>

          <div className="grid grid-cols-[auto_1fr] items-start gap-3 data-[invalid=true]:text-destructive" data-lead-field>
            <input className="mt-1 size-5 cursor-pointer accent-brand-navy" id="accepted" name="accepted" type="checkbox" aria-describedby="accepted-help accepted-error" aria-invalid="false" />
            <div className="flex min-h-11 flex-col gap-1">
              <label className={labelClassName} htmlFor="accepted">Согласен на обработку данных</label>
              <p className="text-sm leading-6 text-muted-foreground" id="accepted-help">
                Отправка включается только после согласования текста согласия и политики конфиденциальности.
              </p>
              <p className={errorClassName} data-error-for="accepted" hidden id="accepted-error" role="alert" />
            </div>
          </div>

          <Button data-lead-submit disabled type="submit" size="cta" variant="accent" className="w-full">
            Отправить задачу
          </Button>

          <p className="rounded-2xl bg-muted p-4 text-sm leading-6 text-muted-foreground" data-lead-status hidden role="status" aria-live="polite" />
        </fieldset>
      </form>
      <script defer src="/assets/lead-form.js" />
    </>
  );
}
