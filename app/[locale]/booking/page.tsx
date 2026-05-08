import Link from "next/link";

import { BookingWizard } from "@/components/booking/booking-wizard";
import { SiteShell } from "@/components/site-shell";
import { requireUser } from "@/lib/auth";
import { getDictionary, getLocaleHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";
import { getCatalogServices } from "@/lib/queries/catalog";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const query = await searchParams;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const selectedServiceSlug = typeof query.service === "string" ? query.service.trim() : "";
  const nextPath = selectedServiceSlug
    ? `/${locale}/booking?service=${encodeURIComponent(selectedServiceSlug)}`
    : `/${locale}/booking`;
  const { user, profile } = await requireUser(locale, nextPath);
  const services = await getCatalogServices(locale);

  return (
    <SiteShell
      locale={locale}
      pathname={`/${locale}/booking`}
      isAuthenticated={Boolean(user)}
      role={profile?.role}
    >
      <main className="section-shell py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-3xl">
            <h1 className="font-[family-name:var(--font-manrope)] text-5xl font-extrabold tracking-tight">
              {dict.booking.title}
            </h1>
            <p className="mt-4 text-lg text-[var(--color-on-surface-variant)]">{dict.booking.subtitle}</p>
          </div>
          <Link href={getLocaleHref(locale, "/dashboard")} className="btn btn-secondary">
            {dict.nav.dashboard}
          </Link>
        </div>

        <BookingWizard
          locale={locale}
          services={services}
          initialName={profile?.fullName}
          initialPhone={profile?.phone}
          initialEmail={user.email}
          initialServiceSlug={selectedServiceSlug || null}
        />
      </main>
    </SiteShell>
  );
}
