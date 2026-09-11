type ScenarioRow = {
  scenario: string;
  assumption: string;
  investorQuestion: string;
};

type ScenarioTableProps = {
  rows: ScenarioRow[];
};

export function ScenarioTable({ rows }: ScenarioTableProps) {
  return (
    <div className="overflow-hidden rounded-surface border bg-white">
      <div className="grid grid-cols-3 bg-brand-navy px-5 py-4 text-sm font-semibold text-white">
        <div>Сценарий</div>
        <div>Допущение</div>
        <div>Вопрос инвестора</div>
      </div>
      {rows.map((row) => (
        <div key={row.scenario} className="grid grid-cols-1 gap-3 border-t px-5 py-4 text-sm leading-7 md:grid-cols-3">
          <div className="font-semibold">{row.scenario}</div>
          <div className="text-muted-foreground">{row.assumption}</div>
          <div>{row.investorQuestion}</div>
        </div>
      ))}
    </div>
  );
}
