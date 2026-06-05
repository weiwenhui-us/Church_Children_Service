---
name: church-school-slides
description: Generate weekly church school (Children Service) slide decks as PPTX using PptxGenJS. Triggers on requests to create Sunday school slides, church school presentations, children service slides, or weekly lesson slide decks.
---

# Church School Weekly Slide Deck Generator

Generate a 10-13 slide PPTX for weekly Children Service at The Church in Basking Ridge using PptxGenJS (Node.js).

## User Inputs

Only **two inputs** are needed each week:

1. **Current week's lesson URL** — from `https://children.churchinanaheim.org/`
   - Example: `https://children.churchinanaheim.org/intermediate-level-block-3-week-25.html`
2. **Last week's PPTX file path** — the slide deck from the previous week
   - Example: `output/Week24_Joseph_TwoDreams.pptx`

Everything else is derived automatically.

## Slide Structure (10+ slides, fixed order)

| # | Slide | Content Source |
|---|-------|---------------|
| 1 | Title | Scraped from lesson page |
| 2 | Today's Schedule | **Static** (never changes) |
| 3 | This Week's Song | Song discovery workflow |
| 4 | Last Week's Song | Extracted from previous PPTX slide 3 |
| 5 | Last Week Review | Extracted from previous PPTX + testimony sharing prompt |
| 6-8 | Lesson (2-3 pages) | Scraped + Claude summary + images + practice point |
| N | Memory Verse | Scraped from lesson page |
| N+1 | Activity | Claude generates (+ optional Role Play Script slide) |
| N+2 | Gym Activities | Claude generates + optional Option C: TBTMS Movie Viewing |
| N+3 | Outdoor Activities | Claude generates from lesson topic |

**Note**: Slide count varies (10-13) depending on number of lesson pages and whether a role play script is included.

## Project Directory

Project home: `C:\Users\wenhui.wei\OneDrive - Regeneron Pharmaceuticals, Inc\Sunday Children Service\`

```
Sunday Children Service/
├── scripts/          # build_slides.js, extract_prev.js, find_song.js, scrape_lesson.js
├── assets/           # church_logo.png
├── output/           # generated PPTX files (WeekNN_Topic.pptx)
├── weekly/           # temp working files (scraped data, screenshots, config.json)
├── node_modules/     # pptxgenjs, adm-zip, playwright
└── CLAUDE.md
```

- **Scripts** live in `scripts/` (not in the skill directory)
- **Temp files** (lesson_data.json, prev_week.json, screenshots) go in `weekly/`
- **Output PPTX** goes to `output/`
- **Last week's PPTX** is always in `output/`

## Complete Workflow

### Step 1: Parse the Lesson URL

Extract from the URL pattern: `https://children.churchinanaheim.org/[LEVEL]-level-block-[BLOCK]-week-[WEEK].html`

```javascript
// Example: intermediate-level-block-3-week-25.html
// → level: "intermediate", block: 3, weekNumber: 25
const match = url.match(/(\w+)-level-block-(\d+)-week-(\d+)/);
const level = match[1];    // "intermediate"
const block = match[2];    // "3"
const weekNumber = match[3]; // "25"
```

The level is configurable: elementary, intermediate, advanced, sixth-grade.

### Step 2: Scrape Current Lesson Page

Run `scripts/scrape_lesson.js` from the project directory:

```bash
node scripts/scrape_lesson.js "<LESSON_URL>" "weekly"
```

This produces `lesson_data.json` in the working directory containing:
- Page title / lesson topic
- Scripture references
- Full story text
- Memory verse (if found on page)
- Any song references on the page

**If the scraper cannot find structured content**, fall back to taking a full-page screenshot and extracting content manually from the screenshot.

### Step 3: Extract Previous Week's Content

Run `scripts/extract_prev.js` with the previous PPTX path:

```bash
node scripts/extract_prev.js "<PREV_PPTX_PATH>" "weekly"
```

This produces `prev_week.json` containing:
- **Last week's song** (from slide 3 "This Week's Song"):
  - Title, lyrics, YouTube URL, source info
- **Last week's review content** (from slides 5-7):
  - Lesson title, scripture, review bullets
  - Discussion question
  - Memory verse text and reference

### Step 4: Song Discovery for This Week

Run the song discovery workflow to find a song matching the current lesson topic:

```bash
node scripts/find_song.js "<TOPIC_KEYWORDS>" "weekly"
```

