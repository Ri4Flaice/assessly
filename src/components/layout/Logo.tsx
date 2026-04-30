import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "full" | "mark";
  href?: string;
};

export function Logo({ className, variant = "full", href = "/" }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo-placeholder.svg"
        alt="Assessly"
        width={variant === "mark" ? 32 : 160}
        height={variant === "mark" ? 32 : 40}
        priority
      />
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
