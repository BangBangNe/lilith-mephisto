/* =========================================================
   Lilith × Mephisto — click interactions
   (cần main.js chạy trước: dùng window.YM)
   ========================================================= */
(() => {
  const { spawnButterfly, scramble, lenis, REDUCED, hasGSAP } = window.YM || {};
  if (!hasGSAP) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rnd = gsap.utils.random;
  const splitTo = (el, t) => { el.innerHTML = [...t].map(c => c === ' ' ? ' ' : `<span class="ch">${c}</span>`).join(''); };

  /* ---------- particles ---------- */
  function burst(x, y, { n = 14, chars = ['✦'], colors = ['#9db0ff'], spread = 160, size = [12, 26], up = 0, dur = [1, 1.8] } = {}) {
    if (REDUCED) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'fx-p';
      p.textContent = chars[i % chars.length];
      p.style.color = colors[i % colors.length];
      p.style.fontSize = rnd(size[0], size[1]) + 'px';
      document.body.appendChild(p);
      const a = rnd(0, Math.PI * 2), d = rnd(spread * .3, spread);
      gsap.set(p, { x, y, xPercent: -50, yPercent: -50, scale: 0, rotate: rnd(-40, 40) });
      gsap.timeline({ onComplete: () => p.remove() })
        .to(p, { scale: 1, duration: .25, ease: 'back.out(3)' })
        .to(p, { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d - up, rotate: '+=' + rnd(-120, 120), duration: rnd(dur[0], dur[1]), ease: 'power3.out' }, 0)
        .to(p, { opacity: 0, scale: .3, duration: .5 }, '-=.5');
    }
  }

  /* ---------- warp (méo không gian bằng SVG filter) ---------- */
  const disp = $('#warpDisp'), turb = $('#warpTurb');
  function warp(el, amt = 50, dur = 1) {
    if (REDUCED || !disp || !el) return;
    const o = { s: 0, f: .008 };
    const apply = () => { disp.setAttribute('scale', o.s); turb.setAttribute('baseFrequency', `${o.f} ${o.f * 2.4}`); };
    el.style.filter = 'url(#warp)';
    gsap.timeline({ onComplete: () => { el.style.filter = ''; o.s = 0; apply(); } })
      .to(o, { s: amt, f: .025, duration: dur * .4, ease: 'power2.in', onUpdate: apply })
      .to(o, { s: 0, f: .008, duration: dur * .6, ease: 'power3.out', onUpdate: apply });
  }

  /* ---------- 1. bấm vào màn đầu → bướm bay ra ---------- */
  $('.hero')?.addEventListener('click', e => {
    if (e.target.closest('a,button')) return;
    for (let i = 0; i < 6; i++) spawnButterfly(e.clientX, e.clientY, true);
    burst(e.clientX, e.clientY, { n: 8, chars: ['✦', '✧'], colors: ['#9db0ff', '#d8b46a'], spread: 90 });
  });

  /* ---------- 2. MẶT NẠ ---------- */
  const masks = $$('.masks__list li').map(li => ({ w: li.textContent.trim(), c: li.dataset.color, l: li.dataset.line }));
  const lil = $('.char--lilith'), mWord = $('#maskWord'), mLine = $('#maskLine'), frame = $('.char--lilith .char__frame');
  if (masks.length && lil && mWord) {
    let mi = 0, busy = false;
    lil.style.setProperty('--aura', masks[0].c);
    splitTo(mWord, masks[0].w);
    $('#maskBtn').addEventListener('click', () => {
      if (busy) return; busy = true;
      mi = (mi + 1) % masks.length;
      const m = masks[mi];
      gsap.timeline({ onComplete: () => { busy = false; } })
        .to(mWord.querySelectorAll('.ch'), { yPercent: -110, rotateX: 90, opacity: 0, filter: 'blur(8px)', stagger: .03, duration: .35, ease: 'power2.in' })
        .to(mLine, { opacity: 0, y: -8, duration: .3 }, 0)
        .add(() => {
          lil.style.setProperty('--aura', m.c);
          splitTo(mWord, m.w);
          mLine.textContent = m.l;
          gsap.from(mWord.querySelectorAll('.ch'), { yPercent: 110, rotateX: -90, opacity: 0, filter: 'blur(8px)', stagger: .04, duration: .7, ease: 'back.out(2)' });
          gsap.fromTo(mLine, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .6, delay: .15 });
          if (!frame) return;
          const ring = document.createElement('span'); ring.className = 'fx-ring'; frame.appendChild(ring);
          gsap.fromTo(ring, { scale: .8, opacity: 1 }, { scale: 1.1, opacity: 0, duration: 1.1, ease: 'expo.out', onComplete: () => ring.remove() });
          const img = frame.querySelector('img');
          if (img && !REDUCED) gsap.fromTo(img, { filter: 'brightness(2.2) blur(5px)', x: -12 }, { filter: 'brightness(1) blur(0px)', x: 0, duration: .9, ease: 'expo.out', clearProps: 'filter,x' });
          warp(frame, 40, .8);
          const r = frame.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + r.height * .35, { n: 16, chars: ['✦', '✧', '·'], colors: [m.c, '#ffffff'], spread: r.width * .7 });
        });
    });
  }

  /* ---------- 3. KÍCH HOẠT HUYỄN TÂM ---------- */
  const fx = $('#mindfx'), iris = $('.mindfx__iris'), fxText = $('.mindfx__text');
  const ECHO = ['thật?', 'giả?', 'ký ức giả', 'bạn chắc chứ?', 'đừng tin', 'em ở ngay đây', 'ảo giác', 'nhìn lại đi', 'ai đang nói?'];
  let fxBusy = false;
  $('#activate')?.addEventListener('click', e => {
    if (fxBusy) return; fxBusy = true;
    const r = e.currentTarget.getBoundingClientRect();
    const ox = (r.left + 33) / innerWidth * 100 + '%', oy = (r.top + r.height / 2) / innerHeight * 100 + '%';
    fx.style.setProperty('--ox', ox); fx.style.setProperty('--oy', oy);
    fxText.dataset.scramble = fxText.dataset.scramble || fxText.textContent;
    lenis?.stop();
    fx.classList.add('is-on');
    const echoes = REDUCED ? [] : ECHO.map(t => {
      const el = document.createElement('span'); el.className = 'mindfx__echo'; el.textContent = t; fx.appendChild(el);
      gsap.set(el, { left: rnd(4, 78) + '%', top: rnd(8, 88) + '%', opacity: 0 });
      return el;
    });
    const end = () => { fx.classList.remove('is-on'); echoes.forEach(x => x.remove()); lenis?.start(); fxBusy = false; };
    warp($('.ability'), 140, 1.4);
    const tl = gsap.timeline({ onComplete: end });
    tl.fromTo(iris, { clipPath: `circle(0% at ${ox} ${oy})` }, { clipPath: `circle(150% at ${ox} ${oy})`, duration: 1.1, ease: 'expo.inOut' })
      .fromTo(iris.querySelector('span'), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 1.3, ease: 'expo.out' }, .3)
      .fromTo(fxText, { opacity: 0, scale: 1.4, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .9, ease: 'expo.out', onStart: () => scramble(fxText) }, .8)
      .to(echoes, { opacity: () => rnd(.3, .9), x: () => rnd(-90, 90), y: () => rnd(-50, 50), duration: 1.8, stagger: .06, ease: 'sine.inOut' }, .9)
      .to(fxText, { x: 7, duration: .05, repeat: 9, yoyo: true, ease: 'none' }, 2.2)
      .to([fxText, ...echoes], { opacity: 0, filter: 'blur(10px)', duration: .5 }, 3)
      .to(iris, { clipPath: `circle(0% at ${ox} ${oy})`, duration: .9, ease: 'expo.inOut' }, 3.1)
      .set(fxText, { x: 0 });
    fx.onclick = () => tl.progress() < .85 && tl.seek(3);   // bấm để thoát sớm
  });

  /* ---------- 4. THẺ THẬT / ẢO GIÁC: thêm hiệu ứng ---------- */
  $$('.icard').forEach(c => c.addEventListener('click', () => {
    if (!c.classList.contains('is-flipped')) return;
    const r = c.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (c.dataset.truth === 'fake') {
      warp($('.illusion'), 80, .9);
      burst(x, y, { n: 20, chars: ['✕', '✦', '◇'], colors: ['#ff7ad9', '#9db0ff', '#ffffff'], spread: 220 });
    } else {
      burst(x, y, { n: 12, chars: ['✦', '✧'], colors: ['#9db0ff', '#ffffff'], spread: 140 });
    }
  }));

  /* ---------- 5. GIỮ ĐỂ ÔM ---------- */
  const hugBtn = $('#hugBtn');
  if (hugBtn) {
    const prog = $('.hug__prog'), heart = $('.hug__heart'), hugMsg = $('#hugMsg'), label = $('.hug__label');
    const msgs = $$('.hug__list li').map(li => li.textContent.trim());
    let done = false, stream = null, last = -1;
    const fill = gsap.timeline({ paused: true, onComplete: complete })
      .to(prog, { strokeDashoffset: 0, duration: 1.5, ease: 'none' })
      .to(heart, { scale: 1.5, duration: 1.5, ease: 'power1.in' }, 0)
      .to(hugBtn, { scale: .94, duration: 1.5 }, 0);
    const shake = gsap.to(heart, { rotate: 7, duration: .07, repeat: -1, yoyo: true, paused: true, ease: 'none' });
    function start(e) {
      if (done) return;
      if (e && e.cancelable) e.preventDefault();
      fill.timeScale(1).play(); shake.play();
      label.textContent = 'Giữ thêm chút nữa…';
      clearInterval(stream);
      stream = setInterval(() => {
        const r = hugBtn.getBoundingClientRect();
        burst(r.left + r.width / 2 + rnd(-50, 50), r.top + r.height / 2, { n: 1, chars: ['♥'], colors: ['#ff8fb8', '#ffb3cf'], spread: 30, up: 130, size: [12, 22] });
      }, 110);
    }
    function stop() {
      if (done) return;
      clearInterval(stream); shake.pause(); gsap.to(heart, { rotate: 0, duration: .2 });
      if (fill.progress() > 0) fill.timeScale(3).reverse();
      label.textContent = 'Nhấn giữ để ôm';
    }
    function complete() {
      done = true; clearInterval(stream); shake.pause(); gsap.set(heart, { rotate: 0 });
      const r = hugBtn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      burst(x, y, { n: 36, chars: ['♥', '♥', '✦'], colors: ['#ff8fb8', '#ffb3cf', '#9db0ff', '#ffffff'], spread: 320, size: [14, 34] });
      for (let i = 0; i < 8; i++) spawnButterfly(x, y, true);
      gsap.timeline().to(heart, { scale: 2.3, duration: .25, ease: 'power2.out' }).to(heart, { scale: 1, duration: 1.1, ease: 'elastic.out(1,.35)' });
      gsap.to(hugBtn, { scale: 1, duration: 1.1, ease: 'elastic.out(1,.35)' });
      label.textContent = 'Đã ôm ♥';
      let k; do { k = Math.floor(Math.random() * msgs.length); } while (msgs.length > 1 && k === last);
      last = k;
      hugMsg.innerHTML = (msgs[k] || '').split(' ').map(w => `<span class="w">${w}</span>`).join(' ');
      gsap.from(hugMsg.querySelectorAll('.w'), { y: 20, opacity: 0, filter: 'blur(6px)', stagger: .05, duration: .6, ease: 'power3.out' });
      setTimeout(() => {
        done = false; fill.timeScale(2).reverse(); label.textContent = 'Ôm thêm lần nữa';
      }, 3200);
    }
    hugBtn.addEventListener('pointerdown', start);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => hugBtn.addEventListener(ev, stop));
    hugBtn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
    hugBtn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') stop(); });
    hugBtn.addEventListener('contextmenu', e => e.preventDefault());
  }

  /* ---------- 6. ĐỌC CHƯƠNG ---------- */
  const chapters = $$('.chapter'), reader = $('#reader'), rInner = $('#readerInner'), rArt = $('#readerArt');
  if (reader && chapters.length) {
    reader.setAttribute('data-lenis-prevent', '');
    let ci = 0, rOpen = false, rBusy = false, origin = [innerWidth / 2, innerHeight / 2];
    chapters.forEach((ch, i) => {
      ch.dataset.cursor = 'Đọc';
      ch.tabIndex = 0; ch.setAttribute('role', 'button');
      const cta = document.createElement('span'); cta.className = 'chapter__cta'; cta.textContent = 'Nhấn để đọc'; ch.appendChild(cta);
      ch.addEventListener('click', e => openReader(i, e.clientX, e.clientY));
      ch.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault(); const r = ch.getBoundingClientRect(); openReader(i, r.left + r.width / 2, r.top + r.height / 2);
      });
    });
    const fillReader = i => {
      const ch = chapters[i], no = ch.querySelector('.chapter__no').textContent.trim();
      $('#readerNo').textContent = no;
      $('#readerEyebrow').textContent = no === '?' ? 'Chương tiếp theo' : `Chương ${no}`;
      splitTo($('#readerTitle'), ch.querySelector('h3').textContent.trim());
      const ps = [ch.querySelector(':scope > p'), ...ch.querySelectorAll('.chapter__more p')].filter(Boolean);
      $('#readerText').innerHTML = ps.map(p => `<p>${p.innerHTML}</p>`).join('');
      const art = ch.querySelector('.art').cloneNode(true);
      art.removeAttribute('style'); art.querySelectorAll('[style]').forEach(n => n.removeAttribute('style'));
      rArt.replaceChildren(art);
      $('#readerCount').textContent = `${i + 1} / ${chapters.length}`;
      $('#readerPrev').disabled = i === 0;
      $('#readerNext').disabled = i === chapters.length - 1;
    };
    const animIn = (dir = 0) => gsap.timeline()
      .fromTo('#readerNo', { opacity: 0, scale: 1.6, filter: 'blur(20px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' })
      .fromTo(rArt, { clipPath: 'inset(0 100% 0 0 round 16px)', x: dir * 60 }, { clipPath: 'inset(0 0% 0 0 round 16px)', x: 0, duration: 1.1, ease: 'expo.inOut' }, 0)
      .fromTo($$('img', rArt), { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, .1)
      .fromTo('#readerEyebrow', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: .6 }, .3)
      .fromTo($$('#readerTitle .ch'), { yPercent: 100, opacity: 0, rotate: 6 }, { yPercent: 0, opacity: 1, rotate: 0, stagger: .025, duration: .8, ease: 'expo.out' }, .35)
      .fromTo($$('#readerText p'), { y: 24, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', stagger: .15, duration: .9, ease: 'power3.out' }, .6);
    function openReader(i, x, y) {
      if (rOpen) return; rOpen = true; ci = i; origin = [x, y];
      fillReader(i);
      reader.classList.add('is-open'); reader.setAttribute('aria-hidden', 'false'); reader.scrollTop = 0;
      lenis?.stop();
      gsap.fromTo(reader, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${Math.hypot(innerWidth, innerHeight) * 1.1}px at ${x}px ${y}px)`, duration: 1, ease: 'expo.inOut' });
      animIn().delay(.4);
      $('#readerClose').focus({ preventScroll: true });
    }
    function closeReader() {
      if (!rOpen) return;
      const [x, y] = origin;
      gsap.to(reader, {
        clipPath: `circle(0px at ${x}px ${y}px)`, duration: .8, ease: 'expo.inOut',
        onComplete: () => { reader.classList.remove('is-open'); reader.setAttribute('aria-hidden', 'true'); rOpen = false; lenis?.start(); chapters[ci].focus({ preventScroll: true }); }
      });
    }
    function go(d) {
      const n = ci + d;
      if (!rOpen || rBusy || n < 0 || n >= chapters.length) return;
      rBusy = true;
      gsap.timeline({ onComplete: () => { ci = n; fillReader(n); reader.scrollTop = 0; animIn(d); setTimeout(() => { rBusy = false; }, 400); } })
        .to(rInner, { x: -d * 80, opacity: 0, filter: 'blur(8px)', duration: .45, ease: 'power2.in' })
        .set(rInner, { x: 0, opacity: 1, filter: 'none' });
    }
    $('#readerClose').addEventListener('click', closeReader);
    $('#readerPrev').addEventListener('click', () => go(-1));
    $('#readerNext').addEventListener('click', () => go(1));
    addEventListener('keydown', e => {
      if (!rOpen) return;
      if (e.key === 'Escape') closeReader();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    });
  }

  /* ---------- 7. LÁ THƯ ---------- */
  const env = $('#envelope'), paper = $('#paper'), pc = $('#paperContent');
  if (env && paper && pc) {
    const lines = $$('p', pc);
    gsap.set(lines, { opacity: 0, y: 10 });
    let ltl = null;
    const build = () => {
      const envH = env.offsetHeight, ph = pc.scrollHeight + 10, base = parseFloat(getComputedStyle(env).marginTop);
      const need = Math.max(base, envH * .55 + ph - envH * .88 + 40);
      const seal = $('.envelope__seal', env);
      ltl = gsap.timeline({ paused: true, onComplete: () => ScrollTrigger.refresh(), onReverseComplete: () => ScrollTrigger.refresh() })
        .to(seal, { scale: 1.3, rotate: 25, duration: .25, ease: 'power2.out' })
        .add(() => {
          if (ltl.reversed()) return;
          const r = seal.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + r.height / 2, { n: 18, chars: ['✦', '·', '✧'], colors: ['#d8b46a', '#f0d08a', '#ffffff'], spread: 150 });
        })
        .to(seal, { scale: 0, rotate: -90, opacity: 0, duration: .35, ease: 'back.in(2)' })
        .to('.envelope__flap', { rotateX: 180, duration: .8, ease: 'power3.inOut' }, '-=.1')
        .set('.envelope__flap', { zIndex: 0 }, '-=.4')
        .to(env, { marginTop: need, duration: 1.4, ease: 'expo.inOut' }, '-=.2')
        .to(paper, { y: -envH * .55, duration: .8, ease: 'power3.out' }, '<')
        .to(paper, { height: ph, duration: .9, ease: 'expo.inOut' }, '-=.3')
        .to(lines, { opacity: 1, y: 0, stagger: .35, duration: .8, ease: 'power2.out' }, '-=.3');
    };
    $('#envOpen').addEventListener('click', () => {
      if (!ltl) build();
      env.classList.add('is-open');
      ltl.timeScale(1).play();
    });
    $('#envClose').addEventListener('click', () => {
      env.classList.remove('is-open');
      ltl?.timeScale(1.8).reverse();
      setTimeout(() => $('#envOpen').focus({ preventScroll: true }), 50);
    });
    addEventListener('resize', () => { if (ltl && !env.classList.contains('is-open') && ltl.progress() === 0) ltl = null; });
  }
})();
