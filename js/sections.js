/* =========================================================
   SECTIONS — navigation missions, coordinates, map,
   light pollution, calendar, tools
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const SVGNS = "http://www.w3.org/2000/svg";
function svgEl(tag, attrs = {}, parent) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function tween(from, to, ms, fn) {
  const t0 = performance.now();
  (function step(t) {
    const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
    fn(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}
const D2R = Math.PI / 180;
const conById = id => CONSTELLATIONS.find(c => c.id === id);

/* ---------------------------------------------------------
   CELESTIAL NAVIGATION MISSIONS
   --------------------------------------------------------- */
const Nav = (() => {
  const svg = $("#navSvg"), tabs = $(".mission-tabs");
  const title = $("#mTitle"), text = $("#mText"), ctrl = $("#mControls");
  const done = new Set();

  function clear() { svg.innerHTML = ""; ctrl.innerHTML = ""; }
  function star(x, y, mag, label, parent = svg, color = "#fff") {
    const r = Math.max(1.4, (4.2 - mag) * 1.5);
    svgEl("circle", { cx: x, cy: y, r: r * 3, fill: color, opacity: 0.15 }, parent);
    svgEl("circle", { cx: x, cy: y, r, fill: color }, parent);
    if (label) { const t = svgEl("text", { x: x + 8, y: y - 6, fill: "#cfd6ff", "font-size": 12 }, parent); t.textContent = label; }
  }
  function ground(y, parent = svg, labels) {
    const g = svgEl("rect", { x: 0, y, width: 600, height: 380 - y, fill: "#0a0714" }, parent);
    svgEl("line", { x1: 0, y1: y, x2: 600, y2: y, stroke: "#ffcf7a", "stroke-opacity": .6 }, parent);
    (labels || []).forEach(([lab, x]) => {
      const t = svgEl("text", { x, y: y + 22, fill: "#ffcf7a", "font-size": 14, "text-anchor": "middle", "font-family": "Orbitron" }, parent);
      t.textContent = lab;
    });
    return g;
  }
  function button(label, fn) {
    const b = document.createElement("button");
    b.className = "chip"; b.textContent = label; b.onclick = fn; ctrl.appendChild(b); return b;
  }

  const missions = [
    {
      name: "Find Polaris",
      title: "Mission 1 · Find the North Star",
      text: "Find the Big Dipper. Draw a line from Merak through Dubhe (the two “pointer” stars) and keep going about five times that gap. You land on Polaris, which is always due north. Move the slider: the sky turns around Polaris through the night, but the pointers always point to it.",
      build() {
        const g = svgEl("g", {}, svg);
        const cx = 300, cy = 185, k = 4.2;
        const sets = [conById("ursamajor"), conById("ursaminor"), conById("cassiopeia")];
        let rot = 200, lineShown = false;
        function render() {
          g.innerHTML = "";
          const P = (ra, dec) => { const a = (rot - ra * 15) * D2R, r = (90 - dec) * k; return [cx + r * Math.sin(a), cy + r * Math.cos(a)]; };
          sets.forEach(c => {
            const pts = c.stars.map(s => P(s[1], s[2]));
            c.lines.forEach(ch => svgEl("polyline", { points: ch.map(i => pts[i].join(",")).join(" "), fill: "none", stroke: "rgba(150,170,255,.45)" }, g));
            c.stars.forEach((s, i) => {
              const lab = ["Dubhe", "Merak", "Polaris", "Kochab", "Schedar"].includes(s[0]) ? s[0] : "";
              star(pts[i][0], pts[i][1], s[3], lab, g, s[0] === "Polaris" ? "#ffcf7a" : "#fff");
            });
          });
          if (lineShown) {
            const ub = conById("ursamajor").stars;
            const m = P(ub[1][1], ub[1][2]), pol = P(2.53, 89.26);
            svgEl("line", { x1: m[0], y1: m[1], x2: pol[0], y2: pol[1], stroke: "#7cf2ff", "stroke-width": 2, "stroke-dasharray": "6 6", class: "march" }, g);
            svgEl("circle", { cx: pol[0], cy: pol[1], r: 14, fill: "none", stroke: "#ffcf7a", "stroke-width": 2 }, g);
            const t = svgEl("text", { x: (m[0] + pol[0]) / 2 + 10, y: (m[1] + pol[1]) / 2, fill: "#7cf2ff", "font-size": 13, "font-family": "Orbitron" }, g);
            t.textContent = "× 5";
          }
          const n = svgEl("text", { x: 300, y: 370, fill: "#ffcf7a", "font-size": 13, "text-anchor": "middle", "font-family": "Orbitron" }, g);
          n.textContent = "↓ NORTH HORIZON";
        }
        render();
        button("Draw the pointer line", () => { lineShown = true; render(); done.add(0); refreshTabs(); });
        const lab = document.createElement("label");
        lab.innerHTML = 'Time of night <input type="range" min="0" max="360" value="200">';
        ctrl.appendChild(lab);
        lab.querySelector("input").oninput = e => { rot = +e.target.value; render(); };
      }
    },
    {
      name: "Polaris = Latitude",
      title: "Mission 2 · Your latitude from one star",
      text: "The height of Polaris above the northern horizon equals your latitude. In the UAE that is about 23–26°, or about two and a half fists held at arm’s length (one fist ≈ 10°). Pick a place and watch the angle change.",
      build() {
        const g = svgEl("g", {}, svg);
        const places = [["Liwa", 23.1], ["Abu Dhabi", 24.5], ["Dubai", 25.2], ["Ras Al Khaimah", 25.8], ["London (compare)", 51.5], ["Equator (compare)", 0]];
        let cur = 24.5;
        const ox = 110, oy = 300, L = 380;
        function render(lat) {
          g.innerHTML = "";
          ground(oy, g, [["N", 540]]);
          const a = lat * D2R, sx = ox + L * Math.cos(a), sy = oy - L * Math.sin(a);
          svgEl("line", { x1: ox, y1: oy, x2: sx, y2: sy, stroke: "#7cf2ff", "stroke-dasharray": "5 5", "stroke-width": 2 }, g);
          const ar = 80;
          svgEl("path", { d: `M${ox + ar},${oy} A${ar},${ar} 0 0 0 ${ox + ar * Math.cos(a)},${oy - ar * Math.sin(a)}`, fill: "rgba(124,242,255,.15)", stroke: "#7cf2ff" }, g);
          const t = svgEl("text", { x: ox + ar + 12, y: oy - 12, fill: "#7cf2ff", "font-size": 18, "font-family": "Orbitron" }, g);
          t.textContent = lat.toFixed(1) + "°";
          star(sx, sy, 0.5, "Polaris", g, "#ffcf7a");
          // observer
          svgEl("circle", { cx: ox, cy: oy - 26, r: 7, fill: "#e9ecff" }, g);
          svgEl("line", { x1: ox, y1: oy - 19, x2: ox, y2: oy, stroke: "#e9ecff", "stroke-width": 3 }, g);
          const f = svgEl("text", { x: 300, y: 40, fill: "#ffcf7a", "font-size": 14, "text-anchor": "middle" }, g);
          f.textContent = `≈ ${(lat / 10).toFixed(1)} fists above the horizon`;
        }
        render(cur);
        places.forEach(([n, lat]) => button(n, () => { tween(cur, lat, 700, v => render(v)); cur = lat; done.add(1); refreshTabs(); }));
      }
    },
    {
      name: "East & West",
      title: "Mission 3 · East and west with Orion’s Belt",
      text: "Mintaka, the top star of Orion’s Belt, lies almost exactly on the celestial equator. That means it rises very close to due east and sets very close to due west, anywhere on Earth. Slide time forward to watch Orion rise over the eastern horizon of the UAE.",
      build() {
        const g = svgEl("g", {}, svg);
        const phi = 24.5 * D2R, k = 6, E = [300, 300];
        const up = [-Math.cos(phi), -Math.sin(phi)];        // towards north celestial pole
        const mv = [Math.sin(phi), -Math.cos(phi)];          // direction stars move when rising
        const ori = conById("orion");
        function render(t) {
          g.innerHTML = "";
          const pos = s => {
            const u = s[2], v = t + (5.533 - s[1]) * 15 * Math.cos(s[2] * D2R);
            return [E[0] + (up[0] * u + mv[0] * v) * k, E[1] + (up[1] * u + mv[1] * v) * k];
          };
          const pts = ori.stars.map(pos);
          // path of Mintaka
          svgEl("line", { x1: E[0], y1: E[1], x2: E[0] + mv[0] * 60 * k, y2: E[1] + mv[1] * 60 * k, stroke: "rgba(255,207,122,.35)", "stroke-dasharray": "4 6" }, g);
          ori.lines.forEach(ch => svgEl("polyline", { points: ch.map(i => pts[i].join(",")).join(" "), fill: "none", stroke: "rgba(150,170,255,.55)" }, g));
          ori.stars.forEach((s, i) => star(pts[i][0], pts[i][1], s[3], s[0] === "Mintaka" ? "Mintaka" : "", g, s[4] || (s[0] === "Mintaka" ? "#7cf2ff" : "#fff")));
          ground(300, g, [["NE", 30], ["E", 300], ["SE", 570]]);
          svgEl("line", { x1: 300, y1: 300, x2: 300, y2: 318, stroke: "#7cf2ff", "stroke-width": 2 }, g);
        }
        render(14);
        const lab = document.createElement("label");
        lab.innerHTML = 'Time after Orion rises <input type="range" min="-12" max="45" value="14">';
        ctrl.appendChild(lab);
        lab.querySelector("input").oninput = e => { render(+e.target.value); done.add(2); refreshTabs(); };
      }
    },
    {
      name: "Find South",
      title: "Mission 4 · Find south",
      text: "There is no bright “South Star”. In summer, Scorpius is due south when it is at its highest. In spring, the Southern Cross peeks above the southern horizon of the UAE: the long bar of the cross points down towards the south celestial pole, which lies below the horizon, roughly under due south.",
      build() {
        const g = svgEl("g", {}, svg);
        const lat = 24.5, k = 5, hy = 330;
        function render(id) {
          g.innerHTML = "";
          const c = conById(id);
          const ref = c.stars.reduce((a, s) => a + s[1], 0) / c.stars.length;
          const pos = s => [300 - (s[1] - ref) * 15 * Math.cos(s[2] * D2R) * k * (id === "crux" ? 2.2 : 1), hy - (90 - lat + s[2]) * k * (id === "crux" ? 2.2 : 1)];
          const pts = c.stars.map(pos);
          if (id === "crux") {
            const ga = pts[0], ac = pts[1];
            const ex = [ga[0] + (ac[0] - ga[0]) * 4.5, ga[1] + (ac[1] - ga[1]) * 4.5];
            svgEl("line", { x1: ga[0], y1: ga[1], x2: ex[0], y2: ex[1], stroke: "#7cf2ff", "stroke-dasharray": "6 6", "stroke-width": 2 }, g);
          }
          c.lines.forEach(ch => svgEl("polyline", { points: ch.map(i => pts[i].join(",")).join(" "), fill: "none", stroke: "rgba(150,170,255,.55)" }, g));
          c.stars.forEach((s, i) => star(pts[i][0], pts[i][1], s[3], ["Antares", "Shaula", "Acrux", "Gacrux"].includes(s[0]) ? s[0] : "", g, s[4] || "#fff"));
          ground(hy, g, [["SE", 60], ["S", 300], ["SW", 540]]);
          svgEl("line", { x1: 300, y1: hy, x2: 300, y2: 20, stroke: "rgba(255,207,122,.25)", "stroke-dasharray": "2 6" }, g);
          if (id === "crux") {
            const t = svgEl("text", { x: 300, y: 372, fill: "#7cf2ff", "font-size": 11, "text-anchor": "middle" }, g);
            t.textContent = "(vertical scale enlarged; Crux is only a few degrees high)";
          }
        }
        render("scorpius");
        button("☀ Summer: Scorpius", () => { render("scorpius"); done.add(3); refreshTabs(); });
        button("🌼 Spring: Southern Cross", () => { render("crux"); done.add(3); refreshTabs(); });
      }
    },
    {
      name: "Suhail",
      title: "Mission 5 · Suhail (Canopus), the star of the season",
      text: "Canopus, called Suhail in Arabic, is the second-brightest star in the night sky. From the UAE it never climbs high: it stays low over the southern horizon. Its first appearance before dawn in late August is traditionally seen as the sign that the hottest part of summer is ending. The further south you are, the higher it gets.",
      build() {
        const g = svgEl("g", {}, svg);
        const places = [["Liwa", 23.1], ["Abu Dhabi", 24.5], ["Dubai", 25.2], ["Ras Al Khaimah", 25.8]];
        let cur = 24.5;
        const hy = 300, k = 12;
        function render(lat) {
          g.innerHTML = "";
          const alt = 90 - lat - 52.7;
          const sy = hy - alt * k;
          for (let i = 1; i <= 2; i++) svgEl("line", { x1: 40, y1: hy - i * 10 * k, x2: 560, y2: hy - i * 10 * k, stroke: "rgba(124,242,255,.12)" }, g);
          [10, 20].forEach(a => { const t = svgEl("text", { x: 44, y: hy - a * k - 4, fill: "rgba(124,242,255,.5)", "font-size": 11 }, g); t.textContent = a + "°"; });
          const defs = svgEl("defs", {}, g);
          const rg = svgEl("radialGradient", { id: "canGlow" }, defs);
          svgEl("stop", { offset: "0", "stop-color": "#fff6dc", "stop-opacity": .9 }, rg);
          svgEl("stop", { offset: "1", "stop-color": "#fff6dc", "stop-opacity": 0 }, rg);
          svgEl("circle", { cx: 300, cy: sy, r: 34, fill: "url(#canGlow)" }, g);
          star(300, sy, -0.74, "", g, "#fff6dc");
          const t = svgEl("text", { x: 340, y: sy + 5, fill: "#ffcf7a", "font-size": 15, "font-family": "Orbitron" }, g);
          t.textContent = `Suhail · ${alt.toFixed(1)}° high`;
          ground(hy, g, [["S", 300]]);
        }
        render(cur);
        places.forEach(([n, lat]) => button(n, () => { tween(cur, lat, 700, v => render(v)); cur = lat; done.add(4); refreshTabs(); }));
      }
    }
  ];

  let active = 0;
  function refreshTabs() {
    $$(".mission-tab", tabs).forEach((b, i) => { b.classList.toggle("active", i === active); b.classList.toggle("done", done.has(i)); });
  }
  function open(i) {
    active = i; clear();
    const m = missions[i];
    title.textContent = m.title; text.textContent = m.text;
    m.build();
    refreshTabs();
    svg.animate([{ opacity: 0, transform: "scale(.97)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: "ease-out" });
  }
  missions.forEach((m, i) => {
    const b = document.createElement("button");
    b.className = "mission-tab"; b.setAttribute("role", "tab");
    b.innerHTML = `<b>0${i + 1}</b> ${m.name}`;
    b.onclick = () => open(i);
    tabs.appendChild(b);
  });
  open(0);
})();

/* ---------------------------------------------------------
   CELESTIAL COORDINATES — flip cards + alt/az dome
   --------------------------------------------------------- */
(() => {
  const grid = $("#flipGrid");
  TERMS.forEach(t => {
    const b = document.createElement("button");
    b.className = "flip";
    b.setAttribute("aria-label", t.t);
    b.innerHTML = `<div class="flip-in">
      <div class="flip-f"><span class="ic">${t.icon}</span><div><h4>${t.t}</h4><small>Tap to flip</small></div></div>
      <div class="flip-b"><h4>${t.t}</h4>${t.d}</div></div>`;
    b.onclick = () => b.classList.toggle("on");
    grid.appendChild(b);
  });

  const svg = $("#dome"), C = 160, R = 140;
  svgEl("circle", { cx: C, cy: C, r: R, fill: "rgba(12,18,56,.8)", stroke: "#7cf2ff", "stroke-opacity": .5 }, svg);
  [30, 60].forEach(a => {
    const r = R * (1 - a / 90);
    svgEl("circle", { cx: C, cy: C, r, fill: "none", stroke: "rgba(124,242,255,.2)", "stroke-dasharray": "3 4" }, svg);
    const t = svgEl("text", { x: C + 3, y: C - r - 3, fill: "rgba(124,242,255,.6)", "font-size": 9 }, svg); t.textContent = a + "°";
  });
  [["N", C, C - R - 6], ["S", C, C + R + 14], ["E", C - R - 10, C + 4], ["W", C + R + 10, C + 4]].forEach(([l, x, y]) => {
    const t = svgEl("text", { x, y, fill: "#ffcf7a", "font-size": 13, "text-anchor": "middle", "font-family": "Orbitron" }, svg); t.textContent = l;
  });
  svgEl("text", { x: C + 4, y: C + 12, fill: "rgba(255,255,255,.5)", "font-size": 9 }, svg).textContent = "Zenith";
  const azArc = svgEl("path", { fill: "none", stroke: "#ffcf7a", "stroke-width": 2, opacity: .7 }, svg);
  const ray = svgEl("line", { x1: C, y1: C, stroke: "#7cf2ff", "stroke-dasharray": "4 4" }, svg);
  const glow = svgEl("circle", { r: 18, fill: "rgba(255,230,160,.25)" }, svg);
  const st = svgEl("circle", { r: 8, fill: "#fff6dc", style: "cursor:grab" }, svg);
  const altOut = $("#altOut"), azOut = $("#azOut");

  function setPos(x, y) {
    let dx = x - C, dy = y - C, r = Math.hypot(dx, dy);
    if (r > R) { dx *= R / r; dy *= R / r; r = R; }
    const px = C + dx, py = C + dy;
    [st, glow].forEach(e => { e.setAttribute("cx", px); e.setAttribute("cy", py); });
    ray.setAttribute("x2", px); ray.setAttribute("y2", py);
    const alt = 90 * (1 - r / R);
    const az = ((Math.atan2(-dx, -dy) / D2R) + 360) % 360;
    // azimuth arc drawn on the horizon circle from north towards east (anticlockwise on screen)
    const ex = C - R * Math.sin(az * D2R), ey = C - R * Math.cos(az * D2R);
    azArc.setAttribute("d", `M${C},${C - R} A${R},${R} 0 ${az > 180 ? 1 : 0} 0 ${ex},${ey}`);
    altOut.textContent = Math.round(alt) + "°";
    azOut.textContent = `${Math.round(az)}° ${Sky.compass(az)}`;
  }
  let dragging = false;
  const pt = e => { const b = svg.getBoundingClientRect(); return [(e.clientX - b.left) * 320 / b.width, (e.clientY - b.top) * 320 / b.height]; };
  svg.addEventListener("pointerdown", e => { dragging = true; svg.setPointerCapture(e.pointerId); setPos(...pt(e)); });
  svg.addEventListener("pointermove", e => { if (dragging) setPos(...pt(e)); });
  svg.addEventListener("pointerup", () => { dragging = false; });
  setPos(C - 50, C + 50);
})();

/* ---------------------------------------------------------
   UAE MAP (Leaflet)
   --------------------------------------------------------- */
const UAEMap = (() => {
  const list = $("#locList");
  const bortleColor = b => `hsl(${130 - (b - 1) * 16}, 80%, 55%)`;
  let map = null, markers = [], glow = null;

  LOCATIONS.forEach((l, i) => {
    const b = document.createElement("button");
    b.className = "loc";
    b.innerHTML = `<strong>${l.name}</strong><small>${l.emirate} · ${l.drive}</small>
      <span class="bortle-pill" style="background:${bortleColor(l.bortle)}22;color:${bortleColor(l.bortle)};border:1px solid ${bortleColor(l.bortle)}">B${l.bortle}</span>`;
    b.onclick = () => focus(i);
    list.appendChild(b);
  });

  function popup(l) {
    return `<h4>${l.name}</h4><b>${l.emirate}</b> · Bortle ≈ ${l.bortle}<br>
      <b>Elevation:</b> ${l.elev}<br><b>Getting there:</b> ${l.drive}<br>
      <p>${l.why}</p><p><b>Tip:</b> ${l.tips}</p>
      <button class="chip" onclick="viewSkyFrom(${LOCATIONS.indexOf(l)})">✶ See the sky from here</button>`;
  }

  function init() {
    if (map || typeof L === "undefined") return;
    map = L.map("uaeMap", { zoomControl: true, scrollWheelZoom: false }).setView([24.4, 54.6], 7);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd", maxZoom: 18
    }).addTo(map);

    glow = L.layerGroup(CITY_GLOW.flatMap(c => [1, 0.6, 0.3].map(f => L.circle([c.lat, c.lon], {
      radius: c.r * (1.6 - f), stroke: false, fillColor: "#ffb347", fillOpacity: 0.12 * f + 0.04, interactive: false
    })))).addTo(map);

    const icon = L.divIcon({ className: "star-pin", html: "<i></i>", iconSize: [22, 22] });
    markers = LOCATIONS.map((l, i) => L.marker([l.lat, l.lon], { icon, title: l.name }).addTo(map).bindPopup(popup(l)).on("click", () => highlight(i)));
  }
  function highlight(i) { $$(".loc", list).forEach((b, k) => b.classList.toggle("active", k === i)); }
  function focus(i) {
    init(); highlight(i);
    if (!map) return;
    const l = LOCATIONS[i];
    map.flyTo([l.lat, l.lon], 10, { duration: 1.6 });
    setTimeout(() => markers[i].openPopup(), 1650);
  }
  $("#glowToggle").onchange = e => { if (!map) return; e.target.checked ? glow.addTo(map) : map.removeLayer(glow); };

  // build the map once it scrolls into view (Leaflet needs a visible box)
  new IntersectionObserver((en, ob) => { if (en[0].isIntersecting) { init(); setTimeout(() => map && map.invalidateSize(), 300); ob.disconnect(); } }, { rootMargin: "200px" }).observe($("#uaeMap"));
  return { focus };
})();

/* ---------------------------------------------------------
   LIGHT POLLUTION SIMULATOR
   --------------------------------------------------------- */
(() => {
  const cv = $("#lpCanvas"), ctx = cv.getContext("2d"), slider = $("#bortle");
  let W, H, DPR, cur = 9, target = 9;
  const stars = [], milky = [];
  for (let i = 0; i < 2600; i++) {
    const m = Math.max(-1, 8 + Math.log10(Math.random()) / 0.5);
    stars.push({ x: Math.random(), y: Math.random() * 0.85, m, tw: Math.random() * 6 });
  }
  for (let i = 0; i < 1800; i++) {
    const t = Math.random(), off = (Math.random() + Math.random() + Math.random() - 1.5) * 0.09;
    milky.push({ x: t, y: 0.05 + t * 0.6 + off, a: Math.random() });
  }
  function size() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    const b = cv.getBoundingClientRect();
    W = cv.width = b.width * DPR; H = cv.height = b.height * DPR;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function draw(t) {
    const b = cur, k = (b - 1) / 8;                // 0 = darkest, 1 = city
    const limit = lerp(7.8, 3.8, k);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgb(${lerp(3, 40, k)},${lerp(5, 32, k)},${lerp(18, 48, k)})`);
    g.addColorStop(1, `rgb(${lerp(10, 140, k)},${lerp(10, 90, k)},${lerp(30, 60, k)})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const mw = Math.max(0, (4.5 - b) / 3.5);
    if (mw > 0) {
      milky.forEach(p => { ctx.fillStyle = `rgba(220,215,255,${p.a * 0.25 * mw})`; ctx.fillRect(p.x * W, p.y * H, 1.4 * DPR, 1.4 * DPR); });
    }
    stars.forEach(s => {
      if (s.m > limit) return;
      const a = Math.min(1, (limit - s.m) / 1.6) * (0.8 + 0.2 * Math.sin(t * 0.002 + s.tw));
      const r = Math.max(0.5, (6.5 - s.m) * 0.38) * DPR;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath(); ctx.arc(s.x * W, s.y * H, r, 0, 7); ctx.fill();
    });
    // skyline: dunes in the desert, towers in the city
    ctx.fillStyle = "#05040a";
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 4 * DPR) {
      const dune = H * 0.9 - Math.sin(x / W * 6) * H * 0.03;
      const nx = Math.floor(x / (W / 26));
      const tower = H * (0.9 - (k > 0.45 ? ((nx * 37 % 11) / 11) * 0.32 * (k - 0.45) / 0.55 : 0));
      ctx.lineTo(x, Math.min(dune, tower));
    }
    ctx.lineTo(W, H); ctx.fill();
    if (k > 0.45) {   // lit windows
      ctx.fillStyle = `rgba(255,210,120,${(k - 0.45) * 1.2})`;
      for (let nx = 0; nx < 26; nx++) {
        const h = ((nx * 37 % 11) / 11) * 0.32 * (k - 0.45) / 0.55 * H;
        for (let yy = H * 0.9 - h + 8 * DPR; yy < H * 0.9; yy += 9 * DPR)
          if ((nx * 7 + Math.floor(yy)) % 3) ctx.fillRect(nx * W / 26 + 6 * DPR, yy, 2 * DPR, 3 * DPR);
      }
    }
  }
  function update() {
    const b = BORTLE[+slider.value];
    $("#lpClass").textContent = "Bortle " + slider.value;
    $("#lpName").textContent = b.name;
    $("#lpText").textContent = b.text;
    $("#lpUae").textContent = b.uae;
    $("#lpLimit").textContent = b.limit.toFixed(1);
    target = +slider.value;
  }
  slider.oninput = update;
  let visible = false;
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(cv);
  (function loop(t) { if (visible) { cur += (target - cur) * 0.08; draw(t); } requestAnimationFrame(loop); })(0);
  addEventListener("resize", size);
  size(); update();

  const info = {
    humidity: "💧 <b>Humidity.</b> Summer air on the UAE coast is very humid. Water vapour scatters light, so faint stars fade and city glow spreads further. Inland desert and mountain sites are drier, and winter nights are much clearer.",
    dust: "🌪 <b>Dust & haze.</b> Fine desert dust hangs in the air, especially during windy spells in spring and summer. It dims stars near the horizon most of all. The clearest nights often come after rain or once the wind drops.",
    moon: "🌕 <b>The Moon.</b> A full Moon lights up the sky almost like light pollution and hides the Milky Way. Plan trips for the days around the new Moon, or wait until a crescent Moon has set.",
    heat: "🌡 <b>Heat.</b> Summer nights can stay above 30 °C. Rising warm air makes stars twinkle more and blurs telescope views. High places such as Jebel Jais are cooler and steadier.",
    eyes: "👁 <b>Dark-adapted eyes.</b> Your eyes need about 20–30 minutes in darkness to see the faintest stars. Use a red torch and avoid looking at bright phone screens, which resets your night vision."
  };
  $$(".factor").forEach(b => b.onclick = () => {
    $$(".factor").forEach(x => x.classList.toggle("active", x === b));
    const el = $("#factorInfo"); el.innerHTML = info[b.dataset.f];
    el.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 350 });
  });
})();

