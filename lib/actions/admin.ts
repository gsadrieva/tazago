"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale } from "@/lib/locale";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus, PaymentStatus } from "@/types/app";

function parseLines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isAllowedStatusTransition(from: string, to: string) {
  return (
    (from === "new" && ["pending_confirmation", "cancelled"].includes(to)) ||
    (from === "whatsapp_sent" && ["pending_confirmation", "cancelled"].includes(to)) ||
    (from === "pending_confirmation" && ["confirmed", "cancelled"].includes(to)) ||
    (from === "confirmed" && ["in_progress", "cancelled"].includes(to)) ||
    (from === "in_progress" && to === "completed") ||
    (from === "draft" && ["new", "cancelled"].includes(to))
  );
}

async function updateBookingStatusWithServiceRole(
  bookingId: string,
  status: string,
  note: string
) {
  const supabase = createAdminClient();
  const { data: booking, error: lookupError } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", bookingId)
    .maybeSingle();

  if (lookupError || !booking || !isAllowedStatusTransition(booking.status, status)) {
    return { error: lookupError ?? new Error("invalid_transition") };
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: status as BookingStatus })
    .eq("id", bookingId);

  if (updateError) {
    return { error: updateError };
  }

  const { error: eventError } = await supabase.from("booking_status_events").insert({
    booking_id: bookingId,
    actor_user_id: null,
    event_type: "status_changed",
    from_status: booking.status,
    to_status: status,
    note: note || null,
  });

  return { error: eventError };
}

async function updateBookingPaymentWithServiceRole(
  bookingId: string,
  paymentStatus: string,
  note: string
) {
  if (!["unpaid", "pending_whatsapp", "paid", "refunded"].includes(paymentStatus)) {
    return { error: new Error("invalid_payment_status") };
  }

  const supabase = createAdminClient();
  const { data: booking, error: lookupError } = await supabase
    .from("bookings")
    .select("payment_status")
    .eq("id", bookingId)
    .maybeSingle();

  if (lookupError || !booking) {
    return { error: lookupError ?? new Error("booking_not_found") };
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ payment_status: paymentStatus as PaymentStatus })
    .eq("id", bookingId);

  if (updateError) {
    return { error: updateError };
  }

  const { error: eventError } = await supabase.from("booking_status_events").insert({
    booking_id: bookingId,
    actor_user_id: null,
    event_type: "payment_status_changed",
    from_status: booking.payment_status,
    to_status: paymentStatus,
    note: note || null,
  });

  return { error: eventError };
}

async function createServiceWithServiceRole(payload: {
  p_slug: string;
  p_base_price_kzt: number;
  p_duration_min: number;
  p_category: string;
  p_image_url: string | null;
  p_sort_order: number;
  p_title_kk: string;
  p_subtitle_kk: string;
  p_summary_kk: string;
  p_description_kk: string;
  p_title_ru: string;
  p_subtitle_ru: string;
  p_summary_ru: string;
  p_description_ru: string;
  p_features_kk: string[];
  p_features_ru: string[];
}) {
  const supabase = createAdminClient();
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .insert({
      slug: payload.p_slug,
      base_price_kzt: payload.p_base_price_kzt,
      duration_min: payload.p_duration_min,
      category: payload.p_category,
      image_url: payload.p_image_url,
      sort_order: payload.p_sort_order,
    })
    .select("id")
    .single();

  if (serviceError || !service) {
    return { error: serviceError ?? new Error("service_not_created") };
  }

  const { error: translationsError } = await supabase.from("service_translations").insert([
    {
      service_id: service.id,
      locale: "kk",
      title: payload.p_title_kk,
      subtitle: payload.p_subtitle_kk,
      summary: payload.p_summary_kk,
      description: payload.p_description_kk,
    },
    {
      service_id: service.id,
      locale: "ru",
      title: payload.p_title_ru,
      subtitle: payload.p_subtitle_ru,
      summary: payload.p_summary_ru,
      description: payload.p_description_ru,
    },
  ]);

  if (translationsError) {
    return { error: translationsError };
  }

  const maxFeatures = Math.max(payload.p_features_kk.length, payload.p_features_ru.length);
  for (let index = 0; index < maxFeatures; index += 1) {
    const kkText = payload.p_features_kk[index] || payload.p_features_ru[index] || payload.p_title_kk;
    const ruText = payload.p_features_ru[index] || payload.p_features_kk[index] || payload.p_title_ru;

    if (!kkText && !ruText) {
      continue;
    }

    const { data: feature, error: featureError } = await supabase
      .from("service_features")
      .insert({ service_id: service.id, sort_order: index + 1 })
      .select("id")
      .single();

    if (featureError || !feature) {
      return { error: featureError ?? new Error("feature_not_created") };
    }

    const { error: featureTranslationError } = await supabase
      .from("service_feature_translations")
      .insert([
        { feature_id: feature.id, locale: "kk", text: kkText },
        { feature_id: feature.id, locale: "ru", text: ruText },
      ]);

    if (featureTranslationError) {
      return { error: featureTranslationError };
    }
  }

  return { error: null };
}

