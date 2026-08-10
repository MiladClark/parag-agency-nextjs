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

type Align = "center" | "start";

/** Editorial rail label — replaces the old pill+dot eyebrow. */
export function SectionLabel({
  children,
  align = "center",
  className = "",
}: {
  children: React.ReactNode;
  align?: Align;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-3 text-[11px] font-bold tracking-[0.22em]",
        className,
      ].join(" ")}
    >
      {align === "start" ? (
        <span className="h-px w-8 bg-linear-to-l from-accent to-transparent" aria-hidden />
      ) : (
        <span className="h-px w-8 bg-linear-to-l from-transparent to-accent/80" aria-hidden />
      )}
      <span className="bg-linear-to-l from-accent via-accent-hover to-accent bg-clip-text text-transparent">
        {children}
      </span>
      {align === "center" && (
        <span className="h-px w-8 bg-linear-to-l from-accent/80 to-transparent" aria-hidden />
      )}
    </span>
  );
}

/** Alias kept for older call sites. */
export function Eyebrow({
  children,
  align = "start",
}: {
  children: React.ReactNode;
  align?: Align;
}) {
  return <SectionLabel align={align}>{children}</SectionLabel>;
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
  accent,
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  align?: Align;
  accent?: string;
}) {
  if (!title) return null;
  const centered = align === "center";

  return (
    <div
      className={[
        "relative flex flex-col gap-4",
        centered ? "mx-auto items-center text-center" : "items-start text-start",
      ].join(" ")}
    >
      {eyebrow && <SectionLabel align={align}>{eyebrow}</SectionLabel>}
      <h2
        className={[
          "max-w-3xl text-3xl font-black leading-[1.2] tracking-tight text-text sm:text-4xl lg:text-5xl lg:leading-[1.15]",
          centered ? "mx-auto" : "",
        ].join(" ")}
      >
        {title}
        {accent ? (
          <>
            {" "}
            <span className="text-gradient">{accent}</span>
          </>
        ) : null}
      </h2>
      {body && (
        <p
          className={[
            "max-w-xl text-sm leading-8 text-text-muted sm:text-base",
            centered ? "mx-auto" : "",
          ].join(" ")}
        >
          {body}
        </p>
      )}
      <span
        className={
          centered
            ? "mt-1 h-px w-24 bg-linear-to-l from-transparent via-accent/70 to-transparent"
            : "mt-1 h-px w-20 self-start bg-linear-to-l from-accent/80 to-transparent"
        }
        aria-hidden
      />
    </div>
  );
}
