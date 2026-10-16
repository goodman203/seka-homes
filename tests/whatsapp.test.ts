import { test } from "node:test";
import assert from "node:assert/strict";
import { buildEmailRequestUrl, buildWhatsAppRequestUrl } from "../src/lib/request-message";
import type { BookingRequest } from "../src/lib/booking";

const request: BookingRequest = { name: "Ada & Tunde", email: "ada+stay@example.com", phone: "+234 800 000 0000", checkIn: "2026-12-01", checkOut: "2026-12-02", guests: 3, notes: "Question? #1: arrival & luggage 🧳", transport: null, consent: true };
test("email uses the same complete message as WhatsApp with an encoded subject and body", () => {
  for (const transport of [null, { direction: "both" as const, pickupPlace: "A & B #1", pickupAt: "2026-12-01T15:00", dropoffPlace: "C? D", dropoffAt: "2026-12-02T13:00", notes: "Two bags & a pram" }]) {
    const data = { ...request, transport };
    const email = new URL(buildEmailRequestUrl(data));
    assert.equal(email.protocol, "mailto:");
    assert.equal(email.pathname, "info@sekahomes.com");
    assert.deepEqual([...email.searchParams.keys()], ["subject", "body"]);
    assert.equal(email.searchParams.get("subject"), "Seka Homes booking request: 2026-12-01 to 2026-12-02");
    assert.equal(email.searchParams.get("body"), new URL(buildWhatsAppRequestUrl(data)).searchParams.get("text"));
    assert.ok(email.searchParams.get("body")!.includes(request.notes));
  }
});
test("encodes every guest detail into one WhatsApp message without extra URL parameters", () => {
  const url = new URL(buildWhatsAppRequestUrl(request));
  assert.equal(`${url.origin}${url.pathname}`, "https://wa.me/2348059973415");
  assert.deepEqual([...url.searchParams.keys()], ["text"]);
  const text = url.searchParams.get("text")!;
  for (const value of [request.name, request.email, request.phone, request.checkIn, request.checkOut, "Guests: 3", request.notes, "Africa/Lagos", "Transport: not requested", "booking is not confirmed"]) assert.ok(text.includes(value));
});
test("includes both transport legs, local times and the separate quote/consent limits", () => {
  const text = new URL(buildWhatsAppRequestUrl({ ...request, transport: { direction: "both", pickupPlace: "Guest pickup point", pickupAt: "2026-12-01T15:00", dropoffPlace: "Guest destination", dropoffAt: "2026-12-02T13:00", notes: "Flight AB123; two bags" } })).searchParams.get("text")!;
  for (const value of ["Guest pickup point", "2026-12-01 15:00", "Guest destination", "2026-12-02 13:00", "Flight AB123; two bags", "separate fee", "No permission to share details with a transport partner"]) assert.ok(text.includes(value));
});
test("omits an unrequested transport leg and marks optional phone as not provided", () => {
  const text = new URL(buildWhatsAppRequestUrl({ ...request, phone: "", transport: { direction: "pickup", pickupPlace: "Pickup point", pickupAt: "2026-12-01T15:00", dropoffPlace: "Stale unused destination", dropoffAt: "2026-12-02T13:00", notes: "" } })).searchParams.get("text")!;
  assert.ok(text.includes("Phone: Not provided"));
  assert.ok(!text.includes("Stale unused destination"));
  assert.ok(!text.includes("Drop-off"));
});
