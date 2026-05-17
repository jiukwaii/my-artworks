(() => {
  'use strict';

  console.log('SCRIPT VERSION: LAYER_CHECKED_PIPE_IN_FRONT_2026_05_12');

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const gameCard = document.getElementById('gameCard');
  const overlay = document.getElementById('overlay');
  const panelTitle = document.getElementById('panelTitle');
  const panelText = document.getElementById('panelText');
  const panelNote = document.getElementById('panelNote');
  const mainButton = document.getElementById('mainButton');
  const scoreEl = document.getElementById('score');
  const bestScoreEl = document.getElementById('bestScore');
  const finalScoreEl = document.getElementById('finalScore');
  const finalBestEl = document.getElementById('finalBest');
  const scorePill = document.getElementById('scorePill');
  const playTip = document.getElementById('playTip');
  const hitFlash = document.getElementById('hitFlash');

  const STORAGE_KEY = 'birdJumpBestScore_v2';

  // 游戏世界使用固定虚拟尺寸，真实屏幕只负责缩放。
  // 好处：手机、电脑、不同分辨率下，游戏速度和碰撞范围都更稳定。
  const WORLD = { width: 360, height: 640, ground: 68 };
  const DPR_LIMIT = 2;

  let scaleX = 1;
  let scaleY = 1;
  let state = 'ready'; // ready | playing | gameover
  let lastTime = 0;
  let accumulator = 0;
  let rafId = 0;
  let score = 0;
  let bestScore = Number(localStorage.getItem(STORAGE_KEY) || 0);
  let shakeTime = 0;

  const bird = {
    x: 92,
    y: WORLD.height * 0.46,
    r: 14,
    vy: 0,
    rotation: 0,
    flapAnim: 0,
  };

  const game = {
    gravity: 1450,
    jumpVelocity: -430,
    pipeSpeed: 142,
    pipeWidth: 58,
    pipeGap: 158,
    pipeEvery: 1.35,
    pipeTimer: 0,
    difficultyTimer: 0,
  };

  const pipes = [];
  const clouds = [];
  const particles = [];

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function resizeCanvas() {
    const rect = gameCard.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);

    // 真实 canvas 像素乘以 DPR，避免 Retina 手机画面模糊。
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 世界坐标到实际显示尺寸的缩放比例。
    scaleX = rect.width / WORLD.width;
    scaleY = rect.height / WORLD.height;
  }

  function withWorldTransform(drawFn) {
    ctx.save();
    ctx.scale(scaleX, scaleY);
    drawFn();
    ctx.restore();
  }

  function resetGame() {
    score = 0;
    bird.y = WORLD.height * 0.46;
    bird.vy = 0;
    bird.rotation = 0;
    bird.flapAnim = 0;

    pipes.length = 0;
    particles.length = 0;

    game.pipeTimer = 0;
    game.difficultyTimer = 0;
    game.pipeSpeed = 142;
    game.pipeGap = 158;
    shakeTime = 0;

    updateScoreUI();
    createInitialClouds();
  }

  function createInitialClouds() {
    clouds.length = 0;
    for (let i = 0; i < 7; i++) {
      clouds.push({
        x: Math.random() * WORLD.width,
        y: 36 + Math.random() * 185,
        w: 48 + Math.random() * 48,
        speed: 8 + Math.random() * 15,
        alpha: 0.38 + Math.random() * 0.36,
      });
    }
  }

  function updateScoreUI() {
    scoreEl.textContent = score;
    bestScoreEl.textContent = bestScore;
    finalScoreEl.textContent = score;
    finalBestEl.textContent = bestScore;
  }

  function popScore() {
    scorePill.classList.remove('pop');
    void scorePill.offsetWidth;
    scorePill.classList.add('pop');
  }

  function showOverlay(mode) {
    overlay.classList.remove('hidden');

    if (mode === 'ready') {
      panelTitle.textContent = '小鸟跳跃';
      panelText.textContent = '避开水管，穿过空隙得分。手机端可直接轻点屏幕，电脑可按 Space。';
      mainButton.textContent = '开始游戏';
      panelNote.textContent = '建议手机竖屏游玩，节奏更稳定。';
    } else {
      panelTitle.textContent = 'Game Over';
      panelText.textContent = score >= bestScore && score > 0
        ? '新纪录！这次飞得更远。'
        : '撞到水管或地面就会结束。调整节奏再试一次。';
      mainButton.textContent = '重新开始';
      panelNote.textContent = '轻点按钮或按 Space 重新开始。';
    }
  }

  function hideOverlay() {
    overlay.classList.add('hidden');
  }

  function startGame() {
    resetGame();
    state = 'playing';
    hideOverlay();

    // 开局给一个短提示，之后自动淡出，避免挡住手机游玩视线。
    playTip.style.opacity = '1';
    setTimeout(() => {
      if (state === 'playing') playTip.style.opacity = '0';
    }, 1300);

    lastTime = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  function endGame() {
    if (state !== 'playing') return;

    state = 'gameover';
    shakeTime = 0.22;

    hitFlash.classList.remove('active');
    void hitFlash.offsetWidth;
    hitFlash.classList.add('active');

    // 死亡时才写入 localStorage，减少频繁写入。
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem(STORAGE_KEY, String(bestScore));
    }

    updateScoreUI();
    showOverlay('gameover');
  }

  function flap() {
    if (state === 'ready' || state === 'gameover') {
      startGame();
      return;
    }

    // 点击 / 触碰 / Space 都会触发同一个跳跃逻辑。
    bird.vy = game.jumpVelocity;
    bird.flapAnim = 0.14;
    spawnParticles(bird.x - 10, bird.y + 8, 5);
  }

  function spawnParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: -40 - Math.random() * 80,
        vy: -40 + Math.random() * 80,
        life: 0.32,
        maxLife: 0.32,
        r: 2 + Math.random() * 2,
      });
    }
  }

  function createPipe() {
    const topLimit = 92;
    const bottomLimit = WORLD.height - WORLD.ground - game.pipeGap - 92;
    const topHeight = topLimit + Math.random() * Math.max(20, bottomLimit - topLimit);

    pipes.push({
      x: WORLD.width + 20,
      top: topHeight,
      passed: false,
    });
  }

  function update(dt) {
    if (state !== 'playing') return;

    // 难度渐进：速度慢慢增加，管道间距轻微收窄。
    game.difficultyTimer += dt;
    game.pipeSpeed = 142 + Math.min(48, game.difficultyTimer * 2.2);
    game.pipeGap = Math.max(132, 158 - game.difficultyTimer * 0.45);

    bird.vy += game.gravity * dt;
    bird.y += bird.vy * dt;

    // 降低小鸟旋转幅度，避免手机游玩时画面一直斜来斜去造成干扰。
    bird.rotation = clamp(bird.vy / 1100, -0.28, 0.48);
    bird.flapAnim = Math.max(0, bird.flapAnim - dt);

    if (bird.y - bird.r < 0) {
      bird.y = bird.r;
      bird.vy = 0;
    }

    if (bird.y + bird.r > WORLD.height - WORLD.ground) {
      bird.y = WORLD.height - WORLD.ground - bird.r;
      endGame();
    }

    game.pipeTimer += dt;
    if (game.pipeTimer >= game.pipeEvery) {
      game.pipeTimer = 0;
      createPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
      const pipe = pipes[i];
      pipe.x -= game.pipeSpeed * dt;

      const bottomY = pipe.top + game.pipeGap;

      // 碰撞使用略小于视觉半径的范围，减少“明明没撞到却死”的挫败感。
      const hitX = bird.x + bird.r * 0.82 > pipe.x && bird.x - bird.r * 0.82 < pipe.x + game.pipeWidth;
      const hitTop = bird.y - bird.r * 0.82 < pipe.top;
      const hitBottom = bird.y + bird.r * 0.82 > bottomY;

      if (hitX && (hitTop || hitBottom)) {
        endGame();
      }

      if (!pipe.passed && pipe.x + game.pipeWidth < bird.x) {
        pipe.passed = true;
        score += 1;

        // 最高分实时显示，但只在游戏结束时写入 localStorage。
        if (score > bestScore) bestScore = score;

        updateScoreUI();
        popScore();
        spawnParticles(bird.x, bird.y, 8);
      }

      if (pipe.x + game.pipeWidth < -30) pipes.splice(i, 1);
    }

    clouds.forEach(cloud => {
      cloud.x -= cloud.speed * dt;
      if (cloud.x + cloud.w < -20) {
        cloud.x = WORLD.width + 40;
        cloud.y = 36 + Math.random() * 185;
      }
    });

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 160 * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    shakeTime = Math.max(0, shakeTime - dt);
  }

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, WORLD.height);
    sky.addColorStop(0, '#86e8ff');
    sky.addColorStop(0.58, '#c8f7ff');
    sky.addColorStop(1, '#fff1bd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    ctx.fillStyle = 'rgba(255, 210, 84, 0.42)';
    ctx.beginPath();
    ctx.arc(WORLD.width - 58, 70, 31, 0, Math.PI * 2);
    ctx.fill();

    clouds.forEach(cloud => drawCloud(cloud));

    // All hill shapes stay inside the background layer.
    // They are drawn before pipes, so they can never cover the pipes.
    drawBackgroundHills();
  }

  function drawBackgroundHills() {
    const groundY = WORLD.height - WORLD.ground;

    // Far hill: lighter and more transparent.
    ctx.fillStyle = 'rgba(77, 184, 128, 0.18)';
    ctx.beginPath();
    ctx.moveTo(0, groundY - 76);
    ctx.quadraticCurveTo(70, groundY - 126, 158, groundY - 66);
    ctx.quadraticCurveTo(252, groundY - 126, WORLD.width, groundY - 82);
    ctx.lineTo(WORLD.width, groundY);
    ctx.lineTo(0, groundY);
    ctx.closePath();
    ctx.fill();

    // Near hill: darker, but still part of the background layer.
    // Because render() draws this before drawPipes(), pipes remain visually in front.
    ctx.fillStyle = '#238b4f';
    ctx.beginPath();
    ctx.moveTo(0, groundY - 46);
    ctx.quadraticCurveTo(85, groundY - 96, 162, groundY - 38);
    ctx.quadraticCurveTo(250, groundY - 100, WORLD.width, groundY - 54);
    ctx.lineTo(WORLD.width, groundY);
    ctx.lineTo(0, groundY);
    ctx.closePath();
    ctx.fill();
  }

  function drawCloud(cloud) {
    ctx.save();
    ctx.globalAlpha = cloud.alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.w * 0.23, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.w * 0.24, cloud.y - 8, cloud.w * 0.27, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.w * 0.5, cloud.y, cloud.w * 0.25, 0, Math.PI * 2);
    ctx.roundRect(cloud.x - 5, cloud.y, cloud.w * 0.62, cloud.w * 0.22, 14);
    ctx.fill();
    ctx.restore();
  }

  function drawPipes() {
    pipes.forEach(pipe => {
      drawPipe(pipe.x, 0, game.pipeWidth, pipe.top, true);
      drawPipe(pipe.x, pipe.top + game.pipeGap, game.pipeWidth, WORLD.height - WORLD.ground - pipe.top - game.pipeGap, false);
    });
  }

  function drawPipe(x, y, w, h, topPipe) {
    const capH = 22;

    // A small shadow makes the pipe read as a foreground obstacle, not part of the hills.
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(x - 2, y, w + 4, h);
    ctx.restore();

    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, '#2ba85e');
    grad.addColorStop(0.42, '#5bd97e');
    grad.addColorStop(1, '#1f8f50');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(x + 9, y + 5, 8, Math.max(0, h - 10));

    ctx.fillStyle = '#22894c';
    const capY = topPipe ? y + h - capH : y;
    ctx.roundRect(x - 5, capY, w + 10, capH, 8);
    ctx.fill();
  }

  function drawGround() {
    const y = WORLD.height - WORLD.ground;
    ctx.fillStyle = '#5fc26c';
    ctx.fillRect(0, y, WORLD.width, 12);
    ctx.fillStyle = '#9b6a39';
    ctx.fillRect(0, y + 12, WORLD.width, WORLD.ground - 12);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let x = -20; x < WORLD.width + 20; x += 34) {
      ctx.beginPath();
      ctx.moveTo(x, y + 27);
      ctx.lineTo(x + 17, y + 15);
      ctx.lineTo(x + 34, y + 27);
      ctx.lineTo(x + 17, y + 39);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawBird() {
    // 阴影单独绘制，不跟着小鸟旋转；这样视觉更稳定，不会出现“阴影也斜着晃”的感觉。
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
    ctx.beginPath();
    ctx.ellipse(bird.x + 3, bird.y + bird.r + 10, 16, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    // 保留轻微跳跃弹性，但幅度降低，避免角色变形太明显。
    const squash = bird.flapAnim > 0 ? 1.035 : 1;
    ctx.scale(1, squash);

    ctx.fillStyle = '#ffd84d';
    ctx.beginPath();
    ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffb12a';
    ctx.beginPath();
    ctx.ellipse(-7, 5, 10, 6, -0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff7d6';
    ctx.beginPath();
    ctx.arc(6, -5, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(8, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff7a2f';
    ctx.beginPath();
    ctx.moveTo(13, -1);
    ctx.lineTo(25, 3);
    ctx.lineTo(13, 7);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = '#fff3a3';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    withWorldTransform(() => {
      if (shakeTime > 0) {
        const amount = 3.5 * (shakeTime / 0.22);
        ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
      }

      // Layer order is intentional: hills are background, pipes are in front.
      drawBackground();
      drawPipes();
      drawParticles();
      drawGround();
      drawBird();
    });
  }

  function loop(now) {
    const frameDt = Math.min(0.033, (now - lastTime) / 1000 || 0);
    lastTime = now;

    // 固定步长更新，避免 60Hz / 120Hz 手机上速度不一致。
    accumulator += frameDt;
    const step = 1 / 120;
    while (accumulator >= step) {
      update(step);
      accumulator -= step;
    }

    render();
    rafId = requestAnimationFrame(loop);
  }

  function handleInput(event) {
    event.preventDefault();
    flap();
  }

  mainButton.addEventListener('click', handleInput);
  canvas.addEventListener('pointerdown', handleInput, { passive: false });

  window.addEventListener('keydown', event => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      flap();
    }
  });

  window.addEventListener('resize', () => {
    resizeCanvas();
    render();
  });

  document.addEventListener('visibilitychange', () => {
    // 切换页面回来时重置时间，避免游戏突然补算一大段导致瞬移。
    if (!document.hidden) lastTime = performance.now();
  });

  // 兼容少数旧浏览器没有 roundRect 的情况。
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2);
      this.beginPath();
      this.moveTo(x + radius, y);
      this.arcTo(x + w, y, x + w, y + h, radius);
      this.arcTo(x + w, y + h, x, y + h, radius);
      this.arcTo(x, y + h, x, y, radius);
      this.arcTo(x, y, x + w, y, radius);
      this.closePath();
      return this;
    };
  }

  resizeCanvas();
  resetGame();
  updateScoreUI();
  showOverlay('ready');
  render();
  rafId = requestAnimationFrame(loop);
})();
