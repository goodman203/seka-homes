"use client";

import { useRef, useState } from "react";
import { lagosToday, validateBooking, type BookingRequest } from "@/lib/booking";
import { contactLinks, property } from "@/content/property";
import { buildEmailRequestUrl, buildWhatsAppRequestUrl } from "@/lib/request-message";
import { CancellationPolicy } from "@/components/cancellation-policy";

export function BookingForm({ today }: { today: string }) {
  const [transport, setTransport] = useState(false);
  const [direction, setDirection] = useState("pickup");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<BookingRequest | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const error = (name: string) => errors[name] ? <small id={`${name}-error`} className="field-error">{errors[name]}</small> : null;
  const input = (name: string, label: string, type = "text", required = false, maxLength?: number) => <label className="field" key={name}>
    <span>{label}{required && <span aria-hidden="true"> *</span>}</span>
    <input name={name} type={type} required={required} maxLength={maxLength} min={type === "date" ? today : type === "number" ? 1 : undefined} max={name === "guests" ? property.guests ?? undefined : undefined} step={type === "number" ? 1 : undefined} autoComplete={name === "name" ? "name" : name === "email" ? "email" : name === "phone" ? "tel" : undefined} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} />
    {error(name)}
  </label>;

  function review(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const result = validateBooking({ checkIn: get("checkIn"), checkOut: get("checkOut"), guests: Number(get("guests")), name: get("name"), email: get("email"), phone: get("phone"), notes: get("notes"), consent: fd.get("consent") === "on", transport: transport ? { direction, pickupPlace: get("transport.pickupPlace"), pickupAt: get("transport.pickupAt"), dropoffPlace: get("transport.dropoffPlace"), dropoffAt: get("transport.dropoffAt"), notes: get("transport.notes") } : null }, lagosToday());
    if (!result.ok) {
      setErrors(result.errors); setDraft(null);
      const field = event.currentTarget.elements.namedItem(Object.keys(result.errors)[0]);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    setErrors({}); setDraft(result.data);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const email = submitter instanceof HTMLButtonElement && submitter.value === "email";
    const url = email ? buildEmailRequestUrl(result.data) : buildWhatsAppRequestUrl(result.data);
    window.open(url, "_blank", "noopener,noreferrer");
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  return <form onSubmit={review} onChange={() => setDraft(null)}>
    <div className="form-note"><span className="status-dot" /><p>Your chosen WhatsApp or email app will open with your request ready to review. You must tap Send yourself to contact Seka Homes. This is a request only; your booking is not confirmed and no payment is taken.</p></div>
    <fieldset><legend>Your stay</legend><div className="form-grid">
      {input("checkIn", "Arrival", "date", true)}{input("checkOut", "Departure", "date", true)}
      {input("guests", "Number of guests", "number", true)}
    </div><p className="hint">Dates are in Abuja local time (Africa/Lagos). {property.guests === null ? "Guest capacity is awaiting owner details." : `Maximum ${property.guests} guests.`} Minimum stay: {property.minimumStay} {property.minimumStay === 1 ? "night" : "nights"}.</p></fieldset>
    <fieldset><legend>Your details</legend><div className="form-grid">
      {input("name", "Full name", "text", true, 100)}{input("email", "Email", "email", true, 254)}{input("phone", "Phone (optional)", "tel", false, 40)}
    </div><label className="field"><span>Anything else? (optional)</span><textarea name="notes" maxLength={1500} rows={3} placeholder="Tell us about your stay or ask a question." aria-invalid={!!errors.notes} aria-describedby={errors.notes ? "notes-error" : undefined} />{error("notes")}</label></fieldset>
    <fieldset className="transport-box"><legend>Optional transport</legend>
      <label className="check"><input type="checkbox" checked={transport} onChange={(e) => setTransport(e.target.checked)} /><span>I’d like a separate transport quote</span></label>
      <p className="hint">An additional-fee service arranged with transport partners, subject to availability. The fee must be confirmed before you commit.</p>
      {transport && <div className="transport-fields">
        <label className="field"><span>Which journey?</span><select value={direction} onChange={(e) => setDirection(e.target.value)}><option value="pickup">Pickup to Seka Homes</option><option value="dropoff">Drop-off from Seka Homes</option><option value="both">Both journeys</option></select>{error("transport.direction")}</label>
        {(direction === "pickup" || direction === "both") && <div className="form-grid">{input("transport.pickupPlace", "Pickup point", "text", true, 200)}{input("transport.pickupAt", "Pickup date & time (Abuja)", "datetime-local", true)}</div>}
        {(direction === "dropoff" || direction === "both") && <div className="form-grid">{input("transport.dropoffPlace", "Drop-off destination", "text", true, 200)}{input("transport.dropoffAt", "Departure date & time (Abuja)", "datetime-local", true)}</div>}
        <label className="field"><span>Trip details (optional)</span><textarea name="transport.notes" maxLength={500} rows={2} placeholder="Flight reference, luggage or other trip details." aria-invalid={!!errors["transport.notes"]} aria-describedby={errors["transport.notes"] ? "transport.notes-error" : undefined} />{error("transport.notes")}</label>
        <p className="hint">These details are for Seka Homes to discuss your quote. Sharing with a transport partner will require your separate consent; this form does not authorize partner sharing.</p>
      </div>}
    </fieldset>
    <CancellationPolicy id="booking-cancellation-policy" />
    <label className="check consent"><input name="consent" type="checkbox" required aria-invalid={!!errors.consent} aria-describedby="consent-info" /><span id="consent-info">I understand that my details will be shared with Seka Homes through my chosen WhatsApp or email app only if I review the message and tap Send myself. I allow Seka Homes to use those details to respond to my request. This does not confirm a booking or authorize sharing with a transport partner.</span></label>{error("consent")}
    <div className="submission-options" role="group" aria-label="Choose how to send your request">
      <button className="button review-button" type="submit" name="channel" value="whatsapp">Continue with WhatsApp <span aria-hidden="true">↗</span></button>
      <button className="button button-secondary" type="submit" name="channel" value="email">Send by email <span aria-hidden="true">↗</span></button>
    </div>
    <div className="contact-links" aria-label="Alternative contact options"><p className="hint">Prefer email or phone?</p><a href={contactLinks.email}>Email {property.contact.email}</a><a href={contactLinks.phone}>Call {property.contact.phone}</a></div>
    {draft && <div className="request-review" ref={statusRef} tabIndex={-1}>
      <p className="eyebrow">REVIEW AND SEND IN YOUR CHOSEN APP</p><h3>Your request details</h3>
      <dl><div><dt>Stay</dt><dd>{draft.checkIn} → {draft.checkOut}</dd></div><div><dt>Guests</dt><dd>{draft.guests}{property.guests === null ? " · capacity to be confirmed" : ` · maximum ${property.guests}`}</dd></div><div><dt>Guest</dt><dd>{draft.name}</dd></div><div><dt>Reply to</dt><dd>{draft.email}{draft.phone && ` · ${draft.phone}`}</dd></div>{draft.notes && <div><dt>Notes</dt><dd>{draft.notes}</dd></div>}
      <div><dt>Transport</dt><dd>{draft.transport ? `Separate quote requested · ${draft.transport.direction}` : "Not requested"}</dd></div>
      {draft.transport && <><div><dt>Pickup</dt><dd>{draft.transport.pickupPlace || "—"} {draft.transport.pickupAt.replace("T", " ")}</dd></div><div><dt>Drop-off</dt><dd>{draft.transport.dropoffPlace || "—"} {draft.transport.dropoffAt.replace("T", " ")}</dd></div>{draft.transport.notes && <div><dt>Trip details</dt><dd>{draft.transport.notes}</dd></div>}</>}
      </dl><p className="hint">Accommodation rates, fees, availability and terms need confirmation. Transport has its own fee and availability.</p>
      <p className="form-note" role="status">Review the request in your chosen app and tap Send yourself to contact Seka Homes. Your booking is not confirmed and no payment is taken. If your app didn’t open, use one of the links below or call us.</p>
      <div className="submission-options"><a className="button" href={buildWhatsAppRequestUrl(draft)} target="_blank" rel="noopener noreferrer">Open WhatsApp with these details <span aria-hidden="true">↗</span></a><a className="button button-secondary" href={buildEmailRequestUrl(draft)} target="_blank" rel="noopener noreferrer">Open email with these details <span aria-hidden="true">↗</span></a></div>
    </div>}
    <noscript><p>JavaScript is needed to prepare the request message. Please use the email or phone links above to request a stay.</p></noscript>
  </form>;
}
