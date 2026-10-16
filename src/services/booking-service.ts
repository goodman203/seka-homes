import "server-only";
import type { BookingRequest } from "@/lib/booking";

export function bookingServiceReady() {
  const endpoint = process.env.BOOKING_REQUEST_URL;
  if (!endpoint || !process.env.BOOKING_REQUEST_TOKEN) return false;
  try { return new URL(endpoint).protocol === "https:"; } catch { return false; }
}

export async function saveBookingRequest(request: BookingRequest, idempotencyKey: string) {
  if (!bookingServiceReady()) throw new Error("SERVICE_UNAVAILABLE");
  const response = await fetch(process.env.BOOKING_REQUEST_URL!, {
    method: "POST", redirect: "error", cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.BOOKING_REQUEST_TOKEN}`, "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ ...request, timezone: "Africa/Lagos", status: "pending", transportPartnerSharingAllowed: false }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("SERVICE_FAILURE");
  const saved: unknown = await response.json();
  if (!saved || typeof saved !== "object" || !("requestId" in saved) || typeof saved.requestId !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(saved.requestId) || !("status" in saved) || saved.status !== "pending") throw new Error("INVALID_ACKNOWLEDGEMENT");
  return { requestId: saved.requestId, status: "pending" as const };
}
