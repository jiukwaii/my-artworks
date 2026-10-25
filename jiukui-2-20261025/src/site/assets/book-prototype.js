(() => {
  'use strict';
  const travel = document.querySelector('.book-travel');
  if (!travel) return;
  const stage = travel.querySelector('.book-stage');
  const scene = travel.querySelector('.book-scene');
  const leaf = travel.querySelector('.turning-leaf');
  const front = leaf.querySelector('.leaf-front');
  const back = leaf.querySelector('.leaf-back');
  const firstPage = travel.querySelector('.spread-one .book-right');
  const nextPhoto = travel.querySelector('.spread-two .book-left');
  const firstPhoto = travel.querySelector('.spread-one .book-left');
  for (const [source, destination] of [[firstPage, front], [nextPhoto, back]]) {
    const clone = source.cloneNode(true);
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    destination.append(clone);
  }
  const media = matchMedia('(min-width: 901px) and (min-height: 650px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false;
  let near = false;
  let frame = 0;
  let stickyTop = 0;
  let range = 1;
  let progress = -1;
  function render() {
    frame = 0;
    if (!active || document.hidden) return;
    // The gallery above can reflow after images/fonts load or columns change.
    // Use the book's live viewport position instead of a cached document offset.
    const raw = Math.max(0, Math.min(1, (stickyTop - travel.getBoundingClientRect().top) / Math.max(1, range)));
    const p = Math.max(0, Math.min(1, (raw - .22) / .56));
    if (Math.abs(p - progress) < .0001) return;
    progress = p;
    leaf.style.transform = `rotateY(${-180 * p}deg)`;
    firstPhoto.style.opacity = p >= .999 ? '0' : '1';
    for (const face of [front, back]) face.style.setProperty('--leaf-shade', String(Math.sin(p * Math.PI) * .1));
    scene.dataset.page = p < .5 ? '1' : '2';
    scene.dataset.turnProgress = p.toFixed(3);
    // Keep only the short turning interval on a promoted layer.
    leaf.style.willChange = p > 0 && p < 1 ? 'transform' : 'auto';
  }
  function queue() {
    if (active && near && !frame) frame = requestAnimationFrame(render);
  }
  function measure() {
    const enabled = media.matches && !reduce.matches;
    active = enabled;
    travel.classList.toggle('book-enabled', enabled);
    if (!enabled) {
      travel.style.removeProperty('height');
      travel.style.removeProperty('--book-height');
      firstPhoto.style.removeProperty('opacity');
      leaf.style.removeProperty('transform');
      leaf.style.willChange = 'auto';
      for (const face of [front, back]) face.style.removeProperty('--leaf-shade');
      scene.dataset.page = '1';
      delete scene.dataset.turnProgress;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      return;
    }
    const header = document.querySelector('.site-header').getBoundingClientRect().height;
    const height = Math.round(Math.min(654, innerHeight - header - 74));
    travel.style.setProperty('--book-height', height + 'px');
    travel.style.height = height + 16 + Math.round(innerHeight * 1.05) + 'px';
    stickyTop = header + 24;
    range = travel.offsetHeight - stage.offsetHeight;
    progress = -1;
    render();
  }
  new IntersectionObserver(entries => {
    near = entries[0].isIntersecting;
    if (near) queue();
  }, {rootMargin:'150px 0px'}).observe(travel);
  // Reconcile progress when upstream content changes even without a wheel event.
  // Only queue a frame: changing transforms does not resize the observed page.
  new ResizeObserver(queue).observe(document.querySelector('.page'));
  window.addEventListener('scroll', queue, {passive:true});
  window.addEventListener('resize', measure, {passive:true});
  media.addEventListener('change', measure);
  reduce.addEventListener('change', measure);
  document.addEventListener('visibilitychange', () => {if (!document.hidden) queue();});
  document.fonts.ready.then(measure);
  measure();
})();
