const {webkit,chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),target=process.argv[2]||'http://127.0.0.1:4192/';
const live=target.startsWith('https:'),out=path.join(root,'evidence/arrow-match');
(async()=>{
 const results=[];
 for(const engine of ['webkit','chromium']){
  const browser=await(engine==='webkit'?webkit.launch({headless:true}):chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}));
  for(const width of [393,1440]){
   const page=await browser.newPage({viewport:{width,height:900},isMobile:width<700,hasTouch:width<700});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(target,{waitUntil:'networkidle'});
   await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
   await page.evaluate(async()=>{await document.fonts.load('800 12px "Jiukui Project Arrow"','↗');await document.fonts.ready});
   const link=page.locator('.project-actions .project-link').first(),arrow=link.locator('.project-arrow');
   await link.evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-300,behavior:'instant'}));
   const item=await arrow.evaluate(e=>{const c=getComputedStyle(e);return{text:e.textContent,font:c.fontFamily,size:c.fontSize,weight:c.fontWeight,margin:c.marginLeft,lineHeight:c.lineHeight,spacing:c.letterSpacing,transition:c.transition}});
   Object.assign(item,{engine,width,count:await page.locator('.project-arrow').count(),svgCount:await page.locator('.project-actions .project-link svg').count(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
   if(width===1440){
    await link.hover();
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('.project-arrow')).transform==='matrix(1, 0, 0, 1, 6, -3)',null,{timeout:4000});
    item.hover=await arrow.evaluate(e=>getComputedStyle(e).transform);
   }
   item.pass=item.text==='↗'&&item.size==='12px'&&item.weight==='800'&&item.margin==='8px'&&item.count===6&&!item.svgCount&&!item.overflow&&!errors.length;
   item.errors=errors;results.push(item);
   await link.screenshot({path:path.join(out,`${live?'live':'local'}-${engine}-${width}.png`)});
   await page.close();
  }
  await browser.close();
 }
 fs.writeFileSync(path.join(out,`${live?'live':'local'}-checks.json`),JSON.stringify(results,null,2));
 console.log(JSON.stringify({target,checks:results.length,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass)}));if(results.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
