'use strict';

// SAWT canonical tone rule (v0.5):
// - A tone is an actual mark drawn ABOVE the consonant it is attached to.
// - TRAY = TR with AY above R; TRYING = TR with AI above R plus the -ING (+) modifier.
// - CAT = CT with AE above C; DOG = DG with AO above D.
// - Bracket forms such as TR[AY] are teaching notation only, never the finished shorthand.
// - EE and AY must remain distinct: EE rises (/), AY falls like a grave accent (\\).

const soundData = [
  { id: 'AA', ipa: '/ɑː/', example: 'father', type: 'observed', mark: 'tickUp', label: 'long a' },
  { id: 'EE', ipa: '/iː/', example: 'see', type: 'observed', mark: 'slashUp', label: 'long e' },
  { id: 'OO', ipa: '/uː/', example: 'moon', type: 'observed', mark: 'dashAbove', label: 'long oo' },
  { id: 'AY', ipa: '/eɪ/', example: 'tray / day', type: 'observed', mark: 'slashDown', label: 'ay' },
  { id: 'O', ipa: '/ɒ ~ ɔ/', example: 'hot', type: 'observed', mark: 'slash', label: 'short o' },
  { id: 'AE', ipa: '/æ/', example: 'cat', type: 'observed', mark: 'caret', label: 'short a' },
  { id: 'AO', ipa: '/oʊ ~ ɔ/', example: 'dog / go', type: 'observed', mark: 'vee', label: 'o family' },
  { id: 'AI', ipa: '/aɪ/', example: 'time / my', type: 'observed', mark: 'arch', label: 'long i' },
  { id: 'AU', ipa: '/aʊ/', example: 'now / out', type: 'observed', mark: 'cup', label: 'ow' },
  { id: '-ING', ipa: '/ɪŋ/', example: 'trying', type: 'modifier', mark: 'plus', label: 'ending' },
  { id: 'SH', ipa: '/ʃ/', example: 'sharp', type: 'modifier', mark: 'hook', label: 'consonant' },
  { id: '-TION', ipa: '/ʃən/', example: 'motion', type: 'modifier', mark: 'hash', label: 'ending' },

  { id: 'I', ipa: '/ɪ/', example: 'sit', type: 'proposed', mark: 'dotAbove', label: 'short i' },
  { id: 'E', ipa: '/ɛ/', example: 'bed', type: 'proposed', mark: 'dotBelow', label: 'short e' },
  { id: 'UH', ipa: '/ʌ/', example: 'cup', type: 'proposed', mark: 'tickRightUp', label: 'strut vowel' },
  { id: 'UU', ipa: '/ʊ/', example: 'book', type: 'proposed', mark: 'tickRightDown', label: 'short oo' },
  { id: 'SCHWA', ipa: '/ə/', example: 'about', type: 'proposed', mark: 'centerDot', label: 'neutral vowel' },
  { id: 'OY', ipa: '/ɔɪ/', example: 'boy', type: 'proposed', mark: 'ringAbove', label: 'oy' },
  { id: 'AW', ipa: '/ɔː/', example: 'thought', type: 'proposed', mark: 'doubleVee', label: 'broad aw' },
  { id: 'ER', ipa: '/ɜːr ~ ər/', example: 'turn / teacher', type: 'proposed', mark: 'curlBelow', label: 'r-colored' },
  { id: 'CH', ipa: '/tʃ/', example: 'chair', type: 'proposed', mark: 'chevronTail', label: 'consonant' },
  { id: 'TH', ipa: '/θ/', example: 'thin', type: 'proposed', mark: 'thetaOpen', label: 'unvoiced th' },
  { id: 'DH', ipa: '/ð/', example: 'this', type: 'proposed', mark: 'thetaDot', label: 'voiced th' },
  { id: 'ZH', ipa: '/ʒ/', example: 'vision', type: 'proposed', mark: 'zigHook', label: 'zh' },
  { id: 'NG', ipa: '/ŋ/', example: 'sing', type: 'proposed', mark: 'ngHook', label: 'standalone ng' }
];