**Song Discovery Priority (MUST follow this order):**

#### Priority 1: TheBibleTellsMeSo.com Website (Logged In)

- **URL**: `https://www.thebibletellsmeso.com/`
- **Login**: Staff Login at `/account/staff-welcome`
  - Email: `churchinbaskingridge@gmail.com`
  - Password: `r&vkKDVDqlY5Xp`
  - Login uses Wix popup — submit with Enter key (not click) to avoid overlay blocking
- **Search**: Navigate to `/all-audio`, use the search box "Search all TBTMS Audio" with topic keywords
- **Browse by Bible book**: `/allsongs` has albums organized by book (e.g., "Sing about Genesis", "Sing about Exodus")
  - Each album has tabs: Audio, Video, Tap and Sing, Piano, Guitar
- **Lyrics**: No plain-text lyrics pages. Check `/bss-lyrics-videos` for lyrics videos, or extract lyrics from the video content
- **What to capture**: Song title, album name, and any associated YouTube video URL
- Take screenshots of search results and song pages for verification
- **MUST have actual singing** (not just background music or instruments)

#### Priority 2: TheBibleTellsMeSo YouTube Channel

- **Channel URL**: `https://www.youtube.com/@thebibletellsmeso`
- **Search URL**: `https://www.youtube.com/@thebibletellsmeso/search?query=[TOPIC]`
- Navigate with Playwright, wait 3s for results to load
- Extract video titles and URLs: `a#video-title-link` or `a#video-title`
- **Video URL formats**:
  - Full: `https://www.youtube.com/watch?v=[ID]`
  - Shorts: `https://www.youtube.com/shorts/[ID]`
- Prefer full videos over Shorts (but Shorts are acceptable)
- Take a screenshot of the search results for verification
- **MUST have actual singing** (not just background music or instruments)

#### Priority 3: Song Repository

- **Base URL**: `http://173.68.175.102/children_song.asp`
- **All songs**: `http://173.68.175.102/Children_song.asp?req_type=CAT&req_no=ALL_AB`
- **By category**: `http://173.68.175.102/Children_song.asp?req_type=CAT&req_no=[CAT_ID]`
  - Bible story: `req_no=23`
  - His love and care: `req_no=9`
  - Love and consecration: `req_no=13`
  - Following the Lord: `req_no=4`
  - Obedience: `req_no=14`
- **By source/CD**: `http://173.68.175.102/Children_song.asp?req_type=SOURCE&req_no=[SRC_ID]`

**Song Verification (REQUIRED for every candidate):**

1. **Check lyrics exist**: `GET http://173.68.175.102/Children_song.asp?req_type=SHOW&req_no=[SONG_ID]`
   - Body text must be > 200 characters (not just navigation text)
   - Extract title from first substantive line

2. **Check audio exists**: `GET http://173.68.175.102/Children_song.asp?req_type=Play&req_no=[SONG_ID]`
   - Look for `.mp3`, `.wav`, `.mid` references in page source
   - Check for `<audio>`, `<embed>`, `<bgsound>` elements
   - Verify NO error message like "Music file ... does not exists!"
   - Take a screenshot of the Play page

3. **Verify actual singing**: Screenshot the Play page. Songs with ONLY instrumental music (no vocals) are NOT acceptable. If unsure, reject and move to next candidate.

4. **On SHOW page**, check for "play Song" or "Play Song" link — if absent, audio likely unavailable.

#### Priority 4: YouTube General Search

- **Search URL**: `https://www.youtube.com/results?search_query=[TOPIC]+children+bible+song+singing`
- Extract first 5-10 results
- Prefer channels known for children's Christian content
- Must have vocal singing

**Song output** → `song_data.json`:
```json
{
  "source": "tbtms-website|thebibletellsmeso|repository|youtube",
  "title": "Song Title",
  "number": "9585",
  "youtubeUrl": "https://...",
  "lyrics": { "left": [...], "right": [...] },
  "scriptureRef": "Genesis 37:1-36",
  "tuneRef": "I Love the Mountains"
}
```

**IMPORTANT**: Present song candidates to the user with screenshots before finalizing. The user must approve the song choice.

### Step 4b: Search for Lesson Images

Use Playwright to find kid-appropriate Bible story illustrations for the lesson slides:

