/* ==========================================================================
   main.js
   Loader sequence, GSAP scroll-triggered reveals, custom cursor, magnetic
   buttons, science HUD wiring, applications grid, gallery, fun-fact counters,
   audio toggle, and scroll progress rail.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  runLoader().then(() => {
    document.getElementById('main').classList.remove('hidden-until-ready');
    gsap.to('#main', { opacity: 1, duration: 0.6 });

    initCursor();
    initHeroIntro();
    window.BubbleScenes.initHeroScene();
    const science = window.BubbleScenes.initScienceScene();
    initScienceHUD(science);

    initScrollReveals();
    initMagneticButtons();
    initAppGrid();
    initGallery();
    initFactCounters();
    initAudioToggle();
    initScrollProgress();
    initVideoPlaceholder();
    window.initQuiz();
    window.MicroAndThanks.initMicroCanvas();
    window.MicroAndThanks.initThanksCanvas();
  });
});

/* ---------------------------------------------------------------- */
/* Loader                                                             */
/* ---------------------------------------------------------------- */
function runLoader() {
  return new Promise((resolve) => {
    const percentEl = document.getElementById('loader-percent');
    const ring = document.getElementById('loader-ring');
    const loader = document.getElementById('loader');
    let pct = 0;

    const interval = setInterval(() => {
      pct += Math.random() * 12 + 4;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        percentEl.textContent = '100';
        // bubble "pops": quick scale up then collapse
        gsap.timeline({ onComplete: () => {
          gsap.to(loader, {
            opacity: 0, duration: 0.6, onComplete: () => {
              loader.style.display = 'none';
              resolve();
            }
          });
        }})
        .to(ring, { scale: 1.15, duration: 0.18, ease: 'power1.out' })
        .to(ring, { scale: 0, opacity: 0, duration: 0.28, ease: 'power2.in' });
        return;
      }
      percentEl.textContent = String(Math.floor(pct)).padStart(2, '0');
      const scale = 0.4 + (pct / 100) * 0.6;
      gsap.to(ring, { scale, duration: 0.3, ease: 'power1.out' });
    }, 180);
  });
}

/* ---------------------------------------------------------------- */
/* Hero intro + CTA scroll                                            */
/* ---------------------------------------------------------------- */
function initHeroIntro() {
  gsap.set('.hero-title .line', { yPercent: 110 });
  gsap.to('.hero-title .line', {
    yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out', delay: 0.2
  });
  gsap.fromTo('.hero-subtitle', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, delay: 0.7 });
  gsap.fromTo('.cta', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, delay: 0.9 });
  gsap.fromTo('.hero-readout, .scroll-cue', { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.2 });

  document.getElementById('start-exploring').addEventListener('click', () => {
    document.getElementById('watch').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ---------------------------------------------------------------- */
/* Scroll reveals (ScrollTrigger)                                     */
/* ---------------------------------------------------------------- */
function initScrollReveals() {
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.reveal-up').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 85%',
      onEnter: () => el.classList.add('is-visible'),
      onEnterBack: () => el.classList.add('is-visible')
    });
  });

  document.querySelectorAll('.timeline-step').forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 88%',
      onEnter: () => el.classList.add('is-visible'),
      onEnterBack: () => el.classList.add('is-visible')
    });
  });

  gsap.utils.toArray('.section-title, .section-lead, .eyebrow').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 24 }, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });

  gsap.utils.toArray('.app-card').forEach((el, i) => {
    gsap.fromTo(el, { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.6, delay: (i % 4) * 0.06,
      scrollTrigger: { trigger: el, start: 'top 92%' }
    });
  });
}

/* ---------------------------------------------------------------- */
/* Custom cursor + magnetic buttons                                   */
/* ---------------------------------------------------------------- */
function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || window.matchMedia('(hover: none)').matches) return;

  let dx = 0, dy = 0, rx = 0, ry = 0;
  window.addEventListener('pointermove', (e) => { dx = e.clientX; dy = e.clientY; });

  function loop() {
    rx += (dx - rx) * 0.18;
    ry += (dy - ry) * 0.18;
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('a, button, .quiz-option, .app-card, .hud-marker').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
  });
}

