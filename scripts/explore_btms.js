const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS = 'C:\\Users\\wenhui.wei\\OneDrive - Regeneron Pharmaceuticals, Inc\\Pictures\\Screenshots';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  // Step 1: Navigate to homepage
  console.log('=== Step 1: Navigate to homepage ===');
  await page.goto('https://www.thebibletellsmeso.com/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: path.join(SCREENSHOTS, 'btms_01_homepage.png'), fullPage: false });
  console.log('Homepage screenshot taken');

  // Log all links on the page
  const links = await page.$$eval('a', els => els.map(e => ({ text: e.textContent.trim().substring(0, 80), href: e.href })));
  console.log('Links on homepage:', JSON.stringify(links.slice(0, 30), null, 2));

  // Step 2: Find and click login/sign-in
  console.log('\n=== Step 2: Find login link ===');
  // Look for login-related buttons/links
  const loginSelectors = [
    'a:has-text("Log In")', 'a:has-text("Login")', 'a:has-text("Sign In")',
    'button:has-text("Log In")', 'button:has-text("Login")', 'button:has-text("Sign In")',
    '[data-testid*="login"]', '[class*="login"]', '[class*="signin"]',
    'a:has-text("Account")', 'a:has-text("My Account")'
  ];

  let loginFound = false;
  for (const sel of loginSelectors) {
    const el = await page.$(sel);
    if (el) {
      const text = await el.textContent();
      console.log(`Found login element: "${text.trim()}" with selector: ${sel}`);
      await el.click();
      loginFound = true;
      break;
    }
  }

  if (!loginFound) {
    console.log('No standard login link found, checking for Wix login...');
    // Wix sites sometimes have login in a member area or specific button
    const allButtons = await page.$$eval('button, a', els => els.map(e => ({
      tag: e.tagName, text: e.textContent.trim().substring(0, 60),
      href: e.href || '', classes: e.className.substring(0, 100)
    })));
    console.log('All clickable elements:', JSON.stringify(allButtons.slice(0, 40), null, 2));
  }

  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOTS, 'btms_02_after_login_click.png'), fullPage: false });
  console.log('After login click screenshot taken');

  // Step 3: Enter credentials
  console.log('\n=== Step 3: Enter credentials ===');
  // Check for email/password fields (might be in an iframe for Wix)
  const frames = page.frames();
  console.log(`Number of frames: ${frames.length}`);

  let loginPage = page;
  // Check if there's a Wix login iframe
  for (const frame of frames) {
    const emailField = await frame.$('input[type="email"], input[name="email"], #emailInput, [data-testid="emailInput"]');
    if (emailField) {
      loginPage = frame;
      console.log('Found email field in frame:', frame.url());
      break;
    }
  }

  // Try to find email input
  const emailInput = await loginPage.$('input[type="email"], input[name="email"], #emailInput, [data-testid="emailInput"], input[placeholder*="email" i], input[placeholder*="Email"]');
  if (emailInput) {
    console.log('Found email input, entering credentials...');
    await emailInput.fill('churchinbaskingridge@gmail.com');

    // Look for password field
    const pwInput = await loginPage.$('input[type="password"], input[name="password"], #passwordInput, [data-testid="passwordInput"]');
    if (pwInput) {
      await pwInput.fill('r&vkKDVDqlY5Xp');
      console.log('Credentials entered');

      await page.screenshot({ path: path.join(SCREENSHOTS, 'btms_03_credentials_entered.png'), fullPage: false });

      // Submit
      const submitBtn = await loginPage.$('button[type="submit"], button:has-text("Log In"), button:has-text("Sign In"), [data-testid="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        console.log('Submit clicked');
      }
    }
  } else {
    console.log('No email input found on current page. Checking URL...');
    console.log('Current URL:', page.url());

    // Maybe we need to navigate to a specific login page
    // Try common Wix login paths
    const loginUrls = [
      'https://www.thebibletellsmeso.com/account/login',
      'https://www.thebibletellsmeso.com/signin',
      'https://www.thebibletellsmeso.com/login'
    ];

    for (const url of loginUrls) {
      console.log(`Trying ${url}...`);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        const emailEl = await page.$('input[type="email"], input[name="email"]');
        if (emailEl) {
          console.log(`Found login form at ${url}`);
          await emailEl.fill('churchinbaskingridge@gmail.com');
          const pwEl = await page.$('input[type="password"]');
          if (pwEl) {
            await pwEl.fill('r&vkKDVDqlY5Xp');
            await page.screenshot({ path: path.join(SCREENSHOTS, 'btms_03_credentials_entered.png'), fullPage: false });
            const btn = await page.$('button[type="submit"], button:has-text("Log In")');
            if (btn) await btn.click();
          }
          break;
        }
      } catch (e) {
        console.log(`  Failed: ${e.message.substring(0, 80)}`);
      }
    }
  }

  // Wait for login to complete
  await page.waitForTimeout(5000);
  console.log('\n=== Step 4: Post-login ===');
  console.log('Current URL after login:', page.url());
  await page.screenshot({ path: path.join(SCREENSHOTS, 'btms_04_post_login.png'), fullPage: false });

  // Step 5: Explore the site
  console.log('\n=== Step 5: Explore the site ===');

  // Get all navigation links
  const navLinks = await page.$$eval('nav a, [class*="nav"] a, [class*="menu"] a, header a', els =>
    els.map(e => ({ text: e.textContent.trim().substring(0, 80), href: e.href }))
  );
  console.log('Navigation links:', JSON.stringify(navLinks, null, 2));

  // Get all links on the page
  const allLinks = await page.$$eval('a', els =>
    els.map(e => ({ text: e.textContent.trim().substring(0, 80), href: e.href }))
    .filter(l => l.text && l.href && !l.href.includes('javascript:'))
  );
  console.log('\nAll page links:', JSON.stringify(allLinks.slice(0, 50), null, 2));

  // Look for songs, search, library, etc.
  const songKeywords = ['song', 'search', 'library', 'catalog', 'lyrics', 'category', 'browse', 'music', 'hymn'];
  const songLinks = allLinks.filter(l => {
    const combined = (l.text + ' ' + l.href).toLowerCase();
    return songKeywords.some(k => combined.includes(k));
  });
  console.log('\nSong-related links:', JSON.stringify(songLinks, null, 2));

  // Visit song-related pages
  for (let i = 0; i < Math.min(songLinks.length, 5); i++) {
    const link = songLinks[i];
    console.log(`\n--- Visiting: ${link.text} (${link.href}) ---`);
    try {
      await page.goto(link.href, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(SCREENSHOTS, `btms_05_explore_${i + 1}_${link.text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}.png`),
        fullPage: false
      });

      // Get page content overview
      const headings = await page.$$eval('h1, h2, h3', els => els.map(e => e.textContent.trim().substring(0, 100)));
      console.log('Headings:', headings);

      // Check for search functionality
      const searchInputs = await page.$$('input[type="search"], input[placeholder*="search" i], [class*="search"] input');
      if (searchInputs.length > 0) {
        console.log('SEARCH INPUT FOUND!');
      }

      // Check for song lists
      const listItems = await page.$$eval('[class*="song"], [class*="list"] li, [class*="grid"] [class*="item"], table tr',
        els => els.slice(0, 10).map(e => e.textContent.trim().substring(0, 100))
      );
      if (listItems.length > 0) {
        console.log('List items:', listItems.slice(0, 5));
      }
    } catch (e) {
      console.log(`Error visiting ${link.href}: ${e.message.substring(0, 100)}`);
    }
  }

  // Also try to visit the main pages if we haven't yet
  const pagesToTry = [
    'https://www.thebibletellsmeso.com/songs',
    'https://www.thebibletellsmeso.com/song-library',
    'https://www.thebibletellsmeso.com/search',
    'https://www.thebibletellsmeso.com/categories',
    'https://www.thebibletellsmeso.com/music'
  ];

  for (const url of pagesToTry) {
    try {
      console.log(`\n--- Trying page: ${url} ---`);
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      if (resp && resp.status() < 400) {
        console.log(`  Status: ${resp.status()} - Page exists!`);
        await page.waitForTimeout(1500);
        const shortName = url.split('/').pop() || 'root';
        await page.screenshot({
          path: path.join(SCREENSHOTS, `btms_06_page_${shortName}.png`),
          fullPage: false
        });

        const headings = await page.$$eval('h1, h2, h3', els => els.map(e => e.textContent.trim().substring(0, 100)));
        console.log('  Headings:', headings);

        const bodyText = await page.$eval('body', el => el.innerText.substring(0, 1000));
        console.log('  Body preview:', bodyText.substring(0, 500));
      } else {
        console.log(`  Status: ${resp ? resp.status() : 'null'}`);
      }
    } catch (e) {
      console.log(`  Error: ${e.message.substring(0, 100)}`);
    }
  }

  // Take final overview screenshot
  console.log('\n=== Step 6: Final overview ===');
  await page.goto('https://www.thebibletellsmeso.com/', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS, 'btms_07_final_overview.png'), fullPage: true });

  await browser.close();
  console.log('\n=== Done! ===');
})();
