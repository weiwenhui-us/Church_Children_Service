const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS = 'C:\\Users\\wenhui.wei\\OneDrive - Regeneron Pharmaceuticals, Inc\\Pictures\\Screenshots';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  async function nav(url) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
  }

  async function shot(name) {
    await page.screenshot({ path: path.join(SCREENSHOTS, `btms_${name}.png`), fullPage: false });
    console.log(`Screenshot: btms_${name}.png`);
  }

  // Step 1: Go directly to the staff login page and login there (no popup overlay)
  console.log('=== Step 1: Login via staff-welcome page ===');
  await nav('https://www.thebibletellsmeso.com/account/staff-welcome');

  // The staff-welcome page has a login form directly on the page
  const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
  if (emailInput) {
    console.log('Found email input on staff-welcome page');
    await emailInput.fill('churchinbaskingridge@gmail.com');
    const pwInput = await page.$('input[type="password"]');
    if (pwInput) {
      await pwInput.fill('r&vkKDVDqlY5Xp');
      await shot('10_creds_filled');

      // Use force:true and also try dispatchEvent as backup
      const submitBtn = await page.$('button:has-text("Log In"), button[type="submit"]');
      if (submitBtn) {
        console.log('Submitting login form...');
        try {
          await submitBtn.click({ force: true, timeout: 10000 });
        } catch (e) {
          console.log('Force click failed, trying dispatchEvent...');
          await submitBtn.dispatchEvent('click');
        }
        await page.waitForTimeout(8000);
      }
    }
  } else {
    // The page shows a "Log In" link that opens login form inline
    console.log('No email input directly, looking for login link...');
    const loginLink = await page.$('a:has-text("Log In"), button:has-text("Log In")');
    if (loginLink) {
      await loginLink.click({ force: true });
      await page.waitForTimeout(3000);
    }

    // Try again for email field
    const emailInput2 = await page.$('input[type="email"]');
    if (emailInput2) {
      await emailInput2.fill('churchinbaskingridge@gmail.com');
      const pwInput2 = await page.$('input[type="password"]');
      if (pwInput2) {
        await pwInput2.fill('r&vkKDVDqlY5Xp');
        const btn = await page.$('button:has-text("Log In"), button[type="submit"]');
        if (btn) {
          await btn.click({ force: true });
          await page.waitForTimeout(8000);
        }
      }
    }
  }

  console.log('URL after login attempt:', page.url());
  await shot('11_post_login');

  // Check if we see account content or still the login form
  const bodyText1 = await page.$eval('body', el => el.innerText.substring(0, 1500));
  console.log('Post-login body:', bodyText1.substring(0, 500));

  // Check if login worked - look for logout or account-related text
  const hasLogout = bodyText1.toLowerCase().includes('log out') || bodyText1.toLowerCase().includes('logout');
  const hasAccount = bodyText1.toLowerCase().includes('my account') || bodyText1.toLowerCase().includes('welcome');
  console.log(`Login indicators - Logout: ${hasLogout}, Account: ${hasAccount}`);

  // If still not logged in, try the Wix login API approach
  if (!hasLogout && !hasAccount) {
    console.log('Login may not have worked. Trying keyboard submit...');
    // Go back to staff-welcome
    await nav('https://www.thebibletellsmeso.com/account/staff-welcome');
    const emailEl = await page.$('input[type="email"]');
    if (emailEl) {
      await emailEl.fill('churchinbaskingridge@gmail.com');
      const pwEl = await page.$('input[type="password"]');
      if (pwEl) {
        await pwEl.fill('r&vkKDVDqlY5Xp');
        // Press Enter to submit
        await pwEl.press('Enter');
        console.log('Pressed Enter to submit');
        await page.waitForTimeout(8000);
        console.log('URL after Enter:', page.url());
        await shot('12_after_enter_submit');

        const bodyText2 = await page.$eval('body', el => el.innerText.substring(0, 1000));
        console.log('Body after Enter submit:', bodyText2.substring(0, 400));
      }
    }
  }

  // Step 2: Now explore regardless of login status
  console.log('\n=== Step 2: Explore Audio Streaming ===');
  await nav('https://www.thebibletellsmeso.com/allsongs');
  await page.waitForTimeout(3000);
  await shot('20_allsongs');

  let bodyText = await page.$eval('body', el => el.innerText.substring(0, 5000));
  console.log('AllSongs text:', bodyText.substring(0, 1000));

  // Step 3: All Audio (Search)
  console.log('\n=== Step 3: All Audio Search ===');
  await nav('https://www.thebibletellsmeso.com/all-audio');
  await page.waitForTimeout(5000);
  await shot('21_all_audio');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 5000));
  console.log('All Audio text:', bodyText.substring(0, 1000));

  // Look for any search or filter elements
  const inputs = await page.$$eval('input, select', els => els.map(e => ({
    tag: e.tagName, type: e.type, name: e.name, placeholder: e.placeholder,
    class: e.className.substring(0, 60), id: e.id
  })));
  console.log('Form elements:', JSON.stringify(inputs, null, 2));

  // Step 4: Simple Bible Songs
  console.log('\n=== Step 4: Simple Bible Songs ===');
  await nav('https://www.thebibletellsmeso.com/simple-bible-songs');
  await page.waitForTimeout(4000);
  await shot('22_simple_bible_songs');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 5000));
  console.log('Simple Bible Songs text:', bodyText.substring(0, 1000));

  // Step 5: BSS Lyrics videos
  console.log('\n=== Step 5: BSS Lyrics Videos ===');
  await nav('https://www.thebibletellsmeso.com/bss-lyrics-videos');
  await page.waitForTimeout(4000);
  await shot('23_bss_lyrics');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 5000));
  console.log('BSS Lyrics text:', bodyText.substring(0, 1000));

  // Step 6: Song Videos
  console.log('\n=== Step 6: Song Videos ===');
  await nav('https://www.thebibletellsmeso.com/song-videos');
  await page.waitForTimeout(4000);
  await shot('24_song_videos');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 5000));
  console.log('Song Videos text:', bodyText.substring(0, 1000));

  // Step 7: Lullabies
  console.log('\n=== Step 7: Lullabies ===');
  await nav('https://www.thebibletellsmeso.com/streaming-audio/audiolullabies');
  await page.waitForTimeout(3000);
  await shot('25_lullabies');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('Lullabies text:', bodyText.substring(0, 600));

  // Step 8: Stories
  console.log('\n=== Step 8: Stories ===');
  await nav('https://www.thebibletellsmeso.com/stories');
  await page.waitForTimeout(3000);
  await shot('26_stories');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('Stories text:', bodyText.substring(0, 600));

  // Step 9: Free Songs (Joyful Songs)
  console.log('\n=== Step 9: Free Songs ===');
  await nav('https://www.thebibletellsmeso.com/streaming-audio/free-songs');
  await page.waitForTimeout(3000);
  await shot('27_free_songs');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('Free Songs text:', bodyText.substring(0, 600));

  // Step 10: Bible StorySongs
  console.log('\n=== Step 10: Bible StorySongs ===');
  await nav('https://www.thebibletellsmeso.com/bible-story-songs');
  await page.waitForTimeout(4000);
  await shot('28_bible_story_songs');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 5000));
  console.log('Bible StorySongs text:', bodyText.substring(0, 1000));

  // Step 11: Downloads page
  console.log('\n=== Step 11: Song Downloads ===');
  await nav('https://www.thebibletellsmeso.com/downloads');
  await page.waitForTimeout(4000);
  await shot('29_downloads');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('Downloads text:', bodyText.substring(0, 800));

  // Step 12: Family Time page (videos)
  console.log('\n=== Step 12: Family Time ===');
  await nav('https://www.thebibletellsmeso.com/familytime');
  await page.waitForTimeout(3000);
  await shot('30_familytime');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('Family Time text:', bodyText.substring(0, 600));

  // Step 13: My Account / My TBTMS
  console.log('\n=== Step 13: My Account ===');
  await nav('https://www.thebibletellsmeso.com/account/my-account');
  await page.waitForTimeout(3000);
  await shot('31_my_account');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('My Account text:', bodyText.substring(0, 600));

  // Step 14: Coloring
  console.log('\n=== Step 14: Coloring ===');
  await nav('https://www.thebibletellsmeso.com/coloring');
  await page.waitForTimeout(3000);
  await shot('32_coloring');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('Coloring text:', bodyText.substring(0, 600));

  // Step 15: NCM page
  console.log('\n=== Step 15: NCM ===');
  await nav('https://www.thebibletellsmeso.com/ncm');
  await page.waitForTimeout(3000);
  await shot('33_ncm');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 3000));
  console.log('NCM text:', bodyText.substring(0, 600));

  // Step 16: All Videos search
  console.log('\n=== Step 16: All Videos ===');
  await nav('https://www.thebibletellsmeso.com/all-videos');
  await page.waitForTimeout(4000);
  await shot('34_all_videos');

  bodyText = await page.$eval('body', el => el.innerText.substring(0, 5000));
  console.log('All Videos text:', bodyText.substring(0, 1000));

  await browser.close();
  console.log('\n=== Done! All screenshots saved. ===');
})();
