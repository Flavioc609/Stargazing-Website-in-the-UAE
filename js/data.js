/* =========================================================
   DATA — constellations, stars, UAE locations, seasons
   Star positions: J2000 Right Ascension (hours) and
   Declination (degrees). Magnitude: lower = brighter.
   ========================================================= */

// Observing places used by the planisphere (latitude, longitude)
const PLACES = {
  abudhabi: { name: "Abu Dhabi", lat: 24.45, lon: 54.38 },
  dubai:    { name: "Dubai",     lat: 25.20, lon: 55.27 },
  alain:    { name: "Al Ain",    lat: 24.21, lon: 55.74 },
  jebeljais:{ name: "Jebel Jais (RAK)", lat: 25.94, lon: 56.13 },
  liwa:     { name: "Liwa Oasis", lat: 23.13, lon: 53.80 }
};

// Each star: [name, RA hours, Dec degrees, magnitude, colour (optional)]
// lines: chains of star indexes that are joined with lines
const CONSTELLATIONS = [
  {
    id: "orion", name: "Orion", arabic: "Al-Jabbār / Al-Jawzā’",
    stars: [
      ["Betelgeuse", 5.919, 7.41, 0.5, "#ffb37a"],
      ["Bellatrix", 5.419, 6.35, 1.64],
      ["Mintaka", 5.533, -0.30, 2.23],
      ["Alnilam", 5.604, -1.20, 1.69],
      ["Alnitak", 5.679, -1.94, 1.77],
      ["Saiph", 5.796, -9.67, 2.06],
      ["Rigel", 5.242, -8.20, 0.13, "#bcd4ff"],
      ["Meissa", 5.585, 9.93, 3.4]
    ],
    lines: [[7, 0, 4, 5], [7, 1, 2, 6], [2, 3, 4]],
    bestMonth: 0, best: "December – March (evenings)",
    where: "High in the south on winter evenings.",
    keyStars: "Betelgeuse (red supergiant), Rigel (blue-white supergiant), and the three belt stars Alnitak, Alnilam and Mintaka. Many of these names come from Arabic, e.g. Rigel from rijl, “foot”.",
    navigation: "Mintaka, the westernmost belt star, sits almost exactly on the celestial equator, so it rises close to due east and sets close to due west. The belt also points down-left to Sirius and up-right to Aldebaran.",
    fact: "The fuzzy patch in Orion’s sword is the Orion Nebula (M42), a star-forming cloud visible to the naked eye from a dark site."
  },
  {
    id: "ursamajor", name: "Ursa Major (Big Dipper)", arabic: "Banāt Na‘sh",
    stars: [
      ["Dubhe", 11.062, 61.75, 1.8, "#ffd9a8"],
      ["Merak", 11.031, 56.38, 2.37],
      ["Phecda", 11.897, 53.69, 2.44],
      ["Megrez", 12.257, 57.03, 3.31],
      ["Alioth", 12.900, 55.96, 1.77],
      ["Mizar", 13.399, 54.93, 2.27],
      ["Alkaid", 13.792, 49.31, 1.86]
    ],
    lines: [[0, 1, 2, 3, 0], [3, 4, 5, 6]],
    bestMonth: 3, best: "March – June (evenings)",
    where: "In the north. From the UAE it sits low over the northern horizon in autumn and winter evenings, and parts of it set for a while.",
    keyStars: "Dubhe and Merak (the “pointers”), Mizar and its faint companion Alcor.",
    navigation: "Draw a line from Merak through Dubhe and extend it about five times that distance to reach Polaris, the North Star. “Arc to Arcturus” by following the curve of the handle.",
    fact: "The Big Dipper is an asterism (a star pattern), not a full constellation. It is the brightest part of Ursa Major, the Great Bear."
  },
  {
    id: "ursaminor", name: "Ursa Minor (Polaris)", arabic: "Al-Jadī (Polaris)",
    stars: [
      ["Polaris", 2.530, 89.26, 1.98],
      ["Yildun", 17.537, 86.59, 4.35],
      ["Epsilon UMi", 16.766, 82.04, 4.2],
      ["Zeta UMi", 15.734, 77.79, 4.3],
      ["Kochab", 14.845, 74.16, 2.08, "#ffc68a"],
      ["Pherkad", 15.345, 71.83, 3.0],
      ["Eta UMi", 16.292, 75.76, 4.95]
    ],
    lines: [[0, 1, 2, 3, 4, 5, 6, 3]],
    bestMonth: 5, best: "All year (never sets from the UAE)",
    where: "Due north, about 24–26° above the horizon from the UAE.",
    keyStars: "Polaris, the North Star, at the end of the Little Dipper’s handle. Kochab and Pherkad are the “Guardians of the Pole”, known to Arab astronomers as al-Farqadān.",
    navigation: "Polaris stays almost fixed above the North Pole. Its height above the horizon is about equal to your latitude: roughly 24.5° in Abu Dhabi and 25.8° in Ras Al Khaimah.",
    fact: "Polaris is not the brightest star in the sky (it is about 48th). It is useful because it barely moves."
  },
  {
    id: "cassiopeia", name: "Cassiopeia", arabic: "Dhāt al-Kursī",
    stars: [
      ["Caph", 0.153, 59.15, 2.27],
      ["Schedar", 0.675, 56.54, 2.24, "#ffd2a0"],
      ["Navi", 0.945, 60.72, 2.15],
      ["Ruchbah", 1.430, 60.24, 2.68],
      ["Segin", 1.907, 63.67, 3.37]
    ],
    lines: [[0, 1, 2, 3, 4]],
    bestMonth: 10, best: "October – January (evenings)",
    where: "In the north, on the opposite side of Polaris from the Big Dipper.",
    keyStars: "Schedar (from Arabic ṣadr, “chest”), Caph and Navi.",
    navigation: "When the Big Dipper is low or hidden, the W of Cassiopeia is high. Both patterns circle Polaris, so either one can be used to find north.",
    fact: "The W shape turns into an M as it rotates around Polaris during the night."
  },
  {
    id: "scorpius", name: "Scorpius", arabic: "Al-‘Aqrab",
    stars: [
      ["Graffias", 16.091, -19.81, 2.62],
      ["Dschubba", 16.006, -22.62, 2.29],
      ["Pi Sco", 15.981, -26.11, 2.89],
      ["Sigma Sco", 16.353, -25.59, 2.9],
      ["Antares", 16.490, -26.43, 1.06, "#ff8a6a"],
      ["Tau Sco", 16.598, -28.22, 2.82],
      ["Epsilon Sco", 16.836, -34.29, 2.29],
      ["Mu Sco", 16.864, -38.05, 3.0],
      ["Zeta Sco", 16.910, -42.36, 3.6],
      ["Eta Sco", 17.203, -43.24, 3.33],
      ["Sargas", 17.622, -43.00, 1.86],
      ["Iota Sco", 17.793, -40.13, 3.0],
      ["Kappa Sco", 17.708, -39.03, 2.39],
      ["Shaula", 17.560, -37.10, 1.62]
    ],
    lines: [[0, 1, 2], [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]],
    bestMonth: 6, best: "June – August (evenings)",
    where: "Low in the south on summer evenings.",
    keyStars: "Antares, a red supergiant whose name means “rival of Mars”. Shaula comes from Arabic al-shawlah, the raised stinger.",
    navigation: "When Scorpius is at its highest it is due south, so it can be used to find south on summer nights.",
    fact: "From the UAE, Scorpius climbs higher than it does from Europe, which makes the whole curved tail easy to see."
  },
  {
    id: "leo", name: "Leo", arabic: "Al-Asad",
    stars: [
      ["Regulus", 10.139, 11.97, 1.35, "#cfe0ff"],
      ["Eta Leo", 10.122, 16.76, 3.5],
      ["Algieba", 10.333, 19.84, 2.08],
      ["Adhafera", 10.278, 23.42, 3.4],
      ["Rasalas", 9.879, 26.01, 3.9],
      ["Epsilon Leo", 9.764, 23.77, 2.98],
      ["Zosma", 11.235, 20.52, 2.56],
      ["Chertan", 11.237, 15.43, 3.33],
      ["Denebola", 11.818, 14.57, 2.13]
    ],
    lines: [[0, 1, 2, 3, 4, 5], [2, 6, 8, 7, 0], [6, 7]],
    bestMonth: 3, best: "March – May (evenings)",
    where: "High in the south-east to south on spring evenings.",
    keyStars: "Regulus, which lies almost on the ecliptic, and Denebola, from Arabic dhanab al-asad, “the lion’s tail”.",
    navigation: "The “Sickle” (a backwards question mark) forms the lion’s head and mane.",
    fact: "The Leonid meteor shower, which peaks around 17 November each year, appears to come from Leo."
  },
  {
    id: "cygnus", name: "Cygnus (Northern Cross)", arabic: "Al-Dajājah",
    stars: [
      ["Deneb", 20.690, 45.28, 1.25],
      ["Sadr", 20.370, 40.26, 2.23],
      ["Eta Cyg", 19.938, 35.08, 3.9],
      ["Albireo", 19.512, 27.96, 3.05, "#ffd08a"],
      ["Delta Cyg", 19.750, 45.13, 2.87],
      ["Gienah", 20.770, 33.97, 2.48],
      ["Zeta Cyg", 21.216, 30.23, 3.2]
    ],
    lines: [[0, 1, 2, 3], [4, 1, 5, 6]],
    bestMonth: 8, best: "July – October (evenings)",
    where: "High overhead to the north-east on summer and autumn evenings, along the Milky Way.",
    keyStars: "Deneb (from Arabic dhanab, “tail”), one corner of the Summer Triangle with Vega and Altair. Albireo is a colourful double star in a small telescope.",
    navigation: "The Summer Triangle (Deneb, Vega, Altair) is one of the easiest patterns to find from cities.",
    fact: "Deneb is one of the most luminous stars known, tens of thousands of times brighter than the Sun."
  },
  {
    id: "lyra", name: "Lyra", arabic: "Al-Nasr al-Wāqi‘",
    stars: [
      ["Vega", 18.616, 38.78, 0.03, "#dfe8ff"],
      ["Epsilon Lyr", 18.739, 39.67, 4.7],
      ["Zeta Lyr", 18.746, 37.61, 4.3],
      ["Delta Lyr", 18.908, 36.90, 4.3],
      ["Sulafat", 18.982, 32.69, 3.25],
      ["Sheliak", 18.835, 33.36, 3.5]
    ],
    lines: [[0, 1], [0, 2], [2, 3, 4, 5, 2]],
    bestMonth: 7, best: "June – September (evenings)",
    where: "High overhead on summer evenings.",
    keyStars: "Vega, the fifth-brightest star in the night sky. Its name comes from Arabic al-nasr al-wāqi‘, “the swooping eagle”.",
    navigation: "Vega is the brightest corner of the Summer Triangle.",
    fact: "Because Earth’s axis slowly wobbles (precession), Vega will be close to the north celestial pole again in about 12,000 years."
  },
  {
    id: "taurus", name: "Taurus", arabic: "Al-Thawr",
    stars: [
      ["Aldebaran", 4.599, 16.51, 0.85, "#ffb070"],
      ["Theta Tau", 4.478, 15.87, 3.4],
      ["Gamma Tau", 4.330, 15.63, 3.65],
      ["Delta Tau", 4.382, 17.54, 3.8],
      ["Epsilon Tau", 4.477, 19.18, 3.5],
      ["Elnath", 5.438, 28.61, 1.65],
      ["Zeta Tau", 5.627, 21.14, 3.0],
      ["Lambda Tau", 4.011, 12.49, 3.4],
      ["Pleiades", 3.791, 24.11, 2.87, "#cfe0ff"]
    ],
    lines: [[6, 0, 1, 2, 3, 4, 5], [2, 7]],
    bestMonth: 0, best: "November – February (evenings)",
    where: "High in the south on winter evenings, to the upper right of Orion.",
    keyStars: "Aldebaran (from Arabic al-dabarān, “the follower”, because it follows the Pleiades across the sky). The Pleiades cluster is al-Thurayyā.",
    navigation: "Follow Orion’s belt up and to the right to reach Aldebaran.",
    fact: "The rising of al-Thurayyā (the Pleiades) was used in traditional Arabian calendars to mark the seasons."
  },
  {
    id: "gemini", name: "Gemini", arabic: "Al-Tawʾamān",
    stars: [
      ["Castor", 7.577, 31.89, 1.58],
      ["Pollux", 7.755, 28.03, 1.14, "#ffd29a"],
      ["Mebsuta", 6.732, 25.13, 3.0],
      ["Tejat", 6.383, 22.51, 2.87],
      ["Wasat", 7.335, 21.98, 3.5],
      ["Alhena", 6.629, 16.40, 1.93]
    ],
    lines: [[0, 1], [0, 2, 3], [1, 4, 5]],
    bestMonth: 1, best: "January – April (evenings)",
    where: "High in the east to south on winter and spring evenings, to the upper left of Orion.",
    keyStars: "The twins Castor and Pollux.",
    navigation: "A line from Rigel through Betelgeuse points towards Castor and Pollux.",
    fact: "The Geminid meteor shower (peak around 13–14 December) is one of the strongest showers of the year."
  },
  {
    id: "canismajor", name: "Canis Major", arabic: "Al-Kalb al-Akbar",
    stars: [
      ["Sirius", 6.752, -16.72, -1.46, "#e6efff"],
      ["Mirzam", 6.378, -17.96, 1.98],
      ["Wezen", 7.140, -26.39, 1.83],
      ["Adhara", 6.977, -28.97, 1.5],
      ["Aludra", 7.402, -29.30, 2.45],
      ["Furud", 6.338, -30.06, 3.0]
    ],
    lines: [[1, 0, 2, 4], [2, 3, 5]],
    bestMonth: 1, best: "January – March (evenings)",
    where: "In the south-east to south on winter evenings, to the lower left of Orion.",
    keyStars: "Sirius, the brightest star in the night sky, known in Arabic as al-Shi‘rā.",
    navigation: "Follow Orion’s belt down and to the left to reach Sirius.",
    fact: "Sirius is only about 8.6 light-years away, one of the closest stars to the Sun."
  },
  {
    id: "crux", name: "Crux (Southern Cross)", arabic: "Al-Ṣalīb",
    stars: [
      ["Gacrux", 12.519, -57.11, 1.64, "#ffb98a"],
      ["Acrux", 12.443, -63.10, 0.76],
      ["Mimosa", 12.795, -59.69, 1.25],
      ["Delta Cru", 12.252, -58.75, 2.8]
    ],
    lines: [[0, 1], [2, 3]],
    bestMonth: 4, best: "April – May (late evening, very low)",
    where: "Just above the southern horizon. From the UAE, Acrux climbs only about 2–3° high, so you need a flat, dark southern horizon such as open desert.",
    keyStars: "Acrux, Mimosa and Gacrux.",
    navigation: "Extending the long bar from Gacrux through Acrux about 4.5 times points towards the south celestial pole. From the UAE that point is below the horizon, but the line still shows you roughly where south is.",
    fact: "Seeing the Southern Cross is a highlight for UAE stargazers, because it cannot be seen at all from most of Europe and North America."
  }
];

