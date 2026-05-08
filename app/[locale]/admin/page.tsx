import {
  createServiceAction,
  updateBookingPaymentAction,
  updateBookingStatusAction,
} from "@/lib/actions/admin";
import { SiteShell } from "@/components/site-shell";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import {
  getBookingStatusLabel,
  getDictionary,
  getEventLabel,
  getPaymentStatusLabel,
} from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";
import { getAdminBookings } from "@/lib/queries/bookings";
import { getCatalogServices } from "@/lib/queries/catalog";
import type { BookingStatus, PaymentStatus } from "@/types/app";

const statusOptions: BookingStatus[] = [
  "new",
  "whatsapp_sent",
  "pending_confirmation",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

const paymentOptions: PaymentStatus[] = ["unpaid", "pending_whatsapp", "paid", "refunded"];
const serviceCategoryOptions = [
  "apartment_cleaning",
  "deep_cleaning",
  "post_renovation",
  "move_in_out",
  "upholstery",
  "windows",
  "office",
  "express",
] as const;

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
    paymentStatus?: string;
    service?: string;
    created?: string;
    error?: string;
  }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const { user, profile } = await requireAdmin(locale);
  const filters = await searchParams;
  const bookings = await getAdminBookings(locale, filters);
  const services = await getCatalogServices(locale);
  const serviceFormCopy =
    locale === "kk"
      ? {
          title: "Жаңа қызмет қосу",
          subtitle:
            "Әкімші панелінен жаңа қызметті, екі тілдегі мәтіндерін және негізгі артықшылықтарын бірден қоса аласыз.",
          slug: "Slug",
          category: "Санат",
          imageUrl: "Сурет URL",
          basePrice: "Бастапқы баға, тг",
          duration: "Ұзақтығы, минут",
          sortOrder: "Реті",
          titleKk: "Атауы (қаз)",
          subtitleKk: "Қысқа сипаттама (қаз)",
          summaryKk: "Қысқаша summary (қаз)",
          descriptionKk: "Толық сипаттама (қаз)",
          featuresKk: "Артықшылықтары (қаз, әр жолға бір тармақ)",
          titleRu: "Название (рус)",
          subtitleRu: "Короткое описание (рус)",
          summaryRu: "Краткий summary (рус)",
          descriptionRu: "Полное описание (рус)",
          featuresRu: "Преимущества (рус, по одному на строку)",
          submit: "Қызметті қосу",
          success: "Жаңа қызмет сәтті қосылды.",
          error: "Қызметті қосу кезінде қате шықты.",
        }
      : {
          title: "Добавить новую услугу",
          subtitle:
            "Из админки можно сразу создать новую услугу, ее тексты на двух языках и базовые преимущества.",
          slug: "Slug",
          category: "Категория",
          imageUrl: "URL изображения",
          basePrice: "Базовая цена, тг",
          duration: "Длительность, минут",
          sortOrder: "Порядок",
          titleKk: "Название (каз)",
          subtitleKk: "Короткое описание (каз)",
          summaryKk: "Краткий summary (каз)",
          descriptionKk: "Полное описание (каз)",
          featuresKk: "Преимущества (каз, по одному на строку)",
          titleRu: "Название (рус)",
          subtitleRu: "Короткое описание (рус)",
          summaryRu: "Краткий summary (рус)",
          descriptionRu: "Полное описание (рус)",
          featuresRu: "Преимущества (рус, по одному на строку)",
          submit: "Добавить услугу",
          success: "Новая услуга успешно добавлена.",
          error: "Не удалось добавить услугу.",
        };

  return (
    <SiteShell
      locale={locale}
      pathname={`/${locale}/admin`}
      isAuthenticated={Boolean(user)}
      role={profile?.role}
    >
      <main className="section-shell py-16">
        <div className="max-w-4xl">
          <h1 className="font-[family-name:var(--font-manrope)] text-5xl font-extrabold tracking-tight">
            {dict.admin.title}
          </h1>
          <p className="mt-4 text-lg text-[var(--color-on-surface-variant)]">{dict.admin.subtitle}</p>
        </div>

        {filters.created === "service" ? (
          <div className="mt-8 rounded-[1.5rem] bg-emerald-50 px-5 py-4 text-emerald-700">
            {serviceFormCopy.success}
          </div>
        ) : null}

        {filters.error === "service" ? (
          <div className="mt-8 rounded-[1.5rem] bg-rose-50 px-5 py-4 text-rose-700">
            {serviceFormCopy.error}
          </div>
        ) : null}

        <form action={createServiceAction} className="surface-card mt-10 grid gap-6 p-6 md:p-8">
          <input type="hidden" name="locale" value={locale} />

          <div>
            <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-tight">
              {serviceFormCopy.title}
            </h2>
            <p className="mt-3 max-w-3xl text-[var(--color-on-surface-variant)]">
              {serviceFormCopy.subtitle}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="field-block">
              <span>{serviceFormCopy.slug}</span>
              <input name="slug" placeholder="deep-cleaning-plus" required />
            </label>
            <label className="field-block">
              <span>{serviceFormCopy.category}</span>
              <select name="category" defaultValue="apartment_cleaning">
                {serviceCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-block">
              <span>{serviceFormCopy.imageUrl}</span>
              <input name="imageUrl" placeholder="https://..." />
            </label>
            <label className="field-block">
              <span>{serviceFormCopy.basePrice}</span>
              <input name="basePriceKzt" type="number" min="0" required />
            </label>
            <label className="field-block">
              <span>{serviceFormCopy.duration}</span>
              <input name="durationMin" type="number" min="1" required />
            </label>
            <label className="field-block">
              <span>{serviceFormCopy.sortOrder}</span>
              <input name="sortOrder" type="number" min="0" defaultValue="0" />
            </label>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[1.5rem] bg-[var(--color-surface-container-low)] p-5">
              <h3 className="text-xl font-bold">{serviceFormCopy.titleKk}</h3>
              <div className="mt-4 grid gap-4">
                <label className="field-block">
                  <span>{serviceFormCopy.titleKk}</span>
                  <input name="titleKk" required />
                </label>
                <label className="field-block">
                  <span>{serviceFormCopy.subtitleKk}</span>
                  <input name="subtitleKk" required />
                </label>
                <label className="field-block">
                  <span>{serviceFormCopy.summaryKk}</span>
                  <textarea name="summaryKk" rows={2} required />
                </label>
                <label className="field-block">
                  <span>{serviceFormCopy.descriptionKk}</span>
                  <textarea name="descriptionKk" rows={4} required />
                </label>
                <label className="field-block">
                  <span>{serviceFormCopy.featuresKk}</span>
                  <textarea name="featuresKk" rows={4} placeholder="Әр жолға бір артықшылық" />
                </label>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-[var(--color-surface-container-low)] p-5">
              <h3 className="text-xl font-bold">{serviceFormCopy.titleRu}</h3>
              <div className="mt-4 grid gap-4">
                <label className="field-block">
                  <span>{serviceFormCopy.titleRu}</span>
                  <input name="titleRu" required />
                </label>
                <label className="field-block">
                  <span>{serviceFormCopy.subtitleRu}</span>
                  <input name="subtitleRu" required />
                </label>
                <label className="field-block">
                  <span>{serviceFormCopy.summaryRu}</span>
                  <textarea name="summaryRu" rows={2} required />
                </label>
                <label className="field-block">
                  <span>{serviceFormCopy.descriptionRu}</span>
                  <textarea name="descriptionRu" rows={4} required />
                </label>
                <label className="field-block">
                  <span>{serviceFormCopy.featuresRu}</span>
                  <textarea name="featuresRu" rows={4} placeholder="По одному преимуществу на строку" />
                </label>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary">
              {serviceFormCopy.submit}
            </button>
          </div>
        </form>

        <form className="surface-card mt-10 grid gap-4 p-6 md:grid-cols-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="field-block">
            <span>{dict.admin.filters.search}</span>
            <input name="q" defaultValue={filters.q ?? ""} />
          </label>
          <label className="field-block">
            <span>{dict.admin.filters.status}</span>
            <select name="status" defaultValue={filters.status ?? ""}>
              <option value="">{dict.misc.all}</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {getBookingStatusLabel(locale, status)}
                </option>
              ))}
            </select>
          </label>
          <label className="field-block">
            <span>{dict.admin.filters.paymentStatus}</span>
            <select name="paymentStatus" defaultValue={filters.paymentStatus ?? ""}>
              <option value="">{dict.misc.all}</option>
              {paymentOptions.map((status) => (
                <option key={status} value={status}>
                  {getPaymentStatusLabel(locale, status)}
                </option>
              ))}
            </select>
          </label>
          <label className="field-block">
            <span>{dict.admin.filters.service}</span>
            <select name="service" defaultValue={filters.service ?? ""}>
              <option value="">{dict.misc.all}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-4">
            <button type="submit" className="btn btn-primary">
              {dict.nav.admin}
            </button>
          </div>
        </form>

        <div className="mt-10 grid gap-6">
          {bookings.length === 0 ? (
            <div className="surface-card p-8 text-[var(--color-on-surface-variant)]">{dict.admin.empty}</div>
          ) : (
            bookings.map((booking) => (
              <article key={booking.id} className="surface-card p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
                      {booking.bookingNumber}
                    </div>
                    <h2 className="mt-2 text-2xl font-bold">
                      {booking.customerName} / {booking.serviceTitle}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                      {booking.customerPhone} / {booking.customerEmail ?? dict.misc.notSpecified}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                      {formatDate(booking.scheduledDate, locale)} / {booking.timeWindow}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
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

                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  <form
                    action={updateBookingStatusAction}
                    className="rounded-[1.5rem] bg-[var(--color-surface-container-low)] p-5"
                  >
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <div className="grid gap-4">
                      <label className="field-block">
                        <span>{dict.admin.filters.status}</span>
                        <select name="status" defaultValue={booking.status}>
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {getBookingStatusLabel(locale, status)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field-block">
                        <span>{dict.admin.notes}</span>
                        <textarea name="note" rows={3} defaultValue={booking.comment ?? ""} />
                      </label>
                      <button type="submit" className="btn btn-secondary">
                        {dict.admin.saveStatus}
                      </button>
                    </div>
                  </form>

                  <form
                    action={updateBookingPaymentAction}
                    className="rounded-[1.5rem] bg-[var(--color-surface-container-low)] p-5"
                  >
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <div className="grid gap-4">
                      <label className="field-block">
                        <span>{dict.admin.filters.paymentStatus}</span>
                        <select name="paymentStatus" defaultValue={booking.paymentStatus}>
                          {paymentOptions.map((status) => (
                            <option key={status} value={status}>
                              {getPaymentStatusLabel(locale, status)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field-block">
                        <span>{dict.admin.notes}</span>
                        <textarea name="note" rows={3} defaultValue={booking.comment ?? ""} />
                      </label>
                      <button type="submit" className="btn btn-secondary">
                        {dict.admin.savePayment}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="mt-6">
                  <div className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
                    {dict.dashboard.lastActivity}
                  </div>
                  <div className="grid gap-3">
                    {booking.events.map((event) => (
                      <div key={event.id} className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm">
                        <div className="font-bold">{getEventLabel(locale, event.event_type)}</div>
                        <div className="mt-1 text-[var(--color-on-surface-variant)]">
                          {`${event.from_status ?? "-"} -> ${event.to_status ?? "-"}`}
                        </div>
                        <div className="mt-1 text-[var(--color-on-surface-variant)]">
                          {formatDate(event.created_at, locale)}
                        </div>
                        {event.note ? (
                          <div className="mt-1 text-[var(--color-on-surface-variant)]">{event.note}</div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </SiteShell>
  );
}
