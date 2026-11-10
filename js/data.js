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
    bestMonth: 0, best: "December – March (evening)",
    where: "High in the south during winter evenings.",
    keyStars: "Betelgeuse (red supergiant), Rigel (blue-white supergiant), and Alnitak, Alnilam and Mintaka (the 3 stars that make up the belt). Many of the names come from Arabic. For example, Rigel comes from rijl, meaning “foot”.",
    navigation: "Mintaka (the westernmost star in the belt) is almost on the celestial equator. This means it rises close to due east and sets close to due west. The belt can be used to find Sirius by looking down to the left, and Aldebaran by looking up to the right.",
    fact: "The fuzzy patch in the sword of Orion is the Orion Nebula (M42). This is a star-forming cloud that can be seen with the naked eye from a dark location."
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
    bestMonth: 3, best: "March – June (evening)",
    where: "North. From the UAE it is low on the northern horizon during autumn and winter evenings, and parts of it set.",
    keyStars: "Dubhe and Merak (the pointers), and Mizar with its faint companion Alcor.",
    navigation: "Draw a line from Merak to Dubhe and extend it about 5 times. This will point to Polaris (the North Star). “Arc to Arcturus” by following the curve of the handle.",
    fact: "The Big Dipper is an asterism (a pattern of stars), not a full constellation. It is the brightest part of Ursa Major (the Great Bear)."
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
    bestMonth: 5, best: "All year (never sets)",
    where: "Due north. It should be 24–26° above the horizon.",
    keyStars: "Polaris (the North Star), at the end of the Little Dipper’s handle. Kochab and Pherkad (the Guardians of the Pole), known to Arab astronomers as al-Farqadān.",
    navigation: "Polaris stays almost fixed above the North Pole. Its height above the horizon is roughly the same as your latitude: around 24.5° in Abu Dhabi and around 25.8° in Ras Al Khaimah.",
    fact: "Polaris is not the brightest star in the sky; it is about the 48th brightest. It is helpful because it does not move much."
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
    bestMonth: 10, best: "October – January (evening)",
    where: "North, on the opposite side of Polaris from the Big Dipper.",
    keyStars: "Schedar (from Arabic ṣadr, meaning “chest”), Caph and Navi.",
    navigation: "When the Big Dipper is low or not visible, the W of Cassiopeia is high. Both can be used to find north, as they both circle around Polaris.",
    fact: "The W shape turns into an M as it circles around Polaris during the night."
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
    bestMonth: 6, best: "June – August (evening)",
    where: "Low in the south during summer evenings.",
    keyStars: "Antares (red supergiant), whose name means “rival of Mars”. Shaula (from Arabic al-shawlah, meaning “raised stinger”).",
    navigation: "When Scorpius is at its highest, it is due south. It can be used to find south during summer.",
    fact: "Scorpius rises higher from the UAE than from Europe. This makes the whole curved tail easy to see."
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
    bestMonth: 3, best: "March – May (evening)",
    where: "High in the south-east to south during spring evenings.",
    keyStars: "Regulus (almost on the ecliptic) and Denebola (from Arabic dhanab al-asad, meaning “the lion’s tail”).",
    navigation: "The Sickle (a backwards question mark) forms the head and mane of the lion.",
    fact: "The Leonid meteor shower appears to come from Leo. It peaks around 17 November each year."
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
    bestMonth: 8, best: "July – October (evening)",
    where: "High above in the north-east during summer and autumn evenings, along the Milky Way.",
    keyStars: "Deneb (from Arabic dhanab, meaning “tail”), one corner of the Summer Triangle (with Vega and Altair). Albireo is a colourful double star that can be seen in a small telescope.",
    navigation: "The Summer Triangle (Deneb, Vega and Altair) is one of the easiest star patterns to find from cities.",
    fact: "Deneb is one of the most luminous stars known. It is tens of thousands of times brighter than our Sun."
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
    bestMonth: 7, best: "June – September (evening)",
    where: "High above during summer evenings.",
    keyStars: "Vega (the 5th brightest star in the night sky). Its name comes from Arabic al-nasr al-wāqi‘, meaning “the swooping eagle”.",
    navigation: "Vega is the brightest corner of the Summer Triangle.",
    fact: "Vega will be close to the north celestial pole again in about 12,000 years, because Earth’s axis slowly wobbles (precession)."
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
    bestMonth: 0, best: "November – February (evening)",
    where: "High in the south during winter evenings, to the upper right of Orion.",
    keyStars: "Aldebaran (from Arabic al-dabarān, meaning “the follower”, as it follows the Pleiades across the sky) and the Pleiades cluster (al-Thurayyā).",
    navigation: "Follow the belt of Orion up and to the right to find Aldebaran.",
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
    bestMonth: 1, best: "January – April (evening)",
    where: "High in the east to south during winter and spring evenings, to the upper left of Orion.",
    keyStars: "Castor and Pollux (the twins).",
    navigation: "Draw a line from Rigel through Betelgeuse. It will point to Castor and Pollux.",
    fact: "The Geminid meteor shower is one of the strongest of the year. It peaks around 13–14 December."
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
    bestMonth: 1, best: "January – March (evening)",
    where: "South-east to south during winter evenings, to the lower left of Orion.",
    keyStars: "Sirius (the brightest star in the night sky), from Arabic al-Shi‘rā.",
    navigation: "Follow the belt of Orion down and to the left to find Sirius.",
    fact: "Sirius is only about 8.6 light-years away, one of the closest stars to our Sun."
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
    where: "Just above the southern horizon. From the UAE, Acrux only rises about 2–3° high, so you will need a flat, dark horizon to the south, like open desert.",
    keyStars: "Acrux, Mimosa and Gacrux.",
    navigation: "Draw a line from Gacrux through Acrux and extend it about 4.5 times. This points to the south celestial pole. From the UAE that point is below the horizon, but the line still gives you a general idea of where south is.",
    fact: "Seeing the Southern Cross is a highlight for UAE stargazers, as it cannot be seen at all from most of Europe and North America."
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
    bortle: 2, drive: "~2.5–3 hours from Abu Dhabi",
    elev: "~100–300 m (dunes)",
    why: "Located on the edge of the Rub’ al Khali (Empty Quarter). Minimal artificial light and a very large, flat horizon.",
    tips: "Best for viewing the Milky Way. Good for seeing low southern objects like Canopus and the Southern Cross. Bring warm layers, as the desert can get cold at night in winter."
  },
  {
    name: "Al Qudra Lakes", emirate: "Dubai", lat: 24.83, lon: 55.37,
    bortle: 4, drive: "~45–60 minutes from central Dubai",
    elev: "~70 m",
    why: "The closest well-known dark area of desert to Dubai. The sky to the south is much darker than towards the city.",
    tips: "Look to the south and east to avoid the city light. Great for beginners and families."
  },
  {
    name: "Jebel Jais", emirate: "Ras Al Khaimah", lat: 25.94, lon: 56.13,
    bortle: 3, drive: "~2 hours from Dubai",
    elev: "~1,900 m (the highest mountains in the UAE; the true summit is just over the border in Oman)",
    why: "The high elevation means you will be above a lot of the dust and humidity. Temperatures are 10 °C or more cooler than on the coast.",
    tips: "Light pollution comes from the coast and RAK city, so look north-east and high up. The weather can be an issue, as clouds can form around the summit."
  },
  {
    name: "Jebel Hafeet", emirate: "Abu Dhabi (Al Ain)", lat: 24.06, lon: 55.78,
    bortle: 4, drive: "~30 minutes from Al Ain",
    elev: "~1,250 m (the highest peak in Abu Dhabi)",
    why: "A mountain rising out of the desert. It is a high vantage point with clear views to the south.",
    tips: "The lights of Al Ain are to the north, so the best views are to the south and overhead."
  },
  {
    name: "Mleiha", emirate: "Sharjah", lat: 25.12, lon: 55.88,
    bortle: 4, drive: "~1 hour from Dubai or Sharjah",
    elev: "~150 m",
    why: "A desert and rocky area away from the coastal cities. Organised stargazing nights are held at the Mleiha Archaeological Centre.",
    tips: "Good for a first guided stargazing night."
  },
  {
    name: "Hatta", emirate: "Dubai", lat: 24.80, lon: 56.12,
    bortle: 4, drive: "~1.5 hours from Dubai",
    elev: "~300–600 m",
    why: "A mountain area in the Hajar Mountains. Campsites are available, and there is less light pollution than on the coast.",
    tips: "Mountains may block some of the sky near the horizon, so choose an open area."
  },
  {
    name: "Wadi Wurayah", emirate: "Fujairah", lat: 25.40, lon: 56.28,
    bortle: 3, drive: "~2 hours from Dubai",
    elev: "~200–500 m",
    why: "A protected mountain area on the east side of the UAE, sheltered from most city light.",
    tips: "Some parts of the reserve are restricted, so please check the rules before visiting."
  }
];

