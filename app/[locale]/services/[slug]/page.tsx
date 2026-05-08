import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { getSessionContext } from "@/lib/auth";
import { formatPrice, formatPriceFrom } from "@/lib/format";
import { getCategoryLabel, getDictionary, getLocaleHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";
import { getCatalogServiceBySlug } from "@/lib/queries/catalog";

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const { user, profile } = await getSessionContext();
  const service = await getCatalogServiceBySlug(locale, slug);

  if (!service) {
    notFound();
  }

  return (
    <SiteShell
      locale={locale}
      pathname={`/${locale}/services/${slug}`}
      isAuthenticated={Boolean(user)}
      role={profile?.role}
    >
      <main className="section-shell py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <img
            alt={service.title}
            className="hero-image h-full w-full"
            src={service.imageUrl ?? undefined}
          />
          <div>
            <p className="eyebrow">{getCategoryLabel(locale, service.category)}</p>
            <h1 className="mt-6 font-[family-name:var(--font-manrope)] text-5xl font-extrabold tracking-tight">
              {service.title}
            </h1>
            <p className="mt-4 text-lg text-[var(--color-on-surface-variant)]">{service.subtitle}</p>
            <p className="mt-6 leading-8 text-[var(--color-on-surface-variant)]">{service.description}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="surface-card p-5">
                <div className="mt-2 text-3xl font-extrabold text-[var(--color-primary)]">
                  {formatPriceFrom(service.basePriceKzt, locale)}
                </div>
              </div>
              <div className="surface-card p-5">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
                  {dict.services.duration}
                </div>
                <div className="mt-2 text-3xl font-extrabold">{service.durationMin} мин</div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={getLocaleHref(locale, "/booking")} className="btn btn-primary">
                {dict.nav.booking}
              </Link>
              <Link href={getLocaleHref(locale, "/services")} className="btn btn-secondary">
                {dict.nav.services}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="surface-card p-8">
            <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold">
              {dict.services.featureTitle}
            </h2>
            <ul className="mt-6 space-y-3">
              {service.features.map((feature) => (
                <li key={feature} className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3">
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-card p-8">
            <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold">
              {dict.services.addonsTitle}
            </h2>
            <div className="mt-6 space-y-3">
              {service.addons.map((addon) => (
                <div key={addon.id} className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold">{addon.title}</div>
                      <div className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                        {addon.description}
                      </div>
                    </div>
                    <div className="font-bold text-[var(--color-primary)]">
                      {formatPrice(addon.priceKzt, locale)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
