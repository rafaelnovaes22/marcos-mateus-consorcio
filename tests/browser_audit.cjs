const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/opt/data/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
    args: ['--no-sandbox']
  });
  const viewports = [
    { name: 'mobile-360', width: 360, height: 800 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'desktop-1280', width: 1280, height: 900 }
  ];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://127.0.0.1:8081/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(250);

    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      h1: document.querySelectorAll('h1').length,
      cards: document.querySelectorAll('.plan-card').length,
      waLinks: document.querySelectorAll('a[href^="https://wa.me/5511922247346"]').length,
      smallTargets: [...document.querySelectorAll('a,button,summary')]
        .filter((el) => {
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 && (rect.height < 44 || rect.width < 44);
        })
        .map((el) => `${el.tagName}:${el.textContent.trim().slice(0, 30)}:${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`)
    }));

    assert.equal(layout.scrollWidth, layout.clientWidth, `${viewport.name}: overflow horizontal`);
    assert.equal(layout.h1, 1, `${viewport.name}: precisa de um H1`);
    assert.equal(layout.cards, 8, `${viewport.name}: precisa de 8 cartas`);
    assert.equal(layout.waLinks, 15, `${viewport.name}: CTAs WhatsApp`);
    assert.deepEqual(layout.smallTargets, [], `${viewport.name}: tap targets pequenos: ${layout.smallTargets.join(', ')}`);
    assert.deepEqual(errors, [], `${viewport.name}: erros no console: ${errors.join(', ')}`);

    const photo = await page.locator('.hero-visual img').evaluate((img) => ({
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      objectFit: getComputedStyle(img).objectFit,
      filter: getComputedStyle(img).filter
    }));
    assert.deepEqual(photo, { naturalWidth: 1086, naturalHeight: 1259, objectFit: 'contain', filter: 'none' });

    await page.locator('#sobre').scrollIntoViewIfNeeded();
    const aboutPhoto = await page.locator('.about-photo img').evaluate(async (img) => {
      await img.decode();
      return { naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, filter: getComputedStyle(img).filter };
    });
    assert.deepEqual(aboutPhoto, { naturalWidth: 960, naturalHeight: 1280, filter: 'none' });

    if (viewport.width <= 760) {
      const toggle = page.locator('.menu-toggle');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      assert.equal(await page.locator('.main-nav').evaluate((el) => getComputedStyle(el).display), 'grid');
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    }

    await page.locator('[data-filter="investimento"]').click();
    assert.equal(await page.locator('.plan-card:visible').count(), 2, `${viewport.name}: filtro investimento`);
    assert.equal((await page.locator('.carousel-count').textContent()).trim(), '01 / 02');
    await page.locator('[data-filter="todos"]').click();

    const track = page.locator('[data-carousel]');
    await track.evaluate((el) => { el.scrollLeft = el.scrollWidth; el.dispatchEvent(new Event('scroll')); });
    await page.waitForTimeout(100);
    assert.notEqual((await page.locator('.carousel-count').textContent()).trim(), '01 / 08');

    const firstFaq = page.locator('.faq details').first();
    await firstFaq.locator('summary').click();
    assert.equal(await firstFaq.getAttribute('open'), '');

    await page.screenshot({ path: `/tmp/marcos-redesign-${viewport.name}.png`, fullPage: true });
    await page.close();
    process.stdout.write(`${viewport.name}: OK\n`);
  }

  await browser.close();
})().catch((error) => {
  process.stderr.write(`${error.stack}\n`);
  process.exit(1);
});
