"use client";

import { useEffect, useRef, useState } from "react";

// Reveals its children on scroll via IntersectionObserver.
// SSR renders the content normally; the `.reveal` class only hides it once
// hydration confirms motion is wanted, so no-JS users always see the content.
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(true);
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cls = [enabled ? "reveal" : "", visible ? "is-visible" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    // @ts-expect-error dynamic tag with a ref is intentional
    <Tag ref={ref} className={cls} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}