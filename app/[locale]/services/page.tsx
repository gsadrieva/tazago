import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { getSessionContext } from "@/lib/auth";
import { formatPrice, formatPriceFrom } from "@/lib/format";
import { getDictionary, getLocaleHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";
import { getCatalogServices } from "@/lib/queries/catalog";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const { user, profile } = await getSessionContext();
  const services = await getCatalogServices(locale);

  return (
    <SiteShell
      locale={locale}
      pathname={`/${locale}/services`}
      isAuthenticated={Boolean(user)}
      role={profile?.role}
    >
      <main className="section-shell py-16">
        <div className="max-w-3xl">
          <h1 className="font-[family-name:var(--font-manrope)] text-5xl font-extrabold tracking-tight">
            {dict.services.title}
          </h1>
          <p className="mt-4 text-lg text-[var(--color-on-surface-variant)]">{dict.services.body}</p>
        </div>

        <div className="mt-12 grid gap-8">
          {services.map((service) => (
            <article key={service.id} className="surface-card grid overflow-hidden lg:grid-cols-[320px_1fr]">
              <img
                alt={service.title}
                className="h-full min-h-72 w-full object-cover"
                src={service.imageUrl ?? undefined}
              />

              <div className="p-8">
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
                  <div className="max-w-3xl">
                    <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold">
                      {service.title}
                    </h2>
                    <p className="mt-2 text-lg text-[var(--color-on-surface-variant)]">
                      {service.subtitle}
                    </p>

                    <div className="mt-5 inline-flex flex-col rounded-[1.5rem] bg-[var(--color-surface-container-low)] px-5 py-4 text-left">
                      <div className="text-3xl font-extrabold text-[var(--color-primary)]">
                        {formatPriceFrom(service.basePriceKzt, locale)}
                      </div>
                      <div className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                        {dict.services.duration}: {service.durationMin} мин
                      </div>
                    </div>

                    <p className="mt-5 leading-7 text-[var(--color-on-surface-variant)]">
                      {service.description}
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
                        {dict.services.featureTitle}
                      </h3>
                      <ul className="mt-4 space-y-3 text-sm text-[var(--color-on-surface-variant)]">
                        {service.features.slice(0, 3).map((feature) => (
                          <li
                            key={feature}
                            className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3"
                          >
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
                        {dict.services.addonsTitle}
                      </h3>
                      <div className="mt-4 space-y-3">
                        {service.addons.slice(0, 3).map((addon) => (
                          <div
                            key={addon.id}
                            className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3"
                          >
                            <div className="font-bold">{addon.title}</div>
                            <div className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                              {addon.description}
                            </div>
                            <div className="mt-2 text-sm font-bold text-[var(--color-primary)]">
                              {formatPrice(addon.priceKzt, locale)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={getLocaleHref(locale, `/services/${service.slug}`)} className="btn btn-secondary">
                    {dict.services.details}
                  </Link>
                  <Link href={getLocaleHref(locale, "/booking")} className="btn btn-primary">
                    {dict.nav.booking}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
