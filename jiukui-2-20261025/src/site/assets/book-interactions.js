(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const animations = new Set();
  function play(node, frames, duration, delay = 0) {
    if (!node || reduce.matches || !node.animate) return;
    const a = node.animate(frames, {duration,delay,easing:ease});
    animations.add(a);
    a.finished.catch(() => {}).finally(() => animations.delete(a));
  }
  function engrave(container, duration = 900) {
    container?.querySelectorAll('path').forEach((path, i) => {
      path.setAttribute('pathLength','1');
      play(path,[{strokeDasharray:'1',strokeDashoffset:'1',opacity:.1},{strokeDasharray:'1',strokeDashoffset:'0',opacity:1}],duration,Math.min(i*45,135));
    });
  }
  const hero = document.querySelector('.hero');
  if (!location.hash || location.hash === '#top') {
    play(hero.querySelector('h1'),[{clipPath:'inset(0 100% 0 0)',opacity:.12},{clipPath:'inset(0 0 0 0)',opacity:1}],800);
    for (const selector of ['.identity','.hello','.bio','.personal']) play(hero.querySelector(selector),[{opacity:.08},{opacity:1}],650,selector==='.personal'?200:80);
    play(hero.querySelector('.portrait-plate'),[{opacity:.12},{opacity:1}],850,90);
    play(hero.querySelector('.botanical'),[{clipPath:'inset(100% 0 0 0)',opacity:.15},{clipPath:'inset(0 0 0 0)',opacity:1}],1050,100);
  }
  const ornaments = new IntersectionObserver(entries => {
    for (const entry of entries) if(entry.isIntersecting) {
      ornaments.unobserve(entry.target);
      engrave(entry.target);
    }
  }, {threshold:.4});
  document.querySelectorAll('.engraving').forEach(node => ornaments.observe(node));

  const ns='http://www.w3.org/2000/svg';
  document.querySelectorAll('.project-card,.artwork').forEach(card => {
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('class','print-corners');svg.setAttribute('viewBox','0 0 100 100');
    svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS(ns,'path');
    path.setAttribute('d','M14 1H1V14M86 1H99V14M1 86V99H14M86 99H99V86');path.setAttribute('pathLength','1');
    svg.append(path);card.append(svg);
  });

  const stage=hero.querySelector('.portrait-stage');
  let lightFrame=0,lightX=0,lightY=0,stageBox;
  function paintLight(){
    lightFrame=0;
    if(!stageBox || !fine.matches || reduce.matches)return;
    const x=(lightX-stageBox.left)/stageBox.width,y=(lightY-stageBox.top)/stageBox.height;
    stage.style.setProperty('--shadow-x',`${(x-.5)*14}px`);
    stage.style.setProperty('--shadow-y',`${10+y*8}px`);
    stage.style.setProperty('--paper-light',`${x*100}% ${y*100}%`);
  }
  stage.addEventListener('pointerenter',e=>{stageBox=stage.getBoundingClientRect();lightX=e.clientX;lightY=e.clientY;if(!lightFrame)lightFrame=requestAnimationFrame(paintLight)});
  stage.addEventListener('pointermove',e=>{lightX=e.clientX;lightY=e.clientY;if(!lightFrame)lightFrame=requestAnimationFrame(paintLight)});
  function resetLight(){stageBox=null;cancelAnimationFrame(lightFrame);lightFrame=0;stage.style.removeProperty('--shadow-x');stage.style.removeProperty('--shadow-y');stage.style.removeProperty('--paper-light')}
  stage.addEventListener('pointerleave',resetLight);

  const loupe=document.createElement('div');loupe.className='print-loupe';loupe.setAttribute('aria-hidden','true');document.body.append(loupe);
  let current=null,box=null,frame=0,px=0,py=0,ready=false,generation=0,suppressUntilMove=false;
  const loaded=new Set();
  function hideLoupe(){generation++;current=null;box=null;ready=false;loupe.classList.remove('active');cancelAnimationFrame(frame);frame=0}
  function paintLoupe(){
    frame=0;if(!current||!ready||!box)return;
    const size=172,zoom=2.15,border=5;
    const left=Math.max(10,Math.min(innerWidth-size-10,px-size/2));
    const top=Math.max(10,Math.min(innerHeight-size-10,py-size/2));
    loupe.style.transform=`translate(${left}px,${top}px)`;
    loupe.style.backgroundSize=`${box.width*zoom}px ${box.height*zoom}px`;
    loupe.style.backgroundPosition=`${size/2-border-(px-box.left)*zoom}px ${size/2-border-(py-box.top)*zoom}px`;
    loupe.classList.add('active');
  }
  function beginLoupe(link,e){
      if(!fine.matches||reduce.matches||e.pointerType==='touch')return;
      current=link;box=link.querySelector('img').getBoundingClientRect();px=e.clientX;py=e.clientY;ready=false;
      const ticket=++generation,url=link.href;
      function show(){if(current!==link||ticket!==generation)return;ready=true;loupe.style.backgroundImage=`url("${url}")`;paintLoupe()}
      if(loaded.has(url))show();
      else{const image=new Image();image.onload=()=>{loaded.add(url);show()};image.onerror=()=>{if(current===link&&ticket===generation)hideLoupe()};image.src=url}
  }
  document.querySelectorAll('.artwork-link').forEach(link=>{
    link.addEventListener('pointerenter',e=>{if(!suppressUntilMove)beginLoupe(link,e)});
    link.addEventListener('pointermove',e=>{if(suppressUntilMove){suppressUntilMove=false;beginLoupe(link,e);return}if(current!==link)return;px=e.clientX;py=e.clientY;if(!frame)frame=requestAnimationFrame(paintLoupe)});
    link.addEventListener('pointerleave',hideLoupe);
    link.addEventListener('click',hideLoupe);
  });
  document.querySelector('.image-viewer').addEventListener('close',()=>{hideLoupe();suppressUntilMove=true});
  addEventListener('scroll',()=>{hideLoupe();resetLight()},{passive:true});
  addEventListener('resize',()=>{hideLoupe();resetLight()});
  document.addEventListener('keydown',event=>{hideLoupe();if(event.key==='Tab')for(const a of animations)a.finish()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){hideLoupe();resetLight();for(const a of animations)a.finish()}});
  reduce.addEventListener('change',()=>{if(reduce.matches){hideLoupe();resetLight();for(const a of animations)a.finish()}});
})();
