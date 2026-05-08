import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { getDictionary, getEventLabel, getLocaleHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";
import { getUserBookings } from "@/lib/queries/bookings";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const { user, profile } = await requireUser(locale);
  const bookings = await getUserBookings(locale, user.id);
  const activeBookings = bookings.filter((booking) => !["completed", "cancelled"].includes(booking.status));
  const historyBookings = bookings.filter((booking) => ["completed", "cancelled"].includes(booking.status));

  return (
    <SiteShell
      locale={locale}
      pathname={`/${locale}/dashboard`}
      isAuthenticated
      role={profile?.role}
    >
      <main className="section-shell py-16">
        <div className="max-w-3xl">
          <h1 className="font-[family-name:var(--font-manrope)] text-5xl font-extrabold tracking-tight">
            {dict.dashboard.title}
          </h1>
          <p className="mt-4 text-lg text-[var(--color-on-surface-variant)]">{dict.dashboard.subtitle}</p>
        </div>

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold">
              {dict.dashboard.upcoming}
            </h2>
            <Link href={getLocaleHref(locale, "/booking")} className="btn btn-primary">
              {dict.nav.booking}
            </Link>
          </div>

          {activeBookings.length === 0 ? (
            <div className="surface-card p-8 text-[var(--color-on-surface-variant)]">{dict.dashboard.empty}</div>
          ) : (
            <div className="grid gap-5">
              {activeBookings.map((booking) => (
                <article key={booking.id} className="surface-card p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
                        {booking.bookingNumber}
                      </div>
                      <h3 className="mt-2 text-2xl font-bold">{booking.serviceTitle}</h3>
                      <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                        {formatDate(booking.scheduledDate, locale)} · {booking.timeWindow}
                      </p>
                      <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                        {booking.district}, {booking.addressLine}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <BookingStatusBadge locale={locale} status={booking.status} />
                      <PaymentStatusBadge locale={locale} status={booking.paymentStatus} />
                      <div className="text-2xl font-extrabold text-[var(--color-primary)]">
                        {formatPrice(booking.totalKzt, locale)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
                      <div className="font-bold text-[var(--color-on-surface)]">{dict.dashboard.lastActivity}</div>
                      <div className="mt-2">
                        {booking.lastEvent
                          ? `${getEventLabel(locale, booking.lastEvent.event_type)} · ${formatDate(booking.lastEvent.created_at, locale)}`
                          : dict.misc.notSpecified}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
                      <div className="font-bold text-[var(--color-on-surface)]">{dict.booking.review.addons}</div>
                      <div className="mt-2">
                        {booking.addonTitles.length ? booking.addonTitles.join(", ") : dict.booking.review.emptyAddons}
                      </div>
                    </div>
                  </div>

                  {booking.whatsappUrl ? (
                    <div className="mt-5">
                      <a href={booking.whatsappUrl} className="btn btn-secondary">
                        {dict.dashboard.reopenWhatsapp}
                      </a>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold">
            {dict.dashboard.history}
          </h2>
          <div className="mt-6 grid gap-4">
            {historyBookings.map((booking) => (
              <div key={booking.id} className="surface-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="font-bold">{booking.bookingNumber}</div>
                    <div className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                      {booking.serviceTitle} · {formatDate(booking.scheduledDate, locale)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookingStatusBadge locale={locale} status={booking.status} />
                    <div className="font-bold text-[var(--color-primary)]">
                      {formatPrice(booking.totalKzt, locale)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
