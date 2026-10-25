const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..'),base='http://127.0.0.1:4192/';
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const checks=[];const check=(name,pass)=>checks.push({name,pass:!!pass});
 for(const game of [{path:'bird-jump',button:'#mainButton'},{path:'cross-chicken',button:'#mainBtn'}]){
  const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'games/'+game.path+'/');await p.locator(game.button).click();check(game.path+' starts',await p.locator('#overlay').evaluate(e=>e.classList.contains('hidden')));await p.keyboard.press('Space');await p.waitForTimeout(100);check(game.path+' no runtime errors',!errors.length);await p.close();
 }
 const p=await b.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce'});await p.goto(base,{waitUntil:'networkidle'});await p.keyboard.press('Tab');check('Skip link first in keyboard order',await p.locator('.skip-link').evaluate(e=>document.activeElement===e));await p.keyboard.press('Enter');check('Skip link focuses work',await p.evaluate(()=>document.activeElement.id==='work'));
 for(const id of ['work','illustration','about','contact']){await p.locator(`nav a[href="#${id}"]`).click();await p.waitForTimeout(100);check(id+' anchor header clearance',await p.locator('#'+id).evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('.site-header').offsetHeight-1));}
 check('No language implementation',await p.locator('[hreflang],.language-switch').count()===0);check('Email and Instagram real channels',await p.locator('a[href="mailto:jiukui.art@gmail.com"]').count()===1&&await p.locator('a[href="https://www.instagram.com/jiukui_art/"]').count()===1);
 await b.close();fs.writeFileSync(path.join(root,'evidence/qa/final.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify({checks:checks.length,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass)}));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
