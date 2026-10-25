"use client";

import { createContext, useContext } from "react";
import type { CmsContact } from "@/lib/contact";

const ContactContext = createContext<CmsContact>({});

export function ContactProvider({ contact, children }: { contact: CmsContact; children: React.ReactNode }) {
  return <ContactContext.Provider value={contact}>{children}</ContactContext.Provider>;
}

export const useCmsContact = () => useContext(ContactContext);
