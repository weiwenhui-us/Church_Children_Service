/**
 * build_slides.js — Data-driven PptxGenJS builder for Church School slides.
 * Reads a config.json and produces a 10-slide PPTX.
 *
 * Usage: node build_slides.js <config.json>
 */
const path = require('path');
const fs = require('fs');

const configPath = process.argv[2];
if (!configPath) {
  console.error('Usage: node build_slides.js <config.json>');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const dir = path.dirname(path.resolve(configPath));
// Output directory for PPTX and role play scripts (output/ alongside weekly/)
const projectRoot = path.dirname(dir);
const outputDir = path.join(projectRoot, 'output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Resolve pptxgenjs from working directory (where npm install was run)
const pptxgen = require(require.resolve('pptxgenjs', { paths: [dir, process.cwd()] }));

// Logo path — check working dir first, then skill assets
const skillAssets = path.join(__dirname, '..', 'assets');
const logoPath = fs.existsSync(path.join(dir, 'church_logo.png'))
  ? path.join(dir, 'church_logo.png')
  : path.join(skillAssets, 'church_logo.png');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'Children Service';
pptx.title = `Week ${config.weekNumber} - ${config.title.topic}`;

// ─── Color palette ───
const C = {
  blue: '4A90D9', dkBlue: '2C5F8A', ltBlue: 'E8F4FD',
  yellow: 'F5C542', ltYellow: 'FFF8E7',
  green: '6BBF59', dkGreen: '4A8A3A', ltGreen: 'E8F8E0',
  coral: 'E8725A', ltCoral: 'FFF0EC',
  purple: '7B68AE', ltPurple: 'F0E8FF',
  orange: 'E8925A', ltOrange: 'FFF3E0',
  white: 'FFFFFF', gray: '888888', ltGray: 'AAAAAA', dkGray: '444444', midGray: '666666',
  text: '555555'
};

// ─── Shared helpers ───
function addHeader(slide, title, bgColor) {
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.78, fill: { color: bgColor } });
  slide.addText(title, { x: 0.4, y: 0.05, w: 9.2, h: 0.7, color: C.white, fontSize: 22, bold: true, fontFace: 'Arial' });
}

function addFooter(slide, color) {
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 5.3, w: 10, h: 0.33, fill: { color } });
}

function addPlayButton(slide, url) {
  slide.addShape(pptx.shapes.OVAL, { x: 9.05, y: 0.14, w: 0.5, h: 0.5, fill: { color: C.coral }, hyperlink: { url } });
  slide.addText('\u25B6', { x: 9.05, y: 0.14, w: 0.5, h: 0.5, fontSize: 18, color: C.white, align: 'center', valign: 'middle', fontFace: 'Arial', hyperlink: { url } });
}

function addCard(slide, x, y, w, h, accentColor, accentSide) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.white }, rectRadius: 0.15, line: { color: 'DDDDDD', width: 0.5 } });
  if (accentSide === 'left') {
    slide.addShape(pptx.shapes.RECTANGLE, { x, y, w: 0.07, h, fill: { color: accentColor } });
  } else if (accentSide === 'top') {
    slide.addShape(pptx.shapes.RECTANGLE, { x, y, w, h: 0.06, fill: { color: accentColor } });
  }
}

// ═══════════════════════════════════════════════
// SLIDE 1: Title
// ═══════════════════════════════════════════════
const s1 = pptx.addSlide();
s1.background = { fill: C.ltYellow };
s1.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.1, fill: { color: C.blue } });
s1.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 5.2, w: 10, h: 0.35, fill: { color: C.blue } });
s1.addImage({ path: logoPath, x: 4.1, y: 0.24, w: 1.16, h: 1.16 });
s1.addText('Children Service', { x: 1, y: 1.3, w: 8, h: 0.6, fontSize: 34, bold: true, color: C.dkBlue, align: 'center', fontFace: 'Arial' });
s1.addShape(pptx.shapes.RECTANGLE, { x: 4, y: 1.95, w: 2, h: 0.04, fill: { color: C.yellow } });

// Topic — may have subtitle on second line
const topicText = config.title.topicSubtitle
  ? `${config.title.topic}\n${config.title.topicSubtitle}`
  : config.title.topic;
s1.addText(topicText, { x: 1, y: 2.24, w: 8, h: 0.7, fontSize: 18, bold: true, color: C.dkBlue, align: 'center', fontFace: 'Arial', lineSpacingMultiple: 1.3 });
s1.addText(config.title.scripture, { x: 1, y: 3.05, w: 8, h: 0.3, fontSize: 13, color: C.gray, align: 'center', fontFace: 'Arial', italic: true });
s1.addText(config.title.point, { x: 1.5, y: 3.55, w: 7, h: 0.6, fontSize: 12, color: C.coral, align: 'center', fontFace: 'Arial', lineSpacingMultiple: 1.3 });

// ═══════════════════════════════════════════════
// SLIDE 2: Today's Schedule (STATIC)
// ═══════════════════════════════════════════════
const sched = pptx.addSlide();
sched.background = { fill: C.ltBlue };
addHeader(sched, '\uD83D\uDCC5  Today\u2019s Schedule', C.blue);
sched.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 0.95, w: 8.8, h: 4.4, fill: { color: C.white }, rectRadius: 0.15 });
sched.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 0.07, h: 4.4, fill: { color: C.yellow } });

