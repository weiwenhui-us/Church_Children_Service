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

  // Login first via staff-welcome
  console.log('=== Login ===');
  await nav('https://www.thebibletellsmeso.com/account/staff-welcome');
  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    await emailInput.fill('churchinbaskingridge@gmail.com');
    const pwInput = await page.$('input[type="password"]');
    if (pwInput) {
      await pwInput.fill('r&vkKDVDqlY5Xp');
      await pwInput.press('Enter');
      await page.waitForTimeout(6000);
    }
  }
  console.log('Logged in. URL:', page.url());

  // === Test 1: Search functionality on all-audio ===
  console.log('\n=== Test 1: Search on all-audio page ===');
  await nav('https://www.thebibletellsmeso.com/all-audio');
  await page.waitForTimeout(5000);

  // Find the search input
  const searchInput = await page.$('input[name="search-all tbtms audio"], input[placeholder*="Search all TBTMS"]');
  if (searchInput) {
    console.log('Found search input!');

    // Test search for "Jesus"
    await searchInput.fill('Jesus');
    await page.waitForTimeout(3000);
    await shot('40_search_jesus');

    const resultsText = await page.$eval('body', el => el.innerText.substring(0, 3000));
    // Extract song names from results
    const lines = resultsText.split('\n').filter(l => l.trim() && !l.includes('Skip') && !l.includes('Home'));
    console.log('Search results for "Jesus":', lines.slice(0, 30).join('\n'));

    // Test search for "love"
    await searchInput.fill('');
    await searchInput.fill('love');
    await page.waitForTimeout(3000);
    await shot('41_search_love');

    const resultsText2 = await page.$eval('body', el => el.innerText.substring(0, 3000));
    const lines2 = resultsText2.split('\n').filter(l => l.trim() && l.length > 3);
    console.log('Search results for "love":', lines2.slice(5, 25).join('\n'));

    // Test search for "creation"
    await searchInput.fill('');
    await searchInput.fill('creation');
    await page.waitForTimeout(3000);
    await shot('42_search_creation');

    const resultsText3 = await page.$eval('body', el => el.innerText.substring(0, 3000));
    const lines3 = resultsText3.split('\n').filter(l => l.trim() && l.length > 3);
    console.log('Search results for "creation":', lines3.slice(5, 25).join('\n'));

    // Clear search to see all songs
    await searchInput.fill('');
    await page.waitForTimeout(3000);
  }

  // === Test 2: Count all songs on the all-audio page ===
  console.log('\n=== Test 2: Count all songs ===');
  // Scroll to load all songs (lazy loading)
  let prevCount = 0;
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    const musicPlayers = await page.$$('[class*="MusicPlayer"], [class*="audio-player"]');
    const count = musicPlayers.length;
    console.log(`Scroll ${i + 1}: ${count} audio players found`);
    if (count === prevCount && i > 2) break;
    prevCount = count;
  }

  // Get all song names
  const allSongNames = await page.$$eval('[class*="MusicPlayer"] [class*="title"], [class*="TrackName"], a[href*="audio"]',
    els => els.map(e => e.textContent.trim()).filter(t => t && t.length > 2)
  );
  console.log(`Total unique song titles found: ${allSongNames.length}`);
  console.log('Song titles:', allSongNames.slice(0, 50));

  // Alternative: extract from the text content
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS, 'btms_43_all_audio_top.png'), fullPage: false });

  // Get the full page text and extract song names (lines with time format 00:00 / XX:XX)
  const fullText = await page.$eval('body', el => el.innerText);
  const songLines = fullText.split('\n').filter(l => l.includes('00:00 /'));
  console.log(`\nSongs with audio players: ${songLines.length}`);

  // Get song names - they're the lines just before the time stamps
  const textLines = fullText.split('\n').map(l => l.trim()).filter(l => l);
  const songTitles = [];
  for (let i = 0; i < textLines.length; i++) {
    if (textLines[i].includes('00:00 /') && i > 0) {
      songTitles.push(textLines[i - 1]);
    }
  }
  console.log(`\nExtracted ${songTitles.length} song titles:`);
  songTitles.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));

  // === Test 3: Click on a specific album to see its songs ===
  console.log('\n=== Test 3: Explore a specific album (Joyful Songs) ===');
  await nav('https://www.thebibletellsmeso.com/streaming-audio/free-songs');
  await page.waitForTimeout(4000);

  // Scroll to see all songs
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
  }

  const joyfulText = await page.$eval('body', el => el.innerText);
  const joyfulSongs = [];
  const jLines = joyfulText.split('\n').map(l => l.trim()).filter(l => l);
  for (let i = 0; i < jLines.length; i++) {
    if (jLines[i].includes('00:00 /') && i > 0) {
      joyfulSongs.push(jLines[i - 1]);
    }
  }
  console.log(`Joyful Songs - ${joyfulSongs.length} songs:`);
  joyfulSongs.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
  await shot('44_joyful_songs_full');

  // Check for tabs: Audio, Video, Tap and Sing, Piano, Guitar
  const tabs = await page.$$eval('button, [role="tab"]', els =>
    els.map(e => e.textContent.trim()).filter(t => ['Audio', 'Video', 'Tap and Sing', 'Piano', 'Guitar'].includes(t))
  );
  console.log('Available tabs:', tabs);

  // === Test 4: Click on a BSS Lyrics video to see if lyrics are shown ===
  console.log('\n=== Test 4: BSS Lyrics Video detail ===');
  await nav('https://www.thebibletellsmeso.com/bss-lyrics-videos');
  await page.waitForTimeout(3000);

  // Click on the first video
  const firstVideo = await page.$('a[href*="video"], [class*="video"] a, [class*="Video"]');
  if (firstVideo) {
    const videoText = await firstVideo.textContent();
    console.log('Clicking first video:', videoText.trim().substring(0, 50));
    const videoHref = await firstVideo.getAttribute('href');
    if (videoHref) {
      await nav(videoHref.startsWith('http') ? videoHref : `https://www.thebibletellsmeso.com${videoHref}`);
      await page.waitForTimeout(3000);
      await shot('45_video_detail');

      const videoPageText = await page.$eval('body', el => el.innerText.substring(0, 3000));
      console.log('Video detail page:', videoPageText.substring(0, 800));
    }
  }

  // === Test 5: Check individual album pages - Simple Bible Songs Genesis ===
  console.log('\n=== Test 5: Simple Bible Songs - Sing about Genesis ===');
  // Find album links on allsongs page
  await nav('https://www.thebibletellsmeso.com/allsongs');
  await page.waitForTimeout(3000);

  // Get all album links
  const albumLinks = await page.$$eval('a[href*="streaming-audio"], a[href*="sing-about"]',
    els => els.map(e => ({ text: e.textContent.trim().substring(0, 50), href: e.href }))
  );
  console.log('Album links found:', JSON.stringify(albumLinks.slice(0, 20), null, 2));

  // Click on a visible album - try finding image links
  const allPageLinks = await page.$$eval('a', els =>
    els.map(e => ({ text: e.textContent.trim().substring(0, 60), href: e.href }))
      .filter(l => l.href.includes('streaming-audio') || l.href.includes('sing-about') || l.href.includes('album'))
  );
  console.log('All audio/album links:', JSON.stringify(allPageLinks, null, 2));

  if (allPageLinks.length > 0) {
    const firstAlbum = allPageLinks[0];
    console.log(`Visiting album: ${firstAlbum.text} - ${firstAlbum.href}`);
    await nav(firstAlbum.href);
    await page.waitForTimeout(4000);
    await shot('46_album_detail');

    const albumText = await page.$eval('body', el => el.innerText);
    const albumSongs = [];
    const aLines = albumText.split('\n').map(l => l.trim()).filter(l => l);
    for (let i = 0; i < aLines.length; i++) {
      if (aLines[i].includes('00:00 /') && i > 0) {
        albumSongs.push(aLines[i - 1]);
      }
    }
    console.log(`Album songs: ${albumSongs.length}`);
    albumSongs.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
  }

  // === Test 6: Check if clicking a song title shows lyrics ===
  console.log('\n=== Test 6: Check for lyrics on song click ===');
  await nav('https://www.thebibletellsmeso.com/all-audio');
  await page.waitForTimeout(5000);

  // Click on a song title link
  const songLinks = await page.$$('a[class*="track"], a[class*="song"], a[class*="Title"]');
  console.log(`Song title links found: ${songLinks.length}`);

  // Try clicking song names that are links
  const songAnchors = await page.$$eval('a', els =>
    els.filter(e => {
      const h = e.href;
      return h.includes('audio') && !h.includes('all-audio') && !h.includes('streaming-audio/free') &&
             !h.includes('allsongs') && e.textContent.trim().length > 3 && e.textContent.trim().length < 100;
    }).slice(0, 10).map(e => ({ text: e.textContent.trim(), href: e.href }))
  );
  console.log('Song anchor links:', JSON.stringify(songAnchors, null, 2));

  if (songAnchors.length > 0) {
    console.log(`Visiting song: ${songAnchors[0].text}`);
    await nav(songAnchors[0].href);
    await page.waitForTimeout(3000);
    await shot('47_song_detail');

    const songDetailText = await page.$eval('body', el => el.innerText.substring(0, 3000));
    console.log('Song detail page:', songDetailText.substring(0, 1000));
  }

  await browser.close();
  console.log('\n=== Done! ===');
})();