const vowelIds = ['AA','EE','OO','AY','O','AE','AO','AI','AU','I','E','UH','UU','SCHWA','OY','AW','ER'];
const modifierIds = ['-ING','SH','-TION','CH','TH','DH','ZH','NG'];

const markShapes = {
  tickUp: '<path class="MARK" d="M82 31V55"/>',
  slashUp: '<path class="MARK" d="M69 53l26-17"/>',
  dashAbove: '<path class="MARK" d="M64 40h34"/>',
  slashDown: '<path class="MARK" d="M69 36l26 17"/>',
  slash: '<path class="MARK" d="M73 50l22-14"/>',
  caret: '<path class="MARK" d="M63 52l19-19 19 19"/>',
  vee: '<path class="MARK" d="M63 33l19 19 19-19"/>',
  arch: '<path class="MARK" d="M63 51c8-24 30-24 38 0"/>',
  cup: '<path class="MARK" d="M63 34c8 24 30 24 38 0"/>',
  plus: '<path class="MARK" d="M82 27v42M61 48h42"/>',
  hook: '<path class="MARK" d="M96 29c-28 0-29 27-6 27 19 0 19 27-8 27"/>',
  hash: '<path class="MARK" d="M64 30l-6 50M96 30l-6 50M51 47h56M49 65h56"/>',
  dotAbove: '<circle class="FILL" cx="82" cy="40" r="5.5"/>',
  dotBelow: '<circle class="FILL" cx="82" cy="91" r="5.5"/>',
  tickRightUp: '<path class="MARK" d="M108 43l13-14"/>',
  tickRightDown: '<path class="MARK" d="M108 84l13 14"/>',
  centerDot: '<circle class="FILL" cx="82" cy="70" r="5.5"/>',
  ringAbove: '<circle class="MARK" cx="82" cy="39" r="12"/>',
  doubleVee: '<path class="MARK" d="M54 34l14 16 14-16M81 34l14 16 14-16"/>',
  curlBelow: '<path class="MARK" d="M61 91c0-19 42-19 42 0 0 12-11 17-22 11"/>',
  chevronTail: '<path class="MARK" d="M58 35l19 19 19-19M96 35l14-13"/>',
  thetaOpen: '<path class="MARK" d="M58 49c10-18 38-18 48 0-10 18-38 18-48 0M64 49h36"/>',
  thetaDot: '<path class="MARK" d="M58 49c10-18 38-18 48 0-10 18-38 18-48 0M64 49h36"/><circle class="FILL" cx="82" cy="49" r="4.5"/>',
  zigHook: '<path class="MARK" d="M55 31h50L61 60h46c0 18-11 28-29 28"/>',
  ngHook: '<path class="MARK" d="M60 37c18 0 39 7 42 26 3 17-10 28-27 27M75 90l-11 13"/>'
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function markSvg(mark, live = false, attached = true) {
  const shape = (markShapes[mark] || '').replaceAll('MARK', live ? 'live-mark' : 'mark-stroke').replaceAll('FILL', live ? 'live-fill' : 'mark-fill');
  const base = live || !attached ? '' : '<text class="mark-anchor-letter" x="82" y="103" text-anchor="middle">R</text>';
  return `${base}${shape}`;
}

function buildSoundCards(items) {
  const grid = $('#sound-grid');
  grid.innerHTML = items.map(item => `
    <article class="sound-card" data-type="${item.type}" data-search="${[item.id,item.ipa,item.example,item.label].join(' ').toLowerCase()}">
      <div class="sound-card-head">
        <div><div class="sound-code">${item.id}</div></div>
        <span class="status-badge ${item.type}">${item.type}</span>
      </div>
      <div class="mark-stage">
        <svg viewBox="0 0 164 120" role="img" aria-label="${item.id} shorthand mark">${markSvg(item.mark, false, vowelIds.includes(item.id))}</svg>
      </div>
      <div class="sound-card-foot">
        <span class="sound-ipa">${item.ipa}</span>
        <span class="sound-example">${item.example}</span>
        <button class="speak-button" type="button" data-speak="${item.example.split(' / ')[0]}" aria-label="Hear ${item.example.split(' / ')[0]}">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8v4h3l4 3V5L6 8H3Z"/><path d="M13 7.2a4 4 0 0 1 0 5.6M15 5a7 7 0 0 1 0 10"/></svg>
        </button>
      </div>
    </article>
  `).join('');
}

function setupSoundFilter() {
  const tabs = $$('.filter-tab');
  const search = $('#sound-search');
  const empty = $('#sound-empty');
  let activeFilter = 'all';

  const apply = () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    $$('.sound-card').forEach(card => {
      const typeMatch = activeFilter === 'all' || card.dataset.type === activeFilter;
      const textMatch = !query || card.dataset.search.includes(query);
      const show = typeMatch && textMatch;
      card.hidden = !show;
      if (show) visible += 1;
    });
    empty.hidden = visible !== 0;
  };

  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilter = tab.dataset.filter;
    apply();
  }));
  search.addEventListener('input', apply);

  $('#sound-grid').addEventListener('click', event => {
    const button = event.target.closest('[data-speak]');
    if (!button || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(button.dataset.speak);
    utterance.rate = .82;
    speechSynthesis.speak(utterance);
  });
}

