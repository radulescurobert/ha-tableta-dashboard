/* ================================================================
*  SENSORS  (custom:tb-sensors-card)
*  >>> Replace the example rows in defaults() below (or pass the arrays from the dashboard YAML). Add/remove rows freely.
*      climate : [label, temperature entity, humidity entity (or null), battery entity (or null), icon]
*      openings: [label, binary_sensor, battery entity (or null), "door" | "window"]
*      motion  : [label, binary_sensor, battery entity (or null)]
*      flood   : [label, binary_sensor (on = water), battery entity (or null)]
*      cameras : [label, [binary_sensor of detection 1, binary_sensor of detection 2, ...]]
*  The "Batteries" list is automatic: every sensor with device_class battery (except entities containing the strings in battery_exclude).
* ================================================================ */
const TB_SENS_CSS = `
.wrap { display: flex; flex-direction: column; gap: 10px; height: 100%; }
.sum { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; flex: 0 0 auto; }
.sc { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 16px; background: var(--card-background-color);
border: 1px solid color-mix(in srgb, var(--cc) 35%, transparent); animation: tbFade .5s both; }
.sc ha-icon { --mdc-icon-size: 26px; color: var(--cc); }
.sc b { font-size: 1.6rem; font-weight: 800; line-height: 1; }
.sc span { font-size: .72rem; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .04em; display: block; }
.sc.alert { animation: sAlert 1.6s ease-in-out infinite; }
@keyframes sAlert { 50% { box-shadow: 0 0 16px color-mix(in srgb, var(--cc) 60%, transparent); } }
.cols { flex: 1; display: grid; grid-template-columns: 1.25fr 1fr 1fr; gap: 10px; min-height: 0; }
.col { display: flex; flex-direction: column; gap: 8px; min-height: 0; overflow-y: auto; scrollbar-width: none; }
.col .pn { padding: 10px 12px; }
.col::-webkit-scrollbar { display: none; }
.pn { flex: 0 0 auto; }
.pn.grow { flex: 1 1 auto; display: flex; flex-direction: column; }
.tg2 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
.tg2 .ct { padding: 6px 8px; } .tg2 .ct .tv { font-size: 1.45rem; } .tg2 .ct .n { padding-right: 34px; }
.tg1 { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.ct { position: relative; border-radius: 14px; padding: 8px 10px; overflow: hidden; animation: tbFade .5s both;
background: linear-gradient(135deg, color-mix(in srgb, var(--tc) 22%, transparent), color-mix(in srgb, var(--tc) 5%, transparent)); }
.ct::after { content: ""; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.12) 50%, transparent 70%); transform: translateX(-100%); animation: sShine 6s ease-in-out infinite; animation-delay: var(--d, 0s); }
@keyframes sShine { 0%, 70% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
.ct .n { display: flex; align-items: center; gap: 5px; font-size: .78rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ct .n ha-icon { --mdc-icon-size: 16px; color: var(--tc); }
.ct .tv { font-size: 1.75rem; font-weight: 300; line-height: 1.05; margin-top: 2px; }
.ct .tv small { font-size: .9rem; }
.ct .hb { display: flex; align-items: center; gap: 6px; font-size: .75rem; color: var(--secondary-text-color); margin-top: 3px; }
.ct .hb .bar { flex: 1; height: 4px; border-radius: 2px; background: color-mix(in srgb, var(--primary-text-color) 10%, transparent); overflow: hidden; }
.ct .hb .bar i { display: block; height: 100%; background: #4fc3f7; border-radius: 2px; transform-origin: left; animation: tbGrowX 1.2s ease-out both; }
.bt { position: absolute; top: 7px; right: 8px; display: flex; align-items: center; font-size: .66rem; color: var(--secondary-text-color); gap: 1px; }
.bt ha-icon { --mdc-icon-size: 14px; }
.bt.low { color: #ef5350; animation: tbPulse 1s infinite; }
.ago { font-size: .66rem; color: var(--secondary-text-color); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.na { opacity: .45; filter: grayscale(1); }
.st { display: flex; align-items: center; gap: 9px; padding: 6px 8px; border-radius: 14px; position: relative; animation: tbFade .5s both;
background: color-mix(in srgb, var(--sc) 10%, transparent); min-width: 0; }
.st .ic { position: relative; flex: 0 0 34px; height: 34px; border-radius: 12px; display: grid; place-items: center; background: color-mix(in srgb, var(--sc) 18%, transparent); }
.st .ic ha-icon { --mdc-icon-size: 22px; color: var(--sc); }
.st .tx { min-width: 0; flex: 1; }
.st .tx b { display: block; font-size: .84rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.st .tx span { font-size: .74rem; font-weight: 700; color: var(--sc); }
.st .bt { position: static; display: inline-flex; margin-left: 6px; vertical-align: middle; }
.st .ago { display: flex; align-items: center; }
.open .ic ha-icon { transform-origin: 30% 50%; animation: sSwing 2s ease-in-out infinite; }
@keyframes sSwing { 50% { transform: perspective(60px) rotateY(-28deg); } }
.radar { position: absolute; inset: 0; border-radius: 12px; }
.moving .radar::before, .moving .radar::after { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--sc); animation: sRadar 1.8s ease-out infinite; }
.moving .radar::after { animation-delay: .9s; }
@keyframes sRadar { from { transform: scale(.6); opacity: 1; } to { transform: scale(1.9); opacity: 0; } }
.moving .ic ha-icon { animation: tbPulse 1s infinite; }
.wet { animation: sAlert 1s infinite; --cc: #ef5350; }
.wet .ic ha-icon { animation: sBob 1s ease-in-out infinite; }
@keyframes sBob { 50% { transform: translateY(-3px); } }
.dryw { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: repeating-linear-gradient(90deg, var(--sc) 0 8px, transparent 8px 14px); opacity: .5; animation: sFlow 3s linear infinite; }
@keyframes sFlow { to { background-position: 56px 0; } }
.cams { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.cam { display: flex; align-items: center; gap: 7px; font-size: .78rem; padding: 6px 8px; border-radius: 11px; background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); white-space: nowrap; overflow: hidden; }
.cam i { flex: 0 0 9px; height: 9px; border-radius: 50%; background: #66bb6a; box-shadow: 0 0 0 0 #66bb6a; }
.cam.act { background: color-mix(in srgb, #ef5350 18%, transparent); font-weight: 700; }
.cam.act i { background: #ef5350; animation: sDot 1.2s infinite; }
@keyframes sDot { 0% { box-shadow: 0 0 0 0 rgba(239,83,80,.7); } 100% { box-shadow: 0 0 0 9px rgba(239,83,80,0); } }
.cam small { margin-left: auto; color: var(--secondary-text-color); font-weight: 400; }
.bl { overflow-y: auto; flex: 1; min-height: 0; scrollbar-width: thin; }
.br { display: grid; grid-template-columns: 1fr 92px 40px; gap: 8px; align-items: center; font-size: .79rem; padding: 4px 0; animation: tbFade .4s both; }
.br .nm { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.br .bb { height: 9px; border-radius: 5px; background: color-mix(in srgb, var(--primary-text-color) 10%, transparent); overflow: hidden; position: relative; }
.br .bb i { position: absolute; inset: 0 auto 0 0; border-radius: 5px; transform-origin: left; animation: tbGrowX 1.1s cubic-bezier(.2,.8,.2,1) both; }
.br .pc { text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }
.br.low .pc { color: #ef5350; } .br.low .bb i { animation: tbGrowX 1.1s both, tbPulse 1s 1.1s infinite; }
.br.na { opacity: .45; }
.wt { display: flex; align-items: center; gap: 14px; }
.wt .drop { position: relative; width: 36px; height: 36px; flex: 0 0 auto; }
.wt .drop ha-icon { --mdc-icon-size: 34px; color: #29b6f6; }
.wt.flow .drop ha-icon { animation: sBob .9s ease-in-out infinite; }
.wt .drop i { position: absolute; left: 50%; bottom: -4px; width: 4px; height: 8px; border-radius: 2px; background: #29b6f6; opacity: 0; }
.wt.flow .drop i { animation: sDrip 1s linear infinite; }
@keyframes sDrip { from { transform: translate(-50%, -6px); opacity: 1; } to { transform: translate(-50%, 14px); opacity: 0; } }
.ws { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 8px; }
.ws > div { border-radius: 11px; padding: 5px 8px; background: color-mix(in srgb, var(--wc) 14%, transparent); }
.ws ha-icon { --mdc-icon-size: 15px; color: var(--wc); vertical-align: -2px; margin-right: 3px; }
.ws b { display: block; font-size: 1.05rem; font-variant-numeric: tabular-nums; white-space: nowrap; } .ws span { display: block; font-size: .66rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wl { margin-top: 6px; font-size: .76rem; color: var(--secondary-text-color); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.wl ha-icon { --mdc-icon-size: 16px; color: #29b6f6; }
.wl .live { color: #29b6f6; font-weight: 700; animation: tbPulse 1.2s infinite; }
.wt b { font-size: 1.35rem; } .wt span { display: block; font-size: .74rem; color: var(--secondary-text-color); }
.st .tx b { white-space: normal; line-height: 1.15; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.br { grid-template-columns: 1fr 64px 36px; }
@media (max-height: 760px) { .wrap, .cols { gap: 8px; } .sc { padding: 6px 10px; } .sc b { font-size: 1.35rem; } .ct { padding: 5px 9px; } .ct .tv { font-size: 1.35rem; } .ct .hb { margin-top: 1px; } .ct .ago { margin-top: 0; } .tg2 { gap: 6px; } .st .ic { flex-basis: 30px; height: 30px; } .st .ic ha-icon { --mdc-icon-size: 19px; } .br { font-size: .74rem; padding: 3px 0; } }
@media (max-width: 899px), (orientation: portrait) { .cols { grid-template-columns: 1fr; } .sum { grid-template-columns: repeat(3, 1fr); } .col { overflow: visible; } }
`;
const tbTempColor = (t) => (t === null ? "#90a4ae" : t < 5 ? "#5c6bc0" : t < 12 ? "#29b6f6" : t < 18 ? "#26c6da" : t < 23 ? "#66bb6a" : t < 27 ? "#ffa726" : "#ef5350");
const tbBatName = (s) =>
s
.replace(/\s*Battery Battery Level/i, "")
.replace(/\s*Battery level/i, "")
.replace(/\s*Battery Level/i, "")
.replace(/\s*Baterie$/i, "")
.replace(/\s*\*?\s*$/, "")
.replace(/\s{2,}/g, " ")
.trim();
class TbSensorsCard extends TbBase {
static defaults() {
return {
climate: [
["Room 1", "sensor.YOUR_ROOM_1_TEMPERATURE", "sensor.YOUR_ROOM_1_HUMIDITY", "sensor.YOUR_ROOM_1_BATTERY", "mdi:sofa-outline"],
["Room 2", "sensor.YOUR_ROOM_2_TEMPERATURE", "sensor.YOUR_ROOM_2_HUMIDITY", "sensor.YOUR_ROOM_2_BATTERY", "mdi:bed-king-outline"],
["Outside", "sensor.YOUR_OUTDOOR_TEMPERATURE", "sensor.YOUR_OUTDOOR_HUMIDITY", "sensor.YOUR_OUTDOOR_BATTERY", "mdi:tree-outline"],
],
openings: [
["Door 1", "binary_sensor.YOUR_DOOR_1", "sensor.YOUR_DOOR_1_BATTERY", "door"],
["Window 1", "binary_sensor.YOUR_WINDOW_1", "sensor.YOUR_WINDOW_1_BATTERY", "window"],
],
motion: [
["Motion 1", "binary_sensor.YOUR_MOTION_1", "sensor.YOUR_MOTION_1_BATTERY"],
["Motion 2", "binary_sensor.YOUR_MOTION_2", "sensor.YOUR_MOTION_2_BATTERY"],
],
flood: [
["Flood 1", "binary_sensor.YOUR_FLOOD_1", "sensor.YOUR_FLOOD_1_BATTERY"],
["Flood 2", "binary_sensor.YOUR_FLOOD_2", "sensor.YOUR_FLOOD_2_BATTERY"],
],
cameras: [
["Camera 1", ["binary_sensor.YOUR_CAMERA_1_FIELD_DETECTION", "binary_sensor.YOUR_CAMERA_1_LINE_DETECTION"]],
["Camera 2", ["binary_sensor.YOUR_CAMERA_2_FIELD_DETECTION", "binary_sensor.YOUR_CAMERA_2_LINE_DETECTION"]],
],
/* optional water meter block (leave "" to show "—") */
water_flow: "sensor.YOUR_WATER_FLOW_NOW",
water_total: "sensor.YOUR_WATER_TOTAL_M3",
/* optional "shower" statistics (needs your own helpers/automations) — set shower: null to hide the block */
shower: { day: "input_number.YOUR_SHOWER_WATER_TODAY", rest_day: "input_number.YOUR_OTHER_WATER_TODAY", month: "input_number.YOUR_SHOWER_WATER_MONTH", rest_month: "input_number.YOUR_OTHER_WATER_MONTH", count: "counter.YOUR_SHOWERS_TODAY", last: "input_text.YOUR_LAST_SHOWER", active: "input_boolean.YOUR_WATER_EVENT_ACTIVE", start_idx: "input_number.YOUR_WATER_EVENT_START_INDEX", start_ts: "input_datetime.YOUR_WATER_EVENT_START", total_l: "sensor.YOUR_WATER_TOTAL_LITERS", high_flow: "sensor.YOUR_HIGH_FLOW_SENSOR" },
/* entity_id fragments to leave out of the battery list (e.g. your house battery's own sensors) */
battery_exclude: ["sensor.YOUR_HOUSE_BATTERY_PREFIX_"],
battery_low: 25,
};
}
_build() {
const c = this._config;
const ids = (arr, p) => arr.map((_, i) => `<div id="${p}${i}"></div>`).join("");
this.shadowRoot.innerHTML = `<style>${TB_BASE_CSS}${TB_SENS_CSS}</style>
<ha-card><div class="wrap">
<div class="sum" id="sum"></div>
<div class="cols">
<div class="col">
<div class="pn grow"><div class="pt"><ha-icon icon="mdi:thermometer-lines"></ha-icon>Temperatură și umiditate</div><div class="tg2">${ids(c.climate, "cl")}</div></div>
<div class="pn"><div class="pt"><ha-icon icon="mdi:water-pump"></ha-icon>Apometru</div><div id="water"></div></div>
</div>
<div class="col">
<div class="pn"><div class="pt"><ha-icon icon="mdi:door-sliding"></ha-icon>Uși și geamuri</div><div class="tg1">${ids(c.openings, "op")}</div></div>
<div class="pn"><div class="pt"><ha-icon icon="mdi:motion-sensor"></ha-icon>Mișcare</div><div class="tg1">${ids(c.motion, "mo")}</div></div>
<div class="pn"><div class="pt"><ha-icon icon="mdi:water-alert-outline"></ha-icon>Inundație</div><div class="tg1">${ids(c.flood, "fl")}</div></div>
</div>
<div class="col">
<div class="pn"><div class="pt"><ha-icon icon="mdi:cctv"></ha-icon>Camere · detecții<span class="sp"></span><span class="note" id="camn"></span></div><div class="cams" id="cams"></div></div>
<div class="pn grow"><div class="pt"><ha-icon icon="mdi:battery-heart-variant"></ha-icon>Baterii<span class="sp"></span><span class="note" id="batn"></span></div><div class="bl" id="bats"></div></div>
</div>
</div>
</div></ha-card>`;
}
_onStart() {
this._every(30000, () => {
this._sig = {};
this._update();
});
}
_bat(id) {
const v = tbNum(this._hass, id);
if (v === null) return "";
const low = v < this._config.battery_low;
const ic = v >= 95 ? "mdi:battery" : v < 10 ? "mdi:battery-alert-variant-outline" : `mdi:battery-${Math.max(10, Math.round(v / 10) * 10)}`;
return `<span class="bt${low ? " low" : ""}"><ha-icon icon="${ic}"></ha-icon>${Math.round(v)}%</span>`;
}
_put(id, sig, html) {
this._sig = this._sig || {};
if (this._sig[id] === sig) return;
this._sig[id] = sig;
const e = this._e(id);
if (e) e.outerHTML = `<div id="${id}" style="display:contents">${html}</div>`;
}
_showerHtml() {
const h = this._hass, w = this._config.shower;
if (!w) return "";
const n = (id) => tbNum(h, id);
const L = (v) => (v === null ? "—" : v >= 1000 ? tbF(v / 1000, 2) + " m³" : Math.round(v) + " L");
const box = (ic, col, v, lb) => `<div style="--wc:${col}"><b><ha-icon icon="${ic}"></ha-icon>${v}</b><span>${lb}</span></div>`;
const cnt = n(w.count);
let html = `<div class="ws">${box("mdi:shower-head", "#29b6f6", L(n(w.day)), cnt ? `duș azi · ${cnt}×` : "duș azi")}${box("mdi:water-outline", "#90a4ae", L(n(w.rest_day)), "restul azi")}${box("mdi:shower-head", "#0288d1", L(n(w.month)), "duș luna asta")}${box("mdi:water-outline", "#78909c", L(n(w.rest_month)), "restul lunii")}</div>`;
const last = h.states[w.last] ? h.states[w.last].state : "";
let live = "";
if (h.states[w.active] && h.states[w.active].state === "on") {
const used = (n(w.total_l) || 0) - (n(w.start_idx) || 0);
const hf = n(w.high_flow) || 0;
live = `<span class="live">${hf > 0 ? "🚿 Duș în curs" : "💧 Apă în curs"} · ${Math.max(0, Math.round(used))} L</span>`;
}
html += `<div class="wl"><ha-icon icon="mdi:history"></ha-icon>Ultimul duș: <b>${tbEsc(last && last !== "unknown" ? last : "—")}</b>${live}</div>`;
return html;
}
_update() {
const h = this._hass, c = this._config;
const S = (id) => (id ? h.states[id] : null);
const sg = (...ids) => ids.map((id) => { const s = S(id); return s ? `${s.state}@${s.last_changed}` : "x"; }).join("|") + "|" + Math.floor(Date.now() / 60000);
let unavailable = 0, open = 0, moving = 0, wet = 0;
// climate
c.climate.forEach(([nm, t, hu, b, ic], i) => {
const st = S(t);
const tv = tbNum(h, t), hv = tbNum(h, hu);
if (!st || !tbOk(st.state)) unavailable++;
this._put(
`cl${i}`,
sg(t, hu, b),
`<div class="ct${tv === null ? " na" : ""}" style="--tc:${tbTempColor(tv)};--d:${(i * 0.6).toFixed(1)}s;animation-delay:${i * 0.04}s">
<div class="n"><ha-icon icon="${ic}"></ha-icon>${tbEsc(nm)}</div>${this._bat(b)}
<div class="tv">${tv !== null ? tbF(tv, 1) : "—"}<small>°C</small></div>
${hv !== null ? `<div class="hb"><ha-icon icon="mdi:water-percent" style="--mdc-icon-size:14px;color:#4fc3f7"></ha-icon>${tbF(hv, 0)}%<span class="bar"><i style="width:${tbClamp(hv, 0, 100)}%"></i></span></div>` : `<div class="hb">${tv === null ? "indisponibil" : ""}</div>`}
<div class="ago">${st ? tbAgo(st.last_changed) : ""}</div></div>`
);
});
// openings
c.openings.forEach(([nm, id, b, kind], i) => {
const st = S(id);
const ok = st && tbOk(st.state), on = ok && st.state === "on";
if (!ok) unavailable++;
if (on) open++;
const ic = kind === "door" ? (on ? "mdi:door-open" : "mdi:door-closed") : on ? "mdi:window-open-variant" : "mdi:window-closed-variant";
const col = !ok ? "#90a4ae" : on ? "#ffa726" : "#66bb6a";
this._put(
`op${i}`,
sg(id, b),
`<div class="st${on ? " open" : ""}${ok ? "" : " na"}" style="--sc:${col};animation-delay:${i * 0.05}s"><div class="ic"><ha-icon icon="${ic}"></ha-icon></div>
<div class="tx"><b>${tbEsc(nm)}</b><span>${!ok ? "Indisponibil" : on ? "Deschis" : "Închis"}</span><div class="ago">${st ? tbAgo(st.last_changed) : ""}${this._bat(b)}</div></div></div>`
);
});
// motion
c.motion.forEach(([nm, id, b], i) => {
const st = S(id);
const ok = st && tbOk(st.state), on = ok && st.state === "on";
if (!ok) unavailable++;
if (on) moving++;
const col = !ok ? "#90a4ae" : on ? "#ff7043" : "#26a69a";
this._put(
`mo${i}`,
sg(id, b),
`<div class="st${on ? " moving" : ""}${ok ? "" : " na"}" style="--sc:${col};animation-delay:${i * 0.05}s"><div class="ic"><span class="radar"></span><ha-icon icon="${on ? "mdi:motion-sensor" : "mdi:motion-sensor-off"}"></ha-icon></div>
<div class="tx"><b>${tbEsc(nm)}</b><span>${!ok ? "Indisponibil" : on ? "Mișcare!" : "Liniște"}</span><div class="ago">${st ? tbAgo(st.last_changed) : ""}${this._bat(b)}</div></div></div>`
);
});
// flood
c.flood.forEach(([nm, id, b], i) => {
const st = S(id);
const ok = st && tbOk(st.state), on = ok && st.state === "on";
if (!ok) unavailable++;
if (on) wet++;
const col = !ok ? "#90a4ae" : on ? "#ef5350" : "#29b6f6";
this._put(
`fl${i}`,
sg(id, b),
`<div class="st${on ? " wet" : ""}${ok ? "" : " na"}" style="--sc:${col};animation-delay:${i * 0.05}s"><div class="ic"><ha-icon icon="${on ? "mdi:water-alert" : "mdi:water-check-outline"}"></ha-icon></div>
<div class="tx"><b>${tbEsc(nm)}</b><span>${!ok ? "Indisponibil" : on ? "APĂ DETECTATĂ!" : "Uscat"}</span><div class="ago">${st ? tbAgo(st.last_changed) : ""}${this._bat(b)}</div></div>${ok && !on ? '<span class="dryw"></span>' : ""}</div>`
);
});
// water
const wf = tbNum(h, c.water_flow), wt = tbNum(h, c.water_total);
const wfu = tbAt(h, c.water_flow, "unit_of_measurement") || "";
this._h(
"water",
`<div class="wt${(wf || 0) > 0 ? " flow" : ""}"><div class="drop"><ha-icon icon="mdi:water"></ha-icon><i></i></div>
<div><b>${tbF(wf, 1)} ${tbEsc(wfu)}</b><span>debit acum</span></div><div style="margin-left:auto;text-align:right"><b>${tbF(wt, 2)} m³</b><span>index total</span></div></div>` + this._showerHtml()
);
// cameras
let camAct = 0;
this._h(
"cams",
c.cameras
.map(([nm, ids2]) => {
const sts = ids2.map((id) => S(id)).filter(Boolean);
const act = sts.some((s) => s.state === "on");
if (act) camAct++;
const last = sts.reduce((m, s) => (s.last_changed > m ? s.last_changed : m), "");
return `<div class="cam${act ? " act" : ""}"><i></i>${tbEsc(nm)}<small>${act ? "ACUM" : last ? tbAgo(last).replace("acum ", "") : ""}</small></div>`;
})
.join("")
);
this._t("camn", camAct ? `${camAct} active` : "liniște");
// batteries (all entities with device_class battery)
const ex = c.battery_exclude;
const bats0 = Object.values(h.states)
.filter((s) => s.entity_id.startsWith("sensor.") && s.attributes.device_class === "battery" && !ex.some((x) => s.entity_id.includes(x)))
.map((s) => ({ id: s.entity_id, n: tbBatName(s.attributes.friendly_name || s.entity_id), v: parseFloat(s.state) }));
/* same device exposed by two integrations: keep one entry per name, the one with a value */
const byName = new Map();
for (const b of bats0) {
const k = b.n.toLowerCase();
const o = byName.get(k);
if (!o || (!isFinite(o.v) && isFinite(b.v))) byName.set(k, b);
}
const bats = [...byName.values()];
bats.sort((a, b) => (isFinite(a.v) ? a.v : 999) - (isFinite(b.v) ? b.v : 999));
const low = bats.filter((b) => isFinite(b.v) && b.v < c.battery_low).length;
const bsig = bats.map((b) => `${b.id}:${b.v}`).join("|");
if (bsig !== this._bsig) {
this._bsig = bsig;
this._h(
"bats",
bats
.map((b, i) => {
const ok = isFinite(b.v);
const col = !ok ? "#90a4ae" : b.v < c.battery_low ? "#ef5350" : b.v < 50 ? "#ffa726" : "#66bb6a";
return `<div class="br${ok && b.v < c.battery_low ? " low" : ""}${ok ? "" : " na"}" style="animation-delay:${Math.min(i * 0.03, 0.9)}s"><span class="nm">${tbEsc(b.n)}</span>
<span class="bb"><i style="width:${ok ? tbClamp(b.v, 2, 100) : 0}%;background:${col};animation-delay:${Math.min(i * 0.03, 0.9)}s"></i></span><span class="pc">${ok ? Math.round(b.v) + "%" : "—"}</span></div>`;
})
.join("")
);
}
this._t("batn", `${bats.length} dispozitive`);
// summary
const total = c.climate.length + c.openings.length + c.motion.length + c.flood.length + c.cameras.length + 1;
const card = (ic, val, lb, col, alert) => `<div class="sc${alert ? " alert" : ""}" style="--cc:${col}"><ha-icon icon="${ic}"></ha-icon><div><b>${val}</b><span>${lb}</span></div></div>`;
this._h(
"sum",
card("mdi:access-point-network", total, "senzori", "#42a5f5") +
card(open ? "mdi:door-open" : "mdi:door-closed-lock", open, "deschise", open ? "#ffa726" : "#66bb6a", open > 0) +
card("mdi:motion-sensor", moving, "mișcare", moving ? "#ff7043" : "#26a69a", false) +
card(wet ? "mdi:water-alert" : "mdi:water-check", wet, "inundații", wet ? "#ef5350" : "#29b6f6", wet > 0) +
card("mdi:battery-alert-variant-outline", low, `baterii < ${c.battery_low}%`, low ? "#ef5350" : "#66bb6a", low > 0) +
card("mdi:lan-disconnect", unavailable, "indisponibili", unavailable ? "#90a4ae" : "#66bb6a", false)
);
}
}
customElements.get("tb-sensors-card") || customElements.define("tb-sensors-card", TbSensorsCard);
window.customCards = window.customCards || [];
window.customCards.push(
{ type: "tb-acasa-card", name: "Tablet · Weather, rates, calendar", description: "Animated weather, exchange rates, calendar" },
{ type: "tb-pv-card", name: "Tablet · Photovoltaic", description: "Animated energy flow, battery, inverter, statistics" },
{ type: "tb-heat-card", name: "Tablet · Heating", description: "Boiler, circuits, zones, curve — on one screen" },
{ type: "tb-sensors-card", name: "Tablet · Sensors", description: "All sensors with state, battery, animated" }
);
console.info(`%c TABLETA-CARDS %c v${TB_VERSION} `, "background:#ff7043;color:#fff;font-weight:700", "background:#263238;color:#fff");
