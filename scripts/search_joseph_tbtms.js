const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = String.raw`C:\Users\wenhui.wei\OneDrive - Regeneron Pharmaceuticals, Inc\Pictures\Screenshots`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  const results = [];

  // Helper to save screenshot
  async function screenshot(name) {
    const fp = path.join(SCREENSHOT_DIR, `tbtms_video_${name}.png`);
    await page.screenshot({ path: fp, fullPage: false });
    console.log(`[SCREENSHOT] ${fp}`);
  }

  // ============================================================
  // 1. Navigate to All Videos page
  // ============================================================
  console.log('\n=== STEP 1: All Videos page ===');
  try {
    await page.goto('https://www.thebibletellsmeso.com/all-videos', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await screenshot('all_videos_page');
    console.log('Page title:', await page.title());
  } catch (e) {
    console.log('Error loading all-videos:', e.message);
  }

  // ============================================================
  // 2. Search for "Joseph"
  // ============================================================
  console.log('\n=== STEP 2: Search for Joseph ===');
  try {
    // Look for search input
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="earch"]',
      'input[placeholder*="Search"]',
      'input[name="q"]',
      'input[name="search"]',
      '.search-input',
      '#search',
      'input[type="text"]'
    ];
    let searchFound = false;
    for (const sel of searchSelectors) {
      const el = await page.$(sel);
      if (el) {
        await el.click();
        await el.fill('Joseph');
        await page.waitForTimeout(1000);
        // Try pressing Enter
        await el.press('Enter');
        await page.waitForTimeout(3000);
        await screenshot('search_joseph');
        searchFound = true;
        console.log(`Search box found with selector: ${sel}`);
        break;
      }
    }
    if (!searchFound) {
      console.log('No search box found. Dumping page text for clues...');
      // Check for any input elements
      const inputs = await page.$$eval('input', els => els.map(e => ({
        type: e.type, name: e.name, placeholder: e.placeholder, id: e.id, className: e.className
      })));
      console.log('Inputs on page:', JSON.stringify(inputs, null, 2));
      await screenshot('search_joseph_no_searchbox');
    }
  } catch (e) {
    console.log('Error searching Joseph:', e.message);
  }

  // ============================================================
  // 3. Look for Joseph-related links/videos on the page
  // ============================================================
  console.log('\n=== STEP 3: Scan for Joseph links ===');
  try {
    const links = await page.$$eval('a', els => els.map(e => ({
      text: (e.textContent || '').trim().substring(0, 120),
      href: e.href
    })).filter(l => /joseph|genesis\s*3[7-9]|genesis\s*4[0-5]/i.test(l.text) || /joseph/i.test(l.href)));
    console.log(`Found ${links.length} Joseph-related links:`);
    links.forEach(l => {
      console.log(`  - "${l.text}" => ${l.href}`);
      results.push({ title: l.text, url: l.href, source: 'all-videos search' });
    });
  } catch (e) {
    console.log('Error scanning links:', e.message);
  }

  // ============================================================
  // 4. Try searching "Genesis" if no Joseph results
  // ============================================================
  console.log('\n=== STEP 4: Search for Genesis ===');
  try {
    await page.goto('https://www.thebibletellsmeso.com/all-videos', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="earch"]',
      'input[type="text"]'
    ];
    for (const sel of searchSelectors) {
      const el = await page.$(sel);
      if (el) {
        await el.click();
        await el.fill('Genesis');
        await page.waitForTimeout(1000);
        await el.press('Enter');
        await page.waitForTimeout(3000);
        await screenshot('search_genesis');

        // Scan for Joseph/Genesis related links
        const links = await page.$$eval('a', els => els.map(e => ({
          text: (e.textContent || '').trim().substring(0, 120),
          href: e.href
        })).filter(l => /joseph|genesis/i.test(l.text) || /joseph|genesis/i.test(l.href)));
        console.log(`Genesis search - found ${links.length} relevant links:`);
        links.forEach(l => {
          console.log(`  - "${l.text}" => ${l.href}`);
          results.push({ title: l.text, url: l.href, source: 'genesis search' });
        });
        break;
      }
    }
  } catch (e) {
    console.log('Error searching Genesis:', e.message);
  }

  // ============================================================
  // 5. Check Stories Videos category / dropdown
  // ============================================================
  console.log('\n=== STEP 5: Check Stories category dropdown ===');
  try {
    await page.goto('https://www.thebibletellsmeso.com/all-videos', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Look for dropdowns/selects/filter buttons
    const selects = await page.$$eval('select', els => els.map(e => ({
      id: e.id, name: e.name, className: e.className,
      options: Array.from(e.options).map(o => ({ text: o.text, value: o.value }))
    })));
    console.log('Select elements:', JSON.stringify(selects, null, 2));

    // Look for filter/category buttons
    const filterButtons = await page.$$eval('button, [role="button"], .filter, [class*="filter"], [class*="category"], [class*="dropdown"]',
      els => els.map(e => ({
        tag: e.tagName, text: (e.textContent || '').trim().substring(0, 80),
        className: e.className, id: e.id
      })).slice(0, 20));
    console.log('Filter/category elements:', JSON.stringify(filterButtons, null, 2));

    // Try clicking "Stories" if found
    const storiesBtn = await page.$('text=Stories');
    if (storiesBtn) {
      await storiesBtn.click();
      await page.waitForTimeout(3000);
      await screenshot('stories_category');

      const links = await page.$$eval('a', els => els.map(e => ({
        text: (e.textContent || '').trim().substring(0, 120),
        href: e.href
      })).filter(l => /joseph|genesis\s*3[7-9]|genesis\s*4[0-5]/i.test(l.text) || /joseph/i.test(l.href)));
      console.log(`Stories category - found ${links.length} Joseph links:`);
      links.forEach(l => {
        console.log(`  - "${l.text}" => ${l.href}`);
        results.push({ title: l.text, url: l.href, source: 'stories category' });
      });
    }

    // Also try selecting from a dropdown if there is one
    for (const sel of selects) {
      const storiesOpt = sel.options.find(o => /stories/i.test(o.text));
      if (storiesOpt) {
        console.log(`Found Stories option in select: ${sel.id || sel.name}`);
        const selectEl = await page.$(`select${sel.id ? '#' + sel.id : ''}`);
        if (selectEl) {
          await selectEl.selectOption(storiesOpt.value);
          await page.waitForTimeout(3000);
          await screenshot('stories_dropdown_selected');
        }
      }
    }
  } catch (e) {
    console.log('Error checking Stories category:', e.message);
  }

  // ============================================================
  // 6. Check /allsongs for Genesis album
  // ============================================================
  console.log('\n=== STEP 6: Check /allsongs for Genesis album ===');
  try {
    await page.goto('https://www.thebibletellsmeso.com/allsongs', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await screenshot('allsongs_page');
    console.log('All Songs page title:', await page.title());

    // Search for Genesis
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="earch"]',
      'input[type="text"]'
    ];
    for (const sel of searchSelectors) {
      const el = await page.$(sel);
      if (el) {
        await el.click();
        await el.fill('Genesis');
        await page.waitForTimeout(1000);
        await el.press('Enter');
        await page.waitForTimeout(3000);
        await screenshot('allsongs_search_genesis');
        break;
      }
    }

    // Scan for Genesis/Joseph related content
    const links = await page.$$eval('a', els => els.map(e => ({
      text: (e.textContent || '').trim().substring(0, 120),
      href: e.href
    })).filter(l => /joseph|genesis/i.test(l.text) || /joseph|genesis/i.test(l.href)));
    console.log(`All Songs - found ${links.length} Genesis/Joseph links:`);
    links.forEach(l => {
      console.log(`  - "${l.text}" => ${l.href}`);
      results.push({ title: l.text, url: l.href, source: 'allsongs' });
    });

    // Also look for album covers / sections with "Genesis" text
    const genesisText = await page.$$eval('*', els => {
      return els.filter(e => e.children.length === 0 && /genesis|joseph/i.test(e.textContent))
        .map(e => ({ tag: e.tagName, text: e.textContent.trim().substring(0, 150) }))
        .slice(0, 20);
    });
    console.log('Genesis/Joseph text elements:', JSON.stringify(genesisText, null, 2));
  } catch (e) {
    console.log('Error on allsongs:', e.message);
  }

  // ============================================================
  // 7. Try direct URL patterns for Joseph
  // ============================================================
  console.log('\n=== STEP 7: Try direct Joseph URLs ===');
  const directUrls = [
    'https://www.thebibletellsmeso.com/joseph',
    'https://www.thebibletellsmeso.com/joseph-sold-by-his-brothers',
    'https://www.thebibletellsmeso.com/josephs-coat',
    'https://www.thebibletellsmeso.com/genesis-37',
  ];
  for (const url of directUrls) {
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      if (resp && resp.status() === 200) {
        const title = await page.title();
        console.log(`HIT: ${url} => "${title}"`);
        const slug = url.split('/').pop();
        await screenshot(`direct_${slug}`);
        results.push({ title, url, source: 'direct URL' });
      } else {
        console.log(`MISS: ${url} => status ${resp ? resp.status() : 'null'}`);
      }
    } catch (e) {
      console.log(`MISS: ${url} => ${e.message.substring(0, 80)}`);
    }
  }

  // ============================================================
  // 8. Browse all video items on the page for Joseph content
  // ============================================================
  console.log('\n=== STEP 8: Browse all video grid for Joseph ===');
  try {
    await page.goto('https://www.thebibletellsmeso.com/all-videos', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Get ALL text content from video items/cards
    const allVideoItems = await page.$$eval('[class*="video"], [class*="item"], [class*="card"], [class*="grid"] a, .wix-image, [data-testid]',
      els => els.map(e => ({
        tag: e.tagName,
        text: (e.textContent || '').trim().substring(0, 200),
        href: e.href || '',
        alt: e.getAttribute('alt') || '',
        title: e.getAttribute('title') || '',
        ariaLabel: e.getAttribute('aria-label') || ''
      })).filter(e => e.text || e.alt || e.title));

    const josephItems = allVideoItems.filter(e =>
      /joseph|genesis\s*3[7-9]|genesis\s*4[0-5]/i.test(e.text + e.alt + e.title + e.ariaLabel)
    );
    console.log(`Found ${josephItems.length} Joseph items in video grid:`);
    josephItems.forEach(item => {
      console.log(`  - [${item.tag}] "${item.text || item.alt || item.title}" => ${item.href}`);
    });

    // Also do a full-page text scan
    const fullText = await page.textContent('body');
    const josephMatches = fullText.match(/.{0,50}joseph.{0,50}/gi) || [];
    console.log(`\nFull-page "joseph" text matches: ${josephMatches.length}`);
    josephMatches.forEach(m => console.log(`  ...${m.trim()}...`));

    const genesisMatches = fullText.match(/.{0,50}genesis.{0,50}/gi) || [];
    console.log(`\nFull-page "genesis" text matches: ${genesisMatches.length}`);
    genesisMatches.slice(0, 10).forEach(m => console.log(`  ...${m.trim()}...`));
  } catch (e) {
    console.log('Error browsing video grid:', e.message);
  }

  // ============================================================
  // 9. YouTube search for Joseph on TBTMS channel
  // ============================================================
  console.log('\n=== STEP 9: YouTube TBTMS channel search ===');
  try {
    await page.goto('https://www.youtube.com/@thebibletellsmeso/search?query=joseph', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    await screenshot('youtube_joseph_search');

    // Extract video titles and URLs
    const ytVideos = await page.$$eval('a#video-title, ytd-video-renderer a#video-title-link, a[href*="watch"]', els => {
      return els.map(e => ({
        title: (e.textContent || e.getAttribute('title') || '').trim(),
        href: e.href
      })).filter(e => e.title && e.href && e.href.includes('watch'));
    });
    console.log(`YouTube results: ${ytVideos.length} videos`);
    ytVideos.forEach(v => {
      console.log(`  - "${v.title}" => ${v.href}`);
      if (/joseph|genesis/i.test(v.title)) {
        results.push({ title: v.title, url: v.href, source: 'YouTube', type: 'video' });
      }
    });

    // If no results from that selector, try broader selectors
    if (ytVideos.length === 0) {
      const allYtLinks = await page.$$eval('a', els => els.map(e => ({
        text: (e.textContent || '').trim().substring(0, 120),
        href: e.href
      })).filter(l => l.href && l.href.includes('/watch') && l.text.length > 3));
      console.log(`Broader YouTube scan: ${allYtLinks.length} watch links`);
      allYtLinks.slice(0, 20).forEach(l => {
        console.log(`  - "${l.text}" => ${l.href}`);
      });

      // Also try getting video renderers
      const renderers = await page.$$eval('ytd-video-renderer, ytd-grid-video-renderer', els => els.map(e => ({
        text: (e.textContent || '').trim().substring(0, 200)
      })));
      console.log(`Video renderers found: ${renderers.length}`);
      renderers.slice(0, 10).forEach(r => console.log(`  - ${r.text.substring(0, 100)}`));
    }
  } catch (e) {
    console.log('Error on YouTube:', e.message);
  }

  // Also try YouTube search directly
  console.log('\n=== STEP 9b: YouTube direct search ===');
  try {
    await page.goto('https://www.youtube.com/results?search_query=thebibletellsmeso+joseph', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    await screenshot('youtube_direct_search_joseph');

    const ytResults = await page.$$eval('a', els => els.map(e => ({
      text: (e.textContent || '').trim().substring(0, 150),
      href: e.href
    })).filter(l => l.href && l.href.includes('/watch') && l.text.length > 5));
    console.log(`YouTube direct search results: ${ytResults.length}`);
    ytResults.slice(0, 15).forEach(l => {
      console.log(`  - "${l.text}" => ${l.href}`);
      if (/joseph|genesis|bible.*tells/i.test(l.text)) {
        results.push({ title: l.text, url: l.href, source: 'YouTube search', type: 'video' });
      }
    });
  } catch (e) {
    console.log('Error on YouTube direct search:', e.message);
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n========================================');
  console.log('FINAL RESULTS SUMMARY');
  console.log('========================================');
  // Deduplicate
  const seen = new Set();
  const unique = results.filter(r => {
    const key = r.url || r.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  unique.forEach((r, i) => {
    console.log(`${i + 1}. [${r.source}] "${r.title}" => ${r.url}`);
  });
  if (unique.length === 0) {
    console.log('No Joseph-specific videos found on TBTMS or YouTube.');
  }

  await browser.close();
})();
