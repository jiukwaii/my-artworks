const {chromium,webkit}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),target=process.argv[2]||'http://127.0.0.1:4192/';
const live=target.startsWith('https:'),out=path.join(root,'evidence/showcase-interactions');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const results=[];
 for(const engine of ['webkit','chromium'])for(const width of [393,1440])for(const reducedMotion of ['no-preference','reduce']){
  const browser=await(engine==='webkit'?webkit.launch({headless:true}):chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}));
  const p=await browser.newPage({viewport:{width,height:900},isMobile:width<700,hasTouch:width<700,reducedMotion});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(target,{waitUntil:'networkidle'});
  const row={engine,width,reducedMotion,videos:[],menu:null};
  const vids=p.locator('[data-exhibit-video]');
  for(let i=0;i<await vids.count();i++){
   const video=vids.nth(i);await video.scrollIntoViewIfNeeded();
   let started=true;try{await p.waitForFunction(el=>!el.paused&&el.readyState>=2,await video.elementHandle(),{timeout:8000})}catch{started=false}
   const start=await video.evaluate(v=>({name:v.dataset.exhibitName,started:!v.paused,muted:v.muted,loop:v.loop,inline:v.playsInline,controls:v.controls,role:v.getAttribute('role'),tabIndex:v.tabIndex,time:v.currentTime,pointerEvents:getComputedStyle(v).pointerEvents}));
   const box=await video.boundingBox();await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await p.waitForTimeout(250);
   const end=await video.evaluate(v=>({paused:v.paused,time:v.currentTime}));
   start.pass=started&&start.muted&&start.loop&&start.inline&&!start.controls&&!start.role&&start.tabIndex<0&&start.pointerEvents==='none'&&!end.paused&&Math.abs(end.time-start.time)>.01;
   start.afterTap=end;row.videos.push(start);
   if(width===393&&reducedMotion==='no-preference')await p.screenshot({path:path.join(out,`${live?'live':'local'}-${engine}-video-${i}.png`)});
  }
  row.arrows=await p.locator('.project-actions .project-link .project-arrow').evaluateAll(nodes=>nodes.map(n=>n.textContent));
  if(width<700){
   await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));const button=p.locator('.nav-toggle'),line=p.locator('.menu-stroke').first();
   const closed=await line.evaluate(e=>getComputedStyle(e).transform);await button.click();
   if(reducedMotion!=='reduce')await p.waitForFunction(closed=>getComputedStyle(document.querySelector('.menu-stroke')).transform!==closed&&Number(getComputedStyle(document.querySelectorAll('.menu-stroke')[1]).opacity)>0,closed,{timeout:3000});
   const middle=await line.evaluate(e=>getComputedStyle(e).transform);
   await p.waitForFunction(()=>getComputedStyle(document.querySelectorAll('.menu-stroke')[1]).opacity==='0',null,{timeout:3000});
   const open=await line.evaluate(e=>getComputedStyle(e).transform);
   row.menu={closed,middle,open,visible:await p.locator('nav').isVisible(),expanded:await button.getAttribute('aria-expanded'),middleOpacity:await p.locator('.menu-stroke').nth(1).evaluate(e=>getComputedStyle(e).opacity)};
   await p.keyboard.press('Escape');await p.waitForFunction(closed=>getComputedStyle(document.querySelector('.menu-stroke')).transform===closed,closed,{timeout:3000});row.menu.closedAgain=await line.evaluate(e=>getComputedStyle(e).transform);row.menu.focusRestored=await button.evaluate(e=>document.activeElement===e);
   row.menu.pass=row.menu.visible&&row.menu.expanded==='true'&&row.menu.middleOpacity==='0'&&closed===row.menu.closedAgain&&row.menu.focusRestored&&(reducedMotion==='reduce'||(middle!==closed&&middle!==open));
   if(reducedMotion==='no-preference'){await button.click();await p.waitForTimeout(320);await p.screenshot({path:path.join(out,`${live?'live':'local'}-${engine}-menu-open.png`)});await p.locator('nav a[href="#work"]').click()}
  }
  row.errors=errors;row.overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  row.pass=!errors.length&&!row.overflow&&row.videos.length===3&&row.videos.every(v=>v.pass)&&row.arrows.length===6&&row.arrows.every(a=>a==='↗')&&(!row.menu||row.menu.pass);
  results.push(row);console.log(`${engine} ${width} ${reducedMotion}: ${row.pass?'PASS':'FAIL'}`);await browser.close();
 }
 fs.writeFileSync(path.join(out,`${live?'live':'local'}-checks.json`),JSON.stringify(results,null,2));
 console.log(JSON.stringify({target,checks:results.length,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass)},null,2));if(results.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