function sanitizeSkeleton(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) || 'TR';
}

function buildAnchoredGlyph(skeleton, tone, anchorIndex, modifierSymbol = '', compact = false) {
  const chars = [...sanitizeSkeleton(skeleton)];
  const width = compact ? 260 : 720;
  const height = compact ? 105 : 350;
  const gap = compact ? 52 : 92;
  const baselineY = compact ? 78 : 244;
  const fontSize = compact ? 54 : 82;
  const safeAnchor = Math.min(Math.max(Number(anchorIndex) || 0, 0), chars.length - 1);
  const totalWidth = Math.max(0, chars.length - 1) * gap;
  const modifierGap = modifierSymbol ? (compact ? 40 : 58) : 0;
  const startX = (width - totalWidth - modifierGap) / 2;
  const anchorX = startX + safeAnchor * gap;
  const markShiftY = compact ? -8 : 82;
  const letters = chars.map((char, index) => `<text class="live-letter" style="font-size:${fontSize}px" x="${startX + index * gap}" y="${baselineY}" text-anchor="middle">${char}</text>`).join('');
  const toneShape = `<g class="attached-tone" transform="translate(${anchorX - 82} ${markShiftY})">${markSvg(tone.mark, true)}</g>`;
  const modifierX = startX + (chars.length - 1) * gap + modifierGap;
  const modifier = modifierSymbol ? `<text class="live-modifier" style="font-size:${compact ? 45 : 70}px" x="${modifierX}" y="${baselineY}" text-anchor="middle">${modifierSymbol}</text>` : '';
  const defs = compact ? '' : '<defs><linearGradient id="liveGradient" x1="0" x2="1"><stop offset="0" stop-color="#75e6ff"/><stop offset=".55" stop-color="#a991ff"/><stop offset="1" stop-color="#f4c86a"/></linearGradient></defs>';
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${skeleton} with ${tone.id} tone above ${chars[safeAnchor]}">${defs}${letters}${toneShape}${modifier}</svg>`;
}

function formulaFor(skeleton, toneId, anchorIndex, modifierId = '') {
  const chars = [...sanitizeSkeleton(skeleton)];
  const safeAnchor = Math.min(Math.max(Number(anchorIndex) || 0, 0), chars.length - 1);
  const left = chars.slice(0, safeAnchor + 1).join('');
  const right = chars.slice(safeAnchor + 1).join('');
  const modifierSymbol = modifierId === '-ING' ? '+' : modifierId === '-TION' ? '#' : modifierId;
  return `${left}[${toneId}]${right}${modifierSymbol || ''}`;
}