// Extra bright stars shown on the planisphere (not part of the 12 constellations)
const EXTRA_STARS = [
  ["Arcturus", 14.261, 19.18, -0.05, "#ffc27a"],
  ["Spica", 13.420, -11.16, 0.97, "#cfdcff"],
  ["Capella", 5.278, 46.00, 0.08, "#fff0c0"],
  ["Procyon", 7.655, 5.22, 0.34],
  ["Altair", 19.846, 8.87, 0.77],
  ["Fomalhaut", 22.961, -29.62, 1.16],
  ["Canopus (Suhail)", 6.399, -52.70, -0.74, "#fff6dc"],
  ["Achernar", 1.629, -57.24, 0.46, "#cfdcff"],
  ["Alpha Centauri", 14.660, -60.83, -0.27, "#fff0c0"],
  ["Hadar", 14.064, -60.37, 0.61, "#cfdcff"],
  ["Algol", 3.136, 40.96, 2.1],
  ["Mirfak", 3.405, 49.86, 1.8],
  ["Alpheratz", 0.140, 29.09, 2.06],
  ["Markab", 23.079, 15.21, 2.48],
  ["Scheat", 23.063, 28.08, 2.42],
  ["Algenib", 0.221, 15.18, 2.83],
  ["Rasalhague", 17.582, 12.56, 2.08],
  ["Alphard", 9.460, -8.66, 1.98, "#ffc890"],
  ["Nunki", 18.921, -26.30, 2.05],
  ["Kaus Australis", 18.403, -34.38, 1.85],
  ["Peacock", 20.427, -56.74, 1.94],
  ["Alnair", 22.137, -46.96, 1.74],
  ["Diphda", 0.727, -17.99, 2.04],
  ["Hamal", 2.120, 23.46, 2.0],
  ["Alphecca", 15.578, 26.71, 2.23],
  ["Menkar", 3.038, 4.09, 2.54],
  ["Suhail al-Wazn", 9.133, -43.43, 2.21],
  ["Avior", 8.375, -59.51, 1.86]
];

