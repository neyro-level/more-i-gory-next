import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type RiskBlockProps = {
  title: string;
  text: string;
};

export function RiskBlock({ text, title }: RiskBlockProps) {
  return (
    <Alert className="rounded-surface border-action/30 bg-action/10 p-6">
      <span aria-hidden="true" className="grid size-5 place-items-center rounded-full bg-action text-caption text-action-foreground">!</span>
      <AlertTitle className="text-lg">{title}</AlertTitle>
      <AlertDescription className="text-base leading-7 text-foreground/75">{text}</AlertDescription>
    </Alert>
  );
}
