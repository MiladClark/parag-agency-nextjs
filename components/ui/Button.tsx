type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

// Pill buttons with a glass/glow language matching the floating header & footer.
// A sheen sweeps across primary/danger on hover via the ::after overlay.
const base =
  "group/btn relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

const sheen =
  "after:absolute after:inset-0 after:-z-10 after:-translate-x-[150%] after:bg-linear-to-r after:from-transparent after:via-white/25 after:to-transparent after:transition-transform after:duration-700 after:ease-out hover:after:translate-x-[150%]";

const variants: Record<Variant, string> = {
  primary: `bg-linear-to-b from-accent to-accent-hover text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_28px_-10px_color-mix(in_srgb,var(--accent)_60%,transparent)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_18px_38px_-12px_color-mix(in_srgb,var(--accent)_75%,transparent)] hover:brightness-110 ${sheen}`,
  secondary:
    "border border-border/80 bg-panel/60 text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm hover:-translate-y-0.5 hover:border-accent/40 hover:bg-panel hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_30px_-16px_rgba(0,0,0,0.6)]",
  ghost:
    "bg-transparent text-text-muted hover:bg-panel/70 hover:text-text hover:shadow-[inset_0_0_0_1px_var(--border)]",
  danger: `bg-linear-to-b from-red-500 to-red-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_28px_-10px_rgba(220,38,38,0.7)] hover:-translate-y-0.5 hover:brightness-110 ${sheen}`,
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: React.ReactNode };

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: Common & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest} />;
}
