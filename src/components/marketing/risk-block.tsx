import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type RiskBlockProps = {
  title: string;
  text: string;
};

export function RiskBlock({ text, title }: RiskBlockProps) {
  return (
    <Alert className="rounded-[1.5rem] border-brand-coral/30 bg-brand-coral/10 p-6">
      <AlertTriangle aria-hidden="true" className="size-5 text-brand-coral" />
      <AlertTitle className="text-lg">{title}</AlertTitle>
      <AlertDescription className="text-base leading-7 text-foreground/75">{text}</AlertDescription>
    </Alert>
  );
}
