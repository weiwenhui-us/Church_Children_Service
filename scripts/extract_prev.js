/**
 * extract_prev.js — Extract content from previous week's PPTX.
 *
 * Usage: node extract_prev.js <prev_pptx_path> <output_dir>
 *
 * Reads the previous week's slide deck and extracts:
 * - Slide 3 (This Week's Song) → becomes "Last Week's Song"
 *   - Song title, lyrics, YouTube URL, source
 * - Slide 6 (Lesson) → review content
 *   - Lesson title, kids summary bullets
 * - Slide 7 (Memory Verse) → review verse
 *   - Verse text and reference
 *
 * Outputs: prev_week.json in output_dir
 *
 * Uses adm-zip to read PPTX (which is a ZIP of XML files).
 */
const path = require('path');
const fs = require('fs');

const pptxPath = process.argv[2];
const outputDir = process.argv[3] || process.cwd();

// Resolve adm-zip from working directory (where npm install was run)
const AdmZip = require(require.resolve('adm-zip', { paths: [outputDir, process.cwd()] }));

// Decode XML entities
function decodeXml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

if (!pptxPath) {
  console.error('Usage: node extract_prev.js <prev_pptx_path> <output_dir>');
  process.exit(1);
}

if (!fs.existsSync(pptxPath)) {
  console.error('File not found:', pptxPath);
  process.exit(1);
}

// Parse week number from filename (e.g., "Week24_Joseph_TwoDreams.pptx" → 24)
const filenameMatch = path.basename(pptxPath).match(/Week(\d+)/i);
const prevWeekNumber = filenameMatch ? parseInt(filenameMatch[1]) : null;

const zip = new AdmZip(pptxPath);
const entries = zip.getEntries();

// Extract text from a slide XML, preserving paragraph structure
function extractSlideText(xmlContent) {
  const paragraphs = [];
  // Match each paragraph <a:p>...</a:p>
  const paraRegex = /<a:p[^>]*>([\s\S]*?)<\/a:p>/g;
  let paraMatch;
  while ((paraMatch = paraRegex.exec(xmlContent)) !== null) {
    const paraXml = paraMatch[1];
    // Extract all text runs <a:t>text</a:t>
    const textRegex = /<a:t>([^<]*)<\/a:t>/g;
    let textMatch;
    let paraText = '';
    while ((textMatch = textRegex.exec(paraXml)) !== null) {
      paraText += textMatch[1];
    }
    if (paraText.trim()) {
      paragraphs.push(decodeXml(paraText.trim()));
    }
  }
  return paragraphs;
}

// Extract hyperlinks from a slide's relationship file
function extractHyperlinks(slideNum) {
  const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
  const relsEntry = entries.find(e => e.entryName === relsPath);
  if (!relsEntry) return {};

  const relsXml = relsEntry.getData().toString('utf-8');
  const links = {};
  const linkRegex = /Id="(rId\d+)"[^>]*Target="([^"]*)"[^>]*TargetMode="External"/g;
  let match;
  while ((match = linkRegex.exec(relsXml)) !== null) {
    links[match[1]] = match[2];
  }
  return links;
}

// Extract hyperlink rId references from slide XML
function extractHyperlinkRefs(xmlContent) {
  const refs = [];
  const hlinkRegex = /r:id="(rId\d+)"/g;
  let match;
  while ((match = hlinkRegex.exec(xmlContent)) !== null) {
    refs.push(match[1]);
  }
  return refs;
}

// Read slide XML by number
function getSlideXml(slideNum) {
  const slidePath = `ppt/slides/slide${slideNum}.xml`;
  const entry = entries.find(e => e.entryName === slidePath);
  if (!entry) return null;
  return entry.getData().toString('utf-8');
}

const result = {
  prevWeekNumber,
  lastWeekSong: {
    title: '',
    source: '',
    youtubeUrl: '',
    lyrics: [],
    lyricsLeft: [],
    lyricsRight: []
  },
  lastWeekReview: {
    weekNumber: prevWeekNumber,
    title: '',
    scripture: '',
    memoryVerse: '',
    bullets: [],
    discussion: '',
    verseQuote: ''
  }
};

