# A Guide to Stargazing in the UAE

Interactive website for my MYP Personal Project. Plain HTML, CSS and JavaScript, so no build step is needed.

## Run it

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

Then go to http://localhost:8000.

## Sections

1. **Sky Explorer**: pick a stargazing location (or your own UAE coordinates), a month and a time first; the live all-sky star map then shows the sky for that place and date. You can drag it to change the time, click constellations for information, and use Quiz mode.
2. **Celestial Navigation**: five missions (find Polaris, Polaris = latitude, east/west with Orion, finding south, Suhail).
3. **Celestial Coordinates**: flip cards plus a draggable altitude/azimuth dome.
4. **UAE Map**: stargazing locations on a map, with a city light-glow layer.
5. **Light Pollution & Conditions**: Bortle-scale simulator plus UAE weather factors.
6. **Sky Calendar**: month wheel showing what is visible, events and conditions.
7. **Tools & Apps**
8. **Skills Rubric**: placeholder, to be filled in.
9. **About** and **Sources** (bibliography placeholder).

## Editing content

All text and data live in `js/data.js`: constellations, star positions, locations, months, terms and tools.
Location darkness (Bortle) values are approximate and should be checked against lightpollutionmap.info.

## Files

- `index.html`: page structure
- `css/style.css`: styles
- `js/data.js`: content and data
- `js/background.js`: animated starfield
- `js/planisphere.js`: the Sky Explorer star map
- `js/sections.js`: navigation missions, coordinates, map, light pollution, calendar, tools
- `js/main.js`: menus, scrolling effects, Sky Explorer controls
- `vendor/leaflet/`: Leaflet map library (BSD-2 licence)