function setupComposer() {
  const skeletonInput = $('#skeleton');
  const toneSelect = $('#tone-select');
  const anchorSelect = $('#anchor-select');
  const modifierSelect = $('#modifier-select');

  toneSelect.innerHTML = vowelIds.map(id => {
    const item = soundData.find(x => x.id === id);
    return `<option value="${id}">${id} · ${item.ipa} · ${item.example}</option>`;
  }).join('');

  modifierSelect.innerHTML = '<option value="">None</option>' + modifierIds.map(id => {
    const item = soundData.find(x => x.id === id);
    return `<option value="${id}">${id} · ${item.ipa}</option>`;
  }).join('');

  toneSelect.value = 'AY';

  const refreshAnchors = preferredIndex => {
    const skeleton = sanitizeSkeleton(skeletonInput.value);
    const previous = Number.isInteger(preferredIndex) ? preferredIndex : Number(anchorSelect.value);
    anchorSelect.innerHTML = [...skeleton].map((char, index) => `<option value="${index}">${char} · letter ${index + 1}</option>`).join('');
    const next = Number.isInteger(previous) && previous >= 0 && previous < skeleton.length ? previous : skeleton.length - 1;
    anchorSelect.value = String(next);
  };

  const render = () => {
    const skeleton = sanitizeSkeleton(skeletonInput.value);
    if (skeletonInput.value !== skeleton) skeletonInput.value = skeleton;
    const tone = soundData.find(x => x.id === toneSelect.value) || soundData.find(x => x.id === 'AY');
    const anchorIndex = Math.min(Number(anchorSelect.value) || 0, skeleton.length - 1);
    const modifier = soundData.find(x => x.id === modifierSelect.value);
    const modifierSymbol = modifier ? (modifier.id === '-ING' ? '+' : modifier.id === '-TION' ? '#' : modifier.id) : '';
    const anchorLetter = skeleton[anchorIndex];

    $('#preview-formula').textContent = formulaFor(skeleton, tone.id, anchorIndex, modifier?.id || '');
    $('#meta-skeleton').textContent = skeleton;
    $('#meta-sound').textContent = `${tone.id} ${tone.ipa}`;
    $('#meta-anchor').textContent = `${anchorLetter} · letter ${anchorIndex + 1}`;
    $('#meta-modifier').textContent = modifier ? `${modifier.id} ${modifier.ipa}` : 'None';
    $('#glyph-canvas').innerHTML = buildAnchoredGlyph(skeleton, tone, anchorIndex, modifierSymbol);

    if (window.gsap && !reduceMotion) {
      gsap.fromTo('#glyph-canvas .live-letter', { opacity: .25, y: 4 }, { opacity: 1, y: 0, duration: .3, stagger: .04, ease: 'power2.out' });
      gsap.fromTo('#glyph-canvas .attached-tone .live-mark', { strokeDasharray: 320, strokeDashoffset: 320 }, { strokeDashoffset: 0, duration: .62, ease: 'power2.inOut' });
      gsap.fromTo('#glyph-canvas .attached-tone', { opacity: 0, y: -7 }, { opacity: 1, y: 0, duration: .38, ease: 'back.out(1.7)' });
    }
  };

  skeletonInput.addEventListener('input', () => { refreshAnchors(); render(); });
  toneSelect.addEventListener('change', render);
  anchorSelect.addEventListener('change', render);
  modifierSelect.addEventListener('change', render);

  const presets = {
    tray: { skeleton: 'TR', tone: 'AY', anchor: 1, modifier: '' },
    cat: { skeleton: 'CT', tone: 'AE', anchor: 0, modifier: '' },
    dog: { skeleton: 'DG', tone: 'AO', anchor: 0, modifier: '' },
    trying: { skeleton: 'TR', tone: 'AI', anchor: 1, modifier: '-ING' }
  };

  $$('.preset-row button').forEach(button => button.addEventListener('click', () => {
    const preset = presets[button.dataset.preset];
    skeletonInput.value = preset.skeleton;
    toneSelect.value = preset.tone;
    modifierSelect.value = preset.modifier;
    refreshAnchors(preset.anchor);
    render();
  }));

  $('#copy-formula').addEventListener('click', async () => {
    const text = $('#preview-formula').textContent;
    try { await navigator.clipboard.writeText(text); showToast('Teaching notation copied'); }
    catch { showToast(text); }
  });

  $('#export-svg').addEventListener('click', () => {
    const svg = $('#glyph-canvas svg');
    if (!svg) return;
    const source = `<?xml version="1.0" encoding="UTF-8"?>\n${svg.outerHTML}`;
    const blob = new Blob([source], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sawt-${sanitizeSkeleton(skeletonInput.value).toLowerCase()}-${toneSelect.value.toLowerCase()}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    showToast('SVG exported');
  });

  refreshAnchors(1);
  render();
}

function renderExampleGlyphs() {
  $$('.example-glyph').forEach(node => {
    const tone = soundData.find(x => x.id === node.dataset.tone);
    if (!tone) return;
    const modifier = node.dataset.modifier || '';
    const modifierSymbol = modifier === '-ING' ? '+' : modifier === '-TION' ? '#' : modifier;
    node.innerHTML = buildAnchoredGlyph(node.dataset.skeleton, tone, Number(node.dataset.anchor), modifierSymbol, true);
  });
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function setupTheme() {
  const key = 'sawt-theme';
  const stored = localStorage.getItem(key);
  if (stored === 'light' || stored === 'dark') document.documentElement.dataset.theme = stored;
  $('.theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(key, next);
  });
}

function setupMenu() {
  const toggle = $('.menu-toggle');
  const menu = $('.mobile-menu');
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
  });
  $$('.mobile-menu a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) close(); });
}

