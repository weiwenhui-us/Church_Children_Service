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

### 2026-04-08 - Role Play Script PDF Overwritten Each Week
- **Issue**: Every week's `role_play_script.pdf` and `.html` saved to the same filename in `weekly/`, overwriting previous weeks' scripts
- **Root Cause**: Hardcoded filename `role_play_script.pdf` in build_slides.js with no week-specific identifier
- **Solution**: Changed to `role_play_script_Week{N}.pdf` (e.g., `role_play_script_Week27.pdf`) using `config.weekNumber`
- **Prevention**: Any generated artifact that varies per week must include the week number in the filename. Never use a static name for per-run outputs.