// Bortle dark-sky scale
const BORTLE = [
  null,
  { name: "Excellent dark sky", limit: 7.8, uae: "Deep in the Empty Quarter, far from any roads or settlements.", text: "The darkest sky possible. Thousands of stars are visible, and the Milky Way is so bright it creates faint shadows on the ground." },
  { name: "Truly dark sky", limit: 7.2, uae: "Remote desert (e.g. south of Liwa).", text: "Very dark. The Milky Way is very detailed, with dark streaks of dust. Clouds look black." },
  { name: "Rural sky", limit: 6.7, uae: "Mountain locations (e.g. Jebel Jais), away from the lights on the summit.", text: "Dark, with some glow from towns on the horizon. The Milky Way is still bright and easy to see." },
  { name: "Rural / suburban sky", limit: 6.2, uae: "Al Qudra, Mleiha, Hatta.", text: "Domes of light glow over nearby towns. The Milky Way is visible but faint and washed out." },
  { name: "Suburban sky", limit: 5.7, uae: "The edges of the cities.", text: "The Milky Way is very faint and not visible near the horizon. Only the brightest constellations stand out." },
  { name: "Bright suburban sky", limit: 5.5, uae: "Residential areas outside city centres.", text: "The sky glows a greyish colour. The Milky Way is hard or impossible to see, but the main constellation shapes are still visible." },
  { name: "Suburban / urban sky", limit: 5.0, uae: "Most of Sharjah and Abu Dhabi Island.", text: "The entire sky glows a greyish white. The main constellation shapes are still visible, but there are not many faint stars." },
  { name: "City sky", limit: 4.5, uae: "Large areas of Dubai.", text: "The sky glows an orange-grey colour. Only the brightest stars and planets are easy to see." },
  { name: "Inner-city sky", limit: 4.0, uae: "Downtown Dubai and Dubai Marina.", text: "Only the Moon, the planets and a few of the brightest stars are visible." }
];

