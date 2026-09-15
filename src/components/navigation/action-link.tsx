import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { buttonVariants, type ButtonVariantProps } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

type ActionLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> &
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
    <Link
      data-slot="action-link"
      href={href}
      className={cn(buttonVariants({ size, variant }), "w-full sm:w-auto", className)}
      {...props}
    >
      {children}
      {showArrow ? <ArrowRightIcon data-icon="inline-end" aria-hidden="true" /> : null}
    </Link>
  );
}
