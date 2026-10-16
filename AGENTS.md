# Seka Homes — Project Instructions

## Project

Build a simple, polished website for **Seka Homes**, a short-term rental property in **Guzape, Abuja, Nigeria**. The site should help prospective guests understand the property, check dates, and make a reservation from their phone. Guests should also be able to request transport to or from the property as an optional paid service arranged through transport partners.

## Product goals

- Make the property and its key details easy to understand at a glance.
- Make checking dates and starting a booking the clearest actions on the page.
- Make the entire experience work well on small mobile screens first, then scale up for tablets and desktops.
- Present optional transport clearly, with its fee and availability treated separately from the accommodation unless the owner later chooses a combined quote.
- Build for deployment on Vercel.

## Visual and content direction

- Use a clean, welcoming hospitality style: strong property photography, readable type, generous spacing, and a restrained color palette.
- Keep the page focused on this one property. Avoid generic hotel-directory features or unnecessary complexity.
- Use real property photos supplied by the owner. Until they are available, use clearly identified image placeholders; never present generated or stock imagery as a photo of the actual house.
- Keep editable property copy and factual details in one easy-to-update content/configuration source where practical.
- Use English for the initial site. Format any prices in Nigerian naira (NGN) once the owner supplies them.

## Main page content

Plan for these sections, adapting the order to the design:

1. Hero image, a concise description, Guzape/Abuja location, and a prominent “Check availability” or booking action.
2. Photo gallery.
3. Property highlights and verified amenities.
4. Guest capacity, bedrooms, bathrooms, and other practical facts once provided.
5. Booking dates, guest count, and the reservation flow.
6. Optional transport request, clearly marked as an additional-fee service arranged with a partner.
7. Location information, house rules, check-in/check-out details, cancellation terms, and FAQs once provided.
8. Contact details and a clear footer.

Do not show empty sections or publish placeholder copy as if it were a real property fact.

## Booking and transport behavior

- Treat reservations as real transactions: validate dates and guest information, prevent invalid date ranges, and use a persistent server-side booking or reservation service when one has been selected and configured.
- Never show “booking confirmed” unless the reservation was actually accepted and saved by the configured service.
- If no booking backend or provider credentials are available, implement a clearly labeled **booking request** flow and state that the request is awaiting confirmation. Do not simulate availability, store bookings only in browser memory, or imply that a request is a confirmed reservation.
- Do not add payment collection until the owner chooses a payment provider and supplies the required policies and account configuration. Never store card details in the application.
- Let guests request optional pickup/drop-off with relevant trip details. Explain that transport is subject to partner availability and that its additional fee must be shown or confirmed before the guest commits.
- Share guest details with a transport partner only with the guest’s clear consent and through an appropriate integration.
- Use the `Africa/Lagos` timezone for booking dates and times. Avoid date-only timezone shifts.

## Facts that must come from the owner

Do not invent or imply any of the following. Use neutral placeholders during development and ask for the missing facts when they are needed:

- Nightly rates, cleaning fees, taxes, deposits, transport prices, or other charges.
- Exact property address, map pin, directions, or claims about nearby places.
- Number of bedrooms/bathrooms, guest capacity, bed types, amenities, accessibility, or property features.
- Property photos, check-in/check-out times, minimum stay, availability, house rules, cancellation/refund policy, or booking conditions.
- Contact phone/WhatsApp/email, transport partner names, service coverage, or partner availability.
- Guest reviews, ratings, awards, security claims, or other endorsements.

## Technical direction

- Unless the existing project establishes another stack, use **Next.js with the App Router and TypeScript**, keeping the implementation compatible with Vercel.
- Use semantic HTML, accessible labels and focus states, keyboard-friendly controls, and sufficient color contrast.
- Optimize property images and avoid unnecessary client-side JavaScript. Prevent horizontal scrolling and make primary controls comfortable to tap on mobile.
- Validate user input on both client and server. Keep API keys and credentials in environment variables; provide an `.env.example` with names and descriptions only, never real secrets.
- Keep third-party booking, payment, email, and transport integrations behind clear service boundaries so they can be configured without rewriting the page.
- Add useful page metadata and local search details for Seka Homes in Guzape, Abuja, without making unsupported claims.

## Working conventions

- Inspect the existing project before changing files and preserve any established conventions.
- Prefer small, reusable components and clear types over a monolithic page.
- Do not add dependencies or external services unless they are needed and explained.
- Run the available lint, type-check, and build commands after implementation; report any checks that could not be run.
- Keep the site Vercel-ready, but do not publish it or connect a live domain unless the owner asks.
