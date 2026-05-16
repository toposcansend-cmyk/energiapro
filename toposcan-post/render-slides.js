const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
  });

  const slides = [
    'slide-1-hook.html',
    'slide-2-scan.html',
    'slide-3-revelacao.html',
    'slide-4-cta.html'
  ];

  for (const slide of slides) {
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1920 },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();

    // injeta CSS pra forçar o frame de 1080x1920 sem escala
    const url = 'file://' + path.resolve(__dirname, slide);
    await page.goto(url);

    // remove escala/scroll: força o .f a ocupar exato 1080x1920
    await page.addStyleTag({
      content: `
        html, body { background:#000 !important; margin:0 !important; padding:0 !important;
          width:1080px !important; height:1920px !important; overflow:hidden !important;
          display: block !important; place-items: unset !important; }
        .f { transform: none !important; margin: 0 !important; position: relative !important; }
      `
    });

    // espera SVG/JS renderizar
    await page.waitForTimeout(800);

    const out = slide.replace('.html', '.png');
    await page.screenshot({
      path: path.resolve(__dirname, out),
      clip: { x: 0, y: 0, width: 1080, height: 1920 }
    });
    console.log('rendered:', out);
    await context.close();
  }

  await browser.close();
  console.log('done.');
})();
