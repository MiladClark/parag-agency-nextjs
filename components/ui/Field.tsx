import { Children, isValidElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

// Unified form controls matching CoachOps: rounded-lg, border-border, bg-panel,
// focus:border-accent. Use these everywhere instead of ad-hoc input classes.

const control =
  "w-full rounded-lg border border-border bg-panel px-4 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent disabled:opacity-60";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm text-text-muted">{children}</label>;
}

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${control} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${control} resize-none ${className}`} {...props} />;
}

interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

function optionsFromChildren(children: React.ReactNode): SelectOption[] {
  const options: SelectOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(child)) return;
    options.push({
      value: String(child.props.value ?? ""),
      label: child.props.children,
      disabled: child.props.disabled,
    });
  });
  return options;
}

/** Modern custom dropdown — same value/onChange/<option> API as a native <select>. */
export function Select({
  className = "",
  children,
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; openUp: boolean } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const options = optionsFromChildren(children);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      const openUp = window.innerHeight - r.bottom < 260 && r.top > 260;
      setRect({ top: openUp ? r.top : r.bottom, left: r.left, width: r.width, openUp });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function select(optValue: string) {
    setOpen(false);
    onChange?.({ target: { value: optValue } } as React.ChangeEvent<HTMLSelectElement>);
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${control} flex items-center justify-between gap-2 text-start ${className}`}
      >
        <span className="truncate">{current?.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        mounted &&
        rect &&
        createPortal(
          <ul
            ref={listRef}
            role="listbox"
            style={{
              position: "fixed",
              top: rect.openUp ? undefined : rect.top + 6,
              bottom: rect.openUp ? window.innerHeight - rect.top + 6 : undefined,
              left: rect.left,
              width: Math.max(rect.width, 160),
            }}
            className="z-[1000] max-h-60 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-xl"
          >
            {options.map((opt) => {
              const selected = opt.value === current?.value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={opt.disabled}
                    onClick={() => select(opt.value)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors disabled:opacity-50 ${
                      selected ? "bg-accent/15 text-accent" : "text-text hover:bg-panel"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {selected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}

/** A labelled text field (label + input) for forms. */
export function Field({
  label,
  className,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col">
      <FieldLabel>{label}</FieldLabel>
      <Input className={className} {...props} />
    </div>
  );
}
