/* ==========================================================================
   bubble-scene.js
   Three.js soap-bubble shader + two scenes:
     1. Hero — a large bubble with a second bubble forming inside it
     2. Science exhibit — a single draggable bubble with HUD markers
   The shader fakes thin-film interference with a fresnel-driven hue shift
   rather than physically simulating wavelength interference — a legible
   approximation appropriate for a museum-kiosk experience.
   ========================================================================== */

const BubbleShader = {
  vertex: `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec2 vUv;
    uniform float uTime;
    uniform float uWobble;

    void main() {
      vUv = uv;
      vec3 pos = position;
      float w = sin(uTime * 1.4 + position.x * 4.0) * 0.015
              + cos(uTime * 1.1 + position.y * 3.0) * 0.012;
      pos += normal * w * uWobble;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewDir = normalize(-mvPosition.xyz);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragment: `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    uniform float uOpacity;

    void main() {
      float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.4);
      float hueShift = sin(vUv.x * 10.0 + uTime * 0.5) * 0.5
                      + cos(vUv.y * 8.0 - uTime * 0.3) * 0.5;

      vec3 filmColor = mix(uColorA, uColorB, 0.5 + 0.5 * sin(hueShift * 3.14159));
      filmColor = mix(filmColor, uColorC, fresnel * 0.6);

      float alpha = clamp(fresnel * 0.85 + 0.06, 0.0, 0.9) * uOpacity;
      gl_FragColor = vec4(filmColor + fresnel * 0.5, alpha);
    }
  `
};

function makeBubbleMesh(radius, opts = {}) {
  const geo = new THREE.SphereGeometry(radius, 96, 96);
  const mat = new THREE.ShaderMaterial({
    vertexShader: BubbleShader.vertex,
    fragmentShader: BubbleShader.fragment,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uWobble: { value: opts.wobble ?? 1 },
      uOpacity: { value: opts.opacity ?? 1 },
      uColorA: { value: new THREE.Color(opts.colorA || '#6fe9ff') },
      uColorB: { value: new THREE.Color(opts.colorB || '#3d7bff') },
      uColorC: { value: new THREE.Color(opts.colorC || '#ff9ecf') }
    }
  });
  return new THREE.Mesh(geo, mat);
}

/* ---------------------------------------------------------------- */
/* HERO SCENE                                                         */
/* ---------------------------------------------------------------- */
function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  const wrap = document.getElementById('hero-canvas-wrap');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  const outerBubble = makeBubbleMesh(2.2, { colorA: '#6fe9ff', colorB: '#3d7bff', colorC: '#ff9ecf', opacity: 1 });
  scene.add(outerBubble);

  const innerBubble = makeBubbleMesh(0.05, { colorA: '#ffe29e', colorB: '#6fe9ff', colorC: '#ffffff', opacity: 0, wobble: 1.4 });
  scene.add(innerBubble);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('pointermove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  // subtle device-motion parallax on mobile
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    mouseX = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
    mouseY = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1);
  });

  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  let innerGrown = false;
  let growProgress = 0;

  // Trigger the inner bubble to form ~3s after load, per brief.
  setTimeout(() => { innerGrown = true; }, 3000);

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    outerBubble.material.uniforms.uTime.value = t;
    innerBubble.material.uniforms.uTime.value = t;

    outerBubble.rotation.y += 0.0015;
    outerBubble.rotation.x = mouseY * 0.15;
    outerBubble.rotation.y += mouseX * 0.0002;
    outerBubble.position.x = mouseX * 0.25;
    outerBubble.position.y = -mouseY * 0.15;

    if (innerGrown && growProgress < 1) {
      growProgress = Math.min(1, growProgress + 0.006);
      const eased = 1 - Math.pow(1 - growProgress, 3);
      const s = 0.9 * eased;
      innerBubble.scale.setScalar(Math.max(0.001, s / 0.9));
      innerBubble.material.uniforms.uOpacity.value = eased;
      innerBubble.position.set(-0.3 + eased * 0.2, -0.2 + eased * 0.1, 0.3);
    }
    innerBubble.rotation.y -= 0.003;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return { outerBubble, innerBubble };
}

/* ---------------------------------------------------------------- */
/* SCIENCE SCENE (draggable, with HUD markers)                        */
/* ---------------------------------------------------------------- */
function initScienceScene() {
  const canvas = document.getElementById('science-canvas');
  const stage = canvas.closest('.science-stage');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  const bubble = makeBubbleMesh(2, { colorA: '#6fe9ff', colorB: '#3d7bff', colorC: '#ff9ecf', wobble: 0.6 });
  scene.add(bubble);
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 3.5;
  controls.maxDistance = 9;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  // Marker anchor points on the sphere surface, in local space.
  const markerDefs = [
    { key: 'tension', pos: new THREE.Vector3(1.6, 1.0, 0.9), label: 'Surface Tension' },
    { key: 'film', pos: new THREE.Vector3(-1.7, 0.4, 0.8), label: 'Soap Film' },
    { key: 'pressure', pos: new THREE.Vector3(0.2, -1.7, 0.9), label: 'Air Pressure' },
    { key: 'elasticity', pos: new THREE.Vector3(-0.6, 1.5, -1.1), label: 'Elasticity' }
  ];

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  function animate() {
    bubble.material.uniforms.uTime.value = clock.getElapsedTime();
    controls.update();
    renderer.render(scene, camera);

    // project marker positions to screen space for the HUD overlay
    if (window.__scienceMarkersUpdate) {
      const rect = stage.getBoundingClientRect();
      const projected = markerDefs.map((m) => {
        const world = m.pos.clone().applyMatrix4(bubble.matrixWorld);
        const v = world.clone().project(camera);
        const behind = v.z > 1;
        return {
          key: m.key,
          label: m.label,
          x: (v.x * 0.5 + 0.5) * rect.width,
          y: (1 - (v.y * 0.5 + 0.5)) * rect.height,
          behind
        };
      });
      window.__scienceMarkersUpdate(projected);
    }
    requestAnimationFrame(animate);
  }
  animate();

  return { bubble, camera, controls, markerDefs };
}

window.BubbleScenes = { initHeroScene, initScienceScene };
