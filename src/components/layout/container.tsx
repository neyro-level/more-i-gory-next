import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "mx-auto box-border w-full max-w-site px-page-inline sm:px-page-inline-sm lg:px-page-inline-lg",
        className,
      )}
      {...props}
    />
  );
}
