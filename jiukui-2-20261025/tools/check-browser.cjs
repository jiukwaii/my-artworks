/* Uses the installed Playwright and Chrome; no dependency installation. */
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),BASE='http://127.0.0.1:4192/';
const OUT=path.join(ROOT,'evidence','qa');fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[],checks=[];
 function check(name,value){checks.push({name,pass:!!value});if(!value)console.error('FAIL:',name)}
 for(const locale of ['']) for(const width of [1440,1024,768,390,320]){
  const page=await browser.newPage({viewport:{width,height:width>700?960:844},reducedMotion:'reduce',isMobile:width<701,hasTouch:width<701});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  const failed=[];page.on('response',r=>{if(r.status()>=400)failed.push([r.status(),r.url()])});
  await page.goto(BASE+locale,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(25)}
  await page.waitForTimeout(150);
  const data=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,projects:document.querySelectorAll('.project-card').length,selected:document.querySelectorAll('.selected-grid>.project-card').length,artworks:document.querySelectorAll('.artwork').length,broken:[...document.images].filter(i=>i.id!=='viewer-image'&&i.getAttribute('src')&&(!i.complete||!i.naturalWidth)).map(i=>i.src),overflow:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&getComputedStyle(e).position!=='absolute'&&(r.right>innerWidth+2||r.left< -2)}).slice(0,12).map(e=>({tag:e.tagName,cls:e.className.baseVal??e.className})),duplicates:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((v,i,a)=>a.indexOf(v)!==i)}));
  data.locale=locale||'zh';data.errors=errors;data.failed=failed;results.push(data);
  check(`${data.locale}-${width} integrity`,data.projects===9&&data.selected===3&&data.artworks===12&&!data.broken.length&&!errors.length&&!failed.length&&!data.duplicates.length&&data.scrollWidth<=width);
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(OUT,`${locale?'en':'zh'}-${width}-hero.png`)});
  for(const id of ['work','illustration','experiments','about','contact']){
   if(width===1440||width===390){await page.evaluate(id=>scrollTo(0,document.getElementById(id).getBoundingClientRect().top+scrollY-document.querySelector('.site-header').offsetHeight-20),id);await page.screenshot({path:path.join(OUT,`${locale?'en':'zh'}-${width}-${id}.png`)})}
  }
  if(width===390||width===1440){
   const first=page.locator('[data-artwork]').first();await first.click();await page.locator('.image-viewer').waitFor({state:'visible'});
   check(`${locale}-${width} viewer open`,await page.locator('.image-viewer').evaluate(e=>e.open));
   await page.keyboard.press('ArrowRight');check(`${locale}-${width} viewer next`,(await page.locator('#viewer-counter').innerText()).includes('2 / 12'));

   await page.keyboard.press('Escape');check(`${locale}-${width} viewer focus return`,await first.evaluate(e=>document.activeElement===e));
   if(width===390){await page.locator('.nav-toggle').click();check('Mobile menu open',await page.locator('nav').isVisible());await page.locator('nav a[href="#about"]').click();check('Mobile menu closes',await page.locator('.nav-toggle').getAttribute('aria-expanded')==='false')}
   else{await page.locator('nav a[href="#contact"]').click()}
   check('Chinese only: no language switch',await page.locator('.language-switch').count()===0);
  }
  await page.close();
 }
 // Real book movement is checked separately from reduced-motion static layout.
 const p=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'no-preference'});await p.goto(BASE,{waitUntil:'networkidle'});
 await p.locator('#about').scrollIntoViewIfNeeded();await p.waitForTimeout(300);
 const book=await p.evaluate(()=>{const t=document.querySelector('.book-travel');return {top:t.getBoundingClientRect().top+scrollY,height:t.offsetHeight,stage:t.querySelector('.book-stage').offsetHeight}});
 const poses=[];for(const fraction of [0,.5,1]){await p.evaluate(({book,fraction})=>scrollTo(0,book.top-92+(book.height-book.stage)*fraction),{book,fraction});await p.waitForTimeout(350);poses.push(await p.locator('.book-scene').getAttribute('data-turn-progress'));}
 check('Book scroll progresses',Number(poses[2])>Number(poses[0]));
 check('Book copy stays inside pages',await p.locator('.spread-two .book-page-copy').evaluate(e=>e.getBoundingClientRect().bottom<e.closest('.book-page').getBoundingClientRect().bottom-15));
 const vids=p.locator('[data-exhibit-video]');await vids.first().scrollIntoViewIfNeeded();await p.waitForTimeout(900);check('Pet recording can play',await vids.first().evaluate(v=>v.readyState>=2&&!v.paused));
 await vids.first().focus();await p.keyboard.press('Enter');await p.waitForTimeout(150);check('Pet keyboard pause',await vids.first().evaluate(v=>v.paused));
 await p.close();
 // No-script reading, artwork links, and case navigation remain available.
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const n=await context.newPage();await n.goto(BASE);check('No-JS all work visible',await n.locator('.project-card').count()===9&&await n.locator('nav').isVisible());await context.close();
 await browser.close();
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify({results,checks},null,2));console.log(JSON.stringify({checks:checks.length,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass),layouts:results},null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