- **FreeBibleImages.org**: Search `https://www.freebibleimages.org/search/?q=[TOPIC]` for illustrations
- **Other free sources**: Sweet Publishing (via Wikimedia Commons), Bible Illustrations (public domain)
- **Rules**:
  - **NO images of Jesus** — never include depictions of Jesus Christ
  - Images must be kid-appropriate (no violence, no scary imagery)
  - Prefer colorful illustrations over photographs
  - Download images to `weekly/` directory
- Save 1-2 images per lesson for use across the lesson slides

### Step 4c: Search for TBTMS Videos (for Movie Viewing)

Search for story/teaching videos matching the lesson topic:

- **TBTMS YouTube channel** (preferred — no login needed):
  - Search `https://www.youtube.com/@thebibletellsmeso/search?query=[TOPIC]`
  - Look for story videos (narrated Bible stories) matching the week's scripture
  - These are typically 3-7 minute videos narrating specific Genesis/Exodus/etc. chapters
- **TBTMS website** (`/all-videos` requires login):
  - Log in first at `/account/staff-welcome`
  - Navigate to `/all-videos` and search by topic
  - Browse category dropdown: Stories Videos, Learning Videos
- If a relevant video is found:
  - Capture title, YouTube URL, and brief description
  - This will be used as "Option C: Movie Viewing" on the Gym slide (3-column layout)

### Step 5: Generate Content with Claude

Using the scraped lesson content, generate:

1. **Kids-friendly lesson summary** — Split across 2-3 pages for detail. Include Bible story, testimony/application story, and practical points. End with a bold moral/application in coral color.
   - **Page 1**: Bible story retold for kids (with image if available)
   - **Page 2**: Deeper details, testimony story, or character study (with image if available)
   - **Page 3** (optional): Additional content if the story is long
   - Each page has `kidsContent` array and optional `image` object

2. **This Week's Practice Point** — A specific, actionable practice for kids to do during the week, so they can share a small testimony next week. (e.g., "This week, try to trust God when something unexpected happens, and be ready to share your story!")

3. **Title slide content**:
   - Topic (main title, may have subtitle on second line)
   - Point/application (1-2 sentences)

4. **Memory verse application** — 1-2 sentences connecting the verse to the lesson story

5. **Activity (15-20 min)** — Classroom activity themed to the lesson:
   - Variety of formats: puzzle, spinner, Q&A, role play, fill-in-blank, verse dictation
   - Include materials list
   - **If role play**: Write a full **Role Play Script** with character roles and dialogue lines, suitable for printing and handing out to kids. Include stage directions.
   - The script is auto-generated as a printable PDF (`role_play_script.pdf`) and HTML (`role_play_script.html`) in `weekly/`
   - The slide shows a preview on the left + print instructions on the right

6. **Gym activities** — Two or three options:
   - **Options A and B**: Themed physical games for ~10 kids, ~20 min each
     - Each has: title, description, setup, rules, materials list, story connection
     - Examples: Duck Duck Goose variant, Four Corners variant, relay races
   - **Option C: Movie Viewing** (optional) — if a TBTMS video was found in Step 4c, add as a third column with title, description, and play button
   - Layout auto-switches: 2-column when no movie, 3-column when movie is available

7. **Outdoor activities** — Alternative to regular playground:
   - Themed scavenger hunt or group game
   - Include materials, twist connecting to lesson, safety tip

### Step 6: Assemble Config JSON

Create `config.json` in the working directory with the structure documented in `scripts/build_slides.js`. All content from steps 2-5 goes here.

### Step 7: Build the PPTX

```bash
node scripts/build_slides.js weekly/config.json
```

The script reads `config.json` and the logo from `assets/church_logo.png`, and outputs the PPTX to `weekly/`.

### Step 8: Move to Output

Move the generated PPTX from `weekly/` to `output/`:

```bash
mv weekly/WeekNN_Topic.pptx output/
```

## Design Rules (DO NOT CHANGE)

### Title Slide
- **Logo**: `church_logo.png` from skill assets — circular green "Church in Basking Ridge" logo
- **Title text**: "Children Service" (NOT "Sunday School")
- **No subtitle line** (no "Intermediate Level - Block X - Week Y")
- **No footer text** in bottom bar
- Light yellow background, blue top/bottom bars, yellow divider