// ─── Slide 3: This Week's Song → becomes Last Week's Song ───
console.log('Extracting slide 3 (This Week\'s Song)...');
const slide3Xml = getSlideXml(3);
if (slide3Xml) {
  const slide3Text = extractSlideText(slide3Xml);
  const slide3Links = extractHyperlinks(3);

  // Find YouTube URL from hyperlinks
  const youtubeUrls = Object.values(slide3Links).filter(url =>
    url.includes('youtube.com') || url.includes('youtu.be')
  );
  if (youtubeUrls.length > 0) {
    result.lastWeekSong.youtubeUrl = youtubeUrls[0];
  }

  // Parse song title from header text (first paragraph usually contains header)
  // Header format: "♪  This Week's Song — #9585 Hear These Dreams"
  for (const p of slide3Text) {
    const headerMatch = p.match(/(?:This Week.s Song|Song)\s*[—\-]\s*(?:#(\d+)\s+)?(.+)/i);
    if (headerMatch) {
      result.lastWeekSong.title = headerMatch[2].trim();
      if (headerMatch[1]) result.lastWeekSong.number = headerMatch[1];
      break;
    }
  }

  // Source info (usually second line like "TheBibleTellsMeSo.com  |  ...")
  for (const p of slide3Text) {
    if (p.includes('TheBibleTellsMeSo') || p.includes('tbtms')) {
      result.lastWeekSong.source = 'TheBibleTellsMeSo.com';
      break;
    }
    if (p.includes('|') && (p.includes('Tune') || p.includes('Genesis') || p.includes('Song'))) {
      result.lastWeekSong.source = p;
      break;
    }
  }

  // Lyrics — all remaining text paragraphs (skip header, source line, and play button)
  const lyricsStart = slide3Text.findIndex(p =>
    !p.includes('Song') || p.length > 60
  );
  if (lyricsStart >= 0) {
    // Determine layout: if paragraphs contain "Verse" or "Part" labels, it's two-column
    const hasColumns = slide3Text.some(p => /^(Verse|Part)\s*\d/i.test(p));
    if (hasColumns) {
      // Two-column: split based on content grouping
      let currentColumn = 'left';
      for (let i = lyricsStart; i < slide3Text.length; i++) {
        const p = slide3Text[i];
        if (p === '\u25B6') continue; // skip play button
        if (/^Part\s*2/i.test(p)) currentColumn = 'right';
        const isBold = /^(Verse|Part)\s*\d/i.test(p);
        if (currentColumn === 'left') {
          result.lastWeekSong.lyricsLeft.push({ text: p, bold: isBold });
        } else {
          result.lastWeekSong.lyricsRight.push({ text: p, bold: isBold });
        }
      }
    } else {
      // Single column / centered lyrics
      for (let i = lyricsStart; i < slide3Text.length; i++) {
        const p = slide3Text[i];
        if (p === '\u25B6' || p.length < 3) continue;
        result.lastWeekSong.lyrics.push({ text: p, bold: false });
      }
    }
  }

  console.log('  Song title:', result.lastWeekSong.title);
  console.log('  YouTube URL:', result.lastWeekSong.youtubeUrl);
  console.log('  Lyrics paragraphs:', result.lastWeekSong.lyrics.length +
    result.lastWeekSong.lyricsLeft.length + result.lastWeekSong.lyricsRight.length);
}

// ─── Slide 6: Lesson → review content ───
console.log('\nExtracting slide 6 (Lesson)...');
const slide6Xml = getSlideXml(6);
if (slide6Xml) {
  const slide6Text = extractSlideText(slide6Xml);

  // Header contains lesson title: "📖  Lesson — Joseph: Two Dreams..."
  for (const p of slide6Text) {
    const lessonMatch = p.match(/Lesson\s*[—\-]\s*(.+)/i);
    if (lessonMatch) {
      result.lastWeekReview.title = lessonMatch[1].trim();
      break;
    }
  }

  // Scripture from teacher section
  for (const p of slide6Text) {
    const scrMatch = p.match(/(Genesis|Exodus|Matthew|Mark|Luke|John|Acts|Romans|(?:1|2)\s*Corinthians|Galatians|Ephesians|Philippians|Colossians|(?:1|2)\s*Thessalonians|(?:1|2)\s*Timothy|Titus|Philemon|Hebrews|James|(?:1|2)\s*Peter|(?:1|2|3)\s*John|Jude|Revelation)\s+[\d:,;\-\s]+/i);
    if (scrMatch) {
      result.lastWeekReview.scripture = scrMatch[0].trim();
      break;
    }
  }

  // Kids content → becomes review bullets
  const kidsBullets = [];
  let inKidsSection = false;
  for (const p of slide6Text) {
    if (p.includes('For Kids')) { inKidsSection = true; continue; }
    if (p.includes('For Teachers')) { inKidsSection = false; continue; }
    if (inKidsSection && p.length > 20) {
      // Split multi-sentence paragraphs into bullets
      const sentences = p.split(/(?<=[.!?])\s+/).filter(s => s.length > 10);
      kidsBullets.push(...sentences);
    }
  }
  result.lastWeekReview.bullets = kidsBullets.slice(0, 6); // Max 6 bullets
}

// ─── Slide 7: Memory Verse ───
console.log('Extracting slide 7 (Memory Verse)...');
const slide7Xml = getSlideXml(7);
if (slide7Xml) {
  const slide7Text = extractSlideText(slide7Xml);

  // Header: "✠  Memory Verse — Matthew 5:44"
  for (const p of slide7Text) {
    const verseRefMatch = p.match(/Memory Verse\s*[—\-]\s*(.+)/i);
    if (verseRefMatch) {
      result.lastWeekReview.memoryVerse = verseRefMatch[1].trim();
      break;
    }
  }

  // Verse text (usually the quoted text)
  for (const p of slide7Text) {
    if (p.startsWith('"') || p.startsWith('\u201C')) {
      result.lastWeekReview.verseQuote = `${p} \u2014 ${result.lastWeekReview.memoryVerse}`;
      break;
    }
  }

  // Discussion question — look for application text
  for (const p of slide7Text) {
    if (p.length > 40 && !p.startsWith('"') && !p.includes('Memory Verse') && !p.startsWith('\u2014')) {
      result.lastWeekReview.discussion = p;
      break;
    }
  }
}

// Fill in discussion from review slide if not found in verse slide
if (!result.lastWeekReview.discussion && result.lastWeekReview.bullets.length > 0) {
  result.lastWeekReview.discussion = 'What did you learn from last week\'s lesson? Can you share one thing that stood out?';
}

// Save result
fs.writeFileSync(
  path.join(outputDir, 'prev_week.json'),
  JSON.stringify(result, null, 2),
  'utf-8'
);

console.log('\nExtracted previous week data:');
console.log('  Week number:', result.prevWeekNumber);
console.log('  Song title:', result.lastWeekSong.title);
console.log('  Song URL:', result.lastWeekSong.youtubeUrl);
console.log('  Review title:', result.lastWeekReview.title);
console.log('  Review bullets:', result.lastWeekReview.bullets.length);
console.log('  Memory verse:', result.lastWeekReview.memoryVerse);
console.log(`\nSaved to: ${path.join(outputDir, 'prev_week.json')}`);
