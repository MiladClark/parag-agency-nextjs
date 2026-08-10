"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowUpLeft, Clock3, MessageCircle } from "lucide-react";
import { Icon } from "../ui/Icon";

const SPRING = { type: "spring", stiffness: 320, damping: 24 } as const;
const EASE = [0.16, 1, 0.3, 1] as const;

type Contact = {
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
};

type Social = { label: string; href: string; icon: string };

export function ContactChannels({
  contact,
  social,
}: {
  contact: Contact;
  social: Social[];
}) {
  const reduce = useReducedMotion();

  const rows = [
    contact.phone
      ? {
          id: "phone",
          icon: "phone",
          label: "تلفن",
          value: contact.phone,
          href: `tel:${toTelHref(contact.phone)}`,
        }
      : null,
    contact.email
      ? {
          id: "email",
          icon: "mail",
          label: "ایمیل",
          value: contact.email,
          href: `mailto:${contact.email}`,
        }
      : null,
    contact.address
      ? {
          id: "address",
          icon: "map",
          label: "آدرس",
          value: contact.address,
          href: undefined as string | undefined,
        }
      : null,
  ].filter(Boolean) as {
    id: string;
    icon: string;
    label: string;
    value: string;
    href?: string;
  }[];

  return (
    <aside className="flex flex-col gap-4 lg:gap-5">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.65, ease: EASE }}
        className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-panel/50 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl sm:p-7"
      >
        <div
          className="pointer-events-none absolute -top-20 end-0 h-40 w-40 rounded-full bg-accent/15 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-sm font-black text-text">راه‌های ارتباطی</p>
          <p className="mt-1.5 text-xs leading-6 text-text-muted">
            مستقیم پیام بدهید یا از فرم کنار صفحه استفاده کنید.
          </p>

          <ul className="mt-6 flex flex-col gap-2.5">
            {rows.map((row, i) => {
              const { id, ...channel } = row;
              return (
                <motion.li
                  key={id}
                  initial={reduce ? false : { opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease: EASE }}
                >
                  <ChannelRow {...channel} reduce={!!reduce} />
                </motion.li>
              );
            })}
          </ul>
        </div>
      </motion.div>

      {contact.whatsapp && (
        <motion.a
          href={contact.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
          whileHover={reduce ? undefined : { y: -3, scale: 1.01 }}
          whileTap={reduce ? undefined : { scale: 0.98 }}
          className="group relative flex items-center gap-3 overflow-hidden rounded-[1.5rem] border border-accent/35 bg-linear-to-b from-accent to-accent-hover px-5 py-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_14px_32px_-14px_color-mix(in_srgb,var(--accent)_65%,transparent)]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <MessageCircle className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-black">گفتگو در واتساپ</span>
            <span className="text-xs text-white/75">پاسخ سریع در ساعات کاری</span>
          </span>
          <ArrowUpLeft className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </motion.a>
      )}

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.14, ease: EASE }}
        className="flex items-start gap-3 rounded-[1.5rem] border border-border/70 bg-panel/40 px-5 py-4 backdrop-blur-md"
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Clock3 className="h-4 w-4" strokeWidth={2} />
        </span>
        <div>
          <p className="text-sm font-bold text-text">پاسخ معمولاً زیر ۲۴ ساعت</p>
          <p className="mt-1 text-xs leading-6 text-text-muted">
            جلسه مشاوره اول رایگان است و بدون تعهد پیش می‌رود.
          </p>
        </div>
      </motion.div>

      {social.length > 0 && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
          className="rounded-[1.5rem] border border-border/70 bg-panel/40 p-5 backdrop-blur-md"
        >
          <p className="text-xs font-bold text-text-muted">شبکه‌های اجتماعی</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {social.map((s) => (
              <motion.a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                whileHover={reduce ? undefined : { y: -3, scale: 1.06 }}
                whileTap={reduce ? undefined : { scale: 0.94 }}
                transition={SPRING}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-surface/60 text-text-muted transition-colors hover:border-accent/45 hover:text-accent"
              >
                <Icon name={s.icon} className="text-lg" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}
    </aside>
  );
}

function toTelHref(phone: string) {
  const normalized = phone.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  return normalized.replace(/[^\d+]/g, "");
}

function ChannelRow({
  icon,
  label,
  value,
  href,
  reduce,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
  reduce: boolean;
}) {
  const inner = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
        <Icon name={icon} className="text-base" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] text-text-muted">{label}</span>
        <span className="truncate text-sm font-bold text-text">{value}</span>
      </span>
      {href && (
        <ArrowUpLeft className="h-3.5 w-3.5 shrink-0 text-text-muted opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-accent" />
      )}
    </>
  );

  const className =
    "group flex w-full items-center gap-3 rounded-2xl border border-transparent bg-surface/40 px-3 py-2.5 transition-all duration-300 hover:border-accent/25 hover:bg-surface/80";

  if (href) {
    return (
      <motion.a
        href={href}
        whileHover={reduce ? undefined : { x: -2 }}
        transition={SPRING}
        className={className}
      >
        {inner}
      </motion.a>
    );
  }

  return <div className={className}>{inner}</div>;
}
