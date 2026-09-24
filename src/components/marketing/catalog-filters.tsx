import { ActionLink } from "@/components/navigation/action-link";
import { Button } from "@/components/ui/button";
import type { CatalogFilterGroup, CatalogFilterQuery } from "@/core/catalog/public-catalog";

type CatalogFiltersProps = Readonly<{
  groups: readonly CatalogFilterGroup[];
  query: CatalogFilterQuery;
}>;

export function CatalogFilters({ groups, query }: CatalogFiltersProps) {
  if (groups.length === 0) return null;

  return (
    <form action="/obekty/" method="get" className="rounded-large border border-border bg-card p-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {groups.map((group) => (
          <label key={group.key} className="flex flex-col gap-2 text-body-sm font-medium text-foreground">
            {group.label}
            <select
              name={group.key}
              defaultValue={query[group.key] ?? ""}
              className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Все</option>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="submit" size="cta">
          Показать паспорта
        </Button>
        <ActionLink href="/obekty/" variant="outline">
          Сбросить фильтры
        </ActionLink>
      </div>
    </form>
  );
}
