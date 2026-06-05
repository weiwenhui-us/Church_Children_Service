# Setup Guide — Sunday Children Service Slides (New Laptop)

## Prerequisites

1. **Node.js** (v18+): https://nodejs.org/
2. **Claude Code CLI** (API subscription): https://docs.anthropic.com/en/docs/claude-code
3. **Git** (optional but recommended)

## Step 1: Place the Project

Copy this entire folder to your preferred location, e.g.:
```
C:\Users\<you>\Documents\Sunday Children Service\
```

## Step 2: Install Dependencies

Open a terminal in the project directory and run:
```bash
npm install
```

This installs: pptxgenjs, adm-zip, playwright

Then install Playwright browsers:
```bash
npx playwright install chromium
```

## Step 3: Install the Claude Code Skill

Copy the `.claude-skill/` folder contents into your Claude Code skills directory:
```bash
# Create the skill directory
mkdir -p ~/.claude/skills/church-school-slides

# Copy skill files
cp -r .claude-skill/* ~/.claude/skills/church-school-slides/
```

The skill file (SKILL.md) contains the full workflow instructions that Claude Code follows.

## Step 4: Configure Claude Code

### Project CLAUDE.md
The `CLAUDE.md` in the project root is already set up. Update the directory paths if your project location differs from the original.

### Global CLAUDE.md (Optional)
The `.claude-global-config/CLAUDE.md` contains global instructions (Regeneron-specific). Review and adapt for your environment, then place at:
```
~/.claude/CLAUDE.md
```

### Settings (Optional)
Review `.claude-global-config/settings.json` for reference. Key settings:
- Model: opus
- Permissions: Write, Edit, Bash enabled

## Step 5: Update CLAUDE.md Paths

Edit the project `CLAUDE.md` — update the base directory path to match your new location:
```
# Old:
C:\Users\wenhui.wei\OneDrive - Regeneron Pharmaceuticals, Inc\Sunday Children Service\

# New (example):
C:\Users\<you>\Documents\Sunday Children Service\
```

Also update the skill's SKILL.md if the project home path is referenced there.

## Step 6: Verify Setup

```bash
# Test scraping (should launch browser)
node scripts/scrape_lesson.js "https://children.churchinanaheim.org/intermediate-level-block-4-week-37.html" "weekly"

# Test PPTX build (uses last config)
node scripts/build_slides.js weekly/config.json
```

## Weekly Usage

In Claude Code, just say:
```
work on week 38
```

Provide:
1. Lesson URL: `https://children.churchinanaheim.org/intermediate-level-block-4-week-38.html`
2. Previous PPTX: `output/Week37_Exodus_GodFeedingHisPeople.pptx`

Or use the skill shorthand: `/church-school-slides`

## What's in This Package

| Directory | Contents |
|-----------|----------|
| `scripts/` | PptxGenJS builder, scraper, song finder, PPTX extractor |
| `assets/` | Church logo (church_logo.png) |
| `output/` | Generated PPTX files (Weeks 24-37) + archived configs |
| `weekly/` | Working directory (temp files, screenshots, current config) |
| `docs/project_notes/` | Bug log, decisions, key facts, work log |
| `.claude-skill/` | Claude Code skill definition + reference scripts |
| `.claude-global-config/` | Reference Claude settings from original setup |

## Songs Already Used (Do Not Reuse)

- W31: Four Hundred Years
- W32: The Burning Bush
- W33: Our God Doesn't Give Up
- W34: We Were Slaves, But Now We're Free
- W35: God Began to Deliver His People
- W36: Do All Things Without Murmuring
- W37: Bread From Heaven

## API Notes

Since you're using an API subscription (not AWS Bedrock), Claude Code will use standard Anthropic API authentication. Set your API key:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Or configure via `claude config` when you first run Claude Code.

The global CLAUDE.md references AWS Bedrock auth — you can remove that section for API subscription use.