/* ---------------------------------------------------------
   SKY CALENDAR WHEEL
   --------------------------------------------------------- */
(() => {
  const ring = $("#wheelRing"), wheel = $("#wheel");
  let sel = new Date().getMonth(), rot = 0;
  const btns = MONTHS.map((m, i) => {
    const b = document.createElement("button");
    b.textContent = m.m; b.setAttribute("aria-label", m.full);
    b.onclick = () => pick(i);
    ring.appendChild(b); return b;
  });
  function layout() {
    const r = wheel.clientWidth / 2 - (innerWidth < 640 ? 26 : 32);
    btns.forEach((b, i) => {
      const a = i * 30;
      b.style.transform = `rotate(${a}deg) translateY(${-r}px) rotate(${-a - rot}deg)`;
      b.classList.toggle("active", i === sel);
    });
    ring.style.transform = `rotate(${rot}deg)`;
  }
  function pick(i) {
    // rotate the shortest way so the chosen month sits at the top
    let d = (-i * 30) - rot; d = ((d % 360) + 540) % 360 - 180;
    rot += d; sel = i; layout();
    const m = MONTHS[i];
    $("#wcMonth").textContent = m.m;
    $("#wcStars").textContent = "★".repeat(m.rating) + "☆".repeat(5 - m.rating);
    $("#calTitle").textContent = m.full;
    $("#calCons").innerHTML = m.cons.map(c => `<span class="tag">${c}</span>`).join("");
    $("#calEvent").textContent = m.event;
    $("#calWeather").textContent = m.weather;
  }
  $("#calView").onclick = () => {
    const y = Sky.uaeParts(Sky.state.ms).y;
    Sky.setTime(Sky.fromUae(y, sel, 15, 21 * 60));
    document.getElementById("sky").scrollIntoView({ behavior: "smooth" });
  };
  addEventListener("resize", layout);
  pick(sel);
})();

/* ---------------------------------------------------------
   TOOLS
   --------------------------------------------------------- */
(() => {
  const grid = $("#toolGrid");
  TOOLS.forEach((t, i) => {
    const a = document.createElement("article");
    a.className = "glass tool tilt";
    a.innerHTML = `<span class="ic" style="animation-delay:${-i * 0.7}s">${t.icon}</span><h3>${t.name}</h3>
      <div class="type">${t.type}</div><p>${t.d}</p><div class="use">Best for: ${t.use}</div>`;
    grid.appendChild(a);
  });
})();