// Stargazing locations in the UAE.
// Darkness ratings are APPROXIMATE (Bortle scale, 1 = darkest, 9 = city centre)
// and should be checked against lightpollutionmap.info before publishing.
const LOCATIONS = [
  {
    name: "Liwa Oasis & Moreeb Dune", emirate: "Abu Dhabi", lat: 23.13, lon: 54.21,
    bortle: 2, drive: "≈ 2.5–3 h from Abu Dhabi city",
    elev: "≈ 100–300 m (dunes)",
    why: "On the edge of the Rub’ al Khali (Empty Quarter). Very little artificial light and a wide, flat horizon in every direction.",
    tips: "Best for the Milky Way and for spotting low southern objects like Canopus and the Southern Cross. Bring warm layers: desert nights get cold in winter."
  },
  {
    name: "Al Qudra Lakes", emirate: "Dubai", lat: 24.83, lon: 55.37,
    bortle: 4, drive: "≈ 45 min from central Dubai",
    elev: "≈ 70 m",
    why: "The closest well-known dark desert area to Dubai. The sky to the south is much darker than towards the city.",
    tips: "Look south and east, away from the Dubai sky glow. Good for beginners and families."
  },
  {
    name: "Jebel Jais", emirate: "Ras Al Khaimah", lat: 25.94, lon: 56.13,
    bortle: 3, drive: "≈ 2 h from Dubai",
    elev: "≈ 1,900 m (highest peak in the UAE)",
    why: "High altitude puts you above much of the dust and humidity near the ground, and temperatures are 10°C or more cooler than the coast.",
    tips: "The coast and RAK city add glow to the west. Look north-east and up. Check the weather: clouds can form around the summit."
  },
  {
    name: "Jebel Hafeet", emirate: "Abu Dhabi (Al Ain)", lat: 24.06, lon: 55.78,
    bortle: 4, drive: "≈ 30 min from Al Ain city",
    elev: "≈ 1,240 m",
    why: "A mountain rising out of the desert, giving a high viewpoint with open views to the south.",
    tips: "Al Ain’s lights are to the north, so the best views are towards the south and overhead."
  },
  {
    name: "Mleiha", emirate: "Sharjah", lat: 25.12, lon: 55.88,
    bortle: 4, drive: "≈ 1 h from Dubai or Sharjah",
    elev: "≈ 150 m",
    why: "Desert and rocky landscape inland, away from the coastal cities. The Mleiha Archaeological Centre runs organised stargazing nights.",
    tips: "A good choice for a first guided night with telescopes."
  },
  {
    name: "Hatta", emirate: "Dubai", lat: 24.80, lon: 56.12,
    bortle: 4, drive: "≈ 1.5 h from Dubai",
    elev: "≈ 300–600 m",
    why: "A mountain area in the Hajar Mountains with campsites and lower light pollution than the coast.",
    tips: "Mountains can block low parts of the sky, so pick an open spot."
  },
  {
    name: "Wadi Wurayah", emirate: "Fujairah", lat: 25.40, lon: 56.28,
    bortle: 3, drive: "≈ 2 h from Dubai",
    elev: "≈ 200–500 m",
    why: "A protected mountain area on the east side of the UAE, sheltered from most city lights.",
    tips: "Parts of the reserve have restricted access, so check the rules before visiting."
  }
];

