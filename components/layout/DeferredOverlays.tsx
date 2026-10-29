"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { ComponentProps } from "react";

const Search = dynamic(() => import("./SearchPalette").then(module => module.SearchPalette), { ssr: false });
const Menu = dynamic(() => import("./MobileMenu").then(module => module.MobileMenu), { ssr: false });

// Keep a loaded overlay mounted after its first use so exit animations, focus
// restoration and scroll-lock cleanup still run normally when it closes.
function useOpened(open: boolean) {
  const [opened, setOpened] = useState(open);
  if (open && !opened) setOpened(true);
  return open || opened;
}

export function SearchPalette(props: ComponentProps<typeof Search>) {
  return useOpened(props.open) ? <Search {...props} /> : null;
}

export function MobileMenu(props: ComponentProps<typeof Menu>) {
  return useOpened(props.open) ? <Menu {...props} /> : null;
}