sched.addText('#', { x: 1.0, y: 1.05, w: 0.5, h: 0.35, fontSize: 11, bold: true, color: C.blue, fontFace: 'Arial', align: 'center', valign: 'middle' });
sched.addText('Activity', { x: 1.6, y: 1.05, w: 4.0, h: 0.35, fontSize: 11, bold: true, color: C.blue, fontFace: 'Arial', valign: 'middle' });
sched.addText('Time', { x: 6.5, y: 1.05, w: 2.5, h: 0.35, fontSize: 11, bold: true, color: C.blue, fontFace: 'Arial', align: 'center', valign: 'middle' });
sched.addShape(pptx.shapes.RECTANGLE, { x: 1.0, y: 1.42, w: 8.0, h: 0.02, fill: { color: C.blue } });

const schedItems = [
  { icon: '\uD83C\uDFA8', label: 'Craft', time: '10:00 \u2013 10:30 AM' },
  { icon: '\u266A', label: 'Hymn', time: '10:30 \u2013 11:00 AM' },
  { icon: '\uD83D\uDCD6', label: 'Lesson & Associated Work', time: '11:00 \u2013 11:30 AM' },
  { icon: '\uD83C\uDFC3', label: 'Gym Activities', time: '11:30 \u2013 11:50 AM' },
  { icon: '\uD83C\uDF33', label: 'Outdoor Activities', time: '11:50 AM \u2013 12:15 PM' },
];

let schedY = 1.55;
const rowH = 0.55;
schedItems.forEach((item, i) => {
  if (i % 2 === 0) {
    sched.addShape(pptx.shapes.RECTANGLE, { x: 0.9, y: schedY - 0.02, w: 8.2, h: rowH, fill: { color: 'F4F8FD' } });
  }
  sched.addShape(pptx.shapes.OVAL, { x: 1.05, y: schedY + 0.07, w: 0.36, h: 0.36, fill: { color: C.blue } });
  sched.addText(String(i + 1), { x: 1.05, y: schedY + 0.07, w: 0.36, h: 0.36, fontSize: 12, color: C.white, align: 'center', valign: 'middle', fontFace: 'Arial', bold: true });
  sched.addText(item.icon + '  ' + item.label, { x: 1.6, y: schedY, w: 4.0, h: rowH, fontSize: 15, bold: true, color: C.dkGray, fontFace: 'Arial', valign: 'middle' });
  sched.addText(item.time, { x: 6.5, y: schedY, w: 2.5, h: rowH, fontSize: 14, color: C.text, fontFace: 'Arial', align: 'center', valign: 'middle' });
  schedY += rowH;
});
addFooter(sched, C.yellow);

// ═══════════════════════════════════════════════
// SLIDE 3: This Week's Song
// ═══════════════════════════════════════════════
const s2 = pptx.addSlide();
s2.background = { fill: C.ltBlue };
const songTitle = config.thisWeekSong.number
  ? `\u266A  This Week's Song \u2014 #${config.thisWeekSong.number} ${config.thisWeekSong.title}`
  : `\u266A  This Week's Song \u2014 ${config.thisWeekSong.title}`;
addHeader(s2, songTitle, C.blue);
addPlayButton(s2, config.thisWeekSong.youtubeUrl);
addCard(s2, 0.4, 0.95, 9.2, 4.4, C.yellow, 'left');

// Subtitle line (scripture + tune)
const subtitleParts = [];
if (config.thisWeekSong.scriptureRef) subtitleParts.push(config.thisWeekSong.scriptureRef);
if (config.thisWeekSong.tuneRef) subtitleParts.push('Tune: ' + config.thisWeekSong.tuneRef);
if (subtitleParts.length > 0) {
  s2.addText(subtitleParts.join('  |  '), { x: 0.8, y: 0.98, w: 8.5, h: 0.25, fontSize: 10, italic: true, color: C.gray, fontFace: 'Arial' });
}

// Lyrics — left column
if (config.thisWeekSong.lyricsLeft) {
  const leftRuns = config.thisWeekSong.lyricsLeft.map(line => {
    if (line.bold) return { text: line.text + '\n', options: { bold: true, fontSize: 11, color: C.blue } };
    return { text: line.text + '\n', options: { fontSize: 11, color: C.text } };
  });
  s2.addText(leftRuns, { x: 0.7, y: 1.25, w: 4.2, h: 4.0, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: 1.15 });
}

// Lyrics — right column
if (config.thisWeekSong.lyricsRight) {
  const rightRuns = config.thisWeekSong.lyricsRight.map(line => {
    if (line.bold) return { text: line.text + '\n', options: { bold: true, fontSize: 11, color: C.blue } };
    return { text: line.text + '\n', options: { fontSize: 11, color: C.text } };
  });
  s2.addText(rightRuns, { x: 5.0, y: 1.25, w: 4.4, h: 4.0, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: 1.15 });
}

