/* upindersingh.com · no third-party code, no storage, no network calls */
(() => {
  window.__siteReady = true; document.documentElement.classList.add('js');
  const $ = id => document.getElementById(id);
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  let RM = mq.matches;

  /* ---------- hero: move to tune ---------- */
  const cv = $('wave');
  let heroCtl = null;
  if (cv && cv.getContext) {
    const cx = cv.getContext('2d'), prompt = $('prompt'), meter = $('meter'), hero = $('hero'), tagEl = document.querySelector('.tag');
    let W = 0, H = 0, mid = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const measure = () => {
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0);
      // wave sits in the empty band above the tagline, never under the copy
      const pad = parseFloat(getComputedStyle(tagEl).paddingTop) || 160;
      mid = tagEl.offsetTop + pad * 0.5;
    };
    const N = 140, seed = Math.random() * 1000;
    let tune = 0, locked = false, morph = 0, lastX = null, lastY = null, idle = performance.now(), t = 0, visible = true;
    let last = 0, settledAt = 0, rafId = 0;
    const nodes = Array.from({ length: 26 }, (_, i) => ({ fx: 0.08 + (i % 13) / 12 * 0.84 + (Math.random() - .5) * 0.03, fy: (i < 13 ? -1 : 1) * (0.25 + Math.random() * 0.75) }));
    const setMeter = () => { meter.style.transform = 'scaleX(' + tune + ')'; };
    const lock = () => { if (locked) return; locked = true; tune = 1; setMeter(); prompt.classList.add('off'); };
    const bump = d => { if (locked) return; tune = Math.min(1, tune + Math.min(d, 60) / 1500); idle = performance.now(); setMeter(); if (tune >= 1) lock(); start(); };
    addEventListener('pointermove', e => { if (lastX !== null) bump(Math.hypot(e.clientX - lastX, e.clientY - lastY)); lastX = e.clientX; lastY = e.clientY; }, { passive: true });
    let lastSY = scrollY;
    addEventListener('scroll', () => { const y = scrollY, d = Math.abs(y - lastSY); lastSY = y; if (locked || !d) return; tune = Math.min(1, tune + d / 320); idle = performance.now(); setMeter(); if (tune >= 1) lock(); start(); }, { passive: true });
    addEventListener('touchmove', e => { const p = e.touches[0]; if (lastX !== null) bump(Math.hypot(p.clientX - lastX, p.clientY - lastY) * 1.6); lastX = p.clientX; lastY = p.clientY; }, { passive: true });
    const WAVE = '#6ea0ff', LINE = '#9fb0cc', AMBER = '#f5a524';
    const ease = m => m < .5 ? 2 * m * m : 1 - Math.pow(-2 * m + 2, 2) / 2;
    const draw = () => {
      cx.clearRect(0, 0, W, H);
      const amp = Math.min(H * 0.06, 46), e = ease(morph), sep = 1 - tune;
      // three waves weave around each other, then converge into one as the visitor scrolls or moves
      const waves = [{ ph: 0, c: WAVE, a: 1 }, { ph: 2.1, c: AMBER, a: 0.75 }, { ph: 4.2, c: LINE, a: 0.6 }];
      let pts = null;
      waves.forEach((wv, k) => {
        const p = [];
        for (let i = 0; i < N; i++) {
          const x = (i / (N - 1)) * W;
          const ph = wv.ph * sep;
          const clean = Math.sin(i * 0.11 + t * 1.6 + ph) * 0.8 + Math.sin(i * 0.031 - t + ph * 0.6) * 0.35;
          const drift = Math.sin(i * 0.05 + t * 0.7 + k * 1.3) * 0.45 * sep;
          p.push([x, mid + amp * (clean * (0.55 + 0.45 * tune) + drift)]);
        }
        if (k === 0) pts = p;
        const base = locked ? 0.55 * (1 - e * 0.8) : 0.3 + 0.3 * tune;
        cx.globalAlpha = k === 0 ? base : base * wv.a * sep;
        if (cx.globalAlpha <= 0.01) return;
        cx.strokeStyle = wv.c; cx.lineWidth = 1.5; cx.beginPath();
        p.forEach((q, i) => i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1])); cx.stroke();
      });
      if (morph > 0) {
        const np = nodes.map((n, i) => { const src = pts[Math.round(n.fx * (N - 1))]; const tx = n.fx * W, ty = mid + n.fy * amp * 1.4 + Math.sin(t + i) * 3; return [src[0] + (tx - src[0]) * e, src[1] + (ty - src[1]) * e]; });
        cx.globalAlpha = e * 0.4; cx.strokeStyle = LINE; cx.lineWidth = 1;
        for (let a = 0; a < np.length; a++) for (let b = a + 1; b < np.length; b++) { if (Math.hypot(np[a][0] - np[b][0], np[a][1] - np[b][1]) < W * 0.11) { cx.beginPath(); cx.moveTo(np[a][0], np[a][1]); cx.lineTo(np[b][0], np[b][1]); cx.stroke(); } }
        cx.globalAlpha = e * 0.9; cx.fillStyle = WAVE;
        np.forEach(p => { cx.beginPath(); cx.arc(p[0], p[1], 3.2, 0, 7); cx.fill(); });
      }
      cx.globalAlpha = 1;
    };
    // time-based, capped at ~30 fps, pauses off-screen / hidden tab, stops for good once settled
    const frame = now => {
      rafId = 0;
      if (RM || !visible || document.hidden) { last = 0; return; }
      if (last && now - last < 33) { rafId = requestAnimationFrame(frame); return; }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now; t += dt;
      if (!locked && now - idle > 6000) { tune = Math.min(1, tune + 0.18 * dt); setMeter(); if (tune >= 1) lock(); }
      if (locked && morph < 1) morph = Math.min(1, morph + 1.1 * dt);
      draw();
      if (morph >= 1 && !settledAt) settledAt = now;
      if (settledAt && now - settledAt > 8000) return; // final frame stays drawn
      rafId = requestAnimationFrame(frame);
    };
    const settled = () => settledAt && performance.now() - settledAt > 8000;
    const start = () => { if (!rafId && !RM && visible && !document.hidden && !settled()) rafId = requestAnimationFrame(frame); };
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); }).observe(hero);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
    addEventListener('resize', () => { measure(); draw(); });
    measure();
    if (RM) { lock(); morph = 1; draw(); } else start();
    heroCtl = {
      still: () => { lock(); morph = 1; if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } draw(); },
      start
    };
  }

  /* ---------- reveals ---------- */
  const revealAll = () => document.querySelectorAll('.rv,.lines p').forEach(el => el.classList.add('on'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: 0.2 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
  // Pane 2: each line appears on its own as it scrolls past ~two-thirds of the screen
  // (scroll-position check rather than an observer margin, so it also works when the page is embedded in a frame)
  const lineEls = [...document.querySelectorAll('.lines p')];
  const checkLines = () => { const lim = innerHeight * 0.67; lineEls.forEach(el => { if (!el.classList.contains('on') && el.getBoundingClientRect().top < lim) el.classList.add('on'); }); };
  addEventListener('scroll', checkLines, { passive: true }); addEventListener('resize', checkLines); checkLines();
  // keyboard focus never lands on a still-hidden block
  document.addEventListener('focusin', e => { const r = e.target.closest && e.target.closest('.rv'); if (r && !r.classList.contains('on')) r.classList.add('now', 'on'); });

  /* ---------- count-ups (animate a decorative copy; screen readers get the final value) ---------- */
  const count = el => {
    const v = +el.dataset.v, p = el.dataset.p, s = el.dataset.s, out = el.querySelector('.cnt');
    if (RM || !v || !out) return;
    const final = out.textContent, t0 = performance.now(), d = 1200;
    const step = n => { const k = Math.min(1, (n - t0) / d); out.textContent = k < 1 ? p + Math.round(v * (1 - Math.pow(1 - k, 3))) + s : final; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { count(e.target); io2.unobserve(e.target); } }), { threshold: 0.6 });
  document.querySelectorAll('.tile .n').forEach(el => io2.observe(el));

  /* ---------- reduced-motion changes mid-visit ---------- */
  const onMotion = () => { RM = mq.matches; if (RM) { revealAll(); if (heroCtl) heroCtl.still(); } else if (heroCtl) heroCtl.start(); };
  if (mq.addEventListener) mq.addEventListener('change', onMotion); else if (mq.addListener) mq.addListener(onMotion);

  /* ---------- navigator + floating button ---------- */
  const links = [...document.querySelectorAll('.nav a')], fb = $('floatBook');
  const small = matchMedia('(max-width:720px)');
  let allowed = false, bookSeen = false, scrollHide = false, lastY = scrollY;
  const applyFloat = () => { if (fb) fb.classList.toggle('hide', !allowed || bookSeen || (small.matches && scrollHide)); };
  const io3 = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => { const on = a.dataset.s === e.target.id; a.classList.toggle('cur', on); if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    allowed = e.target.id !== 'hero' && e.target.id !== 'book';
    applyFloat();
  }), { rootMargin: '-45% 0px -54% 0px' });
  ['hero', 'years', 'numbers', 'build', 'data', 'revenue', 'who', 'book'].forEach(id => { const el = $(id); if (el) io3.observe(el); });
  const bb = $('bookBtn');
  if (bb) new IntersectionObserver(es => { bookSeen = es[0].isIntersecting; applyFloat(); }).observe(bb);
  // phones: tuck the button away while reading downward, bring it back on scroll up
  addEventListener('scroll', () => {
    const y = scrollY, d = y - lastY;
    if (Math.abs(d) < 8) return;
    scrollHide = d > 0; lastY = y; applyFloat();
  }, { passive: true });
})();


