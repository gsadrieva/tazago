"use client";

import { useState } from "react";

import { formatPrice } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import type { CatalogService, Locale } from "@/types/app";

type BookingWizardProps = {
  locale: Locale;
  services: CatalogService[];
  initialName?: string | null;
  initialPhone?: string | null;
  initialEmail?: string | null;
  initialServiceSlug?: string | null;
};

type FormState = {
  serviceId: string;
  addonIds: string[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  district: string;
  addressLine: string;
  apartmentDetails: string;
  scheduledDate: string;
  timeWindow: string;
  comment: string;
};

function normalizeText(value: string) {
  return value.trim();
}

export function BookingWizard({
  locale,
  services,
  initialName,
  initialPhone,
  initialEmail,
  initialServiceSlug,
}: BookingWizardProps) {
  const dict = getDictionary(locale);
  const initialServiceId =
    services.find((service) => service.slug === initialServiceSlug)?.id ?? services[0]?.id ?? "";
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    serviceId: initialServiceId,
    addonIds: [],
    customerName: initialName ?? "",
    customerPhone: initialPhone ?? "",
    customerEmail: initialEmail ?? "",
    district: dict.booking.districts[0] ?? "",
    addressLine: "",
    apartmentDetails: "",
    scheduledDate: "",
    timeWindow: dict.booking.timeWindows[0] ?? "",
    comment: "",
  });

  const selectedService = services.find((service) => service.id === form.serviceId) ?? null;
  const availableAddons = selectedService?.addons ?? [];
  const selectedAddons = availableAddons.filter((addon) => form.addonIds.includes(addon.id));
  const total =
    (selectedService?.basePriceKzt ?? 0) +
    selectedAddons.reduce((sum, addon) => sum + addon.priceKzt, 0);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleAddon(addonId: string) {
    setForm((current) => ({
      ...current,
      addonIds: current.addonIds.includes(addonId)
        ? current.addonIds.filter((id) => id !== addonId)
        : [...current.addonIds, addonId],
    }));
  }

  function validateCurrentStep() {
    if (step === 0 && !form.serviceId) return dict.booking.validation.serviceMissing;
    if (step === 1 && (!form.scheduledDate || !form.timeWindow)) return dict.booking.validation.required;
    if (step === 2 && (!form.district || !form.addressLine)) return dict.booking.validation.required;
    if (step === 3 && (!form.customerName || !form.customerPhone)) return dict.booking.validation.required;
    return null;
  }

  function getServerErrorMessage(data: unknown) {
    if (!data || typeof data !== "object") {
      return "booking_failed";
    }

    const payload = data as {
      error?: string;
      details?: Array<{ path?: string; message?: string }>;
    };

    if (payload.error === "invalid_payload") {
      const firstDetail = payload.details?.[0];

      if (firstDetail?.path === "customerEmail") {
        return locale === "kk"
          ? "Email мекенжайын дұрыс толтырыңыз немесе бос қалдырыңыз."
          : "Укажите корректный email или оставьте поле пустым.";
      }

      if (
        firstDetail?.path === "addressLine" ||
        firstDetail?.path === "customerName" ||
        firstDetail?.path === "customerPhone" ||
        firstDetail?.path === "district"
      ) {
        return dict.booking.validation.required;
      }

      return locale === "kk"
        ? "Өтінімдегі кейбір өрістер дұрыс толтырылмаған."
        : "Некоторые поля заявки заполнены некорректно.";
    }

    return typeof payload.error === "string" ? payload.error : "booking_failed";
  }

  async function submitBooking() {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locale,
        serviceId: form.serviceId,
        addonIds: form.addonIds,
        customerName: normalizeText(form.customerName),
        customerPhone: normalizeText(form.customerPhone),
        customerEmail: normalizeText(form.customerEmail),
        city: "Алматы",
        district: normalizeText(form.district),
        addressLine: normalizeText(form.addressLine),
        apartmentDetails: normalizeText(form.apartmentDetails),
        scheduledDate: form.scheduledDate,
        timeWindow: normalizeText(form.timeWindow),
        comment: normalizeText(form.comment),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setSubmitting(false);
      setError(getServerErrorMessage(data));
      return;
    }

    window.location.assign(data.redirectUrl);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="surface-card p-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {dict.booking.steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={[
                "rounded-full px-4 py-2 text-sm font-bold transition",
                index === step
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-secondary-container)] text-[var(--color-on-surface-variant)]",
              ].join(" ")}
            >
              {index + 1}. {label}
            </button>
          ))}
        </div>

        {step === 0 ? (
          <div className="grid gap-4">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => update("serviceId", service.id)}
                className={[
                  "rounded-[1.5rem] border p-5 text-left transition",
                  form.serviceId === service.id
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-container)]/10"
                    : "border-[var(--color-outline-variant)]/40 bg-white",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{service.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                      {service.summary}
                    </p>
                  </div>
                  <div className="text-right font-bold text-[var(--color-primary)]">
                    {formatPrice(service.basePriceKzt, locale)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-5 md:grid-cols-2">
            <label className="field-block">
              <span>{dict.booking.fields.date}</span>
              <input
                type="date"
                value={form.scheduledDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(event) => update("scheduledDate", event.target.value)}
              />
            </label>
            <label className="field-block">
              <span>{dict.booking.fields.timeWindow}</span>
              <select value={form.timeWindow} onChange={(event) => update("timeWindow", event.target.value)}>
                {dict.booking.timeWindows.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-5">
            <label className="field-block">
              <span>{dict.booking.fields.district}</span>
              <select value={form.district} onChange={(event) => update("district", event.target.value)}>
                {dict.booking.districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-block">
              <span>{dict.booking.fields.address}</span>
              <input
                value={form.addressLine}
                onChange={(event) => update("addressLine", event.target.value)}
                placeholder={locale === "kk" ? "Көше, үй, подъезд, пәтер" : "Улица, дом, подъезд, квартира"}
              />
            </label>
            <label className="field-block">
              <span>{dict.booking.fields.apartmentDetails}</span>
              <textarea
                value={form.apartmentDetails}
                onChange={(event) => update("apartmentDetails", event.target.value)}
                rows={4}
              />
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-5 md:grid-cols-2">
            <label className="field-block">
              <span>{dict.booking.fields.fullName}</span>
              <input value={form.customerName} onChange={(event) => update("customerName", event.target.value)} />
            </label>
            <label className="field-block">
              <span>{dict.booking.fields.phone}</span>
              <input value={form.customerPhone} onChange={(event) => update("customerPhone", event.target.value)} />
            </label>
            <label className="field-block md:col-span-2">
              <span>{dict.booking.fields.email}</span>
              <input
                type="email"
                value={form.customerEmail}
                onChange={(event) => update("customerEmail", event.target.value)}
              />
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-4">
            {availableAddons.map((addon) => {
              const active = form.addonIds.includes(addon.id);
              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => toggleAddon(addon.id)}
                  className={[
                    "rounded-[1.5rem] border p-5 text-left transition",
                    active
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-container)]/10"
                      : "border-[var(--color-outline-variant)]/40 bg-white",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{addon.title}</h3>
                      <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                        {addon.description}
                      </p>
                    </div>
                    <div className="font-bold text-[var(--color-primary)]">
                      {formatPrice(addon.priceKzt, locale)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="grid gap-5">
            <div className="rounded-[1.5rem] bg-[var(--color-surface-container-low)] p-5">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
                {dict.booking.review.service}
              </div>
              <div className="mt-2 text-xl font-bold">{selectedService?.title}</div>
            </div>
            <div className="rounded-[1.5rem] bg-[var(--color-surface-container-low)] p-5">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
                {dict.booking.review.addons}
              </div>
              <div className="mt-2">
                {selectedAddons.length
                  ? selectedAddons.map((addon) => addon.title).join(", ")
                  : dict.booking.review.emptyAddons}
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-[var(--color-surface-container-low)] p-5">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
                {dict.booking.review.contact}
              </div>
              <div className="mt-2">{form.customerName}</div>
              <div className="text-sm text-[var(--color-on-surface-variant)]">{form.customerPhone}</div>
            </div>
            <label className="field-block">
              <span>{dict.booking.fields.comment}</span>
              <textarea value={form.comment} onChange={(event) => update("comment", event.target.value)} rows={4} />
            </label>
          </div>
        ) : null}

        {error ? <p className="mt-5 text-sm font-semibold text-[var(--color-error)]">{error}</p> : null}

        <div className="mt-8 flex flex-wrap justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            className="btn btn-secondary"
            disabled={step === 0 || submitting}
          >
            {dict.booking.buttons.back}
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                const validationError = validateCurrentStep();
                if (validationError) {
                  setError(validationError);
                  return;
                }
                setError(null);
                setStep((current) => Math.min(5, current + 1));
              }}
              className="btn btn-primary"
            >
              {dict.booking.buttons.next}
            </button>
          ) : (
            <button type="button" onClick={submitBooking} className="btn btn-primary" disabled={submitting}>
              {submitting ? dict.booking.buttons.submitting : dict.booking.buttons.submit}
            </button>
          )}
        </div>
      </div>

      <aside className="surface-card h-fit p-8">
        <p className="eyebrow">{dict.brand.whatsappLabel}</p>
        <h2 className="mt-6 font-[family-name:var(--font-manrope)] text-3xl font-extrabold">
          {dict.booking.review.title}
        </h2>
        <p className="mt-4 text-[var(--color-on-surface-variant)]">{dict.booking.review.note}</p>

        <div className="mt-8 space-y-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
              {dict.booking.review.service}
            </div>
            <div className="mt-2 font-bold">{selectedService?.title ?? "-"}</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
              {dict.booking.review.address}
            </div>
            <div className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
              {form.district}, {form.addressLine || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
              {dict.booking.review.addons}
            </div>
            <div className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
              {selectedAddons.length
                ? selectedAddons.map((addon) => addon.title).join(", ")
                : dict.booking.review.emptyAddons}
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-[var(--color-primary)] p-5 text-white">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              {dict.booking.review.total}
            </div>
            <div className="mt-2 text-3xl font-extrabold">{formatPrice(total, locale)}</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