// Single-column lyrics (for simpler songs)
if (config.thisWeekSong.lyricsCentered) {
  // Count total rendered lines to pick font size that fits the card
  const totalLines = config.thisWeekSong.lyricsCentered.reduce((n, l) => n + (l.text.match(/\n/g) || []).length + 1, 0);
  const cFontLg = totalLines > 10 ? 14 : 18;
  const cFontSm = totalLines > 10 ? 13 : 16;
  const cSpacing = totalLines > 10 ? 1.15 : 1.35;
  const centerRuns = config.thisWeekSong.lyricsCentered.map(line => {
    if (line.bold) return { text: line.text + '\n', options: { bold: true, fontSize: cFontLg, color: C.dkBlue } };
    if (line.emphasis) return { text: line.text + '\n', options: { bold: true, fontSize: cFontLg, color: C.coral } };
    return { text: line.text + '\n', options: { fontSize: cFontSm, color: C.text } };
  });
  s2.addText(centerRuns, { x: 1.0, y: 1.25, w: 8, h: 4.0, fontFace: 'Arial', valign: 'middle', align: 'center', lineSpacingMultiple: cSpacing, fit: 'shrink' });
}

addFooter(s2, C.yellow);

// ═══════════════════════════════════════════════
// SLIDE 4: Last Week's Song
// ═══════════════════════════════════════════════
if (config.lastWeekSong) {
const s3 = pptx.addSlide();
s3.background = { fill: C.ltBlue };
addHeader(s3, `\u266A  Last Week's Song \u2014 ${config.lastWeekSong.title}`, C.blue);
addPlayButton(s3, config.lastWeekSong.youtubeUrl);
addCard(s3, 0.4, 0.95, 9.2, 4.4, C.yellow, 'left');

const lastSongSource = config.lastWeekSong.source || 'Previous Week';
s3.addText(`${lastSongSource}  |  ${config.lastWeekSong.title}`, { x: 0.8, y: 1.0, w: 8.5, h: 0.3, fontSize: 10, italic: true, color: C.gray, fontFace: 'Arial' });

// Last week song lyrics — centered style
if (config.lastWeekSong.lyrics) {
  const totalLines = config.lastWeekSong.lyrics.reduce((n, l) => n + (l.text.match(/\n/g) || []).length + 1, 0);
  const lFontLg = totalLines > 10 ? 14 : 18;
  const lFontSm = totalLines > 10 ? 13 : 16;
  const lSpacing = totalLines > 10 ? 1.15 : 1.35;
  const lyricsRuns = config.lastWeekSong.lyrics.map(line => {
    if (line.bold) return { text: line.text + '\n', options: { fontSize: lFontLg, color: C.dkBlue, bold: true } };
    if (line.emphasis) return { text: line.text, options: { fontSize: lFontLg, color: C.coral, bold: true } };
    return { text: line.text + '\n', options: { fontSize: lFontSm, color: C.text } };
  });
  s3.addText(lyricsRuns, { x: 1.0, y: 1.25, w: 8, h: 4.0, fontFace: 'Arial', valign: 'middle', align: 'center', lineSpacingMultiple: lSpacing, fit: 'shrink' });
}

// Left/right column fallback for last week song
if (config.lastWeekSong.lyricsLeft) {
  const leftRuns = config.lastWeekSong.lyricsLeft.map(line => {
    if (line.bold) return { text: line.text + '\n', options: { bold: true, fontSize: 11, color: C.blue } };
    return { text: line.text + '\n', options: { fontSize: 11, color: C.text } };
  });
  s3.addText(leftRuns, { x: 0.7, y: 1.25, w: 4.2, h: 4.0, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: 1.15 });
}
if (config.lastWeekSong.lyricsRight) {
  const rightRuns = config.lastWeekSong.lyricsRight.map(line => {
    if (line.bold) return { text: line.text + '\n', options: { bold: true, fontSize: 11, color: C.blue } };
    return { text: line.text + '\n', options: { fontSize: 11, color: C.text } };
  });
  s3.addText(rightRuns, { x: 5.0, y: 1.25, w: 4.4, h: 4.0, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: 1.15 });
}

addFooter(s3, C.yellow);
} // end if (config.lastWeekSong)

// ═══════════════════════════════════════════════
// SLIDE 5: Last Week Review
// ═══════════════════════════════════════════════
const s4 = pptx.addSlide();
s4.background = { fill: C.ltBlue };
addHeader(s4, `\uD83D\uDCD6  Last Week Review \u2014 Week ${config.lastWeekReview.weekNumber}: ${config.lastWeekReview.title}`, C.blue);
addCard(s4, 0.4, 0.95, 9.2, 4.4, C.yellow, 'top');
s4.addText(`${config.lastWeekReview.scripture}  |  Memory Verse: ${config.lastWeekReview.memoryVerse}`, { x: 0.8, y: 1.1, w: 8.5, h: 0.3, fontSize: 11, italic: true, color: C.gray, fontFace: 'Arial' });

