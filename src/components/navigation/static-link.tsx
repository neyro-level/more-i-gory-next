import type { ComponentPropsWithoutRef } from "react";

type StaticLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
};

/**
 * A normal document link for the static export.
 * It deliberately avoids Next client navigation and RSC requests between HTML files.
 */
export function StaticLink({ href, ...props }: StaticLinkProps) {
  return <a href={href} {...props} />;
}
