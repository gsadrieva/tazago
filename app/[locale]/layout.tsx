import type { Metadata } from "next";

import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);

  return {
    title: {
      default: dict.metadata.defaultTitle,
      template: `%s | ${dict.metadata.defaultTitle}`,
    },
    description: dict.metadata.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  resolveLocale(rawLocale);

  return children;
}