// Dynamic layout — stack elements to avoid overlap
// Available area: y=1.5 to y=5.25 (footer at 5.3) = 3.75" total
const bulletCount = config.lastWeekReview.bullets.length;
const hasDiscussion = config.lastWeekReview.discussion && config.lastWeekReview.discussion.length > 0;
const hasVerse = config.lastWeekReview.verseQuote && config.lastWeekReview.verseQuote.length > 0;
const discussionLen = hasDiscussion ? config.lastWeekReview.discussion.length : 0;

// Compute heights: give bullets proportional space, reserve room for bottom elements
const testimonyH = 0.3;
const discussionH = discussionLen > 200 ? 0.7 : discussionLen > 80 ? 0.5 : 0.35;
const verseH = hasVerse ? 0.3 : 0;
const bottomH = testimonyH + 0.05 + (hasDiscussion ? discussionH + 0.05 : 0) + verseH;
const bulletH = Math.min(3.75 - bottomH, 2.8); // cap bullets, leave room for bottom
const bulletFontSize = bulletCount > 5 ? 12 : 14;
const bulletSpacing = bulletCount > 5 ? 1.25 : 1.5;

const reviewBullets = config.lastWeekReview.bullets.map(b => ({
  text: b, options: { fontSize: bulletFontSize, color: C.dkGray, bullet: true }
}));
s4.addText(reviewBullets, { x: 0.8, y: 1.5, w: 8.3, h: bulletH, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: bulletSpacing, paraSpaceAfter: 4, fit: 'shrink' });

let nextY = 1.5 + bulletH + 0.05;

s4.addText('\uD83C\uDF1F Please share your small testimony from practicing last week\u2019s lesson!', { x: 0.8, y: nextY, w: 8.3, h: testimonyH, fontSize: 11, bold: true, color: C.green, fontFace: 'Arial' });
nextY += testimonyH + 0.05;

if (hasDiscussion) {
  const discFontSize = discussionLen > 200 ? 11 : 13;
  s4.addText([
    { text: '\uD83D\uDCA1 Discussion: ', options: { bold: true, fontSize: discFontSize, color: C.coral } },
    { text: config.lastWeekReview.discussion, options: { fontSize: discFontSize, color: C.coral } },
  ], { x: 0.8, y: nextY, w: 8.3, h: discussionH, fontFace: 'Arial', fit: 'shrink' });
  nextY += discussionH + 0.05;
}

if (hasVerse) {
  s4.addText(config.lastWeekReview.verseQuote, { x: 0.8, y: nextY, w: 8.3, h: verseH, fontSize: 11, italic: true, color: C.blue, fontFace: 'Arial' });
}
addFooter(s4, C.yellow);

// ═══════════════════════════════════════════════
// SLIDE 6+: Lesson — Kids (multi-slide) + Teacher
// ═══════════════════════════════════════════════
// Lesson pages: config.lesson.pages is an array of { kidsContent, image? }
// If not provided, fall back to single-page config.lesson.kidsContent
const lessonUrl = config.lesson.lessonUrl;
const lessonPages = config.lesson.pages || [{ kidsContent: config.lesson.kidsContent }];

