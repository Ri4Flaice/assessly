import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-primary placeholder:text-primary-400 transition-all duration-200 focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/10 hover:border-primary-300 disabled:cursor-not-allowed disabled:bg-surface-elevated disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(baseField, "h-11", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(baseField, "min-h-32 resize-y leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

type LabelProps = {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  className?: string;
};

export function Label({ children, htmlFor, required, hint, className }: LabelProps) {
  return (
    <div className={cn("mb-1.5 flex items-center justify-between", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-primary-800">
        {children}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-danger-500">{message}</p>;
}
