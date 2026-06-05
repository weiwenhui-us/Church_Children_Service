/**
 * gen_schedule_only.js — Generates a single-slide PPTX of just Today's Schedule.
 * Mirrors the schedule slide styling in build_slides.js.
 *
 * Usage: node scripts/gen_schedule_only.js
 * Output: output/Schedule_Only.pptx
 */
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const pptxgen = require(require.resolve('pptxgenjs', { paths: [projectRoot] }));

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.title = "Children Service — Today's Schedule";

const C = {
  blue: '4A90D9', dkBlue: '2C5F8A', ltBlue: 'E8F4FD',
  yellow: 'F5C542',
  white: 'FFFFFF', dkGray: '444444', text: '555555',
};

const sched = pptx.addSlide();
sched.background = { fill: C.ltBlue };

// Header bar
sched.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.78, fill: { color: C.blue } });
sched.addText('📅  Today’s Schedule', { x: 0.4, y: 0.05, w: 9.2, h: 0.7, color: C.white, fontSize: 22, bold: true, fontFace: 'Arial' });

// Card
sched.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 0.95, w: 8.8, h: 4.4, fill: { color: C.white }, rectRadius: 0.15 });
sched.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 0.07, h: 4.4, fill: { color: C.yellow } });

// Column headers
sched.addText('#', { x: 1.0, y: 1.05, w: 0.5, h: 0.35, fontSize: 11, bold: true, color: C.blue, fontFace: 'Arial', align: 'center', valign: 'middle' });
sched.addText('Activity', { x: 1.6, y: 1.05, w: 4.0, h: 0.35, fontSize: 11, bold: true, color: C.blue, fontFace: 'Arial', valign: 'middle' });
sched.addText('Time', { x: 6.5, y: 1.05, w: 2.5, h: 0.35, fontSize: 11, bold: true, color: C.blue, fontFace: 'Arial', align: 'center', valign: 'middle' });
sched.addShape(pptx.shapes.RECTANGLE, { x: 1.0, y: 1.42, w: 8.0, h: 0.02, fill: { color: C.blue } });

const schedItems = [
  { icon: '🎨', label: 'Craft', time: '10:00 – 10:30 AM' },
  { icon: '♪', label: 'Hymn', time: '10:30 – 11:00 AM' },
  { icon: '📖', label: 'Lesson & Associated Work', time: '11:00 – 11:30 AM' },
  { icon: '🏃', label: 'Gym Activities', time: '11:30 – 11:50 AM' },
  { icon: '🌳', label: 'Outdoor Activities', time: '11:50 AM – 12:15 PM' },
];

let schedY = 1.55;
const rowH = 0.62;
schedItems.forEach((item, i) => {
  if (i % 2 === 0) {
    sched.addShape(pptx.shapes.RECTANGLE, { x: 0.9, y: schedY - 0.02, w: 8.2, h: rowH, fill: { color: 'F4F8FD' } });
  }
  sched.addShape(pptx.shapes.OVAL, { x: 1.05, y: schedY + 0.11, w: 0.36, h: 0.36, fill: { color: C.blue } });
  sched.addText(String(i + 1), { x: 1.05, y: schedY + 0.11, w: 0.36, h: 0.36, fontSize: 12, color: C.white, align: 'center', valign: 'middle', fontFace: 'Arial', bold: true });
  sched.addText(item.icon + '  ' + item.label, { x: 1.6, y: schedY, w: 4.4, h: rowH, fontSize: 15, bold: true, color: C.dkGray, fontFace: 'Arial', valign: 'middle' });
  sched.addText(item.time, { x: 6.3, y: schedY, w: 2.7, h: rowH, fontSize: 14, color: C.text, fontFace: 'Arial', align: 'center', valign: 'middle' });
  schedY += rowH;
});

// Footer
sched.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 5.3, w: 10, h: 0.33, fill: { color: C.yellow } });

const outPath = path.join(outputDir, 'Schedule_Only.pptx');
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log('Wrote ' + outPath);
});
