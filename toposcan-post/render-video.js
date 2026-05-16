const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FPS = 30;
const DURATION_S = 18;
const TOTAL_FRAMES = FPS * DURATION_S; // 540
const W = 1080, H = 1920;

const FRAMES_DIR = path.resolve(__dirname, 'frames');
if (fs.existsSync(FRAMES_DIR)) {
  for (const f of fs.readdirSync(FRAMES_DIR)) fs.unlinkSync(path.join(FRAMES_DIR, f));
} else {
  fs.mkdirSync(FRAMES_DIR);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--font-render-hinting=none']
  });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const url = 'file://' + path.resolve(__dirname, 'reels-render.html') + '?headless=1';
  await page.goto(url);
  // espera função expor
  await page.waitForFunction(() => typeof window.__render === 'function');
  console.log('rendering', TOTAL_FRAMES, 'frames @', FPS, 'fps...');

  const t0 = Date.now();
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t = i / FPS;
    await page.evaluate((t) => window.__render(t), t);
    const out = path.join(FRAMES_DIR, `f_${String(i).padStart(4, '0')}.png`);
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H }, type: 'png' });
    if (i % 30 === 0) {
      const elapsed = (Date.now() - t0) / 1000;
      const eta = (elapsed / (i + 1)) * (TOTAL_FRAMES - i - 1);
      console.log(`  ${i}/${TOTAL_FRAMES} (${elapsed.toFixed(1)}s elapsed, ${eta.toFixed(0)}s left)`);
    }
  }

  await browser.close();
  console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
})().catch(e => { console.error(e); process.exit(1); });
