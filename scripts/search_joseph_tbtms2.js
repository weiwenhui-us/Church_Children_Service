const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = String.raw`C:\Users\wenhui.wei\OneDrive - Regeneron Pharmaceuticals, Inc\Pictures\Screenshots`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  async function screenshot(name) {
    const fp = path.join(SCREENSHOT_DIR, `tbtms_video_${name}.png`);
    await page.screenshot({ path: fp, fullPage: false });
    console.log(`[SCREENSHOT] ${fp}`);
  }

  // Full page screenshot of YouTube channel Joseph search
  console.log('=== YouTube channel - full page Joseph search ===');
  await page.goto('https://www.youtube.com/@thebibletellsmeso/search?query=joseph', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Scroll down to load all results
  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(1500);
  }

  // Take full page screenshot
  const fp = path.join(SCREENSHOT_DIR, `tbtms_video_youtube_joseph_fullpage.png`);
  await page.screenshot({ path: fp, fullPage: true });
  console.log(`[SCREENSHOT] ${fp}`);

  // Extract ALL video titles and URLs
  const allVideos = await page.$$eval('a#video-title', els => els.map(e => ({
    title: (e.textContent || '').trim(),
    href: e.href
  })).filter(e => e.title));

  console.log(`\nAll ${allVideos.length} Joseph-related videos on TBTMS YouTube channel:`);
  allVideos.forEach((v, i) => {
    console.log(`${i + 1}. "${v.title}" => ${v.href}`);
  });

  // Now check the specific videos most relevant to Genesis 37 (Joseph sold by brothers)
  console.log('\n=== Most relevant for Genesis 37 (Joseph sold by brothers / Joseph in Egypt) ===');
  const relevant = allVideos.filter(v =>
    /dreamer|slave|sold|brother|coat|color|egypt|pharaoh|prison|pit/i.test(v.title)
  );
  relevant.forEach((v, i) => {
    console.log(`** "${v.title}" => ${v.href}`);
  });

  // Visit "Joseph the Dreamer" to get details (this is Genesis 37)
  console.log('\n=== Checking "Joseph the Dreamer" video page ===');
  try {
    await page.goto('https://www.youtube.com/watch?v=IaQNsfhvMgw', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    await screenshot('yt_joseph_dreamer');

    // Get description
    const expandBtn = await page.$('#expand, tp-yt-paper-button#expand, [aria-label="Show more"]');
    if (expandBtn) {
      await expandBtn.click();
      await page.waitForTimeout(1000);
    }

    const desc = await page.$eval('#description-inline-expander, #description', e => e.textContent.trim().substring(0, 500)).catch(() => 'N/A');
    console.log('Description:', desc);
  } catch (e) {
    console.log('Error:', e.message);
  }

  // Visit "Joseph the Slave" to get details (this is Genesis 37 - sold into slavery)
  console.log('\n=== Checking "Joseph the Slave" video page ===');
  try {
    await page.goto('https://www.youtube.com/watch?v=zFxTY_l9xCw', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    await screenshot('yt_joseph_slave');

    const desc = await page.$eval('#description-inline-expander, #description', e => e.textContent.trim().substring(0, 500)).catch(() => 'N/A');
    console.log('Description:', desc);
  } catch (e) {
    console.log('Error:', e.message);
  }

  await browser.close();
})();
