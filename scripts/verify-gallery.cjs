// Run against npm start with an existing Playwright installation.
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS browser verification script. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.argv[2] || 'playwright');

(async () => {
  fs.mkdirSync('reports', { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:3000');
    const hero = page.getByRole('button', { name: /^Open photo 1 of/ });
    await hero.click();
    const dialog = page.getByRole('dialog', { name: 'Seka Homes photos' });
    await dialog.waitFor();
    assert.equal(await dialog.evaluate(el => el.matches(':modal')), true);
    assert.equal(await page.getByRole('button', { name: 'Close photo gallery' }).evaluate(el => el === document.activeElement), true);
    assert.equal(await page.locator('body').evaluate(el => el.style.overflow), 'hidden');
    await page.getByRole('status').filter({ hasText: '1 / 9' }).waitFor();
    await page.keyboard.press('ArrowLeft');
    await page.getByRole('status').filter({ hasText: '9 / 9' }).waitFor();
    await page.keyboard.press('ArrowRight');
    await page.getByRole('status').filter({ hasText: '1 / 9' }).waitFor();
    await page.getByRole('button', { name: 'Next photo' }).click();
    await page.getByRole('status').filter({ hasText: '2 / 9' }).waitFor();
    await page.getByRole('button', { name: 'Previous photo' }).click();
    await page.getByRole('button', { name: 'Zoom in on photo' }).click();
    assert.equal(await page.getByRole('button', { name: 'Zoom out to fit photo' }).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.lightbox-image').evaluate(el => getComputedStyle(el).objectFit), 'contain');
    assert.equal(await page.locator('.lightbox-viewport').evaluate(el => el.scrollWidth > el.clientWidth && el.scrollHeight > el.clientHeight), true);
    await page.locator('.lightbox-viewport').evaluate(el => el.scrollTo(100, 100));
    assert.equal(await page.locator('.lightbox-viewport').evaluate(el => el.scrollLeft > 0 && el.scrollTop > 0), true);
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('.is-zoomed').count(), 0);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true);
    }
    await page.keyboard.press('Escape');
    assert.equal(await dialog.count(), 0);
    assert.equal(await hero.evaluate(el => el === document.activeElement), true);
    assert.equal(await page.locator('body').evaluate(el => el.style.overflow), '');
    await page.locator('.gallery-more summary').click();
    await page.getByRole('button', { name: /^Open photo 9 of/ }).click();
    await page.getByRole('status').filter({ hasText: '9 / 9' }).waitFor();
    await page.getByRole('button', { name: 'Close photo gallery' }).click();
    const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
    const phone = await mobile.newPage();
    await phone.goto('http://127.0.0.1:3000');
    await phone.getByRole('button', { name: /^Open photo 1 of/ }).tap();
    const session = await mobile.newCDPSession(phone);
    async function swipe(start, end) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start, y: 350 }] });
      for (let step = 1; step <= 5; step++) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start + (end - start) * step / 5, y: 350 }] });
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    await swipe(290, 80);
    await phone.getByRole('status').filter({ hasText: '2 / 9' }).waitFor();
    await swipe(80, 290);
    await phone.getByRole('status').filter({ hasText: '1 / 9' }).waitFor();
    await phone.locator('.lightbox-image').evaluate(el => el.decode());
    await phone.screenshot({ path: 'reports/lightbox-mobile.png' });
    await phone.getByRole('button', { name: 'Zoom in on photo' }).tap();
    await phone.getByRole('button', { name: 'Zoom out to fit photo' }).waitFor();
    await swipe(290, 80);
    await phone.getByRole('status').filter({ hasText: '1 / 9' }).waitFor();
    await phone.getByRole('button', { name: 'Close photo gallery' }).tap();
    await phone.setViewportSize({ width: 812, height: 375 });
    await phone.getByRole('button', { name: /^Open photo 1 of/ }).tap();
    assert.equal(await phone.locator('.lightbox').evaluate(el => el.scrollHeight <= el.clientHeight), true);
    await phone.getByRole('button', { name: 'Close photo gallery' }).tap();
    await mobile.close();
    assert.deepEqual(errors, []);
    console.log('PASS: modal focus trap/restore, scroll lock, keyboard/wraparound, all-photo entry, count, zoom/pan/reset, mobile swipe and zoom isolation, landscape fit, no browser errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
