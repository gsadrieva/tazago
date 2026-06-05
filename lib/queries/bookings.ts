import { createClient } from "@/lib/supabase/server";
import type { BookingDetail, BookingListItem, Locale } from "@/types/app";

export async function getUserBookings(locale: Locale, userId: string): Promise<BookingListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      booking_number,
      customer_name,
      customer_phone,
      customer_email,
      city,
      district,
      address_line,
      apartment_details,
      scheduled_date,
      time_window,
      comment,
      total_kzt,
      status,
      payment_status,
      whatsapp_url,
      created_at,
      services!inner(
        slug,
        service_translations!inner(locale, title)
      ),
      booking_status_events(
        id,
        event_type,
        from_status,
        to_status,
        note,
        created_at
      ),
      booking_items(
        id,
        item_type,
        title_snapshot,
        price_kzt,
        quantity,
        line_total_kzt
      )
    `
    )
    .eq("user_id", userId)
    .eq("services.service_translations.locale", locale)
    .order("scheduled_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((booking: any) => {
    const serviceTitle = booking.services?.service_translations?.[0]?.title ?? booking.services?.slug ?? "";
    const events = (booking.booking_status_events ?? []).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const addons = (booking.booking_items ?? [])
      .filter((item: any) => item.item_type === "addon")
      .map((item: any) => item.title_snapshot);

    return {
      id: booking.id,
      bookingNumber: booking.booking_number,
      serviceTitle,
      customerName: booking.customer_name,
      customerPhone: booking.customer_phone,
      scheduledDate: booking.scheduled_date,
      timeWindow: booking.time_window,
      totalKzt: booking.total_kzt,
      status: booking.status,
      paymentStatus: booking.payment_status,
      whatsappUrl: booking.whatsapp_url,
      district: booking.district,
      addressLine: booking.address_line,
      comment: booking.comment,
      createdAt: booking.created_at,
      lastEvent: events[0] ?? null,
      addonTitles: addons,
    } satisfies BookingListItem;
  });
}

export async function getAdminBookings(
  locale: Locale,
  filters: { q?: string; status?: string; paymentStatus?: string; service?: string }
): Promise<BookingDetail[]> {
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select(`
      id, booking_number, customer_name, customer_phone, customer_email,
      district, address_line, scheduled_date, time_window, total_kzt,
      status, payment_status, comment, created_at, service_id
    `)
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.paymentStatus) query = query.eq("payment_status", filters.paymentStatus);
  if (filters.service) query = query.eq("service_id", filters.service);
  if (filters.q) {
    query = query.or(
      `booking_number.ilike.%${filters.q}%,customer_name.ilike.%${filters.q}%,customer_phone.ilike.%${filters.q}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const bookings = data ?? [];
  if (bookings.length === 0) return [];

  const serviceIds = [...new Set(bookings.map((b: any) => b.service_id))];
  const { data: translations } = await supabase
    .from("service_translations")
    .select("service_id, title")
    .in("service_id", serviceIds)
    .eq("locale", locale);

  const titleMap = Object.fromEntries(
    (translations ?? []).map((t: any) => [t.service_id, t.title])
  );

  const bookingIds = bookings.map((b: any) => b.id);
  const { data: events } = await supabase
    .from("booking_status_events")
    .select("id, booking_id, event_type, from_status, to_status, note, created_at")
    .in("booking_id", bookingIds)
    .order("created_at", { ascending: false });

  const eventsMap: Record<string, any[]> = {};
  for (const e of events ?? []) {
    if (!eventsMap[e.booking_id]) eventsMap[e.booking_id] = [];
    eventsMap[e.booking_id].push(e);
  }

  return bookings.map((booking: any) => ({
    id: booking.id,
    bookingNumber: booking.booking_number,
    customerName: booking.customer_name,
    customerPhone: booking.customer_phone,
    customerEmail: booking.customer_email,
    district: booking.district,
    addressLine: booking.address_line,
    scheduledDate: booking.scheduled_date,
    timeWindow: booking.time_window,
    totalKzt: booking.total_kzt,
    status: booking.status,
    paymentStatus: booking.payment_status,
    comment: booking.comment,
    createdAt: booking.created_at,
    serviceId: booking.service_id ?? "",
    serviceTitle: titleMap[booking.service_id] ?? "",
    events: eventsMap[booking.id] ?? [],
  })) as BookingDetail[];
}
