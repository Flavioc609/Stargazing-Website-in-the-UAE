/* =========================================================
   SECTIONS — navigation missions, coordinates,
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
   Each mission: an intro, key words, guided steps (what to do
   + why), a picture legend, and a check-yourself question.
   --------------------------------------------------------- */
const Nav = (() => {
  const svg = $("#navSvg"), tabs = $(".mission-tabs"), ctrl = $("#mControls");
  const el = {
    title: $("#mTitle"), intro: $("#mIntro"), terms: $("#mTerms"), def: $("#mTermDef"),
    num: $("#mStepNum"), dots: $("#mDots"), text: $("#mStepText"), why: $("#mStepWhy"),
    prev: $("#mPrev"), next: $("#mNext"), view: $("#mView"), legend: $("#mLegend"),
    quiz: $("#mQuiz"), qText: $("#mQText"), qOpts: $("#mQOpts"), qFb: $("#mQFb"), tip: $("#mTip")
  };
  const done = new Set();
  const GOLD = "#ffcf7a", CYAN = "#7cf2ff";

  // ---------- drawing helpers ----------
  function star(g, x, y, mag, label, color = "#fff", labelColor = "#cfd6ff") {
    const r = Math.max(1.4, (4.2 - mag) * 1.5);
    svgEl("circle", { cx: x, cy: y, r: r * 3, fill: color, opacity: 0.15 }, g);
    svgEl("circle", { cx: x, cy: y, r, fill: color }, g);
    if (label) text(g, x + 9, y - 7, label, { fill: labelColor, "font-size": 12 });
  }
  function text(g, x, y, str, attrs = {}) {
    const t = svgEl("text", Object.assign({ x, y, fill: "#cfd6ff", "font-size": 13 }, attrs), g);
    t.textContent = str; return t;
  }
  function ring(g, x, y, r = 14, color = GOLD) {
    svgEl("circle", { cx: x, cy: y, r, fill: "none", stroke: color, "stroke-width": 2, class: "hl-ring" }, g);
  }
  // a small boxed note with a pointer line, used to explain parts of the picture
  function note(g, x, y, str, tx, ty, color = "#e9ecff") {
    if (tx !== undefined) svgEl("line", { x1: x, y1: y, x2: tx, y2: ty, stroke: "rgba(233,236,255,.5)", "stroke-dasharray": "2 3" }, g);
    const t = text(g, x, y, str, { fill: color, "font-size": 11.5 });
    const b = t.getBBox();
    const r = svgEl("rect", { x: b.x - 6, y: b.y - 3, width: b.width + 12, height: b.height + 6, rx: 6, fill: "rgba(5,7,22,.85)", stroke: "rgba(233,236,255,.25)" }, g);
    g.insertBefore(r, t);
  }
  function ground(g, y, labels = []) {
    svgEl("rect", { x: 0, y, width: 600, height: 380 - y, fill: "#0a0714" }, g);
    svgEl("line", { x1: 0, y1: y, x2: 600, y2: y, stroke: GOLD, "stroke-opacity": .6 }, g);
    labels.forEach(([lab, x]) => text(g, x, y + 22, lab, { fill: GOLD, "font-size": 14, "text-anchor": "middle", "font-family": "Orbitron" }));
  }
  function lines(g, c, pts, color, width = 1.2) {
    c.lines.forEach(ch => svgEl("polyline", { points: ch.map(i => pts[i].join(",")).join(" "), fill: "none", stroke: color, "stroke-width": width }, g));
  }
  function arrow(g, x1, y1, x2, y2, color = CYAN) {
    svgEl("line", { x1, y1, x2, y2, stroke: color, "stroke-width": 2 }, g);
    const a = Math.atan2(y2 - y1, x2 - x1), s = 8;
    svgEl("polygon", { points: `${x2},${y2} ${x2 - s * Math.cos(a - .5)},${y2 - s * Math.sin(a - .5)} ${x2 - s * Math.cos(a + .5)},${y2 - s * Math.sin(a + .5)}`, fill: color }, g);
  }
  const sByName = (c, n) => c.stars.findIndex(s => s[0] === n);

  // legend swatches
  const SW = {
    star: '<i class="sw sw-star"></i>', gold: '<i class="sw sw-star gold"></i>', red: '<i class="sw sw-star red"></i>',
    shape: '<i class="sw sw-line"></i>', goldline: '<i class="sw sw-line gold"></i>', dash: '<i class="sw sw-dash"></i>',
    golddash: '<i class="sw sw-dash gold"></i>', hz: '<i class="sw sw-hz"></i>', ring: '<i class="sw sw-ring"></i>',
    arrow: '<i class="sw sw-arrow">↓</i>', fist: '<i class="sw sw-fist">✊</i>', grid: '<i class="sw sw-grid"></i>',
    dawn: '<i class="sw sw-dawn"></i>', person: '<i class="sw sw-fist">🧍</i>', slice: '<i class="sw sw-slice"></i>'
  };
  const HORIZON = [SW.hz, "<b>Gold line at the bottom</b> = the horizon, where the ground meets the sky. Letters under it are compass directions."];

  // ---------- missions ----------
  const missions = [
    {
      name: "Find north",
      title: "Mission 1 · Find north with the North Star",
      view: "🔭 The picture shows: the northern part of the night sky",
      intro: "Polaris, the North Star, sits almost exactly above Earth’s North Pole. So while every other star moves across the sky during the night, Polaris stays in the same place, always in the north. Find Polaris and you know which way north is.",
      terms: [
        ["Constellation", "A group of stars that people have joined into a picture or pattern, like a dot-to-dot drawing in the sky."],
        ["Polaris", "Also called the North Star. A medium-bright star that always marks the direction north."],
        ["Big Dipper", "Seven bright stars shaped like a big spoon or ladle (a bowl and a handle). It is part of the constellation Ursa Major, the Great Bear."],
        ["Pointer stars", "Dubhe and Merak: the two stars on the outer edge of the Big Dipper’s bowl. A line through them points to Polaris."]
      ],
      steps: [
        { do: "Look at the picture. Each white dot is a star. Find the seven stars joined by gold lines, shaped like a big spoon. This is the Big Dipper.",
          why: "The Big Dipper is one of the easiest star patterns to recognise, so stargazers use it as the starting point for finding the North Star.",
          legend: [[SW.star, "<b>White dots</b> = stars. Bigger dots are brighter stars."], [SW.goldline, "<b>Gold lines</b> = the Big Dipper’s spoon shape. The lines are not in the real sky; they help you see the pattern."], [SW.shape, "<b>Faint blue lines</b> = other star patterns nearby."]] },
        { do: "Find the two stars circled in gold, at the outer edge of the spoon’s bowl. They are called Merak and Dubhe.",
          why: "These two are the “pointer stars”: a straight line through them points almost exactly at the North Star.",
          legend: [[SW.ring, "<b>Pulsing gold circles</b> = the stars to look at in this step."], [SW.goldline, "<b>Gold lines</b> = the Big Dipper."]] },
        { do: "Follow the blue dashed line from Merak, through Dubhe, and onwards. Each numbered dot is one “gap”: the distance between Merak and Dubhe. Count 5 gaps.",
          why: "Measuring in gaps needs no tools and works at any time of night, because the gap stays the same size even as the stars move.",
          legend: [[SW.dash, "<b>Blue dashed line</b> = the imaginary line from the pointer stars."], [SW.star, "<b>Numbers 1–5</b> = how many gaps you have counted."]] },
        { do: "At the end of the line is Polaris, the North Star (in gold). The gold arrow drops straight down from Polaris to the horizon.",
          why: "The spot on the horizon under Polaris is due north. Once you know north, you know the rest: south is behind you, east is on your right and west is on your left.",
          legend: [[SW.gold, "<b>Gold star</b> = Polaris, the North Star."], [SW.arrow, "<b>Gold arrow</b> = straight down to the horizon, showing due north."]] },
        { do: "Drag the slider under the picture. It moves time forward through the night.",
          why: "Watch the whole sky turn around Polaris while the pointer stars keep pointing at it. This proves the method works at any time of night. The W-shaped pattern is Cassiopeia, a backup when the Big Dipper is low.",
          legend: [[SW.gold, "<b>Polaris</b> stays still in the middle while everything turns around it."], [SW.shape, "<b>W shape</b> = Cassiopeia, on the other side of Polaris."]] }
      ],
      quiz: {
        q: "Why is Polaris useful for finding north?",
        options: ["It is the brightest star in the sky", "It stays in almost the same place, above the North Pole", "It only appears in winter"],
        answer: 1,
        explain: "Polaris is only around the 48th-brightest star. It is useful because it barely moves, so it always marks north."
      },
      tip: "<b>Try it outside:</b> from the UAE the Big Dipper is low on autumn and winter evenings and may be hidden. Then look for Cassiopeia, a W shape on the other side of Polaris. Its middle points roughly towards Polaris.",
      state: { rot: 20 },
      controls(s, render) {
        const lab = document.createElement("label");
        lab.innerHTML = '👆 Drag to move time through the night <input type="range" min="0" max="360" value="20">';
        lab.querySelector("input").oninput = e => { s.rot = +e.target.value; render(); };
        return [{ el: lab, from: 4 }];
      },
      draw(g, step, s) {
        const cx = 300, cy = 190, k = 4.2;
        const P = (ra, dec) => { const a = (s.rot - ra * 15) * D2R, r = (90 - dec) * k; return [cx + r * Math.sin(a), cy + r * Math.cos(a)]; };
        const um = conById("ursamajor"), un = conById("ursaminor"), ca = conById("cassiopeia");
        const umP = um.stars.map(x => P(x[1], x[2])), unP = un.stars.map(x => P(x[1], x[2])), caP = ca.stars.map(x => P(x[1], x[2]));
        lines(g, un, unP, "rgba(150,170,255,.3)");
        lines(g, ca, caP, step >= 4 ? "rgba(150,170,255,.55)" : "rgba(150,170,255,.25)");
        lines(g, um, umP, step === 0 ? GOLD : "rgba(255,207,122,.55)", step === 0 ? 2.2 : 1.4);
        un.stars.forEach((x, i) => star(g, unP[i][0], unP[i][1], x[3], "", i === 0 && step >= 3 ? GOLD : "#fff"));
        ca.stars.forEach((x, i) => star(g, caP[i][0], caP[i][1], x[3]));
        um.stars.forEach((x, i) => star(g, umP[i][0], umP[i][1], x[3]));
        if (step >= 4) { const c = caP[2]; text(g, c[0] + 12, c[1] + 18, "Cassiopeia (W)", { fill: "#aab4e8", "font-size": 11 }); }
        if (step === 0) {
          const c = umP[3]; text(g, c[0] + 10, c[1] - 14, "Big Dipper", { fill: GOLD, "font-size": 14, "font-family": "Orbitron" });
          const bx = (umP[0][0] + umP[1][0] + umP[2][0] + umP[3][0]) / 4, by = (umP[0][1] + umP[1][1] + umP[2][1] + umP[3][1]) / 4;
          note(g, 60, 240, "the bowl of the spoon", bx, by);
          note(g, 420, 130, "the handle", umP[6][0], umP[6][1]);
        }
        const dub = umP[sByName(um, "Dubhe")], mer = umP[sByName(um, "Merak")], pol = unP[0];
        if (step >= 1) {
          if (step === 1) { ring(g, dub[0], dub[1]); ring(g, mer[0], mer[1]); note(g, 40, 230, "the 2 pointer stars", mer[0] - 6, mer[1] + 6); }
          text(g, dub[0] + 12, dub[1] + 4, "Dubhe", { fill: CYAN });
          text(g, mer[0] - 12, mer[1] + 4, "Merak", { fill: CYAN, "text-anchor": "end" });
        }
        if (step >= 2) {
          const gap = Math.hypot(dub[0] - mer[0], dub[1] - mer[1]), L = Math.hypot(pol[0] - mer[0], pol[1] - mer[1]);
          const ux = (pol[0] - mer[0]) / L, uy = (pol[1] - mer[1]) / L;
          svgEl("line", { x1: mer[0], y1: mer[1], x2: pol[0], y2: pol[1], stroke: CYAN, "stroke-width": 2, "stroke-dasharray": "6 6", class: "march" }, g);
          for (let n = 1; n <= 5; n++) {
            const tx = dub[0] + ux * gap * n, ty = dub[1] + uy * gap * n;
            svgEl("circle", { cx: tx, cy: ty, r: 3, fill: CYAN }, g);
            text(g, tx - uy * 12, ty + ux * 12, String(n), { fill: CYAN, "font-size": 11, "text-anchor": "middle" });
          }
          if (step === 2) note(g, 40, 300, "1 gap = distance from Merak to Dubhe", dub[0] - 4, dub[1] + 6, CYAN);
        }
        if (step >= 3) {
          if (step === 3) ring(g, pol[0], pol[1], 16);
          text(g, pol[0] + 12, pol[1] - 10, "Polaris (North Star)", { fill: GOLD, "font-size": 13 });
          arrow(g, pol[0], pol[1] + 12, pol[0], 345, GOLD);
          text(g, pol[0], 365, "N  (due north on the horizon)", { fill: GOLD, "font-size": 13, "text-anchor": "middle", "font-family": "Orbitron" });
        }
      }
    },
    {
      name: "Your latitude",
      title: "Mission 2 · Find your latitude from one star",
      view: "🔭 The picture shows: a side view of you looking north at Polaris",
      intro: "Latitude tells you how far north or south of the equator you are. The UAE is about 23° to 26° north. Sailors could work out their latitude at night, with no GPS, just by measuring how high Polaris was.",
      terms: [
        ["Latitude", "How far north or south of the equator a place is, measured in degrees. The equator is 0°, the North Pole is 90° N. Abu Dhabi is about 24.5° N."],
        ["Degree (°)", "A unit for measuring angles. A full circle is 360°, and from the horizon to straight overhead is 90°."],
        ["Altitude", "How high something is in the sky, in degrees. 0° is on the horizon and 90° is straight above your head."],
        ["Horizon", "The line where the ground (or sea) seems to meet the sky."]
      ],
      steps: [
        { do: "This picture is a side view, as if someone were watching you from the side. You are the small figure on the left, looking north. The gold dot is Polaris. The dashed line is the direction your eyes look to see it.",
          why: "To measure how high a star is, you measure the angle between looking straight ahead at the horizon and looking up at the star. That angle is called the altitude.",
          legend: [[SW.person, "<b>The figure</b> = you, standing on the ground."], [SW.gold, "<b>Gold dot</b> = Polaris, the North Star."], [SW.dash, "<b>Dashed line</b> = your line of sight to Polaris."], HORIZON] },
        { do: "Stretch one arm out straight in front of you and make a fist. The shaded slice in the picture shows how much sky one fist covers: about 10°.",
          why: "You do not need any equipment: your fist is a built-in measuring tool. People with longer arms also have bigger fists, so it works for nearly everyone.",
          legend: [[SW.slice, "<b>Shaded slice</b> = the part of the sky covered by one fist (about 10°)."], [SW.fist, "<b>Fist symbol</b> = one fist at arm’s length."]] },
        { do: "Count fists from the horizon up to Polaris, putting one fist on top of the other. From the UAE you need about 2½ fists.",
          why: "2½ fists × 10° per fist ≈ 25°. So Polaris is about 25° above the horizon in the UAE.",
          legend: [[SW.slice, "<b>Each coloured slice</b> = one fist (10°). The last slice may be part of a fist."]] },
        { do: "Tap the place buttons under the picture and watch Polaris move up or down.",
          why: "The height of Polaris in degrees is the same number as your latitude. The further north you go, the higher Polaris is. Navigators used this to know how far north they were without a map.",
          legend: [[SW.goldline, "<b>Gold arc and number</b> = the angle of Polaris above the horizon, which equals your latitude."]] }
      ],
      quiz: {
        q: "From Abu Dhabi, Polaris is about 24.5° high. If you saw Polaris 51° high, where could you be?",
        options: ["Near the equator", "Near London, which is about 51° N", "At the North Pole"],
        answer: 1,
        explain: "The height of Polaris equals your latitude, so 51° means about 51° N, like London. At the equator it is on the horizon (0°); at the North Pole it is overhead (90°)."
      },
      tip: "<b>Try it outside:</b> to make the measurement more accurate, stack your fists one on top of the other without gaps, and keep your arm fully straight.",
      state: { lat: 24.5 },
      controls(s, render) {
        const wrap = document.createElement("div"); wrap.className = "btn-row";
        wrap.innerHTML = '<span class="ctrl-label">👆 Tap a place:</span>';
        [["Liwa", 23.1], ["Abu Dhabi", 24.5], ["Dubai", 25.2], ["Ras Al Khaimah", 25.8], ["London", 51.5], ["Equator", 0]].forEach(([n, lat]) => {
          const b = document.createElement("button"); b.className = "chip"; b.textContent = n;
          b.onclick = () => { const from = s.lat; s.lat = lat; tween(from, lat, 700, v => render(v)); };
          wrap.appendChild(b);
        });
        return [{ el: wrap, from: 3 }];
      },
      draw(g, step, s, latOverride) {
        const lat = latOverride ?? s.lat;
        const ox = 110, oy = 300, L = 380, a = lat * D2R;
        ground(g, oy, [["N  (you are facing north)", 450]]);
        const sx = ox + L * Math.cos(a), sy = oy - L * Math.sin(a);
        if (step >= 1) {
          const full = step === 1 ? 1 : lat / 10, R = 170;
          for (let i = 0; i < Math.ceil(full); i++) {
            const a0 = i * 10 * D2R, a1 = Math.min(full, i + 1) * 10 * D2R;
            svgEl("path", { d: `M${ox},${oy} L${ox + R * Math.cos(a0)},${oy - R * Math.sin(a0)} A${R},${R} 0 0 0 ${ox + R * Math.cos(a1)},${oy - R * Math.sin(a1)} Z`,
              fill: i % 2 ? "rgba(183,140,255,.28)" : "rgba(124,242,255,.22)", stroke: "rgba(255,255,255,.25)" }, g);
            const am = (a0 + a1) / 2;
            text(g, ox + (R + 16) * Math.cos(am), oy - (R + 16) * Math.sin(am) + 5, "✊", { "font-size": 15, "text-anchor": "middle" });
          }
          text(g, 300, 36, step === 1 ? "One fist at arm’s length ≈ 10°" : `≈ ${(lat / 10).toFixed(1)} fists ≈ ${lat.toFixed(1)}°`, { fill: GOLD, "font-size": 16, "text-anchor": "middle", "font-family": "Orbitron" });
        }
        svgEl("line", { x1: ox, y1: oy, x2: sx, y2: sy, stroke: CYAN, "stroke-dasharray": "5 5", "stroke-width": 1.5 }, g);
        svgEl("line", { x1: ox, y1: oy - 2, x2: 560, y2: oy - 2, stroke: "rgba(255,255,255,.25)", "stroke-dasharray": "2 4" }, g);
        if (step >= 3) {
          const ar = 70;
          svgEl("path", { d: `M${ox + ar},${oy} A${ar},${ar} 0 0 0 ${ox + ar * Math.cos(a)},${oy - ar * Math.sin(a)}`, fill: "none", stroke: GOLD, "stroke-width": 2 }, g);
          text(g, ox + 200, oy - 10, `angle ${lat.toFixed(1)}° = latitude`, { fill: GOLD, "font-size": 14 });
        }
        star(g, sx, sy, 0.6, "Polaris", GOLD, GOLD);
        svgEl("circle", { cx: ox, cy: oy - 26, r: 7, fill: "#e9ecff" }, g);
        svgEl("line", { x1: ox, y1: oy - 19, x2: ox, y2: oy, stroke: "#e9ecff", "stroke-width": 3 }, g);
        text(g, ox, oy + 22, "you", { fill: "#e9ecff", "text-anchor": "middle", "font-size": 12 });
        if (step === 0) {
          ring(g, sx, sy, 16);
          note(g, 250, 140, "your line of sight to Polaris", (ox + sx) / 2, (oy + sy) / 2, CYAN);
          note(g, 330, 270, "looking straight ahead (0°)", 330, oy - 2);
        }
      }
    },
    {
      name: "East & west",
      title: "Mission 3 · Find east and west with Orion",
      view: "🔭 The picture shows: the eastern horizon, where stars rise",
      intro: "Earth spins, so stars rise in the east and set in the west, just like the Sun. Most stars rise somewhere north or south of due east, but one star in Orion rises almost exactly due east. That makes it a natural compass.",
      terms: [
        ["Orion", "A large, bright constellation shaped like a hunter. Easy to see from the UAE on winter evenings (December to March)."],
        ["Orion’s Belt", "Three bright stars in a short, straight row in the middle of Orion. They are the easiest part of Orion to recognise."],
        ["Mintaka", "The right-hand (westernmost) star of Orion’s Belt when Orion is high in the south."],
        ["Celestial equator", "An imaginary line across the sky, directly above Earth’s equator. Any star on this line rises exactly due east and sets exactly due west, wherever you are on Earth."],
        ["Due east", "Exactly east: 90° on a compass. Due west is exactly west, 270°."]
      ],
      steps: [
        { do: "You are facing east, looking at the horizon. Find three stars close together in a short, straight row (in gold). This is Orion’s Belt. The other stars joined by blue lines make up the rest of Orion.",
          why: "Orion’s Belt is the easiest part of Orion to spot: very few places in the sky have three bright stars so close together in a line.",
          legend: [[SW.goldline, "<b>Gold line</b> = Orion’s Belt (3 stars in a row)."], [SW.shape, "<b>Blue lines</b> = the rest of Orion, the hunter."], [SW.red, "<b>Orange star</b> = Betelgeuse, Orion’s shoulder. <b>Blue-white</b> = Rigel, his foot."], HORIZON] },
        { do: "Look at the circled star at the end of the belt: Mintaka. The gold dashed line is the celestial equator, an imaginary line in the sky above Earth’s equator.",
          why: "Every star on the celestial equator rises exactly in the east. Mintaka sits almost exactly on this line, which is what makes it useful.",
          legend: [[SW.ring, "<b>Circled star</b> = Mintaka."], [SW.golddash, "<b>Gold dashed line</b> = the celestial equator (the path Mintaka follows)."]] },
        { do: "Watch Orion rise from the horizon. You can also drag the slider under the picture to move time yourself.",
          why: "Notice that Mintaka comes up exactly from the point marked E. Stars rise at a slant, not straight up, because the UAE is north of the equator.",
          legend: [[SW.golddash, "<b>Gold dashed line</b> = the slanted path Mintaka follows as it rises."]] },
        { do: "The blue arrow marks where Mintaka rose: due east.",
          why: "Remember where Orion rose and you have an east–west line for the whole night. When Orion sets later in the night, Mintaka goes down due west.",
          legend: [[SW.arrow, "<b>Blue arrow</b> = due east on the horizon."]] }
      ],
      quiz: {
        q: "Orion is just rising. In which direction is Mintaka?",
        options: ["Due north", "Due east", "Due south"],
        answer: 1,
        explain: "Mintaka lies on the celestial equator, so it rises almost exactly due east and sets almost exactly due west."
      },
      tip: "<b>Try it outside:</b> in the UAE, Orion rises in the early evening in December. By around 9 pm in January it is high in the south.",
      state: { t: 30 },
      controls(s, render) {
        const lab = document.createElement("label");
        lab.innerHTML = '👆 Drag to move time after Orion rises <input type="range" min="-12" max="45" value="30">';
        lab.querySelector("input").oninput = e => { s.t = +e.target.value; render(); };
        s._slider = lab.querySelector("input");
        return [{ el: lab, from: 2 }];
      },
      enter(step, s, render) {
        if (step === 2) tween(-10, 18, 2600, v => { s.t = v; if (s._slider) s._slider.value = v; render(); });
      },
      draw(g, step, s) {
        const phi = 24.5 * D2R, k = 6, E = [300, 300];
        const up = [-Math.cos(phi), -Math.sin(phi)], mv = [Math.sin(phi), -Math.cos(phi)];
        const ori = conById("orion"), t = s.t;
        const pos = st => { const u = st[2], v = t + (5.533 - st[1]) * 15 * Math.cos(st[2] * D2R); return [E[0] + (up[0] * u + mv[0] * v) * k, E[1] + (up[1] * u + mv[1] * v) * k]; };
        const pts = ori.stars.map(pos);
        if (step >= 1) {
          svgEl("line", { x1: E[0] - mv[0] * 10 * k, y1: E[1] - mv[1] * 10 * k, x2: E[0] + mv[0] * 60 * k, y2: E[1] + mv[1] * 60 * k, stroke: "rgba(255,207,122,.5)", "stroke-dasharray": "4 6" }, g);
          text(g, E[0] + mv[0] * 44 * k + 10, E[1] + mv[1] * 44 * k, "celestial equator", { fill: "rgba(255,207,122,.8)", "font-size": 11 });
        }
        lines(g, ori, pts, "rgba(150,170,255,.55)");
        svgEl("polyline", { points: ["Mintaka", "Alnilam", "Alnitak"].map(n => pts[sByName(ori, n)].join(",")).join(" "), fill: "none", stroke: GOLD, "stroke-width": step === 0 ? 3 : 1.6 }, g);
        ori.stars.forEach((st, i) => star(g, pts[i][0], pts[i][1], st[3], "", st[4] || "#fff"));
        const mi = pts[sByName(ori, "Mintaka")];
        if (step === 0) {
          const al = pts[sByName(ori, "Alnilam")], be = pts[sByName(ori, "Betelgeuse")], ri = pts[sByName(ori, "Rigel")];
          note(g, 440, 110, "Orion’s Belt: 3 stars in a row", al[0] + 6, al[1] - 4, GOLD);
          note(g, 40, 120, "Betelgeuse (orange)", be[0] - 6, be[1] - 4);
          note(g, 440, 200, "Rigel (blue-white)", ri[0] + 6, ri[1] - 2);
        }
        if (step >= 1) { if (step === 1) ring(g, mi[0], mi[1]); text(g, mi[0] + 10, mi[1] - 8, "Mintaka", { fill: CYAN }); }
        ground(g, 300, [["NE", 30], ["E", 300], ["SE", 570]]);
        if (step === 0) note(g, 380, 335, "you are facing east", 300, 312);
        if (step >= 3) { arrow(g, 300, 250, 300, 296, CYAN); text(g, 300, 352, "due east (90°)", { fill: CYAN, "text-anchor": "middle", "font-size": 13 }); }
      }
    },
    {
      name: "Find south",
      title: "Mission 4 · Find south",
      view: "🔭 The picture shows: the southern horizon",
      intro: "There is no bright “South Star”. Instead, you use the way stars move. Stars that rise in the south-east travel in an arc and reach their highest point exactly when they are due south, then set in the south-west.",
      terms: [
        ["Scorpius", "A constellation shaped like a scorpion with a long curved tail. Look for a hook or J shape with a bright red star, Antares. Best on UAE summer evenings (June to August)."],
        ["Antares", "The bright red star in the heart of Scorpius. Its colour makes it easy to spot."],
        ["Southern Cross (Crux)", "A small, bright cross of four stars. From the UAE it only just rises above the southern horizon, in spring (April to May)."],
        ["South celestial pole", "The point in the sky directly above Earth’s South Pole. From the UAE it is below the horizon, under due south."]
      ],
      steps: [
        { do: "You are facing south on a summer evening. Find the curved line of stars shaped like a hook, with a red star near the top (circled). This is Scorpius; the red star is Antares.",
          why: "Scorpius is bright and has a shape that is easy to recognise, and its red star makes it stand out. That makes it a good guide to south in summer.",
          legend: [[SW.red, "<b>Red star (circled)</b> = Antares, the heart of the scorpion."], [SW.shape, "<b>Blue lines</b> = the shape of Scorpius: body and curved tail."], HORIZON] },
        { do: "Follow the gold dashed curve: it is the path Scorpius takes during the night. It rises on the left (south-east), climbs, and sets on the right (south-west).",
          why: "The top of the curve is exactly above due south. So when Scorpius is at its highest, the point on the horizon below it is south.",
          legend: [[SW.golddash, "<b>Gold dashed curve</b> = the path Scorpius follows during the night."], [SW.arrow, "<b>Arrows</b> = the direction it moves: from left to right."]] },
        { do: "Now it is spring. Find the small cross of four stars just above the horizon: the Southern Cross. Follow the blue dashed line down from its long bar to the horizon.",
          why: "The long bar points towards the south celestial pole, which is below the horizon. Following it down shows you roughly where south is.",
          legend: [[SW.shape, "<b>Small cross</b> = the Southern Cross. Its long bar runs from Gacrux (top) to Acrux (bottom)."], [SW.dash, "<b>Blue dashed line</b> = the long bar extended down towards south."]] }
      ],
      quiz: {
        q: "Scorpius is at the highest point of its arc. Which way are you facing when you look at it?",
        options: ["North", "South", "East"],
        answer: 1,
        explain: "Stars that rise in the south-east and set in the south-west are highest when they are due south."
      },
      tip: "<b>Try it outside:</b> the Southern Cross is only a few degrees high from the UAE, so go somewhere with a flat, dark southern horizon, like the desert near Liwa.",
      state: {},
      controls() { return []; },
      draw(g, step) {
        const lat = 24.5, hy = 330;
        const id = step >= 2 ? "crux" : "scorpius", c = conById(id), big = id === "crux" ? 2.2 : 1, k = 5;
        const ref = c.stars.reduce((a, x) => a + x[1], 0) / c.stars.length;
        const pos = st => [300 - (st[1] - ref) * 15 * Math.cos(st[2] * D2R) * k * big, hy - (90 - lat + st[2]) * k * big];
        const pts = c.stars.map(pos);
        if (step === 1) {
          const an = pts[sByName(c, "Antares")], peak = an[1] + 30;
          svgEl("path", { d: `M40,${hy} Q300,${2 * peak - hy} 560,${hy}`, fill: "none", stroke: "rgba(255,207,122,.6)", "stroke-dasharray": "5 6", "stroke-width": 2 }, g);
          arrow(g, 120, hy - 70, 150, hy - 98, GOLD); arrow(g, 450, hy - 98, 480, hy - 70, GOLD);
          text(g, 70, hy - 40, "rises SE", { fill: GOLD, "font-size": 12 });
          text(g, 470, hy - 40, "sets SW", { fill: GOLD, "font-size": 12 });
          text(g, 300, peak + 34, "highest point = due south", { fill: CYAN, "font-size": 13, "text-anchor": "middle" });
          svgEl("line", { x1: 300, y1: peak + 42, x2: 300, y2: hy, stroke: "rgba(124,242,255,.5)", "stroke-dasharray": "2 4" }, g);
        }
        if (id === "crux") {
          const ga = pts[0], ac = pts[1], ex = [ga[0] + (ac[0] - ga[0]) * 4.5, ga[1] + (ac[1] - ga[1]) * 4.5];
          svgEl("line", { x1: ga[0], y1: ga[1], x2: ex[0], y2: ex[1], stroke: CYAN, "stroke-dasharray": "6 6", "stroke-width": 2, class: "march" }, g);
        }
        lines(g, c, pts, "rgba(150,170,255,.6)", 1.4);
        c.stars.forEach((st, i) => star(g, pts[i][0], pts[i][1], st[3], ["Antares", "Acrux", "Gacrux"].includes(st[0]) ? st[0] : "", st[4] || "#fff"));
        if (step === 0) {
          const an = pts[sByName(c, "Antares")]; ring(g, an[0], an[1], 15);
          text(g, an[0] - 30, an[1] - 22, "Scorpius", { fill: GOLD, "font-family": "Orbitron", "text-anchor": "end" });
          note(g, 380, 210, "the curved tail (the hook)", pts[12][0] + 4, pts[12][1]);
          note(g, 420, 90, "the head and claws", pts[1][0] + 6, pts[1][1]);
        }
        if (id === "crux") text(g, pts[3][0] - 40, pts[0][1] - 4, "Southern Cross", { fill: GOLD, "font-family": "Orbitron", "text-anchor": "end" });
        ground(g, hy, [["SE", 60], ["S", 300], ["SW", 540]]);
        if (id === "crux") text(g, 300, 372, "(heights enlarged: the cross is only a few degrees high)", { fill: CYAN, "font-size": 11, "text-anchor": "middle" });
      }
    },
    {
      name: "Suhail",
      title: "Mission 5 · Suhail, the star of the seasons",
      view: "🔭 The picture shows: the southern horizon, low down",
      intro: "Canopus, known in Arabic as Suhail, is the second-brightest star in the night sky after Sirius. For centuries people in Arabia have used it to mark the seasons, and sailors used it to steer by. From the UAE it always stays low in the south, so you need to know exactly where to look.",
      terms: [
        ["Suhail (Canopus)", "A very bright star in the southern sky. From the UAE it never climbs high: it always stays low above the southern horizon."],
        ["Altitude", "How high something is in the sky, in degrees. 0° is on the horizon and 90° is straight overhead. One fist at arm’s length ≈ 10°."],
        ["Rising before dawn", "The first mornings of the year when a star can be seen low in the sky just before sunrise, before the Sun’s light hides it."]
      ],
      steps: [
        { do: "You are facing due south, looking at the horizon (the gold line). The big bright star circled just above it is Suhail. The two faint lines across the picture mark heights of 10° and 20° above the horizon: one fist and two fists.",
          why: "Suhail is the second-brightest star in the night sky, so it is easy to spot once you know where to look: due south, a little more than one fist above the horizon. Because it stays so low, buildings, hills or haze can easily hide it.",
          legend: [[SW.gold, "<b>Big bright star (circled)</b> = Suhail (Canopus)."], [SW.grid, "<b>Faint lines</b> = height above the horizon: 10° (1 fist) and 20° (2 fists)."], HORIZON] },
        { do: "Tap the place buttons under the picture, from Liwa (in the south of the UAE) to Ras Al Khaimah (in the north). Watch how high Suhail is in each place.",
          why: "Suhail is a southern star, so the further south you are, the higher it climbs. It is the same idea as Polaris in Mission 2, but for the southern sky: the sky you see depends on where you are on Earth.",
          legend: [[SW.gold, "<b>The number next to Suhail</b> = its highest altitude from that place."], [SW.grid, "<b>Faint lines</b> = 10° and 20° above the horizon."]] },
        { do: "Now it is late August, just before sunrise. The orange glow is the dawn sky. Suhail is just rising, low in the south-south-east.",
          why: "The first mornings Suhail can be seen each year (around late August in the UAE) are traditionally the sign that the hottest part of summer is ending. Long before printed calendars, people used the stars to keep track of the seasons.",
          legend: [[SW.dawn, "<b>Orange glow</b> = dawn, just before sunrise."], [SW.gold, "<b>Suhail</b>, just above the horizon in the south-south-east."]] }
      ],
      quiz: {
        q: "Where in the UAE does Suhail climb highest?",
        options: ["Ras Al Khaimah, in the north", "Liwa, in the south", "It is the same height everywhere"],
        answer: 1,
        explain: "Suhail is a southern star, so the further south you are, the higher it rises. Liwa is the furthest south of these places."
      },
      tip: "<b>Try it outside:</b> Suhail is easiest to see on winter evenings in January and February, when it is at its highest in the south around 9–10 pm. Find a place with a clear, flat view to the south.",
      state: { lat: 24.5 },
      controls(s, render) {
        const wrap = document.createElement("div"); wrap.className = "btn-row";
        wrap.innerHTML = '<span class="ctrl-label">👆 Tap a place:</span>';
        [["Liwa (south)", 23.1], ["Abu Dhabi", 24.5], ["Dubai", 25.2], ["Ras Al Khaimah (north)", 25.8]].forEach(([n, lat]) => {
          const b = document.createElement("button"); b.className = "chip"; b.textContent = n;
          b.onclick = () => { const from = s.lat; s.lat = lat; tween(from, lat, 700, v => render(v)); };
          wrap.appendChild(b);
        });
        return [{ el: wrap, from: 1 }];
      },
      draw(g, step, s, latOverride) {
        const lat = latOverride ?? s.lat, hy = 300, k = 12;
        const alt = 90 - lat - 52.7;
        if (step === 2) {
          const defs = svgEl("defs", {}, g), lg = svgEl("linearGradient", { id: "dawn", x1: 0, y1: 1, x2: 0, y2: 0 }, defs);
          svgEl("stop", { offset: 0, "stop-color": "#ff9a5c", "stop-opacity": .45 }, lg);
          svgEl("stop", { offset: 1, "stop-color": "#ff9a5c", "stop-opacity": 0 }, lg);
          svgEl("rect", { x: 0, y: hy - 120, width: 600, height: 120, fill: "url(#dawn)" }, g);
          text(g, 300, 40, "Late August, just before sunrise", { fill: GOLD, "font-size": 15, "text-anchor": "middle", "font-family": "Orbitron" });
        }
        [10, 20].forEach(a => {
          svgEl("line", { x1: 40, y1: hy - a * k, x2: 560, y2: hy - a * k, stroke: "rgba(124,242,255,.18)" }, g);
          text(g, 44, hy - a * k - 4, `${a}° high (${a / 10} fist${a > 10 ? "s" : ""})`, { fill: "rgba(124,242,255,.65)", "font-size": 11 });
        });
        const x = step === 2 ? 240 : 300, y = step === 2 ? hy - 3 * k : hy - alt * k;
        star(g, x, y, -0.74, "", "#fff6dc");
        svgEl("circle", { cx: x, cy: y, r: 26, fill: "rgba(255,246,220,.15)" }, g);
        if (step === 0) ring(g, x, y, 18);
        text(g, x + 30, y + 5, step === 2 ? "Suhail, just rising" : `Suhail · ${alt.toFixed(1)}° high`, { fill: GOLD, "font-size": 15, "font-family": "Orbitron" });
        ground(g, hy, step === 2 ? [["SE", 120], ["SSE", 240], ["S", 300]] : [["SE", 60], ["S", 300], ["SW", 540]]);
        if (step === 0) {
          note(g, 360, 90, "the brightest star in this part of the sky", x + 4, y - 20);
          note(g, 380, 345, "you are facing due south", 300, 312);
        }
        if (step === 1) note(g, 360, 90, "further south = Suhail sits higher", x + 4, y - 20);
      }
    }
  ];

  // ---------- mission player ----------
  let m = null, step = 0, controls = [];
  function render(latOverride) {
    svg.innerHTML = "";
    const g = svgEl("g", {}, svg);
    m.draw(g, step, m.state, latOverride);
  }
  function showStep(i, animate = true) {
    step = i;
    const last = m.steps.length - 1, st = m.steps[i];
    el.num.textContent = `STEP ${i + 1} OF ${m.steps.length}`;
    el.text.textContent = st.do;
    el.why.textContent = st.why;
    el.legend.innerHTML = '<span class="m-label">What’s in the picture</span>' + st.legend.map(([sw, t]) => `<div class="lg-row">${sw}<span>${t}</span></div>`).join("");
    $$("i", el.dots).forEach((d, k) => { d.className = k === i ? "on" : k < i ? "past" : ""; });
    el.prev.disabled = i === 0;
    el.next.textContent = i === last ? "Now check yourself ↓" : "Next step →";
    controls.forEach(c => { c.el.hidden = i < c.from; });
    el.quiz.hidden = i !== last;
    render();
    if (m.enter) m.enter(i, m.state, render);
    if (animate) [el.text, el.why].forEach(e => e.animate([{ opacity: 0, transform: "translateX(10px)" }, { opacity: 1, transform: "none" }], { duration: 300 }));
  }
  function open(i) {
    m = missions[i];
    el.title.textContent = m.title;
    el.view.textContent = m.view;
    el.intro.textContent = m.intro;
    el.tip.innerHTML = m.tip;
    el.terms.innerHTML = ""; el.def.hidden = true;
    m.terms.forEach(([t, d]) => {
      const b = document.createElement("button");
      b.className = "term-chip"; b.textContent = t;
      b.onclick = () => {
        const on = !b.classList.contains("active");
        $$(".term-chip", el.terms).forEach(x => x.classList.remove("active"));
        b.classList.toggle("active", on);
        el.def.hidden = !on; el.def.innerHTML = `<b>${t}:</b> ${d}`;
      };
      el.terms.appendChild(b);
    });
    el.dots.innerHTML = m.steps.map(() => "<i></i>").join("");
    ctrl.innerHTML = "";
    controls = m.controls(m.state, render);
    controls.forEach(c => ctrl.appendChild(c.el));
    el.qText.textContent = m.quiz.q; el.qFb.textContent = "";
    el.qOpts.innerHTML = "";
    m.quiz.options.forEach((o, k) => {
      const b = document.createElement("button");
      b.className = "quiz-opt"; b.textContent = o;
      b.onclick = () => {
        const ok = k === m.quiz.answer;
        b.classList.add(ok ? "right" : "wrong");
        el.qFb.innerHTML = (ok ? "✅ <b>Correct!</b> " : "❌ <b>Not quite. Try another answer.</b> ") + (ok ? m.quiz.explain : "");
        if (ok) { done.add(i); refreshTabs(); }
      };
      el.qOpts.appendChild(b);
    });
    $$(".mission-tab", tabs).forEach((b, k) => b.classList.toggle("active", k === i));
    showStep(0, false);
    svg.animate([{ opacity: 0, transform: "scale(.97)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: "ease-out" });
  }
  function refreshTabs() { $$(".mission-tab", tabs).forEach((b, k) => b.classList.toggle("done", done.has(k))); }

  el.prev.onclick = () => step > 0 && showStep(step - 1);
  el.next.onclick = () => {
    if (step < m.steps.length - 1) showStep(step + 1);
    else { el.quiz.scrollIntoView({ behavior: "smooth", block: "center" }); el.quiz.animate([{ boxShadow: "0 0 0 0 rgba(255,207,122,.8)" }, { boxShadow: "0 0 0 14px rgba(255,207,122,0)" }], { duration: 900 }); }
  };
  missions.forEach((ms, i) => {
    const b = document.createElement("button");
    b.className = "mission-tab"; b.setAttribute("role", "tab");
    b.innerHTML = `<b>0${i + 1}</b> ${ms.name}`;
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
