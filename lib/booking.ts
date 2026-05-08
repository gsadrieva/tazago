import { z } from "zod";

const postgresUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function trimString(value: unknown) {
  return typeof value === "string" ? value.trim() : value;
}

function trimmed<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(trimString, schema);
}

export const bookingPayloadSchema = z.object({
  locale: z.enum(["kk", "ru"]),
  serviceId: trimmed(z.string().regex(postgresUuidRegex, "invalid_uuid")),
  addonIds: z.array(z.string().regex(postgresUuidRegex, "invalid_uuid")).default([]),
  customerName: trimmed(z.string().min(2)),
  customerPhone: trimmed(z.string().min(8)),
  customerEmail: trimmed(z.string()).optional().default("").refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "invalid_email"
  ),
  city: trimmed(z.string().min(2)),
  district: trimmed(z.string().min(2)),
  addressLine: trimmed(z.string().min(5)),
  apartmentDetails: trimmed(z.string()).optional().default(""),
  scheduledDate: trimmed(z.string().min(4)),
  timeWindow: trimmed(z.string().min(3)),
  comment: trimmed(z.string()).optional().default(""),
});

export type BookingPayload = z.infer<typeof bookingPayloadSchema>;
