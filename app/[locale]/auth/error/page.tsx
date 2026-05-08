import { SiteShell } from "@/components/site-shell";
import { getDictionary, getLocaleHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";

export default async function AuthErrorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);

  return (
    <SiteShell locale={locale} pathname={getLocaleHref(locale, "/auth/error")} isAuthenticated={false}>
      <main className="section-shell py-16">
        <div className="mx-auto max-w-xl surface-card p-8">
          <h1 className="font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-tight">
            {dict.auth.authErrorTitle}
          </h1>
          <p className="mt-4 text-[var(--color-on-surface-variant)]">{dict.auth.authErrorBody}</p>
        </div>
      </main>
    </SiteShell>
  );
}
