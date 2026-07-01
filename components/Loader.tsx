const logoMark = "/logo-mark.svg";

// Brand loading animation: the logo mark pulses inside a spinning accent ring.
export function Loader({ label = "در حال بارگذاری…" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent border-l-accent/40"
          style={{ animation: "parag-spin 0.9s linear infinite" }}
        />
        <img
          src={logoMark}
          alt="پاراگ"
          className="h-12 w-12"
          style={{ animation: "parag-pulse 1.6s ease-in-out infinite" }}
        />
      </div>
      <span className="text-sm text-text-muted">{label}</span>
    </div>
  );
}