function initMagneticButtons() {
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: relX * 0.3, y: relY * 0.4, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ---------------------------------------------------------------- */
/* Science HUD                                                        */
/* ---------------------------------------------------------------- */
const SCIENCE_COPY = {
  tension: {
    title: 'Surface Tension',
    body: 'Molecules at the surface are pulled inward by their neighbors, with nothing pulling back from outside. That imbalance acts like a stretched elastic skin, and it is why a bubble holds its shape at all.'
  },
  film: {
    title: 'Soap Film',
    body: 'The wall is a three-layer sandwich: soap molecules facing outward on both sides, a thin layer of water trapped between them. This structure resists breaking far better than plain water alone.'
  },
  pressure: {
    title: 'Air Pressure',
    body: 'Pressure inside a bubble is always slightly higher than outside — the smaller the bubble, the greater the difference. That is why a small bubble pushes air into a larger one, not the reverse.'
  },
  elasticity: {
    title: 'Elasticity',
    body: 'The film behaves elastically over short stretches, absorbing gentle disturbances by wobbling rather than tearing — until it is stretched thin enough for gravity or evaporation to break it.'
  }
};

function initScienceHUD(scienceScene) {
  const hud = document.getElementById('science-hud');
  const panel = document.getElementById('science-panel');
  const panelTitle = document.getElementById('science-panel-title');
  const panelBody = document.getElementById('science-panel-body');
  const panelClose = document.getElementById('science-panel-close');
  const markerEls = {};

  scienceScene.markerDefs.forEach((m) => {
    const el = document.createElement('div');
    el.className = 'hud-marker';
    el.innerHTML = `<span class="dotmark"></span><span class="lbl">${m.label}</span>`;
    el.addEventListener('click', () => openPanel(m.key));
    hud.appendChild(el);
    markerEls[m.key] = el;
  });

  function openPanel(key) {
    const data = SCIENCE_COPY[key];
    panelTitle.textContent = data.title;
    panelBody.textContent = data.body;
    panel.classList.add('is-open');
    Object.values(markerEls).forEach((e) => e.classList.remove('is-active'));
    markerEls[key].classList.add('is-active');
  }

  panelClose.addEventListener('click', () => panel.classList.remove('is-open'));

  window.__scienceMarkersUpdate = (projected) => {
    projected.forEach((p) => {
      const el = markerEls[p.key];
      if (!el) return;
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.style.opacity = p.behind ? '0.15' : '1';
      el.style.pointerEvents = p.behind ? 'none' : 'auto';
    });
  };
}

/* ---------------------------------------------------------------- */
/* Applications grid                                                  */
/* ---------------------------------------------------------------- */
const APPLICATIONS = [
  { name: 'Detergents', desc: 'Surfactants lower water\u2019s surface tension so it can slip between fibers and lift away grease.' },
  { name: 'Firefighting Foams', desc: 'Foam concentrates spread a thin film across fuel, cutting off the oxygen a fire needs.' },
  { name: 'Microfluidics', desc: 'Lab-on-a-chip devices move droplets by precisely tuning surface tension at tiny scales.' },
  { name: 'Chemical Engineering', desc: 'Interfacial tension governs how liquids mix, separate, and coat surfaces in process design.' },
  { name: 'Inkjet Printing', desc: 'Ink is engineered to form clean, consistent droplets as it leaves the nozzle.' },
  { name: 'Biomedical Engineering', desc: 'Lung surfactant keeps the tiny air sacs in our lungs from collapsing on every exhale.' },
  { name: 'Food Industry', desc: 'Emulsifiers use the same physics to keep oil and water blended in sauces and creams.' },
  { name: 'Bubble Physics Research', desc: 'Foam structure and drainage are still active research topics in soft-matter physics.' }
];

function initAppGrid() {
  const grid = document.getElementById('app-grid');
  APPLICATIONS.forEach((app, i) => {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = `
      <span class="app-index mono">0${i + 1}</span>
      <h4>${app.name}</h4>
      <p class="app-desc">${app.desc}</p>
    `;
    card.addEventListener('click', () => card.classList.toggle('is-open'));
    grid.appendChild(card);
  });
}

/* ---------------------------------------------------------------- */
/* Gallery (placeholder masonry)                                      */
/* ---------------------------------------------------------------- */
function initGallery() {
  const masonry = document.getElementById('masonry');
  const ratios = [1, 1.3, 0.8, 1.1, 0.9, 1.4, 1, 1.2];
  ratios.forEach((ar, i) => {
    const item = document.createElement('div');
    item.className = 'masonry-item';
    item.innerHTML = `<div class="ph" style="--ar:${ar}; background:linear-gradient(155deg, rgba(111,233,255,0.15), rgba(20,29,66,0.6))"></div>`;
    masonry.appendChild(item);
  });
}

/* ---------------------------------------------------------------- */
/* Fun fact counters                                                  */
/* ---------------------------------------------------------------- */
function initFactCounters() {
  document.querySelectorAll('.fact-number').forEach((el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 1.4, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.floor(obj.val) + suffix; }
        });
      }
    });
  });
}

/* ---------------------------------------------------------------- */
/* Audio toggle (no-op safe if file missing)                          */
/* ---------------------------------------------------------------- */
function initAudioToggle() {
  const btn = document.getElementById('audio-toggle');
  const audio = document.getElementById('ambient-audio');
  const iconMuted = document.getElementById('icon-muted');
  const iconUnmuted = document.getElementById('icon-unmuted');
  let playing = false;

  btn.addEventListener('click', () => {
    playing = !playing;
    btn.setAttribute('aria-pressed', String(playing));
    iconMuted.style.display = playing ? 'none' : 'block';
    iconUnmuted.style.display = playing ? 'block' : 'none';
    if (playing) {
      audio.play().catch(() => { /* file not provided yet — silent no-op */ });
    } else {
      audio.pause();
    }
  });
}

/* ---------------------------------------------------------------- */
/* Scroll progress rail                                               */
/* ---------------------------------------------------------------- */
function initScrollProgress() {
  const fill = document.getElementById('progress-fill');
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    fill.style.width = `${scrolled * 100}%`;
  });
}

/* ---------------------------------------------------------------- */
/* Video placeholder play button                                      */
/* ---------------------------------------------------------------- */
function initVideoPlaceholder() {
  const btn = document.getElementById('play-btn');
  btn.addEventListener('click', () => {
    btn.parentElement.innerHTML = `
      <video controls autoplay style="width:100%;height:100%;object-fit:cover;">
        <source src="assets/video/experiment.mp4" type="video/mp4">
        Your browser does not support embedded video. Add experiment.mp4 to assets/video/.
      </video>`;
  });
}
