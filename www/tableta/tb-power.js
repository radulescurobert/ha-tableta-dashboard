/* ================================================================
*  SOCKETS + LIGHTS  (custom:tb-power-card)
*  >>> Replace the example entities in defaults() below (or pass `plugs`, `lights`, `phases`, `house` from the dashboard YAML).
*  plugs : name, icon, note (optional subtitle), sw (switch entity, optional), p (power W sensor), v (voltage), a (current), e (energy sensor), eLabel, spin (animate icon)
*  lights: name, e (light/switch entity), icon, led:true for LED strips, p (power sensor, optional), a (current mA sensor, optional)
*  phases: [label, voltage sensor, frequency sensor, color] — the 3 mains phases shown as sine waves (needs 3 voltage sensors, e.g. from smart plugs/meters)
*  house : sensor with total house consumption in kW (used for the "where does the power go" bar)
* ================================================================ */
const TB_PWR_CSS = `
.g { display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; height: 100%; }
.col { display: flex; flex-direction: column; gap: 12px; min-height: 0; min-width: 0; }
.plugs { flex: 1; display: flex; flex-direction: column; }
.pg { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 1fr; gap: 8px; min-height: 0; }
.pl { position: relative; border-radius: 14px; padding: 8px 10px; overflow: hidden; display: flex; flex-direction: column; min-height: 0;
background: color-mix(in srgb, var(--pc) 9%, var(--card-background-color)); border: 1px solid color-mix(in srgb, var(--pc) 24%, transparent); animation: tbFade .5s both; transition: border-color .6s, background .6s; }
.pl.off { --pc: #78909c; }
.pl.off .pv { opacity: .55; }
.pl .spk { position: absolute; left: 0; right: 0; bottom: 0; height: 58%; opacity: .32; pointer-events: none; }
.pl .spk svg { width: 100%; height: 100%; display: block; }
.ph1 { display: flex; align-items: center; gap: 7px; position: relative; }
.pic { width: 30px; height: 30px; flex: 0 0 30px; border-radius: 10px; display: grid; place-items: center; background: color-mix(in srgb, var(--pc) 20%, transparent); }
.pic ha-icon { --mdc-icon-size: 19px; color: var(--pc); }
.pl.run .pic ha-icon.spin { animation: tbSpin var(--sp, 2s) linear infinite; }
.pl.run .pic { animation: plGlow 2s ease-in-out infinite; }
@keyframes plGlow { 50% { box-shadow: 0 0 12px color-mix(in srgb, var(--pc) 60%, transparent); } }
.pn1 { flex: 1; min-width: 0; font-weight: 700; font-size: .82rem; line-height: 1.12; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.pn1 small { display: block; font-weight: 500; font-size: .64rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pw { flex: 0 0 auto; border: none; background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); border-radius: 9px; height: 28px; min-width: 28px; padding: 0 6px; display: grid; place-items: center; font-size: .68rem; font-weight: 800; }
.pw ha-icon { --mdc-icon-size: 17px; }
.pl:not(.off) .pw { background: var(--pc); color: #fff; }
.pw.ask { background: #ef5350 !important; color: #fff; animation: tbPulse .7s infinite; }
.pv { position: relative; margin-top: auto; font-size: 1.5rem; font-weight: 300; line-height: 1.1; font-variant-numeric: tabular-nums; white-space: nowrap; }
.pv small { font-size: .75rem; color: var(--secondary-text-color); margin-left: 2px; }
.pd { position: relative; display: flex; gap: 8px; font-size: .68rem; color: var(--secondary-text-color); flex-wrap: wrap; min-height: 1em; }
.wire { position: relative; height: 4px; border-radius: 2px; margin-top: 4px; background: color-mix(in srgb, var(--primary-text-color) 10%, transparent); overflow: hidden; }
.wire i { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, var(--pc) 0 10px, transparent 10px 22px); opacity: 0; }
.pl.run .wire i { opacity: 1; animation: plFlow var(--sp, 2s) linear infinite; }
@keyframes plFlow { from { background-position: 0 0; } to { background-position: 44px 0; } }
.tot { text-transform: none; letter-spacing: 0; font-weight: 700; color: var(--primary-text-color); font-size: .8rem; }
.osc { position: relative; height: 92px; border-radius: 12px; overflow: hidden; background: color-mix(in srgb, #000 25%, transparent); }
.osc svg { position: absolute; left: 0; top: 0; height: 100%; width: 200%; }
.osc .w { fill: none; stroke-width: 2.4; animation: plOsc 1.6s linear infinite; }
.osc .w.off { opacity: .15; animation: none; }
@keyframes plOsc { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.osc .gl2 { stroke: rgba(255,255,255,.07); }
.phs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
.phc { border-radius: 12px; padding: 6px 9px; background: color-mix(in srgb, var(--fc) 12%, transparent); }
.phc .l { font-size: .68rem; font-weight: 800; color: var(--fc); letter-spacing: .06em; }
.phc b { font-size: 1.25rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.phc .dv { height: 5px; border-radius: 3px; margin-top: 5px; position: relative; background: linear-gradient(90deg, #ef5350, #ffca28 18%, #66bb6a 35%, #66bb6a 65%, #ffca28 82%, #ef5350); }
.phc .dv i { position: absolute; top: -3px; width: 3px; height: 11px; border-radius: 2px; background: var(--primary-text-color); transform: translateX(-50%); transition: left 1s; }
.phc small { font-size: .66rem; color: var(--secondary-text-color); }
.dist { margin-top: 9px; }
.db { display: flex; height: 14px; border-radius: 7px; overflow: hidden; background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
.db i { height: 100%; transition: width 1s; position: relative; overflow: hidden; }
.db i::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent); animation: plSweep 3s infinite; }
@keyframes plSweep { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
.dl { display: flex; flex-wrap: wrap; gap: 3px 10px; margin-top: 5px; font-size: .68rem; color: var(--secondary-text-color); }
.dl span::before { content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 4px; background: var(--c); }
.lights { flex: 1; display: flex; flex-direction: column; }
.lg { flex: 1; display: grid; grid-template-columns: repeat(2, 1fr); grid-auto-rows: 1fr; gap: 7px; min-height: 0; }
.lt { position: relative; border-radius: 13px; padding: 6px 9px; display: flex; align-items: center; gap: 9px; overflow: hidden; min-height: 0; cursor: pointer;
background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); border: 1px solid transparent; transition: background .6s, border-color .6s; animation: tbFade .5s both; -webkit-tap-highlight-color: transparent; }
.lt.on { background: color-mix(in srgb, var(--lc) calc(var(--lb, 1) * 22%), var(--card-background-color)); border-color: color-mix(in srgb, var(--lc) 45%, transparent); }
.lt:active { transform: scale(.98); }
.bulb { position: relative; flex: 0 0 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; }
.bulb ha-icon { --mdc-icon-size: 22px; color: var(--secondary-text-color); position: relative; }
.lt.on .bulb ha-icon { color: var(--lc); }
.lt.on .bulb::before { content: ""; position: absolute; inset: -5px; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--lc) 70%, transparent), transparent 70%); opacity: calc(.35 + var(--lb, 1) * .65); animation: ltGlow 2.6s ease-in-out infinite; }
@keyframes ltGlow { 50% { transform: scale(1.18); opacity: .5; } }
.lx { flex: 1; min-width: 0; }
.lx b { display: block; font-size: .8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lx span { font-size: .68rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.br2 { height: 8px; border-radius: 4px; margin-top: 4px; background: color-mix(in srgb, var(--primary-text-color) 10%, transparent); overflow: hidden; position: relative; }
.br2 i { position: absolute; inset: 0 auto 0 0; border-radius: 4px; background: var(--lc, #ffd54f); transition: width .6s; }
.lt.led .br2 i { background: linear-gradient(90deg, color-mix(in srgb, var(--lc) 35%, transparent), var(--lc), color-mix(in srgb, var(--lc) 35%, transparent)); background-size: 200% 100%; }
.lt.led.on .br2 i { animation: ltStrip 2.4s linear infinite; }
.lt.led.on.fx .br2 i { background: linear-gradient(90deg, #ff1744, #ff9100, #ffea00, #00e676, #00b0ff, #d500f9, #ff1744); background-size: 200% 100%; animation-duration: 3s; }
@keyframes ltStrip { from { background-position: 0 0; } to { background-position: -200% 0; } }
.alloff { border: none; border-radius: 9px; padding: 3px 9px; font-size: .68rem; font-weight: 700; background: color-mix(in srgb, var(--primary-text-color) 9%, transparent); text-transform: none; letter-spacing: 0; }
.alloff:active { background: var(--primary-color); color: #fff; }
@media (max-height: 760px) { .g, .col { gap: 9px; } .pv { font-size: 1.3rem; } .osc { height: 72px; } .phc b { font-size: 1.08rem; } .pic { width: 26px; height: 26px; flex-basis: 26px; } .lt { padding: 4px 8px; } .bulb { flex-basis: 30px; height: 30px; } }
@media (max-width: 899px), (orientation: portrait) { .g { grid-template-columns: 1fr; } .pg { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 120px; } .lg { grid-auto-rows: 56px; } }
`;
const TB_PWR_PAL = ["#ff7043", "#ffca28", "#66bb6a", "#26c6da", "#42a5f5", "#ab47bc", "#ec407a", "#8d6e63", "#26a69a", "#d4e157", "#5c6bc0", "#ffa726"];
const tbW = (w) => (w === null || !isFinite(w) ? "—" : Math.abs(w) >= 1000 ? `${tbF(w / 1000, 2)} kW` : `${tbF(w, w < 10 ? 1 : 0)} W`);
class TbPowerCard extends TbBase {
static defaults() {
return {
house: "sensor.YOUR_HOUSE_CONSUMPTION_KW",
phases: [
["L1", "sensor.YOUR_PHASE_1_VOLTAGE", "sensor.YOUR_PHASE_1_FREQUENCY", "#ff7043"],
["L2", "sensor.YOUR_PHASE_2_VOLTAGE", "sensor.YOUR_PHASE_2_FREQUENCY", "#ffca28"],
["L3", "sensor.YOUR_PHASE_3_VOLTAGE", "sensor.YOUR_PHASE_3_FREQUENCY", "#4fc3f7"],
],
plugs: [
{ name: "Plug 1", note: "optional subtitle", icon: "mdi:server-network", p: "sensor.YOUR_PLUG_1_POWER", v: "sensor.YOUR_PLUG_1_VOLTAGE", a: "sensor.YOUR_PLUG_1_CURRENT", e: "sensor.YOUR_PLUG_1_ENERGY" },
{ name: "Plug 2", icon: "mdi:water-boiler", p: "sensor.YOUR_PLUG_2_POWER", v: "sensor.YOUR_PLUG_2_VOLTAGE", a: "sensor.YOUR_PLUG_2_CURRENT", e: "sensor.YOUR_PLUG_2_ENERGY" },
{ name: "Air conditioner", icon: "mdi:air-conditioner", sw: "switch.YOUR_AC_POWER_SWITCH", e: "sensor.YOUR_AC_ENERGY_TODAY", eLabel: "azi", spin: false },
{ name: "Pump", icon: "mdi:pump", sw: "switch.YOUR_PUMP_SWITCH", p: "sensor.YOUR_PUMP_POWER", e: "sensor.YOUR_PUMP_ENERGY", spin: true },
{ name: "Fan", icon: "mdi:fan", sw: "switch.YOUR_FAN_SWITCH", spin: true },
{ name: "Washing machine", icon: "mdi:washing-machine", sw: "switch.YOUR_WASHER_SWITCH", e: "sensor.YOUR_WASHER_ENERGY_THIS_MONTH", eLabel: "luna", spin: true },
],
lights: [
{ name: "Light 1", e: "light.YOUR_LIGHT_1", icon: "mdi:ceiling-light" },
{ name: "Light 2 (switch)", e: "switch.YOUR_LIGHT_2", icon: "mdi:lightbulb", p: "sensor.YOUR_LIGHT_2_POWER" },
{ name: "Desk lamp", e: "light.YOUR_LAMP", icon: "mdi:desk-lamp" },
{ name: "LED strip", e: "light.YOUR_LED_STRIP", icon: "mdi:led-strip-variant", led: true, a: "sensor.YOUR_WLED_ESTIMATED_CURRENT" },
],
};
}
_build() {
const c = this._config;
const plugs = c.plugs
.map(
(p, i) => `<div class="pl off" id="pl${i}" style="animation-delay:${i * 0.04}s"><div class="spk" id="ps${i}"></div>
<div class="ph1"><div class="pic"><ha-icon icon="${p.icon}" class="${p.spin ? "spin" : ""}"></ha-icon></div><div class="pn1">${tbEsc(p.name)}${p.note ? `<small>${tbEsc(p.note)}</small>` : ""}</div>
${p.sw ? `<button class="pw" data-i="${i}" id="pb${i}"><ha-icon icon="mdi:power"></ha-icon></button>` : ""}</div>
<div class="pv" id="pv${i}">—</div><div class="pd" id="pd${i}"></div><div class="wire"><i></i></div></div>`
)
.join("");
const lights = c.lights
.map(
(l, i) => `<div class="lt${l.led ? " led" : ""}" id="lt${i}" data-i="${i}" style="animation-delay:${i * 0.04}s"><div class="bulb"><ha-icon icon="${l.icon}"></ha-icon></div>
<div class="lx"><b>${tbEsc(l.name)}</b><span id="ls${i}">—</span><div class="br2" data-b="${i}"><i id="lb${i}" style="width:0"></i></div></div></div>`
)
.join("");
let grid = "";
for (let x = 0; x <= 400; x += 25) grid += `<line class="gl2" x1="${x}" x2="${x}" y1="0" y2="100"/>`;
grid += `<line class="gl2" x1="0" x2="400" y1="50" y2="50"/>`;
const phases = c.phases.map(([lb, , , col], k) => `<path class="w" id="w${k}" stroke="${col}" d=""/>`).join("");
this.shadowRoot.innerHTML = `<style>${TB_BASE_CSS}${TB_PWR_CSS}</style>
<ha-card><div class="g">
<div class="col">
<div class="pn plugs"><div class="pt"><ha-icon icon="mdi:power-socket-eu"></ha-icon>Prize și consumatori<span class="sp"></span><span class="tot" id="ptot"></span></div><div class="pg">${plugs}</div></div>
</div>
<div class="col">
<div class="pn"><div class="pt"><ha-icon icon="mdi:sine-wave"></ha-icon>Rețea electrică · 3 faze<span class="sp"></span><span class="note" id="hz"></span></div>
<div class="osc"><svg viewBox="0 0 400 100" preserveAspectRatio="none">${grid}${phases}</svg></div>
<div class="phs" id="phs"></div>
<div class="dist"><div class="pt" style="margin:0 0 5px"><ha-icon icon="mdi:chart-donut"></ha-icon>Unde se duce curentul acum<span class="sp"></span><span class="tot" id="house"></span></div><div class="db" id="db"></div><div class="dl" id="dl"></div></div>
</div>
<div class="pn lights"><div class="pt"><ha-icon icon="mdi:lightbulb-group"></ha-icon>Lumini și LED-uri<span class="sp"></span><span class="note" id="lon"></span><button class="alloff" id="alloff">Stinge tot</button></div><div class="lg">${lights}</div></div>
</div>
</div></ha-card>`;
// waveforms: one period = 100 units, drawn on 2 widths for continuous animation
const wave = (shift, amp) => {
let d = "";
for (let x = 0; x <= 800; x += 4) d += `${x ? "L" : "M"}${x},${(50 - amp * Math.sin(((x + shift) / 100) * 2 * Math.PI)).toFixed(1)} `;
return d;
};
this._wave = wave;
this._ask = {};
this.shadowRoot.querySelector(".pg").addEventListener("click", (ev) => {
const b = ev.target.closest("button.pw");
if (b) this._plugTap(+b.dataset.i, b);
});
this.shadowRoot.querySelector(".lg").addEventListener("click", (ev) => {
const bar = ev.target.closest(".br2");
const t = ev.target.closest(".lt");
if (!t) return;
const l = this._config.lights[+t.dataset.i];
if (bar && l.e.startsWith("light.")) {
const st = this._hass.states[l.e];
const modes = (st && st.attributes.supported_color_modes) || [];
if (!(modes.length === 1 && modes[0] === "onoff")) {
const r = bar.getBoundingClientRect();
const pct = Math.round(tbClamp(((ev.clientX - r.left) / r.width) * 100, 1, 100));
this._svc("light", "turn_on", { entity_id: l.e, brightness_pct: pct });
return;
}
}
this._svc("homeassistant", "toggle", { entity_id: l.e });
});
this._e("alloff").addEventListener("click", () => {
const on = this._config.lights.filter((l) => tbSt(this._hass, l.e) === "on").map((l) => l.e);
if (on.length) this._svc("homeassistant", "turn_off", { entity_id: on });
});
}
_onStart() {
this._loadSpark();
this._every(600e3, () => this._loadSpark());
}
_plugTap(i, btn) {
const p = this._config.plugs[i];
if (this._ask[i]) {
clearTimeout(this._ask[i]);
delete this._ask[i];
btn.classList.remove("ask");
btn.innerHTML = '<ha-icon icon="mdi:power"></ha-icon>';
this._svc("homeassistant", "toggle", { entity_id: p.sw });
return;
}
btn.classList.add("ask");
btn.textContent = tbSt(this._hass, p.sw) === "on" ? "Opresc?" : "Pornesc?";
this._ask[i] = setTimeout(() => {
delete this._ask[i];
btn.classList.remove("ask");
btn.innerHTML = '<ha-icon icon="mdi:power"></ha-icon>';
}, 3500);
}
_energy(id) {
const v = tbNum(this._hass, id);
if (v === null) return null;
const u = tbAt(this._hass, id, "unit_of_measurement") || "kWh";
const kwh = u === "Wh" ? v / 1000 : u === "MWh" ? v * 1000 : v;
return `${tbF(kwh, kwh < 10 ? 2 : kwh < 100 ? 1 : 0)} kWh`;
}
_lightColor(st) {
const a = st.attributes;
if (Array.isArray(a.rgb_color)) return `rgb(${a.rgb_color.join(",")})`;
if (Array.isArray(a.hs_color)) return `hsl(${a.hs_color[0]}, ${Math.max(a.hs_color[1], 35)}%, 60%)`;
const k = a.color_temp_kelvin;
if (k) return k < 3000 ? "#ffb74d" : k < 4200 ? "#ffe0b2" : k < 5200 ? "#fff8e1" : "#e3f2fd";
return "#ffd54f";
}
_update() {
const h = this._hass, c = this._config;
// sockets
let sum = 0;
const parts = [];
c.plugs.forEach((p, i) => {
const el = this._e(`pl${i}`);
const sw = p.sw ? tbSt(h, p.sw) : undefined;
const w = p.p ? tbNum(h, p.p) : null;
const swOn = sw === "on";
const avail = p.sw ? tbOk(sw) : w !== null;
const run = w !== null ? w > 1 : swOn;
const on = p.sw ? swOn : w !== null;
if (w !== null && w > 0) {
sum += w;
if (w > 0.5) parts.push([p.name, w]);
}
const col = !on ? "#78909c" : w === null ? "#66bb6a" : w < 50 ? "#26c6da" : w < 500 ? "#66bb6a" : w < 1500 ? "#ffa726" : "#ef5350";
el.classList.toggle("off", !on);
el.classList.toggle("run", run && on);
el.style.setProperty("--pc", col);
el.style.setProperty("--sp", `${tbClamp(3 - Math.log10((w || 20) + 1) * 0.8, 0.35, 3).toFixed(2)}s`);
el.style.opacity = avail ? "" : ".5";
const val = w !== null ? tbW(w).split(" ") : [!avail ? "indisponibil" : swOn ? "Pornit" : "Oprit", ""];
const pv = `${val[0]}<small>${val[1] || ""}</small>`;
const pe = this._e(`pv${i}`);
if (pe._v !== pv) {
pe._v = pv;
pe.innerHTML = pv;
}
const d = [];
const v = p.v ? tbNum(h, p.v) : null, a = p.a ? tbNum(h, p.a) : null;
if (v !== null) d.push(`${tbF(v, 0)} V`);
if (a !== null) d.push(`${tbF(a, 2)} A`);
const e = p.e ? this._energy(p.e) : null;
if (e) d.push(`${e}${p.eLabel ? " " + p.eLabel : ""}`);
if (w !== null && p.sw) d.unshift(swOn ? "pornit" : "oprit");
this._h(`pd${i}`, d.map((x) => `<span>${x}</span>`).join(""));
});
this._t("ptot", `măsurat acum: ${tbW(sum)}`);
// phases
const hzs = [];
const phs = c.phases
.map(([lb, vid, fid, col], k) => {
const v = tbNum(h, vid), f = tbNum(h, fid);
if (f !== null) hzs.push(f);
const pos = v !== null ? tbClamp(((v - 207) / 46) * 100, 0, 100) : 50;
const path = this._e(`w${k}`);
const amp = v !== null ? 18 + tbClamp((v - 207) / 46, 0, 1) * 22 : 0;
const key = `${Math.round(amp)}`;
if (path._k !== key) {
path._k = key;
path.setAttribute("d", this._wave((k * 100) / 3, amp));
}
path.classList.toggle("off", v === null);
return `<div class="phc" style="--fc:${col}"><div class="l">${lb}</div><b>${v !== null ? tbF(v, 1) : "—"}</b> <small>V</small><div class="dv"><i style="left:${pos.toFixed(1)}%"></i></div><small>${f !== null ? tbF(f, 2) + " Hz" : ""}</small></div>`;
})
.join("");
this._h("phs", phs);
const hzAvg = hzs.length ? hzs.reduce((s, x) => s + x, 0) / hzs.length : null;
this._t("hz", hzAvg !== null ? `${tbF(hzAvg, 2)} Hz · normal 230 V ±10%` : "");
// distribution
const house = tbNum(h, c.house);
const houseW = house !== null ? house * 1000 : null;
this._t("house", houseW !== null ? `casa: ${tbW(houseW)}` : "");
parts.sort((x, y) => y[1] - x[1]);
const rest = houseW !== null ? Math.max(houseW - sum, 0) : 0;
const total = Math.max(houseW || 0, sum, 1);
const items = parts.map((p, k) => [p[0], p[1], TB_PWR_PAL[k % TB_PWR_PAL.length]]);
if (rest > 1) items.push(["Restul casei", rest, "#78909c"]);
const dsig = items.map((x) => `${x[0]}:${Math.round(x[1])}`).join("|");
if (dsig !== this._dsig) {
this._dsig = dsig;
this._h("db", items.map((x) => `<i style="width:${((x[1] / total) * 100).toFixed(2)}%;background:${x[2]}" title="${tbEsc(x[0])}"></i>`).join(""));
this._h("dl", items.map((x) => `<span style="--c:${x[2]}">${tbEsc(x[0])} ${tbW(x[1])}</span>`).join(""));
}
// lights
let lon = 0;
c.lights.forEach((l, i) => {
const st = h.states[l.e];
const el = this._e(`lt${i}`);
const ok = st && tbOk(st.state);
const on = ok && st.state === "on";
if (on) lon++;
el.classList.toggle("on", on);
el.style.opacity = ok ? "" : ".45";
let txt = !ok ? "indisponibil" : on ? "Aprinsă" : "Stinsă";
let br = on ? 1 : 0;
if (on && l.e.startsWith("light.")) {
const a = st.attributes;
el.style.setProperty("--lc", this._lightColor(st));
if (isFinite(a.brightness)) {
br = a.brightness / 255;
txt = `${Math.round(br * 100)}%`;
}
if (a.color_temp_kelvin && a.color_mode === "color_temp") txt += ` · ${a.color_temp_kelvin} K`;
const fx = a.effect && !["Solid", "None", "none", "off", "Off"].includes(a.effect);
if (fx) txt += ` · ${a.effect}`;
el.classList.toggle("fx", !!fx);
} else {
el.style.setProperty("--lc", "#ffd54f");
el.classList.remove("fx");
}
if (l.p && on) {
const w = tbNum(h, l.p);
if (w !== null) txt += ` · ${tbW(w)}`;
}
if (l.a && on) {
const ma = tbNum(h, l.a);
if (ma !== null) txt += ` · ${tbF(ma, 0)} mA`;
}
el.style.setProperty("--lb", tbClamp(br, 0.15, 1).toFixed(2));
this._t(`ls${i}`, txt);
this._e(`lb${i}`).style.width = `${(on ? tbClamp(br, 0.04, 1) : 0) * 100}%`;
});
this._t("lon", lon ? `${lon} aprinse` : "toate stinse");
}
async _loadSpark() {
if (!this._hass) return;
const c = this._config;
const ids = c.plugs.map((p) => p.p).filter(Boolean);
let hs = {};
try {
hs = await tbHistory(this._hass, ids, 6);
} catch (e) {
return;
}
const t1 = Date.now(), t0 = t1 - 6 * 3600e3;
c.plugs.forEach((p, i) => {
if (!p.p) return;
const pts = tbResample(hs[p.p], t0, t1, 5 * 60e3).filter((x) => x.v !== null);
if (pts.length < 2) return;
const hi = Math.max(...pts.map((x) => x.v), 1);
const W = 200, H = 60;
const d = tbPath(pts.map((x) => [((x.t - t0) / (t1 - t0)) * W, H - (x.v / hi) * (H - 4)]));
this._h(`ps${i}`, `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${d} L${W},${H} L0,${H} Z" fill="var(--pc)" opacity=".5"/><path d="${d}" fill="none" stroke="var(--pc)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`);
});
}
}
customElements.get("tb-power-card") || customElements.define("tb-power-card", TbPowerCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "tb-power-card", name: "Tablet · Sockets and lights", description: "Sockets (V, A, W, kWh), 3-phase mains, lights and LED strips — animated" });
