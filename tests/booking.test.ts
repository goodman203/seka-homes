import { test } from "node:test";
import assert from "node:assert/strict";
import { isCalendarDate, lagosToday, validateBooking } from "../src/lib/booking";

const valid = { checkIn: "2026-10-12", checkOut: "2026-10-14", guests: 2, name: "Test Guest", email: "guest@example.com", phone: "", notes: "", transport: null, consent: true };
test("date validation rejects impossible dates and handles leap years", () => {
  assert.equal(isCalendarDate("2026-02-30"), false);
  assert.equal(isCalendarDate("2026-02-29"), false);
  assert.equal(isCalendarDate("2028-02-29"), true);
});
test("today follows Lagos across UTC midnight", () => {
  assert.equal(lagosToday(new Date("2026-10-11T23:30:00Z")), "2026-10-12");
});
test("enforces the owner-confirmed maximum of nine guests", () => {
  assert.equal(validateBooking(valid, "2026-10-11").ok, true);
  assert.equal(validateBooking({ ...valid, guests: 9 }, "2026-10-11").ok, true);
  const tooMany = validateBooking({ ...valid, guests: 10 }, "2026-10-11");
  assert.equal(tooMany.ok, false);
  if (!tooMany.ok) assert.match(tooMany.errors.guests, /maximum of 9 guests/);
});
test("rejects past, reversed and same-day date ranges", () => {
  assert.equal(validateBooking({ ...valid, checkIn: "2026-10-10" }, "2026-10-11").ok, false);
  assert.equal(validateBooking({ ...valid, checkOut: valid.checkIn }, "2026-10-11").ok, false);
  assert.equal(validateBooking({ ...valid, checkOut: "2026-10-11" }, "2026-10-11").ok, false);
});
test("rejects malformed guests, identity, consent and oversized notes", () => {
  for (const patch of [{ guests: 0 }, { guests: 1.5 }, { guests: "2" }, { email: "bad" }, { name: "" }, { consent: false }, { notes: "a".repeat(1501) }]) {
    assert.equal(validateBooking({ ...valid, ...patch }, "2026-10-11").ok, false);
  }
});
test("transport requires each requested leg and valid local trip times", () => {
  const transport = { direction: "both", pickupPlace: "Guest supplied point", pickupAt: "2026-10-12T15:00", dropoffPlace: "Guest supplied destination", dropoffAt: "2026-10-14T09:00", notes: "" };
  assert.equal(validateBooking({ ...valid, transport }, "2026-10-11").ok, true);
  for (const patch of [{ pickupPlace: "" }, { dropoffAt: "" }, { pickupAt: "2026-10-12T25:00" }, { pickupAt: "2026-02-30T09:00" }, { direction: "invalid" }]) {
    assert.equal(validateBooking({ ...valid, transport: { ...transport, ...patch } }, "2026-10-11").ok, false);
  }
});
