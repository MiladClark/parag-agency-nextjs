"use client";

import { useEffect, useId } from "react";

type CmsHtmlSlotProps = {
  html: null | string | undefined;
  /** Where to inject: document.head or a marker in the body. */
  target: "head" | "body-start" | "body-end";
};

/**
 * Injects CMS-authored HTML (script/link/meta/noscript) so <script> tags actually run.
 * React's dangerouslySetInnerHTML does not execute scripts.
 */
export function CmsHtmlSlot({ html, target }: CmsHtmlSlotProps) {
  const markerId = useId();

  useEffect(() => {
    const raw = html?.trim();
    if (!raw) return;

    const host =
      target === "head"
        ? document.head
        : target === "body-start"
          ? document.body
          : document.body;

    const wrap = document.createElement("div");
    wrap.setAttribute("data-cms-html", markerId);
    wrap.innerHTML = raw;

    const nodes = Array.from(wrap.childNodes);
    const placed: Node[] = [];

    for (const node of nodes) {
      if (node.nodeName === "SCRIPT") {
        const old = node as HTMLScriptElement;
        const script = document.createElement("script");
        for (const attr of Array.from(old.attributes)) {
          script.setAttribute(attr.name, attr.value);
        }
        script.text = old.textContent ?? "";
        if (target === "body-start") {
          document.body.insertBefore(script, document.body.firstChild);
        } else {
          host.appendChild(script);
        }
        placed.push(script);
      } else {
        const clone = node.cloneNode(true);
        if (target === "body-start") {
          document.body.insertBefore(clone, document.body.firstChild);
        } else {
          host.appendChild(clone);
        }
        placed.push(clone);
      }
    }

    return () => {
      for (const n of placed) n.parentNode?.removeChild(n);
    };
  }, [html, markerId, target]);

  return null;
}
