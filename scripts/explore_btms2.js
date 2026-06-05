const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS = 'C:\\Users\\wenhui.wei\\OneDrive - Regeneron Pharmaceuticals, Inc\\Pictures\\Screenshots';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // Helper: navigate with domcontentloaded (faster than networkidle for Wix sites)
  async function nav(url) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000); // let dynamic content load
  }

  async function shot(name) {
    await page.screenshot({ path: path.join(SCREENSHOTS, `btms_${name}.png`), fullPage: false });
    console.log(`Screenshot: btms_${name}.png`);
  }

  // Step 1: Go to login page directly
  console.log('=== Step 1: Navigate to Staff Login ===');
  await nav('https://www.thebibletellsmeso.com/account/staff-welcome');
  await shot('10_staff_login_page');

  // Check current page content
  const pageText = await page.$eval('body', el => el.innerText.substring(0, 2000));
  console.log('Page text preview:', pageText.substring(0, 500));

  // Look for login link/button on this page
  const loginBtn = await page.$('a:has-text("Log In"), button:has-text("Log In"), a:has-text("Staff Login")');
  if (loginBtn) {
    const loginText = await loginBtn.textContent();
    console.log(`Found login element: "${loginText.trim()}"`);
    await loginBtn.click();
    await page.waitForTimeout(3000);
    await shot('11_after_login_btn');
  }

  // Now try the main Log In button in top nav
  console.log('\n=== Step 2: Try Log In from top right ===');
  await nav('https://www.thebibletellsmeso.com/');
  await page.waitForTimeout(2000);

  // Click the Log In button in the header
  const topLoginBtn = await page.$('[data-testid="loginButton"], a:has-text("Log In"):not(nav a)');
  if (topLoginBtn) {
    console.log('Found top Log In button');
    await topLoginBtn.click();
    await page.waitForTimeout(3000);
    await shot('12_login_modal');
  } else {
    // Try xpath for the Log In text near the person icon
    const allLogIn = await page.$$('text=Log In');
    console.log(`Found ${allLogIn.length} "Log In" elements`);
    if (allLogIn.length > 0) {
      await allLogIn[allLogIn.length - 1].click(); // last one is usually the header one
      await page.waitForTimeout(3000);
      await shot('12_login_modal');
    }
  }

  // Now look for the login form - might be in lightbox/dialog
  console.log('\n=== Step 3: Fill login form ===');

  // Check all frames for login form
  let loginFrame = null;
  for (const frame of page.frames()) {
    const emailEl = await frame.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    if (emailEl) {
      loginFrame = frame;
      console.log('Found email input in frame:', frame.url().substring(0, 80));
      break;
    }
  }

  if (!loginFrame) {
    // Maybe it's a dialog
    const dialog = await page.$('[role="dialog"], .lightbox, [class*="modal"]');
    if (dialog) {
      console.log('Found dialog element');
    }
    // Try main page
    loginFrame = page;
  }

  const emailInput = await loginFrame.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
  if (emailInput) {
    console.log('Filling email...');
    await emailInput.click();
    await emailInput.fill('churchinbaskingridge@gmail.com');

    const pwInput = await loginFrame.$('input[type="password"], input[name="password"]');
    if (pwInput) {
      console.log('Filling password...');
      await pwInput.click();
      await pwInput.fill('r&vkKDVDqlY5Xp');
      await shot('13_creds_filled');

      // Find and click submit
      const submitBtn = await loginFrame.$('button[type="submit"], button:has-text("Log In")');
      if (submitBtn) {
        console.log('Clicking submit...');
        await submitBtn.click();

        // Wait for navigation/login to complete
        await page.waitForTimeout(8000);
        console.log('Current URL after login:', page.url());
        await shot('14_post_login');
      }
    }
  } else {
    console.log('No email input found, trying direct Wix login URL...');
    // Try the Wix Members login approach
    await nav('https://www.thebibletellsmeso.com/account/login');
    await page.waitForTimeout(3000);
    await shot('12b_account_login');

    const emailEl2 = await page.$('input[type="email"]');
    if (emailEl2) {
      await emailEl2.fill('churchinbaskingridge@gmail.com');
      const pwEl2 = await page.$('input[type="password"]');
      if (pwEl2) {
        await pwEl2.fill('r&vkKDVDqlY5Xp');
        const btn = await page.$('button[type="submit"], button:has-text("Log In")');
        if (btn) {
          await btn.click();
          await page.waitForTimeout(8000);
          await shot('14_post_login');
        }
      }
    }
  }

  // Check if logged in by looking for account indicators
  console.log('\n=== Step 4: Verify login ===');
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);

  // Check for user-related elements
  const accountLinks = await page.$$eval('a', els =>
    els.filter(e => {
      const href = e.href.toLowerCase();
      const text = e.textContent.toLowerCase();
      return href.includes('account') || href.includes('logout') ||
             text.includes('account') || text.includes('log out') || text.includes('my ');
    }).map(e => ({ text: e.textContent.trim().substring(0, 50), href: e.href }))
  );
  console.log('Account-related links:', JSON.stringify(accountLinks, null, 2));

  // Step 5: Explore Audio Streaming pages
  console.log('\n=== Step 5: Explore Audio Streaming (All Songs) ===');
  await nav('https://www.thebibletellsmeso.com/allsongs');
  await page.waitForTimeout(3000);
  await shot('20_allsongs');

  let bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('AllSongs page text:', bodyText.substring(0, 800));

  // Look for song listings
  const songElements = await page.$$eval('[class*="audio"], [class*="song"], [class*="track"], [class*="playlist"]',
    els => els.slice(0, 5).map(e => ({ tag: e.tagName, class: e.className.substring(0, 60), text: e.textContent.trim().substring(0, 100) }))
  );
  console.log('Song elements:', JSON.stringify(songElements, null, 2));

  // Step 6: Try audio search page
  console.log('\n=== Step 6: Audio Search ===');
  await nav('https://www.thebibletellsmeso.com/all-audio');
  await page.waitForTimeout(4000);
  await shot('21_all_audio');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('All Audio page text:', bodyText.substring(0, 800));

  // Check for search input
  const searchInputs = await page.$$('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search"]');
  console.log(`Search inputs found: ${searchInputs.length}`);

  // Try all inputs
  const allInputs = await page.$$eval('input', els => els.map(e => ({
    type: e.type, name: e.name, placeholder: e.placeholder, class: e.className.substring(0, 60), id: e.id
  })));
  console.log('All inputs:', JSON.stringify(allInputs, null, 2));

  // Step 7: BSS Lyrics videos
  console.log('\n=== Step 7: BSS Lyrics ===');
  await nav('https://www.thebibletellsmeso.com/bss-lyrics-videos');
  await page.waitForTimeout(3000);
  await shot('22_bss_lyrics');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('BSS Lyrics page text:', bodyText.substring(0, 800));

  // Step 8: Song Videos
  console.log('\n=== Step 8: Song Videos ===');
  await nav('https://www.thebibletellsmeso.com/song-videos');
  await page.waitForTimeout(3000);
  await shot('23_song_videos');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('Song Videos page text:', bodyText.substring(0, 800));

  // Step 9: Simple Bible Songs
  console.log('\n=== Step 9: Simple Bible Songs ===');
  await nav('https://www.thebibletellsmeso.com/simple-bible-songs');
  await page.waitForTimeout(3000);
  await shot('24_simple_bible_songs');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('Simple Bible Songs page text:', bodyText.substring(0, 800));

  // Step 10: Categories management (staff page found earlier)
  console.log('\n=== Step 10: Staff - Categories Management ===');
  await nav('https://www.thebibletellsmeso.com/account/categories-management');
  await page.waitForTimeout(3000);
  await shot('25_categories_mgmt');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('Categories Management text:', bodyText.substring(0, 800));

  // Step 11: Album management
  console.log('\n=== Step 11: Staff - Album Management ===');
  await nav('https://www.thebibletellsmeso.com/account/album-management');
  await page.waitForTimeout(3000);
  await shot('26_album_mgmt');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('Album Management text:', bodyText.substring(0, 800));

  // Step 12: Audio management
  console.log('\n=== Step 12: Staff - Audio Management ===');
  await nav('https://www.thebibletellsmeso.com/account/audio-management');
  await page.waitForTimeout(3000);
  await shot('27_audio_mgmt');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('Audio Management text:', bodyText.substring(0, 800));

  // Step 13: Free Songs (Joyful Songs)
  console.log('\n=== Step 13: Joyful Songs (Free) ===');
  await nav('https://www.thebibletellsmeso.com/streaming-audio/free-songs');
  await page.waitForTimeout(3000);
  await shot('28_free_songs');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('Free Songs text:', bodyText.substring(0, 800));

  // Step 14: My TBTMS / Account page
  console.log('\n=== Step 14: My Account ===');
  await nav('https://www.thebibletellsmeso.com/account/my-account');
  await page.waitForTimeout(3000);
  await shot('29_my_account');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('My Account text:', bodyText.substring(0, 800));

  // Step 15: My Audio Playlists
  console.log('\n=== Step 15: My Audio Playlists ===');
  await nav('https://www.thebibletellsmeso.com/account/my-audio-playlists');
  await page.waitForTimeout(3000);
  await shot('30_audio_playlists');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('Audio Playlists text:', bodyText.substring(0, 800));

  // Step 16: Full page scroll screenshots of key pages
  console.log('\n=== Step 16: Full page screenshot of allsongs ===');
  await nav('https://www.thebibletellsmeso.com/allsongs');
  await page.waitForTimeout(4000);
  // Scroll down to load lazy content
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS, 'btms_31_allsongs_full.png'), fullPage: true });
  console.log('Full page screenshot of allsongs taken');

  await browser.close();
  console.log('\n=== Done! ===');
})();
