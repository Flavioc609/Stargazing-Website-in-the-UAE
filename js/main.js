/* =========================================================
   MAIN — page navigation, hero, sky explorer controls
   ========================================================= */
(() => {
  const sections = $$(".section");

  /* ---------- side dots + orbital menu ---------- */
  const dots = $(".dots"), orbit = $(".orbit-items"), menu = $("#orbitMenu"), toggle = $("#orbitToggle");
  sections.forEach((s, i) => {
    const a = document.createElement("a");
    a.href = "#" + s.id; a.innerHTML = `<span>${s.dataset.title}</span>`;
    a.setAttribute("aria-label", s.dataset.title);
    dots.appendChild(a);

    const li = document.createElement("li");
    li.innerHTML = `<a href="#${s.id}">${s.dataset.icon}<span>${s.dataset.title}</span></a>`;
    // two arcs: inner ring for the first 5, outer ring for the rest
    const inner = i < 5, n = inner ? 5 : sections.length - 5, k = inner ? i : i - 5;
    const r = inner ? 105 : 175, ang = (n === 1 ? 45 : (k / (n - 1)) * 90) * Math.PI / 180;
    li.dataset.x = -r * Math.cos(ang); li.dataset.y = -r * Math.sin(ang);
    li.style.transitionDelay = `${i * 25}ms`;
    li.querySelector("a").onclick = () => setMenu(false);
    orbit.appendChild(li);
  });
  function setMenu(open) {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
    $$("li", orbit).forEach(li => {
      li.style.transform = open ? `translate(calc(50% + ${li.dataset.x}px), calc(50% + ${li.dataset.y}px)) scale(1)` : "translate(50%, 50%) scale(0)";
      li.style.opacity = open ? 1 : 0;
    });
  }
  toggle.onclick = () => setMenu(!menu.classList.contains("open"));
  addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const i = sections.indexOf(en.target);
      $$("a", dots).forEach((a, k) => a.classList.toggle("on", k === i));
    });
  }, { threshold: 0.35 });
  sections.forEach(s => io.observe(s));

  /* ---------- reveal on scroll ---------- */
  const rv = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); rv.unobserve(en.target); }
  }), { threshold: 0.12 });
  $$(".reveal").forEach(el => rv.observe(el));

  /* ---------- hero launch ---------- */
  $("#launch").onclick = e => {
    e.currentTarget.classList.add("go");
    Space.warp(1300);
    setTimeout(() => document.getElementById("sky").scrollIntoView({ behavior: "smooth" }), 700);
    setTimeout(() => e.currentTarget && $("#launch").classList.remove("go"), 2000);
  };
  $("#toTop").onclick = () => scrollTo({ top: 0, behavior: "smooth" });

  /* ---------- cursor glow + tilt cards ---------- */
  const glow = $(".cursor-glow");
  addEventListener("mousemove", e => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; });
  document.addEventListener("mousemove", e => {
    const card = e.target.closest(".tilt");
    $$(".tilt").forEach(c => { if (c !== card) c.style.transform = ""; });
    if (!card) return;
    const b = card.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
  });

  /* =======================================================
     SKY EXPLORER controls
     ======================================================= */
  const placeSel = $("#placeSel"), dateIn = $("#dateIn"), timeIn = $("#timeIn"), timeOut = $("#timeOut");
  Object.entries(PLACES).forEach(([k, p]) => placeSel.add(new Option(`${p.name} (${p.lat.toFixed(1)}°N)`, k)));
  placeSel.onchange = () => Sky.setPlace(placeSel.value);

  const pad = n => String(n).padStart(2, "0");
  function syncInputs(ms) {
    const p = Sky.uaeParts(ms);
    dateIn.value = `${p.y}-${pad(p.m + 1)}-${pad(p.d)}`;
    timeIn.value = p.h * 60 + p.min;
    timeOut.textContent = `${pad(p.h)}:${pad(p.min)}`;
    $("#skyClock").textContent = `${p.d} ${MONTHS[p.m].full} ${p.y} · ${pad(p.h)}:${pad(p.min)} UAE`;
    $("#skyPlace").textContent = `${Sky.state.place.name} · ${Sky.state.place.lat.toFixed(2)}°N`;
  }
  function fromInputs() {
    const [y, m, d] = dateIn.value.split("-").map(Number);
    if (!y) return;
    Sky.setTime(Sky.fromUae(y, m - 1, d, +timeIn.value));
  }
  dateIn.onchange = fromInputs;
  timeIn.oninput = fromInputs;

  $("#nowBtn").onclick = () => Sky.setTime(Date.now());
  const playBtn = $("#playBtn");
  playBtn.onclick = () => {
    const on = !Sky.state.playing; Sky.play(on);
    playBtn.textContent = on ? "⏸ Pause" : "▶ Play night";
    playBtn.classList.toggle("active", on);
  };
  [["tLines", "lines"], ["tNames", "names"], ["tGrid", "grid"], ["tEcl", "ecl"]].forEach(([id, key]) => {
    $("#" + id).onchange = e => Sky.toggle(key, e.target.checked);
  });

  // quiz
  const quizBtn = $("#quizBtn"), banner = $("#quizBanner");
  quizBtn.onclick = () => {
    if (Sky.state.quiz) { Sky.quizStop(); quizBtn.classList.remove("active"); quizBtn.textContent = "🎯 Quiz mode"; }
    else { Sky.quizStart(); quizBtn.classList.add("active"); quizBtn.textContent = "✖ End quiz"; }
  };

  // constellation chips
  const chips = $("#conChips");
  CONSTELLATIONS.forEach(c => {
    const b = document.createElement("button");
    b.className = "chip"; b.textContent = c.name; b.dataset.id = c.id;
    b.onclick = () => { if (!Sky.state.quiz) Sky.select(c.id); };
    chips.appendChild(b);
  });

  // info card
  const card = $("#infoCard");
  function renderInfo(c) {
    if (!c) return;
    const v = Sky.visibility(c);
    const up = v.alt > 0;
    card.innerHTML = `
      <h3>${c.name}</h3>
      <div class="ar">${c.arabic}</div>
      <span class="now-badge ${up ? "up" : "down"}">${up
        ? `● Above the horizon: ${v.star} is ${Math.round(v.alt)}° high in the ${v.dir}`
        : `○ Below the horizon at this time`}</span>
      <dl>
        <dt>Best seen from the UAE</dt><dd>${c.best}</dd>
        <dt>Where to look</dt><dd>${c.where}</dd>
        <dt>Key stars</dt><dd>${c.keyStars}</dd>
        <dt>Navigation</dt><dd>${c.navigation}</dd>
        <dt>Did you know?</dt><dd>${c.fact}</dd>
      </dl>
      <div class="btn-row" style="margin-top:14px"><button class="chip" id="bestBtn">⏱ Jump to best viewing time</button></div>`;
    $("#bestBtn").onclick = () => Sky.showBest(c.id);
  }

  Sky.on((type, data) => {
    if (type === "time") {
      syncInputs(data);
      if (Sky.state.selected && !Sky.state.quiz) {
        // refresh the "above the horizon" badge only
        const c = CONSTELLATIONS.find(k => k.id === Sky.state.selected), v = Sky.visibility(c), badge = $(".now-badge", card);
        if (badge) {
          badge.className = "now-badge " + (v.alt > 0 ? "up" : "down");
          badge.textContent = v.alt > 0 ? `● Above the horizon: ${v.star} is ${Math.round(v.alt)}° high in the ${v.dir}` : "○ Below the horizon at this time";
        }
      }
    }
    if (type === "select") {
      renderInfo(data);
      card.classList.remove("pop"); void card.offsetWidth; card.classList.add("pop");
      $$(".chip", chips).forEach(b => b.classList.toggle("active", b.dataset.id === data.id));
    }
    if (type === "quiz") {
      banner.hidden = !data;
      if (data) {
        $("#quizTarget").textContent = CONSTELLATIONS.find(c => c.id === data.target).name;
        $("#quizScore").textContent = `${data.score} / ${data.total}`;
      }
    }
  });

  // start at 21:00 tonight (UAE time)
  const p = Sky.uaeParts(Date.now());
  Sky.setTime(Sky.fromUae(p.y, p.m, p.d, 21 * 60));
  addEventListener("load", () => Sky.resize());
})();
