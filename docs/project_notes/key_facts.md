# Key Facts

Non-sensitive project constants and configuration. Never store passwords, API keys, or tokens here.

### Lesson Sources & URLs
- Weekly lesson source: https://children.churchinanaheim.org/
- Song repository (children's songs): http://173.68.175.102/children_song.asp
- TheBibleTellsMeSo songs (logged in): `/all-audio` (search), `/allsongs` (browse by Bible book)
- TheBibleTellsMeSo + general YouTube as fallback song sources

### Song Discovery Priority
1. TheBibleTellsMeSo.com website
2. TheBibleTellsMeSo YouTube channel
3. Song repository (173.68.175.102)
4. YouTube general search
- Always verify a candidate has actual singing (not narration/instruments only) and get user approval before finalizing.

### BEST hymn source — church's own song pages (added 2026-07-22)
- `https://children.churchinanaheim.org/songs` lists the church's curated children's songs, tagged to the lessons (search the page text for the lesson theme, e.g. "commandment", "obey", "honor").
- Each song page (e.g. `/c1l1_35.html`) has BOTH the full authoritative lyrics AND an embedded church-hosted MP3 (`/wp-content/uploads/….mp3`) on the same page → lyrics match the link by construction. Use the PAGE URL as the play-button link (has player + lyrics + download).
- This is the most reliable way to satisfy "full matching lyrics + working link." Prefer it over YouTube/repository for hymns.
- Caveat: repository (173.68.175.102) commandment-series / custom-tune songs often have MISSING audio (bare `NNNN.mp3` ref, "does not exist") — repository is fine for lyrics but verify audio before linking.
- Always curl-verify page (200) and MP3 (206, audio/mpeg) are live before building.

### Color Palette (PptxGenJS, no `#` prefix) — `const C` in build_slides.js
- blue `4A90D9`, dkBlue `2C5F8A`, ltBlue `E8F4FD`
- yellow `F5C542`, ltYellow `FFF8E7`
- white `FFFFFF`, gray `888888`, ltGray `AAAAAA`, dkGray `444444`, midGray `666666`, text `555555`
- Headers = blue bar + white text; footer = yellow bar; accents = yellow.

### Layout Constants
- 16:9 layout, Arial throughout
- Title text is "Children Service" (NOT "Sunday School")
- Footer bar at y=5.3, h=0.33 (covers bottom of slide)
- Title slide: dkBlue headline 34pt, yellow rule, coral lesson point

### Today's Schedule (static slide in build_slides.js, ~line 107) — as of 2026-05-02
1. 🎨 Craft — 10:00–10:30 AM
2. ♪ Hymn — 10:30–11:00 AM
3. 📖 Lesson & Associated Work — 11:00–11:30 AM
4. 🏃 Gym Activities — 11:30–11:50 AM
5. 🌳 Outdoor Activities — 11:50 AM–12:15 PM

### Scripts (in `scripts/`)
- `scrape_lesson.js` — scrape current week's lesson
- `extract_prev.js` — extract last week's content from a PPTX
- `find_song.js` — find candidate songs
- `build_slides.js` — build the full PPTX from `weekly/config.json`
- `gen_role_play.js` — regenerate role-play HTML+PDF without rebuilding the deck
- `gen_schedule_only.js` — generate a single-slide `Schedule_Only.pptx`

### Config Schema Notes
- Config JSON does NOT store song data directly; song fields come from find_song output.
- `"lastWeekSong": null` suppresses slide 4 (last week's song).
- Every week's config must include a `rolePlayScript` array inside `activity` (see CLAUDE.md).
- Output naming: `output/WeekNN_Topic.pptx`; configs as `output/WeekNN_config.json`.
