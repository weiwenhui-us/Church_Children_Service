# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Generates 10-13 slide PPTX decks for Children Service at The Church in Basking Ridge using PptxGenJS (Node.js).

## User Inputs (per week)

Only **two inputs** needed:
1. **Current week's lesson URL** — from `https://children.churchinanaheim.org/`
2. **Last week's PPTX file path** — from `output/` folder

## Directory Structure

```
Church Children/
├── scripts/          # PptxGenJS builder, scraper, song finder, PPTX extractor
├── assets/           # church_logo.png
├── output/           # generated PPTX files (WeekNN_Topic.pptx)
├── weekly/           # temp working files (scraped data, screenshots, JSON)
├── node_modules/     # pptxgenjs, adm-zip, playwright
├── CLAUDE.md         # this file
└── package.json
```

## Workflow

Use the `church-school-slides` skill (`/church-school-slides`) which defines the full 8-step workflow. Key differences from the skill's defaults:

- **Scripts**: Run from `scripts/` in this project
- **Working dir**: Use `weekly/` for temp files (lesson_data.json, prev_week.json, screenshots, config.json)
- **Output**: PPTX goes to `output/`
- **Last week's PPTX**: Always in `output/`

### Script Commands (run from project root)

```bash
# Scrape lesson
node scripts/scrape_lesson.js "<LESSON_URL>" "weekly"

# Extract previous week
node scripts/extract_prev.js "output/WeekNN_Topic.pptx" "weekly"

# Find songs
node scripts/find_song.js "<TOPIC_KEYWORDS>" "weekly"

# Build PPTX (config.json must be in weekly/)
node scripts/build_slides.js weekly/config.json
```

## Web Access

Prefer **Playwright** for web access — more reliable than WebFetch for dynamic sites (YouTube, Wix). Go directly to URLs — never use Google (triggers CAPTCHA).

## Song Discovery Priority

1. TheBibleTellsMeSo.com website (logged in — search `/all-audio`, browse by Bible book at `/allsongs`)
2. TheBibleTellsMeSo YouTube channel
3. Song repository at `http://173.68.175.102/children_song.asp`
4. YouTube general search

Always verify songs have actual **singing** (not just narration/instruments). Present candidates to user for approval before finalizing.

## Role Play Scripts

Every week's config **must** include a `rolePlayScript` array inside the `activity` object. This is a standard part of every slide deck — do NOT skip it.

### Format

```json
"activity": {
  "title": "...",
  "parts": [...],
  "rolePlayScript": [
    { "direction": true, "text": "Scene description or stage direction" },
    { "role": "CharacterName" },
    { "text": "Dialogue line\n" },
    ...
    { "direction": true, "text": "All kids together:" },
    { "role": "Everyone" },
    { "text": "Closing takeaway line (no trailing newline)" }
  ]
}
```

### Script Guidelines
- Always start with a scene-setting `direction` entry
- Include a `Narrator` role to move the story forward
- Use dialogue that is dramatic, fun, and age-appropriate (kids 5-12)
- End with an `"Everyone"` line that reinforces the week's lesson point
- Keep scripts to ~15-25 entries (fits one slide preview + printable PDF)
- The build script auto-generates HTML + PDF in `output/` and adds a Role Play slide to the PPTX

### Standalone Generation
To regenerate role play HTML/PDF without rebuilding the full PPTX:
```bash
node scripts/gen_role_play.js output/WeekNN_config.json
```

## Design Rules

See the `church-school-slides` skill for full color palette, layout constants, and design specifications. Key points:
- Title text: "Children Service" (NOT "Sunday School")
- 16:9 layout, Arial font, blue headers, yellow footers
- Footer bar at y=5.3, h=0.33 (covers bottom of slide)

## Project Memory System

This project maintains institutional knowledge in `docs/project_notes/` for consistency across sessions.

### Memory Files

- **bugs.md** - Bug log with dates, solutions, and prevention notes
- **decisions.md** - Architectural Decision Records (ADRs) with context and trade-offs
- **key_facts.md** - Project configuration, song sources, design constants
- **issues.md** - Work log of weekly slide generation and project changes

### Memory-Aware Protocols

**Before changing slide design or layout:**
- Check `docs/project_notes/decisions.md` for existing design decisions
- Verify the change doesn't conflict with established rules

**When encountering errors:**
- Search `docs/project_notes/bugs.md` for similar issues (e.g., module resolution, XML parsing)
- Apply known solutions if found
- Document new bugs and solutions when resolved

**When looking up project configuration:**
- Check `docs/project_notes/key_facts.md` for URLs, color values, design constants

**After generating each week's slides:**
- Log completed work in `docs/project_notes/issues.md`