// Monthly sky calendar (evening sky, around 21:00, from the UAE)
const MONTHS = [
  { m: "Jan", full: "January", rating: 5, cons: ["Orion", "Taurus", "Gemini", "Canis Major"], event: "Quadrantid meteors peak around 3–4 January.", weather: "Cool and typically clear. One of the best months to stargaze, although fog can form near the coast." },
  { m: "Feb", full: "February", rating: 5, cons: ["Orion", "Gemini", "Canis Major", "Canopus (Suhail)"], event: "Canopus is well positioned, low in the south.", weather: "Cool, clear nights. Occasional rain or cloud fronts." },
  { m: "Mar", full: "March", rating: 4, cons: ["Leo", "Gemini", "Ursa Major", "Orion (setting)"], event: "During the March equinox, the Sun rises due east and sets due west.", weather: "Getting warmer. Windier and more dusty." },
  { m: "Apr", full: "April", rating: 4, cons: ["Leo", "Ursa Major", "Crux (low south)"], event: "Lyrid meteors peak around 22 April. The best month to try to see the Southern Cross.", weather: "Warm. Dust haze is common." },
  { m: "May", full: "May", rating: 3, cons: ["Ursa Major", "Leo", "Crux (low south)", "Scorpius (rising)"], event: "The core of the Milky Way begins to rise before midnight.", weather: "Hot. Increasing humidity and dust haze near the coast." },
  { m: "Jun", full: "June", rating: 2, cons: ["Scorpius", "Lyra", "Ursa Major"], event: "The shortest nights of the year (summer solstice around 21 June).", weather: "Very hot and humid. Dust haze often hides the fainter stars; mountains help." },
  { m: "Jul", full: "July", rating: 2, cons: ["Scorpius", "Lyra", "Cygnus"], event: "The core of the Milky Way is high in the south during the evening.", weather: "Very hot and humid. Best from higher areas such as Jebel Jais." },
  { m: "Aug", full: "August", rating: 2, cons: ["Cygnus", "Lyra", "Scorpius"], event: "Perseid meteors peak around 12–13 August. Canopus (Suhail) first appears before dawn in late August.", weather: "The hottest and most humid month. Traditionally, the rising of Suhail means that the worst heat will soon pass." },
  { m: "Sep", full: "September", rating: 3, cons: ["Cygnus", "Lyra", "Summer Triangle"], event: "During the September equinox, the Sun again rises due east.", weather: "Still hot. Humidity begins to decrease." },
  { m: "Oct", full: "October", rating: 4, cons: ["Cassiopeia", "Cygnus", "Pegasus"], event: "Orionid meteors peak around 21 October.", weather: "Stargazing season begins. Pleasant nights." },
  { m: "Nov", full: "November", rating: 5, cons: ["Cassiopeia", "Taurus", "Pleiades (al-Thurayyā)"], event: "Leonid meteors peak around 17 November.", weather: "Cool, dry and clear. Perfect conditions." },
  { m: "Dec", full: "December", rating: 5, cons: ["Orion", "Taurus", "Cassiopeia", "Gemini"], event: "Geminid meteors peak around 13–14 December, one of the best showers of the year.", weather: "Cool and clear. Peak camping and stargazing season." }
];