// City sky-glow sources (for the light-pollution map layer)
const CITY_GLOW = [
  { name: "Dubai", lat: 25.20, lon: 55.27, r: 38000 },
  { name: "Abu Dhabi", lat: 24.47, lon: 54.37, r: 32000 },
  { name: "Sharjah", lat: 25.35, lon: 55.42, r: 24000 },
  { name: "Al Ain", lat: 24.21, lon: 55.74, r: 16000 },
  { name: "Ras Al Khaimah", lat: 25.79, lon: 55.94, r: 13000 },
  { name: "Fujairah", lat: 25.12, lon: 56.33, r: 10000 },
  { name: "Ruwais", lat: 24.11, lon: 52.73, r: 9000 }
];

// Bortle dark-sky scale
const BORTLE = [
  null,
  { name: "Excellent dark sky", limit: 7.8, uae: "Deep in the Empty Quarter, far from any road or settlement.", text: "The Milky Way casts shadows. Zodiacal light is obvious. Thousands of stars are visible." },
  { name: "Truly dark sky", limit: 7.2, uae: "Remote desert, e.g. south of Liwa.", text: "The Milky Way is highly structured. Clouds look like black holes in the sky." },
  { name: "Rural sky", limit: 6.7, uae: "Mountain sites such as Jebel Jais, away from the summit lights.", text: "Some light glow on the horizon, but the Milky Way still looks detailed." },
  { name: "Rural / suburban transition", limit: 6.2, uae: "Al Qudra, Mleiha, Hatta.", text: "Light domes are visible over towns. The Milky Way is visible but lacks detail." },
  { name: "Suburban sky", limit: 5.7, uae: "The edges of the cities.", text: "The Milky Way is weak or invisible near the horizon. Only bright constellations stand out." },
  { name: "Bright suburban sky", limit: 5.3, uae: "Residential areas outside city centres.", text: "The Milky Way is only visible near the zenith, if at all. The sky has a grey glow." },
  { name: "Suburban / urban transition", limit: 4.8, uae: "Most of Sharjah and Abu Dhabi island.", text: "The whole sky has a grey-white glow. The main constellation patterns are still recognisable." },
  { name: "City sky", limit: 4.3, uae: "Large parts of Dubai.", text: "The sky glows orange-grey. Only the brightest stars and planets are easy to see." },
  { name: "Inner-city sky", limit: 3.8, uae: "Downtown Dubai and Dubai Marina.", text: "Only the Moon, planets and a handful of the brightest stars are visible." }
];

