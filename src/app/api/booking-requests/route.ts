import { NextResponse } from "next/server";
import { validateBooking } from "@/lib/booking";
import { bookingServiceReady, saveBookingRequest } from "@/services/booking-service";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ message: "Please send your request from the Seka Homes website." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ message: "JSON is required." }, { status: 415 });
  let payload: unknown;
  try {
    // Limit actual streamed bytes, including requests without a Content-Length header.
    const reader = request.body?.getReader();
    if (!reader) throw new Error("EMPTY");
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16000) { await reader.cancel(); return NextResponse.json({ message: "Request is too large." }, { status: 413 }); }
      chunks.push(value);
    }
    payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch { return NextResponse.json({ message: "Please provide a valid request." }, { status: 400 }); }
  const result = validateBooking(payload);
  if (!result.ok) return NextResponse.json({ message: "Please check your details.", errors: result.errors }, { status: 422 });
  if (!bookingServiceReady()) return NextResponse.json({ message: "Online requests are not connected yet. Your request has not been sent or saved." }, { status: 503 });
  const key = request.headers.get("idempotency-key");
  if (!key || !/^[a-f0-9-]{36}$/i.test(key)) return NextResponse.json({ message: "A valid request identifier is required." }, { status: 400 });
  try {
    const saved = await saveBookingRequest(result.data, key);
    return NextResponse.json({ ...saved, message: "Request received and awaiting confirmation. Your stay is not booked. Transport availability and its separate fee must also be confirmed." }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "We could not verify receipt of your request. Your stay is not confirmed. Please retry; the same request identifier will prevent duplicates." }, { status: 502 });
  }
}
