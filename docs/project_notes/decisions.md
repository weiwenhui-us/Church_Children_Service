# Architectural Decisions

## Entries

### ADR-001: Use PptxGenJS (Node.js) Instead of python-pptx (2026-04-02)

**Context:**
- Need to generate 10-slide PPTX decks weekly
- No PPTX template file — slides are built entirely from code
- PptxGenJS provides a clean JS API for programmatic slide creation

**Decision:**
- Use PptxGenJS (Node.js) for all PPTX generation
- The code IS the template — no .pptx template file needed

**Alternatives Considered:**
- python-pptx -> Rejected: less clean API for fully programmatic generation
- PowerPoint template + python-pptx -> Rejected: template approach too rigid for weekly content changes

**Consequences:**
- Node.js required for build scripts
- Full control over every pixel
- Easy to version and modify slide layouts in code

### ADR-002: Extract Previous Week Data from PPTX, Not Website (2026-04-02)

**Context:**
- Need last week's song and review content for the new deck
- Could re-scrape the lesson website or read from the PPTX

**Decision:**
- Extract song, review, and memory verse from last week's PPTX using adm-zip
- Read XML directly from the PPTX (which is a ZIP of XML files)

**Alternatives Considered:**
- Re-scrape previous week's lesson page -> Rejected: user prefers extracting from what was actually presented
- Manual input -> Rejected: defeats automation purpose

**Consequences:**
- Requires adm-zip dependency
- Need XML entity decoding for clean text
- Guaranteed to match what was actually shown last week

### ADR-003: Song Discovery Priority Order (2026-04-02)

**Context:**
- Need a children's song with actual singing matching each week's lesson topic
- Multiple song sources available with varying reliability

**Decision:**
- Priority 1: TheBibleTellsMeSo YouTube channel (preferred)
- Priority 2: Song repository at 173.68.175.102 (verify lyrics + audio)
- Priority 3: YouTube general search (fallback)
- User must approve song choice before finalizing

**Consequences:**
- Most reliable songs come from TheBibleTellsMeSo (purpose-built for this)
- Repository has many missing audio files — always verify
- YouTube general search requires manual verification for actual singing

### ADR-004: Project Directory Structure (2026-04-06)

**Context:**
- Migrating from temp working directory to a proper project
- Need clear separation of scripts, assets, output, and temp files

**Decision:**
- Project at `Church Children/`
- `scripts/` for all Node.js scripts
- `assets/` for static files (logo)
- `output/` for generated PPTX files
- `weekly/` for temp working files per generation run

**Consequences:**
- Clean separation of concerns
- Output PPTX files accumulate in `output/` for easy reference
- `weekly/` can be cleaned between runs

### ADR-005: Multi-Slide Lessons with Images and Practice Points (2026-04-06)

**Context:**
- Feedback requested more detailed, vivid lesson content spanning 2-3 slides
- Kids need actionable weekly practice points for testimony sharing next week
- Appropriate images enhance engagement but must exclude Jesus depictions

**Decision:**
- Lesson slides support 2-3 pages via `config.lesson.pages` array
- Each page can have an optional image (downloaded via Playwright from FreeBibleImages.org etc.)
- Last lesson page includes "This Week's Practice Point" for testimony preparation
- NO images of Jesus — ever

**Consequences:**
- Slide count is now variable (10-13 depending on lesson pages and role play script)
- Image search adds a Playwright step to the workflow
- Practice points create a weekly testimony loop (practice → share next week)

### ADR-006: Role Play Scripts and Activity Variety (2026-04-06)

**Context:**
- Feedback requested more activity variety: puzzles, spinners, Q&A, role play, fill-in-blank, verse dictation
- Role play activities need full printable scripts for servants to hand out

**Decision:**
- Activity slide supports `rolePlayScript` field — generates a separate continuation slide with full script
- Script includes character roles, dialogue lines, and stage directions
- Activity format expanded beyond the fixed 3-part structure

**Consequences:**
- Optional extra slide when role play is chosen
- Scripts must be detailed enough to print and use directly

### ADR-007: TBTMS Movie Viewing as Gym Bonus (2026-04-06)

**Context:**
- TheBibleTellsMeSo.com has videos/stories matching lesson topics
- Could serve as alternative gym activity (movie watching)

**Decision:**
- Search TBTMS website `/all-videos` for matching videos during workflow
- If found, add as "Bonus: Movie Viewing" section on Gym slide with play button
- Does NOT replace the two gym options — it's an additional choice

**Consequences:**
- Adds a Playwright search step to the workflow
- Gym slide may have a bonus bar at the bottom when a video is found

### ADR-008: 4-Tier Song Discovery with TBTMS Website Login (2026-04-06)

**Context:**
- User has staff-level access to thebibletellsmeso.com with searchable song library
- Albums organized by Bible book — ideal for topic-based song matching

**Decision:**
- Priority 1: TBTMS website (logged in, search + browse by Bible book)
- Priority 2: TBTMS YouTube channel
- Priority 3: Song repository (173.68.175.102)
- Priority 4: YouTube general search

**Consequences:**
- Login credentials stored in SKILL.md for automation
- Best song matching since TBTMS library is organized by Bible book
