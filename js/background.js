/* =========================================================
   BACKGROUND — moving 3D starfield with warp + shooting stars
   ========================================================= */
const Space = (() => {
  const cv = document.getElementById("space");
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, DPR, stars = [], shooters = [];
  let speed = 0.4, target = 0.4;
  let mx = 0, my = 0, scrollY = 0;
  const N = 900;

  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * DPR;
    H = cv.height = innerHeight * DPR;
  }

  function spawn(s, far) {
    s.x = (Math.random() - 0.5) * 2;
    s.y = (Math.random() - 0.5) * 2;
    s.z = far ? 1 : Math.random();
    s.hue = Math.random() < 0.15 ? (Math.random() < 0.5 ? 30 : 210) : 0;
    s.px = null;
    return s;
  }

  function init() {
    resize();
    for (let i = 0; i < N; i++) stars.push(spawn({}, false));
  }

  function frame() {
    speed += (target - speed) * 0.04;
    // trail effect during warp
    ctx.fillStyle = speed > 3 ? "rgba(3,4,11,0.25)" : "rgba(3,4,11,1)";
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2 + mx * 30 * DPR, cy = H / 2 + my * 30 * DPR - scrollY * 0.05 * DPR;
    const f = Math.max(W, H) * 0.5;

    for (const s of stars) {
      s.z -= 0.0008 * speed;
      if (s.z <= 0.02) spawn(s, true);
      const sx = cx + (s.x / s.z) * f, sy = cy + (s.y / s.z) * f;
      if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) { spawn(s, true); continue; }
      const size = (1 - s.z) * 2.2 * DPR + 0.2;
      const a = Math.min(1, (1 - s.z) * 1.4);
      const col = s.hue === 30 ? `rgba(255,214,160,${a})` : s.hue === 210 ? `rgba(170,200,255,${a})` : `rgba(255,255,255,${a})`;
      if (speed > 2 && s.px !== null) {
        ctx.strokeStyle = col; ctx.lineWidth = size;
        ctx.beginPath(); ctx.moveTo(s.px, s.py); ctx.lineTo(sx, sy); ctx.stroke();
      } else {
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(sx, sy, size, 0, 6.283); ctx.fill();
      }
      s.px = sx; s.py = sy;
    }

    // shooting stars
    if (!reduce && Math.random() < 0.006 && speed < 2) {
      shooters.push({ x: Math.random() * W, y: Math.random() * H * 0.5, vx: (6 + Math.random() * 6) * DPR, vy: (2 + Math.random() * 3) * DPR, life: 1 });
    }
    shooters = shooters.filter(s => s.life > 0);
    for (const s of shooters) {
      const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
      g.addColorStop(0, `rgba(255,255,255,${s.life})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 2 * DPR;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 12, s.y - s.vy * 12); ctx.stroke();
      s.x += s.vx; s.y += s.vy; s.life -= 0.015;
    }
    requestAnimationFrame(frame);
  }

  addEventListener("resize", resize);
  addEventListener("mousemove", e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
  addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

  init();
  if (reduce) { speed = target = 0; }
  requestAnimationFrame(frame);

  return {
    warp(ms = 1400) {
      if (reduce) return;
      target = 28;
      setTimeout(() => { target = 0.4; }, ms);
    }
  };
})();