// Monthly sky calendar (evening sky, around 21:00, from the UAE)
const MONTHS = [
  { m: "Jan", full: "January", rating: 5, cons: ["Orion", "Taurus", "Gemini", "Canis Major"], event: "Quadrantid meteors peak around 3–4 January.", weather: "Cool and usually clear. One of the best months, though fog can form near the coast." },
  { m: "Feb", full: "February", rating: 5, cons: ["Orion", "Gemini", "Canis Major", "Canopus (Suhail)"], event: "Canopus is well placed, low in the south.", weather: "Cool, clear nights. Occasional rain or cloud fronts." },
  { m: "Mar", full: "March", rating: 4, cons: ["Leo", "Gemini", "Ursa Major", "Orion (setting)"], event: "Around the March equinox, the Sun rises due east and sets due west.", weather: "Warming up. Windier, with more dust in the air." },
  { m: "Apr", full: "April", rating: 4, cons: ["Leo", "Ursa Major", "Crux (low south)"], event: "Lyrid meteors peak around 22 April. Best month to try for the Southern Cross.", weather: "Warm. Haze from dust is common." },
  { m: "May", full: "May", rating: 3, cons: ["Ursa Major", "Leo", "Crux (low south)", "Scorpius (rising)"], event: "The Milky Way core starts rising before midnight.", weather: "Hot. Humidity and haze rise near the coast." },
  { m: "Jun", full: "June", rating: 2, cons: ["Scorpius", "Lyra", "Ursa Major"], event: "Shortest nights of the year (summer solstice around 21 June).", weather: "Very hot and humid. Haze often hides faint stars; mountains help." },
  { m: "Jul", full: "July", rating: 2, cons: ["Scorpius", "Lyra", "Cygnus"], event: "The Milky Way core is high in the south in the evening.", weather: "Very hot and humid. Best from high sites like Jebel Jais." },
  { m: "Aug", full: "August", rating: 2, cons: ["Cygnus", "Lyra", "Scorpius"], event: "Perseid meteors peak around 12–13 August. Canopus (Suhail) first appears before dawn in late August.", weather: "Hottest and most humid month. In tradition, the rising of Suhail signals that the worst heat will soon end." },
  { m: "Sep", full: "September", rating: 3, cons: ["Cygnus", "Lyra", "Summer Triangle"], event: "Around the September equinox, the Sun again rises due east.", weather: "Still hot, humidity slowly drops." },
  { m: "Oct", full: "October", rating: 4, cons: ["Cassiopeia", "Cygnus", "Pegasus"], event: "Orionid meteors peak around 21 October.", weather: "Stargazing season begins. Nights become pleasant." },
  { m: "Nov", full: "November", rating: 5, cons: ["Cassiopeia", "Taurus", "Pleiades (al-Thurayyā)"], event: "Leonid meteors peak around 17 November.", weather: "Cool, dry and clear. Excellent conditions." },
  { m: "Dec", full: "December", rating: 5, cons: ["Orion", "Taurus", "Cassiopeia", "Gemini"], event: "Geminid meteors peak around 13–14 December, one of the best showers of the year.", weather: "Cool and clear. Peak camping and stargazing season." }
];

