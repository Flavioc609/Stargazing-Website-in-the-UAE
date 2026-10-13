/* =========================================================
   SKY EXPLORER — a live all-sky map above the UAE
   The circle is the horizon, the centre is the zenith
   (straight overhead). North is at the top and east on the
   left, as when you lie on your back with your head north.
   ========================================================= */
const Sky = (() => {
  const cv = document.getElementById("planisphere");
  const ctx = cv.getContext("2d");
  const D2R = Math.PI / 180;
  const UAE_OFFSET = 4 * 3600000;    // UAE is UTC+4 all year (no daylight saving)

  const state = {
    ms: Date.now(), place: PLACES.abudhabi,
    lines: true, names: true, grid: false, ecl: false,
    hover: null, selected: null, playing: false,
    quiz: null, flash: null
  };
  let size = 600, R = 270, cx = 300, cy = 300, DPR = 1;
  let screen = {};      // constellation id -> array of [x, y, alt] star positions
  let listeners = [];

  // ---------- astronomy helpers ----------
  function lstHours(ms, lon) {
    const d = ms / 86400000 + 2440587.5 - 2451545.0;
    const gmst = 18.697374558 + 24.06570982441908 * d;
    return (((gmst + lon / 15) % 24) + 24) % 24;
  }
  function hourAngle(ra) { return (lstHours(state.ms, state.place.lon) - ra) * 15 * D2R; }
  function altAz(ra, dec) {
    const H = hourAngle(ra), d = dec * D2R, p = state.place.lat * D2R;
    const alt = Math.asin(Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H));
    let az = Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * Math.cos(p) - Math.cos(d) * Math.cos(H) * Math.sin(p));
    az = ((az / D2R) + 360) % 360;
    return { alt: alt / D2R, az };
  }
  function fromAltAz(alt, az) {
    const r = (90 - alt) / 90 * R, a = az * D2R;
    return [cx - r * Math.sin(a), cy - r * Math.cos(a)];
  }
  function project(ra, dec) {
    const p = altAz(ra, dec), xy = fromAltAz(p.alt, p.az);
    return [xy[0], xy[1], p.alt];
  }
  function compass(az) {
    const pts = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return pts[Math.round(az / 22.5) % 16];
  }

  // ---------- size ----------
  function resize() {
    const box = { width: cv.clientWidth, height: cv.clientHeight };
    DPR = Math.min(devicePixelRatio || 1, 2);
    size = Math.max(280, Math.min(box.width, box.height || box.width));
    cv.width = cv.height = size * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = cy = size / 2;
    R = size / 2 - 30;
  }

  // ---------- drawing ----------
  function starRadius(mag) { return Math.max(0.7, (4.6 - mag) * 0.95) * (size / 700); }

  function drawStar(x, y, mag, color, t, glow) {
    const r = starRadius(mag) * (0.85 + 0.15 * Math.sin(t * 0.003 + x * 13.1 + y));
    if (mag < 2 || glow) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
      g.addColorStop(0, color || "rgba(255,255,255,.9)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.globalAlpha = glow ? 0.7 : 0.35;
      ctx.beginPath(); ctx.arc(x, y, r * 5, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = color || "#fff";
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }

  function draw(t) {
    ctx.clearRect(0, 0, size, size);
    const fs = size / 700;

    // sky disc (brighter glow towards the horizon)
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    bg.addColorStop(0, "#050822"); bg.addColorStop(0.75, "#0b1236"); bg.addColorStop(1, "#22204a");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size);

    // altitude rings and direction lines
    if (state.grid) {
      ctx.strokeStyle = "rgba(124,242,255,.18)"; ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
      [30, 60].forEach(a => { ctx.beginPath(); ctx.arc(cx, cy, R * (90 - a) / 90, 0, 7); ctx.stroke(); });
      for (let az = 0; az < 360; az += 45) {
        const [x, y] = fromAltAz(0, az);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(124,242,255,.6)"; ctx.font = `${Math.max(9, 11 * fs)}px Space Grotesk`;
      [30, 60].forEach(a => ctx.fillText(a + "°", cx + 4, cy - R * (90 - a) / 90 - 4));
    }

    // ecliptic
    if (state.ecl) {
      ctx.strokeStyle = "rgba(255,207,122,.6)"; ctx.setLineDash([6, 6]); ctx.lineWidth = 1.2;
      ctx.beginPath();
      const e = 23.4393 * D2R; let pen = false;
      for (let l = 0; l <= 360; l += 2) {
        const L = l * D2R;
        const ra = ((Math.atan2(Math.sin(L) * Math.cos(e), Math.cos(L)) / D2R + 360) % 360) / 15;
        const dec = Math.asin(Math.sin(e) * Math.sin(L)) / D2R;
        const [x, y, alt] = project(ra, dec);
        if (alt < -2) { pen = false; continue; }
        pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true;
      }
      ctx.stroke(); ctx.setLineDash([]);
    }

    // constellations
    screen = {};
    const quizTarget = state.quiz && state.quiz.target;
    CONSTELLATIONS.forEach(c => {
      const pts = c.stars.map(s => project(s[1], s[2]));
      screen[c.id] = pts;
      if (pts.every(p => p[2] < 0)) return;
      const active = state.hover === c.id || state.selected === c.id;
      const flash = state.flash && state.flash.id === c.id ? state.flash : null;
      if (state.lines || active || flash) {
        ctx.lineWidth = active || flash ? 2.2 : 1;
        ctx.strokeStyle = flash ? (flash.ok ? "rgba(120,255,170,.95)" : "rgba(255,140,140,.95)")
          : active ? "rgba(124,242,255,.95)" : "rgba(150,170,255,.4)";
        if (active || flash) { ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 12; }
        c.lines.forEach(chain => {
          ctx.beginPath();
          chain.forEach((i, k) => k ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]));
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
      }
      c.stars.forEach((s, i) => { if (pts[i][2] > -1) drawStar(pts[i][0], pts[i][1], s[3], s[4], t, active); });
      if (state.names && !quizTarget) {
        const up = pts.filter(p => p[2] > 0);
        const mx = up.reduce((a, p) => a + p[0], 0) / up.length;
        const my = up.reduce((a, p) => a + p[1], 0) / up.length;
        ctx.font = `${active ? 700 : 500} ${Math.max(9, 12 * fs)}px Orbitron`;
        ctx.fillStyle = active ? "#7cf2ff" : "rgba(200,210,255,.75)";
        ctx.textAlign = "center";
        ctx.fillText(c.name.replace(/ \(.*\)/, "").toUpperCase(), mx, my + 20 * fs);
      }
    });

    // extra bright stars
    ctx.textAlign = "left";
    EXTRA_STARS.forEach(s => {
      const [x, y, alt] = project(s[1], s[2]);
      if (alt < -1) return;
      drawStar(x, y, s[3], s[4], t);
      if (state.names && !quizTarget && s[3] < 1.2) {
        ctx.font = `${Math.max(9, 10 * fs)}px Space Grotesk`;
        ctx.fillStyle = "rgba(255,230,190,.7)";
        ctx.fillText(s[0], x + 6, y - 5);
      }
    });

    // Polaris ring
    const [px, py] = project(2.53, 89.26);
    ctx.strokeStyle = "rgba(255,207,122,.6)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.stroke();

    // zenith
    ctx.strokeStyle = "rgba(255,255,255,.4)";
    ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6); ctx.stroke();
    ctx.restore();

    // horizon ring + compass points
    ctx.strokeStyle = "rgba(255,207,122,.7)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.strokeStyle = "rgba(124,242,255,.15)"; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(cx, cy, R + 10, 0, 7); ctx.stroke();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ["N", "NE", "E", "SE", "S", "SW", "W", "NW"].forEach((lab, i) => {
      const a = i * 45 * D2R, rr = R + 18;
      ctx.font = `700 ${lab.length === 1 ? Math.max(11, 15 * fs) : Math.max(8, 10 * fs)}px Orbitron`;
      ctx.fillStyle = lab.length === 1 ? "#ffcf7a" : "rgba(255,207,122,.6)";
      ctx.fillText(lab, cx - rr * Math.sin(a), cy - rr * Math.cos(a));
    });
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  }

  // ---------- hit testing ----------
  function segDist(px, py, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
  }
  function hit(x, y) {
    let best = null, bd = 16;
    CONSTELLATIONS.forEach(c => {
      const pts = screen[c.id]; if (!pts) return;
      pts.forEach(p => { if (p[2] < 0) return; const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; best = c.id; } });
      c.lines.forEach(ch => {
        for (let k = 1; k < ch.length; k++) {
          const a = pts[ch[k - 1]], b = pts[ch[k]];
          if (a[2] < 0 && b[2] < 0) continue;
          const d = segDist(x, y, a, b);
          if (d < bd) { bd = d; best = c.id; }
        }
      });
    });
    return best;
  }

  // ---------- interaction ----------
  let drag = null;
  function local(e) {
    const b = cv.getBoundingClientRect();
    return [(e.clientX - b.left) * size / b.width, (e.clientY - b.top) * size / b.height];
  }
  cv.addEventListener("pointerdown", e => {
    const [x, y] = local(e);
    drag = { x, y, a: Math.atan2(x - cx, y - cy), moved: false };
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener("pointermove", e => {
    const [x, y] = local(e);
    if (drag) {
      if (!drag.moved && Math.hypot(x - drag.x, y - drag.y) > 5) { drag.moved = true; cv.classList.add("dragging"); }
      if (drag.moved) {
        const a = Math.atan2(x - cx, y - cy);
        let d = a - drag.a;
        if (d > Math.PI) d -= 2 * Math.PI;
        if (d < -Math.PI) d += 2 * Math.PI;
        drag.a = a;
        // one turn of the sky = one sidereal day (23h 56m); the sky turns anticlockwise on this chart
        setTime(state.ms + (d / D2R / 15) * 0.99727 * 3600000);
      }
    } else {
      const h = hit(x, y);
      if (h !== state.hover) { state.hover = h; cv.style.cursor = h ? "pointer" : "grab"; }
    }
  });
  cv.addEventListener("pointerup", e => {
    if (drag && !drag.moved) {
      const [x, y] = local(e);
      const h = hit(x, y);
      if (state.quiz) quizAnswer(h);
      else if (h) select(h);
    }
    drag = null; cv.classList.remove("dragging");
  });
  cv.addEventListener("pointerleave", () => { state.hover = null; });

  // ---------- quiz ----------
  function quizNext() {
    const pool = CONSTELLATIONS.filter(c => c.id !== (state.quiz && state.quiz.target));
    const c = pool[Math.floor(Math.random() * pool.length)];
    state.quiz.target = c.id;
    showBest(c.id);
    emit("quiz", state.quiz);
  }
  function quizAnswer(id) {
    if (!id) return;
    const q = state.quiz;
    q.total++;
    const ok = id === q.target;
    if (ok) q.score++;
    state.flash = { id: ok ? id : q.target, ok };
    emit("quiz", q);
    setTimeout(() => { state.flash = null; if (state.quiz) quizNext(); }, ok ? 900 : 1600);
  }

  // ---------- public ----------
  function emit(type, data) { listeners.forEach(f => f(type, data)); }
  function setTime(ms) { state.ms = ms; emit("time", ms); }
  function select(id) { state.selected = id; emit("select", CONSTELLATIONS.find(c => c.id === id)); }
  function showBest(id) {
    const c = CONSTELLATIONS.find(k => k.id === id);
    const y = uaeParts(state.ms).y;
    setTime(Date.UTC(y, c.bestMonth, 15, 21, 0) - UAE_OFFSET);
  }
  function uaeParts(ms) {
    const d = new Date(ms + UAE_OFFSET);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), h: d.getUTCHours(), min: d.getUTCMinutes() };
  }
  function fromUae(y, m, d, minutes) { return Date.UTC(y, m, d, 0, minutes) - UAE_OFFSET; }
  function visibility(c) {
    const b = c.stars.reduce((a, s) => s[3] < a[3] ? s : a);
    const p = altAz(b[1], b[2]);
    return { star: b[0], alt: p.alt, az: p.az, dir: compass(p.az) };
  }

  let last = 0;
  function loop(t) {
    if (state.playing && t - last > 16) { setTime(state.ms + 60000 * 1.5); last = t; }
    draw(t);
    requestAnimationFrame(loop);
  }

  resize();
  addEventListener("resize", resize);
  requestAnimationFrame(loop);

  return {
    state, setTime, select, showBest, uaeParts, fromUae, visibility, compass,
    on(f) { listeners.push(f); },
    setPlace(key) { state.place = PLACES[key]; emit("time", state.ms); },
    toggle(key, v) { state[key] = v; },
    play(v) { state.playing = v; },
    quizStart() { state.quiz = { target: null, score: 0, total: 0 }; state.selected = null; quizNext(); },
    quizStop() { state.quiz = null; emit("quiz", null); },
    resize
  };
})();
