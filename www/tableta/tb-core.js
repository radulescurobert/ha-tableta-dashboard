/* tb-core.js — shared core for the tablet dashboard custom cards
*   custom:tb-acasa-card    weather + exchange rate + news summary
*   custom:tb-pv-card       animated photovoltaic system
*   custom:tb-heat-card     heating (boiler, zones, curve)
*   custom:tb-sensors-card  all house sensors (state, battery)
* Every card has default entities that you MUST replace (see README); any key can be overridden from YAML.
*/
const TB_VERSION = "1.0.0";
const tbEsc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tbNum = (h, id) => {
const s = h && id ? h.states[id] : null;
if (!s) return null;
const v = parseFloat(s.state);
return isFinite(v) ? v : null;
};
const tbSt = (h, id) => (h && id && h.states[id] ? h.states[id].state : undefined);
const tbAt = (h, id, a) => (h && id && h.states[id] ? h.states[id].attributes[a] : undefined);
const tbOk = (s) => s !== undefined && s !== null && s !== "unavailable" && s !== "unknown" && s !== "";
const tbF = (v, d = 1) =>
v === null || v === undefined || !isFinite(v)
? "—"
: Number(v).toLocaleString("ro-RO", { minimumFractionDigits: d, maximumFractionDigits: d });
const tbClamp = (v, a, b) => Math.max(a, Math.min(b, v));
const tbHHMM = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const tbAgo = (iso) => {
if (!iso) return "";
const s = (Date.now() - new Date(iso).getTime()) / 1000;
if (s < 60) return "chiar acum";
const m = Math.round(s / 60);
if (m < 60) return `acum ${m} min`;
const h = Math.round(m / 60);
if (h < 24) return `acum ${h} h`;
const d = Math.round(h / 24);
return d === 1 ? "ieri" : `acum ${d} zile`;
};
const tbP = (kw) => {
if (kw === null || !isFinite(kw)) return "—";
const a = Math.abs(kw);
return a < 1 ? `${Math.round(a * 1000)} W` : `${tbF(a, 2)} kW`;
};
async function tbHistory(hass, ids, hours) {
const end = new Date();
const start = new Date(end.getTime() - hours * 3600e3);
const url =
`history/period/${start.toISOString()}?filter_entity_id=${ids.join(",")}` +
`&end_time=${end.toISOString()}&minimal_response&no_attributes`;
const res = await hass.callApi("GET", url);
const out = {};
for (const arr of res || []) {
if (!arr || !arr.length) continue;
const id = arr[0].entity_id;
out[id] = arr
.map((p) => ({ t: new Date(p.last_changed || p.last_updated).getTime(), v: parseFloat(p.state) }))
.filter((p) => isFinite(p.v) && isFinite(p.t));
}
return out;
}
/* regular series (last known value) between t0 and t1 with step (ms) */
function tbResample(pts, t0, t1, step) {
const out = [];
if (!pts || !pts.length) return out;
let j = 0, cur = null;
for (let t = t0; t <= t1; t += step) {
while (j < pts.length && pts[j].t <= t) cur = pts[j++].v;
out.push({ t, v: cur });
}
return out;
}
const tbPath = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
const TB_BASE_CSS = `
:host { display: block; }
* { box-sizing: border-box; }
ha-card { position: relative; overflow: hidden; padding: 12px; color: var(--primary-text-color);
height: calc(100vh - var(--header-height, 56px)); min-height: 560px; border-radius: 0; border: none; box-shadow: none;
background: var(--primary-background-color); }
.pn { position: relative; background: var(--card-background-color, #1e1e1e);
border: 1px solid color-mix(in srgb, var(--primary-text-color) 9%, transparent); border-radius: 18px;
padding: 12px 14px; min-width: 0; min-height: 0; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,.14); }
.pt { display: flex; align-items: center; gap: 7px; font-size: .74rem; font-weight: 700; letter-spacing: .08em;
text-transform: uppercase; color: var(--secondary-text-color); margin-bottom: 8px; white-space: nowrap; }
.pt ha-icon { --mdc-icon-size: 17px; }
.pt .sp { flex: 1; }
.pt .note { text-transform: none; letter-spacing: 0; font-weight: 500; }
.mut { color: var(--secondary-text-color); }
button { font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
@keyframes tbFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes tbSpin { to { transform: rotate(360deg); } }
@keyframes tbPulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
@keyframes tbDraw { from { stroke-dashoffset: var(--len, 1200); } to { stroke-dashoffset: 0; } }
@keyframes tbDash { to { stroke-dashoffset: -28; } }
@keyframes tbGrowY { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes tbGrowX { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.draw { stroke-dasharray: var(--len, 1200); animation: tbDraw 1.6s ease-out both; }
@media (max-height: 760px) { ha-card { padding: 9px; } .pn { padding: 9px 11px; border-radius: 15px; } .pt { margin-bottom: 6px; font-size: .7rem; } }
@media (max-width: 899px), (orientation: portrait) { ha-card { height: auto; } }
`;
class TbBase extends HTMLElement {
constructor() {
super();
this.attachShadow({ mode: "open" });
this._timers = [];
}
static defaults() {
return {};
}
setConfig(c) {
this._config = Object.assign({}, this.constructor.defaults(), c || {});
this._built = false;
if (this._hass) this.hass = this._hass;
}
set hass(h) {
this._hass = h;
if (!this._config) return;
if (!this._built) {
this._built = true;
this._build();
if (this.isConnected) this._start();
}
this._update();
}
get hass() {
return this._hass;
}
connectedCallback() {
if (this._built) this._start();
}
disconnectedCallback() {
this._stop();
}
_start() {
if (this._running) return;
this._running = true;
if (this._onStart) this._onStart();
const card = this.shadowRoot.querySelector("ha-card");
if (card && window.ResizeObserver) {
this._ro = new ResizeObserver(() => this._fit());
this._ro.observe(card);
}
this._fit();
}
/* On screens smaller than the design (630 px usable height / 1100 px width) scale the whole card proportionally so nothing is cut. */
_fit() {
const c = this.shadowRoot.querySelector("ha-card");
const inner = c && c.firstElementChild;
if (!inner) return;
const reset = () => {
inner.style.zoom = "";
inner.style.height = "";
};
if (innerWidth < 900 || matchMedia("(orientation: portrait)").matches) return reset();
const cs = getComputedStyle(c);
const H = c.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
const W = c.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
if (!(H > 0 && W > 0)) return;
const z = Math.min(1, H / (this.constructor.fitH || 630), W / (this.constructor.fitW || 1100));
if (z > 0.995) return reset();
inner.style.zoom = z.toFixed(4);
inner.style.height = `${(H / z).toFixed(1)}px`;
}
_diag() {}
_stop() {
this._running = false;
if (this._ro) {
this._ro.disconnect();
this._ro = null;
}
this._timers.forEach((t) => clearInterval(t));
this._timers = [];
if (this._onStop) this._onStop();
}
_every(ms, fn) {
this._timers.push(setInterval(fn, ms));
}
_e(id) {
return this.shadowRoot.getElementById(id);
}
_t(id, v) {
const e = this._e(id);
if (!e) return;
const s = String(v);
if (e.textContent !== s) e.textContent = s;
}
_h(id, html) {
const e = this._e(id);
if (e && e._tbh !== html) {
e._tbh = html;
e.innerHTML = html;
}
}
_c(id, cls, on) {
const e = this._e(id);
if (e) e.classList.toggle(cls, !!on);
}
_a(id, attr, v) {
const e = this._e(id);
if (e && e.getAttribute(attr) !== String(v)) e.setAttribute(attr, v);
}
_sv(id, prop, v) {
const e = this._e(id);
if (e) e.style.setProperty(prop, v);
}
_svc(domain, service, data) {
return this._hass.callService(domain, service, data).catch((e) => console.warn("tableta-cards", domain, service, e));
}
getCardSize() {
return 12;
}
}
Object.assign(window, { TB_VERSION, tbEsc, tbNum, tbSt, tbAt, tbOk, tbF, tbClamp, tbHHMM, tbAgo, tbP, tbHistory, tbResample, tbPath, TB_BASE_CSS, TbBase });