export async function updateBookingStatusAction(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const adminContext = await requireAdmin(locale);
  const bookingId = String(formData.get("bookingId") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "");
  const { error } = adminContext.adminSession
    ? await updateBookingStatusWithServiceRole(bookingId, status, note)
    : await (await createClient()).rpc("admin_transition_booking", {
        p_booking_id: bookingId,
        p_to_status: status,
        p_note: note || null,
      });

  if (error) {
    redirect(`/${locale}/admin?error=status`);
  }

  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/dashboard`);
}

export async function updateBookingPaymentAction(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const adminContext = await requireAdmin(locale);
  const bookingId = String(formData.get("bookingId") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "");
  const note = String(formData.get("note") ?? "");
  const { error } = adminContext.adminSession
    ? await updateBookingPaymentWithServiceRole(bookingId, paymentStatus, note)
    : await (await createClient()).rpc("admin_update_booking_payment_status", {
        p_booking_id: bookingId,
        p_payment_status: paymentStatus,
        p_note: note || null,
      });

  if (error) {
    redirect(`/${locale}/admin?error=payment`);
  }

  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/dashboard`);
}

export async function createServiceAction(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const adminContext = await requireAdmin(locale);

  const slug = String(formData.get("slug") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  const payload = {
    p_slug: slug,
    p_base_price_kzt: parseNumber(formData.get("basePriceKzt")),
    p_duration_min: parseNumber(formData.get("durationMin")),
    p_category: category,
    p_image_url: imageUrl || null,
    p_sort_order: parseNumber(formData.get("sortOrder")),
    p_title_kk: String(formData.get("titleKk") ?? "").trim(),
    p_subtitle_kk: String(formData.get("subtitleKk") ?? "").trim(),
    p_summary_kk: String(formData.get("summaryKk") ?? "").trim(),
    p_description_kk: String(formData.get("descriptionKk") ?? "").trim(),
    p_title_ru: String(formData.get("titleRu") ?? "").trim(),
    p_subtitle_ru: String(formData.get("subtitleRu") ?? "").trim(),
    p_summary_ru: String(formData.get("summaryRu") ?? "").trim(),
    p_description_ru: String(formData.get("descriptionRu") ?? "").trim(),
    p_features_kk: parseLines(formData.get("featuresKk")),
    p_features_ru: parseLines(formData.get("featuresRu")),
  };

  const { error } = adminContext.adminSession
    ? await createServiceWithServiceRole(payload)
    : await (await createClient()).rpc("admin_create_service", payload);

  if (error) {
    redirect(`/${locale}/admin?error=service`);
  }

  revalidatePath("/kk");
  revalidatePath("/ru");
  revalidatePath("/kk/services");
  revalidatePath("/ru/services");
  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/kk/services/${slug}`);
  revalidatePath(`/ru/services/${slug}`);

  redirect(`/${locale}/admin?created=service`);
}
