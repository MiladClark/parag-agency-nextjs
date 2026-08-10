export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Section({
  id,
  className = "",
  children,
  ...rest
}: React.ComponentProps<"section">) {
  return (
    <section id={id} className={`py-20 sm:py-28 ${className}`} {...rest}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-4 py-1.5 text-sm font-medium text-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  align?: "center" | "start";
}) {
  const alignment = align === "center" ? "items-center text-center mx-auto" : "items-start text-start";
  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignment}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {title && (
        <h2 className="text-3xl font-bold leading-tight text-text sm:text-4xl">{title}</h2>
      )}
      {body && <p className="text-base leading-8 text-text-muted">{body}</p>}
    </div>
  );
}
