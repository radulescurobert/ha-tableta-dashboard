/* ================================================================
*  AIR — Xiaomi purifiers + dehumidifier — custom:tb-air-card
*  >>> Configure in defaults() below (or pass `purifiers:` and `dehum:` from the dashboard YAML).
*  Purifiers use the Xiaomi Miot integration (entity ids contain the device model + a numeric id, e.g. zhimi_de_XXXXXXXXX_vb4).
*  Replace YOUR_PURIFIER_1 / YOUR_PURIFIER_2 below with the prefix of your own entities (look at your entity ids: sensor.<prefix>_pm2_5_density_p_3_4).
*  Any key may be removed if you don't have that entity (the card hides missing ones).
* ================================================================ */
const TB_AIR_CSS = `
.g { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; height: 100%; }
.dv { display: flex; flex-direction: column; gap: 8px; min-height: 0; padding: 11px 13px; animation: tbFade .5s both; --ac: #66bb6a; }
.dv.off .hero svg { filter: grayscale(.85); opacity: .6; }
.dv.na { opacity: .9; }
.hd { display: flex; align-items: center; gap: 9px; }
.hd .nm { flex: 1; min-width: 0; }
.hd b { display: block; font-size: 1.12rem; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chip { display: inline-flex; align-items: center; gap: 5px; margin-top: 3px; padding: 2px 9px; border-radius: 99px; font-size: .72rem; font-weight: 700;
background: color-mix(in srgb, var(--ac) 22%, transparent); color: var(--ac); white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.chip i { width: 7px; height: 7px; border-radius: 50%; background: var(--ac); flex: 0 0 7px; }
.dv.run .chip i { animation: tbPulse 1.2s infinite; }
.pw { flex: 0 0 44px; height: 44px; border-radius: 50%; border: none; display: grid; place-items: center; background: color-mix(in srgb, var(--primary-text-color) 9%, transparent); transition: background .4s, box-shadow .4s; }
.pw ha-icon { --mdc-icon-size: 24px; }
.dv.run .pw { background: var(--ac); color: #fff; box-shadow: 0 0 16px color-mix(in srgb, var(--ac) 60%, transparent); }
.pw:active { transform: scale(.93); }
.hero { position: relative; display: grid; grid-template-columns: 112px 1fr; gap: 6px; align-items: center; height: 168px; flex: 0 0 auto; }
.hero svg.dev { width: 112px; height: 168px; overflow: visible; }
.blades { transform-box: fill-box; transform-origin: center; }
.dv.run .blades { animation: tbSpin var(--sp, 1.2s) linear infinite; }
.pt2 { opacity: 0; }
.dv.run .pt2 { animation: aSuck var(--pd, 3s) ease-in infinite; }
@keyframes aSuck { 0% { opacity: 0; transform: translate(var(--x0), var(--y0)); } 20% { opacity: .9; } 100% { opacity: 0; transform: translate(0, 0) scale(.3); } }
.wv { fill: none; stroke: var(--ac); stroke-width: 2.5; stroke-linecap: round; opacity: 0; }
.dv.run .wv { animation: aRise 2.4s ease-out infinite; }
@keyframes aRise { 0% { opacity: 0; transform: translateY(8px); } 30% { opacity: .85; } 100% { opacity: 0; transform: translateY(-8px); } }
.drop2 { opacity: 0; }
.dv.run .drop2 { animation: aDrop 1.6s ease-in infinite; }
@keyframes aDrop { 0% { opacity: 0; transform: translateY(0); } 15% { opacity: 1; } 100% { opacity: 0; transform: translateY(34px); } }
.tankw { transition: y 1.5s, height 1.5s; }
.dv.run .tankw { animation: aSlosh 3s ease-in-out infinite; }
@keyframes aSlosh { 50% { transform: translateY(-1.5px); } }
.mist { opacity: 0; }
.dv.run .mist { animation: aMist 3.2s ease-in infinite; }
@keyframes aMist { 0% { opacity: 0; transform: translateX(-24px); } 30% { opacity: .7; } 100% { opacity: 0; transform: translateX(6px); } }
.led { transition: fill .6s; }
.dv.run .led { animation: tbPulse 2.2s infinite; }
.ring { position: relative; justify-self: center; width: 150px; height: 150px; }
.ring svg { width: 100%; height: 100%; transform: rotate(135deg); }
.ring .tr { fill: none; stroke: color-mix(in srgb, var(--primary-text-color) 10%, transparent); stroke-width: 11; stroke-linecap: round; }
.ring .vl { fill: none; stroke: var(--ac); stroke-width: 11; stroke-linecap: round; transition: stroke-dasharray 1.2s, stroke .8s; filter: drop-shadow(0 0 6px color-mix(in srgb, var(--ac) 60%, transparent)); }
.ring .tg { fill: none; stroke: var(--primary-text-color); stroke-width: 15; stroke-linecap: butt; opacity: .85; transition: stroke-dashoffset 1s; }
.ring .c { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.ring .c b { font-size: 2.5rem; font-weight: 300; line-height: 1; font-variant-numeric: tabular-nums; }
.ring .c small { font-size: .7rem; color: var(--secondary-text-color); }
.ring .c span { font-size: .78rem; font-weight: 800; color: var(--ac); margin-top: 2px; text-transform: uppercase; letter-spacing: .05em; }
.kv { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; flex: 0 0 auto; }
.kv div { border-radius: 10px; padding: 4px 7px; background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); min-width: 0; }
.kv span { display: block; font-size: .6rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kv b { font-size: .88rem; white-space: nowrap; font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; display: block; }
.flt { display: flex; align-items: center; gap: 8px; border-radius: 10px; padding: 5px 8px; background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); flex: 0 0 auto; }
.flt .bar { flex: 1; height: 8px; border-radius: 4px; background: color-mix(in srgb, var(--primary-text-color) 10%, transparent); overflow: hidden; }
.flt .bar i { display: block; height: 100%; border-radius: 4px; transform-origin: left; animation: tbGrowX 1.2s both; }
.flt.low .bar i { animation: tbGrowX 1.2s both, tbPulse 1s 1.2s infinite; }
.flt span { font-size: .7rem; white-space: nowrap; }
.flt b { font-size: .8rem; }
.flt ha-icon { --mdc-icon-size: 17px; color: var(--secondary-text-color); }
.flt.low ha-icon, .flt.low b { color: #ef5350; }
.ch { position: relative; flex: 1; min-height: 46px; border-radius: 10px; background: color-mix(in srgb, var(--primary-text-color) 4%, transparent); overflow: hidden; }
.ch svg { position: absolute; inset: 14px 0 0 0; width: 100%; height: calc(100% - 14px); }
.ch .l { position: absolute; left: 8px; top: 2px; font-size: .6rem; color: var(--secondary-text-color); }
.ch .r { position: absolute; right: 8px; top: 2px; font-size: .6rem; color: var(--secondary-text-color); }
.set { display: grid; grid-template-columns: auto 1fr; gap: 5px 8px; align-items: center; flex: 0 0 auto; }
.set > span { font-size: .62rem; font-weight: 700; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
.chs { display: flex; gap: 4px; min-width: 0; }
.chs button { flex: 1; border: none; border-radius: 8px; padding: 4px 2px; font-size: .68rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); transition: background .3s, color .3s; }
.chs button.on { background: var(--ac); color: #fff; box-shadow: 0 0 10px color-mix(in srgb, var(--ac) 45%, transparent); }
.chs button[disabled] { opacity: .35; }
.stp { display: flex; align-items: center; gap: 6px; }
.stp button { flex: 0 0 30px; height: 24px; border: none; border-radius: 8px; font-weight: 800; background: color-mix(in srgb, var(--primary-text-color) 9%, transparent); }
.stp .lv { flex: 1; height: 8px; border-radius: 4px; background: color-mix(in srgb, var(--primary-text-color) 10%, transparent); overflow: hidden; position: relative; }
.stp .lv i { position: absolute; inset: 0 auto 0 0; background: linear-gradient(90deg, color-mix(in srgb, var(--ac) 45%, transparent), var(--ac)); border-radius: 4px; transition: width .6s; }
.stp b { flex: 0 0 auto; min-width: 34px; text-align: center; font-size: .8rem; font-variant-numeric: tabular-nums; }
.tg2 { display: flex; gap: 4px; flex-wrap: wrap; }
.tg2 button { border: none; border-radius: 99px; padding: 3px 9px; font-size: .66rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;
background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); color: var(--secondary-text-color); }
.tg2 button ha-icon { --mdc-icon-size: 14px; }
.tg2 button.on { background: color-mix(in srgb, var(--ac) 24%, transparent); color: var(--ac); }
.warn { display: none; align-items: center; gap: 6px; padding: 4px 9px; border-radius: 9px; background: #ef535026; color: #ef5350; font-size: .72rem; font-weight: 700; flex: 0 0 auto; }
.warn.on { display: flex; animation: tbPulse 1.8s infinite; }
.warn ha-icon { --mdc-icon-size: 16px; }
.offl { display: none; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-align: center; padding: 8px; border-radius: 12px;
background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); color: var(--secondary-text-color); font-size: .76rem; flex: 0 0 auto; }
.offl ha-icon { --mdc-icon-size: 28px; animation: tbPulse 2.4s infinite; }
.offl b { color: var(--primary-text-color); font-size: .86rem; }
.dv.na .offl { display: flex; }
.dv.na .ctl2 { opacity: .35; pointer-events: none; }
@media (max-height: 760px) {
.g { gap: 9px; } .dv { gap: 6px; padding: 9px 11px; } .hero { height: 140px; grid-template-columns: 94px 1fr; } .hero svg.dev { width: 94px; height: 140px; }
.ring { width: 128px; height: 128px; } .ring .c b { font-size: 2.1rem; } .pw { flex-basis: 38px; height: 38px; } .kv b { font-size: .82rem; } .set { gap: 4px 7px; }
}
@media (max-width: 899px), (orientation: portrait) { .g { grid-template-columns: 1fr; } .ch { min-height: 80px; } }
`;
const TB_AQ = [
[12, "#66bb6a", "Excelent"],
[35, "#d4e157", "Bun"],
[55, "#ffa726", "Moderat"],
[150, "#ef5350", "Poluat"],
[250, "#ab47bc", "Foarte poluat"],
[1e9, "#6d4c41", "Periculos"],
];
const tbAq = (v) => (v === null ? ["#90a4ae", "—"] : (TB_AQ.find((x) => v <= x[0]) || TB_AQ[5]).slice(1));
const TB_AIR_MODE = { Auto: "Auto", Sleep: "Noapte", Manual: "Manual", Level: "Favorit", Favorite: "Favorit" };
const tbArc = (pct, r = 62, sweep = 270) => {
const c = 2 * Math.PI * r;
const L = (c * sweep) / 360;
return [`${(L * tbClamp(pct, 0, 1)).toFixed(1)} ${c.toFixed(1)}`, L, c];
};
class TbAirCard extends TbBase {
static defaults() {
// Prefixes = the part of your Xiaomi Miot entity ids between "sensor." and "_pm2_5_density..." (model + device number).
const lv = "YOUR_PURIFIER_1", dm = "YOUR_PURIFIER_2";
return {
purifiers: [
{
name: "Purifier 1", color: "#26c6da", power: `fan.${lv}_s_2_air_purifier`, mode_fan: `fan.${lv}_s_2_air_purifier`,
pm25: `sensor.${lv}_pm2_5_density_p_3_4`, pm10: `sensor.${lv}_pm10_density_p_3_8`, temp: `sensor.${lv}_temperature_p_3_7`, hum: `sensor.${lv}_relative_humidity_p_3_1`,
filter: `sensor.${lv}_filter_life_level_p_4_1`, filter_left: `sensor.${lv}_filter_left_time_p_4_4`, filter_used: `sensor.${lv}_filter_used_time_p_4_3`,
rpm: `sensor.${lv}_moto_speed_rpm_p_9_1`, fault: `sensor.${lv}_fault_p_2_2`, volume: `sensor.${lv}_purify_volume_p_11_1`, avg: `sensor.${lv}_average_aqi_p_11_2`,
door: `binary_sensor.${lv}_buttom_door_p_9_6`, manual: `select.${lv}_manual_level_p_9_9`, fav: `number.${lv}_fan_level_p_15_1`,
toggles: [["Ionizare", `switch.${lv}_anion_p_2_6`, "mdi:atom-variant"], ["Sunet", `switch.${lv}_alarm_p_6_1`, "mdi:volume-high"], ["Blocare", `switch.${lv}_physical_controls_locked_p_8_1`, "mdi:lock"]],
brightness: `select.${lv}_brightness_p_13_2`,
},
{
name: "Purifier 2", color: "#ab47bc", power: `switch.${dm}_on_p_2_1`, mode_select: `select.${dm}_mode_p_2_4`,
pm25: `sensor.${dm}_pm2_5_density_p_3_4`, filter: `sensor.${dm}_filter_life_level_p_4_1`, filter_left: `sensor.${dm}_filter_left_time_p_4_4`,
filter_used: `sensor.${dm}_filter_used_time_p_4_3`, rpm: `sensor.${dm}_motor_speed_rpm_p_9_1`, fault: `sensor.${dm}_fault_p_2_2`, fav: `number.${dm}_favorite_level_p_9_11`,
toggles: [["Sunet", `switch.${dm}_alarm_p_6_1`, "mdi:volume-high"], ["Blocare", `switch.${dm}_physical_controls_locked_p_8_1`, "mdi:lock"]],
brightness: `select.${dm}_brightness_p_13_2`,
},
],
dehum: {
name: "Dehumidifier", color: "#29b6f6", humidifier: "humidifier.YOUR_DEHUMIDIFIER", fan: "fan.YOUR_DEHUMIDIFIER", hum: "sensor.YOUR_DEHUMIDIFIER_HUMIDITY",
timer: "select.YOUR_DEHUMIDIFIER_TIMER", temp_error: "binary_sensor.YOUR_DEHUMIDIFIER_TEMPERATURE_ERROR",
toggles: [["Ionizare", "switch.YOUR_DEHUMIDIFIER_IONIZER", "mdi:atom-variant"], ["Blocare", "switch.YOUR_DEHUMIDIFIER_CHILD_LOCK", "mdi:lock"]],
},
};
}
_purHtml(p, i) {
const k = `p${i}_`;
let parts = "";
for (let j = 0; j < 9; j++) {
const side = j % 2 ? 1 : -1;
const x0 = side * (26 + (j * 7) % 18), y0 = -20 + ((j * 23) % 50);
parts += `<circle class="pt2" r="${1.6 + (j % 3) * 0.6}" cx="${side > 0 ? 88 : 24}" cy="${120 + (j % 4) * 8}" fill="#bcaaa4" style="--x0:${x0}px;--y0:${y0}px;animation-delay:${(j * 0.37).toFixed(2)}s" id="${k}pt${j}"/>`;
}
const waves = [0, 1, 2].map((j) => `<path class="wv" d="M${38 + j * 18} 27 q-4 -5 0 -10 q4 -5 0 -10" style="animation-delay:${j * 0.8}s"/>`).join("");
const dev = `<svg class="dev" viewBox="0 0 112 168">
${waves}
<rect x="22" y="30" width="68" height="132" rx="16" fill="#eceff1" stroke="#b0bec5" stroke-width="1.5"/>
<ellipse cx="56" cy="38" rx="28" ry="7" fill="#cfd8dc"/>
<g transform="translate(56 38)"><g class="blades"><path d="M0 0 L-3 -6 Q0 -9 3 -6Z M0 0 L6 -3 Q9 0 6 3Z M0 0 L3 6 Q0 9 -3 6Z M0 0 L-6 3 Q-9 0 -6 -3Z" fill="#78909c" transform="scale(2.3 .55)"/></g></g>
<rect x="38" y="58" width="36" height="20" rx="6" fill="#263238"/><text x="56" y="72" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ac)" id="${k}scr">—</text>
<circle class="led" cx="56" cy="88" r="3" fill="var(--ac)"/>
${Array.from({ length: 7 }, (_, j) => `<line x1="30" x2="82" y1="${102 + j * 7}" y2="${102 + j * 7}" stroke="#cfd8dc" stroke-width="2.2" stroke-linecap="round"/>`).join("")}
<g transform="translate(0 0)">${parts}</g>
</svg>`;
const modes = `<div class="chs" id="${k}md"></div>`;
const tg = `<div class="tg2" id="${k}tg"></div>`;
return `<div class="pn dv" id="${k}box" style="--pc:${p.color};animation-delay:${i * 0.08}s">
<div class="hd"><div class="nm"><b>${tbEsc(p.name)}</b><div class="chip"><i></i><span id="${k}st">—</span></div></div><button class="pw" data-k="pw" data-d="${k}"><ha-icon icon="mdi:power"></ha-icon></button></div>
<div class="warn" id="${k}wr"><ha-icon icon="mdi:alert"></ha-icon><span id="${k}wt"></span></div>
<div class="hero">${dev}<div class="ring"><svg viewBox="0 0 150 150"><circle class="tr" cx="75" cy="75" r="62" id="${k}rt"/><circle class="vl" cx="75" cy="75" r="62" id="${k}rv"/></svg>
<div class="c"><b id="${k}v">—</b><small>PM2.5 µg/m³</small><span id="${k}q">—</span></div></div></div>
<div class="kv" id="${k}kv"></div>
<div class="flt" id="${k}fl"><ha-icon icon="mdi:air-filter"></ha-icon><span>Filtru <b id="${k}fp">—</b></span><span class="bar"><i id="${k}fb"></i></span><span id="${k}fd">—</span></div>
<div class="ch"><span class="l">PM2.5 · ultimele 24 h</span><span class="r" id="${k}cr"></span><div id="${k}ch"></div></div>
<div class="set ctl2"><span>Mod</span>${modes}<span>Nivel</span><div id="${k}lvw"></div><span>Ecran</span><div class="chs" id="${k}br"></div></div>
${tg}</div>`;
}
_dehHtml(d) {
const k = "d_";
let drops = "";
for (let j = 0; j < 4; j++) drops += `<path class="drop2" d="M${46 + j * 7} 104 q-2.5 4 0 6 q2.5 -2 0 -6z" fill="#4fc3f7" style="animation-delay:${(j * 0.4).toFixed(1)}s"/>`;
let mist = "";
for (let j = 0; j < 5; j++) mist += `<circle class="mist" cx="${22}" cy="${60 + j * 10}" r="${3 + (j % 2)}" fill="#90caf9" style="animation-delay:${(j * 0.6).toFixed(1)}s"/>`;
const dev = `<svg class="dev" viewBox="0 0 112 168">
${mist}
<rect x="22" y="22" width="70" height="140" rx="12" fill="#eceff1" stroke="#b0bec5" stroke-width="1.5"/>
<rect x="30" y="30" width="54" height="22" rx="5" fill="#263238"/><text x="57" y="46" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ac)" id="${k}scr">—</text>
${Array.from({ length: 5 }, (_, j) => `<line x1="30" x2="84" y1="${62 + j * 6}" y2="${62 + j * 6}" stroke="#cfd8dc" stroke-width="2.2" stroke-linecap="round"/>`).join("")}
<g transform="translate(57 76)"><g class="blades"><circle r="2.5" fill="#78909c"/><path d="M0 0 L-3 -9 Q0 -12 3 -9Z M0 0 L9 -3 Q12 0 9 3Z M0 0 L3 9 Q0 12 -3 9Z M0 0 L-9 3 Q-12 0 -9 -3Z" fill="#90a4ae" opacity=".7"/></g></g>
${drops}
<rect x="32" y="118" width="50" height="38" rx="6" fill="#b3e5fc33" stroke="#81d4fa" stroke-width="1.5"/>
<rect class="tankw" id="${k}tank" x="34" y="146" width="46" height="8" rx="4" fill="#29b6f6" opacity=".75"/>
<circle class="led" cx="84" cy="27" r="2.5" fill="var(--ac)"/>
</svg>`;
return `<div class="pn dv" id="${k}box" style="animation-delay:.16s">
<div class="hd"><div class="nm"><b>${tbEsc(d.name)}</b><div class="chip"><i></i><span id="${k}st">—</span></div></div><button class="pw" data-k="pw" data-d="${k}"><ha-icon icon="mdi:power"></ha-icon></button></div>
<div class="warn" id="${k}wr"><ha-icon icon="mdi:cup-water"></ha-icon><span id="${k}wt"></span></div>
<div class="hero">${dev}<div class="ring"><svg viewBox="0 0 150 150"><circle class="tr" cx="75" cy="75" r="62" id="${k}rt"/><circle class="vl" cx="75" cy="75" r="62" id="${k}rv"/><circle class="tg" cx="75" cy="75" r="62" id="${k}rg"/></svg>
<div class="c"><b id="${k}v">—</b><small>umiditate %</small><span id="${k}q">—</span></div></div></div>
<div class="offl"><ha-icon icon="mdi:power-plug-off-outline"></ha-icon><b id="${k}of">Offline</b><span id="${k}ol"></span></div>
<div class="ch"><span class="l">Umiditate · ultimele 3 zile</span><span class="r" id="${k}cr"></span><div id="${k}ch"></div></div>
<div class="set ctl2"><span>Țintă</span><div class="stp"><button data-k="tgt" data-v="-5">−</button><span class="lv"><i id="${k}tl"></i></span><b id="${k}tv">—</b><button data-k="tgt" data-v="5">+</button></div>
<span>Ventilator</span><div class="chs" id="${k}fn"></div><span>Oprire</span><div class="chs" id="${k}tm"></div></div>
<div class="tg2 ctl2" id="${k}tg"></div></div>`;
}
_build() {
const c = this._config;
this.shadowRoot.innerHTML = `<style>${TB_BASE_CSS}${TB_AIR_CSS}</style><ha-card><div class="g">${c.purifiers.map((p, i) => this._purHtml(p, i)).join("")}${this._dehHtml(c.dehum)}</div></ha-card>`;
const [tL, , tC] = tbArc(1);
this.shadowRoot.querySelectorAll(".ring .tr").forEach((e) => e.setAttribute("stroke-dasharray", `${tL.split(" ")[0]} ${tC}`));
this.shadowRoot.querySelector(".g").addEventListener("click", (ev) => this._click(ev));
this._hist = {};
}
_dev(key) {
const c = this._config;
return key === "d_" ? c.dehum : c.purifiers[+key[1]];
}
_click(ev) {
const b = ev.target.closest("button");
if (!b) return;
const box = b.closest(".dv");
const key = box.id.replace("box", "");
const d = this._dev(key);
const h = this._hass;
const k = b.dataset.k;
if (k === "pw") return this._svc("homeassistant", "toggle", { entity_id: d.power || d.humidifier });
if (k === "mode") {
if (d.mode_fan) return this._svc("fan", "set_preset_mode", { entity_id: d.mode_fan, preset_mode: b.dataset.v });
return this._svc("select", "select_option", { entity_id: d.mode_select, option: b.dataset.v });
}
if (k === "man") return this._svc("select", "select_option", { entity_id: d.manual, option: b.dataset.v });
if (k === "fav") {
const cur = tbNum(h, d.fav) || 0;
const mx = tbAt(h, d.fav, "max") ?? 14, mn = tbAt(h, d.fav, "min") ?? 0;
return this._svc("number", "set_value", { entity_id: d.fav, value: tbClamp(cur + +b.dataset.v, mn, mx) });
}
if (k === "br") return this._svc("select", "select_option", { entity_id: d.brightness, option: b.dataset.v });
if (k === "tog") return this._svc("switch", "toggle", { entity_id: b.dataset.e });
if (k === "tgt") {
const cur = tbAt(h, d.humidifier, "humidity") ?? 50;
const mn = tbAt(h, d.humidifier, "min_humidity") ?? 25, mx = tbAt(h, d.humidifier, "max_humidity") ?? 80;
return this._svc("humidifier", "set_humidity", { entity_id: d.humidifier, humidity: tbClamp(Math.round((cur + +b.dataset.v) / 5) * 5, mn, mx) });
}
if (k === "fan") return this._svc("fan", "set_percentage", { entity_id: d.fan, percentage: +b.dataset.v });
if (k === "tm") return this._svc("select", "select_option", { entity_id: d.timer, option: b.dataset.v });
}
_onStart() {
this._loadHist();
this._every(600e3, () => this._loadHist());
}
_chips(id, opts, cur, key, dict = {}, dis = false) {
this._h(id, opts.map((o) => `<button data-k="${key}" data-v="${tbEsc(o)}" class="${String(o) === String(cur) ? "on" : ""}"${dis ? " disabled" : ""}>${tbEsc(dict[o] || o)}</button>`).join(""));
}
_toggles(id, list) {
const h = this._hass;
this._h(id, list.filter((t) => h.states[t[1]]).map(([n, e, ic]) => `<button data-k="tog" data-e="${e}" class="${tbSt(h, e) === "on" ? "on" : ""}"><ha-icon icon="${ic}"></ha-icon>${n}</button>`).join(""));
}
_update() {
const h = this._hass, c = this._config;
c.purifiers.forEach((p, i) => this._updPur(p, i, h));
this._updDeh(c.dehum, h);
}
_updPur(p, i, h) {
const k = `p${i}_`;
const box = this._e(`${k}box`);
const ps = tbSt(h, p.power);
const avail = tbOk(ps);
const on = ps === "on";
const pm = tbNum(h, p.pm25);
const [col, lbl] = tbAq(pm);
box.style.setProperty("--ac", on ? col : "#90a4ae");
box.classList.toggle("run", on);
box.classList.toggle("off", !on);
const mode = p.mode_fan ? tbAt(h, p.mode_fan, "preset_mode") : tbSt(h, p.mode_select);
this._t(`${k}st`, !avail ? "indisponibil" : on ? `Pornit · ${TB_AIR_MODE[mode] || mode || ""}` : "Oprit");
const rpm = tbNum(h, p.rpm);
box.style.setProperty("--sp", `${tbClamp(500 / Math.max(rpm || 400, 100), 0.12, 2).toFixed(2)}s`);
box.style.setProperty("--pd", `${tbClamp(4 - (rpm || 400) / 600, 1.2, 4).toFixed(2)}s`);
const np = pm === null ? 2 : tbClamp(Math.round(2 + pm / 6), 2, 9);
for (let j = 0; j < 9; j++) {
const e = this._e(`${k}pt${j}`);
if (e) e.style.display = j < np ? "" : "none";
}
this._t(`${k}scr`, pm !== null ? Math.round(pm) : "—");
this._t(`${k}v`, pm !== null ? Math.round(pm) : "—");
this._t(`${k}q`, lbl);
const [da] = tbArc((pm || 0) / 75);
this._a(`${k}rv`, "stroke-dasharray", da);
const fault = tbSt(h, p.fault);
const door = p.door && tbSt(h, p.door) === "on";
const flt = tbNum(h, p.filter);
const w = [];
if (tbOk(fault) && !/no fault/i.test(fault)) w.push(fault);
if (door) w.push("Capacul filtrului e deschis");
if (flt !== null && flt <= 10) w.push(`Filtrul trebuie schimbat (${Math.round(flt)}%)`);
this._c(`${k}wr`, "on", w.length);
this._t(`${k}wt`, w.join(" · "));
const kv = [];
const add = (l, v) => kv.push(`<div><span>${l}</span><b>${v}</b></div>`);
if (p.pm10) add("PM10", `${tbF(tbNum(h, p.pm10), 0)} µg/m³`);
if (p.temp) add("Temperatură", `${tbF(tbNum(h, p.temp), 1)} °C`);
if (p.hum) add("Umiditate", `${tbF(tbNum(h, p.hum), 0)} %`);
add("Turație", rpm !== null ? `${Math.round(rpm)} rpm` : "—");
if (p.avg) add("AQI mediu", tbF(tbNum(h, p.avg), 0));
if (p.volume) {
const v = tbNum(h, p.volume);
add("Aer purificat", v === null ? "—" : v >= 1e6 ? `${tbF(v / 1e6, 2)} mil. m³` : `${tbF(v / 1000, 0)} mii m³`);
}
const used = tbNum(h, p.filter_used);
if (!p.pm10 && used !== null) add("Filtru folosit", `${tbF(used, 0)} h`);
if (!p.pm10) add("Calitate", lbl);
this._h(`${k}kv`, kv.join(""));
const fc = flt === null ? "#90a4ae" : flt <= 10 ? "#ef5350" : flt <= 30 ? "#ffa726" : "#66bb6a";
this._t(`${k}fp`, flt !== null ? `${Math.round(flt)}%` : "—");
const fb = this._e(`${k}fb`);
fb.style.width = `${flt !== null ? tbClamp(flt, 2, 100) : 0}%`;
fb.style.background = fc;
this._c(`${k}fl`, "low", flt !== null && flt <= 10);
const left = tbNum(h, p.filter_left);
this._t(`${k}fd`, left !== null ? `${Math.round(left)} zile rămase` : "—");
const opts = p.mode_fan ? tbAt(h, p.mode_fan, "preset_modes") || [] : tbAt(h, p.mode_select, "options") || [];
this._chips(`${k}md`, opts, mode, "mode", TB_AIR_MODE, !on);
let lvh = "";
if (p.manual && h.states[p.manual] && mode === "Manual") {
const mo = tbAt(h, p.manual, "options") || [];
lvh = `<div class="chs">${mo.map((o) => `<button data-k="man" data-v="${o}" class="${tbSt(h, p.manual) === o ? "on" : ""}"${on ? "" : " disabled"}>${o.replace("Level", "Nivel ")}</button>`).join("")}</div>`;
} else if (p.fav && h.states[p.fav]) {
const v = tbNum(h, p.fav), mx = tbAt(h, p.fav, "max") ?? 14;
lvh = `<div class="stp"><button data-k="fav" data-v="-1">−</button><span class="lv"><i style="width:${((v || 0) / mx) * 100}%"></i></span><b>${v !== null ? Math.round(v) : "—"}/${mx}</b><button data-k="fav" data-v="1">+</button></div>`;
}
this._h(`${k}lvw`, lvh);
this._chips(`${k}br`, tbAt(h, p.brightness, "options") || [], tbSt(h, p.brightness), "br", { Off: "Stins", Dim: "Slab", On: "Aprins" });
this._toggles(`${k}tg`, p.toggles || []);
this._chart(k, p.pm25, (v) => tbAq(v)[0], 0);
}
_updDeh(d, h) {
const k = "d_";
const box = this._e(`${k}box`);
const hs = h.states[d.humidifier];
const avail = hs && tbOk(hs.state);
const on = avail && hs.state === "on";
box.classList.toggle("na", !avail);
box.classList.toggle("run", on);
box.classList.toggle("off", !on);
let cur = tbNum(h, d.hum);
if (cur === null && hs) cur = isFinite(hs.attributes.current_humidity) ? hs.attributes.current_humidity : null;
const last = this._lastHum;
const shown = cur !== null ? cur : last ? last.v : null;
const tgt = hs && isFinite(hs.attributes.humidity) ? hs.attributes.humidity : null;
const col = shown === null ? "#90a4ae" : shown > 65 ? "#29b6f6" : shown > 55 ? "#26c6da" : shown >= 40 ? "#66bb6a" : "#ffa726";
box.style.setProperty("--ac", avail ? col : "#90a4ae");
const fanp = tbAt(h, d.fan, "percentage");
/* this dehumidifier reports "tank full" through the temperature_error sensor; adjust if yours differs */
const full = tbSt(h, d.temp_error) === "on";
this._t(`${k}st`, !avail ? "Offline" : full ? "Rezervor plin" : on ? `Usucă · ventilator ${fanp >= 100 ? "mare" : "mic"}` : "Oprit");
if (full && avail) box.style.setProperty("--ac", "#ef5350");
this._t(`${k}v`, shown !== null ? Math.round(shown) : "—");
this._t(`${k}scr`, shown !== null ? `${Math.round(shown)}%` : "--");
this._t(`${k}q`, !avail ? (last ? "ultima valoare" : "—") : shown > 65 ? "Prea umed" : shown > 55 ? "Umed" : shown >= 40 ? "Ideal" : "Uscat");
const [da, L, C] = tbArc((shown || 0) / 100);
this._a(`${k}rv`, "stroke-dasharray", da);
const tg = this._e(`${k}rg`);
if (tgt !== null && avail) {
tg.style.display = "";
tg.setAttribute("stroke-dasharray", `2 ${C}`);
tg.setAttribute("stroke-dashoffset", (-(L * tgt) / 100 + 1).toFixed(1));
} else tg.style.display = "none";
const tank = this._e(`${k}tank`);
const lvl = full ? 34 : on ? 14 : 8;
tank.setAttribute("y", 154 - lvl);
tank.setAttribute("height", lvl);
this._t(`${k}tv`, tgt !== null ? `${tgt}%` : "—");
const mn = (hs && hs.attributes.min_humidity) || 25, mx = (hs && hs.attributes.max_humidity) || 80;
this._e(`${k}tl`).style.width = tgt !== null ? `${((tgt - mn) / (mx - mn)) * 100}%` : "0";
this._chips(`${k}fn`, [50, 100], fanp, "fan", { 50: "Mic", 100: "Mare" }, !on);
this._chips(`${k}tm`, tbAt(h, d.timer, "options") || ["cancel", "1h", "2h", "3h"], tbSt(h, d.timer), "tm", { cancel: "Fără", "1h": "1 h", "2h": "2 h", "3h": "3 h" }, !on);
this._toggles(`${k}tg`, d.toggles);
this._c(`${k}wr`, "on", full);
this._t(`${k}wt`, full ? "Rezervor plin — golește apa" : "");
this._t(`${k}of`, "Dezumidificatorul e offline");
this._t(`${k}ol`, `${hs ? "din " + this._fmtDay(hs.last_changed) : ""}${last ? ` · ultima umiditate ${Math.round(last.v)}% (${this._fmtDay(last.t)})` : ""} · verifică priza și Wi-Fi-ul`);
this._chart(k, d.hum, () => "#29b6f6", 1);
}
_fmtDay(t) {
const d = new Date(t);
return `${d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" })} ${tbHHMM(d)}`;
}
async _loadHist() {
const c = this._config;
if (!this._hass) return;
const ids24 = c.purifiers.map((p) => p.pm25);
try {
const a = await tbHistory(this._hass, ids24, 24);
const b = await tbHistory(this._hass, [c.dehum.hum], 24 * 10);
this._hist = Object.assign({}, a, b);
const hp = b[c.dehum.hum] || [];
this._lastHum = hp.length ? hp[hp.length - 1] : null;
this._chartSig = {};
this._update();
} catch (e) {
/* no history */
}
}
_chart(k, id, colFn, mode) {
const pts0 = (this._hist || {})[id] || [];
const t1 = Date.now(), t0 = t1 - (mode ? 3 * 864e5 : 864e5);
const pts = tbResample(pts0, t0, t1, mode ? 30 * 60e3 : 10 * 60e3).filter((x) => x.v !== null);
const sig = `${pts.length}:${pts.length ? pts[pts.length - 1].v : ""}`;
this._chartSig = this._chartSig || {};
if (this._chartSig[k] === sig) return;
this._chartSig[k] = sig;
if (pts.length < 2) {
this._h(`${k}ch`, `<svg viewBox="0 0 300 60" preserveAspectRatio="none"><text x="150" y="34" text-anchor="middle" font-size="11" fill="currentColor" opacity=".4">fără date recente</text></svg>`);
this._t(`${k}cr`, "");
return;
}
const vals = pts.map((x) => x.v);
const hi = Math.max(...vals, mode ? 80 : 20), lo = mode ? Math.min(...vals, 30) : 0;
const W = 300, H = 60;
const xy = pts.map((x) => [((x.t - t0) / (t1 - t0)) * W, H - 3 - ((x.v - lo) / (hi - lo || 1)) * (H - 8)]);
const d = tbPath(xy);
const last = vals[vals.length - 1], c0 = colFn(last);
const gid = `g${k}`;
this._h(
`${k}ch`,
`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c0}" stop-opacity=".45"/><stop offset="1" stop-color="${c0}" stop-opacity="0"/></linearGradient></defs>
<path d="${d} L${W},${H} L0,${H} Z" fill="url(#${gid})"/><path d="${d}" fill="none" stroke="${c0}" stroke-width="2" vector-effect="non-scaling-stroke" class="draw" style="--len:900"/></svg>`
);
this._t(`${k}cr`, `min ${tbF(Math.min(...vals), 0)} · max ${tbF(Math.max(...vals), 0)}`);
}
}
TbAirCard.fitH = 630;
customElements.get("tb-air-card") || customElements.define("tb-air-card", TbAirCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "tb-air-card", name: "Tablet · Air", description: "Xiaomi purifiers and dehumidifier — animated" });
