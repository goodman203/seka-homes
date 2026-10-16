import { contactLinks } from "../content/property";
import type { BookingRequest } from "./booking";

export function buildRequestMessage(request: BookingRequest) {
  const lines = [
    "Seka Homes booking request",
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    `Phone: ${request.phone || "Not provided"}`,
    `Arrival: ${request.checkIn}`,
    `Departure: ${request.checkOut}`,
    `Guests: ${request.guests}`,
    "Dates and trip times are in Africa/Lagos (Abuja local time).",
  ];
  if (request.notes) lines.push(`Stay notes: ${request.notes}`);
  const trip = request.transport;
  if (trip) {
    lines.push("", "Transport: separate quote requested");
    if (trip.direction === "pickup" || trip.direction === "both") {
      lines.push(`Pickup point: ${trip.pickupPlace}`, `Pickup date & time: ${trip.pickupAt.replace("T", " ")}`);
    }
    if (trip.direction === "dropoff" || trip.direction === "both") {
      lines.push(`Drop-off destination: ${trip.dropoffPlace}`, `Drop-off date & time: ${trip.dropoffAt.replace("T", " ")}`);
    }
    if (trip.notes) lines.push(`Trip details: ${trip.notes}`);
    lines.push("Transport is subject to partner availability and a separate fee agreed before commitment. No permission to share details with a transport partner is given here.");
  } else lines.push("Transport: not requested");
  lines.push("", "This is a request only. My booking is not confirmed and no payment is taken.");
  return lines.join("\n");
}

export function buildWhatsAppRequestUrl(request: BookingRequest) {
  return `${contactLinks.whatsapp}?text=${encodeURIComponent(buildRequestMessage(request))}`;
}

export function buildEmailRequestUrl(request: BookingRequest) {
  const subject = `Seka Homes booking request: ${request.checkIn} to ${request.checkOut}`;
  return `${contactLinks.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildRequestMessage(request))}`;
}
