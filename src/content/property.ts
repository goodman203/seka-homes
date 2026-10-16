export const property = {
  name: "Seka Homes",
  location: "Guzape, Abuja, Nigeria",
  description: "Experience modern luxury and privacy at Seka Homes, a stunning four-bedroom smart home in Guzape, Abuja. Set in a spacious private compound with its own swimming pool, it’s designed for comfort and convenience—an ideal retreat for families in one of Abuja’s prestigious neighborhoods.",
  // Add only owner-verified facts. Null values are shown as development placeholders.
  guests: 9 as number | null,
  bedrooms: 4 as number | null,
  bathrooms: 4.5 as number | null,
  amenities: [
    "Private swimming pool",
    "Fully automated smart-home technology",
    "Fully equipped modern kitchen",
    "Games lounge",
    "High-speed Wi-Fi",
    "Netflix and DStv",
    "24/7 security",
    "24-hour power supply",
  ] as string[],
  // Owner-supplied photos. First is the hero; the remainder are in gallery order.
  // Paths are public web URLs; alt text describes the image, not verified amenities.
  photos: [
    { src: "/images/property/sittingroom1.jpg", alt: "Seka Homes sitting room with a green sofa, accent chair and dining table in the background" },
    { src: "/images/property/bedroom1.jpg", alt: "Bedroom view with white bedding and grey curtains" },
    { src: "/images/property/dinningarea.jpg", alt: "Dining table and chairs with the kitchen in the background" },
    { src: "/images/property/relaxationarea.jpg", alt: "Two wooden chairs beside a round table with a chessboard" },
    { src: "/images/property/bedroom2.jpg", alt: "Bedroom view with an upholstered bed and armchair" },
    { src: "/images/property/sittingroom2.jpg", alt: "Another sitting-room angle showing the sofa and turquoise accent chair" },
    { src: "/images/property/sittingroom3.jpg", alt: "Sitting room viewed toward the television and dining table" },
    { src: "/images/property/pooltable.jpg", alt: "Green pool table with a blue table-tennis table behind it" },
    { src: "/images/property/bedroomdown.jpg", alt: "Seating corner with a green chair and striped rug" },
  ] as { src: string; alt: string }[],
  nightlyRate: 450000 as number | null,
  minimumStay: 1,
  contact: {
    address: "Citiscape Villa Estate, Guzape District, Abuja",
    email: "info@sekahomes.com",
    phone: "+234 805 997 3415",
  },
  checkIn: "from 3:00 PM",
  checkOut: "by 1:00 PM",
  arrivalPolicy: "Earlier check-in or later check-out can be requested in advance, subject to availability and host approval. Any applicable fee must be confirmed with you before an earlier check-in or later check-out is agreed.",
  houseRules: [
    "The reservation is for the registered guests. Ask the host before inviting visitors.",
    "No parties or events.",
    "Keep noise at a considerate level, especially at night, and respect the neighbors.",
    "No smoking inside the property.",
    "Ask the host before bringing pets.",
    "Children must be supervised by an adult around the swimming pool. Do not bring glassware into the pool area.",
    "Treat the home, furnishings, and smart-home equipment with care. Report damage or maintenance issues to the host promptly.",
    "Follow the security and access instructions provided by the host, and don’t share access codes.",
    "Before leaving, place rubbish in the designated bins and leave the property reasonably tidy.",
  ] as string[],
  cancellationPolicy: {
    timingNote: "All cutoffs are measured before the scheduled 3:00 PM check-in time in Africa/Lagos (Abuja local time). The 7-day and 72-hour cutoffs are Seka Homes’ policy choices, not legal requirements.",
    terms: [
      "A booking request is not confirmed until Seka Homes accepts it. No cancellation charge applies while a request is pending.",
      "Cancel at least 7 days before the 3:00 PM check-in time: full refund of the accommodation amount paid.",
      "Cancel from 72 hours up to less than 7 days before check-in: 50% refund of the accommodation amount paid.",
      "Cancel less than 72 hours before check-in, or don’t arrive: Seka Homes may retain a reasonable amount for nights that cannot be rebooked. If dates are rebooked, refund the amount recovered for those nights, less reasonable costs.",
      "Don’t charge a cancellation fee where applicable law prohibits it, including certain cases where death or hospitalisation prevents the person the booking was made for from staying.",
      "If Seka Homes cancels, give the guest a full refund of accommodation payments.",
      "Initiate refunds due within 5 business days to the original payment method; note that the payment provider or bank may take longer.",
      "Transport is separate, with its cancellation terms disclosed before the guest confirms transport.",
    ],
  },
};

// Keep display details above as the single source for all contact destinations.
export const contactLinks = {
  email: `mailto:${property.contact.email}`,
  phone: `tel:${property.contact.phone.replace(/[^+\d]/g, "")}`,
  whatsapp: `https://wa.me/${property.contact.phone.replace(/\D/g, "")}`,
};

export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
}