// Key terms for the "Celestial Coordinates" flip cards
const TERMS = [
  { t: "Celestial sphere", icon: "◯", d: "An imaginary sphere around Earth on which all stars appear to sit. Astronomers use it to describe positions, even though stars are at very different distances." },
  { t: "Declination (Dec)", icon: "↕", d: "The sky’s version of latitude. Measured in degrees north (+) or south (−) of the celestial equator. Polaris is at about +89°." },
  { t: "Right Ascension (RA)", icon: "↔", d: "The sky’s version of longitude. Measured in hours (0h–24h) eastwards along the celestial equator. Orion is around 5–6h." },
  { t: "Altitude", icon: "⦨", d: "How high an object is above your horizon, from 0° (on the horizon) to 90° (straight overhead). A fist at arm’s length covers about 10°." },
  { t: "Azimuth", icon: "🧭", d: "The compass direction of an object, measured from north (0°) through east (90°), south (180°) and west (270°)." },
  { t: "Zenith", icon: "⬆", d: "The point directly above your head (altitude 90°). It changes depending on where you stand." },
  { t: "Celestial equator", icon: "═", d: "Earth’s equator projected onto the sky (Dec 0°). From the UAE it arcs from due east, through the south, to due west." },
  { t: "Ecliptic", icon: "☉", d: "The yearly path of the Sun across the sky. The Moon and planets always stay close to it, passing through the zodiac constellations." }
];

