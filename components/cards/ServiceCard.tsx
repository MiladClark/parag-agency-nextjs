import type { Service } from "../../content/types";
import { Icon } from "../ui/Icon";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <a
      href={`/services/${service.slug}`}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-border bg-panel p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-panel-hover"
    >
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-accent/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-2xl text-accent transition-transform duration-300 group-hover:scale-110">
        <Icon name={service.icon} />
      </span>
      <h3 className="text-lg font-bold text-text">{service.title}</h3>
      <p className="text-sm leading-7 text-text-muted">{service.excerpt}</p>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-accent">
        بیشتر بدانید
        <Icon name="arrow-left" className="transition-transform duration-300 group-hover:-translate-x-1" />
      </span>
    </a>
  );
}
