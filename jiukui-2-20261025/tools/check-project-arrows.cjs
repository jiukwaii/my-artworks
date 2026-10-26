const {webkit,chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),target=process.argv[2]||'http://127.0.0.1:4192/';
const live=target.startsWith('https:'),out=path.join(root,'evidence/arrow-family');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const results=[];
 for(const engine of ['webkit','chromium']){
  const browser=await(engine==='webkit'?webkit.launch({headless:true}):chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}));
  for(const width of [393,1440]){
   const page=await browser.newPage({viewport:{width,height:900},isMobile:width<700,hasTouch:width<700});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(target,{waitUntil:'networkidle'});
   await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
   await page.evaluate(()=>document.fonts.ready);
   const item={engine,width,external:await page.locator('.project-arrow[data-direction="external"]').count(),photo:await page.locator('.project-arrow[data-direction="photo"]').count(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),styles:[]};
   for(const [kind,selector,matrix] of [['external','.project-actions .project-link','matrix(1, 0, 0, 1, 2, -2)'],['photo','.model-photo-link','matrix(1, 0, 0, 1, 2, 0)']]){
    const link=page.locator(selector).first(),arrow=link.locator('.project-arrow');
    await link.evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-300,behavior:'instant'}));
    const style=await arrow.evaluate(e=>{const c=getComputedStyle(e);return{width:c.width,height:c.height,stroke:c.strokeWidth,fill:c.fill,gap:getComputedStyle(e.parentElement).gap}});
    if(width===1440){await link.hover();await page.waitForFunction(({selector,matrix})=>getComputedStyle(document.querySelector(selector+' .project-arrow')).transform===matrix,{selector,matrix},{timeout:4000});}
    item.styles.push({kind,...style});
    await link.screenshot({path:path.join(out,`${live?'live':'local'}-${engine}-${width}-${kind}.png`)});
   }
   const photos=page.locator('.model-photo-link').first();await photos.click();
   await page.waitForFunction(()=>document.querySelector('dialog').open&&document.querySelector('#viewer-image').complete&&document.querySelector('#viewer-image').naturalWidth>0);
   item.photoOpens=true;await page.keyboard.press('Escape');
   await page.waitForFunction(()=>!document.querySelector('dialog').open&&document.activeElement.matches('.model-photo-link'));
   item.focusRestored=true;item.errors=errors;
   item.pass=item.external===6&&item.photo===1&&!item.overflow&&!errors.length&&item.styles.every(s=>s.width==='16px'&&s.height==='16px'&&s.stroke==='1.3px'&&s.fill==='none'&&s.gap==='10px');
   results.push(item);await page.close();
  }await browser.close();
 }
 fs.writeFileSync(path.join(out,`${live?'live':'local'}-checks.json`),JSON.stringify(results,null,2));
 console.log(JSON.stringify({target,checks:results.length,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass)}));if(results.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
