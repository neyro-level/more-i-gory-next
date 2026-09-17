import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  size?: "site" | "narrow";
};

const containerSizeClassName = {
  narrow: "max-w-narrow",
  site: "max-w-site",
} as const;

export function Container({ className, size = "site", ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto box-border w-full px-page-inline sm:px-page-inline-sm lg:px-page-inline-lg",
        containerSizeClassName[size],
        className,
      )}
      {...props}
    />
  );
}
