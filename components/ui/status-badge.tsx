import { getBookingStatusLabel, getPaymentStatusLabel } from "@/lib/i18n";
import type { BookingStatus, Locale, PaymentStatus } from "@/types/app";

const bookingStatusTone: Record<BookingStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  new: "bg-sky-100 text-sky-700",
  whatsapp_sent: "bg-cyan-100 text-cyan-700",
  pending_confirmation: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-violet-100 text-violet-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const paymentStatusTone: Record<PaymentStatus, string> = {
  unpaid: "bg-rose-100 text-rose-700",
  pending_whatsapp: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  refunded: "bg-slate-200 text-slate-700",
};

export function BookingStatusBadge({ locale, status }: { locale: Locale; status: BookingStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${bookingStatusTone[status]}`}>
      {getBookingStatusLabel(locale, status)}
    </span>
  );
}

export function PaymentStatusBadge({
  locale,
  status,
}: {
  locale: Locale;
  status: PaymentStatus;
}) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${paymentStatusTone[status]}`}>
      {getPaymentStatusLabel(locale, status)}
    </span>
  );
}
