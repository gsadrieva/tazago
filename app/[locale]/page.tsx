import Link from "next/link";
import { ArrowRight, Clock3, MapPin, PhoneCall, ShieldCheck, Sparkles } from "lucide-react";

import { ChatWidget } from "@/components/home/chat-widget";
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel";
import { SiteShell } from "@/components/site-shell";
import { getSessionContext } from "@/lib/auth";
import { formatPriceFrom } from "@/lib/format";
import { getDictionary, getLocaleHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";
import { getCatalogServices } from "@/lib/queries/catalog";

function trimTrailingDots(text: string) {
  return text.replace(/[.]+$/u, "");
}

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const { user, profile } = await getSessionContext();
  const allServices = await getCatalogServices(locale);
  const services = allServices.slice(0, 4);

  return (
    <SiteShell
      locale={locale}
      pathname={`/${locale}`}
      isAuthenticated={Boolean(user)}
      role={profile?.role}
    >
      <main className="pb-24">
        <section className="section-shell grid gap-12 px-6 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
          <div className="relative">
            <span className="eyebrow">
              <Sparkles className="h-4 w-4" />
              {dict.home.eyebrow}
            </span>
            <h1 className="mt-8 max-w-3xl font-[family-name:var(--font-manrope)] text-5xl font-extrabold leading-none tracking-tight sm:text-6xl lg:text-7xl">
              {dict.home.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-on-surface-variant)]">
              {dict.home.description}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href={getLocaleHref(locale, "/booking")} className="btn btn-primary">
                {dict.home.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={getLocaleHref(locale, "/services")} className="btn btn-secondary">
                {dict.home.secondaryCta}
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              {dict.home.trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--color-on-surface-variant)] shadow-[var(--shadow-cloud)]"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-14 h-44 w-44 rounded-full bg-[var(--color-primary-container)]/20 blur-3xl" />
            <div className="absolute -bottom-8 right-0 h-48 w-48 rounded-full bg-[var(--color-tertiary-container)]/35 blur-3xl" />
            <img
              alt={dict.brand.name}
              className="hero-image relative z-10 w-full"
              src={
                services[0]?.imageUrl ??
                "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80"
              }
            />
          </div>
        </section>

        <section className="bg-[var(--color-surface-container-low)] py-24">
          <div className="section-shell">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-tight">
                {dict.home.servicesTitle}
              </h2>
              <p className="mt-4 text-lg text-[var(--color-on-surface-variant)]">{dict.home.servicesBody}</p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {services.map((service) => (
                <article key={service.id} className="surface-card flex h-full flex-col overflow-hidden">
                  <img alt={service.title} className="h-56 w-full object-cover" src={service.imageUrl ?? undefined} />
                  <div className="flex flex-1 flex-col gap-5 p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-[family-name:var(--font-manrope)] text-2xl font-bold">
                          {service.title}
                        </h3>
                        <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                          {trimTrailingDots(service.subtitle)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="max-w-32 text-xl font-extrabold leading-tight text-[var(--color-primary)]">
                          {formatPriceFrom(service.basePriceKzt, locale)}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={getLocaleHref(locale, `/services/${service.slug}`)}
                      className="btn btn-secondary mt-auto w-full whitespace-nowrap"
                    >
                      {dict.services.details}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell grid gap-8 py-24 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-card p-8">
            <span className="eyebrow">
              <ShieldCheck className="h-4 w-4" />
              {dict.home.whyTitle}
            </span>
            <h2 className="mt-6 font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-tight">
              {dict.home.whyTitle}
            </h2>
            <p className="mt-4 text-lg text-[var(--color-on-surface-variant)]">{dict.home.whyBody}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {dict.home.whyItems.map((item) => (
              <div key={item.title} className="glass-card rounded-[1.75rem] p-6">
                <h3 className="font-[family-name:var(--font-manrope)] text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-on-surface-variant)]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-shell py-10">
          <h2 className="font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-tight">
            {dict.home.howItWorksTitle}
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {dict.home.howItWorks.map((item) => (
              <div key={item.title} className="surface-card p-6">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-on-surface-variant)]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <TestimonialsCarousel items={dict.home.testimonials} title={dict.home.testimonialsTitle} />

        <section className="section-shell pb-24">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="surface-card relative overflow-hidden p-8 md:p-10">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[var(--color-primary-container)]/18 blur-2xl" />
              <span className="eyebrow">
                <MapPin className="h-4 w-4" />
                {dict.contact.infoTitle}
              </span>
              <h2 className="mt-6 font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-tight">
                {dict.contact.infoTitle}
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--color-on-surface-variant)]">
                {dict.contact.subtitle}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {dict.contact.infoLines.map((line, index) => {
                  const icon =
                    index === 0 ? (
                      <MapPin className="h-5 w-5" />
                    ) : index === 1 ? (
                      <PhoneCall className="h-5 w-5" />
                    ) : (
                      <Clock3 className="h-5 w-5" />
                    );

                  return (
                    <div
                      key={line}
                      className="rounded-[1.5rem] border border-white/60 bg-[var(--color-surface-container-low)] p-5"
                    >
                      <div className="mb-3 text-[var(--color-primary)]">{icon}</div>
                      <div className="text-sm leading-7 text-[var(--color-on-surface)]">{line}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-[var(--color-primary)] p-8 text-white shadow-[0_30px_70px_rgba(0,96,176,0.22)] md:p-10">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/12 blur-2xl" />
              <div className="absolute -bottom-10 left-0 h-40 w-40 rounded-full bg-[#7dc2ff]/18 blur-3xl" />
              <div className="relative">
                <div className="text-sm font-bold uppercase tracking-[0.24em] text-white/70">
                  {dict.brand.city}
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-manrope)] text-4xl font-extrabold leading-tight">
                  {dict.brand.name}
                </h3>
                <p className="mt-4 max-w-xl text-lg leading-8 text-white/82">
                  {dict.contact.infoLines[0]}. {dict.contact.infoLines[1]}.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={getLocaleHref(locale, "/contact")}
                    className="btn border border-white/70 bg-white !text-[var(--color-primary)] shadow-[0_14px_28px_rgba(255,255,255,0.18)]"
                  >
                    <span className="!text-[var(--color-primary)]">{dict.nav.contact}</span>
                  </Link>
                  <Link
                    href={getLocaleHref(locale, "/booking")}
                    className="btn border border-white/30 bg-white/10 text-white"
                  >
                    {dict.home.primaryCta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <ChatWidget
        locale={locale}
        services={allServices}
        isAuthenticated={Boolean(user)}
        bookingUrl={getLocaleHref(locale, "/booking")}
        signUpUrl={getLocaleHref(locale, "/auth/sign-up")}
        signInUrl={getLocaleHref(locale, "/auth/sign-in")}
      />
    </SiteShell>
  );
}
