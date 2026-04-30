"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/submit", label: "Проверить работу" },
  { href: "/history", label: "История" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-medium transition-colors",
                pathname === link.href
                  ? "text-accent"
                  : "text-muted hover:text-primary",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/submit"
            className="glow-accent inline-flex cursor-pointer items-center rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Начать
          </Link>
        </nav>

        {/* Mobile burger */}
        <button
          className="inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-muted transition hover:bg-surface-elevated hover:text-primary sm:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Меню"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-surface sm:hidden">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-accent-50 text-accent-700"
                    : "text-primary-700 hover:bg-surface-elevated",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <Link
                href="/submit"
                onClick={() => setOpen(false)}
                className="glow-accent flex w-full cursor-pointer items-center justify-center rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white"
              >
                Начать проверку
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
