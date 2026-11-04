/* =========================================================
   MAIN — page navigation, hero, sky explorer controls
   ========================================================= */
(() => {
  const sections = $$(".section");

  /* ---------- tabs: one section on screen at a time ---------- */
  const tabbar = $("#tabbar"), view = $("#view");
  const tabs = sections.map(s => {
    const b = document.createElement("button");
    b.className = "tab"; b.setAttribute("role", "tab");
    b.innerHTML = `<span class="tab-ic">${s.dataset.icon}</span>${s.dataset.title}`;
    b.onclick = () => showTab(s.id);
    tabbar.appendChild(b);
    return b;
  });
  function showTab(id) {
    const i = Math.max(0, sections.findIndex(s => s.id === id));
    sections.forEach((s, k) => s.classList.toggle("active", k === i));
    tabs.forEach((t, k) => { t.classList.toggle("active", k === i); t.setAttribute("aria-selected", k === i); });
    tabs[i].scrollIntoView({ block: "nearest", inline: "center" });
    view.scrollTop = 0;
    // replay the entrance animation for the section that just opened
    const rv = $$(".reveal", sections[i]);
    rv.forEach(el => el.classList.remove("in"));
    requestAnimationFrame(() => rv.forEach((el, k) => setTimeout(() => el.classList.add("in"), 60 * k)));
    // canvases measure their size, so let them re-measure now that the section is visible
    dispatchEvent(new Event("resize"));
    history.replaceState(null, "", "#" + sections[i].id);
  }
  window.showTab = showTab;
  showTab((location.hash || "#home").slice(1));

  /* ---------- hero launch ---------- */
  $("#launch").onclick = e => {
    e.currentTarget.classList.add("go");
    Space.warp(1300);
    setTimeout(() => showTab("sky"), 700);
    setTimeout(() => $("#launch").classList.remove("go"), 2000);
  };

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
  const timeIn = $("#timeIn"), timeOut = $("#timeOut");
  const pad = n => String(n).padStart(2, "0");

  // Step 1: place (UAE stargazing sites, or custom coordinates)
  const placeGrid = $("#placeGrid");
  const placeBtns = LOCATIONS.map((l, i) => {
    const b = document.createElement("button");
    b.className = "place-card";
    b.innerHTML = `<strong>${l.name}</strong><small>${l.emirate}</small><span>${l.lat.toFixed(2)}°N · ${l.lon.toFixed(2)}°E</span>`;
    b.onclick = () => pickPlace({ name: l.name, lat: l.lat, lon: l.lon }, i);
    placeGrid.appendChild(b);
    return b;
  });
  const bortleColor = b => `hsl(${130 - (b - 1) * 16}, 80%, 55%)`;
  function pickPlace(place, index) {
    Sky.setPlace(place);
    placeBtns.forEach((b, k) => b.classList.toggle("active", k === index));
    const info = $("#placeInfo"), l = LOCATIONS[index];
    info.innerHTML = l ? `
      <div class="pi-head"><strong>${l.name}</strong>
        <span class="bortle-pill" style="color:${bortleColor(l.bortle)};border-color:${bortleColor(l.bortle)}">Darkness: Bortle ≈ ${l.bortle}</span></div>
      <p>${l.why}</p>
      <p><b>Elevation:</b> ${l.elev} · <b>Getting there:</b> ${l.drive}</p>
      <p><b>Tip:</b> ${l.tips}</p>
      <p class="small">Bortle scale: 1 = darkest sky, 9 = city centre (see the Light Pollution tab). Ratings are approximate.</p>`
      : `<p>Custom location: ${place.lat.toFixed(2)}°N, ${place.lon.toFixed(2)}°E.</p>`;
    info.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
  }
  $("#coordBtn").onclick = () => {
    const lat = parseFloat($("#latIn").value), lon = parseFloat($("#lonIn").value), msg = $("#coordMsg");
    if (!(lat >= 22.6 && lat <= 26.1 && lon >= 51.5 && lon <= 56.4)) {
      msg.textContent = "Those coordinates are outside the UAE. Use latitude 22.6–26.1 °N and longitude 51.5–56.4 °E.";
      msg.style.color = "#ff9c9c";
      return;
    }
    msg.textContent = "Showing the sky from your coordinates."; msg.style.color = "";
    pickPlace({ name: "Custom location", lat, lon }, -1);
  };

  // Step 2: month
  const monthGrid = $("#monthGrid");
  const monthBtns = MONTHS.map((m, i) => {
    const b = document.createElement("button");
    b.className = "month-btn";
    b.innerHTML = `${m.m}<i>${"★".repeat(m.rating)}</i>`;
    b.title = `${m.full}: ${m.weather}`;
    b.onclick = () => {
      const y = Sky.uaeParts(Sky.state.ms).y;
      Sky.setTime(Sky.fromUae(y, i, 15, +timeIn.value));
    };
    monthGrid.appendChild(b);
    return b;
  });

  // Step 3: time of night
  timeIn.oninput = () => {
    const p = Sky.uaeParts(Sky.state.ms);
    Sky.setTime(Sky.fromUae(p.y, p.m, p.d, +timeIn.value));
  };

  // Summary: what this place and month mean for the sky
  function syncInputs(ms) {
    const p = Sky.uaeParts(ms), place = Sky.state.place;
    timeIn.value = p.h * 60 + p.min;
    timeOut.textContent = `${pad(p.h)}:${pad(p.min)}`;
    monthBtns.forEach((b, i) => b.classList.toggle("active", i === p.m));
    $("#skyClock").textContent = `${p.d} ${MONTHS[p.m].full} · ${pad(p.h)}:${pad(p.min)} UAE`;
    $("#skyPlace").textContent = `${place.name} · ${place.lat.toFixed(2)}°N ${place.lon.toFixed(2)}°E`;

    const up = CONSTELLATIONS.filter(c => Sky.visibility(c).alt > 0).length;
    const polaris = place.lat, suhail = 90 - place.lat - 52.70, acrux = 90 - place.lat - 63.10;
    const m = MONTHS[p.m];
    $("#sumMain").innerHTML = `Sky from <strong>${place.name}</strong> (${place.lat.toFixed(2)}°N, ${place.lon.toFixed(2)}°E) on <strong>${p.d} ${m.full}</strong> at <strong>${pad(p.h)}:${pad(p.min)}</strong>`;
    $("#sumFacts").innerHTML = `
      <span><b>${up}</b> of ${CONSTELLATIONS.length} featured constellations above the horizon</span>
      <span>Polaris: <b>${polaris.toFixed(1)}°</b> above due north</span>
      <span>Suhail (Canopus) can reach <b>${suhail.toFixed(1)}°</b> high</span>
      <span>Acrux (Southern Cross) can reach <b>${acrux.toFixed(1)}°</b> high</span>
      <span>${m.full} conditions: <b>${"★".repeat(m.rating)}${"☆".repeat(5 - m.rating)}</b></span>`;
  }

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
    if (Sky.state.quiz) {
      Sky.quizStop(); quizBtn.classList.remove("active"); quizBtn.textContent = "🎯 Quiz mode";
      card.innerHTML = `<div class="info-empty"><div class="pulse-star">✶</div><p><b>Click a constellation</b> on the star map, or tap one of the names below the map, to learn about it here.</p></div>`;
    }
    else {
      Sky.quizStart(); quizBtn.classList.add("active"); quizBtn.textContent = "✖ End quiz";
      card.innerHTML = `<h3>🎯 Quiz mode</h3>
        <p><b>What to do:</b> the name of a constellation appears under the star map. Find its shape on the map and click it.</p>
        <p><b>Why:</b> names are hidden, so you have to recognise the star pattern itself, just like outside under the real sky.</p>
        <p><b>Stuck?</b> Press <b>💡 Hint</b> and the constellation lights up for 2 seconds. Get it wrong and the right answer flashes, then a new one appears.</p>
        <p>Press <b>✖ End quiz</b> to stop.</p>`;
    }
  };
  $("#hintBtn").onclick = () => Sky.hint();

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
  const DIRS = { N: "north", NNE: "north-north-east", NE: "north-east", ENE: "east-north-east", E: "east", ESE: "east-south-east", SE: "south-east", SSE: "south-south-east",
    S: "south", SSW: "south-south-west", SW: "south-west", WSW: "west-south-west", W: "west", WNW: "west-north-west", NW: "north-west", NNW: "north-north-west" };
  function badgeText(v) {
    if (v.alt <= 0) return "○ Not visible at this time (below the horizon). Press “Jump to best viewing time”.";
    const fists = Math.max(0.5, Math.round(v.alt / 10 * 2) / 2);
    return `● Visible now: look ${DIRS[v.dir]}, about ${Math.round(v.alt)}° up (≈ ${fists} fist${fists === 1 ? "" : "s"} above the horizon) for ${v.star}.`;
  }
  function renderInfo(c) {
    if (!c) return;
    const v = Sky.visibility(c);
    const up = v.alt > 0;
    card.innerHTML = `
      <h3>${c.name}</h3>
      <div class="ar">${c.arabic}</div>
      <span class="now-badge ${up ? "up" : "down"}">${badgeText(v)}</span>
      <dl>
        <dt>Best seen from the UAE</dt><dd>${c.best}</dd>
        <dt>Where to look</dt><dd>${c.where}</dd>
        <dt>Key stars</dt><dd>${c.keyStars}</dd>
        <dt>How it helps you navigate</dt><dd>${c.navigation}</dd>
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
          badge.textContent = badgeText(v);
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

  // start at Al Qudra, 21:00 tonight (UAE time)
  const q = LOCATIONS.findIndex(l => l.name === "Al Qudra Lakes");
  pickPlace({ name: LOCATIONS[q].name, lat: LOCATIONS[q].lat, lon: LOCATIONS[q].lon }, q);
  const p = Sky.uaeParts(Date.now());
  Sky.setTime(Sky.fromUae(p.y, p.m, p.d, 21 * 60));
  addEventListener("load", () => Sky.resize());
})();
