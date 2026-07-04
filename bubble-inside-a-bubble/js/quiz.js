/* ==========================================================================
   quiz.js
   Five-question quiz on surface tension with instant feedback,
   a dot progress indicator, and a confetti + floating-bubbles finale.
   ========================================================================== */

const QUIZ_QUESTIONS = [
  {
    q: 'Why do soap bubbles form spheres?',
    options: [
      'A sphere minimizes surface area for a given volume',
      'Gravity pulls the film into a round shape',
      'Air pressure only pushes outward in curves',
      'It is the easiest shape to blow'
    ],
    correct: 0
  },
  {
    q: 'What does soap actually do to water?',
    options: [
      'Makes it heavier',
      'Lowers its surface tension',
      'Raises its boiling point',
      'Increases its viscosity dramatically'
    ],
    correct: 1
  },
  {
    q: 'In the bubble-inside-a-bubble experiment, why coat the straw in soap first?',
    options: [
      'To make it slippery for easier handling',
      'To flavor the air being blown in',
      'So it can pass through the outer film without popping it',
      'To cool the air before it enters'
    ],
    correct: 2
  },
  {
    q: 'A soap film is a sandwich of soap molecules around a layer of what?',
    options: ['Oil', 'Water', 'Glycerine only', 'Air'],
    correct: 1
  },
  {
    q: 'What happens where three soap films meet, as in a cluster of bubbles?',
    options: [
      'They always meet at a 90° angle',
      'They always meet at a 120° angle',
      'One film always dominates the other two',
      'They repel and never touch'
    ],
    correct: 1
  }
];

(function () {
  let current = 0;
  let score = 0;
  let answered = false;

  const els = {};

  function cacheEls() {
    els.count = document.getElementById('quiz-count');
    els.question = document.getElementById('quiz-question');
    els.options = document.getElementById('quiz-options');
    els.dots = Array.from(document.querySelectorAll('.quiz-progress-dot'));
    els.questionWrap = document.getElementById('quiz-question-wrap');
    els.complete = document.getElementById('quiz-complete');
    els.scoreLine = document.getElementById('quiz-score-line');
    els.restart = document.getElementById('quiz-restart');
  }

  function renderDots() {
    els.dots.forEach((dot, i) => {
      dot.classList.toggle('is-done', i < current);
      dot.classList.toggle('is-current', i === current);
    });
  }

  function renderQuestion() {
    answered = false;
    const item = QUIZ_QUESTIONS[current];
    els.count.textContent = `QUESTION ${current + 1} / ${QUIZ_QUESTIONS.length}`;
    els.question.textContent = item.q;
    els.options.innerHTML = '';
    item.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleAnswer(i, btn));
      els.options.appendChild(btn);
    });
    renderDots();
  }

  function handleAnswer(index, btn) {
    if (answered) return;
    answered = true;
    const item = QUIZ_QUESTIONS[current];
    const buttons = Array.from(els.options.children);
    buttons.forEach((b) => (b.disabled = true));

    if (index === item.correct) {
      btn.classList.add('is-correct');
      score++;
      const rect = btn.getBoundingClientRect();
      if (window.BGParticles) window.BGParticles.burst(rect.left + rect.width / 2, rect.top, 6);
      if (window.gsap) {
        gsap.fromTo(btn, { scale: 1 }, { scale: 1.02, duration: 0.2, yoyo: true, repeat: 1 });
      }
    } else {
      btn.classList.add('is-wrong');
      buttons[item.correct].classList.add('is-correct');
    }

    setTimeout(() => {
      current++;
      if (current >= QUIZ_QUESTIONS.length) {
        showComplete();
      } else {
        renderQuestion();
      }
    }, 900);
  }

  function showComplete() {
    els.questionWrap.classList.add('hidden');
    els.complete.classList.remove('hidden');
    els.scoreLine.textContent = `You scored ${score} out of ${QUIZ_QUESTIONS.length}.`;
    renderDots();
    launchConfetti();
  }

  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    const parent = canvas.closest('.quiz-complete');
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const pieces = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      r: 3 + Math.random() * 5,
      speed: 1 + Math.random() * 2,
      drift: (Math.random() - 0.5) * 1.5,
      hue: [190, 210, 330, 45][Math.floor(Math.random() * 4)],
      life: 0
    }));

    let frame = 0;
    function tick() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach((p) => {
        p.y += p.speed;
        p.x += p.drift;
        p.life++;
        if (p.y < canvas.height + 20) alive = true;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, 0.85)`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      if (alive && frame < 240) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    tick();
  }

  function restart() {
    current = 0;
    score = 0;
    document.getElementById('quiz-complete').classList.add('hidden');
    document.getElementById('quiz-question-wrap').classList.remove('hidden');
    renderQuestion();
  }

  function initQuiz() {
    cacheEls();
    renderQuestion();
    els.restart.addEventListener('click', restart);
  }

  window.initQuiz = initQuiz;
})();
