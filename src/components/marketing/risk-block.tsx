import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type RiskBlockProps = {
  title: string;
  text: string;
};

export function RiskBlock({ text, title }: RiskBlockProps) {
  return (
    <Alert className="rounded-[1.5rem] border-brand-coral/30 bg-brand-coral/10 p-6">
      <span aria-hidden="true" className="grid size-5 place-items-center rounded-full bg-brand-coral text-xs text-white">!</span>
      <AlertTitle className="text-lg">{title}</AlertTitle>
      <AlertDescription className="text-base leading-7 text-foreground/75">{text}</AlertDescription>
    </Alert>
  );
}
