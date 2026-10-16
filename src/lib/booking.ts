import { property } from "../content/property";

export type TransportRequest = {
  direction: "pickup" | "dropoff" | "both";
  pickupPlace: string;
  pickupAt: string;
  dropoffPlace: string;
  dropoffAt: string;
  notes: string;
};
export type BookingRequest = {
  checkIn: string; checkOut: string; guests: number;
  name: string; email: string; phone: string; notes: string;
  transport: TransportRequest | null;
  consent: true;
};
export type Validation = { ok: true; data: BookingRequest } | { ok: false; errors: Record<string, string> };

export function lagosToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return year >= 2000 && year <= 9999 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function validateBooking(value: unknown, today = lagosToday()): Validation {
  const errors: Record<string, string> = {};
  const obj = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const str = (key: string, max: number) => {
    const text = typeof obj[key] === "string" ? obj[key].trim() : "";
    if (text.length > max) errors[key] = `Use no more than ${max} characters.`;
    return text;
  };
  const checkIn = str("checkIn", 10), checkOut = str("checkOut", 10);
  if (!isCalendarDate(checkIn) || checkIn < today) errors.checkIn = "Choose today or a future arrival date in Abuja.";
  if (!isCalendarDate(checkOut) || checkOut <= checkIn) errors.checkOut = "Departure must be after arrival.";
  const guests = obj.guests;
  if (typeof guests !== "number" || !Number.isSafeInteger(guests) || guests < 1) errors.guests = "Enter a whole number of guests, at least 1.";
  else if (property.guests !== null && guests > property.guests) errors.guests = `Seka Homes accommodates a maximum of ${property.guests} guests.`;
  const name = str("name", 100), email = str("email", 254), phone = str("phone", 40), notes = str("notes", 1500);
  if (name.length < 2) errors.name = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (phone && (!/^[+\d\s().-]+$/.test(phone) || phone.replace(/\D/g, "").length < 7)) errors.phone = "Enter a valid phone number, or leave it blank.";
  if (obj.consent !== true) errors.consent = "Please allow Seka Homes to use these details to respond to your request.";
  let transport: TransportRequest | null = null;
  if (obj.transport != null) {
    const t = typeof obj.transport === "object" ? obj.transport as Record<string, unknown> : {};
    const text = (key: string, max: number) => {
      const result = typeof t[key] === "string" ? t[key].trim() : "";
      if (result.length > max) errors[`transport.${key}`] = `Use no more than ${max} characters.`;
      return result;
    };
    const direction = t.direction;
    if (!["pickup", "dropoff", "both"].includes(String(direction))) errors["transport.direction"] = "Choose a transport option.";
    const pickupPlace = text("pickupPlace", 200), pickupAt = text("pickupAt", 16);
    const dropoffPlace = text("dropoffPlace", 200), dropoffAt = text("dropoffAt", 16), tripNotes = text("notes", 500);
    for (const leg of ["pickup", "dropoff"] as const) {
      if (direction !== leg && direction !== "both") continue;
      const place = leg === "pickup" ? pickupPlace : dropoffPlace;
      const at = leg === "pickup" ? pickupAt : dropoffAt;
      if (!place) errors[`transport.${leg}Place`] = "Enter the pickup point or destination.";
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(at) || !isCalendarDate(at.slice(0, 10)) || at.slice(0, 10) < today || Number(at.slice(11, 13)) > 23 || Number(at.slice(14, 16)) > 59) errors[`transport.${leg}At`] = "Choose a future trip date and time in Abuja local time.";
    }
    transport = { direction: direction as TransportRequest["direction"], pickupPlace, pickupAt, dropoffPlace, dropoffAt, notes: tripNotes };
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, data: { checkIn, checkOut, guests: guests as number, name, email, phone, notes, transport, consent: true } };
}