lessonPages.forEach((page, pageIdx) => {
  const ls = pptx.addSlide();
  ls.background = { fill: C.ltYellow };
  const pageLabel = lessonPages.length > 1 ? ` (${pageIdx + 1}/${lessonPages.length})` : '';
  addHeader(ls, `\uD83D\uDCD6  Lesson \u2014 ${config.title.topic}${pageLabel}`, C.blue);

  // Determine layout: if page has image, use image+text; otherwise full-width kids content
  const hasImage = page.image && page.image.path;
  const kidsW = hasImage ? 5.8 : (pageIdx === 0 ? 4.6 : 9.2);
  const kidsX = 0.25;

  // Kids content card — shorter when practice point is on this page
  const hasPractice = pageIdx === lessonPages.length - 1 && config.lesson.practicePoint;
  const kidsCardH = hasPractice ? 3.8 : 4.35;
  ls.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: kidsX, y: 0.95, w: kidsW, h: kidsCardH, fill: { color: C.white }, rectRadius: 0.15 });
  ls.addShape(pptx.shapes.RECTANGLE, { x: kidsX, y: 0.95, w: kidsW, h: 0.06, fill: { color: C.blue } });
  ls.addText('\uD83D\uDCD6 For Kids', { x: kidsX + 0.2, y: 1.05, w: 4, h: 0.35, fontSize: 15, bold: true, color: C.blue, fontFace: 'Arial' });

  const kidsTextH = kidsCardH - 0.6;
  const kidsRuns = page.kidsContent.map(para => {
    if (para.bold) return { text: para.text + '\n', options: { fontSize: 11, color: para.color || C.dkGray, bold: true } };
    if (para.emphasis) return { text: para.text + '\n', options: { fontSize: 11, color: C.coral, bold: true } };
    return { text: para.text + '\n', options: { fontSize: 11, color: C.dkGray } };
  });
  ls.addText(kidsRuns, { x: kidsX + 0.2, y: 1.45, w: kidsW - 0.4, h: kidsTextH, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: 1.2, autoFit: true });

  // Image (if provided) — right side of kids content
  if (hasImage) {
    const imgX = kidsX + kidsW + 0.15;
    const imgW = 9.75 - kidsX - kidsW - 0.15;
    const imgCardH = kidsCardH;
    ls.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: imgX, y: 0.95, w: imgW, h: imgCardH, fill: { color: C.white }, rectRadius: 0.15, line: { color: 'DDDDDD', width: 0.5 } });
    ls.addImage({ path: page.image.path, x: imgX + 0.1, y: 1.05, w: imgW - 0.2, h: imgCardH - 1.0, sizing: { type: 'contain' } });
    if (page.image.caption) {
      ls.addText(page.image.caption, { x: imgX + 0.1, y: 0.95 + imgCardH - 0.4, w: imgW - 0.2, h: 0.3, fontSize: 9, italic: true, color: C.gray, align: 'center', fontFace: 'Arial' });
    }
  }

  // Teacher column — only on first lesson page, only if no image on that page
  if (pageIdx === 0 && !hasImage) {
    ls.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 5.15, y: 0.95, w: 4.6, h: 4.35, fill: { color: C.white }, rectRadius: 0.15 });
    ls.addShape(pptx.shapes.RECTANGLE, { x: 5.15, y: 0.95, w: 4.6, h: 0.06, fill: { color: C.coral } });
    ls.addText('\uD83D\uDCCB For Teachers', { x: 5.35, y: 1.05, w: 4, h: 0.35, fontSize: 15, bold: true, color: C.coral, fontFace: 'Arial' });
    ls.addText(config.lesson.teacherScripture, { x: 5.35, y: 1.45, w: 4, h: 0.25, fontSize: 10, italic: true, color: C.gray, fontFace: 'Arial' });
    ls.addText('Full lesson with story sample,\nstoryteller instructions,\nand teaching notes:', { x: 5.35, y: 1.8, w: 4, h: 0.7, fontSize: 12, color: C.dkGray, fontFace: 'Arial', lineSpacingMultiple: 1.3 });
    ls.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.3, y: 2.7, w: 2.1, h: 2.1, fill: { color: 'FFF0EC' }, rectRadius: 0.15, line: { color: C.coral, width: 1 }, hyperlink: { url: lessonUrl } });
    ls.addText('\uD83D\uDD17', { x: 6.3, y: 2.75, w: 2.1, h: 0.8, fontSize: 36, color: C.coral, align: 'center', fontFace: 'Arial', hyperlink: { url: lessonUrl } });
    ls.addText('Full Lesson', { x: 6.3, y: 3.45, w: 2.1, h: 0.3, fontSize: 11, bold: true, color: C.coral, align: 'center', fontFace: 'Arial', hyperlink: { url: lessonUrl } });
    ls.addText('Click to open', { x: 6.3, y: 3.75, w: 2.1, h: 0.3, fontSize: 10, color: C.midGray, align: 'center', fontFace: 'Arial', italic: true, hyperlink: { url: lessonUrl } });
  }

  // Practice point — on the last lesson page, positioned below the shortened card
  if (hasPractice) {
    const ppY = 0.95 + kidsCardH + 0.1;
    ls.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: ppY, w: 9.2, h: 0.4, fill: { color: C.ltGreen }, rectRadius: 0.1 });
    ls.addText([
      { text: '\uD83C\uDF1F This Week\u2019s Practice: ', options: { bold: true, fontSize: 11, color: C.dkGreen } },
      { text: config.lesson.practicePoint, options: { fontSize: 11, color: C.dkGreen } },
    ], { x: 0.6, y: ppY + 0.02, w: 8.8, h: 0.36, fontFace: 'Arial' });
  }

  addFooter(ls, C.yellow);
});

// ═══════════════════════════════════════════════
// SLIDE 7: Memory Verse
// ═══════════════════════════════════════════════
const s6 = pptx.addSlide();
s6.background = { fill: C.ltBlue };
addHeader(s6, `\u2720  Memory Verse \u2014 ${config.memoryVerse.reference}`, C.blue);
s6.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 1.0, y: 1.3, w: 8, h: 3.6, fill: { color: C.white }, rectRadius: 0.2, line: { color: C.yellow, width: 1.5 } });
s6.addText(`"${config.memoryVerse.text}"`, { x: 1.3, y: 1.6, w: 7.4, h: 1.6, fontSize: 26, bold: true, color: C.dkBlue, align: 'center', fontFace: 'Arial', lineSpacingMultiple: 1.3 });
s6.addText(`\u2014 ${config.memoryVerse.reference}`, { x: 1.3, y: 3.3, w: 7.4, h: 0.5, fontSize: 18, color: C.gray, align: 'center', fontFace: 'Arial' });
s6.addText(config.memoryVerse.application, { x: 1.3, y: 4.0, w: 7.4, h: 0.6, fontSize: 12, color: C.text, align: 'center', fontFace: 'Arial', italic: true, lineSpacingMultiple: 1.3 });
addFooter(s6, C.yellow);

// ═══════════════════════════════════════════════
// SLIDE 8: Activity
// ═══════════════════════════════════════════════
const s7 = pptx.addSlide();
s7.background = { fill: C.ltYellow };
addHeader(s7, `\u2B50  Activity \u2014 "${config.activity.title}" (${config.activity.duration})`, C.blue);
addCard(s7, 0.4, 0.95, 9.2, 4.35, C.yellow, 'left');

