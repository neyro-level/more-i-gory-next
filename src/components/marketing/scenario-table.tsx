import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <div className="overflow-hidden rounded-card border bg-card">
      <Table className="min-w-3xl text-body-sm">
        <TableCaption className="sr-only">
          Сценарии инвестиционного решения, допущения и вопросы для проверки.
        </TableCaption>
        <TableHeader className="bg-surface-dark text-surface-dark-foreground">
          <TableRow className="hover:bg-surface-dark">
            <TableHead className="px-5 py-4 text-surface-dark-foreground" scope="col">
              Сценарий
            </TableHead>
            <TableHead className="px-5 py-4 text-surface-dark-foreground" scope="col">
              Допущение
            </TableHead>
            <TableHead className="px-5 py-4 text-surface-dark-foreground" scope="col">
              Вопрос инвестора
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.scenario}>
              <TableCell className="px-5 py-4 font-semibold whitespace-normal">
                {row.scenario}
              </TableCell>
              <TableCell className="px-5 py-4 whitespace-normal text-muted-foreground">
                {row.assumption}
              </TableCell>
              <TableCell className="px-5 py-4 whitespace-normal">
                {row.investorQuestion}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