/* pillar tabs: links without JS, tabs with it */
(function () {
  var ids = ['build', 'data', 'revenue'];
  var tabs = [].slice.call(document.querySelectorAll('.tab'));
  var panels = ids.map(function (id) { return document.getElementById(id); });
  var list = document.querySelector('.tabs');
  if (!tabs.length || !list) return;
  list.setAttribute('role', 'tablist');
  tabs.forEach(function (t, i) {
    t.setAttribute('role', 'tab'); t.id = 'tab-' + ids[i]; t.setAttribute('aria-controls', ids[i]);
    panels[i].setAttribute('role', 'tabpanel'); panels[i].setAttribute('aria-labelledby', t.id); panels[i].tabIndex = -1;
  });
  var ind = document.createElement('span'); ind.className = 'ind'; ind.setAttribute('aria-hidden', 'true'); list.appendChild(ind);
  var curN = 0;
  function moveInd() { var t = tabs[curN]; if (!t) return; var lr = list.getBoundingClientRect(), r = t.getBoundingClientRect(); var lab = t.querySelector('.ts') && getComputedStyle(t.querySelector('.ts')).display !== 'none' ? t.querySelector('.ts') : t.querySelector('.tl'); var w = lab ? lab.getBoundingClientRect().right - r.left : r.width; ind.style.width = Math.max(24, w) + 'px'; ind.style.transform = 'translateX(' + (r.left - lr.left) + 'px)'; }
  addEventListener('resize', moveInd);
  function select(id, focus) {
    var n = ids.indexOf(id); if (n < 0) return; curN = n; requestAnimationFrame(moveInd);
    tabs.forEach(function (t, i) {
      var on = i === n; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      if (on) { panels[i].removeAttribute('hidden'); } else { panels[i].setAttribute('hidden', ''); }
    });
    if (focus) tabs[n].focus();
  }
  function go(id) {
    select(id);
    var sec = document.getElementById('proof');
    if (sec) sec.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function (e) { e.preventDefault(); select(ids[i]); if (history.replaceState) history.replaceState(null, '', '#' + ids[i]); var pr = panels[i].getBoundingClientRect(); if (pr.top > innerHeight * 0.7) panels[i].scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = i;
      if (k === 'ArrowRight') n = (i + 1) % ids.length; else if (k === 'ArrowLeft') n = (i + ids.length - 1) % ids.length;
      else if (k === 'Home') n = 0; else if (k === 'End') n = ids.length - 1; else return;
      e.preventDefault(); select(ids[n], true);
    });
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('tab')) return;
    var id = a.getAttribute('href').slice(1);
    if (ids.indexOf(id) >= 0) { e.preventDefault(); go(id); }
  });
  var start = location.hash.slice(1);
  select(ids.indexOf(start) >= 0 ? start : 'build');
  if (ids.indexOf(start) >= 0) { var sec = document.getElementById('proof'); if (sec) setTimeout(function () { sec.scrollIntoView(); }, 0); }
})();

