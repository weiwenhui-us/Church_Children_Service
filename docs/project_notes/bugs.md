# Bug Log

## Format

- Date, brief description, root cause, solution, prevention notes
- Keep entries concise (1-3 lines)

## Entries

### 2026-04-02 - Module Resolution Error in Skill Scripts
- **Issue**: `Cannot find module 'adm-zip'` when running extract_prev.js from skill directory
- **Root Cause**: Scripts in `~/.claude/skills/` couldn't find `node_modules` installed in the working directory
- **Solution**: Changed all scripts from `require('module')` to `require(require.resolve('module', { paths: [outputDir, process.cwd()] }))`
- **Prevention**: Always use `require.resolve` with `paths` parameter when scripts run from a different directory than `node_modules`

### 2026-04-02 - XML Entity Escapes in Extracted PPTX Text
- **Issue**: Text extracted from PPTX contained `&apos;`, `&amp;`, `&quot;`, `\r\n` instead of decoded characters
- **Root Cause**: PPTX slides are XML — adm-zip reads raw XML text with entities
- **Solution**: Added `decodeXml()` function in extract_prev.js to replace all standard XML entities and normalize line endings
- **Prevention**: Always decode XML entities when reading text from PPTX XML

### 2026-04-02 - Song Repository Audio Files Missing
- **Issue**: Songs #9586, #9587, #3730 all returned "Music file ... does not exists!" on Play page
- **Root Cause**: Server-side mp3 files missing from `c:\Inetpub\wwwroot\church_web\music\`
- **Solution**: Skip repository songs with missing audio; fall back to YouTube
- **Prevention**: Always verify audio exists before selecting a song from the repository

### 2026-04-07 - YouTube Video Link Dead (DG Bible Songs - Joseph)
- **Issue**: `youtube.com/watch?v=pVOqhMBGxJU` (Joseph "Be That As It May" by DG Bible Songs) shows "This video isn't available anymore"
- **Root Cause**: Video removed or made private by uploader
- **Solution**: Found replacement at `youtube.com/watch?v=uGwYVp3yHTI` (same song, 3:28, 6M views, animated with singing)
- **Prevention**: Always verify YouTube links are still live before finalizing the PPTX. YouTube videos can be removed at any time.

### 2026-04-07 - Lesson Slide Text Overlapping Practice Point Bar
- **Issue**: On lesson page 2/2, "For Kids" text content extended below the card and was covered by the "This Week's Practice" green bar
- **Root Cause**: Kids text area height (3.7) + practice point bar position (y=4.85) overlapped; card height was not reduced for practice point
- **Solution**: When practice point exists, reduce kids card height to 3.8, text area uses `autoFit: true`, and practice point bar sits at `0.95 + cardH + 0.1`
- **Prevention**: Always account for additional elements (practice point, footer) when calculating content area height

### 2026-07-22 - Hymn Lyrics Clipped on Two-Column Song Slide
- **Issue**: Long hymns showed only a partial set of lyrics — text overflowed the card and was visually cut off
- **Root Cause**: The `lyricsLeft`/`lyricsRight` path in build_slides.js used a fixed 11pt font with NO `fit:'shrink'` in a fixed 4.0"-tall box (the `lyricsCentered` path already had shrink; the two-column path did not)
- **Solution**: Added a shared `colFont` that scales down by line count (11→10→9pt) plus `fit:'shrink'` as a backstop on both this-week and last-week two-column blocks. Full lyrics now always fit. Verified with the 5-verse Acts medley (last week's song) rendering complete.
- **Prevention**: Any lyric/text box that can grow with content must have `fit:'shrink'` (or autoFit) — never a fixed font in a fixed box.

### 2026-07-22 - Dead / Mismatched Hymn Links & Wrong Lyrics
- **Issue**: Recurring — song links dead or pointing to a different song than the printed lyrics; lyrics sourced separately from the link so they didn't match
- **Root Cause**: `thisWeekSong.youtubeUrl` was chosen independently of the lyrics (e.g. repository Play links with missing audio, or unverified YouTube). Repository commandment-series songs (custom tunes) have MISSING server audio (`audioMissing`, bare `NNNN.mp3` ref). AI-generated YouTube kids' songs have no reliable lyrics.
- **Solution**: Use the church's own song pages at `children.churchinanaheim.org/songs` — each page has BOTH authoritative full lyrics AND a church-hosted MP3 on the SAME page, so lyrics match the link by construction. Verify the page + MP3 are live (HTTP 200 / 206 audio/mpeg) before use.
- **Prevention**: Never set the song link and lyrics from different sources. Prefer a single source that carries both. Always curl-verify the link before building.

### 2026-07-22 - Church Song Page Shows Only Partial Lyrics (verse 1 of N)
- **Issue**: The church song page for "You Shall Have No Other Gods Before Me" (`c1l1_35.html`) displays only ONE verse inline, but the RECORDING actually sings TWO verses (commandments 1 AND 2). Trusting the page text gave incomplete lyrics.
- **Root Cause**: Many church song pages show only the first verse as text; the full lyric set exists only in the audio recording (no "Text"/PDF download on some pages).
- **Solution**: Transcribe the official recording to get the complete lyric. Installed `ffmpeg` + `whisper-cpp` (`whisper-cli`). Workflow: `curl` the page's MP3 → `ffmpeg -i x.mp3 -ar 16000 -ac 1 x.wav` → `whisper-cli -m ggml-small.en.bin -f x.wav`. small.en model is accurate enough for short songs (base.en garbles some words). Clean up obvious mishearings against the biblical text (e.g. "great minimum edges" → "graven images").
- **Prevention**: When a song page shows a short/single verse, ALWAYS transcribe the recording to confirm you have every verse before putting lyrics on the slide. Don't assume the inline page text is complete.

### 2026-04-08 - Role Play Script PDF Overwritten Each Week
- **Issue**: Every week's `role_play_script.pdf` and `.html` saved to the same filename in `weekly/`, overwriting previous weeks' scripts
- **Root Cause**: Hardcoded filename `role_play_script.pdf` in build_slides.js with no week-specific identifier
- **Solution**: Changed to `role_play_script_Week{N}.pdf` (e.g., `role_play_script_Week27.pdf`) using `config.weekNumber`
- **Prevention**: Any generated artifact that varies per week must include the week number in the filename. Never use a static name for per-run outputs.