s7.addText(config.activity.subtitle || config.activity.title, { x: 0.8, y: 1.0, w: 8.5, h: 0.35, fontSize: 16, bold: true, color: C.blue, fontFace: 'Arial' });

let actY = 1.4;
if (config.activity.format) {
  s7.addText([
    { text: 'Format: ', options: { bold: true, fontSize: 12, color: C.midGray } },
    { text: config.activity.format, options: { fontSize: 12, color: C.midGray } },
  ], { x: 0.8, y: actY, w: 8.5, h: 0.3, fontFace: 'Arial' });
  actY += 0.3;
}

if (config.activity.materials) {
  s7.addText([
    { text: 'Materials: ', options: { bold: true, fontSize: 12, color: C.midGray } },
    { text: config.activity.materials, options: { fontSize: 12, color: C.midGray } },
  ], { x: 0.8, y: actY, w: 8.5, h: 0.3, fontFace: 'Arial' });
  actY += 0.35;
}

// Support both formats: {name, description} (structured) and {text, bold} (simple list)
const actParts = config.activity.parts.map(part => {
  if (part.name != null) {
    return [
      { text: `${part.name}:\n`, options: { bold: true, fontSize: 12, color: C.dkGray } },
      { text: part.description + '\n\n', options: { fontSize: 11, color: C.dkGray } },
    ];
  }
  return [{ text: part.text + '\n', options: { bold: !!part.bold, fontSize: 11, color: C.dkGray } }];
}).flat();
s7.addText(actParts, { x: 0.8, y: actY, w: 8.5, h: 5.2 - actY, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: 1.2, fit: 'shrink' });

