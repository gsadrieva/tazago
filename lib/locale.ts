import { notFound } from "next/navigation";

import { LOCALES, type Locale } from "@/types/app";

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function resolveLocale(value: FormDataEntryValue | string | null | undefined): Locale {
  if (typeof value !== "string" || !isLocale(value)) {
    notFound();
  }

  return value;
}

export function localeToIntl(locale: Locale) {
  return locale === "kk" ? "kk-KZ" : "ru-KZ";
}

export function getLocaleLabel(locale: Locale) {
  return locale === "kk" ? "Қазақша" : "Русский";
}
