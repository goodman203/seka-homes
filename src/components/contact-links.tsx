import { contactLinks, property } from "@/content/property";

export function ContactLinks() {
  return <div className="contact-links">
    <a className="button" href={contactLinks.whatsapp}>WhatsApp for bookings <span aria-hidden="true">↗</span></a>
    <a href={contactLinks.phone} aria-label={`Call Seka Homes on ${property.contact.phone}`}>Call {property.contact.phone}</a>
    <a href={contactLinks.email} aria-label={`Email Seka Homes at ${property.contact.email}`}>{property.contact.email}</a>
  </div>;
}
