import type { Metadata } from "next";
import { buildCmsPageMetadata, getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent } from "@/components/ui/card";
import { CmsPage } from "@/components/page-blocks/cms-page";
import { getCmsPageEnhancementByPath } from "@/core/data-access/public";
import { isEditorialPreviewEnabled } from "@/core/data-access/preview/editorial-preview";
import { ACTIVE_CONSENT_VERSION } from "@more-i-gory/contracts";

const pagePath = "/consent/";

export async function generateMetadata(): Promise<Metadata> {
  const page = isEditorialPreviewEnabled() ? null : await getCmsPageEnhancementByPath(pagePath);
  if (page?.seo?.title && page.seo.description) {
    return buildCmsPageMetadata(page);
  }

  return getStaticMetadata("PAGE-023");
}

export default async function ConsentPage() {
  const page = isEditorialPreviewEnabled() ? null : await getCmsPageEnhancementByPath(pagePath);
  if (page) return <CmsPage page={page} />;

  const seo = getSeoEntry("PAGE-023");

  return (
    <main id="main">
      <SectionShell
        containerSize="narrow"
        headingLevel={1}
        eyebrow="Юридический документ"
        title={seo.h1}
        lead="Это согласие применяется при отправке формы инвестиционного разбора на сайте «Море и Горы»."
      >
        <Card radius="large" className="bg-card">
          <CardContent className="flex flex-col gap-8 p-6 text-body text-muted-foreground md:p-8">
            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">1. Субъект и оператор</h2>
              <p>
                Нажимая кнопку отправки формы и отмечая чекбокс согласия, пользователь свободно, своей волей и в своём интересе даёт согласие Индивидуальному предпринимателю Колобовой Ольге Викторовне, ОГРНИП 326237500327180, ИНН 352816594112, на обработку персональных данных.
              </p>
              <p>
                Контакты оператора: moregory-info@yandex.com, +7 964 668-66-81. Юридический адрес: 353925, Краснодарский край, г. Новороссийск, ул. Алексея Матвейкина, 1А, кв. 154.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">2. Перечень персональных данных</h2>
              <p>
                Согласие распространяется на имя, телефон или мессенджер, email при его заполнении, текст сообщения об инвестиционной задаче, страницу отправки формы, дату и время принятия согласия, версию согласия, а также технические сведения, необходимые для безопасности и обработки обращения.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">3. Цели обработки</h2>
              <p>
                Персональные данные обрабатываются для приёма обращения, связи с пользователем, уточнения инвестиционной задачи, подготовки первичного ответа, внутреннего учёта заявок, защиты формы от злоупотреблений и исполнения обязанностей оператора по законодательству Российской Федерации.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">4. Действия с персональными данными</h2>
              <p>
                Пользователь разрешает сбор, запись, систематизацию, накопление, хранение, уточнение, извлечение, использование, передачу уполномоченным исполнителям в пределах целей обработки, обезличивание, блокирование, удаление и уничтожение персональных данных с использованием автоматизированных и неавтоматизированных средств.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">5. Срок действия согласия</h2>
              <p>
                Согласие действует до достижения целей обработки, отзыва согласия пользователем или прекращения обработки по иным основаниям, предусмотренным законодательством Российской Федерации.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">6. Отзыв согласия</h2>
              <p>
                Пользователь может отозвать согласие, направив обращение на moregory-info@yandex.com или по юридическому адресу оператора. После получения отзыва оператор прекращает обработку данных в случаях и сроки, предусмотренные законом, если отсутствует иное законное основание для продолжения обработки.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">7. Связанный документ</h2>
              <p>
                Правила обработки персональных данных описаны в Политике конфиденциальности на странице <a className="text-link underline-offset-4 hover:underline" href="/privacy/">/privacy/</a>.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">8. Версия согласия</h2>
              <p>Версия согласия: {ACTIVE_CONSENT_VERSION}. Дата публикации: 17 сентября 2026 года.</p>
            </section>
          </CardContent>
        </Card>
      </SectionShell>
    </main>
  );
}