/* story stepper: one part at a time, one story at a time */
(function () {
  function stepper(story) {
    var beats = story.querySelector('.beats'); if (!beats) return;
    var cards = [].slice.call(beats.querySelectorAll('.bcard')); if (cards.length < 2) return;
    beats.classList.add('stepper');
    cards.forEach(function (c) { c.classList.remove('rv'); c.classList.add('on'); });
    var labels = cards.map(function (c) { var k = c.querySelector('.k'); return k ? k.textContent : ''; });
    var steps = document.createElement('div'); steps.className = 'steps'; steps.setAttribute('role', 'group'); steps.setAttribute('aria-label', 'Story steps');
    var btns = labels.map(function (l, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'step';
      b.innerHTML = '<span class="bar"></span>' + l;
      b.addEventListener('click', function () { show(i); }); steps.appendChild(b); return b;
    });
    var nav = document.createElement('div'); nav.className = 'snav';
    var prev = document.createElement('button'); prev.type = 'button'; prev.className = 'sprev'; prev.setAttribute('aria-label', 'Previous step'); prev.textContent = '\u2190';
    var next = document.createElement('button'); next.type = 'button'; next.className = 'snext';
    var count = document.createElement('span'); count.className = 'scount'; count.setAttribute('aria-live', 'polite');
    nav.appendChild(prev); nav.appendChild(next); nav.appendChild(count);
    beats.parentNode.insertBefore(steps, beats); beats.parentNode.insertBefore(nav, beats.nextSibling);
    var cur = 0;
    function show(n) {
      var dir = n >= cur ? 1 : -1; cur = n;
      cards.forEach(function (c, i) {
        c.classList.toggle('cur', i === n); c.classList.toggle('back', i < n);
        c.setAttribute('aria-hidden', i === n ? 'false' : 'true');
      });
      btns.forEach(function (b, i) {
        b.classList.toggle('done', i < n);
        if (i === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      prev.disabled = n === 0;
      next.textContent = n < cards.length - 1 ? 'Next: ' + labels[n + 1].replace(/^The /, '').replace(/^./, function (m) { return m.toUpperCase(); }) + ' \u2192' : 'Start over \u21BA';
      count.textContent = (n + 1) + ' / ' + cards.length;
    }
    prev.addEventListener('click', function () { if (cur > 0) show(cur - 1); });
    next.addEventListener('click', function () { show(cur < cards.length - 1 ? cur + 1 : 0); });
    show(0);
  }
  document.querySelectorAll('.story').forEach(stepper);
  // panels with several stories: a switcher so only one shows at a time
  document.querySelectorAll('.panel').forEach(function (panel) {
    var stories = [].slice.call(panel.querySelectorAll('.story')); if (stories.length < 2) return;
    var pick = document.createElement('div'); pick.className = 'storypick'; pick.setAttribute('role', 'group'); pick.setAttribute('aria-label', 'Choose a story');
    var bs = stories.map(function (s, i) {
      var st = s.querySelector('.stat'); var b = document.createElement('button'); b.type = 'button'; b.className = 'spick';
      b.textContent = st ? st.textContent : 'Story ' + (i + 1);
      b.addEventListener('click', function () { choose(i); }); pick.appendChild(b); return b;
    });
    stories[0].parentNode.insertBefore(pick, stories[0]);
    function choose(n) {
      stories.forEach(function (s, i) { if (i === n) { s.removeAttribute('hidden'); s.classList.remove('swap'); void s.offsetWidth; s.classList.add('swap'); } else s.setAttribute('hidden', ''); });
      bs.forEach(function (b, i) { b.setAttribute('aria-pressed', i === n ? 'true' : 'false'); });
    }
    choose(0);
  });
})();

/* who I am: clickable index, one pillar open at a time */
(function () {
  var items = [].slice.call(document.querySelectorAll('.pillars li')); if (!items.length) return;
  items.forEach(function (li, i) {
    var b = li.querySelector('b'), sp = li.querySelector('span'); if (!b || !sp) return;
    var id = 'pill-' + i;
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'pq';
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', id);
    var n = document.createElement('span'); n.className = 'pn'; n.textContent = (i < 9 ? '0' : '') + (i + 1);
    var x = document.createElement('span'); x.className = 'px'; x.setAttribute('aria-hidden', 'true');
    btn.appendChild(n); btn.appendChild(b); btn.appendChild(x);
    var wrap = document.createElement('div'); wrap.className = 'pa'; wrap.id = id; wrap.appendChild(sp);
    li.textContent = ''; li.appendChild(btn); li.appendChild(wrap); li.classList.add('pi');
    btn.addEventListener('click', function () { toggle(i); });
  });
  function toggle(n) {
    items.forEach(function (li, i) {
      var open = i === n ? !li.classList.contains('open') : false;
      li.classList.toggle('open', open);
      var q = li.querySelector('.pq'); if (q) q.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  toggle(0);
})();
