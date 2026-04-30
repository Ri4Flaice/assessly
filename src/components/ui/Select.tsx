"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
};

export function Select({
  options,
  value,
  onChange,
  id,
  placeholder = "Выберите...",
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Закрытие по клику вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Скролл к сфокусированному элементу
  useEffect(() => {
    if (focused >= 0 && listRef.current) {
      const item = listRef.current.children[focused] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [focused]);

  const openDropdown = () => {
    const currentIndex = options.findIndex((o) => o.value === value);
    setFocused(currentIndex >= 0 ? currentIndex : 0);
    setOpen(true);
  };

  const select = (optValue: string) => {
    onChange(optValue);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocused((f) => Math.min(f + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocused((f) => Math.max(f - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focused >= 0 && options[focused]) {
          select(options[focused].value);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 text-sm transition-all duration-150",
          "hover:border-primary-300",
          open
            ? "border-accent ring-3 ring-accent/10"
            : "focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/10",
        )}
      >
        <span className={selectedOption ? "text-primary" : "text-primary-400"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={placeholder}
          className="custom-scroll absolute z-50 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-border bg-surface py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        >
          <style>{`
            .custom-scroll::-webkit-scrollbar {
              height: 8px;
              width: 8px;
            }
            .custom-scroll::-webkit-scrollbar-track {
              background: var(--color-surface); /* zinc-900 */
              margin: 4px;
            }
            .custom-scroll::-webkit-scrollbar-thumb {
              background: #3f3f46; /* zinc-700 */
              border-radius: 6px;
            }
            .custom-scroll::-webkit-scrollbar-thumb:hover {
              background: #52525b; /* zinc-600 */
            }
          `}</style>
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isFocused = i === focused;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => e.preventDefault()} // не сбрасывать фокус с button
                onClick={() => select(opt.value)}
                onMouseEnter={() => setFocused(i)}
                className={cn(
                  "flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors",
                  isFocused && !isSelected && "bg-surface-elevated",
                  isSelected
                    ? "bg-accent-50 font-semibold text-accent-700"
                    : "text-primary-700",
                )}
              >
                {opt.label}
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-accent" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
