export const LOCALES = ["kk", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

export type UserRole = "customer" | "admin";

export type BookingStatus =
  | "draft"
  | "new"
  | "whatsapp_sent"
  | "pending_confirmation"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "pending_whatsapp" | "paid" | "refunded";

export type CatalogService = {
  id: string;
  slug: string;
  category: string;
  imageUrl: string | null;
  basePriceKzt: number;
  durationMin: number;
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  features: string[];
  addons: CatalogAddon[];
};

export type CatalogAddon = {
  id: string;
  serviceId: string | null;
  priceKzt: number;
  title: string;
  description: string;
};

export type BookingListItem = {
  id: string;
  bookingNumber: string;
  createdAt: string;
  scheduledDate: string;
  timeWindow: string;
  totalKzt: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  serviceTitle: string;
  customerName: string;
  customerPhone: string;
  district: string | null;
  addressLine: string;
  comment: string | null;
  addonTitles: string[];
  lastEvent: {
    id: string;
    event_type: string;
    from_status: string | null;
    to_status: string | null;
    note: string | null;
    created_at: string;
  } | null;
  whatsappUrl: string | null;
};

export type BookingDetail = BookingListItem & {
  customerEmail: string | null;
  comment: string | null;
  serviceId: string;
  events: Array<{
    id: string;
    event_type: string;
    from_status: string | null;
    to_status: string | null;
    note: string | null;
    created_at: string;
  }>;
};

export type AppProfile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  city: string;
  preferredLocale: Locale;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
};
