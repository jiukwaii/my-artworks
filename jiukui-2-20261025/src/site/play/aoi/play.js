/* Minimal game launcher, with no marketing page or account flow. */
(() => {
  const panel=document.querySelector('#loading'),message=document.querySelector('#message'),progress=document.querySelector('#progress'),copy=document.querySelector('#copy');
  document.querySelector('#canvas').addEventListener('contextmenu',event=>event.preventDefault());
  const mobile=matchMedia('(hover: none) and (pointer: coarse)').matches || /Android|iPhone|iPad/.test(navigator.userAgent);
  copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);message.textContent='已複製連結，可以傳到電腦開啟。';}catch{message.textContent='請複製瀏覽器網址，再用電腦開啟。';}});
  if(mobile){message.textContent='這款遊戲需要鍵盤與滑鼠，請使用電腦遊玩。';document.querySelector('#controls').hidden=true;progress.hidden=true;copy.hidden=false;document.querySelector('#note').textContent='手機不會下載大型遊戲資源。';return;}
  const missing=Engine.getMissingFeatures({threads:false});
  if(missing.length){message.textContent='目前瀏覽器無法執行遊戲，請使用較新的 Chrome、Edge 或 Firefox，並確認硬體加速已開啟。';progress.hidden=true;return;}
  const errors=[];window.AOI_WEB_ERRORS=errors;
  const engine=new Engine({executable:'index',canvas:document.querySelector('#canvas'),canvasResizePolicy:2,persistentPaths:['/userfs'],onPrint:(...args)=>console.log(...args),onPrintError:(...args)=>{errors.push(args.join(' '));console.error(...args);},onExit:()=>{if(window.AOI_WEB_QA_REPORT){panel.hidden=false;message.textContent='測試完成';return;}location.assign('https://jiukui.vercel.app/#work');}});
  window.AOI_ENGINE=engine;
  async function start(){
    const manifest=await fetch('manifest.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('manifest');return r.json();});
    window.AOI_WEB_VERSION=manifest.version;
    const initialization=engine.init('index');let received=0;
    const buffers=[];
    for(const part of manifest.parts){const response=await fetch(part.url);if(!response.ok)throw Error('resource '+response.status);const data=await response.arrayBuffer();buffers.push(new Uint8Array(data));received+=data.byteLength;progress.value=Math.round(received/manifest.packBytes*90);message.textContent=`正在載入小鎮… ${progress.value}%`;}
    const pack=new Uint8Array(received);let offset=0;for(const buffer of buffers){pack.set(buffer,offset);offset+=buffer.length;}
    await initialization;progress.value=94;message.textContent='正在準備人物和場景…';
    await engine.preloadFile(pack.buffer,'index.pck');
    await engine.start({args:['--main-pack','index.pck',...(window.AOI_RUN_FLOW?['--','--qa-summer']:[])]});
    progress.value=100;panel.hidden=true;document.querySelector('#canvas').focus();window.AOI_WEB_STARTED=true;
  }
  start().catch(error=>{console.error(error);panel.hidden=false;progress.hidden=true;message.textContent='載入沒有完成。請重新整理再試一次；若仍無法開啟，請換用電腦版 Chrome 或 Edge。';window.AOI_WEB_START_ERROR=String(error);});
})();
