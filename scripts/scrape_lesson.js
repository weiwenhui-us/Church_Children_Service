/**
 * scrape_lesson.js — Scrape a church lesson page for content.
 *
 * Usage: node scrape_lesson.js <lesson_url> <output_dir>
 *
 * Navigates to the lesson URL using Playwright, extracts:
 * - Page title / topic
 * - Scripture references
 * - Full story text
 * - Memory verse (if found)
 * - Song references
 *
 * Outputs: lesson_data.json and lesson_screenshot.png in output_dir
 */
const path = require('path');
const fs = require('fs');

const lessonUrl = process.argv[2];
const outputDir = process.argv[3] || process.cwd();

// Resolve playwright from working directory
const { chromium } = require(require.resolve('playwright', { paths: [outputDir, process.cwd()] }));

if (!lessonUrl) {
  console.error('Usage: node scrape_lesson.js <lesson_url> <output_dir>');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to:', lessonUrl);
  const response = await page.goto(lessonUrl, { waitUntil: 'networkidle', timeout: 30000 });

  if (!response || response.status() !== 200) {
    console.error('Failed to load page. Status:', response ? response.status() : 'no response');
    await browser.close();
    process.exit(1);
  }

  await page.waitForTimeout(2000);

  // Screenshot
  await page.screenshot({
    path: path.join(outputDir, 'lesson_screenshot.png'),
    fullPage: true
  });
  console.log('Screenshot saved');

  // Extract text content
  const textContent = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(path.join(outputDir, 'lesson_text.txt'), textContent, 'utf-8');

  // Extract HTML content
  const htmlContent = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync(path.join(outputDir, 'lesson_html.html'), htmlContent, 'utf-8');

  // Extract all links
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.trim().substring(0, 200),
      href: a.href
    })).filter(l => l.text.length > 0)
  );

  // Extract structured content
  const structuredContent = await page.evaluate(() => {
    const result = {
      title: '',
      headings: [],
      paragraphs: [],
      boldTexts: [],
      listItems: []
    };

    // Title from h1 or first heading
    const h1 = document.querySelector('h1');
    if (h1) result.title = h1.innerText.trim();

    // All headings
    document.querySelectorAll('h1, h2, h3, h4').forEach(h => {
      result.headings.push({ level: h.tagName, text: h.innerText.trim() });
    });

    // Paragraphs
    document.querySelectorAll('p').forEach(p => {
      const text = p.innerText.trim();
      if (text.length > 10) result.paragraphs.push(text);
    });

    // Bold text (often contains scripture refs, key points)
    document.querySelectorAll('b, strong').forEach(b => {
      const text = b.innerText.trim();
      if (text.length > 3) result.boldTexts.push(text);
    });

    // List items
    document.querySelectorAll('li').forEach(li => {
      result.listItems.push(li.innerText.trim());
    });

    return result;
  });

  // Look for scripture references (patterns like "Genesis 37:1-11", "Matthew 5:44")
  const scripturePattern = /(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|(?:1|2)\s*Samuel|(?:1|2)\s*Kings|(?:1|2)\s*Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song\s*of\s*Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|(?:1|2)\s*Corinthians|Galatians|Ephesians|Philippians|Colossians|(?:1|2)\s*Thessalonians|(?:1|2)\s*Timothy|Titus|Philemon|Hebrews|James|(?:1|2)\s*Peter|(?:1|2|3)\s*John|Jude|Revelation)\s+\d+[:\d\-,;\s]*/gi;
  const scriptureRefs = [...new Set((textContent.match(scripturePattern) || []).map(s => s.trim()))];

  // Look for memory verse indicators
  const memoryVersePatterns = [
    /memory\s*verse[:\s]*(.+?)(?:\n|$)/i,
    /verse\s*to\s*memorize[:\s]*(.+?)(?:\n|$)/i,
  ];
  let memoryVerse = '';
  for (const pattern of memoryVersePatterns) {
    const match = textContent.match(pattern);
    if (match) { memoryVerse = match[1].trim(); break; }
  }

  // Look for song references (links to song repository)
  const songLinks = links.filter(l =>
    l.href.includes('173.68.175.102') ||
    l.href.includes('children_song') ||
    l.href.includes('youtube.com') ||
    l.text.toLowerCase().includes('song') ||
    l.text.toLowerCase().includes('sing')
  );

  const lessonData = {
    url: lessonUrl,
    title: structuredContent.title,
    headings: structuredContent.headings,
    paragraphs: structuredContent.paragraphs,
    boldTexts: structuredContent.boldTexts,
    listItems: structuredContent.listItems,
    scriptureRefs,
    memoryVerse,
    songLinks,
    allLinks: links,
    textLength: textContent.length
  };

  fs.writeFileSync(
    path.join(outputDir, 'lesson_data.json'),
    JSON.stringify(lessonData, null, 2),
    'utf-8'
  );

  console.log('Lesson data extracted:');
  console.log('  Title:', lessonData.title);
  console.log('  Scripture refs:', scriptureRefs.length);
  console.log('  Paragraphs:', structuredContent.paragraphs.length);
  console.log('  Song links:', songLinks.length);
  console.log('  Memory verse:', memoryVerse || '(not found on page)');

  await browser.close();
})();