// Key terms for the "Celestial Coordinates" flip cards
const TERMS = [
  { t: "Celestial sphere", icon: "◯", d: "Imagine the whole sky as a huge ball around Earth, with all the stars stuck to the inside. This imaginary ball is called the celestial sphere. The stars are really at very different distances, but this idea makes them easy to locate." },
  { t: "Declination (Dec)", icon: "↕", d: "Tells you how far north or south a star is in the sky, like latitude on Earth. Measured in degrees: positive is north of the celestial equator and negative is south. Polaris is at around +89 degrees, almost at the celestial pole." },
  { t: "Right Ascension (RA)", icon: "↔", d: "Tells you how far east or west a star is in the sky, like longitude on Earth. Measured in hours (between 0h and 24h), as the sky turns once a day. Orion is at around 5–6h." },
  { t: "Altitude", icon: "⦨", d: "Tells you how high something is above the horizon: 0 degrees = horizon, 90 degrees = directly overhead. A quick way to measure it is with your fist, which covers around 10 degrees at arm’s length." },
  { t: "Azimuth", icon: "🧭", d: "Tells you which direction to face to see something. North = 0 degrees, east = 90 degrees, south = 180 degrees, west = 270 degrees." },
  { t: "Zenith", icon: "⬆", d: "The point directly above your head (90 degrees altitude). Everyone has their own zenith." },
  { t: "Celestial equator", icon: "═", d: "An imaginary line in the sky directly above Earth’s equator (0 degrees declination). From the UAE it runs from due east, up through the southern sky, to due west." },
  { t: "Ecliptic", icon: "☉", d: "The path the Sun appears to take across the sky during the year. The Moon and planets always stay close to this line, so this is where you will find the planets." }
];

// Astronomy tools and apps
const TOOLS = [
  { name: "Stellarium", type: "Free", icon: "🌌", d: "A complete planetarium showing the real night sky wherever you are. Great for planning your night and knowing where stars are.", use: "Planning & identifying" },
  { name: "Star Walk 2", type: "Mobile", icon: "📱", d: "Point your phone at the sky and the app uses your phone’s sensors to identify stars, planets and constellations.", use: "Identifying" },
  { name: "SkySafari", type: "Mobile", icon: "🔭", d: "A detailed star chart app with large star and deep-sky databases. It can control some telescopes.", use: "Telescopes" },
  { name: "Sky Tonight", type: "Free", icon: "🌙", d: "Shows you what you can see tonight, with alerts for events such as meteor showers, eclipses and planets.", use: "Events & planning" },
  { name: "Light Pollution Map", type: "Free", icon: "💡", d: "lightpollutionmap.info shows light pollution data from satellites and Bortle estimates. Useful for finding dark areas within the UAE.", use: "Finding locations" },
  { name: "Clear Outside", type: "Free", icon: "☁️", d: "An hourly astronomy weather forecast showing cloud layers, humidity, Moon phase and seeing.", use: "Weather" }
];