function setupGallery() {
  const dialog = $('#image-dialog');
  const image = $('#dialog-image');
  $$('.origin-card').forEach(card => card.addEventListener('click', () => {
    image.src = card.dataset.image;
    if (typeof dialog.showModal === 'function') dialog.showModal();
  }));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}

function setupScrollUI() {
  const progress = $('.scroll-progress span');
  const header = $('#site-header');
  const update = () => {
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    const pct = scrollable > 0 ? (scrollY / scrollable) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    header.classList.toggle('scrolled', scrollY > 30);
  };
  addEventListener('scroll', update, { passive: true });
  update();

  if (matchMedia('(pointer:fine)').matches) {
    const glow = $('.cursor-glow');
    addEventListener('pointermove', event => {
      glow.style.transform = `translate3d(${event.clientX - 210}px, ${event.clientY - 210}px, 0)`;
    }, { passive: true });
  }
}

function setupTilt() {
  if (!matchMedia('(pointer:fine)').matches || reduceMotion) return;
  const card = $('.tilt-card');
  card.addEventListener('pointermove', event => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.style.transform = `rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateZ(0)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
}

function setupAnimations() {
  if (!window.gsap || reduceMotion) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  gsap.set('.hero .reveal', { opacity: 0, y: 26 });
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('.hero .release-pill', { opacity: 1, y: 0, duration: .65 }, .15)
    .to('.hero-title', { opacity: 1, y: 0, duration: .85 }, .25)
    .to('.hero-lead', { opacity: 1, y: 0, duration: .7 }, .42)
    .to('.hero-actions', { opacity: 1, y: 0, duration: .7 }, .5)
    .to('.hero-metrics', { opacity: 1, y: 0, duration: .7 }, .58)
    .to('.hero-visual', { opacity: 1, y: 0, duration: .9 }, .3);

  gsap.set('.glyph-path', { strokeDasharray: 1200, strokeDashoffset: 1200 });
  gsap.set('.glyph-node', { transformOrigin: 'center', scale: 0 });
  gsap.timeline({ delay: .55 })
    .to('.glyph-path', { strokeDashoffset: 0, duration: 1.8, stagger: .14, ease: 'power2.inOut' })
    .to('.glyph-node', { scale: 1, duration: .35, ease: 'back.out(2)' }, '-=.45')
    .from('.floating-token', { opacity: 0, y: 14, scale: .96, stagger: .1, duration: .5 }, '-=.2');

  gsap.to('.token-a', { y: -10, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.token-b', { y: 11, duration: 3.1, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.token-c', { y: -8, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  $$('.reveal').filter(el => !el.closest('.hero')).forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 32,
      duration: .8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  $$('.origin-card img').forEach(img => {
    gsap.fromTo(img, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

function init() {
  buildSoundCards(soundData);
  renderExampleGlyphs();
  setupSoundFilter();
  setupComposer();
  setupTheme();
  setupMenu();
  setupGallery();
  setupScrollUI();
  setupTilt();
  setupAnimations();
}

document.addEventListener('DOMContentLoaded', init, { once: true });
