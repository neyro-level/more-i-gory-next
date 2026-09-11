import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type RiskBlockProps = {
  title: string;
  text: string;
};

export function RiskBlock({ text, title }: RiskBlockProps) {
  return (
    <Alert className="rounded-card border-action/30 bg-action/10 p-6">
      <TriangleAlert aria-hidden="true" />
      <AlertTitle className="text-h4">{title}</AlertTitle>
      <AlertDescription className="text-body text-foreground/75">{text}</AlertDescription>
    </Alert>
  );
}
