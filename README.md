# Seka Homes

Mobile-first Next.js App Router + TypeScript website for one short-term rental in Guzape, Abuja. Uses React, CSS and Next Image; no stock/generated property photos, payment integration or fabricated availability.

## Run locally

Use Node.js 20.9 or newer and npm:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Production: `npm start` after building.

Optional browser smoke check: while `npm start` is running, run `node scripts/verify-preview.cjs [path-to-playwright]` using an existing Playwright installation and Microsoft Edge. It checks 320px/375px/1440px layouts, date validation, transport review and API error responses. Screenshots go in ignored `reports/`.

Gallery checks: `node scripts/verify-gallery.cjs [path-to-playwright]` verifies modal focus, keyboard navigation, mobile swipe, zoom and landscape layout. Every property photo opens the same full-screen native dialog. Previous/next and arrow keys wrap through all photos, Escape closes it, and focus returns to the photo that opened it. Zoom doubles the image canvas for scroll/pan exploration; navigation resets zoom. Images use `object-fit: contain` to preserve aspect ratio. Swipe navigation is disabled while zoomed, and browser pinch zoom remains available. The gallery uses React and native browser controls without an additional dependency.

Dependency audit at implementation: production dependencies have zero advisories. The full development audit reports five high-severity entries from one unpatched `braces` advisory through Next.js ESLint's glob dependency chain. No guest-controlled patterns are passed to the lint tools. Recheck for an upstream patch before launch; do not downgrade Next.js just to suppress this development-tool report.

## Owner content

Edit `src/content/property.ts`. Null/empty facts remain visibly labeled as awaiting owner information, and amenities stay hidden until supplied. Owner photos are copied into root-level `public/images/property`; configuration uses web paths such as `/images/property/sittingroom1.jpg`, never Windows filesystem paths. Photo order is hero, then three featured gallery images, then the remaining photos under “More property photos.” The current hero is `sittingroom1.jpg`; gallery order is `bedroom1.jpg`, `dinningarea.jpg`, `relaxationarea.jpg`, `bedroom2.jpg`, `sittingroom2.jpg`, `sittingroom3.jpg`, `pooltable.jpg`, `bedroomdown.jpg`. The last photo shows a seating corner despite its filename. Alt text describes visible content only and does not establish amenities, room counts or guest capacity. The site uses next/image for supplied photos. Supply capacity, bedrooms, bathrooms, bed types, accessibility, amenities, prices/charges, contact details, address, map pin, check-in/out, minimum stay, house rules and cancellation terms before launch. Prices use NGN; dates use Africa/Lagos.

## Booking requests

The public form validates guest information, dates, the nine-guest maximum and optional transport details before opening a pre-filled message in the chosen WhatsApp or email app. Destinations derive from `property.contact`: `https://wa.me/2348143800477` and `mailto:info@sekahomes.com`. Shared message construction is in `src/lib/request-message.ts`; WhatsApp text and email subject/body are URL-encoded.

Guests must review and tap Send in their chosen app to share their details with Seka Homes. Opening the chosen app never means sent, saved, received or confirmed. No accommodation dates are reserved and no payment is taken. The form retains a request preview and repeatable WhatsApp and pre-filled email links if popups are blocked, plus direct email and phone alternatives. There is no localStorage or automatic submission to the request API; request details exist only in page state and the pre-filled message URLs. No guest data is logged by the application.

Transport details request a separate quote from Seka Homes only. Partner availability and a separate fee need agreement before commitment; transport partner sharing requires separate consent. No partner integration or payment/refund processing is included.

The optional server request adapter and `/api/booking-requests` remain available for future owner-selected persistent integration, but the public form does not call them and does not need booking service credentials. Keep service variables blank until that integration is explicitly selected and configured. Do not wire a transport partner endpoint into this service. A future backend must durably persist requests and atomically deduplicate `Idempotency-Key` before acknowledging `{ "requestId": "service-generated-id", "status": "pending" }` (1–100 letters/numbers/underscores/hyphens). Acknowledgement is pending only, never reservation confirmation. Configure abuse controls, retention, access restrictions and owner notifications before enabling such a service.

Booking and transport dates use Africa/Lagos. The full cancellation policy appears before both submission buttons and under stay details. The 7-day and 72-hour cancellation cutoffs are owner policy choices, not statutory requirements.

## Vercel

Import the repository as a Next.js project; use the default `npm run build` build command. The app uses Vercel-compatible Node route handlers; no local filesystem persistence. Set `NEXT_PUBLIC_SITE_URL` to the approved HTTPS origin for canonical metadata. Keep booking variables blank until the owner-selected backend is tested. No hosting deployment or domain connection is performed by this project.

Before public launch, replace placeholders, add owner-approved guest privacy/retention information and policies, verify both message handoffs and approved contact channels, and verify the selected provider end to end. Preview builds intentionally disclose missing facts and service configuration.
