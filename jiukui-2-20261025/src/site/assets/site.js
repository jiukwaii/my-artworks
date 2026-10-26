(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  const navLinks = [...document.querySelectorAll('.masthead nav a')];
  // Keep keyboard focus visible, without pointer-initiated focus rings in dialogs.
  addEventListener('pointerdown', () => document.documentElement.classList.add('pointer-input'), {capture:true,passive:true});
  addEventListener('keydown', event => {
    if (!['Shift','Control','Alt','Meta'].includes(event.key)) document.documentElement.classList.remove('pointer-input');
  }, {capture:true});
  const navToggle = header.querySelector('.nav-toggle');
  const navigation = header.querySelector('nav');
  const mobileNav = matchMedia('(max-width: 700px)');
  function setMenu(open, restoreFocus = false) {
    const expanded = mobileNav.matches && open;
    navToggle.setAttribute('aria-expanded', String(expanded));
    navToggle.setAttribute('aria-label', expanded ? '關閉導覽選單' : '開啟導覽選單');
    navigation.hidden = mobileNav.matches && !expanded;
    if (restoreFocus && mobileNav.matches) navToggle.focus({preventScroll:true});
  }
  function syncMenu() {
    header.classList.toggle('mobile-nav-ready', mobileNav.matches);
    setMenu(false);
  }
  navToggle.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
  for (const link of navLinks) link.addEventListener('click', () => setMenu(false));
  document.addEventListener('pointerdown', event => {
    if (!header.contains(event.target)) setMenu(false);
  }, {passive:true});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();setMenu(false, true);
    }
  });
  header.addEventListener('focusout', event => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setMenu(false);
  });
  mobileNav.addEventListener('change', syncMenu);
  syncMenu();
  const sections = [...document.querySelectorAll('main > section[id]')].filter(section =>
    section.id === 'experiments' || navLinks.some(a => a.hash === '#' + section.id)
  );
  const root = document.documentElement;
  const contactRegion = document.getElementById('contact');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const rootStyle = getComputedStyle(root);
  const mainPaper = (rootStyle.getPropertyValue('--paper').trim() || themeColor?.content || '#f2e8d2').toLowerCase();
  const contactPaper = rootStyle.getPropertyValue('--contact-paper').trim() || '#e9dec5';
  let contactSurface = null;
  let readingFrame = 0;
  function updateReading() {
    readingFrame = 0;
    header.classList.toggle('scrolled', scrollY > 12);
    let current = '';
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= innerHeight * .38) {
        current = section.id === 'experiments' ? 'work' : section.id;
      }
    }
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 3) current = 'contact';
    const contactBox = contactRegion.getBoundingClientRect();
    const useContactPaper = contactBox.top < innerHeight && contactBox.bottom > 0;
    if (useContactPaper !== contactSurface) {
      contactSurface = useContactPaper;
      root.classList.toggle('contact-surface', useContactPaper);
      if (themeColor) themeColor.content = useContactPaper ? contactPaper : mainPaper;
    }
    for (const a of navLinks) {
      if (a.hash === '#' + current) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    }
  }
  addEventListener('scroll', () => { if (!readingFrame) readingFrame = requestAnimationFrame(updateReading); }, {passive:true});
  addEventListener('resize', () => { if (!readingFrame) readingFrame = requestAnimationFrame(updateReading); }, {passive:true});
  addEventListener('pageshow', updateReading);
  updateReading();

  const artGrid = document.querySelector('.artwork-grid');
  function arrangeArtworks() {
    const gap = innerWidth <= 700 ? 20 : 32;
    const items = [...artGrid.children];
    artGrid.classList.remove('masonry-ready');
    for (const item of items) {
      item.style.removeProperty('grid-column');
      item.style.removeProperty('grid-row-start');
      item.style.removeProperty('grid-row-end');
    }
    const columns = getComputedStyle(artGrid).gridTemplateColumns.trim().split(/\s+/).length;
    const heights = items.map(item => {
      const style = getComputedStyle(item);
      return Math.ceil(item.querySelector('img').getBoundingClientRect().height + item.querySelector('figcaption').getBoundingClientRect().height + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + 2 + gap);
    });
    const count = Math.ceil(items.length / columns);
    const first = Array.from({length:columns}, (_, i) => [i]);
    const remaining = items.map((_, i) => i).slice(columns);
    let best = first;
    let bestCost = Infinity;
    function combinations(values, needed, start, chosen, visit) {
      if (!needed) {visit(chosen);return;}
      for (let i=start;i<=values.length-needed;i++) combinations(values,needed-1,i+1,chosen.concat(values[i]),visit);
    }
    function partition(column, left, groups) {
      if (column === columns - 1) {
        const bins = groups.concat([first[column].concat(left)]);
        const totals = bins.map(bin => bin.reduce((sum, index) => sum + heights[index], 0));
        const cost = Math.max(...totals) - Math.min(...totals);
        if (cost < bestCost) {bestCost = cost;best = bins;}
        return;
      }
      combinations(left,count-1,0,[],selection => {
        partition(column+1,left.filter(index => !selection.includes(index)),groups.concat([first[column].concat(selection)]));
      });
    }
    partition(0,remaining,[]);
    best.forEach((bin, column) => {
      let row = 1;
      for (const index of bin) {
        items[index].style.gridColumn = String(column + 1);
        items[index].style.gridRowStart = String(row);
        items[index].style.gridRowEnd = 'span ' + heights[index];
        row += heights[index];
      }
    });
    artGrid.classList.add('masonry-ready');
  }
  let artWidth = 0;
  let artFrame = 0;
  function scheduleArtworks() {
    if (!artFrame) artFrame = requestAnimationFrame(() => {
      artFrame = 0;
      arrangeArtworks();
    });
  }
  new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    if (Math.abs(width - artWidth) < 1) return;
    artWidth = width;
    scheduleArtworks();
  }).observe(artGrid);
  document.fonts.ready.then(scheduleArtworks);
  artGrid.querySelectorAll('img').forEach(img => img.addEventListener('load', scheduleArtworks));

  const running = new Set();
  const ease = 'cubic-bezier(.22,1,.36,1)';
  function fade(element, duration, initial = .42, delay = 0) {
    if (reduce.matches || !element.animate) return;
    const animation = element.animate([{opacity: initial}, {opacity: 1}], {duration, delay, easing:ease});
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
  }
  function reveal(element, delay = 0) {
    if (!element || reduce.matches || !element.animate) return;
    const animation = element.animate([
      {opacity:0,transform:'translateY(28px)'},
      {opacity:1,transform:'translateY(0px)'}
    ], {
      duration:760, delay, easing:ease, fill:'backwards'
    });
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
  }
  const entering = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      entering.unobserve(el);
      el.classList.remove('scroll-reveal-pending');
      if (reduce.matches) continue;
      if (el.dataset.enter === 'heading') {
        el.classList.add('heading-arrival');
        reveal(el);
      } else if (el.dataset.enter === 'card') {
        const rowDelay = innerWidth > 700 && [...el.parentElement.children].indexOf(el) % 2 ? 70 : 0;
        reveal(el, rowDelay);
      } else if (el.dataset.enter === 'art') {
        const columns = innerWidth <= 700 ? 2 : 3;
        const delay = [...el.parentElement.children].indexOf(el) % columns * 70;
        reveal(el, delay);
      } else reveal(el);
    }
  }, {threshold:.12,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('[data-enter]').forEach(el => {
    if (!reduce.matches) el.classList.add('scroll-reveal-pending');
    entering.observe(el);
  });
  reduce.addEventListener('change', () => {
    if (!reduce.matches) return;
    for (const a of running) a.finish();
    document.querySelectorAll('.scroll-reveal-pending').forEach(el => el.classList.remove('scroll-reveal-pending'));
  });
  document.addEventListener('focusin', event => {
    const target = event.target.closest?.('.scroll-reveal-pending');
    if (target) {target.classList.remove('scroll-reveal-pending');entering.unobserve(target);}
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') for (const animation of running) animation.finish();
  });
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    for (const a of running) a.finish();
    const headerHeight = header.getBoundingClientRect().height;
    const top = link.hash === '#top' ? 0 : target.getBoundingClientRect().top + scrollY - headerHeight - 24;
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    window.scrollTo({top:Math.max(0,top),behavior:reduce.matches ? 'instant' : 'smooth'});
    if (link.hash === '#top' && !document.documentElement.classList.contains('pointer-input')) document.querySelector('.wordmark').focus({preventScroll:true});
    if (link.closest('nav') && !document.documentElement.classList.contains('pointer-input')) {
      target.tabIndex = -1;
      target.focus({preventScroll:true});
    }
    if (link.classList.contains('skip-link')) {
      target.tabIndex = -1;
      target.focus({preventScroll:true});
    }
  }));

  const dialog = document.querySelector('.image-viewer');
  const viewImage = document.querySelector('#viewer-image');
  const caption = document.querySelector('#viewer-caption');
  const counter = document.querySelector('#viewer-counter');
  const status = document.querySelector('.viewer-status');
  const prev = document.querySelector('.viewer-prev');
  const next = document.querySelector('.viewer-next');
  const artworks = [...document.querySelectorAll('[data-artwork]')];
  const modelPhotos = [...document.querySelectorAll('[data-model-photo]')];
  let collection = artworks;
  let opener = null;
  let index = -1;
  let restoreY = 0;
  let imageOrigin = null;
  function showImage(link, newIndex = -1) {
    index = newIndex;
    caption.textContent = link.dataset.caption;
    const datedCaption = link.hasAttribute('data-artwork') && link.dataset.caption.match(/^(.*) · (\d{4}(?:\.\d{2})?)$/);
    if (datedCaption) {
      caption.textContent = datedCaption[1] + ' · ';
      const date = document.createElement('span');
      date.className = 'creation-date';
      date.textContent = datedCaption[2];
      caption.append(date);
    }
    counter.textContent = index < 0 ? '模型照片' : `${index + 1} / ${collection.length}`;
    prev.hidden = next.hidden = index < 0;
    prev.disabled = index <= 0;
    next.disabled = index >= collection.length - 1;
    // Disabling the focused endpoint must not drop keyboard focus outside the modal.
    if ((document.activeElement === prev && prev.disabled) || (document.activeElement === next && next.disabled)) {
      const alternate = document.activeElement === prev ? next : prev;
      (alternate.disabled || alternate.hidden ? dialog.querySelector('.viewer-close') : alternate).focus({preventScroll:true});
    }
    const noun = collection === modelPhotos ? '張照片' : '幅插畫';
    prev.setAttribute('aria-label', '上一' + noun);
    next.setAttribute('aria-label', '下一' + noun);
    status.hidden = false;
    status.textContent = '正在載入原圖…';
    dialog.classList.remove('viewer-error');
    viewImage.classList.add('viewer-loading');
    viewImage.alt = link.dataset.caption;
    viewImage.src = link.href;
  }
  viewImage.addEventListener('load', () => {
    status.hidden = true;
    dialog.classList.remove('viewer-error');
    viewImage.classList.remove('viewer-loading');
    if (imageOrigin && dialog.open && !reduce.matches) {
      const final = viewImage.getBoundingClientRect();
      const from = imageOrigin;
      imageOrigin = null;
      if (final.width && final.height && from.width && from.height) {
        const dx = from.left + from.width / 2 - final.left - final.width / 2;
        const dy = from.top + from.height / 2 - final.top - final.height / 2;
        const a = viewImage.animate([
          {transform:`translate(${dx}px,${dy}px) scale(${from.width/final.width},${from.height/final.height})`,opacity:.72},
          {transform:'translate(0,0) scale(1)',opacity:1}
        ], {duration:380,easing:ease});
        running.add(a);
        a.finished.catch(()=>{}).finally(()=>running.delete(a));
      }
    } else fade(viewImage, 240, .15);
  });
  viewImage.addEventListener('error', () => {
    dialog.classList.add('viewer-error');
    viewImage.classList.remove('viewer-loading');
    status.textContent = '原圖暫時無法載入。請切換另一幅，或關閉後重試。';
    status.hidden = false;
  });
  document.querySelectorAll('.image-link').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.showModal) return;
    event.preventDefault();
    opener = link;
    imageOrigin = link.querySelector('img')?.getBoundingClientRect() || null;
    restoreY = scrollY;
    collection = link.hasAttribute('data-model-photo') ? modelPhotos : artworks;
    showImage(link, link.hasAttribute('data-model-photo') ? modelPhotos.indexOf(link) : link.hasAttribute('data-artwork') ? Number(link.dataset.artwork) : -1);
    dialog.showModal();
    document.body.classList.add('viewer-open');
    updateVideo();
    document.querySelector('.viewer-close').focus({preventScroll:true});
    fade(dialog, 220, .65);
  }));
  function step(offset) {
    if (index < 0 || index + offset < 0 || index + offset >= collection.length) return;
    imageOrigin = null;
    showImage(collection[index + offset], index + offset);
  }
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  document.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') {event.preventDefault();step(1);}
    if (event.key === 'ArrowLeft') {event.preventDefault();step(-1);}
  });
  dialog.addEventListener('close', () => {
    imageOrigin = null;
    for (const a of viewImage.getAnimations()) a.cancel();
    document.body.classList.remove('viewer-open');
    window.scrollTo({top:restoreY,behavior:'instant'});
    opener?.focus({preventScroll:true});
    updateVideo();
  });

  document.querySelectorAll('img:not(#viewer-image):not([aria-hidden="true"])').forEach(img => {
    const parent = img.parentElement;
    img.addEventListener('error', () => parent.classList.add('image-failure'));
    img.addEventListener('load', () => parent.classList.remove('image-failure'));
    if (img.complete && !img.naturalWidth) parent.classList.add('image-failure');
  });

  function setupCanvasSurface(video, canRender) {
    if (!video.parentElement.classList.contains('pet-film')) return;
    const host = video.parentElement;
    if (host.classList.contains('media-error')) return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    let context;
    try { context = canvas.getContext('2d', {alpha:false}); } catch (_) { return; }
    if (!context) return; // Native inline video remains the no-canvas fallback.
    host.append(canvas);
    let ticket = 0;
    let failed = false;
    let lastPaint = 0;
    const frameCallback = typeof video.requestVideoFrameCallback === 'function';
    function cancel() {
      if (!ticket) return;
      if (frameCallback) video.cancelVideoFrameCallback(ticket);
      else cancelAnimationFrame(ticket);
      ticket = 0;
    }
    function fallback() {
      failed = true;
      cancel();
      host.classList.remove('canvas-ready');
      canvas.remove();
    }
    function paint() {
      if (failed || video.readyState < 2 || !video.videoWidth) return;
      try {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        context.fillStyle = '#e9e3d7';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        host.classList.add('canvas-ready');
      } catch (_) { fallback(); }
    }
    function queue() {
      if (failed || ticket || !canRender()) return;
      ticket = frameCallback ? video.requestVideoFrameCallback(frame) : requestAnimationFrame(frame);
    }
    function frame(now) {
      ticket = 0;
      if (!canRender()) return;
      // The fallback draws at most 30fps; native callbacks follow decoded frames.
      if (frameCallback || now - lastPaint >= 32) { paint(); lastPaint = now; }
      queue();
    }
    video.addEventListener('playing', () => {paint();queue();});
    video.addEventListener('pause', cancel);
    video.addEventListener('loadeddata', () => {paint();queue();});
    video.addEventListener('seeked', () => {paint();queue();});
    video.addEventListener('error', fallback);
    video.querySelector('source')?.addEventListener('error', fallback);
    paint();
    queue();
  }

  function setupExhibitVideo(video) {
    const exhibitName = video.dataset.exhibitName || '模型影片';
    let visible = false;
    let pending = false;
    let retryCount = 0;
    let retryTimer = 0;
    let scrollTimer = 0;
    function allowedToAutoplay() {
      return visible && !document.hidden && !dialog.open && !video.parentElement.classList.contains('media-error');
    }
    function clearRetry() {
      clearTimeout(retryTimer);
      retryTimer = 0;
    }
    function pauseVideo() {
      video.autoplay = false;
      clearRetry();
      if (!video.paused) video.pause();
    }
    function retryPlayback() {
      if (!allowedToAutoplay() || retryTimer || retryCount >= 3) return;
      retryTimer = setTimeout(() => {
        retryTimer = 0;
        retryCount++;
        updateVideo();
      }, 250 * (retryCount + 1));
    }
    function updateVideo() {
      if (!allowedToAutoplay()) {pauseVideo();return;}
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      if (pending || !video.paused) return;
      pending = true;
      video.play().then(() => {
        retryCount = 0;
        if (!allowedToAutoplay()) pauseVideo();
      }).catch(() => {retryPlayback();}).finally(() => {pending = false;});
    }
    function refreshVideo() {
      const rect = video.getBoundingClientRect();
      const shownHeight = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, header.offsetHeight));
      const shownWidth = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
      const nextVisible = shownWidth > 0 && shownHeight >= Math.min(140, rect.height * .3);
      if (nextVisible !== visible) retryCount = 0;
      visible = nextVisible;
      updateVideo();
    }
    video.addEventListener('pause', () => {if (allowedToAutoplay()) retryPlayback();});
    video.addEventListener('playing', () => {retryCount = 0;clearRetry();});
    for (const event of ['loadedmetadata', 'loadeddata', 'canplay']) video.addEventListener(event, () => {
      retryCount = 0;
      refreshVideo();
    });
    // A silent inline exhibit, without a visible player toolbar.
    video.controls = false;
    video.playbackRate = 1;
    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.disablePictureInPicture = true;
    video.tabIndex = -1;
    video.removeAttribute('role');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-label', exhibitName);
    function mediaError() {
      video.removeAttribute('role');
      video.removeAttribute('tabindex');
      video.setAttribute('aria-label', exhibitName + '暫時無法播放，顯示預覽圖');
      video.parentElement.classList.add('media-error');
    }
    video.addEventListener('error', mediaError);
    video.querySelector('source')?.addEventListener('error', mediaError);
    if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) mediaError();
    new IntersectionObserver(refreshVideo, {threshold:[0,.05,.15,.3,.5,.8,1]}).observe(video);
    addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(refreshVideo, 90);
    }, {passive:true});
    addEventListener('resize', refreshVideo, {passive:true});
    addEventListener('pageshow', refreshVideo);
    document.addEventListener('visibilitychange', refreshVideo);
    // Offscreen exhibits must not compete with the first-screen portrait.
    // A direct jump into a project still starts playback immediately via play().
    let nearForPreload = false;
    let warmed = false;
    const portrait = document.querySelector('.portrait');
    function warmVideo() {
      if (warmed || !nearForPreload || document.hidden) return;
      if (portrait && !portrait.complete) return;
      warmed = true;
      video.preload = 'auto';
      if (video.readyState === 0 && video.paused && !pending) video.load();
      warmObserver.unobserve(video);
    }
    const warmObserver = new IntersectionObserver(entries => {
      nearForPreload = entries[0].isIntersecting;
      warmVideo();
    }, {rootMargin:'200px 0px'});
    warmObserver.observe(video);
    portrait?.addEventListener('load', warmVideo, {once:true});
    portrait?.addEventListener('error', warmVideo, {once:true});
    setupCanvasSurface(video, () => allowedToAutoplay() && !video.paused);
    refreshVideo();
    return refreshVideo;
  }
  const videoControllers = [...document.querySelectorAll('[data-exhibit-video]')].map(setupExhibitVideo);
  function updateVideo() { videoControllers.forEach(refresh => refresh()); }
  for (const event of ['pointerdown', 'touchend', 'keydown']) {
    document.addEventListener(event, updateVideo, {passive:true});
  }
})();
