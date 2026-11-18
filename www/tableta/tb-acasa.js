/* ================================================================
*  WEATHER + EXCHANGE RATES + CALENDAR  (custom:tb-acasa-card)
*  >>> Replace the "YOUR_..." entities in defaults() below (or pass them from the dashboard YAML):
*      weather, temp/hum (optional outdoor sensors), fx[] (one sensor per currency, state = rate), holidays + reminders calendars
* ================================================================ */
const WX_RO = {
"clear-night": "Senin", cloudy: "Înnorat", exceptional: "Vreme deosebită", fog: "Ceață", hail: "Grindină",
lightning: "Furtună", "lightning-rainy": "Furtună cu ploaie", partlycloudy: "Parțial noros", pouring: "Ploaie torențială",
rainy: "Ploaie", snowy: "Ninsoare", "snowy-rainy": "Lapoviță", sunny: "Însorit", windy: "Vânt", "windy-variant": "Vânt și nori",
};
const wxIcon = (c, night) =>
({
"clear-night": "mdi:weather-night", cloudy: "mdi:weather-cloudy", exceptional: "mdi:alert-circle-outline",
fog: "mdi:weather-fog", hail: "mdi:weather-hail", lightning: "mdi:weather-lightning",
"lightning-rainy": "mdi:weather-lightning-rainy", partlycloudy: night ? "mdi:weather-night-partly-cloudy" : "mdi:weather-partly-cloudy",
pouring: "mdi:weather-pouring", rainy: "mdi:weather-rainy", snowy: "mdi:weather-snowy", "snowy-rainy": "mdi:weather-snowy-rainy",
sunny: night ? "mdi:weather-night" : "mdi:weather-sunny", windy: "mdi:weather-windy", "windy-variant": "mdi:weather-windy-variant",
}[c] || "mdi:weather-cloudy");
const wxColor = (c, night) =>
({
sunny: night ? "#9fa8da" : "#ffb300", "clear-night": "#9fa8da", partlycloudy: night ? "#9fa8da" : "#ffca28",
cloudy: "#90a4ae", rainy: "#42a5f5", pouring: "#1e88e5", snowy: "#b3e5fc", "snowy-rainy": "#81d4fa",
lightning: "#fdd835", "lightning-rainy": "#fdd835", fog: "#b0bec5", hail: "#80deea", windy: "#80cbc4", "windy-variant": "#80cbc4",
}[c] || "#90a4ae");
const wxBg = (c, night) => {
if (night) {
if (["rainy", "pouring", "lightning", "lightning-rainy"].includes(c)) return "linear-gradient(140deg,#141e30,#243b55)";
return "linear-gradient(140deg,#0f2027,#203a43 55%,#2c5364)";
}
if (["rainy", "pouring"].includes(c)) return "linear-gradient(140deg,#3a4f66,#5c7a99)";
if (["lightning", "lightning-rainy"].includes(c)) return "linear-gradient(140deg,#232526,#414345)";
if (["snowy", "snowy-rainy", "hail"].includes(c)) return "linear-gradient(140deg,#6b8cbf,#a7c6e8)";
if (["cloudy", "fog", "windy", "windy-variant", "exceptional"].includes(c)) return "linear-gradient(140deg,#5b6f86,#8ea2b8)";
if (c === "partlycloudy") return "linear-gradient(140deg,#2f80ed,#56ccf2)";
return "linear-gradient(140deg,#1e7ae0,#36c2f4 60%,#7fd8f8)";
};
function wxScene(c, night) {
const cloud = (x, y, s, fill, dur, delay = 0, op = 1) =>
`<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}"><g class="cl" style="animation-duration:${dur}s;animation-delay:${delay}s">` +
`<rect x="-6" y="0" width="92" height="34" rx="17" fill="${fill}"/><circle cx="22" cy="2" r="22" fill="${fill}"/>` +
`<circle cx="50" cy="-8" r="30" fill="${fill}"/><circle cx="74" cy="8" r="18" fill="${fill}"/></g></g>`;
const sun = (x, y, r) => {
let rays = "";
for (let i = 0; i < 12; i++) {
const a = (i * Math.PI) / 6;
rays += `<line x1="${(Math.cos(a) * (r + 8)).toFixed(1)}" y1="${(Math.sin(a) * (r + 8)).toFixed(1)}" x2="${(Math.cos(a) * (r + 22)).toFixed(1)}" y2="${(Math.sin(a) * (r + 22)).toFixed(1)}"/>`;
}
return `<g transform="translate(${x} ${y})"><circle r="${r + 30}" fill="url(#wxHalo)" class="halo"/><g class="rays">${rays}</g><circle r="${r}" fill="url(#wxSun)"/></g>`;
};
const moon = (x, y) => {
let st = "";
const pos = [[-120, -30], [-80, 40], [-40, -50], [40, 55], [70, -40], [-150, 20], [110, 30], [-10, 70]];
pos.forEach((p, i) => (st += `<circle cx="${x + p[0]}" cy="${y + p[1]}" r="${i % 3 ? 1.6 : 2.4}" class="star" style="animation-delay:${(i * 0.37).toFixed(2)}s"/>`));
return `${st}<g transform="translate(${x} ${y})" class="moon"><circle r="46" fill="url(#wxHalo2)"/><path d="M8,-26 A26,26 0 1,0 8,26 A20,20 0 1,1 8,-26 Z" fill="#f4f1c9"/></g>`;
};
const rain = (n, x0, w, y0, heavy) => {
let s = "";
for (let i = 0; i < n; i++) {
const x = x0 + ((i * 37) % w);
s += `<line x1="${x}" y1="${y0}" x2="${x - 4}" y2="${y0 + (heavy ? 16 : 11)}" class="drop" style="animation-delay:${((i * 0.23) % 1.1).toFixed(2)}s;animation-duration:${heavy ? 0.6 : 0.95}s"/>`;
}
return s;
};
const snow = (n, x0, w, y0) => {
let s = "";
for (let i = 0; i < n; i++) {
const x = x0 + ((i * 29) % w);
s += `<circle cx="${x}" cy="${y0}" r="${i % 2 ? 2.4 : 3.2}" class="flake" style="animation-delay:${((i * 0.41) % 3).toFixed(2)}s"/>`;
}
return s;
};
const bolt = (x, y) => `<polygon points="${x},${y} ${x - 14},${y + 30} ${x - 2},${y + 30} ${x - 10},${y + 56} ${x + 14},${y + 20} ${x + 2},${y + 20} ${x + 10},${y}" class="bolt"/>`;
const wind = () =>
`<path class="wind" d="M20,120 Q120,100 200,122 T330,118"/><path class="wind" style="animation-delay:.7s" d="M60,150 Q150,135 230,152 T340,146"/><path class="wind" style="animation-delay:1.3s" d="M0,92 Q90,80 170,96 T300,90"/>`;
const fog = () => {
let s = "";
for (let i = 0; i < 5; i++) s += `<rect x="${20 + (i % 2) * 30}" y="${70 + i * 22}" width="${240 - (i % 3) * 30}" height="9" rx="4.5" class="fogb" style="animation-delay:${i * 0.6}s"/>`;
return s;
};
const W = "rgba(255,255,255,.95)", G = "rgba(225,233,242,.92)", D = "rgba(120,135,155,.95)";
let b = "";
const sky = night ? moon(220, 78) : sun(222, 74, 34);
switch (c) {
case "sunny": b = night ? moon(220, 80) : sun(215, 90, 40); break;
case "clear-night": b = moon(220, 80); break;
case "partlycloudy": b = sky + cloud(150, 108, 1.15, W, 9) + cloud(40, 60, 0.6, G, 13, 1.5, 0.75); break;
case "cloudy": b = cloud(70, 60, 0.85, G, 14, 0, 0.85) + cloud(140, 100, 1.3, W, 10); break;
case "rainy": b = cloud(110, 70, 1.3, G, 11) + rain(14, 135, 120, 125, false); break;
case "pouring": b = cloud(60, 50, 0.9, D, 14, 0, 0.9) + cloud(120, 75, 1.35, "rgba(170,182,198,.95)", 10) + rain(24, 125, 140, 128, true); break;
case "snowy": b = cloud(110, 65, 1.3, W, 11) + snow(14, 130, 130, 115); break;
case "snowy-rainy": b = cloud(110, 65, 1.3, G, 11) + rain(8, 135, 120, 120, false) + snow(8, 150, 110, 115); break;
case "hail": b = cloud(110, 65, 1.3, G, 11) + snow(12, 135, 120, 115); break;
case "lightning": b = cloud(60, 45, 0.9, D, 14, 0, 0.9) + cloud(120, 70, 1.35, "rgba(150,160,178,.95)", 10) + bolt(205, 118); break;
case "lightning-rainy": b = cloud(60, 45, 0.9, D, 14, 0, 0.9) + cloud(120, 70, 1.35, "rgba(150,160,178,.95)", 10) + rain(16, 125, 140, 125, true) + bolt(205, 118); break;
case "fog": b = cloud(120, 40, 1.0, G, 12, 0, 0.7) + fog(); break;
case "windy": case "windy-variant": b = cloud(120, 60, 1.1, W, 4) + wind(); break;
default: b = cloud(120, 70, 1.25, G, 11);
}
return `<svg viewBox="0 0 330 220" xmlns="http://www.w3.org/2000/svg"><defs>
<radialGradient id="wxSun"><stop offset="0" stop-color="#fff8d6"/><stop offset=".55" stop-color="#ffd54f"/><stop offset="1" stop-color="#ffa000"/></radialGradient>
<radialGradient id="wxHalo"><stop offset="0" stop-color="rgba(255,236,150,.55)"/><stop offset="1" stop-color="rgba(255,236,150,0)"/></radialGradient>
<radialGradient id="wxHalo2"><stop offset="0" stop-color="rgba(255,255,220,.35)"/><stop offset="1" stop-color="rgba(255,255,220,0)"/></radialGradient>
</defs>${b}</svg>`;
}
const TB_ACASA_CSS = `
.g { display: grid; grid-template-columns: 1.45fr 1fr; gap: 12px; height: 100%; }
.col { display: flex; flex-direction: column; gap: 12px; min-height: 0; min-width: 0; }
.hero { flex: 0 0 41%; padding: 16px 22px; color: #fff; border: none; background: var(--wxbg); transition: background 2s; }
.scene { position: absolute; right: -8px; top: -4px; width: 58%; height: 108%; pointer-events: none; }
.scene svg { width: 100%; height: 100%; }
.htext { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; }
.clock { display: flex; align-items: baseline; gap: 12px; }
#clk { font-size: 2.3rem; font-weight: 700; letter-spacing: .02em; text-shadow: 0 2px 10px rgba(0,0,0,.2); }
#date { font-size: 1.05rem; opacity: .92; text-transform: capitalize; }
.tnow { display: flex; align-items: flex-start; margin-top: auto; line-height: 1; text-shadow: 0 4px 18px rgba(0,0,0,.25); }
#tw { font-size: 5.4rem; font-weight: 200; }
.deg { font-size: 2.6rem; font-weight: 300; margin-top: 6px; }
.tside { display: flex; flex-direction: column; justify-content: center; margin: 14px 0 0 14px; gap: 4px; font-size: .95rem; }
.tside b { font-size: 1.35rem; font-weight: 500; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.chip { display: inline-flex; align-items: center; gap: 5px; background: rgba(255,255,255,.17); backdrop-filter: blur(6px);
padding: 4px 11px; border-radius: 999px; font-size: .88rem; white-space: nowrap; }
.chip ha-icon { --mdc-icon-size: 17px; }
#wdir { transition: transform 1s; }
.cl { animation: wxDrift ease-in-out infinite alternate; }
@keyframes wxDrift { from { transform: translateX(-12px); } to { transform: translateX(14px); } }
.rays line { stroke: #ffd54f; stroke-width: 4; stroke-linecap: round; }
.rays { transform-box: fill-box; transform-origin: center; animation: tbSpin 30s linear infinite; }
.halo { transform-box: fill-box; transform-origin: center; animation: wxHalo 4s ease-in-out infinite; }
@keyframes wxHalo { 50% { transform: scale(1.15); opacity: .7; } }
.moon { animation: wxFloat 6s ease-in-out infinite; }
@keyframes wxFloat { 50% { transform: translateY(-5px); } }
.star { fill: #fff; animation: tbPulse 2.4s ease-in-out infinite; }
.drop { stroke: rgba(200,230,255,.95); stroke-width: 2.4; stroke-linecap: round; animation: wxDrop linear infinite; }
@keyframes wxDrop { 0% { transform: translateY(-8px); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(70px); opacity: 0; } }
.flake { fill: #fff; animation: wxSnow 3s linear infinite; }
@keyframes wxSnow { 0% { transform: translate(0,-6px); opacity: 0; } 15% { opacity: 1; } 50% { transform: translate(7px,32px); } 100% { transform: translate(-4px,74px); opacity: 0; } }
.bolt { fill: #ffeb3b; filter: drop-shadow(0 0 8px #fff59d); animation: wxFlash 3.2s infinite; }
@keyframes wxFlash { 0%,82%,90%,100% { opacity: 0; } 84%,88% { opacity: 1; } 86% { opacity: .2; } }
.wind { fill: none; stroke: rgba(255,255,255,.75); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 60 300; animation: wxWind 2.4s linear infinite; }
@keyframes wxWind { from { stroke-dashoffset: 360; } to { stroke-dashoffset: 0; } }
.fogb { fill: rgba(255,255,255,.55); animation: wxFog 5s ease-in-out infinite alternate; }
@keyframes wxFog { from { transform: translateX(-16px); } to { transform: translateX(18px); } }
.hourly { flex: 0 0 auto; padding-bottom: 8px; }
.hrc { display: grid; text-align: center; font-size: .78rem; }
.hrc .h { color: var(--secondary-text-color); }
.hrc ha-icon { --mdc-icon-size: 25px; margin: 2px auto 0; display: block; animation: tbFade .5s both; }
.hrc .p { font-size: .72rem; color: #42a5f5; min-height: 1.1em; font-weight: 600; }
svg.tl { width: 100%; height: auto; display: block; margin: -2px 0; }
.tl text { font-size: 15px; font-weight: 700; fill: var(--primary-text-color); text-anchor: middle; }
.tl .ln { fill: none; stroke: #ffb74d; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.tl circle { fill: var(--card-background-color); stroke: #ffb74d; stroke-width: 2.5; }
.daily { flex: 1 1 auto; display: flex; flex-direction: column; }
.dw { flex: 1; display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; min-height: 0; }
.dd { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 2px; border-radius: 14px;
background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); animation: tbFade .5s both; min-height: 0; }
.dd.today { background: color-mix(in srgb, var(--primary-color) 18%, transparent); }
.dd .n { font-weight: 700; font-size: .85rem; text-transform: capitalize; }
.dd ha-icon { --mdc-icon-size: 30px; }
.dd .mx { font-weight: 700; font-size: 1rem; }
.dd .mn { color: var(--secondary-text-color); font-size: .85rem; }
.dd .pr { font-size: .7rem; color: #42a5f5; min-height: 1.1em; font-weight: 600; }
.rb { flex: 1; width: 9px; border-radius: 6px; background: color-mix(in srgb, var(--primary-text-color) 10%, transparent); position: relative; min-height: 26px; margin: 3px 0; }
.rb i { position: absolute; left: 0; right: 0; border-radius: 6px; background: linear-gradient(to top, #4fc3f7, #ffd54f, #ff7043);
transform-origin: bottom; animation: tbGrowY 1s cubic-bezier(.2,.8,.2,1) both; }
.fx { flex: 0 0 auto; }
.fxr { display: grid; grid-template-columns: 38px 1fr auto 112px; align-items: center; gap: 10px; padding: 7px 0;
border-bottom: 1px solid color-mix(in srgb, var(--primary-text-color) 8%, transparent); animation: tbFade .5s both; }
.fxr:last-child { border-bottom: none; }
.fl { font-size: 1.75rem; line-height: 1; }
.cc { font-weight: 700; font-size: 1.02rem; }
.cc small { display: block; font-weight: 400; color: var(--secondary-text-color); font-size: .72rem; }
.fv { text-align: right; font-variant-numeric: tabular-nums; }
.fv b { font-size: 1.45rem; }
.fv small { font-size: .78rem; color: var(--secondary-text-color); }
.fd { font-size: .78rem; font-weight: 600; }
.up { color: #ff7043; } .dn { color: #66bb6a; } .eq { color: var(--secondary-text-color); }
svg.spk { width: 112px; height: 40px; display: block; overflow: visible; }
.spk .l { fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.spk .dot { animation: tbPulse 1.6s infinite; }
.news { flex: 1 1 auto; display: flex; flex-direction: column; }
.calp { flex: 1 1 auto; display: flex; flex-direction: column; }
.calp tb-cal { flex: 1 1 auto; min-height: 0; }
.sum { display: flex; flex-direction: column; gap: 7px; font-size: .92rem; line-height: 1.32; }
.sum .b { display: flex; gap: 9px; animation: tbFade .6s both; }
.sum .b::before { content: ""; flex: 0 0 7px; height: 7px; margin-top: .5em; border-radius: 50%; background: var(--primary-color);
animation: nDot 2.6s infinite; }
@keyframes nDot { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary-color) 55%, transparent); } 70%,100% { box-shadow: 0 0 0 8px transparent; } }
.sum .empty { color: var(--secondary-text-color); font-style: italic; }
.pt.sub { margin: 12px 0 4px; }
.tick { flex: 1 1 auto; overflow: hidden; position: relative; min-height: 60px;
-webkit-mask-image: linear-gradient(transparent, #000 10%, #000 90%, transparent); mask-image: linear-gradient(transparent, #000 10%, #000 90%, transparent); }
.tk { animation: nScroll var(--dur, 60s) linear infinite; }
.tick:active .tk { animation-play-state: paused; }
@keyframes nScroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }
.ti { display: flex; gap: 8px; align-items: flex-start; padding: 6px 0; font-size: .86rem; line-height: 1.28;
border-bottom: 1px dashed color-mix(in srgb, var(--primary-text-color) 12%, transparent); }
.src { flex: 0 0 auto; font-size: .62rem; font-weight: 800; padding: 3px 6px; border-radius: 6px; color: #fff; margin-top: 1px; letter-spacing: .03em; }
.ti .tm { flex: 0 0 auto; color: var(--secondary-text-color); font-size: .72rem; margin-left: auto; padding-left: 6px; }
.ib { background: none; border: none; color: var(--secondary-text-color); padding: 2px; border-radius: 50%; line-height: 0; }
.ib.spin ha-icon { animation: tbSpin 1s linear infinite; }
@media (max-height: 760px) { .g, .col { gap: 9px; } .hero { padding: 12px 18px; } #clk { font-size: 1.9rem; } #date { font-size: .95rem; } #tw { font-size: 4.3rem; } .deg { font-size: 2.1rem; } .tside { margin: 8px 0 0 12px; font-size: .88rem; gap: 2px; } .tside b { font-size: 1.15rem; } .chips { margin-top: 6px; gap: 5px; } .chip { padding: 3px 9px; font-size: .8rem; } .hrc ha-icon { --mdc-icon-size: 21px; } .dd ha-icon { --mdc-icon-size: 25px; } .fxr { padding: 5px 0; } .fv b { font-size: 1.25rem; } .fl { font-size: 1.45rem; } .sum { gap: 5px; font-size: .86rem; line-height: 1.25; } .pt.sub { margin: 8px 0 3px; } .ti { font-size: .8rem; padding: 4px 0; } }
@media (max-width: 899px), (orientation: portrait) {
.g { grid-template-columns: 1fr; } .hero { min-height: 300px; } .dw { min-height: 220px; } .news { min-height: 420px; } .calp { min-height: 480px; }
}
`;
class TbAcasaCard extends TbBase {
static defaults() {
return {
weather: "weather.YOUR_WEATHER", /* >>> your weather entity (must support forecasts) */
sun: "sun.sun",
temp: "sensor.YOUR_OUTDOOR_TEMPERATURE", /* >>> optional outdoor sensor ("" = use weather) */
hum: "sensor.YOUR_OUTDOOR_HUMIDITY", /* >>> optional */
fx: [
/* >>> one sensor per currency (state = rate in your currency); remove or add rows as you like */
{ entity: "sensor.YOUR_FX_EUR", code: "EUR", name: "Euro", flag: "🇪🇺" },
{ entity: "sensor.YOUR_FX_USD", code: "USD", name: "Dolar american", flag: "🇺🇸" },
{ entity: "sensor.YOUR_FX_GBP", code: "GBP", name: "Liră sterlină", flag: "🇬🇧" },
],
holidays: "calendar.YOUR_HOLIDAYS_CALENDAR", /* >>> */
reminders: "calendar.YOUR_REMINDERS_CALENDAR", /* >>> */
};
}
_build() {
this.shadowRoot.innerHTML = `<style>${TB_BASE_CSS}${TB_ACASA_CSS}</style>
<ha-card><div class="g">
<div class="col">
<div class="pn hero" id="hero">
<div class="scene" id="scene"></div>
<div class="htext">
<div class="clock"><span id="clk">--:--</span><span id="date"></span></div>
<div class="tnow"><span id="tw">—</span><span class="deg">°</span>
<div class="tside"><b id="cond"></b><span id="mm"></span><span id="feel"></span></div></div>
<div class="chips">
<span class="chip"><ha-icon icon="mdi:water-percent"></ha-icon><span id="hout">—</span></span>
<span class="chip"><ha-icon id="wdir" icon="mdi:navigation"></ha-icon><span id="wind">—</span></span>
<span class="chip" id="presc"><ha-icon icon="mdi:gauge"></ha-icon><span id="pres">—</span></span>
<span class="chip"><ha-icon icon="mdi:weather-sunset-up"></ha-icon><span id="rise">—</span></span>
<span class="chip"><ha-icon icon="mdi:weather-sunset-down"></ha-icon><span id="set">—</span></span>
</div>
</div>
</div>
<div class="pn hourly"><div class="pt"><ha-icon icon="mdi:clock-outline"></ha-icon>Următoarele ore</div><div id="hourly"><div class="mut">Se încarcă prognoza…</div></div></div>
<div class="pn daily"><div class="pt"><ha-icon icon="mdi:calendar-week"></ha-icon>Prognoza pe 7 zile</div><div id="daily" class="dw"></div></div>
</div>
<div class="col">
<div class="pn fx"><div class="pt"><ha-icon icon="mdi:bank-outline"></ha-icon>Curs valutar<span class="sp"></span><span id="fxd" class="note"></span></div><div id="fxl"></div></div>
<div class="pn calp"><tb-cal id="cal"></tb-cal></div>
</div>
</div></ha-card>`;
const cal = this._e("cal");
if (cal && cal.setConfig) cal.setConfig({ holidays: this._config.holidays, reminders: this._config.reminders });
this._clock();
}
_onStart() {
this._clock();
this._every(10000, () => this._clock());
this._every(3600e3, () => this._loadFx());
this._subscribe();
this._loadFx();
}
_onStop() {
if (this._subs) this._subs.forEach((p) => Promise.resolve(p).then((u) => u && u()).catch(() => {}));
this._subs = null;
}
_subscribe() {
if (this._subs || !this._hass) return;
const id = this._config.weather;
this._subs = ["hourly", "daily"].map((ft) =>
this._hass.connection
.subscribeMessage(
(ev) => {
this["_" + ft] = ev.forecast || [];
if (ft === "hourly") this._renderHourly();
else this._renderDaily();
},
{ type: "weather/subscribe_forecast", forecast_type: ft, entity_id: id }
)
.catch((e) => console.warn("tb-acasa forecast", ft, e))
);
}
_clock() {
const n = new Date();
this._t("clk", tbHHMM(n));
this._t("date", n.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" }));
}
_update() {
const h = this._hass, c = this._config;
const w = h.states[c.weather];
const night = tbSt(h, c.sun) === "below_horizon";
const cond = w ? w.state : "unknown";
const key = `${cond}|${night}`;
if (key !== this._scene) {
this._scene = key;
this._e("scene").innerHTML = wxScene(cond, night);
this._e("hero").style.setProperty("--wxbg", wxBg(cond, night));
if (this._hourly) this._renderHourly();
}
const tIn = tbNum(h, c.temp);
const tW = w ? parseFloat(w.attributes.temperature) : null;
this._t("tw", tbF(tIn !== null ? tIn : tW, 1));
this._t("cond", WX_RO[cond] || cond);
this._t("feel", tIn !== null && isFinite(tW) ? `Prognoză acum ${tbF(tW, 0)}°` : w && isFinite(w.attributes.apparent_temperature) ? `Resimțit ${tbF(w.attributes.apparent_temperature, 0)}°` : "");
const hm = tbNum(h, c.hum) ?? (w ? w.attributes.humidity : null);
this._t("hout", hm !== null && hm !== undefined ? `${tbF(hm, 0)}%` : "—");
if (w) {
const ws = parseFloat(w.attributes.wind_speed);
const unit = w.attributes.wind_speed_unit || "km/h";
const kmh = unit === "m/s" ? ws * 3.6 : ws;
this._t("wind", isFinite(kmh) ? `${tbF(kmh, 0)} km/h` : "—");
const br = parseFloat(w.attributes.wind_bearing);
if (isFinite(br)) this._e("wdir").style.transform = `rotate(${br + 180}deg)`;
const pr = parseFloat(w.attributes.pressure);
this._c("presc", "hide", !isFinite(pr));
this._e("presc").style.display = isFinite(pr) ? "" : "none";
if (isFinite(pr)) this._t("pres", `${tbF(pr, 0)} ${w.attributes.pressure_unit || "hPa"}`);
}
const nr = tbAt(h, c.sun, "next_rising"), ns = tbAt(h, c.sun, "next_setting");
if (nr) this._t("rise", tbHHMM(new Date(nr)));
if (ns) this._t("set", tbHHMM(new Date(ns)));
// exchange rates
const fsig = c.fx.map((f) => tbSt(h, f.entity)).join("|");
if (fsig !== this._fsig) {
const first = this._fsig === undefined;
this._fsig = fsig;
if (!first) this._loadFx();
}
// calendar
const cal = this._e("cal");
if (cal && cal.setConfig) cal.hass = h;
}
_renderHourly() {
const el = this._e("hourly");
if (!el) return;
const now = Date.now();
const list = (this._hourly || []).filter((f) => new Date(f.datetime).getTime() > now - 3000e3).slice(0, 12);
if (!list.length) {
el.innerHTML = '<div class="mut">Fără prognoză orară.</div>';
return;
}
const n = list.length, W = 640, H = 58;
const temps = list.map((f) => f.temperature);
const lo = Math.min(...temps), hi = Math.max(...temps);
const x = (i) => ((i + 0.5) * W) / n;
const y = (t) => (hi === lo ? 36 : 24 + ((hi - t) / (hi - lo)) * 28);
const pts = list.map((f, i) => [x(i), y(f.temperature)]);
const d = tbPath(pts);
let cols = "", precip = "";
list.forEach((f, i) => {
const dt = new Date(f.datetime);
const hr = dt.getHours();
const night = f.is_daytime === false || (f.is_daytime === undefined && (hr < 7 || hr >= 18));
cols += `<div><div class="h">${i === 0 ? "Acum" : String(hr).padStart(2, "0")}</div><ha-icon icon="${wxIcon(f.condition, night)}" style="color:${wxColor(f.condition, night)};animation-delay:${i * 0.04}s"></ha-icon></div>`;
const pp = f.precipitation_probability, pa = f.precipitation;
precip += `<div class="p">${pp ? `${Math.round(pp)}%` : pa ? `${tbF(pa, 1)}` : ""}</div>`;
});
const labels = list.map((f, i) => `<text x="${pts[i][0].toFixed(1)}" y="${(pts[i][1] - 9).toFixed(1)}">${Math.round(f.temperature)}°</text>`).join("");
const dots = pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4"/>`).join("");
el.innerHTML = `<div class="hrc" style="grid-template-columns:repeat(${n},1fr)">${cols}</div>
<svg class="tl" viewBox="0 0 ${W} ${H}"><path class="ln draw" style="--len:900" d="${d}"/>${dots}${labels}</svg>
<div class="hrc" style="grid-template-columns:repeat(${n},1fr)">${precip}</div>`;
}
_renderDaily() {
const el = this._e("daily");
const list = (this._daily || []).slice(0, 7);
if (!list.length) {
el.innerHTML = '<div class="mut">Fără prognoză zilnică.</div>';
return;
}
const lows = list.map((f) => (isFinite(f.templow) ? f.templow : f.temperature - 6));
const lo = Math.min(...lows), hi = Math.max(...list.map((f) => f.temperature));
const span = Math.max(hi - lo, 1);
const today = new Date().toDateString();
el.innerHTML = list
.map((f, i) => {
const dt = new Date(f.datetime);
const isToday = dt.toDateString() === today;
const name = isToday ? "Azi" : dt.toLocaleDateString("ro-RO", { weekday: "short" }).replace(".", "");
const tl = lows[i];
const b = ((tl - lo) / span) * 100, hh = Math.max(((f.temperature - tl) / span) * 100, 6);
const pr = f.precipitation_probability ? `${Math.round(f.precipitation_probability)}%` : f.precipitation ? `${tbF(f.precipitation, 1)} mm` : "";
return `<div class="dd${isToday ? " today" : ""}" style="animation-delay:${i * 0.06}s"><div class="n">${name}</div>
<ha-icon icon="${wxIcon(f.condition, false)}" style="color:${wxColor(f.condition, false)}"></ha-icon>
<div class="mx">${Math.round(f.temperature)}°</div><div class="rb"><i style="bottom:${b.toFixed(1)}%;height:${hh.toFixed(1)}%;animation-delay:${0.15 + i * 0.06}s"></i></div>
<div class="mn">${Math.round(tl)}°</div><div class="pr">${pr}</div></div>`;
})
.join("");
if (list[0]) {
const f = list[0];
this._t("mm", `max ${Math.round(f.temperature)}° · min ${Math.round(isFinite(f.templow) ? f.templow : f.temperature)}°`);
}
}
async _loadFx() {
if (!this._hass) return;
const c = this._config;
try {
this._fxh = await tbHistory(this._hass, c.fx.map((f) => f.entity), 24 * 40);
} catch (e) {
this._fxh = {};
}
this._renderFx();
}
_renderFx() {
const h = this._hass, c = this._config;
let date = "";
const rows = c.fx
.map((f, i) => {
const st = h.states[f.entity];
const v = tbNum(h, f.entity);
if (st && st.attributes["@date"]) date = st.attributes["@date"];
const pts = ((this._fxh || {})[f.entity] || []).slice();
// one value per day
const byDay = new Map();
pts.forEach((p) => byDay.set(new Date(p.t).toDateString(), p));
const days = [...byDay.values()];
if (v !== null && (!days.length || days[days.length - 1].v !== v)) days.push({ t: Date.now(), v });
let prev = null;
for (let k = days.length - 1; k >= 0; k--) if (days[k].v !== v) { prev = days[k].v; break; }
const dl = prev !== null && v !== null ? v - prev : null;
const cls = dl === null || Math.abs(dl) < 1e-5 ? "eq" : dl > 0 ? "up" : "dn";
const dTxt = dl === null ? "—" : `${dl > 0 ? "▲ +" : dl < 0 ? "▼ " : ""}${tbF(dl, 4)}`;
let spark = "";
if (days.length > 1) {
const W = 112, H = 40;
const vals = days.map((p) => p.v);
const lo = Math.min(...vals), hi = Math.max(...vals), sp = hi - lo || 1;
const t0 = days[0].t, t1 = days[days.length - 1].t, ts = t1 - t0 || 1;
const P = days.map((p) => [((p.t - t0) / ts) * W, 4 + ((hi - p.v) / sp) * (H - 8)]);
const col = vals[vals.length - 1] >= vals[0] ? "#ff7043" : "#66bb6a";
const last = P[P.length - 1];
spark = `<svg class="spk" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="fg${i}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".35"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
<path d="${tbPath(P)} L${W},${H} L0,${H} Z" fill="url(#fg${i})"/><path class="l draw" style="--len:400;stroke:${col};animation-delay:${i * 0.15}s" d="${tbPath(P)}"/>
<circle class="dot" cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3.4" fill="${col}"/></svg>`;
}
return `<div class="fxr" style="animation-delay:${i * 0.08}s"><span class="fl">${f.flag || ""}</span>
<div class="cc">${tbEsc(f.code)}<small>${tbEsc(f.name || "")}</small></div>
<div class="fv"><b>${tbF(v, 4)}</b> <small>lei</small><div class="fd ${cls}">${dTxt}</div></div>${spark}</div>`;
})
.join("");
this._h("fxl", rows);
if (date) this._t("fxd", `${date.slice(8, 10)}.${date.slice(5, 7)}.${date.slice(0, 4)} · 40 zile`);
}
}
customElements.get("tb-acasa-card") || customElements.define("tb-acasa-card", TbAcasaCard);
