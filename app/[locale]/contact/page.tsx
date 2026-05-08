import { SiteShell } from "@/components/site-shell";
import { getSessionContext } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const { user, profile } = await getSessionContext();

  return (
    <SiteShell
      locale={locale}
      pathname={`/${locale}/contact`}
      isAuthenticated={Boolean(user)}
      role={profile?.role}
    >
      <main className="section-shell py-16">
        <div className="max-w-3xl">
          <h1 className="font-[family-name:var(--font-manrope)] text-5xl font-extrabold tracking-tight">
            {dict.contact.title}
          </h1>
          <p className="mt-4 text-lg text-[var(--color-on-surface-variant)]">{dict.contact.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="surface-card p-8">
            <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold">
              {dict.contact.faqTitle}
            </h2>
            <div className="mt-8 space-y-4">
              {dict.contact.faq.map((item) => (
                <div key={item.question} className="rounded-[1.5rem] bg-[var(--color-surface-container-low)] p-5">
                  <h3 className="text-xl font-bold">{item.question}</h3>
                  <p className="mt-3 leading-7 text-[var(--color-on-surface-variant)]">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="surface-card p-8">
            <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold">
              {dict.contact.infoTitle}
            </h2>
            <div className="mt-6 space-y-4">
              {dict.contact.infoLines.map((line) => (
                <div key={line} className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-4">
                  {line}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </SiteShell>
  );
}