// Role Play Script — optional, generate PDF and embed as linked icon on a slide
if (config.activity.rolePlayScript) {
  // Week-specific filenames to avoid overwriting previous weeks' scripts
  const scriptBaseName = `role_play_script_Week${config.weekNumber}`;
  const scriptPdfPath = path.join(outputDir, `${scriptBaseName}.pdf`);
  try {
    // Build script text for PDF generation
    let scriptText = `Role Play Script — "${config.activity.title}"\n`;
    scriptText += '='.repeat(50) + '\n\n';
    config.activity.rolePlayScript.forEach(line => {
      if (line.direction) scriptText += `  [${line.text}]\n\n`;
      else if (line.role) scriptText += `${line.role}: `;
      else scriptText += `${line.text}\n`;
    });
    const scriptHtmlPath = path.join(outputDir, `${scriptBaseName}.html`);
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Role Play Script — ${config.activity.title}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 7.5in; margin: 0.5in auto; font-size: 12pt; line-height: 1.6; }
  h1 { color: #4A90D9; font-size: 18pt; border-bottom: 2px solid #F5C542; padding-bottom: 8px; }
  .direction { color: #888; font-style: italic; margin: 8px 0; }
  .role { color: #2C5F8A; font-weight: bold; }
  .dialogue { margin-bottom: 4px; }
  @media print { body { margin: 0.5in; } }
</style></head><body>
<h1>\uD83C\uDFAD Role Play Script — "${config.activity.title}"</h1>
<p style="color:#7B68AE;font-style:italic;">\uD83D\uDCDD Print this script and hand out to the kids!</p>\n`;
    config.activity.rolePlayScript.forEach(line => {
      if (line.direction) html += `<p class="direction">[${line.text}]</p>\n`;
      else if (line.role) html += `<span class="role">${line.role}: </span>`;
      else html += `<span class="dialogue">${line.text}</span><br>\n`;
    });
    html += '</body></html>';
    fs.writeFileSync(scriptHtmlPath, html, 'utf-8');
    console.log('Role play script HTML saved: ' + scriptHtmlPath);

    // Generate PDF from the HTML using Playwright (via helper script)
    try {
      const { execSync } = require('child_process');
      const pdfPath = path.join(outputDir, `${scriptBaseName}.pdf`);
      const helperPath = path.join(dir, '_gen_pdf.js');
      fs.writeFileSync(helperPath, `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('file:///' + process.argv[2].replace(/\\\\/g, '/'), { waitUntil: 'networkidle' });
  await page.pdf({ path: process.argv[3], format: 'Letter', margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' } });
  await browser.close();
})();
`);
      execSync(`node "${helperPath}" "${scriptHtmlPath}" "${pdfPath}"`, { cwd: dir, timeout: 30000, stdio: 'inherit' });
      fs.unlinkSync(helperPath);
      console.log('Role play script PDF saved: ' + pdfPath);
    } catch (pdfErr) {
      console.error('Warning: Could not generate PDF:', pdfErr.message);
      console.log('HTML file is still available for manual printing.');
    }
  } catch (e) {
    console.error('Warning: Could not generate script file:', e.message);
  }

  // Create slide with embedded link to the script file
  const rpSlide = pptx.addSlide();
  rpSlide.background = { fill: C.ltYellow };
  addHeader(rpSlide, `\uD83C\uDFAD  Role Play Script \u2014 "${config.activity.title}"`, C.blue);

  // Left side: script preview (condensed, fits in card)
  addCard(rpSlide, 0.25, 0.95, 5.8, 4.35, C.purple, 'left');
  rpSlide.addText('\uD83D\uDCDD Script Preview', { x: 0.5, y: 1.0, w: 5.3, h: 0.3, fontSize: 14, bold: true, color: C.purple, fontFace: 'Arial' });
  const previewRuns = config.activity.rolePlayScript.slice(0, 20).map(line => {
    if (line.role) return { text: `${line.role}: `, options: { bold: true, fontSize: 9, color: C.dkBlue } };
    if (line.direction) return { text: `[${line.text}]\n`, options: { italic: true, fontSize: 8, color: C.gray } };
    return { text: line.text + '\n', options: { fontSize: 9, color: C.dkGray } };
  });
  rpSlide.addText(previewRuns, { x: 0.5, y: 1.35, w: 5.3, h: 3.85, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: 1.15 });

  // Right side: print instructions + icon
  rpSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.25, y: 0.95, w: 3.5, h: 4.35, fill: { color: C.white }, rectRadius: 0.15 });
  rpSlide.addShape(pptx.shapes.RECTANGLE, { x: 6.25, y: 0.95, w: 3.5, h: 0.06, fill: { color: C.purple } });
  rpSlide.addText('\uD83D\uDDA8\uFE0F Print for Kids', { x: 6.45, y: 1.1, w: 3.1, h: 0.35, fontSize: 15, bold: true, color: C.purple, fontFace: 'Arial' });
  rpSlide.addText('Open the PDF file\nin the output/ folder\nand print for kids:', { x: 6.45, y: 1.55, w: 3.1, h: 0.7, fontSize: 12, color: C.dkGray, fontFace: 'Arial', lineSpacingMultiple: 1.3 });
  // Large print icon box
  rpSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.9, y: 2.5, w: 2.2, h: 2.2, fill: { color: C.ltPurple }, rectRadius: 0.15, line: { color: C.purple, width: 1 } });
  rpSlide.addText('\uD83D\uDCC4', { x: 6.9, y: 2.55, w: 2.2, h: 0.9, fontSize: 40, color: C.purple, align: 'center', fontFace: 'Arial' });
  rpSlide.addText('Role Play Script', { x: 6.9, y: 3.4, w: 2.2, h: 0.3, fontSize: 11, bold: true, color: C.purple, align: 'center', fontFace: 'Arial' });
  rpSlide.addText(`${scriptBaseName}.pdf`, { x: 6.9, y: 3.7, w: 2.2, h: 0.25, fontSize: 9, color: C.midGray, align: 'center', fontFace: 'Arial', italic: true });
  rpSlide.addText('Open \u2192 Print \u2192 Hand out!', { x: 6.9, y: 4.0, w: 2.2, h: 0.25, fontSize: 10, color: C.purple, align: 'center', fontFace: 'Arial' });

  addFooter(rpSlide, C.yellow);
}

addFooter(s7, C.yellow);

// ═══════════════════════════════════════════════
// SLIDE 9: Gym Activities (2 options)
// ═══════════════════════════════════════════════
const s8 = pptx.addSlide();
s8.background = { fill: C.ltYellow };
addHeader(s8, '\uD83C\uDFC3  Gym Activities (~10 kids, ~20 min each)', C.blue);

// Helper for gym option column — width and position are parameters
function addGymOption(slide, opt, label, x, colW, descH) {
  const w = colW || 4.6;
  const dh = descH || 3.2;
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y: 0.95, w, h: 4.35, fill: { color: C.white }, rectRadius: 0.15 });
  slide.addShape(pptx.shapes.RECTANGLE, { x, y: 0.95, w, h: 0.06, fill: { color: C.yellow } });
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: x + 0.15, y: 1.1, w: 1.3, h: 0.28, fill: { color: C.blue }, rectRadius: 0.14 });
  slide.addText(label, { x: x + 0.15, y: 1.1, w: 1.3, h: 0.28, fontSize: 10, color: C.white, align: 'center', fontFace: 'Arial', bold: true });
  slide.addText(`"${opt.title}"`, { x: x + 0.15, y: 1.5, w: w - 0.3, h: 0.35, fontSize: 14, bold: true, color: C.dkBlue, fontFace: 'Arial' });

  const descRuns = opt.description.map(d => {
    if (d.bold) return { text: d.text, options: { bold: true, fontSize: 10, color: C.midGray } };
    return { text: d.text, options: { fontSize: 10, color: d.isIntro ? C.dkGray : C.midGray } };
  });
  slide.addText(descRuns, { x: x + 0.15, y: 1.9, w: w - 0.3, h: dh, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: 1.1 });
}

// Layout depends on whether movie viewing option exists
if (config.gym.movieViewing) {
  // 3-column layout: Option A, Option B, Option C (Movie)
  const colW = 3.1;
  addGymOption(s8, config.gym.optionA, 'Option A', 0.2, colW, 3.2);
  addGymOption(s8, config.gym.optionB, 'Option B', 3.45, colW, 3.2);

  // Option C: Movie Viewing
  const mv = config.gym.movieViewing;
  const cx = 6.7;
  s8.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: cx, y: 0.95, w: colW, h: 4.35, fill: { color: C.white }, rectRadius: 0.15 });
  s8.addShape(pptx.shapes.RECTANGLE, { x: cx, y: 0.95, w: colW, h: 0.06, fill: { color: C.purple } });
  s8.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: cx + 0.15, y: 1.1, w: 1.3, h: 0.28, fill: { color: C.purple }, rectRadius: 0.14 });
  s8.addText('Option C', { x: cx + 0.15, y: 1.1, w: 1.3, h: 0.28, fontSize: 10, color: C.white, align: 'center', fontFace: 'Arial', bold: true });
  s8.addText('\uD83C\uDFAC Movie Viewing', { x: cx + 0.15, y: 1.5, w: colW - 0.3, h: 0.35, fontSize: 14, bold: true, color: C.purple, fontFace: 'Arial' });
  s8.addText(`"${mv.title}"`, { x: cx + 0.15, y: 1.9, w: colW - 0.3, h: 0.3, fontSize: 12, bold: true, color: C.dkBlue, fontFace: 'Arial' });
  if (mv.description) {
    s8.addText(mv.description, { x: cx + 0.15, y: 2.25, w: colW - 0.3, h: 0.8, fontSize: 10, color: C.midGray, fontFace: 'Arial', lineSpacingMultiple: 1.2 });
  }
  // Play button for movie — centered in column
  const mvUrl = mv.url || mv.youtubeUrl;
  if (mvUrl) {
    const btnX = cx + (colW - 1.0) / 2;
    s8.addShape(pptx.shapes.OVAL, { x: btnX, y: 3.2, w: 1.0, h: 1.0, fill: { color: C.coral }, hyperlink: { url: mvUrl } });
    s8.addText('\u25B6', { x: btnX, y: 3.2, w: 1.0, h: 1.0, fontSize: 32, color: C.white, align: 'center', valign: 'middle', fontFace: 'Arial', hyperlink: { url: mvUrl } });
    s8.addText('Click to play', { x: cx + 0.15, y: 4.3, w: colW - 0.3, h: 0.25, fontSize: 9, italic: true, color: C.midGray, align: 'center', fontFace: 'Arial' });
  }
} else {
  // 2-column layout (no movie)
  addGymOption(s8, config.gym.optionA, 'Option A', 0.25, 4.6, 3.2);
  addGymOption(s8, config.gym.optionB, 'Option B', 5.15, 4.6, 3.2);
}

addFooter(s8, C.yellow);

// ═══════════════════════════════════════════════
// SLIDE 10: Outdoor Activities
// ═══════════════════════════════════════════════
const s9 = pptx.addSlide();
s9.background = { fill: C.ltBlue };
addHeader(s9, '\uD83C\uDF33  Outdoor Activities', C.blue);
addCard(s9, 0.4, 0.95, 9.2, 3.8, C.yellow, 'left');

s9.addText('Playground + Alternative Activity', { x: 0.8, y: 1.05, w: 8.5, h: 0.35, fontSize: 17, bold: true, color: C.dkBlue, fontFace: 'Arial' });
s9.addText([
  { text: 'Regular: ', options: { bold: true, fontSize: 13, color: C.dkGray } },
  { text: 'Slides, Swings, Free play on playground equipment', options: { fontSize: 13, color: C.dkGray } },
], { x: 0.8, y: 1.5, w: 8.5, h: 0.3, fontFace: 'Arial' });

const outdoorRuns = config.outdoor.alternative.description.map(d => {
  if (d.bold) return { text: d.text, options: { bold: true, fontSize: d.isTitle ? 14 : 12, color: d.isTitle ? C.dkBlue : C.dkGray } };
  return { text: d.text, options: { fontSize: 12, color: d.isMaterials ? C.midGray : C.dkGray } };
});
s9.addText(outdoorRuns, { x: 0.8, y: 1.9, w: 8.5, h: 2.3, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: 1.2 });

// Tip box
s9.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 4.3, w: 8.5, h: 0.5, fill: { color: C.ltBlue }, rectRadius: 0.1 });
s9.addText([
  { text: 'Tip: ', options: { bold: true, fontSize: 12, color: C.dkBlue } },
  { text: config.outdoor.tip, options: { fontSize: 12, color: C.dkBlue } },
], { x: 1.0, y: 4.35, w: 8.1, h: 0.4, fontFace: 'Arial' });
addFooter(s9, C.yellow);

// ─── Save ───
const outName = config.outputFilename || `Week${config.weekNumber}_slides.pptx`;
const outPath = path.join(outputDir, outName);

// Archive config.json alongside the PPTX for future rebuilds
const configArchiveName = `Week${config.weekNumber}_config.json`;
fs.writeFileSync(path.join(outputDir, configArchiveName), JSON.stringify(config, null, 2), 'utf-8');
console.log('Config archived: ' + configArchiveName);

pptx.writeFile({ fileName: outPath }).then(() => {
  console.log('Created: ' + outPath);
}).catch(e => { console.error(e); process.exit(1); });