### Color Palette (hex without #)
```
blue: '4A90D9'    dkBlue: '2C5F8A'    ltBlue: 'E8F4FD'
yellow: 'F5C542'  ltYellow: 'FFF8E7'
green: '6BBF59'   dkGreen: '4A8A3A'   ltGreen: 'E8F8E0'
coral: 'E8725A'   ltCoral: 'FFF0EC'
purple: '7B68AE'  ltPurple: 'F0E8FF'
orange: 'E8925A'  ltOrange: 'FFF3E0'
white: 'FFFFFF'   gray: '888888'       ltGray: 'AAAAAA'
dkGray: '444444'  midGray: '666666'    text: '555555'
```

### Layout Constants
- **Slide layout**: 16:9 (`LAYOUT_16x9`)
- **Font**: Arial everywhere
- **Header**: Full-width bar, height 0.78, background = slide accent color, white text 22pt bold
- **Footer**: Full-width bar at y=5.3, height 0.33 — **must cover "Regeneron - Internal" watermark**
- **Cards**: Rounded rectangles with 0.15 radius, white fill, thin color accent bar (0.07 wide or 0.06 tall)
- **Two-column layouts**: Each column 4.6 wide, starting at x=0.25 and x=5.15
- **Three-column layouts** (Gym with movie): Each column 3.1 wide, starting at x=0.2, x=3.45, x=6.7
- **AutoFit**: Lesson slide kids content uses `autoFit: true` to prevent text overflow
- **Lesson card height**: Shortened to 3.8 (from 4.35) when practice point bar is present, to avoid overlap

### Slide Background Colors
- Title: `ltYellow`
- Schedule: `ltBlue`
- Songs (this week + last week): `ltBlue`
- Review: `ltBlue`
- Lesson: `ltYellow`
- Memory Verse: `ltBlue`
- Activity: `ltYellow`
- Gym: `ltYellow`
- Outdoor: `ltBlue`

### Header Colors
- All slides use `blue` header (C.blue = '4A90D9')

### Footer Colors
- All slides use `yellow` footer (C.yellow = 'F5C542')
- Exception: Title slide uses `blue` footer (top AND bottom bars)

### Schedule Slide (Static Content)
```
1. Hymn                    10:00 – 10:30 AM
2. Lessons & Memory Verse  10:30 – 10:50 AM
3. Activity                10:50 – 11:10 AM
4. Snack Time              11:10 – 11:20 AM
5. Gym Activities          11:20 – 11:45 AM
6. Outdoor Activities      11:45 AM – 12:15 PM
```

### Play Button Style
- Coral circle (C.coral), positioned at x=9.05, y=0.14, w=0.5, h=0.5
- White triangle (▶) centered inside
- Both shape and text have `hyperlink: { url: '<youtube_url>' }`

### Teacher Column Style
- Right column on Lesson slide
- Coral accent bar at top
- Large link icon box (rounded rect, ltCoral fill, coral border)
- Link emoji (🔗), "Full Lesson" bold text, "Click to open" italic subtext
- All hyperlinked to the lesson URL

## Dependencies

Dependencies are already installed in the project directory (`node_modules/`):

- **pptxgenjs** — PPTX generation (build_slides.js)
- **adm-zip** — PPTX reading/extraction (extract_prev.js)
- **playwright** — Web scraping (scrape_lesson.js, find_song.js)

Scripts resolve modules via `require.resolve(..., { paths: [outputDir, process.cwd()] })`. Always run commands from the project root directory.

## Lesson URL Patterns & Fallbacks

Primary pattern: `https://children.churchinanaheim.org/[LEVEL]-level-block-[BLOCK]-week-[WEEK].html`

When deriving previous week URL (week N-1):
1. Try same block: `[LEVEL]-level-block-[BLOCK]-week-[WEEK-1].html`
2. Try other blocks: block-1, block-2, block-3
3. Try no block: `[LEVEL]-level-week-[WEEK-1].html`
4. Scrape stories listing: `https://children.churchinanaheim.org/stories-[LEVEL]` and search for week N-1 link

Stories listing pages by level:
- `https://children.churchinanaheim.org/stories-elementary`
- `https://children.churchinanaheim.org/stories-intermediate`
- `https://children.churchinanaheim.org/stories-advanced`
- `https://children.churchinanaheim.org/stories-sixth-grade`

## Web Access Notes

- Corporate network blocks `WebFetch` — always use **Playwright** (`navigate + screenshot`) for web access
- Go directly to target URLs — do NOT use Google (triggers CAPTCHA)
- Save screenshots to the working directory for verification
