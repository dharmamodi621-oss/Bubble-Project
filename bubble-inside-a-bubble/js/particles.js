/* ==========================================================================
   particles.js
   Persistent background: drifting soap bubbles + floating dust particles.
   Runs on a single full-viewport canvas behind every section.
   ========================================================================== */

(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  let bubbles = [];
  let dust = [];
  let mouse = { x: 0, y: 0, active: false };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function makeBubbles(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: rand(0, W),
        y: rand(0, H * 3),
        r: rand(6, 46),
        speed: rand(0.15, 0.55),
        drift: rand(-0.3, 0.3),
        wobble: rand(0, Math.PI * 2),
        wobbleSpeed: rand(0.005, 0.02),
        hueShift: rand(0, 1),
        opacity: rand(0.08, 0.35)
      });
    }
    return arr;
  }

  function makeDust(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: rand(0, W), y: rand(0, H),
        r: rand(0.4, 1.6),
        speed: rand(0.05, 0.2),
        opacity: rand(0.1, 0.5)
      });
    }
    return arr;
  }

  function drawBubble(b) {
    const wob = Math.sin(b.wobble) * 2;
    const grad = ctx.createRadialGradient(
      b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1,
      b.x, b.y, b.r + wob
    );
    // thin-film interference-ish rainbow rim, kept subtle
    grad.addColorStop(0, `rgba(238,244,255,${b.opacity * 0.9})`);
    grad.addColorStop(0.5, `rgba(111,233,255,${b.opacity * 0.35})`);
    grad.addColorStop(0.8, `rgba(255,158,207,${b.opacity * 0.2})`);
    grad.addColorStop(1, 'rgba(4,6,12,0)');

    ctx.beginPath();
    ctx.fillStyle = grad;
    ctx.arc(b.x, b.y, b.r + wob, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = `rgba(111,233,255,${b.opacity * 0.5})`;
    ctx.lineWidth = 0.6;
    ctx.arc(b.x, b.y, b.r + wob, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawDust(d) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(238,244,255,${d.opacity})`;
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    bubbles.forEach((b) => {
      b.y -= b.speed;
      b.wobble += b.wobbleSpeed;
      b.x += Math.sin(b.wobble) * b.drift * 0.3;

      if (mouse.active) {
        const dx = b.x - mouse.x, dy = b.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (140 - dist) / 140;
          b.x += (dx / (dist || 1)) * force * 1.2;
          b.y += (dy / (dist || 1)) * force * 1.2;
        }
      }

      if (b.y < -b.r * 2) {
        b.y = H + b.r * 2;
        b.x = rand(0, W);
      }
      if (b.x < -60) b.x = W + 60;
      if (b.x > W + 60) b.x = -60;

      drawBubble(b);
    });

    dust.forEach((d) => {
      d.y -= d.speed;
      if (d.y < 0) { d.y = H; d.x = rand(0, W); }
      drawDust(d);
    });

    requestAnimationFrame(step);
  }

  window.addEventListener('resize', () => {
    resize();
  });

  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
  });
  window.addEventListener('pointerleave', () => { mouse.active = false; });

  resize();
  bubbles = makeBubbles(window.innerWidth < 720 ? 22 : 42);
  dust = makeDust(window.innerWidth < 720 ? 30 : 60);
  step();

  // Expose a tiny API in case other modules want to spawn a burst (e.g. quiz correct answer)
  window.BGParticles = {
    burst(x, y, count = 10) {
      for (let i = 0; i < count; i++) {
        bubbles.push({
          x, y, r: rand(3, 10), speed: rand(0.8, 2.2), drift: rand(-1, 1),
          wobble: rand(0, Math.PI * 2), wobbleSpeed: rand(0.02, 0.05),
          hueShift: 0, opacity: rand(0.3, 0.6)
        });
      }
      // trim to avoid unbounded growth
      if (bubbles.length > 140) bubbles.splice(0, bubbles.length - 140);
    }
  };
})();
