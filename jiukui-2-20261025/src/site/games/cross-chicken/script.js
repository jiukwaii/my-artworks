(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const gameCard = document.getElementById('gameCard');
  const touchArea = document.getElementById('touchArea');

  const scoreEl = document.getElementById('score');
  const stepsEl = document.getElementById('steps');
  const coinsEl = document.getElementById('coins');
  const bestEl = document.getElementById('best');

  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayText = document.getElementById('overlayText');
  const mainBtn = document.getElementById('mainBtn');

  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const forwardBtn = document.getElementById('forwardBtn');
  const toast = document.getElementById('toast');

  const TOUCH_SWIPE_MIN = 34;
  const TOUCH_TAP_MAX_MOVE = 14;
  const TOUCH_TAP_MAX_TIME = 280;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let touchPointerId = null;

  const STORAGE_KEY = 'crossyChickenBestScore_v1';

  // 固定格子世界：9列 × 13行。所有逻辑都以 row/col 为准，避免手机尺寸变化导致碰撞混乱。
  const COLS = 9;
  const ROWS = 13;
  const TILE = 48;
  const WORLD_W = COLS * TILE;
  const WORLD_H = ROWS * TILE;
  const DPR_LIMIT = 2;

  let scaleX = 1;
  let scaleY = 1;
  let lastTime = 0;
  let accumulator = 0;
  let rafId = 0;

  let rows = [];
  let chicken = null;
  let gameState = 'ready'; // ready | running | over
  let outcome = ''; // win | fail | ''
  let steps = 0;
  let coins = 0;
  let score = 0;
  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);

  let shakeTime = 0;
  let moveAnim = 0;
  let particles = [];

  const COLORS = {
    start: '#2d7a40',
    goal: '#2f9e5f',
    grass: '#1f8f55',
    road: '#30343f',
    river: '#1677c8',
    laneLine: 'rgba(255,255,255,0.08)',
    yellow: '#ffd166',
    pink: '#ef476f',
    cyan: '#4cc9f0',
    green: '#06d6a0',
  };

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function randomCoinCols(blockedCols = [], count = 1) {
    const blocked = new Set(blockedCols);
    const available = [];
    for (let col = 0; col < COLS; col++) {
      if (!blocked.has(col)) available.push(col);
    }
    return shuffle(available).slice(0, count);
  }

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    scaleX = rect.width / WORLD_W;
    scaleY = rect.height / WORLD_H;
  }

  function withWorld(drawFn) {
    ctx.save();
    ctx.scale(scaleX, scaleY);
    drawFn();
    ctx.restore();
  }

  function createStartRow() {
    return { type: 'start', cars: [], trees: [], logs: [], coins: [] };
  }

  function createGoalRow() {
    return { type: 'goal', cars: [], trees: [], logs: [], coins: [] };
  }

  function createGrassRow(trees = [], coinCols = []) {
    return { type: 'grass', cars: [], trees, logs: [], coins: coinCols };
  }

  function createRoadRow(row, baseSpeed, dir, carColor = COLORS.pink) {
    const cars = [];
    const count = randInt(2, 3);
    const spacing = WORLD_W / count;
    const startOffset = randFloat(-spacing * 0.35, spacing * 0.35);

    for (let i = 0; i < count; i++) {
      cars.push({
        x: i * spacing + startOffset + randInt(-28, 28),
        row,
        width: TILE * randFloat(1.18, 1.48),
        speed: Math.round(baseSpeed * randFloat(0.9, 1.18)),
        dir,
        color: carColor,
      });
    }

    return { type: 'road', cars, trees: [], logs: [], coins: [] };
  }

  function createRiverRow(row, dir = 1, baseSpeed = 68) {
    // 浮木速度提高到约 1.3–1.6 格/秒；比原本更有节奏，但不会快到手机端难以反应。
    const logs = [
      { x: TILE * randFloat(0.25, 0.55), row, width: TILE * randFloat(1.35, 1.55), speed: Math.round(baseSpeed * randFloat(0.92, 1.08)), dir },
      { x: TILE * randFloat(2.75, 3.25), row, width: TILE * randFloat(1.7, 1.95), speed: Math.round(baseSpeed * randFloat(0.92, 1.08)), dir },
      { x: TILE * randFloat(5.95, 6.45), row, width: TILE * randFloat(1.45, 1.7), speed: Math.round(baseSpeed * randFloat(0.92, 1.08)), dir },
    ];

    return { type: 'river', cars: [], trees: [], logs, coins: [] };
  }

  function generateMap() {
    rows = [];

    const row1Trees = [1, 7];
    const row3Trees = [2, 6];
    const row5Trees = [0, 5];
    const row7Trees = [3, 8];
    const row9Trees = [2];
    const row11Trees = [1, 7];

    rows[0] = createStartRow();
    rows[1] = createGrassRow(row1Trees, randomCoinCols(row1Trees, 1));
    rows[2] = createRoadRow(2, 92, 1, COLORS.pink);
    rows[3] = createGrassRow(row3Trees, randomCoinCols(row3Trees, 2));
    rows[4] = createRoadRow(4, 122, -1, COLORS.cyan);
    rows[5] = createGrassRow(row5Trees, randomCoinCols(row5Trees, 1));
    rows[6] = createRiverRow(6, 1, 66);
    rows[7] = createGrassRow(row7Trees, randomCoinCols(row7Trees, 2));
    rows[8] = createRiverRow(8, -1, 74);
    rows[9] = createGrassRow(row9Trees, randomCoinCols(row9Trees, 2));
    rows[10] = createRoadRow(10, 146, 1, COLORS.green);
    rows[11] = createGrassRow(row11Trees, Math.random() > 0.5 ? randomCoinCols(row11Trees, 1) : []);
    rows[12] = createGoalRow();
  }

  function resetChicken() {
    chicken = {
      col: Math.floor(COLS / 2),
      row: 0,
      x: Math.floor(COLS / 2) * TILE,
      y: rowToY(0),
      targetX: Math.floor(COLS / 2) * TILE,
      targetY: rowToY(0),
    };
  }

  function rowToY(row) {
    return WORLD_H - (row + 1) * TILE;
  }

  function calcScore() {
    score = steps + coins * 5;
    return score;
  }

  function updateHud() {
    calcScore();
    scoreEl.textContent = score;
    stepsEl.textContent = steps;
    coinsEl.textContent = coins;
    bestEl.textContent = best;
  }

  function showOverlay(mode) {
    overlay.classList.remove('hidden');

    if (mode === 'ready') {
      overlayTitle.textContent = '准备开始';
      overlayText.textContent = '躲避车辆，踩上浮木过河，收集金币并抵达终点。手机可轻点画面前进，左右滑动移动。';
      mainBtn.textContent = '开始游戏';
    }

    if (mode === 'win') {
      overlayTitle.textContent = '通关成功!';
      overlayText.textContent = `本局得分 ${score}。小鸡安全抵达终点。`;
      mainBtn.textContent = '再玩一次';
    }

    if (mode === 'fail') {
      overlayTitle.textContent = '游戏结束';
      overlayText.textContent = `本局得分 ${score}。避开车辆，河流必须踩在浮木上。`;
      mainBtn.textContent = '重新开始';
    }
  }

  function hideOverlay() {
    overlay.classList.add('hidden');
  }

  function newGame() {
    generateMap();
    resetChicken();
    particles = [];
    steps = 0;
    coins = 0;
    score = 0;
    outcome = '';
    gameState = 'ready';
    moveAnim = 0;
    shakeTime = 0;
    updateHud();
    showOverlay('ready');
  }

  function startGame() {
    if (gameState === 'ready' || gameState === 'over') {
      generateMap();
      resetChicken();
      particles = [];
      steps = 0;
      coins = 0;
      score = 0;
      outcome = '';
      moveAnim = 0;
      shakeTime = 0;
      gameState = 'running';
      updateHud();
      hideOverlay();
    }
  }

  function endGame(result) {
    if (gameState === 'over') return;

    gameState = 'over';
    outcome = result;
    calcScore();

    if (score > best) {
      best = score;
      localStorage.setItem(STORAGE_KEY, String(best));
    }

    updateHud();
    shakeTime = result === 'fail' ? 0.22 : 0.08;
    spawnParticles(chicken.x + TILE / 2, chicken.y + TILE / 2, result === 'win' ? 28 : 16, result === 'win' ? COLORS.yellow : COLORS.pink);
    showOverlay(result);
  }

  function isTreeAt(rowObj, col) {
    return rowObj.trees && rowObj.trees.includes(col);
  }

  function coinAt(rowObj, col) {
    if (!rowObj.coins) return -1;
    return rowObj.coins.indexOf(col);
  }

  function getVisualCol() {
    return clamp(Math.round((chicken.x + TILE / 2) / TILE - 0.5), 0, COLS - 1);
  }

  function isOnLog(rowObj, xCenter) {
    if (!rowObj || rowObj.type !== 'river') return null;
    const tolerance = TILE * 0.18;
    return rowObj.logs.find(log => xCenter >= log.x - tolerance && xCenter <= log.x + log.width + tolerance) || null;
  }

  function tryMove(dx, dy) {
    if (gameState === 'ready') startGame();
    if (gameState !== 'running') return;

    const currentCol = getVisualCol();
    chicken.col = currentCol;

    const nextCol = currentCol + dx;
    const nextRow = chicken.row + dy;

    if (nextCol < 0 || nextCol >= COLS) return;
    if (nextRow < 0 || nextRow >= ROWS) return;

    const targetRow = rows[nextRow];

    if (['start', 'grass', 'goal'].includes(targetRow.type) && isTreeAt(targetRow, nextCol)) {
      bumpEffect();
      return;
    }

    // 河流判断使用目标格中心点，允许浮木移动，不再局限于固定列。
    if (targetRow.type === 'river') {
      const nextCenterX = nextCol * TILE + TILE / 2;
      if (!isOnLog(targetRow, nextCenterX)) {
        chicken.col = nextCol;
        chicken.row = nextRow;
        syncChickenTarget();
        endGame('fail');
        return;
      }
    }

    chicken.col = nextCol;
    chicken.row = nextRow;
    syncChickenTarget();

    if (dy > 0 && chicken.row > steps) {
      steps = chicken.row;
    }

    const coinIndex = coinAt(targetRow, chicken.col);
    if (coinIndex >= 0) {
      targetRow.coins.splice(coinIndex, 1);
      coins += 1;
      showCoinToast();
      spawnParticles(chicken.x + TILE / 2, chicken.y + TILE / 2, 14, COLORS.yellow);
    }

    updateHud();
    moveAnim = 0.12;

    if (targetRow.type === 'goal') {
      endGame('win');
      return;
    }

    if (targetRow.type === 'road') {
      checkRoadCollision();
    }
  }

  function syncChickenTarget() {
    chicken.targetX = chicken.col * TILE;
    chicken.targetY = rowToY(chicken.row);
  }

  function bumpEffect() {
    shakeTime = 0.06;
  }

  function showCoinToast() {
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
  }

  function spawnParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: -90 + Math.random() * 180,
        vy: -120 + Math.random() * 110,
        life: 0.45,
        maxLife: 0.45,
        color,
      });
    }
  }

  function checkRoadCollision() {
    const rowObj = rows[chicken.row];
    if (!rowObj || rowObj.type !== 'road') return;

    const chickX1 = chicken.x + 9;
    const chickX2 = chicken.x + TILE - 9;

    for (const car of rowObj.cars) {
      const carX1 = car.x;
      const carX2 = car.x + car.width;
      if (chickX1 < carX2 && chickX2 > carX1) {
        endGame('fail');
        return;
      }
    }
  }

  function update(dt) {
    if (gameState === 'over') {
      updateParticles(dt);
      shakeTime = Math.max(0, shakeTime - dt);
      return;
    }

    // 车和浮木即使 ready 也会动，让开始画面更像活的游戏。
    updateCarsAndLogs(dt);

    if (gameState === 'running') {
      updateChickenMotion(dt);
      updateRiverCarry();
      checkRoadCollision();
      checkRiverFall();
    }

    updateParticles(dt);
    shakeTime = Math.max(0, shakeTime - dt);
  }

  function updateChickenMotion(dt) {
    const lerp = 1 - Math.pow(0.0008, dt);
    chicken.x += (chicken.targetX - chicken.x) * lerp;
    chicken.y += (chicken.targetY - chicken.y) * lerp;
    moveAnim = Math.max(0, moveAnim - dt);
  }

  function updateCarsAndLogs(dt) {
    for (const rowObj of rows) {
      if (rowObj.type === 'road') {
        for (const car of rowObj.cars) {
          car.x += car.speed * car.dir * dt;
          const margin = TILE * 2;
          if (car.dir > 0 && car.x > WORLD_W + margin) car.x = -margin;
          if (car.dir < 0 && car.x < -margin) car.x = WORLD_W + margin;
        }
      }

      if (rowObj.type === 'river') {
        for (const log of rowObj.logs) {
          log.x += log.speed * log.dir * dt;
          const margin = TILE * 2;
          if (log.dir > 0 && log.x > WORLD_W + margin) log.x = -log.width - margin;
          if (log.dir < 0 && log.x + log.width < -margin) log.x = WORLD_W + margin;
        }
      }
    }
  }

  function updateRiverCarry() {
    const rowObj = rows[chicken.row];
    if (!rowObj || rowObj.type !== 'river') return;

    const centerX = chicken.x + TILE / 2;
    const log = isOnLog(rowObj, centerX);

    if (!log) return;

    // 小鸡站在浮木上时，会被浮木带着移动。
    chicken.x += log.speed * log.dir * (1 / 120);
    chicken.targetX = chicken.x;
    chicken.col = getVisualCol();

    if (chicken.x < -TILE * 0.2 || chicken.x > WORLD_W - TILE * 0.8) {
      endGame('fail');
    }
  }

  function checkRiverFall() {
    const rowObj = rows[chicken.row];
    if (!rowObj || rowObj.type !== 'river') return;

    const centerX = chicken.x + TILE / 2;
    if (!isOnLog(rowObj, centerX)) {
      endGame('fail');
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 220 * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    withWorld(() => {
      if (shakeTime > 0) {
        const amount = 4 * (shakeTime / 0.22);
        ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
      }

      drawMap();
      drawFinishFlag();
      drawCoinsTreesLogs();
      drawCars();
      drawParticles();
      drawChicken();

      if (gameState === 'ready') drawReadyHint();
    });
  }

  function drawMap() {
    for (let r = 0; r < ROWS; r++) {
      const rowObj = rows[r];
      const y = rowToY(r);
      ctx.fillStyle = COLORS[rowObj.type] || '#222';
      ctx.fillRect(0, y, WORLD_W, TILE);

      if (rowObj.type === 'road') {
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.setLineDash([18, 18]);
        ctx.beginPath();
        ctx.moveTo(0, y + TILE / 2);
        ctx.lineTo(WORLD_W, y + TILE / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (rowObj.type === 'river') {
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        for (let x = -20; x < WORLD_W; x += 54) {
          ctx.fillRect(x, y + 12, 26, 4);
          ctx.fillRect(x + 22, y + 31, 30, 4);
        }
      }

      ctx.strokeStyle = COLORS.laneLine;
      ctx.strokeRect(0, y, WORLD_W, TILE);
    }
  }

  function drawFinishFlag() {
    const y = rowToY(12);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(0, y + TILE - 6, WORLD_W, 6);

    const poleX = WORLD_W - TILE * 1.15;
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(poleX, y + 8, 4, TILE - 8);
    ctx.fillStyle = COLORS.pink;
    ctx.beginPath();
    ctx.moveTo(poleX + 4, y + 8);
    ctx.lineTo(poleX + 36, y + 20);
    ctx.lineTo(poleX + 4, y + 32);
    ctx.closePath();
    ctx.fill();
  }

  function drawCoinsTreesLogs() {
    for (let r = 0; r < ROWS; r++) {
      const rowObj = rows[r];
      const y = rowToY(r);

      for (const c of rowObj.trees || []) {
        const x = c * TILE;
        ctx.fillStyle = '#5b3924';
        ctx.fillRect(x + 19, y + 22, 10, 24);
        ctx.fillStyle = '#0fbf75';
        ctx.fillRect(x + 8, y + 8, 32, 22);
        ctx.fillStyle = '#0a9c5d';
        ctx.fillRect(x + 13, y + 3, 22, 18);
      }

      for (const log of rowObj.logs || []) {
        const logY = y + 10;
        ctx.fillStyle = '#8d5a46';
        ctx.fillRect(log.x, logY, log.width, 28);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(log.x + 4, logY + 18, log.width - 8, 4);
        ctx.fillStyle = '#b9785d';
        ctx.fillRect(log.x + 8, logY + 7, Math.max(10, log.width - 16), 4);
      }

      for (const c of rowObj.coins || []) {
        const x = c * TILE + TILE / 2;
        const cy = y + TILE / 2;
        ctx.fillStyle = 'rgba(255, 209, 102, 0.24)';
        ctx.beginPath();
        ctx.arc(x, cy, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = COLORS.yellow;
        ctx.beginPath();
        ctx.arc(x, cy, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.lineWidth = 1;
      }
    }
  }

  function drawCars() {
    for (const rowObj of rows) {
      if (rowObj.type !== 'road') continue;
      const y = rowToY(rowObj.cars[0].row) + 10;

      for (const car of rowObj.cars) {
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x, y, car.width, 29);
        ctx.fillStyle = 'rgba(255,255,255,0.52)';
        ctx.fillRect(car.x + car.width * 0.18, y + 5, car.width * 0.24, 8);
        ctx.fillRect(car.x + car.width * 0.56, y + 5, car.width * 0.24, 8);

        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(car.x + 12, y + 29, 6, 0, Math.PI * 2);
        ctx.arc(car.x + car.width - 12, y + 29, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawChicken() {
    if (!chicken) return;

    const bounce = moveAnim > 0 ? -5 : 0;
    const x = chicken.x;
    const y = chicken.y + bounce;

    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x + 11, y + 39, 28, 5);

    ctx.fillStyle = '#fff8e8';
    ctx.fillRect(x + 9, y + 7, 30, 29);

    ctx.fillStyle = '#e9dfc8';
    ctx.fillRect(x + 9, y + 26, 30, 10);

    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x + 12, y + 4, 10, 8);
    ctx.fillRect(x + 24, y + 4, 10, 8);

    ctx.fillStyle = '#111827';
    ctx.fillRect(x + 18, y + 15, 4, 4);
    ctx.fillRect(x + 27, y + 15, 4, 4);

    ctx.fillStyle = '#ff9800';
    ctx.fillRect(x + 30, y + 21, 11, 6);

    ctx.fillStyle = '#ffb74d';
    ctx.fillRect(x + 16, y + 36, 5, 8);
    ctx.fillRect(x + 29, y + 36, 5, 8);
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 5, 5);
      ctx.restore();
    }
  }

  function drawReadyHint() {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px system-ui';
    ctx.fillText('轻点画面 / Space 开始', WORLD_W / 2, WORLD_H / 2 - 8);

    ctx.font = '14px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.76)';
    ctx.fillText('轻点前进，左右滑动移动', WORLD_W / 2, WORLD_H / 2 + 22);
  }

  function loop(now) {
    const dt = Math.min(0.033, (now - lastTime) / 1000 || 0);
    lastTime = now;

    // 固定步长，避免不同设备刷新率造成车速、浮木速度不一致。
    accumulator += dt;
    const step = 1 / 120;
    while (accumulator >= step) {
      update(step);
      accumulator -= step;
    }

    draw();
    rafId = requestAnimationFrame(loop);
  }


  function handleTouchStart(event) {
    if (event.pointerType && event.pointerType !== 'touch') return;
    if (event.target.closest('button')) return;

    event.preventDefault();
    touchPointerId = event.pointerId;
    touchStartX = event.clientX;
    touchStartY = event.clientY;
    touchStartTime = performance.now();

    if (touchArea.setPointerCapture && touchPointerId !== null) {
      try { touchArea.setPointerCapture(touchPointerId); } catch (_) {}
    }
  }

  function handleTouchEnd(event) {
    if (event.pointerType && event.pointerType !== 'touch') return;
    if (touchPointerId !== null && event.pointerId !== touchPointerId) return;

    event.preventDefault();

    const dx = event.clientX - touchStartX;
    const dy = event.clientY - touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const elapsed = performance.now() - touchStartTime;

    touchPointerId = null;

    // 左右滑动：移动一格。横向必须明显大于纵向，避免误判。
    if (absX >= TOUCH_SWIPE_MIN && absX > absY * 1.18) {
      tryMove(dx > 0 ? 1 : -1, 0);
      return;
    }

    // 上滑也当作前进，适合不想按到底部按钮时使用。
    if (absY >= TOUCH_SWIPE_MIN && dy < 0 && absY > absX * 1.18) {
      tryMove(0, 1);
      return;
    }

    // 轻点画面：前进一格。
    if (absX <= TOUCH_TAP_MAX_MOVE && absY <= TOUCH_TAP_MAX_MOVE && elapsed <= TOUCH_TAP_MAX_TIME) {
      tryMove(0, 1);
    }
  }

  function handleTouchCancel(event) {
    if (event.pointerType && event.pointerType !== 'touch') return;
    touchPointerId = null;
  }

  function handleButtonMove(dx, dy) {
    return (event) => {
      event.preventDefault();
      tryMove(dx, dy);
    };
  }

  mainBtn.addEventListener('click', () => startGame());
  touchArea.addEventListener('pointerdown', handleTouchStart, { passive: false });
  touchArea.addEventListener('pointerup', handleTouchEnd, { passive: false });
  touchArea.addEventListener('pointercancel', handleTouchCancel, { passive: false });
  leftBtn.addEventListener('pointerdown', handleButtonMove(-1, 0), { passive: false });
  rightBtn.addEventListener('pointerdown', handleButtonMove(1, 0), { passive: false });
  forwardBtn.addEventListener('pointerdown', handleButtonMove(0, 1), { passive: false });

  window.addEventListener('keydown', (event) => {
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'Enter'].includes(event.code)) {
      event.preventDefault();
    }

    if (gameState === 'over' && ['Space', 'ArrowUp', 'Enter'].includes(event.code)) {
      startGame();
      tryMove(0, 1);
      return;
    }

    if (event.code === 'Space' || event.code === 'ArrowUp') {
      tryMove(0, 1);
    } else if (event.code === 'ArrowLeft') {
      tryMove(-1, 0);
    } else if (event.code === 'ArrowRight') {
      tryMove(1, 0);
    } else if (event.code === 'Enter' && gameState !== 'running') {
      startGame();
    }
  });

  window.addEventListener('resize', () => {
    resizeCanvas();
    draw();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) lastTime = performance.now();
  });

  resizeCanvas();
  newGame();
  lastTime = performance.now();
  rafId = requestAnimationFrame(loop);
})();
