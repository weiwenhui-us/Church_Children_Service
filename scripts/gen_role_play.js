/**
 * Generate role play script HTML + PDF for a given week config.
 * Usage: node scripts/gen_role_play.js output/Week33_config.json [output/Week34_config.json ...]
 */
const fs = require('fs');
const path = require('path');

async function generateForConfig(configPath) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  if (!config.activity || !config.activity.rolePlayScript) {
    console.log(`Skipping ${configPath} — no rolePlayScript found.`);
    return;
  }
  const weekNum = config.weekNumber;
  const outputDir = path.resolve(path.dirname(configPath));
  const baseName = `role_play_script_Week${weekNum}`;
  const htmlPath = path.join(outputDir, `${baseName}.html`);
  const pdfPath = path.join(outputDir, `${baseName}.pdf`);

  // Build HTML
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
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`HTML saved: ${htmlPath}`);

  // Generate PDF via Playwright
  try {
    const { chromium } = require('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
    await page.pdf({ path: pdfPath, format: 'Letter', margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' } });
    await browser.close();
    console.log(`PDF  saved: ${pdfPath}`);
  } catch (err) {
    console.error(`Warning: PDF generation failed for Week ${weekNum}:`, err.message);
  }
}

(async () => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node scripts/gen_role_play.js <config.json> [config.json ...]');
    process.exit(1);
  }
  for (const configPath of args) {
    await generateForConfig(configPath);
  }
})();
