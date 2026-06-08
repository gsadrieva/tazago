import { localeToIntl } from "@/lib/locale";
import type { Locale } from "@/types/app";

export function formatPrice(value: number, locale: Locale) {
  const formatted = new Intl.NumberFormat(localeToIntl(locale), {
    maximumFractionDigits: 0,
  }).format(value);

  return `${formatted} ₸`;
}

export function formatPriceFrom(value: number, locale: Locale) {
  const formatted = formatPrice(value, locale);
  return locale === "kk" ? `${formatted}-ден бастап` : `от ${formatted}`;
}

export function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(localeToIntl(locale), {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(value));
}
