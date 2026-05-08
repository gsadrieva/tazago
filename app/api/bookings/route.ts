import { NextResponse } from "next/server";

import { bookingPayloadSchema } from "@/lib/booking";
import { createClient } from "@/lib/supabase/server";

function resolveWhatsappPhone() {
  const normalized = (process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "77757004494").replace(/\D/g, "");
  return normalized || "77757004494";
}

function buildWhatsAppMessage(locale: "kk" | "ru", payload: any, result: any) {
  const addons = Array.isArray(result.addon_titles) && result.addon_titles.length > 0
    ? result.addon_titles.join(", ")
    : locale === "kk"
      ? "Қосымша опция жоқ"
      : "Без дополнительных опций";

  if (locale === "kk") {
    return [
      `Сәлем! Жаңа өтінім: ${result.booking_number}`,
      `Қызмет: ${result.service_title}`,
      `Күні: ${payload.scheduledDate}`,
      `Уақыт: ${payload.timeWindow}`,
      `Аудан: ${payload.district}`,
      `Мекенжай: ${payload.addressLine}`,
      `Қосымшалар: ${addons}`,
      `Сома: ${result.total_kzt} ₸`,
      `Клиент: ${payload.customerName}`,
      `Телефон: ${payload.customerPhone}`,
      `Комментарий: ${payload.comment || "Жоқ"}`,
    ].join("\n");
  }

  return [
    `Здравствуйте! Новая заявка: ${result.booking_number}`,
    `Услуга: ${result.service_title}`,
    `Дата: ${payload.scheduledDate}`,
    `Время: ${payload.timeWindow}`,
    `Район: ${payload.district}`,
    `Адрес: ${payload.addressLine}`,
    `Дополнения: ${addons}`,
    `Сумма: ${result.total_kzt} ₸`,
    `Клиент: ${payload.customerName}`,
    `Телефон: ${payload.customerPhone}`,
    `Комментарий: ${payload.comment || "Нет"}`,
  ].join("\n");
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rawPayload = await request.json();
  const parsed = bookingPayloadSchema.safeParse(rawPayload);

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));

    return NextResponse.json({ error: "invalid_payload", details }, { status: 400 });
  }

  const payload = parsed.data;
  const { data, error } = await supabase.rpc("create_booking", {
    p_service_id: payload.serviceId,
    p_addon_ids: payload.addonIds,
    p_locale: payload.locale,
    p_customer_name: payload.customerName,
    p_customer_phone: payload.customerPhone,
    p_customer_email: payload.customerEmail || "",
    p_city: payload.city,
    p_district: payload.district,
    p_address_line: payload.addressLine,
    p_apartment_details: payload.apartmentDetails || "",
    p_scheduled_date: payload.scheduledDate,
    p_time_window: payload.timeWindow,
    p_comment: payload.comment || "",
  });

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "booking_failed" }, { status: 400 });
  }

  const locale = payload.locale;
  const whatsappPhone = resolveWhatsappPhone();
  const message = buildWhatsAppMessage(locale, payload, data);
  const redirectUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;

  const { error: markError } = await supabase.rpc("mark_booking_whatsapp_sent", {
    p_booking_id: data.booking_id,
    p_whatsapp_url: redirectUrl,
  });

  if (markError) {
    return NextResponse.json(
      { error: markError.message, bookingNumber: data.booking_number },
      { status: 400 }
    );
  }

  return NextResponse.json({
    redirectUrl,
    bookingNumber: data.booking_number,
    totalKzt: data.total_kzt,
  });
}
