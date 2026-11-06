/* =========================================================
   Lilith × Mephisto — motion & interactions
   GSAP + ScrollTrigger + Lenis
   ========================================================= */
(() => {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasGSAP = typeof gsap !== 'undefined';
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  document.body.classList.add('is-loading');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  /* ---------------------------------------------------------
     1. ART SLOTS — tự tìm tranh trong assets/img
        data-art="assets/img/ten-file" (không cần đuôi)
        Thử lần lượt .webp .png .jpg .jpeg .gif
     --------------------------------------------------------- */
  const EXT = ['webp', 'png', 'jpg', 'gif'];
  function tryLoad(base) {
    if (/\.\w{3,4}$/.test(base)) return loadOne(base);
    return EXT.reduce((p, ext) => p.catch(() => loadOne(`${base}.${ext}`)), Promise.reject());
  }
  function loadOne(src) {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(src); i.onerror = rej; i.src = src; });
  }
  const artPromises = $$('.art[data-art]').map(el => {
    const base = el.dataset.art;
    return tryLoad(base).then(src => {
      const img = new Image();
      img.src = src; img.alt = el.dataset.title || ''; img.decoding = 'async';
      el.appendChild(img); el.classList.add('has-art');
    }).catch(() => {
      el.classList.add('no-art');
      const s = document.createElement('div');
      s.className = 'slot';
      s.innerHTML = `
        <svg><use href="#bfly"/></svg>
        <span class="slot__tag">CHỪA TRANH</span>
        <b class="slot__title">${el.dataset.title || 'Tranh'}</b>
        ${el.dataset.desc ? `<p class="slot__desc">${el.dataset.desc}</p>` : ''}
        <code class="slot__file">${base.split('/').pop()}.webp / .png / .jpg</code>`;
      el.appendChild(s);
    });
  });
  // ?clean trên URL để ẩn mô tả placeholder khi khoe web
  if (/[?&]clean\b/.test(location.search)) document.body.classList.add('hide-slots');

  /* ---------------------------------------------------------
     2. TEXT SPLITTING
     --------------------------------------------------------- */
  $$('.split-chars').forEach(el => {
    el.innerHTML = [...el.textContent].map(c => c === ' ' ? ' ' : `<span class="ch">${c}</span>`).join('');
  });
  $$('.split-words').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
  });

  /* ---------------------------------------------------------
     3. STARFIELD CANVAS
     --------------------------------------------------------- */
  const cvs = $('#stars'), ctx = cvs.getContext('2d');
  let W, H, DPR, stars = [], shooting = [], mx = 0, my = 0;
  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = cvs.width = innerWidth * DPR; H = cvs.height = innerHeight * DPR;
    const n = Math.round((innerWidth * innerHeight) / 5200);
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: (Math.random() * 1.2 + .2) * DPR, z: Math.random() * .8 + .2,
      t: Math.random() * Math.PI * 2, s: Math.random() * .02 + .005,
      c: Math.random() < .18 ? '157,176,255' : (Math.random() < .08 ? '216,180,106' : '228,232,245')
    }));
  }
  resize(); addEventListener('resize', resize);
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  let scrollY = 0;
  function drawStars() {
    ctx.clearRect(0, 0, W, H);
    // nebula
    const g = ctx.createRadialGradient(W * .7, H * .2, 0, W * .7, H * .2, W * .7);
    g.addColorStop(0, 'rgba(58,77,255,.10)'); g.addColorStop(1, 'rgba(5,7,15,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const s of stars) {
      s.t += s.s;
      const a = .35 + Math.sin(s.t) * .35 + .3;
      let x = s.x + mx * 30 * s.z * DPR;
      let y = (s.y - scrollY * .15 * s.z * DPR + mx * 0 + my * 30 * s.z * DPR) % H;
      if (y < 0) y += H;
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.283);
      ctx.fillStyle = `rgba(${s.c},${a})`; ctx.fill();
      if (s.r > 1.1 * DPR && a > .85) { // cross sparkle
        ctx.strokeStyle = `rgba(${s.c},${(a - .85) * 3})`; ctx.lineWidth = .6 * DPR;
        ctx.beginPath(); ctx.moveTo(x - s.r * 4, y); ctx.lineTo(x + s.r * 4, y); ctx.moveTo(x, y - s.r * 4); ctx.lineTo(x, y + s.r * 4); ctx.stroke();
      }
    }
    if (Math.random() < .004) shooting.push({ x: Math.random() * W, y: Math.random() * H * .4, v: (8 + Math.random() * 6) * DPR, l: 1 });
    shooting = shooting.filter(s => s.l > 0);
    for (const s of shooting) {
      s.x -= s.v; s.y += s.v * .45; s.l -= .018;
      const gr = ctx.createLinearGradient(s.x, s.y, s.x + 120 * DPR, s.y - 54 * DPR);
      gr.addColorStop(0, `rgba(228,232,245,${s.l})`); gr.addColorStop(1, 'rgba(228,232,245,0)');
      ctx.strokeStyle = gr; ctx.lineWidth = 1.2 * DPR;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + 120 * DPR, s.y - 54 * DPR); ctx.stroke();
    }
  }

  /* ---------------------------------------------------------
     4. LENIS SMOOTH SCROLL
     --------------------------------------------------------- */
  let lenis = null;
  if (!REDUCED && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: .085, wheelMultiplier: 1 });
    window.lenis = lenis;
    lenis.on('scroll', e => { scrollY = e.scroll; if (hasGSAP) ScrollTrigger.update(); });
    lenis.stop();
  } else addEventListener('scroll', () => { scrollY = window.scrollY; });

  if (hasGSAP) {
    gsap.ticker.add(t => { lenis && lenis.raf(t * 1000); drawStars(); });
    gsap.ticker.lagSmoothing(0);
  } else (function loop() { drawStars(); requestAnimationFrame(loop); })();

  $$('[data-scroll]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (!id || !id.startsWith('#')) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(id, { duration: 1.8, easing: t => 1 - Math.pow(1 - t, 4) }) : $(id).scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------------------------------------------------------
     5. CURSOR + MAGNETIC
     --------------------------------------------------------- */
  if (FINE && hasGSAP) {
    const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    const dx = gsap.quickTo(dot, 'x', { duration: .08 }), dy = gsap.quickTo(dot, 'y', { duration: .08 });
    const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
    addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('a,button,[data-cursor],.art.has-art:not([data-bg])');
      cur.classList.toggle('is-hover', !!t);
      label.textContent = t ? (t.dataset.cursor || (t.classList.contains('art') ? 'Xem' : '')) : '';
    });
    $$('.magnetic').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .35); yTo((e.clientY - r.top - r.height / 2) * .35);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
    // 3D tilt
    $$('.tilt').forEach(el => {
      const glow = el.querySelector('.char__glow');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        gsap.to(el, { rotateY: (px - .5) * 14, rotateX: (.5 - py) * 10, transformPerspective: 900, duration: .6, ease: 'power3' });
        if (glow) { glow.style.setProperty('--gx', px * 100 + '%'); glow.style.setProperty('--gy', py * 100 + '%'); }
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1,.5)' }));
    });
  }

  /* ---------------------------------------------------------
     6. BUTTERFLIES
     --------------------------------------------------------- */
  function spawnButterfly(fromX, fromY, burst) {
    if (!hasGSAP || REDUCED) return;
    const host = $('#bflies');
    const b = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    b.setAttribute('class', 'bfly'); b.innerHTML = '<use href="#bfly"/>';
    host.appendChild(b);
    const sc = gsap.utils.random(.5, 1.2);
    const x0 = fromX ?? gsap.utils.random(-50, innerWidth * .3);
    const y0 = fromY ?? innerHeight + 40;
    gsap.set(b, { x: x0, y: y0, scale: sc, opacity: 0 });
    gsap.to(b.firstChild, { scaleX: .25, duration: gsap.utils.random(.12, .2), repeat: -1, yoyo: true, ease: 'sine.inOut' });
    const tl = gsap.timeline({ onComplete: () => b.remove() });
    const dur = burst ? gsap.utils.random(2.5, 4) : gsap.utils.random(12, 20);
    const tx = x0 + (burst ? gsap.utils.random(-260, 260) : gsap.utils.random(innerWidth * .4, innerWidth * 1.1));
    const ty = burst ? y0 - gsap.utils.random(120, 360) : -80;
    tl.to(b, { opacity: gsap.utils.random(.5, .95), duration: .6 })
      .to(b, { x: tx, duration: dur, ease: 'sine.inOut' }, 0)
      .to(b, { y: ty, duration: dur, ease: burst ? 'power2.out' : 'none' }, 0)
      .to(b, { rotate: gsap.utils.random(-30, 30), duration: dur / 3, repeat: 2, yoyo: true, ease: 'sine.inOut' }, 0)
      .to(b, { opacity: 0, duration: 1 }, dur - 1);
  }

  /* ---------------------------------------------------------
     7. PRELOADER → INTRO
     --------------------------------------------------------- */
  const loader = $('#loader');
  function runLoader() {
    if (!hasGSAP) { loader.remove(); document.body.classList.remove('is-loading'); return; }
    // ?skip trên URL: bỏ qua màn loading (tiện khi đang sửa web)
    if (/[?&]skip\b/.test(location.search)) {
      loader.remove(); document.body.classList.remove('is-loading'); lenis && lenis.start(); heroIntro(); return;
    }
    const num = $('#loaderNum'), counter = { v: 0 };
    const tl = gsap.timeline();
    tl.to('.loader__word span', { opacity: 1, y: 0, filter: 'blur(0px)', stagger: .07, duration: .9, ease: 'power3.out' })
      .to('.loader__bar i', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, .1)
      .to(counter, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => num.textContent = Math.round(counter.v) }, .1);
    const waitAssets = Promise.race([Promise.allSettled([...artPromises, document.fonts ? document.fonts.ready : 0]), new Promise(r => setTimeout(r, 2500))]);
    Promise.all([new Promise(r => tl.eventCallback('onComplete', r)), waitAssets])
      .then(() => {
        gsap.timeline({ onComplete: () => { loader.remove(); document.body.classList.remove('is-loading'); lenis && lenis.start(); ScrollTrigger.refresh(); } })
          .to('.loader__inner', { opacity: 0, y: -30, duration: .6, ease: 'power2.in' })
          .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' })
          .add(heroIntro, '-=.5');
      });
  }
  if (hasGSAP) gsap.set(loader, { clipPath: 'inset(0 0 0% 0)' });

  function heroIntro() {
    const tl = gsap.timeline();
    tl.from('.hero__name--l .ch', { yPercent: 110, rotate: 8, opacity: 0, stagger: .06, duration: 1.3, ease: 'expo.out' })
      .from('.hero__x', { scale: 0, rotate: -180, opacity: 0, duration: 1.1, ease: 'back.out(2)' }, '-=1')
      .from('.hero__name--m .ch', { yPercent: -110, rotate: -8, opacity: 0, stagger: .05, duration: 1.3, ease: 'expo.out' }, '-=1')
      .from('.hero .reveal-up', { y: 30, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out' }, '-=.9')
      .from('.hero .btn', { y: 30, opacity: 0, duration: 1, ease: 'power3.out' }, '-=.8')
      .from('.hero__figure', { x: 80, opacity: 0, duration: 1.6, ease: 'expo.out' }, '-=1.4')
      .from('.hero__scroll, .nav', { opacity: 0, duration: 1 }, '-=1');
    for (let i = 0; i < 6; i++) setTimeout(() => spawnButterfly(innerWidth / 2 + gsap.utils.random(-120, 120), innerHeight * .55, true), i * 120);
    setInterval(() => document.visibilityState === 'visible' && spawnButterfly(), 3800);
  }

  /* ---------------------------------------------------------
     8. SCROLL ANIMATIONS
     --------------------------------------------------------- */
  function setupScroll() {
    if (!hasGSAP) return;
    // nav hide on scroll down, progress
    const nav = $('#nav'); let last = 0;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: self => {
        gsap.set('#progress', { scaleX: self.progress });
        const y = self.scroll();
        nav.classList.toggle('is-scrolled', y > 40);
        nav.classList.toggle('is-hidden', y > last && y > 400);
        last = y;
      }
    });
    // active link
    $$('.nav__links a').forEach(a => {
      const sec = $(a.getAttribute('href')); if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', refreshPriority: -1, onToggle: s => a.classList.toggle('is-active', s.isActive) });
    });

    if (REDUCED) return;

    // hero parallax out
    gsap.to('.hero__content', { yPercent: 30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__figure', { yPercent: -15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__bg', { scale: 1.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // marquee skew with velocity
    const mq = $('.marquee__track'); let skew = gsap.quickTo(mq, 'skewX', { duration: .4 });
    ScrollTrigger.create({ onUpdate: s => skew(gsap.utils.clamp(-12, 12, s.getVelocity() / -250)) });

    // prologue word reveal (pinned)
    const pw = $$('.prologue__text .w');
    gsap.to(pw, {
      opacity: 1, stagger: .05, ease: 'none',
      scrollTrigger: { trigger: '.prologue', start: 'top top', end: () => '+=' + innerHeight * 1.6, scrub: .6, pin: '.prologue__pin' }
    });

    // section titles
    $$('.sec-title.split-chars').forEach(t => {
      gsap.from(t.querySelectorAll('.ch'), {
        yPercent: 100, opacity: 0, rotateX: -80, stagger: .04, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: t, start: 'top 85%' }
      });
    });
    $$('.eyebrow').forEach(e => gsap.from(e, { opacity: 0, x: -20, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 90%' } }));

    // character reveal
    $$('.char').forEach(c => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 70%' } });
      tl.from(c.querySelector('.char__frame'), { clipPath: 'inset(100% 0 0 0 round 200px 200px 16px 16px)', duration: 1.5, ease: 'expo.inOut' })
        .from(c.querySelector('.char__frame .art'), { scale: 1.3, duration: 1.8, ease: 'expo.out' }, '-=1')
        .from(c.querySelector('.char__vname'), { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' }, '-=1.4')
        .from(c.querySelectorAll('.char__info > *'), { y: 40, opacity: 0, stagger: .1, duration: 1, ease: 'power3.out' }, '-=1.4')
        .from(c.querySelectorAll('.stats > div'), { opacity: 0, y: 14, stagger: .05, duration: .6 }, '-=.8');
      gsap.to(c.querySelector('.char__vname'), { xPercent: c.classList.contains('char--meph') ? 10 : -10, ease: 'none', scrollTrigger: { trigger: c, scrub: true } });
    });
    gsap.from('.mini-card', { y: 60, opacity: 0, stagger: .15, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.support', start: 'top 80%' } });

    // ability
    const atl = gsap.timeline({ scrollTrigger: { trigger: '.ability', start: 'top 60%' } });
    atl.from('.ability__title', { scale: 1.6, opacity: 0, filter: 'blur(20px)', letterSpacing: '.3em', duration: 1.6, ease: 'expo.out' })
      .add(() => scramble($('.ability__en')), '-=1')
      .from('.ability__desc', { opacity: 0, y: 30, duration: 1 }, '-=.8')
      .from('.astep', { y: 50, opacity: 0, rotateX: -30, stagger: .15, duration: 1, ease: 'power3.out' }, '-=.6')
      .from('.icard', { y: 60, opacity: 0, rotateY: -60, stagger: .1, duration: 1.1, ease: 'expo.out' }, '-=.4');
    gsap.fromTo('.ability__art', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.ability', scrub: true } });

    // bond
    gsap.from('.tropes li', { y: 30, opacity: 0, scale: .8, stagger: .07, duration: .8, ease: 'back.out(2)', scrollTrigger: { trigger: '.tropes', start: 'top 85%' } });
    gsap.from('.pov__side--l', { x: -100, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.pov', start: 'top 75%' } });
    gsap.from('.pov__side--r', { x: 100, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.pov', start: 'top 65%' } });
    gsap.from('.pov__divider svg', { scale: 0, rotate: 180, duration: 1.2, ease: 'back.out(2)', scrollTrigger: { trigger: '.pov', start: 'top 60%' } });
    $$('.pov__side .art').forEach(a => gsap.fromTo(a, { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: a, scrub: true } }));
    gsap.from('.love__item, .love__amp', { y: 80, opacity: 0, stagger: .15, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.love', start: 'top 80%' } });

    // story horizontal
    const mm = gsap.matchMedia();
    mm.add('(min-width: 861px)', () => {
      const track = $('.story__track');
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.story', start: 'top top', end: () => '+=' + dist(), pin: '.story__pin', scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      $$('.chapter').forEach(ch => {
        gsap.from(ch.querySelector('.art'), { clipPath: 'inset(0 0 0 100% round 14px)', duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: ch, containerAnimation: tween, start: 'left 90%' } });
        gsap.from(ch.querySelectorAll('h3, p, .chapter__no'), { y: 40, opacity: 0, stagger: .08, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: ch, containerAnimation: tween, start: 'left 80%' } });
        const img = ch.querySelector('.art img');
        if (img) gsap.fromTo(img, { xPercent: -8, scale: 1.15 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: ch, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
    });
    mm.add('(max-width: 860px)', () => {
      $$('.chapter').forEach(ch => gsap.from(ch, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: ch, start: 'top 85%' } }));
    });

    // gallery
    gsap.set('.gitem', { opacity: 0 });
    ScrollTrigger.batch('.gitem', {
      start: 'top 90%',
      onEnter: b => gsap.fromTo(b, { y: 80, opacity: 0, clipPath: 'inset(20% 0 0 0 round 14px)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0 round 14px)', stagger: .1, duration: 1.2, ease: 'expo.out', overwrite: true })
    });

    // outro
    gsap.to('.outro__quote .w', { opacity: 1, stagger: .08, ease: 'none', scrollTrigger: { trigger: '.outro', start: 'top 70%', end: 'center 50%', scrub: true } });
    gsap.from('.outro__sign, .outro .btn', { opacity: 0, y: 30, stagger: .15, duration: 1, scrollTrigger: { trigger: '.outro__sign', start: 'top 90%' } });
    ScrollTrigger.create({ trigger: '.outro', start: 'top 40%', once: true, onEnter: () => { for (let i = 0; i < 10; i++) setTimeout(() => spawnButterfly(innerWidth / 2, innerHeight * .5, true), i * 90); } });

    // generic parallax
    $$('.parallax').forEach(el => gsap.to(el, { yPercent: (+el.dataset.speed || .1) * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, scrub: true } }));
  }

  /* ---------------------------------------------------------
     9. TEXT SCRAMBLE (Huyễn Tâm)
     --------------------------------------------------------- */
  const GLYPHS = '✦✧◇◆ΛΣΨΩ⟡ᚱᛟᛉ#%&*+=?';
  function scramble(el) {
    const target = el.dataset.scramble || el.textContent; let frame = 0;
    const q = [...target].map((c, i) => ({ c, s: Math.floor(Math.random() * 20), e: Math.floor(Math.random() * 20) + 20 + i }));
    cancelAnimationFrame(el._raf);
    (function upd() {
      let out = '', done = 0;
      for (const o of q) {
        if (frame >= o.e) { out += o.c; done++; }
        else if (frame >= o.s && o.c !== ' ') out += `<span style="color:var(--royal-2)">${GLYPHS[Math.random() * GLYPHS.length | 0]}</span>`;
        else out += o.c === ' ' ? ' ' : '·';
      }
      el.innerHTML = out; frame++;
      if (done < q.length) el._raf = requestAnimationFrame(upd);
    })();
  }
  $$('.scramble').forEach(el => el.addEventListener('pointerenter', () => scramble(el)));
  // tiêu đề Huyễn Tâm "méo" theo chuột
  const at = $('.ability__title');
  if (at && FINE && hasGSAP && !REDUCED) {
    $('.ability').addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      gsap.to(at, { x: x * 30, y: y * 20, skewX: x * 10, duration: .8, ease: 'power3' });
    });
  }

  /* ---------------------------------------------------------
     10. TABS, ILLUSION CARDS, LIGHTBOX, SOUND
     --------------------------------------------------------- */
  $$('[data-tabs]').forEach(t => {
    const btns = $$('.tabs__nav button', t), panels = $$('.tabs__panel', t);
    const ink = document.createElement('span'); ink.className = 'tabs__ink'; $('.tabs__nav', t).appendChild(ink);
    const place = b => { ink.style.left = b.offsetLeft + 'px'; ink.style.width = b.offsetWidth + 'px'; };
    btns.forEach((b, i) => b.addEventListener('click', () => {
      btns.forEach(x => x.setAttribute('aria-selected', x === b)); place(b);
      panels.forEach(p => p.classList.remove('is-active')); panels[i].classList.add('is-active');
      if (hasGSAP) gsap.from(panels[i].children, { y: 16, opacity: 0, stagger: .05, duration: .6, ease: 'power3.out' });
      hasGSAP && ScrollTrigger.refresh();
    }));
    requestAnimationFrame(() => place(btns[0])); addEventListener('resize', () => place(btns.find(b => b.getAttribute('aria-selected') === 'true')));
  });

  $$('.icard').forEach(c => c.addEventListener('click', e => {
    c.classList.toggle('is-flipped');
    if (c.classList.contains('is-flipped') && c.dataset.truth === 'fake' && hasGSAP && !REDUCED) {
      gsap.fromTo('.ability__inner', { x: -8, filter: 'hue-rotate(90deg) blur(2px)' }, { x: 0, filter: 'hue-rotate(0deg) blur(0px)', duration: .6, ease: 'elastic.out(1,.3)', clearProps: 'filter' });
      const r = c.getBoundingClientRect(); for (let i = 0; i < 4; i++) spawnButterfly(r.left + r.width / 2, r.top + r.height / 2, true);
    }
  }));

  const lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('.lightbox__cap', lb);
  document.addEventListener('click', e => {
    const a = e.target.closest('.art.has-art:not([data-bg])'); if (!a || a.closest('.hero')) return;
    const img = a.querySelector('img'); lbImg.src = img.src;
    lbCap.textContent = a.closest('figure')?.querySelector('figcaption')?.textContent || a.dataset.title || '';
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); lenis && lenis.stop();
  });
  const closeLb = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); lenis && lenis.start(); };
  lb.addEventListener('click', e => { if (e.target !== lbImg) closeLb(); });
  addEventListener('keydown', e => e.key === 'Escape' && closeLb());

  /* ---------------------------------------------------------
     MUSIC — phát qua trình phát YouTube chính thức
     (nút chỉ hiện khi YouTube tải được)
     --------------------------------------------------------- */
  const music = $('#music'), mBtn = $('#musicBtn'), mState = $('#musicState'), mHint = $('#musicHint');
  const VID = music.dataset.video, ARTIST = music.dataset.artist;
  let player = null, ytReady = false, wantPlay = false;
  const setState = playing => {
    music.classList.toggle('is-playing', playing);
    mBtn.setAttribute('aria-pressed', playing);
    mState.textContent = playing ? `${ARTIST} · đang phát` : `${ARTIST} · bấm để nghe`;
  };
  window.onYouTubeIframeAPIReady = () => {
    ytReady = true; music.hidden = false;
    if (hasGSAP && !REDUCED) gsap.from(music, { y: 80, opacity: 0, duration: 1.2, delay: .4, ease: 'expo.out' });
    setTimeout(() => { if (!music.classList.contains('was-used')) { mHint.classList.add('is-show'); setTimeout(() => mHint.classList.remove('is-show'), 7000); } }, 3500);
  };
  const yt = document.createElement('script'); yt.src = 'https://www.youtube.com/iframe_api'; yt.async = true;
  document.head.appendChild(yt);

  function createPlayer() {
    player = new YT.Player('ytPlayer', {
      width: 228, height: 200, videoId: VID,
      playerVars: { autoplay: 1, loop: 1, playlist: VID, playsinline: 1, rel: 0, modestbranding: 1 },
      events: {
        onReady: e => { e.target.setVolume(45); if (wantPlay) e.target.playVideo(); },
        onStateChange: e => {
          const playing = e.data === YT.PlayerState.PLAYING;
          setState(playing);
          if (playing) music.classList.add('is-open');
        }
      }
    });
  }
  mBtn.addEventListener('click', () => {
    if (!ytReady) return;
    music.classList.add('was-used'); mHint.classList.remove('is-show');
    if (!player) { wantPlay = true; music.classList.add('is-open'); createPlayer(); return; }
    const st = player.getPlayerState?.();
    if (st === YT.PlayerState.PLAYING) { player.pauseVideo(); music.classList.remove('is-open'); }
    else { music.classList.add('is-open'); player.playVideo(); }
  });
  $('#musicClose').addEventListener('click', () => { player?.pauseVideo?.(); music.classList.remove('is-open'); setState(false); });

  /* ---------------------------------------------------------
     GO
     --------------------------------------------------------- */
  Promise.allSettled(artPromises).then(() => { setupScroll(); hasGSAP && ScrollTrigger.refresh(); });
  runLoader();
})();