// Works cited (MLA 9th edition), shown in the Sources section.
// "used" says which facts on the site each source supports.
const SOURCES = [
  { cite: "Bakich, Michael E. “Michael’s Miscellany: Dark Adaption.” <i>Astronomy</i>, www.astronomy.com/observing/michaels-miscellany-dark-adaption.", url: "https://www.astronomy.com/observing/michaels-miscellany-dark-adaption", used: "How long eyes take to adapt to the dark; red light" },
  { cite: "Bortle, John E. “Gauging Light Pollution: The Bortle Dark-Sky Scale.” <i>Sky &amp; Telescope</i>, Feb. 2001, skyandtelescope.org/astronomy-resources/light-pollution-and-astronomy-the-bortle-dark-sky-scale/.", url: "https://skyandtelescope.org/astronomy-resources/light-pollution-and-astronomy-the-bortle-dark-sky-scale/", used: "Bortle scale classes and faintest visible stars" },
  { cite: "“Computing Greenwich Apparent Sidereal Time.” <i>Astronomical Applications Department</i>, U.S. Naval Observatory, aa.usno.navy.mil/faq/GAST.", url: "https://aa.usno.navy.mil/faq/GAST", used: "Sidereal time formula used by the Sky Explorer star map" },
  { cite: "“Constellation Names and Abbreviations.” <i>Sky &amp; Telescope</i>, skyandtelescope.org/astronomy-resources/constellation-names-and-abbreviations/.", url: "https://skyandtelescope.org/astronomy-resources/constellation-names-and-abbreviations/", used: "Official constellation names" },
  { cite: "Falchi, Fabio, et al. “The New World Atlas of Artificial Night Sky Brightness.” <i>Science Advances</i>, vol. 2, no. 6, 2016, e1600377, https://doi.org/10.1126/sciadv.1600377.", url: "https://doi.org/10.1126/sciadv.1600377", used: "How light pollution hides the stars and the Milky Way" },
  { cite: "“Helping Establish the Wadi Wurayah National Park.” <i>Emirates Nature–WWF</i>, emiratesnaturewwf.ae/page/helping-establish-the-wadi-wurayah-national-park.", url: "https://emiratesnaturewwf.ae/page/helping-establish-the-wadi-wurayah-national-park", used: "Wadi Wurayah as a protected mountain area in Fujairah" },
  { cite: "IAU Working Group on Star Names. “IAU Catalog of Star Names.” <i>International Astronomical Union</i>, exopla.net.", url: "https://exopla.net", used: "Official star names" },
  { cite: "“Intense Summer Heat to Begin in UAE as Pleiades Star Rises on June 7.” <i>Khaleej Times</i>, www.khaleejtimes.com/uae/weather/uae-intense-summer-heat-begin-pleiades-star.", url: "https://www.khaleejtimes.com/uae/weather/uae-intense-summer-heat-begin-pleiades-star", used: "Al-Thurayyā (the Pleiades) as a seasonal marker in the UAE" },
  { cite: "Kunitzsch, Paul, and Tim Smart. <i>A Dictionary of Modern Star Names: A Short Guide to 254 Star Names and Their Derivations</i>. Sky Publishing, 2006.", url: "", used: "Arabic origins of star names (Rigel, Aldebaran, Deneb, Vega, Shaula, etc.)" },
  { cite: "“Mars Faces Off with Its Night Sky Rival, Antares.” <i>Astronomy</i>, www.astronomy.com/observing/mars-faces-off-with-its-night-sky-rival-antares/.", url: "https://www.astronomy.com/observing/mars-faces-off-with-its-night-sky-rival-antares/", used: "Meaning of the name Antares" },
  { cite: "“Measuring the Sky by Hand.” <i>Time and Date</i>, www.timeanddate.com/astronomy/measuring-the-sky-by-hand.html.", url: "https://www.timeanddate.com/astronomy/measuring-the-sky-by-hand.html", used: "A fist at arm’s length covers about 10°" },
  { cite: "Meeus, Jean. <i>Astronomical Algorithms</i>. 2nd ed., Willmann-Bell, 1998.", url: "", used: "Formulas for converting star positions to altitude and azimuth" },
  { cite: "“Meteor Shower Calendar 2026-2027.” <i>American Meteor Society</i>, www.amsmeteors.org/meteor-showers/meteor-shower-calendar/.", url: "https://www.amsmeteors.org/meteor-showers/meteor-shower-calendar/", used: "Meteor shower peak dates" },
  { cite: "“Mleiha Archaeological Ctr Launches Mobile Stargazing Experience.” <i>Sharjah24</i>, 8 July 2021, sharjah24.ae/en/Articles/2021/07/08/Mleiha-Archaeological-Ctr-launches-Mobile-Stargazing-Experience.", url: "https://sharjah24.ae/en/Articles/2021/07/08/Mleiha-Archaeological-Ctr-launches-Mobile-Stargazing-Experience", used: "Stargazing at Mleiha, Sharjah" },
  { cite: "“Orion’s Belt and the Celestial Bridge.” <i>EarthSky</i>, earthsky.org/tonight/orions-belt-and-the-celestial-bridge/.", url: "https://earthsky.org/tonight/orions-belt-and-the-celestial-bridge/", used: "Mintaka rises due east and sets due west" },
  { cite: "“6 Free Spots in the UAE to Watch Perseids Meteor Showers.” <i>Gulf News</i>, gulfnews.com/uae/6-free-spots-in-the-uae-to-watch-perseids-meteor-showers-1.500638627.", url: "https://gulfnews.com/uae/6-free-spots-in-the-uae-to-watch-perseids-meteor-showers-1.500638627", used: "Darker stargazing spots in the UAE, such as Al Qudra and Jebel Jais" },
  { cite: "“Suhail Star Rises August 24: UAE Calendar Signals Cooler Weather Ahead.” <i>Khaleej Times</i>, www.khaleejtimes.com/uae/weather/suhail-star-rises-august-24-uae-cooler-weather.", url: "https://www.khaleejtimes.com/uae/weather/suhail-star-rises-august-24-uae-cooler-weather", used: "Suhail (Canopus) rising in late August and its meaning for UAE summer" },
  { cite: "“UAE National Day: Five Top Activities to Do at Jebel Jais.” <i>Gulf News</i>, gulfnews.com/living-in-uae/ask-us/uae-national-day-five-top-activities-to-do-at-jebel-jais-1.1669900057295.", url: "https://gulfnews.com/living-in-uae/ask-us/uae-national-day-five-top-activities-to-do-at-jebel-jais-1.1669900057295", used: "Jebel Jais, Ras Al Khaimah: height and location" },
  { cite: "“Vega.” <i>Encyclopædia Britannica</i>, www.britannica.com/print/article/624530.", url: "https://www.britannica.com/print/article/624530", used: "Vega becoming a pole star again because of precession" },
  { cite: "Wenger, M., et al. “The SIMBAD Astronomical Database: The CDS Reference Database for Astronomical Objects.” <i>Astronomy and Astrophysics Supplement Series</i>, vol. 143, 2000, pp. 9–22, https://doi.org/10.1051/aas:2000332.", url: "https://simbad.cds.unistra.fr/simbad/", used: "Star positions, brightness (magnitude) and distances" },
  { cite: "“What Exactly Is the North Star?” <i>Scientific American</i>, www.scientificamerican.com/article/what-exactly-is-the-north/.", url: "https://www.scientificamerican.com/article/what-exactly-is-the-north/", used: "Polaris, the North Star, and why it marks north" },
  { cite: "“When Thuraya Rises.” <i>Star Calendar Blog</i>, University of Arizona, June 2017, onesky.arizona.edu/2017/06/when-thuraya-rises.", url: "https://onesky.arizona.edu/2017/06/when-thuraya-rises", used: "Traditional Arabian star calendars" },
  { cite: "“Winter Season Starts in UAE, with Cooler Weather, Varied Conditions: NCM.” <i>Emirates News Agency (WAM)</i>, www.wam.ae/en/article/15xmr4h-winter-season-starts-uae-with-cooler-weather.", url: "https://www.wam.ae/en/article/15xmr4h-winter-season-starts-uae-with-cooler-weather", used: "UAE winter weather, humidity and fog (National Center of Meteorology)" }
];

// Official websites of the tools listed in the Tools & Apps section
const TOOL_SOURCES = [
  { cite: "<i>Clear Outside</i>. First Light Optics, clearoutside.com.", url: "https://clearoutside.com" },
  { cite: "Stare, Jurij. <i>Light Pollution Map</i>. www.lightpollutionmap.info.", url: "https://www.lightpollutionmap.info" },
  { cite: "<i>SkySafari</i>. Simulation Curriculum, skysafariastronomy.com.", url: "https://skysafariastronomy.com" },
  { cite: "<i>Star Walk 2</i> and <i>Sky Tonight</i>. Vito Technology, starwalk.space.", url: "https://starwalk.space" },
  { cite: "<i>Stellarium</i>. Stellarium Astronomy Software, stellarium.org.", url: "https://stellarium.org" }
];
