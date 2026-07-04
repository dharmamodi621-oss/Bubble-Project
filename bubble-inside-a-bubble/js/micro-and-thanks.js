/* ==========================================================================
   micro-and-thanks.js
   1. Microscopic World — animated soap molecules (hydrophilic heads /
      hydrophobic tails) sandwiching a layer of water molecules, continuously
      drifting to suggest a living film cross-section.
   2. Thank-you canvas — a single large ambient bubble drifting behind the
      closing credits.
   ========================================================================== */

function initMicroCanvas() {
  const canvas = document.getElementById('micro-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, DPR;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // Two rows of soap molecules (top row heads-up, bottom row heads-down),
  // with water molecules drifting in the gap between them.
  const rowGap = () => H * 0.42;
  const molecules = [];
  const count = 14;
  for (let i = 0; i < count; i++) {
    molecules.push({ row: 'top', xRatio: (i + 0.5) / count, bob: Math.random() * Math.PI * 2 });
    molecules.push({ row: 'bottom', xRatio: (i + 0.5) / count, bob: Math.random() * Math.PI * 2 });
  }
  const waters = Array.from({ length: 26 }).map(() => ({
    x: Math.random(), y: 0.32 + Math.random() * 0.36,
    vx: (Math.random() - 0.5) * 0.0006, vy: (Math.random() - 0.5) * 0.0006,
    r: 3 + Math.random() * 3
  }));

  function drawSoapMolecule(x, y, flip) {
    // head (hydrophilic, cyan) + tail (hydrophobic, gold), a small chain
    const dir = flip ? -1 : 1;
    ctx.beginPath();
    ctx.fillStyle = '#6fe9ff';
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,226,158,0.85)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.moveTo(x, y + dir * 6);
    ctx.lineTo(x, y + dir * 26);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,226,158,0.85)';
    ctx.arc(x, y + dir * 26, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  let t = 0;
  function tick() {
    t += 0.01;
    ctx.clearRect(0, 0, W, H);

    const topY = H * 0.5 - rowGap() / 2;
    const bottomY = H * 0.5 + rowGap() / 2;

    molecules.forEach((m) => {
      const bobY = Math.sin(t * 1.5 + m.bob) * 4;
      const x = m.xRatio * W;
      if (m.row === 'top') drawSoapMolecule(x, topY + bobY, false);
      else drawSoapMolecule(x, bottomY + bobY, true);
    });

    waters.forEach((w) => {
      w.x += w.vx; w.y += w.vy;
      if (w.x < 0.02 || w.x > 0.98) w.vx *= -1;
      if (w.y < 0.3 || w.y > 0.7) w.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(61,123,255,0.55)';
      ctx.arc(w.x * W, w.y * H, w.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(tick);
  }
  tick();
}

function initThanksCanvas() {
  const canvas = document.getElementById('thanks-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, DPR;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  let t = 0;
  function tick() {
    t += 0.006;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2 + Math.sin(t * 0.6) * 20;
    const cy = H / 2 + Math.cos(t * 0.5) * 14;
    const r = Math.min(W, H) * 0.28;

    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    grad.addColorStop(0, 'rgba(238,244,255,0.5)');
    grad.addColorStop(0.5, 'rgba(111,233,255,0.18)');
    grad.addColorStop(0.8, 'rgba(255,158,207,0.1)');
    grad.addColorStop(1, 'rgba(4,6,12,0)');

    ctx.beginPath();
    ctx.fillStyle = grad;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(111,233,255,0.35)';
    ctx.lineWidth = 1;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    requestAnimationFrame(tick);
  }
  tick();
}

window.MicroAndThanks = { initMicroCanvas, initThanksCanvas };
