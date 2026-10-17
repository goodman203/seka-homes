// Run against `npm start`: node scripts/verify-preview.cjs [path-to-playwright]
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS browser verification script. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.argv[2] || 'playwright');

(async () => {
  fs.mkdirSync('reports', { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage();
    // Capture the handoff without opening WhatsApp or disclosing test data externally.
    await page.addInitScript(() => {
      window.whatsappOpens = [];
      window.open = (url, target, features) => { window.whatsappOpens.push({ url, target, features }); return null; };
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [name, width, height] of [['mobile', 375, 812], ['small-mobile', 320, 740], ['desktop', 1440, 1000]]) {
      await page.setViewportSize({ width, height });
      await page.goto('http://127.0.0.1:3000');
      await page.screenshot({ path: `reports/${name}.png`, fullPage: true });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${name}: no horizontal overflow`);
    }
    const policy = page.locator('#booking-cancellation-policy');
    assert.equal(await policy.isVisible(), true);
    assert.equal(await policy.locator('li').count(), 8);
    assert.match(await policy.innerText(), /Africa\/Lagos/);
    assert.match(await policy.innerText(), /policy choices, not legal requirements/);
    assert.match(await policy.innerText(), /No cancellation charge applies while a request is pending/);
    assert.match(await policy.innerText(), /50% refund of the accommodation amount paid/);
    assert.match(await policy.innerText(), /5 business days to the original payment method/);
    assert.equal(await page.evaluate(() => !!(document.querySelector('#booking-cancellation-policy').compareDocumentPosition(document.querySelector('.review-button')) & Node.DOCUMENT_POSITION_FOLLOWING)), true);
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const future = new Date(`${today}T12:00:00Z`);
    future.setUTCDate(future.getUTCDate() + 2);
    const arrival = future.toISOString().slice(0, 10);
    future.setUTCDate(future.getUTCDate() + 2);
    const departure = future.toISOString().slice(0, 10);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByLabel('Arrival', { exact: false }).fill(arrival);
    await page.locator('input[name="checkOut"]').fill(arrival);
    await page.getByLabel('Number of guests').fill('2');
    await page.getByLabel('Full name').fill('Preview Guest');
    await page.getByRole('textbox', { name: /^Email/ }).fill('preview@example.com');
    await page.getByLabel('I understand that my details').check();
    await page.getByRole('button', { name: 'Send by email' }).click();
    await page.getByText('Departure must be after arrival.').waitFor();
    assert.equal(await page.evaluate(() => window.whatsappOpens.length), 0);
    await page.getByRole('button', { name: 'Continue with WhatsApp' }).click();
    assert.equal(await page.evaluate(() => window.whatsappOpens.length), 0);
    await page.locator('input[name="checkOut"]').fill(departure);
    await page.getByLabel('I’d like a separate transport quote').check();
    await page.getByLabel('Which journey?').selectOption('both');
    await page.getByLabel('Pickup point').fill('Guest supplied point');
    await page.getByLabel('Pickup date & time').fill(`${arrival}T15:00`);
    await page.getByLabel('Drop-off destination').fill('Guest supplied destination');
    await page.getByLabel('Departure date & time').fill(`${departure}T09:00`);
    await page.getByRole('button', { name: 'Continue with WhatsApp' }).click();
    await page.getByText('REVIEW AND SEND IN YOUR CHOSEN APP', { exact: true }).waitFor();
    const handoffs = await page.evaluate(() => window.whatsappOpens);
    assert.equal(handoffs.length, 1);
    assert.equal(handoffs[0].target, '_blank');
    assert.equal(handoffs[0].features, 'noopener,noreferrer');
    const whatsapp = new URL(handoffs[0].url);
    assert.equal(whatsapp.origin + whatsapp.pathname, 'https://wa.me/2348143800477');
    const message = whatsapp.searchParams.get('text');
    for (const value of ['Preview Guest', 'preview@example.com', arrival, departure, 'Guests: 2', 'Guest supplied point', 'Guest supplied destination', 'Africa/Lagos', 'not confirmed']) assert.ok(message.includes(value));
    assert.equal(await page.getByRole('link', { name: 'Open WhatsApp with these details' }).getAttribute('href'), handoffs[0].url);
    await page.getByRole('button', { name: 'Send by email', exact: true }).click();
    const bothHandoffs = await page.evaluate(() => window.whatsappOpens);
    assert.equal(bothHandoffs.length, 2);
    const email = new URL(bothHandoffs[1].url);
    assert.equal(email.protocol, 'mailto:');
    assert.equal(email.pathname, 'info@sekahomes.com');
    assert.equal(email.searchParams.get('subject'), `Seka Homes booking request: ${arrival} to ${departure}`);
    assert.equal(email.searchParams.get('body'), message);
    assert.equal(await page.getByRole('link', { name: 'Open email with these details' }).getAttribute('href'), bothHandoffs[1].url);
    assert.equal(await page.locator('form a[href="mailto:info@sekahomes.com"]').count(), 1);
    assert.equal(await page.locator('form a[href="tel:+2348143800477"]').count(), 1);
    assert.equal(await page.getByRole('button', { name: 'Send booking request' }).count(), 0);
    await page.screenshot({ path: 'reports/request-review.png', fullPage: true });
    const valid = { checkIn: arrival, checkOut: departure, guests: 2, name: 'Preview Guest', email: 'preview@example.com', phone: '', notes: '', transport: null, consent: true };
    const response = await page.request.post('http://127.0.0.1:3000/api/booking-requests', { data: valid });
    assert.equal(response.status(), 503);
    assert.match((await response.json()).message, /not been sent or saved/);
    const invalid = await page.request.post('http://127.0.0.1:3000/api/booking-requests', { data: { ...valid, checkOut: arrival } });
    assert.equal(invalid.status(), 422);
    const foreign = await page.request.post('http://127.0.0.1:3000/api/booking-requests', { headers: { Origin: 'https://unrelated.example' }, data: valid });
    assert.equal(foreign.status(), 403);
    const oversized = await page.request.post('http://127.0.0.1:3000/api/booking-requests', { data: { ...valid, notes: 'a'.repeat(17000) } });
    assert.equal(oversized.status(), 413);
    assert.deepEqual(errors, []);
    console.log('PASS: mobile/desktop layouts; invalid dates block both apps; identical encoded request/transport details in WhatsApp and email; fallbacks and alternatives; API guards; no browser errors. Neither external app contacted.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
