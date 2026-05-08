"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

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

export async function updateBookingStatusAction(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const bookingId = String(formData.get("bookingId") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.rpc("admin_transition_booking", {
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
  const bookingId = String(formData.get("bookingId") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "");
  const note = String(formData.get("note") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.rpc("admin_update_booking_payment_status", {
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
  const supabase = await createClient();

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

  const { error } = await supabase.rpc("admin_create_service", payload);

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
