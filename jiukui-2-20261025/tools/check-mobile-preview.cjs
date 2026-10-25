// Safari/WebKit regression: centered column flex items must not shrink the cover.
const {chromium, webkit} = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const target = process.argv[2] || 'http://127.0.0.1:4192/';
const live = target.startsWith('https:');
const widths = (process.env.JIUKUI_PREVIEW_WIDTHS || '320,375,393,430,555,768,1440').split(',').map(Number);
const out = path.join(root, 'evidence/mobile-preview-fix');
fs.mkdirSync(out, {recursive:true});
(async () => {
  const results = [];
  for (const engine of ['webkit', 'chromium']) {
    const browser = await (engine === 'webkit' ? webkit.launch({headless:true}) : chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}));
    for (const width of widths) {
      const page = await browser.newPage({viewport:{width,height:900},isMobile:width<=555,hasTouch:width<=555,reducedMotion:'reduce'});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(target, {waitUntil:'networkidle'});
      await page.locator('.featured-lead').scrollIntoViewIfNeeded();
      const result = await page.locator('.featured-lead').evaluate(card => {
        const cover = card.querySelector('.project-cover');
        const rect = cover.getBoundingClientRect();
        return {
          width:innerWidth,cardWidth:card.getBoundingClientRect().width,
          coverWidth:rect.width,coverHeight:rect.height,coverRatio:rect.width/rect.height,
          imageWidths:[...cover.querySelectorAll('img')].map(img=>img.getBoundingClientRect().width),
          brokenImages:[...cover.querySelectorAll('img')].some(img=>!img.complete||!img.naturalWidth),
          overflow:document.documentElement.scrollWidth>innerWidth,
          projects:document.querySelectorAll('.project-card').length,
          artworks:document.querySelectorAll('.artwork').length
        };
      });
      result.engine = engine;
      result.errors = errors;
      result.pass = !result.overflow && !errors.length && !result.brokenImages && result.projects===9 && result.artworks===12;
      if (width<=700) result.pass &&= result.coverWidth>=result.cardWidth-27 && Math.abs(result.coverRatio-4/3)<.02 && result.imageWidths.every(w=>w>result.coverWidth*.3);
      if (width>=701) result.pass &&= Math.abs(result.coverRatio-1.5)<.02;
      results.push(result);
      if (width===393 || width===1440) await page.screenshot({path:path.join(out,`${live?'live':'local'}-${engine}-${width}.png`)});
      await page.close();
    }
    await browser.close();
  }
  fs.writeFileSync(path.join(out,`${live?'live':'local'}-checks.json`),JSON.stringify(results,null,2));
  console.log(JSON.stringify({target,checks:results.length,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass)},null,2));
  if (results.some(r=>!r.pass)) process.exitCode=1;
})().catch(error=>{console.error(error);process.exit(1)});
