import { ArrowRightIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { buttonVariants, type ButtonVariantProps } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { StaticLink } from "./static-link";

type ActionLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> &
  ButtonVariantProps & {
    href: string;
    showArrow?: boolean;
  };

export function ActionLink({
  children,
  className,
  href,
  showArrow = false,
  size = "cta",
  variant = "default",
  ...props
}: ActionLinkProps) {
  return (
    <StaticLink
      href={href}
      className={cn(buttonVariants({ size, variant }), "w-full sm:w-auto", className)}
      {...props}
    >
      {children}
      {showArrow ? <ArrowRightIcon data-icon="inline-end" aria-hidden="true" /> : null}
    </StaticLink>
  );
}