// Astronomy tools and apps
const TOOLS = [
  { name: "Stellarium", type: "Free · Desktop, Web, Mobile", icon: "🌌", d: "A full planetarium that shows the real sky for any place and time. Good for planning a night and checking star positions.", use: "Planning & identification" },
  { name: "Star Walk 2", type: "Mobile", icon: "📱", d: "Point your phone at the sky and the app labels stars, planets and constellations using the phone’s sensors.", use: "Identification on site" },
  { name: "SkySafari", type: "Mobile", icon: "🔭", d: "A detailed star chart app with large star and deep-sky databases. Can control some telescopes.", use: "Telescope use" },
  { name: "Sky Tonight", type: "Free · Mobile", icon: "🌙", d: "Shows what is visible tonight, with event alerts for meteor showers, eclipses and planets.", use: "Events & planning" },
  { name: "Light Pollution Map", type: "Free · Web", icon: "💡", d: "lightpollutionmap.info shows satellite light-pollution data and Bortle estimates. Useful for picking dark sites in the UAE.", use: "Choosing locations" },
  { name: "Clear Outside", type: "Free · Web, Mobile", icon: "☁️", d: "An hour-by-hour astronomy weather forecast: cloud layers, humidity, Moon phase and seeing.", use: "Weather" }
];
