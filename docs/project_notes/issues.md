# Work Log

## Entries

### 2026-04-02 - Skill Creation: church-school-slides
- **Status**: Completed
- **Description**: Created reusable Claude Code skill with SKILL.md, 4 scripts (build_slides.js, extract_prev.js, find_song.js, scrape_lesson.js), and church logo asset
- **Notes**: Extracted and parameterized from build_week24.js reference implementation

### 2026-04-02 - Week 25 Slide Deck Generation
- **Status**: Completed
- **Description**: Generated Week 25 "Joseph: Cared For by God" (Genesis 37:12-36; 39:1-6)
- **Song**: "Joseph (Be That As It May)" by DG Bible Songs (YouTube) — repository songs had missing audio
- **Output**: `output/Week25_Joseph_CaredForByGod.pptx`

### 2026-04-06 - Project Setup: Sunday Children Service
- **Status**: Completed
- **Description**: Migrated from `Temp\church_school_weekly\` to dedicated project directory. Created scripts/, assets/, output/, weekly/ structure. Updated SKILL.md paths. Set up project memory.

### 2026-04-06 - Slide Layout Enhancements from User Feedback
- **Status**: Completed
- **Description**: Applied feedback from slide.txt (Chinese). Changes:
  - Slide 5 (Review): Added testimony sharing prompt
  - Slide 6 (Lesson): Multi-slide support (2-3 pages) with images and practice points
  - Slide 8 (Activity): Removed red time badge, moved content up, added Role Play Script support
  - Slide 9 (Gym): Added optional "Bonus: Movie Viewing" from TBTMS videos
  - SKILL.md: Added image search step, TBTMS video search step, updated content generation spec
  - Song discovery: Updated to 4-tier strategy with TBTMS website login as Priority 1
- **Notes**: ADR-005 through ADR-008 document the design decisions

### 2026-04-07 - Slide Layout Refinements and Bug Fixes
- **Status**: Completed
- **Description**: Three fixes applied:
  1. Slide 10 (Role Play Script): Changed from inline text to preview + printable PDF. Generates `role_play_script.pdf` via Playwright.
  2. Slide 11 (Gym): Movie viewing changed from bonus bar to proper "Option C" 3-column layout with play button.
  3. Slide 7 (Lesson 2/2): Fixed text overflow — reduced card height when practice point present, added `autoFit: true`.
  4. Slide 3 (Song): Replaced dead YouTube link with working URL (`uGwYVp3yHTI`).
- **Notes**: Week 25 v3 regenerated with all fixes. See bugs.md for details.

### 2026-04-25 - Migration to Mac (Personal Machine)
- **Status**: Completed
- **Description**: Migrated project from Windows (Regeneron laptop) to Mac personal machine. New path: `/Users/wenhui.wei/Documents/Project/Personal/Church Children`. Updated SKILL.md project path and removed corporate network notes. Reinstalled npm dependencies and Playwright Chromium.

### 2026-04-25 - Week 26 v2 Rebuild (Joseph: Speaking Boldly)
- **Status**: Completed
- **Description**: Rebuilt Week 26 from a fresh `output/Week26_config.json` rather than surgically editing the existing PPTX. New song "Acts Song #21 — Speaking Medley" (song #9121, 5 verses) as thisWeekSong with two-column lyrics (9 lines left, 15 right). Memory verse Mark 9:23.
- **Notes**: Set `"lastWeekSong": null` to omit slide 4 — required wrapping the slide-4 block in `if (config.lastWeekSong) { ... }` (build_slides.js ~line 187). Also removed an "internal" watermark from the deck. Reusable pattern: any week can now suppress the last-week song slide with `null`.

### 2026-04-26 - Week 27 Config Regeneration (Pharaoh's Dream Challenge)
- **Status**: Completed
- **Description**: Original Week 27 script was missing; recreated `output/Week27_config.json` from the existing PPTX. Covers Joseph interpreting Pharaoh's dreams (Genesis 41). Role-play script with roles Narrator, Pharaoh, Magician 1/2, Cupbearer, Joseph, Everyone.

### 2026-04-26 - Today's Schedule Reorder & Rename
- **Status**: Completed
- **Description**: Edited the static schedule slide in build_slides.js. Craft → #1, Hymn → #2, Activities → #3, Gym → #4, Outdoor → #5. Removed Snack Time and the old "Lessons & Memory Verse" item.

### 2026-05-02 - Schedule Time/Label Update + Standalone Schedule Slide
- **Status**: Completed
- **Description**: Renamed schedule item #3 to "Lesson & Associated Work" and adjusted times for items #3–#5 (final: Craft 10:00–10:30, Hymn 10:30–11:00, Lesson & Associated Work 11:00–11:30, Gym 11:30–11:50, Outdoor 11:50–12:15). Created `scripts/gen_schedule_only.js` to produce a single-slide `output/Schedule_Only.pptx` reusing the deck's styling.

### 2026-07-22 - Week 38 (Moses—The Ten Commandments 1)
- **Status**: Completed
- **Description**: 12-slide deck for "Moses—The Ten Commandments (1)" (Exodus 20, first five commandments; memory verse John 14:15). Lesson URL block-4-week-38. Images from FreeBibleImages "Moses at Mount Sinai" (SPI). Gym movie = TBTMS "Moses, God, and the Mountain" (rMjLA9NIj98). Output: `output/Week38_Moses_TenCommandments1.pptx`, config `output/Week38_config.json`.
- **Hymn (per user request to fix recurring hymn errors)**: "You Shall Have No Other Gods Before Me" from the church song page `children.churchinanaheim.org/c1l1_35.html` — full authoritative lyrics + live church-hosted MP3 on the same page (lyrics match link by construction). Verified live before build.
- **Two code fixes** (see bugs.md 2026-07-22): (1) two-column lyric renderer now auto-scales font + `fit:'shrink'` so full lyrics never clip; (2) adopted church song pages as the authoritative hymn source. Verified rendering of both the short centered hymn and the 5-verse two-column last-week song — all lyrics fully visible.

### 2026-07-22 - Week 39 (Moses—The Ten Commandments 2)
- **Status**: Completed
- **Description**: 12-slide deck for "Moses—The Ten Commandments (2)" (last five commandments 6–10; Exodus 20; memory verse Leviticus 22:31). Page-1 image from FreeBibleImages "Moses at Mount Sinai" (frame 26, Moses proclaiming God's words). Gym movie reuses TBTMS "Moses, God, and the Mountain" (rMjLA9NIj98) as a recap of all Ten Words. Output: `output/Week39_Moses_TenCommandments2.pptx`, config `output/Week39_config.json`.
- **Hymn**: "Therefore Keep the Commandments of Jehovah" (`children.churchinanaheim.org/c3l3_06.html`) — near word-for-word match to memory verse Lev 22:31. Full lyrics CONFIRMED complete by transcribing the recording (whisper-cli small.en); recording = one verse sung twice, matching the page text. Verified page + MP3 live before build.
- **Note**: Applied week-38 lessons — sourced hymn from church song page and transcribed the MP3 to confirm all verses. Also auditioned "Trust and Obey" (c1l3_07, chorus only) and rejected "It's Better to Obey" (c5l1_08 — transcribes as instrumental/no clear singing). Last-week song slide carries forward week 38's "You Shall Have No Other Gods Before Me" with the full 2-verse lyrics.

### 2026-07-22 - Week 40 (The Tabernacle—God's Dwelling Place)
- **Status**: Completed
- **Description**: 12-slide deck for "The Tabernacle—God's Dwelling Place" (Exodus 25–27; memory verse Psalm 27:4). Page-1 image from FreeBibleImages "Moses and the Tabernacle" (frame 30, the built tabernacle + courtyard). Gym movie = TBTMS "The Tabernacle of God" (aVW9uNYBXkM, 6:03). Output: `output/Week40_Tabernacle_GodsDwellingPlace.pptx`, config `output/Week40_config.json`.
- **Hymn**: "We Are the Household of God" (`children.churchinanaheim.org/we-are-the-household-of-god.html`) — ties the tabernacle (God's dwelling) to His people being His household. Full lyrics CONFIRMED complete by transcribing the recording. Verified page + MP3 live.
- **Note**: Rejected "We are in a house" (about the natural family, off-theme). Auditioned "In the Whole Universe God Has a Household" (good, kid-friendly) as the alternate. Last-week slide carries forward week 39's "Therefore Keep the Commandments of Jehovah" (centered lyrics). Block 4 (weeks 31–40) now complete.

### Untracked weekly decks (configs/PPTX present, no detailed session log)
- `output/` also contains Week 29, 30, 31, 34, 35, 37 PPTX/configs generated in sessions not captured in this log. Listed here so the gap is visible; details can be reconstructed from the config JSON files if needed.
