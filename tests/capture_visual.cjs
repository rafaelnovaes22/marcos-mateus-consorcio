const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/opt/data/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const viewports = [
    { name: 'mobile', width: 360, height: 800 },
    { name: 'desktop', width: 1440, height: 1000 }
  ];
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto('http://127.0.0.1:8081/', { waitUntil: 'networkidle' });
    await page.locator('#sobre').scrollIntoViewIfNeeded();
    await page.locator('.about-photo img').evaluate((img) => img.decode());
    await page.addStyleTag({ content: '.reveal{opacity:1!important;transform:none!important;transition:none!important}.site-header{position:static!important}.skip-link{display:none!important}html{scroll-behavior:auto!important}' });
    await page.evaluate(() => {
      document.querySelectorAll('.counter').forEach((element) => {
        element.textContent = Number(element.dataset.target).toLocaleString('pt-BR');
      });
      document.querySelector('[data-carousel]').scrollLeft = 0;
      document.querySelector('.carousel-count').textContent = '01 / 08';
      document.querySelector('[data-carousel-progress]').style.width = '12.5%';
      if (document.activeElement) document.activeElement.blur();
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(100);
    await page.screenshot({ path: `/tmp/marcos-redesign-final-${viewport.name}.png`, fullPage: true });
    process.stdout.write(`${viewport.name}: captured\n`);
    await page.close();
  }
  await browser.close();
})().catch((error) => {
  process.stderr.write(`${error.stack}\n`);
  process.exit(1);
});
