/**
 * find_song.js — Song discovery workflow for church school slides.
 *
 * Usage: node find_song.js <topic_keywords> <output_dir>
 *
 * Searches for songs matching the lesson topic in this priority order:
 *   1. TheBibleTellsMeSo YouTube channel
 *   2. Song repository (http://173.68.175.102/children_song.asp)
 *   3. YouTube general search
 *
 * Outputs: song_candidates.json and screenshots in output_dir
 */
const path = require('path');
const fs = require('fs');

const topic = process.argv[2];
const outputDir = process.argv[3] || process.cwd();

// Resolve playwright from working directory
const { chromium } = require(require.resolve('playwright', { paths: [outputDir, process.cwd()] }));

if (!topic) {
  console.error('Usage: node find_song.js <topic_keywords> <output_dir>');
  process.exit(1);
}

const SONG_REPO_BASE = 'http://173.68.175.102/Children_song.asp';
const TBTMS_CHANNEL = 'https://www.youtube.com/@thebibletellsmeso';

// Song repository category IDs
const CATEGORIES = {
  bibleStory: 23,
  hisLoveAndCare: 9,
  loveAndConsecration: 13,
  followingTheLord: 4,
  obedience: 14,
  sinConfessingForgiving: 19,
  allSongs: 'ALL_AB'
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const candidates = [];

  // ─── Priority 1: TheBibleTellsMeSo YouTube Channel ───
  console.log('=== Priority 1: TheBibleTellsMeSo YouTube ===');
  const searchTerms = topic.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).join('+');

  try {
    const tbtmsUrl = `${TBTMS_CHANNEL}/search?query=${searchTerms}`;
    console.log('Searching:', tbtmsUrl);
    await page.goto(tbtmsUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);

    await page.screenshot({
      path: path.join(outputDir, 'tbtms_search.png'),
      fullPage: false
    });

    // Extract video results
    const tbtmsVideos = await page.$$eval(
      'a#video-title-link, ytd-video-renderer a#video-title, a#video-title',
      els => els.slice(0, 10).map(a => ({
        title: a.textContent.trim(),
        href: a.href
      }))
    );
    console.log(`Found ${tbtmsVideos.length} results from TheBibleTellsMeSo`);
    tbtmsVideos.forEach(v => console.log(`  - ${v.title}: ${v.href}`));

    for (const v of tbtmsVideos) {
      candidates.push({
        source: 'thebibletellsmeso',
        title: v.title,
        url: v.href,
        isShort: v.href.includes('/shorts/'),
        verified: false,
        notes: 'From TheBibleTellsMeSo channel — needs singing verification'
      });
    }
  } catch (e) {
    console.log('TheBibleTellsMeSo search failed:', e.message);
  }

  // ─── Priority 2: Song Repository ───
  console.log('\n=== Priority 2: Song Repository ===');

  // Search the all-songs listing for topic keywords
  try {
    const allSongsUrl = `${SONG_REPO_BASE}?req_type=CAT&req_no=ALL_AB`;
    console.log('Loading all songs:', allSongsUrl);
    await page.goto(allSongsUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Extract all song links
    const songLinks = await page.evaluate(() => {
      const rows = document.querySelectorAll('tr');
      const songs = [];
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const links = row.querySelectorAll('a');
        if (links.length > 0) {
          const rowText = row.innerText.trim();
          Array.from(links).forEach(a => {
            const href = a.href;
            const match = href.match(/req_no=(\d+)/);
            if (match) {
              songs.push({
                songId: match[1],
                title: a.innerText.trim(),
                rowText: rowText.substring(0, 200),
                href
              });
            }
          });
        }
      });
      return songs;
    });

    // Filter songs by topic keywords
    const keywords = topic.toLowerCase().split(/\s+/);
    const matchingSongs = songLinks.filter(s => {
      const text = (s.title + ' ' + s.rowText).toLowerCase();
      return keywords.some(kw => kw.length > 3 && text.includes(kw));
    });

    console.log(`Found ${matchingSongs.length} matching songs in repository`);

    // Verify top candidates (max 5)
    for (const song of matchingSongs.slice(0, 5)) {
      console.log(`\nVerifying song #${song.songId}: ${song.title}`);
      const verification = await verifySong(page, song.songId, outputDir);

      candidates.push({
        source: 'repository',
        title: song.title,
        number: song.songId,
        url: `${SONG_REPO_BASE}?req_type=SHOW&req_no=${song.songId}`,
        playUrl: `${SONG_REPO_BASE}?req_type=Play&req_no=${song.songId}`,
        hasLyrics: verification.hasLyrics,
        hasAudio: verification.hasAudio,
        hasError: verification.hasError,
        verified: verification.hasLyrics && verification.hasAudio && !verification.hasError,
        notes: verification.notes
      });
    }
  } catch (e) {
    console.log('Song repository search failed:', e.message);
  }

  // ─── Priority 3: YouTube General Search ───
  console.log('\n=== Priority 3: YouTube General Search ===');
  try {
    const ytQuery = `${topic} children bible song singing`.replace(/\s+/g, '+');
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery)}`;
    console.log('Searching YouTube:', ytUrl);
    await page.goto(ytUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: path.join(outputDir, 'youtube_search.png'),
      fullPage: false
    });

    const ytVideos = await page.$$eval(
      'a#video-title-link, ytd-video-renderer a#video-title, a#video-title',
      els => els.slice(0, 8).map(a => ({
        title: a.textContent.trim(),
        href: a.href
      }))
    );
    console.log(`Found ${ytVideos.length} YouTube results`);

    for (const v of ytVideos) {
      candidates.push({
        source: 'youtube',
        title: v.title,
        url: v.href,
        isShort: v.href.includes('/shorts/'),
        verified: false,
        notes: 'From YouTube general search — needs singing verification'
      });
    }
  } catch (e) {
    console.log('YouTube search failed:', e.message);
  }

  // Save all candidates
  const output = {
    topic,
    searchDate: new Date().toISOString(),
    candidates,
    summary: {
      thebibletellsmeso: candidates.filter(c => c.source === 'thebibletellsmeso').length,
      repository: candidates.filter(c => c.source === 'repository').length,
      repositoryVerified: candidates.filter(c => c.source === 'repository' && c.verified).length,
      youtube: candidates.filter(c => c.source === 'youtube').length,
      total: candidates.length
    }
  };

  fs.writeFileSync(
    path.join(outputDir, 'song_candidates.json'),
    JSON.stringify(output, null, 2),
    'utf-8'
  );

  console.log('\n=== Summary ===');
  console.log(JSON.stringify(output.summary, null, 2));
  console.log(`\nCandidates saved to: ${path.join(outputDir, 'song_candidates.json')}`);

  await browser.close();
})();

/**
 * Verify a song from the repository: check lyrics + audio
 */
async function verifySong(page, songId, outputDir) {
  const result = {
    hasLyrics: false,
    hasAudio: false,
    hasError: false,
    notes: ''
  };

  // Check SHOW page (lyrics)
  try {
    const showUrl = `${SONG_REPO_BASE}?req_type=SHOW&req_no=${songId}`;
    await page.goto(showUrl, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(outputDir, `song_${songId}_show.png`),
      fullPage: false
    });

    const bodyText = await page.evaluate(() => document.body.innerText);
    result.hasLyrics = bodyText.length > 200;

    // Check for "play Song" link on SHOW page
    const hasPlayLink = bodyText.toLowerCase().includes('play song');
    if (!hasPlayLink) {
      result.notes += 'No "play Song" link on SHOW page. ';
    }
  } catch (e) {
    result.notes += `SHOW page error: ${e.message}. `;
  }

  // Check Play page (audio)
  try {
    const playUrl = `${SONG_REPO_BASE}?req_type=Play&req_no=${songId}`;
    await page.goto(playUrl, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(outputDir, `song_${songId}_play.png`),
      fullPage: false
    });

    const pageSource = await page.content();
    const bodyText = await page.evaluate(() => document.body.innerText);

    // Check for error messages
    if (bodyText.includes('does not exists') || bodyText.includes('Error')) {
      result.hasError = true;
      result.notes += 'Audio file missing or error on Play page. ';
    } else {
      // Check for audio elements
      const hasAudioElements = await page.evaluate(() => {
        const embeds = document.querySelectorAll('embed, audio, object, bgsound, iframe');
        return embeds.length > 0;
      });

      const hasAudioRef = pageSource.includes('.mp3') ||
        pageSource.includes('.wav') ||
        pageSource.includes('.mid') ||
        pageSource.includes('bgsound');

      result.hasAudio = hasAudioElements || hasAudioRef;
      if (!result.hasAudio) {
        result.notes += 'No audio elements detected on Play page. ';
      }
    }
  } catch (e) {
    result.notes += `Play page error: ${e.message}. `;
  }

  console.log(`  Song #${songId}: lyrics=${result.hasLyrics}, audio=${result.hasAudio}, error=${result.hasError}`);
  return result;
}
