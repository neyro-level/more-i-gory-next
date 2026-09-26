import type { Metadata } from "next";
import { buildCmsPageMetadata, getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent } from "@/components/ui/card";
import { CmsPage } from "@/components/page-blocks/cms-page";
import { getCmsPageEnhancementByPath } from "@/core/data-access/public";
import { isEditorialPreviewEnabled } from "@/core/data-access/preview/editorial-preview";

const pagePath = "/privacy/";
const policyVersion = "privacy-2026-09-17";

export async function generateMetadata(): Promise<Metadata> {
  const page = isEditorialPreviewEnabled() ? null : await getCmsPageEnhancementByPath(pagePath);
  if (page?.seo?.title && page.seo.description) {
    return buildCmsPageMetadata(page);
  }

  return getStaticMetadata("PAGE-022");
}

export default async function PrivacyPage() {
  const page = isEditorialPreviewEnabled() ? null : await getCmsPageEnhancementByPath(pagePath);
  if (page) return <CmsPage page={page} />;

  const seo = getSeoEntry("PAGE-022");

  return (
    <main id="main">
      <SectionShell
        containerSize="narrow"
        headingLevel={1}
        eyebrow="Юридический документ"
        title={seo.h1}
        lead="Политика описывает, какие персональные данные получает сайт «Море и Горы», зачем они нужны и как можно обратиться по вопросам обработки данных."
      >
        <Card radius="large" className="bg-card">
          <CardContent className="flex flex-col gap-8 p-6 text-body text-muted-foreground md:p-8">
            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">1. Оператор персональных данных</h2>
              <p>
                Оператор: Индивидуальный предприниматель Колобова Ольга Викторовна, ОГРНИП 326237500327180, ИНН 352816594112.
              </p>
              <p>
                Юридический адрес: 353925, Краснодарский край, г. Новороссийск, ул. Алексея Матвейкина, 1А, кв. 154.
              </p>
              <p>
                Офис: Респ. Крым, г. Ялта, Набережная им. В.И. Ленина, 13. Email для обращений по персональным данным: moregory-info@yandex.com. Телефон: +7 964 668-66-81.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">2. Какие данные обрабатываются</h2>
              <p>
                Сайт обрабатывает данные, которые пользователь самостоятельно указывает в форме инвестиционного разбора: имя, телефон или мессенджер, email при его заполнении, текст сообщения, страницу отправки формы, версию согласия и дату принятия согласия.
              </p>
              <p>
                Технически также могут обрабатываться дата и время обращения, IP-адрес, user agent и служебные сведения, необходимые для безопасности формы, защиты от спама, диагностики ошибок и подтверждения факта обращения.
              </p>
              <p>
                Просим не указывать в форме специальные категории персональных данных, сведения о здоровье, биометрические данные, паспортные данные, банковские реквизиты и иную избыточную информацию.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">3. Цели обработки</h2>
              <p>
                Данные используются для приёма обращения, подготовки первичного ответа, уточнения инвестиционной задачи, связи с пользователем, ведения внутреннего учёта обращений, обеспечения безопасности сайта и исполнения требований законодательства Российской Федерации.
              </p>
              <p>
                Персональные данные из формы не передаются в веб-аналитику и не используются для публичной публикации.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">4. Правовые основания</h2>
              <p>
                Обработка выполняется на основании согласия субъекта персональных данных, которое пользователь даёт при отправке формы, а также в случаях, когда обработка необходима для исполнения обязанностей оператора по закону.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">5. Действия с данными и хранение</h2>
              <p>
                Оператор может совершать с персональными данными следующие действия: сбор, запись, систематизацию, накопление, хранение, уточнение, извлечение, использование, передачу уполномоченным исполнителям в пределах целей обработки, обезличивание, блокирование, удаление и уничтожение.
              </p>
              <p>
                Данные хранятся до достижения целей обработки, отзыва согласия или истечения сроков, необходимых для защиты прав и законных интересов оператора, если более длительный срок не требуется законом.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">6. Передача третьим лицам</h2>
              <p>
                Данные могут передаваться техническим подрядчикам, хостинг-провайдерам, сервисам доставки уведомлений и иным исполнителям, которые помогают обрабатывать обращения, поддерживать сайт и обеспечивать безопасность. Такие лица получают данные только в объёме, необходимом для выполнения поручения оператора.
              </p>
              <p>
                Трансграничная передача персональных данных не является штатной целью обработки и не выполняется без отдельного основания.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">7. Права субъекта персональных данных</h2>
              <p>
                Пользователь вправе запросить сведения об обработке своих персональных данных, потребовать уточнения, блокирования или удаления данных, отозвать согласие на обработку и направить иные законные требования оператору.
              </p>
              <p>
                Обращение можно направить на moregory-info@yandex.com или по юридическому адресу оператора. Для выполнения запроса оператор может запросить сведения, позволяющие подтвердить личность заявителя и найти соответствующее обращение.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-title-sm text-foreground">8. Актуальная редакция</h2>
              <p>Версия политики: {policyVersion}. Дата публикации: 17 сентября 2026 года.</p>
              <p>
                Согласие на обработку персональных данных опубликовано на странице <a className="text-link underline-offset-4 hover:underline" href="/consent/">/consent/</a>.
              </p>
            </section>
          </CardContent>
        </Card>
      </SectionShell>
    </main>
  );
}
