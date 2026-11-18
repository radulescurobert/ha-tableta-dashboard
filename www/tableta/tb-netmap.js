/* ================================================================
*  NETWORK MAP + DEVICE LIST — full-screen overlay (tb-net-overlay)
*  Opened from the Network tab: TbNetOverlay.open(hass, "map" | "list").
*  - IP: router clients (device_tracker entities with source_type "router": ip, mac, connection, band, signal, traffic)
*  - Zigbee: ZHA (websocket zha/devices) — tree topology with mesh links between routers
*  - animated: packets on cable, waves on Wi-Fi, pulses on Zigbee; pan/zoom with touch
*  >>> Optional: fill NM_REP below if you have a Wi-Fi extender that the router sees under several MACs.
* ================================================================ */
const TB_NM_CSS = `
:host { position: fixed; inset: 0; z-index: 9999; display: block; font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
color: var(--primary-text-color, #e8eaed); background: var(--primary-background-color, #111318); animation: nmIn .25s ease-out both; }
@keyframes nmIn { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: none; } }
* { box-sizing: border-box; }
button { font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.top { position: absolute; left: 0; right: 0; top: 0; height: 56px; display: flex; align-items: center; gap: 8px; padding: 0 12px;
background: color-mix(in srgb, var(--card-background-color, #1c1f26) 92%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--primary-text-color, #fff) 10%, transparent); z-index: 3; }
.top h2 { margin: 0 8px 0 4px; font-size: 1.1rem; white-space: nowrap; }
.tabs { display: flex; gap: 4px; background: color-mix(in srgb, var(--primary-text-color, #fff) 7%, transparent); border-radius: 99px; padding: 3px; }
.tabs button { border: none; background: none; border-radius: 99px; padding: 6px 14px; font-weight: 700; font-size: .85rem; color: var(--secondary-text-color, #9aa0a6); }
.tabs button.on { background: var(--primary-color, #03a9f4); color: #fff; }
.chips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; flex: 1; min-width: 0; }
.chips::-webkit-scrollbar { display: none; }
.chips button { border: none; border-radius: 99px; padding: 5px 11px; font-size: .78rem; font-weight: 700; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;
background: color-mix(in srgb, var(--primary-text-color, #fff) 8%, transparent); color: var(--secondary-text-color, #9aa0a6); }
.chips button i { width: 9px; height: 9px; border-radius: 50%; background: var(--c); }
.chips button.on { background: color-mix(in srgb, var(--c) 22%, transparent); color: var(--primary-text-color, #fff); }
.x { border: none; width: 40px; height: 40px; border-radius: 50%; background: color-mix(in srgb, var(--primary-text-color, #fff) 9%, transparent); font-size: 1.4rem; line-height: 1; flex: 0 0 40px; }
.body { position: absolute; left: 0; right: 0; top: 56px; bottom: 0; overflow: hidden; }
.pane { position: absolute; inset: 0; display: none; }
.pane.on { display: block; }
svg.map { width: 100%; height: 100%; display: block; touch-action: none; user-select: none; -webkit-user-select: none; }
.ln { fill: none; stroke-linecap: round; }
.ln.w { stroke: #66bb6a; stroke-width: 2.6; opacity: .75; }
.ln.f { stroke: var(--sc, #29b6f6); stroke-width: 1.6; stroke-dasharray: 2 7; opacity: .8; animation: nmFlow var(--fd, 2s) linear infinite; }
.ln.z { stroke: #ab47bc; stroke-width: 1.8; stroke-dasharray: 5 5; opacity: .85; animation: nmFlow var(--fd, 3s) linear infinite; }
.ln.m { stroke: #ab47bc; stroke-width: 1; opacity: .22; stroke-dasharray: 1 5; }
.ln.u { stroke: #ffa726; stroke-width: 3.2; opacity: .85; }
.ln.r { stroke: #29b6f6; stroke-width: 3.4; stroke-dasharray: 10 6; opacity: .85; animation: nmFlow 1.2s linear infinite; }
.ln.h { stroke: #00e5ff; stroke-width: 2.2; stroke-dasharray: 7 5; opacity: .8; animation: nmFlow 1.4s linear infinite; }
.ln.off { opacity: .15; animation: none; }
@keyframes nmFlow { to { stroke-dashoffset: -36; } }
.nd { cursor: pointer; }
.nd circle.b { fill: var(--card-background-color, #1c1f26); stroke: var(--nc, #90a4ae); stroke-width: 2; }
.nd.off circle.b { stroke-dasharray: 3 3; opacity: .5; }
.nd.off text, .nd.off foreignObject { opacity: .45; }
.nd .pu { fill: none; stroke: var(--nc); stroke-width: 2; opacity: 0; transform-box: fill-box; transform-origin: center; }
.nd.act .pu { animation: nmPulse 2.2s ease-out infinite; }
@keyframes nmPulse { 0% { opacity: .7; transform: scale(1); } 100% { opacity: 0; transform: scale(2.1); } }
.nd text { font-size: 10.5px; fill: var(--primary-text-color, #e8eaed); text-anchor: middle; paint-order: stroke; stroke: var(--primary-background-color, #111318); stroke-width: 3px; stroke-linejoin: round; }
.nd text.s { font-size: 9px; fill: var(--secondary-text-color, #9aa0a6); }
.nd.sel circle.b { stroke-width: 4; filter: drop-shadow(0 0 6px var(--nc)); }
.hub text { font-size: 13px; font-weight: 700; }
.wv { fill: none; stroke: #29b6f6; stroke-width: 2.5; opacity: 0; transform-box: fill-box; transform-origin: center; animation: nmWave 3s ease-out infinite; }
@keyframes nmWave { 0% { opacity: .55; transform: scale(.4); } 100% { opacity: 0; transform: scale(1); } }
.zr { fill: none; stroke: #ab47bc; stroke-width: 1.5; opacity: 0; transform-box: fill-box; transform-origin: center; animation: nmWave 4s ease-out infinite; }
.lbl { font-size: 15px; font-weight: 800; letter-spacing: .12em; fill: var(--secondary-text-color, #9aa0a6); text-transform: uppercase; opacity: .55; }
.pk { pointer-events: none; }
.hide-lbl .nd:not(.hub):not(.sel) text { display: none; }
.info { position: absolute; right: 12px; bottom: 12px; width: min(340px, calc(100% - 24px)); border-radius: 16px; padding: 12px 14px; z-index: 2;
background: color-mix(in srgb, var(--card-background-color, #1c1f26) 96%, transparent); box-shadow: 0 10px 30px rgba(0,0,0,.35); border: 1px solid color-mix(in srgb, var(--primary-text-color, #fff) 10%, transparent); display: none; }
.info.on { display: block; animation: nmIn .2s both; }
.info b { font-size: 1rem; display: block; margin-bottom: 6px; padding-right: 26px; }
.info .kv { display: grid; grid-template-columns: auto 1fr; gap: 3px 12px; font-size: .82rem; }
.info .kv span { color: var(--secondary-text-color, #9aa0a6); }
.info .kv em { font-style: normal; font-family: ui-monospace, monospace; font-size: .8rem; word-break: break-all; }
.info .cl { position: absolute; right: 8px; top: 8px; border: none; background: none; font-size: 1.2rem; opacity: .6; }
.leg { position: absolute; left: 12px; bottom: 12px; display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: .74rem; color: var(--secondary-text-color, #9aa0a6);
background: color-mix(in srgb, var(--card-background-color, #1c1f26) 85%, transparent); padding: 7px 11px; border-radius: 12px; max-width: calc(100% - 24px); z-index: 1; }
.leg span { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.leg i { width: 18px; height: 0; border-top: 3px solid var(--c); display: inline-block; }
.leg i.d { border-top-style: dashed; }
.leg i.o { border-top-style: dotted; }
.zb { position: absolute; right: 12px; top: 12px; display: flex; flex-direction: column; gap: 6px; z-index: 1; }
.zb button { width: 40px; height: 40px; border-radius: 12px; border: none; font-size: 1.3rem; font-weight: 700; background: color-mix(in srgb, var(--card-background-color, #1c1f26) 92%, transparent); box-shadow: 0 3px 10px rgba(0,0,0,.25); }
.note { position: absolute; left: 50%; top: 12px; transform: translateX(-50%); font-size: .8rem; padding: 6px 12px; border-radius: 99px; background: color-mix(in srgb, #ffa726 22%, transparent); color: #ffa726; display: none; z-index: 1; }
.note.on { display: block; }
.lst { position: absolute; inset: 0; display: flex; flex-direction: column; }
.lbar { display: flex; gap: 8px; align-items: center; padding: 10px 12px; }
.lbar input { flex: 1; min-width: 0; border-radius: 99px; border: 1px solid color-mix(in srgb, var(--primary-text-color, #fff) 15%, transparent); background: color-mix(in srgb, var(--primary-text-color, #fff) 5%, transparent);
color: inherit; font: inherit; padding: 8px 14px; outline: none; }
.lbar small { color: var(--secondary-text-color, #9aa0a6); white-space: nowrap; }
.tw { flex: 1; overflow: auto; -webkit-overflow-scrolling: touch; padding: 0 12px 12px; }
table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: .84rem; }
th { position: sticky; top: 0; z-index: 1; text-align: left; font-size: .7rem; text-transform: uppercase; letter-spacing: .06em; color: var(--secondary-text-color, #9aa0a6);
background: var(--primary-background-color, #111318); padding: 8px 8px; white-space: nowrap; cursor: pointer; }
th.s::after { content: " ▾"; } th.s.r::after { content: " ▴"; }
td { padding: 7px 8px; border-top: 1px solid color-mix(in srgb, var(--primary-text-color, #fff) 7%, transparent); white-space: nowrap; }
td.n { white-space: normal; min-width: 150px; }
td.n b { display: block; font-weight: 600; }
td.n small { color: var(--secondary-text-color, #9aa0a6); }
td.m { font-family: ui-monospace, monospace; font-size: .8rem; }
tr.off td { opacity: .45; }
table.an tr { animation: nmRow .35s both; }
@keyframes nmRow { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
.tg { display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 99px; font-size: .72rem; font-weight: 700; background: color-mix(in srgb, var(--c) 20%, transparent); color: var(--c); }
.sg { display: inline-flex; align-items: flex-end; gap: 2px; height: 13px; vertical-align: middle; margin-right: 5px; }
.sg i { width: 3px; background: color-mix(in srgb, var(--primary-text-color, #fff) 18%, transparent); border-radius: 1px; }
.sg i.on { background: var(--c); }
@media (max-width: 700px) {
.top { height: auto; min-height: 56px; flex-wrap: wrap; padding: 8px 10px; }
.top h2 { display: none; }
.chips { order: 3; flex: 1 0 100%; }
.body { top: 100px; }
.hide-sm { display: none; }
}
`;
const NM_COL = { wired: "#66bb6a", host: "#29b6f6", IoT: "#ffca28", guest: "#ab47bc", zigbee: "#ab47bc", router: "#ce93d8", end: "#b39ddb" };
/* Wi-Fi extenders: the router sees them under several MACs (own interface + virtual ones). Leave the list empty if you have none.
   Example entry: { name: "Extender · garden", sub: "Wi-Fi extender", ip: "192.168.0.200", macs: ["AA:BB:CC:00:00:01", "AA:BB:CC:00:00:02"] } */
const NM_REP = [];
const NM_ROUTER_NAME = "Router";
const NM_ROUTER_IP = "YOUR_ROUTER_IP";
const NM_ZIGBEE_COORD = "Zigbee coordinator";
const NM_TYPE = { wired: "Cablu", host: "Wi-Fi", IoT: "Wi-Fi IoT", guest: "Wi-Fi oaspeți", zigbee: "Zigbee" };
const nmMac = (m) => String(m || "").replace(/-/g, ":").toLowerCase();
const nmSigCol = (dbm) => (dbm === null || dbm === undefined ? "#90a4ae" : dbm >= -60 ? "#66bb6a" : dbm >= -72 ? "#ffa726" : "#ef5350");
const nmLqiCol = (q) => (q === null || q === undefined ? "#90a4ae" : q >= 150 ? "#66bb6a" : q >= 80 ? "#ffa726" : "#ef5350");
const nmBars = (lvl, col) => `<span class="sg" style="--c:${col}">${[1, 2, 3, 4].map((i) => `<i class="${i <= lvl ? "on" : ""}" style="height:${3 + i * 2.5}px"></i>`).join("")}</span>`;
const nmKbps = (v) => (v === null || v === undefined || !isFinite(v) ? "—" : v >= 1024 ? `${(v / 1024).toFixed(1).replace(".", ",")} MB/s` : `${Math.round(v)} KB/s`);
const nmDur = (s) => {
if (!isFinite(s) || s === null) return "—";
const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
return d ? `${d} z ${h} h` : h ? `${h} h ${m} min` : `${m} min`;
};
const nmShort = (s, n = 16) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
/* Icon guess from the device name (generic keywords; extend freely) */
const nmIcon = (t, name) => {
const n = (name || "").toLowerCase();
if (t === "zigbee") return /senzor|sensor|temp|termo/.test(n) ? "mdi:thermometer" : /buton|button/.test(n) ? "mdi:gesture-tap-button" : /priz|plug|socket/.test(n) ? "mdi:power-socket-eu" : /lumin|light|bec|bulb/.test(n) ? "mdi:lightbulb" : /geam|usa|ușă|door|window|contact/.test(n) ? "mdi:window-closed-variant" : /miscare|mișcare|motion|pir|prezen/.test(n) ? "mdi:motion-sensor" : /valv|apa|apă|flood|inund|water/.test(n) ? "mdi:water" : "mdi:zigbee";
if (/tel|phone|galaxy|samsung|iphone|pixel/.test(n)) return "mdi:cellphone";
if (/pad|tablet|tableta/.test(n)) return "mdi:tablet";
if (/watch/.test(n)) return "mdi:watch";
if (/shelly|switch|relay/.test(n)) return "mdi:electric-switch";
if (/led|wled|lamp|yeelink|light|lumin/.test(n)) return "mdi:led-strip-variant";
if (/storage|nas/.test(n)) return "mdi:nas";
if (/homeassistant|home assistant/.test(n)) return "mdi:home-assistant";
if (/roborock|vacuum/.test(n)) return "mdi:robot-vacuum";
if (/airp|purif|zhimi/.test(n)) return "mdi:air-purifier";
if (/google|voice|speaker|nest/.test(n)) return "mdi:speaker";
if (/ajax/.test(n)) return "mdi:shield-home";
if (/ipc|cam|dvr|ids/.test(n)) return "mdi:cctv";
if (/laundry|washer|washing/.test(n)) return "mdi:washing-machine";
if (/sdongle|huawei|inverter/.test(n)) return "mdi:solar-power";
if (/smartlife|tuya|wlan0/.test(n)) return "mdi:power-socket-eu";
return t === "wired" ? "mdi:lan" : "mdi:wifi";
};

class TbNetOverlay extends HTMLElement {
static open(hass, mode = "map") {
let el = document.querySelector("tb-net-overlay");
if (!el) {
el = document.createElement("tb-net-overlay");
document.body.appendChild(el);
}
el.hass = hass;
el.show(mode);
return el;
}
constructor() {
super();
this.attachShadow({ mode: "open" });
this._mode = "map";
this._flt = { wired: true, host: true, IoT: true, guest: true, zigbee: true };
this._lf = "all";
this._sort = ["name", 1];
this._q = "";
this._vb = null;
this._zig = null;
this._devMac = {};
}
show(mode) {
window.__tbNoRotate = true;
this._mode = mode;
if (!this._built) this._build();
this._render(true);
this._loadExtra();
clearInterval(this._ti);
this._ti = setInterval(() => this._loadExtra(), 60e3);
this._onLoc = () => this.close();
window.addEventListener("location-changed", this._onLoc);
}
close() {
window.__tbNoRotate = false;
clearInterval(this._ti);
window.removeEventListener("location-changed", this._onLoc);
this.remove();
}
set hass(h) {
this._hass = h;
if (!this._built) return;
const now = Date.now();
if (this._lastH && now - this._lastH < 5000) return;
this._lastH = now;
this._render(false);
}
_build() {
this._built = true;
const chip = (k, l) => `<button data-f="${k}" class="on" style="--c:${NM_COL[k]}"><i></i>${l}</button>`;
this.shadowRoot.innerHTML = `<style>${TB_NM_CSS}</style>
<div class="top"><h2>Rețeaua casei</h2>
<div class="tabs"><button data-m="map">Hartă</button><button data-m="list">Dispozitive</button></div>
<div class="chips" id="chips">${chip("wired", "Cablu")}${chip("host", "Wi-Fi")}${chip("IoT", "IoT")}${chip("guest", "Oaspeți")}${chip("zigbee", "Zigbee")}</div>
<button class="x" id="x" title="Închide">×</button></div>
<div class="body">
<div class="pane" id="pMap"><svg class="map" id="svg"></svg>
<div class="note" id="note"></div>
<div class="zb"><button data-z="1.25">+</button><button data-z="0.8">−</button><button data-z="0">⤢</button><button data-z="L" title="Etichete">Aa</button></div>
<div class="leg"><span><i style="--c:#66bb6a"></i>cablu</span><span><i class="d" style="--c:#29b6f6"></i>Wi-Fi 5 GHz</span><span><i class="d" style="--c:#4dd0e1"></i>Wi-Fi 2.4 GHz</span><span><i class="d" style="--c:#ab47bc"></i>Zigbee (părinte)</span><span><i class="o" style="--c:#ab47bc"></i>Zigbee mesh</span><span><i style="--c:#ffa726"></i>USB</span><span><i class="d" style="--c:#00e5ff"></i>Voice ↔ HA</span><span><i class="d" style="--c:#29b6f6;border-top-width:4px"></i>amplificator</span><span><i style="--c:#ef5350"></i>semnal slab</span></div>
<div class="info" id="info"></div></div>
<div class="pane" id="pList"><div class="lst"><div class="lbar"><input id="q" placeholder="Caută nume, IP sau MAC…" autocomplete="off"><small id="cnt"></small></div><div class="tw"><table id="tbl"></table></div></div></div>
</div>`;
const r = this.shadowRoot;
r.getElementById("x").addEventListener("click", () => this.close());
r.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => {
this._mode = b.dataset.m;
this._render(true);
}));
r.getElementById("chips").addEventListener("click", (e) => {
const b = e.target.closest("button[data-f]");
if (!b) return;
this._flt[b.dataset.f] = !this._flt[b.dataset.f];
b.classList.toggle("on", this._flt[b.dataset.f]);
this._render(true);
});
r.getElementById("q").addEventListener("input", (e) => {
this._q = e.target.value.trim().toLowerCase();
this._renderList();
});
r.getElementById("tbl").addEventListener("click", (e) => {
const th = e.target.closest("th[data-s]");
if (!th) return;
this._sort = [th.dataset.s, this._sort[0] === th.dataset.s ? -this._sort[1] : 1];
this._renderList();
});
r.querySelector(".zb").addEventListener("click", (e) => {
const b = e.target.closest("button[data-z]");
if (!b) return;
const z = b.dataset.z;
if (z === "L") return void r.getElementById("svg").classList.toggle("hide-lbl");
if (z === "0") {
this._moved = false;
return void this._fitView();
}
this._moved = true;
this._zoom(+z);
});
r.getElementById("info").addEventListener("click", (e) => {
if (e.target.closest(".cl")) this._select(null);
});
this._panZoom(r.getElementById("svg"));
}
async _loadExtra() {
const h = this._hass;
if (!h) return;
try {
const z = await h.callWS({ type: "zha/devices" });
this._zig = Array.isArray(z) ? z : [];
this._zigErr = null;
} catch (e) {
this._zigErr = (e && (e.message || e.code)) || "fără acces";
}
if (!this._devLoaded) {
try {
const devs = await h.callWS({ type: "config/device_registry/list" });
for (const d of devs || []) {
for (const [t, v] of d.connections || []) if (t === "mac") this._devMac[nmMac(v)] = { name: d.name_by_user || d.name, area: d.area_id };
}
this._devLoaded = true;
} catch (e) {
this._devLoaded = true;
}
}
this._render(!this._once);
this._once = true;
}
_ipClients() {
const h = this._hass;
const out = [];
for (const s of Object.values(h.states)) {
if (!s.entity_id.startsWith("device_tracker.")) continue;
const a = s.attributes;
if (a.source_type !== "router" || !a.mac) continue;
const mac = nmMac(a.mac);
const reg = this._devMac[mac];
const host = a.host_name && !/^(lwip0|wlan0|network device)$/i.test(a.host_name) && !/^([0-9a-f]{2}-){5}/i.test(a.host_name) ? a.host_name : "";
const fn = a.friendly_name && !/^(lwip0|wlan0|network device)$/i.test(a.friendly_name) && !/^([0-9A-F]{2}-){5}/.test(a.friendly_name) ? a.friendly_name : "";
const name = (reg && reg.name) || fn || host || a.friendly_name || mac;
const conn = a.connection === "wired" ? "wired" : a.connection === "IoT" ? "IoT" : a.connection === "guest" ? "guest" : "host";
const area = reg && reg.area && h.areas && h.areas[reg.area] ? h.areas[reg.area].name : "";
out.push({
id: s.entity_id, kind: "ip", type: conn, name, sub: host && host !== name ? host : area, ip: a.ip || "", mac: (a.mac || "").replace(/-/g, ":").toUpperCase(),
band: a.band, signal: isFinite(a.signal) ? a.signal : null, up: a.up_speed, down: a.down_speed, online: s.state === "home", on_t: a.online_time, used: a.traffic_usage,
rate: a.tx_rate,
/* clients reported through an extender (OneMesh) come without packet counters */
viaRe: conn !== "wired" && (a.packets_sent === null || a.packets_sent === undefined),
});
}
for (const r of NM_REP) {
const set = r.macs.map((m) => m.toUpperCase());
const hits = out.filter((c) => set.includes(c.mac));
if (!hits.length) continue;
const on = hits.filter((c) => c.online);
const best = on.find((c) => c.ip) || hits.find((c) => c.ip) || hits[0];
out.splice(0, out.length, ...out.filter((c) => !set.includes(c.mac)));
out.push({ ...best, id: "rep:" + r.macs[0], name: r.name, sub: r.sub, ip: best.ip || r.ip, mac: r.macs[0], online: on.length > 0, rep: true, alias: hits.map((c) => c.mac) });
}
const rp = out.find((c) => c.rep);
if (rp) {
for (const c of out) if (c.viaRe && !c.rep) c.via = rp.id;
rp.kids = out.filter((c) => c.via === rp.id && c.online).length;
}
return out;
}
_zigNodes() {
const z = this._zig || [];
const byIeee = {}, byNwk = {};
z.forEach((d) => {
byIeee[d.ieee] = d;
byNwk[typeof d.nwk === "number" ? d.nwk : parseInt(d.nwk, 16)] = d;
});
const coord = z.find((d) => d.device_type === "Coordinator");
const nodes = z.map((d) => {
let parent = null;
if (d.device_type !== "Coordinator") {
const pn = (d.neighbors || []).find((n) => n.relationship === "Parent");
if (pn && byIeee[pn.ieee]) parent = pn.ieee;
if (!parent) {
const holder = z.find((o) => (o.neighbors || []).some((n) => n.ieee === d.ieee && n.relationship === "Child"));
if (holder) parent = holder.ieee;
}
if (!parent && d.device_type === "Router") {
const rt = (d.routes || []).find((r) => r.dest_nwk === "0x0000" && r.route_status === "Active");
const nh = rt ? byNwk[parseInt(rt.next_hop, 16)] : null;
if (nh && nh.ieee !== d.ieee) parent = nh.ieee;
}
if (!parent && coord) parent = coord.ieee;
}
const pl = parent ? (byIeee[parent].neighbors || []).find((n) => n.ieee === d.ieee) : null;
const lqi = pl ? +pl.lqi : d.lqi;
const area = d.area_id && this._hass.areas && this._hass.areas[d.area_id] ? this._hass.areas[d.area_id].name : "";
return {
id: d.ieee, kind: "zb", type: "zigbee", role: d.device_type, name: d.user_given_name || d.name, sub: area || d.model, ip: "", mac: d.ieee.toUpperCase(), lqi, rssi: d.rssi,
online: d.available !== false, parent, model: d.model, manuf: d.manufacturer, power: d.power_source, nwk: d.nwk,
mesh: d.device_type !== "EndDevice" ? (d.neighbors || []).filter((n) => n.device_type !== "EndDevice" && n.relationship !== "Parent" && n.ieee !== parent).map((n) => [n.ieee, +n.lqi]) : [],
};
});
return { nodes, coord: coord ? coord.ieee : null };
}
_render(full) {
if (!this._hass) return;
const r = this.shadowRoot;
r.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.m === this._mode));
r.getElementById("pMap").classList.toggle("on", this._mode === "map");
r.getElementById("pList").classList.toggle("on", this._mode === "list");
if (this._mode === "list") return this._renderList(full);
this._renderMap(full);
}
_renderMap(full) {
const ip = this._ipClients();
const zg = this._zigNodes();
const sig = JSON.stringify([ip.map((c) => [c.id, c.online, c.type, c.band]), zg.nodes.map((n) => [n.id, n.parent, n.online]), this._flt, innerWidth > innerHeight]);
const note = this.shadowRoot.getElementById("note");
note.classList.toggle("on", !!this._zigErr && this._flt.zigbee);
note.textContent = this._zigErr ? `Zigbee indisponibil: ${this._zigErr}` : "";
if (!full && sig === this._sig) return this._liveMap(ip);
this._sig = sig;
const land = innerWidth >= innerHeight;
const W = land ? 1700 : 1000, H = land ? 980 : 1900;
const P = {};
const RT = land ? [430, 520] : [500, 470];
const HA = land ? [870, 520] : [500, 950];
const ZC = land ? [1260, 520] : [500, 1420];
const NET = land ? [430, 70] : [500, 60];
const hubs = [
["inet", NET, "Internet", "mdi:web", "#29b6f6", 26],
["rt", RT, NM_ROUTER_NAME, "mdi:router-wireless", "#29b6f6", 34],
["ha", HA, "Home Assistant", "mdi:home-assistant", "#03a9f4", 32],
];
const haC = ip.find((c) => /homeassistant/i.test(c.name) || /homeassistant/i.test(c.sub)) || null;
let links = [], nodes = [];
links.push({ a: NET, b: RT, cls: "w", pk: "#29b6f6", dur: 2.2 });
links.push({ a: RT, b: HA, cls: "w", pk: "#66bb6a", dur: 1.6, n: 3 });
const reps = ip.filter((c) => c.rep && this._flt.host);
const vis = ip.filter((c) => c !== haC && !c.rep && !(c.via && reps.length) && this._flt[c.type] && c.online);
const groups = ["wired", "host", "IoT", "guest"].map((t) => vis.filter((c) => c.type === t).sort((x, y) => x.name.localeCompare(y.name)));
const flat = groups.flat();
const gapC = land ? 0 : Math.PI / 2, gap = 0.5;
const span = 2 * Math.PI - 2 * gap;
const wl = groups[0], wf = groups.slice(1).flat();
const hasRep = reps.length > 0;
flat.forEach((c) => {
const isW = c.type === "wired";
const idx = isW ? wl.indexOf(c) : wf.indexOf(c);
const cnt = (isW ? wl.length : wf.length) || 1;
let ang;
if (!hasRep) ang = gapC + gap + (span * (idx + 0.5)) / cnt;
else {
const RW = 0.55, ws = ((Math.PI - RW / 2 - (gapC + gap)) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
const u = ((span - RW) * (idx + 0.5)) / cnt;
ang = gapC + gap + (u >= ws ? u + RW : u);
}
const rad = isW ? 150 : 255 + (idx % 2) * 80;
const p = [RT[0] + rad * Math.cos(ang), RT[1] + rad * Math.sin(ang)];
P[c.id] = p;
nodes.push({ ...c, p, col: NM_COL[c.type] });
if (c.type === "wired") links.push({ a: RT, b: p, cls: "w", pk: "#66bb6a", dur: tbClamp(2.6 - Math.log10(1 + (c.down || 0) + (c.up || 0)) * 0.6, 0.7, 2.6), n: (c.down || 0) + (c.up || 0) > 1 ? 2 : 1, id: c.id });
else {
const sc = c.signal !== null && c.signal < -75 ? "#ef5350" : c.band === "2G" ? "#4dd0e1" : "#29b6f6";
const fd = tbClamp(3 - Math.log10(1 + (c.down || 0) + (c.up || 0)) * 0.8, 0.5, 3);
links.push({ a: RT, b: p, cls: "f", sc, fd, id: c.id });
}
});
reps.forEach((c, i) => {
const ang = Math.PI + (i - (reps.length - 1) / 2) * 0.5;
const p = [RT[0] + 430 * Math.cos(ang), RT[1] + 430 * Math.sin(ang)];
P[c.id] = p;
nodes.push({ ...c, p, col: "#29b6f6" });
links.push({ a: RT, b: p, cls: "r" + (c.online ? "" : " off"), pk: c.online ? "#29b6f6" : null, dur: 1.6, n: 2, id: c.id });
const kids = ip.filter((k) => k.via === c.id && k !== haC && this._flt[k.type] && k.online).sort((x, y) => x.name.localeCompare(y.name));
const fan = Math.min(2.6, 0.5 * Math.max(1, kids.length));
kids.forEach((k, j) => {
const a2 = ang + (kids.length > 1 ? -fan / 2 + (fan * j) / (kids.length - 1) : 0);
const rr = 165 + (j % 2) * 55;
const q = [p[0] + rr * Math.cos(a2), p[1] + rr * Math.sin(a2)];
P[k.id] = q;
nodes.push({ ...k, p: q, col: NM_COL[k.type] });
const sc = k.signal !== null && k.signal < -75 ? "#ef5350" : k.band === "2G" ? "#4dd0e1" : "#29b6f6";
const fd = tbClamp(3 - Math.log10(1 + (k.down || 0) + (k.up || 0)) * 0.8, 0.5, 3);
links.push({ a: p, b: q, cls: "f", sc, fd, id: k.id });
});
});
/* Voice Assistant: direct link to Home Assistant (ESPHome API over Wi-Fi) */
nodes.filter((n) => /home-assistant-voice|voice preview|voice-pe|assist/i.test(`${n.name} ${n.sub}`)).forEach((n) => {
n.voice = true;
if (/^home.?assistant.?voice/i.test(n.name)) n.name = "Voice Assistant";
links.push({ a: HA, b: n.p, cls: "h", pk: "#00e5ff", dur: 1.8, n: 2, id: "v:" + n.id });
});
const zon = this._flt.zigbee && zg.nodes.length;
if (zon) {
hubs.push(["zc", ZC, "Coordonator Zigbee", "mdi:zigbee", "#ab47bc", 30]);
links.push({ a: HA, b: ZC, cls: "u", pk: "#ffa726", dur: 1.4, n: 2 });
const coordId = zg.coord;
P[coordId] = ZC;
const routers = zg.nodes.filter((n) => n.role === "Router");
const ends = zg.nodes.filter((n) => n.role === "EndDevice");
const r1 = routers.filter((n) => n.parent === coordId).sort((a, b) => a.name.localeCompare(b.name));
const r2 = routers.filter((n) => n.parent !== coordId);
const zg0 = land ? Math.PI : -Math.PI / 2, zgap = 0.45, zspan = 2 * Math.PI - 2 * zgap;
const ang = {};
r1.forEach((n, i) => {
ang[n.id] = zg0 + zgap + (zspan * (i + 0.5)) / Math.max(1, r1.length);
});
r2.forEach((n, i) => {
ang[n.id] = (ang[n.parent] ?? zg0 + zgap + (zspan * (i + 0.5)) / Math.max(1, r2.length)) + 0.18 * ((i % 2) * 2 - 1);
});
const eSorted = ends.slice().sort((a, b) => (ang[a.parent] ?? 0) - (ang[b.parent] ?? 0) || a.name.localeCompare(b.name));
eSorted.forEach((n, i) => {
ang[n.id] = zg0 + zgap + (zspan * (i + 0.5)) / Math.max(1, eSorted.length);
});
const R1 = 175, R2 = 255, R3 = 360;
zg.nodes.forEach((n) => {
if (n.role === "Coordinator") return;
const rr = n.role === "Router" ? (n.parent === coordId ? R1 : R2) : R3 + (eSorted.indexOf(n) % 2) * 55;
const p = [ZC[0] + rr * Math.cos(ang[n.id]), ZC[1] + rr * Math.sin(ang[n.id])];
P[n.id] = p;
nodes.push({ ...n, p, col: n.role === "Router" ? NM_COL.router : NM_COL.end });
});
const seen = {};
zg.nodes.forEach((n) => n.mesh.forEach(([o]) => {
const key = [n.id, o].sort().join("|");
if (seen[key] || !P[o] || !P[n.id]) return;
seen[key] = 1;
links.push({ a: P[n.id], b: P[o], cls: "m" });
}));
zg.nodes.forEach((n) => {
if (!n.parent || !P[n.parent] || !P[n.id]) return;
const bad = n.lqi !== null && n.lqi < 80;
links.push({ a: P[n.parent], b: P[n.id], cls: "z" + (n.online ? "" : " off"), sc: bad ? "#ef5350" : "#ab47bc", fd: n.role === "Router" ? 2 : 3.2, id: n.id, zpk: n.online && n.role === "Router" });
});
}
this._P = P;
this._nodes = nodes;
const xs = [NET[0], RT[0], HA[0], ...nodes.map((n) => n.p[0]), zon ? ZC[0] : HA[0]];
const ys = [NET[1], RT[1], HA[1], ...nodes.map((n) => n.p[1]), zon ? ZC[1] : HA[1]];
this._bb = [Math.min(...xs) - 90, Math.min(...ys) - 60, Math.max(...xs) - Math.min(...xs) + 180, Math.max(...ys) - Math.min(...ys) + 120];
const curve = (a, b, bend = 0) => {
if (!bend) return `M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}`;
const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
return `M${a[0].toFixed(1)},${a[1].toFixed(1)} Q${(mx - dy * bend).toFixed(1)},${(my + dx * bend).toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`;
};
let svg = "";
svg += `<text class="lbl" x="${RT[0]}" y="${RT[1] + (land ? 455 : 430)}" text-anchor="middle">Rețea IP · ${ip.filter((c) => c.online).length} online</text>`;
if (zon) svg += `<text class="lbl" x="${ZC[0]}" y="${ZC[1] + (land ? 455 : 450)}" text-anchor="middle">Zigbee · ${zg.nodes.filter((n) => n.online && n.role !== "Coordinator").length} dispozitive</text>`;
svg += [0, 1, 2].map((i) => `<circle class="wv" cx="${RT[0]}" cy="${RT[1]}" r="340" style="animation-delay:${i}s"/>`).join("");
if (zon) svg += [0, 1].map((i) => `<circle class="zr" cx="${ZC[0]}" cy="${ZC[1]}" r="400" style="animation-delay:${i * 2}s"/>`).join("");
links.forEach((l, i) => {
const d = curve(l.a, l.b, l.cls === "m" ? 0.12 : 0);
const st = `${l.sc ? `--sc:${l.sc};` : ""}${l.fd ? `--fd:${l.fd.toFixed(2)}s;` : ""}${l.cls.startsWith("z") && l.sc ? `stroke:${l.sc};` : ""}`;
svg += `<path class="ln ${l.cls}" d="${d}" style="${st}"${l.id ? ` data-l="${tbEsc(l.id)}"` : ""}/>`;
if (l.pk || l.zpk) {
const n = l.n || 1, dur = l.dur || 2.4;
const col = l.pk || "#ce93d8";
for (let j = 0; j < n; j++) svg += `<circle class="pk" r="${l.pk ? 4 : 3}" fill="${col}"><animateMotion dur="${dur}s" begin="-${((j * dur) / n).toFixed(2)}s" repeatCount="indefinite" path="${d}"/></circle>`;
if (((l.cls === "w" && !l.id) || l.cls === "h" || l.cls === "r") && l.pk) for (let j = 0; j < n; j++) svg += `<circle class="pk" r="3" fill="#ab47bc" opacity=".8"><animateMotion dur="${(dur * 1.3).toFixed(2)}s" begin="-${((j * dur) / n).toFixed(2)}s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear" path="${d}"/></circle>`;
}
});
const fo = (ic, x, y, s, col) => `<foreignObject x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" style="pointer-events:none"><ha-icon icon="${ic}" style="--mdc-icon-size:${s}px;color:${col};display:block"></ha-icon></foreignObject>`;
nodes.forEach((n, i) => {
const col = n.kind === "zb" ? nmLqiCol(n.lqi) : n.type === "wired" ? "#66bb6a" : nmSigCol(n.signal);
const big = n.role === "Router" || n.rep;
const r = n.rep ? 20 : big ? 15 : 12;
if (n.rep && n.online) svg += [0, 1].map((k) => `<circle class="wv" cx="${n.p[0].toFixed(1)}" cy="${n.p[1].toFixed(1)}" r="120" style="animation-delay:${k * 1.5}s"/>`).join("");
const act = n.kind === "ip" ? (n.down || 0) + (n.up || 0) > 2 : n.role === "Router" && n.online;
svg += `<g class="nd${n.online ? "" : " off"}${act ? " act" : ""}" data-id="${tbEsc(n.id)}" style="--nc:${n.kind === "zb" ? (big ? NM_COL.router : NM_COL.end) : NM_COL[n.type]};animation-delay:${(i % 20) * 0.03}s">
<circle class="pu" cx="${n.p[0].toFixed(1)}" cy="${n.p[1].toFixed(1)}" r="${r}"/><circle class="b" cx="${n.p[0].toFixed(1)}" cy="${n.p[1].toFixed(1)}" r="${r}"/>
${fo(n.rep ? "mdi:access-point-network" : nmIcon(n.type, n.name + " " + (n.sub || "")), n.p[0], n.p[1], n.rep ? 22 : big ? 17 : 14, n.rep ? "#29b6f6" : col)}
<text x="${n.p[0].toFixed(1)}" y="${(n.p[1] + r + 12).toFixed(1)}">${tbEsc(nmShort(n.name))}</text></g>`;
});
hubs.forEach(([id, p, nm, ic, col, r]) => {
svg += `<g class="nd hub act" data-id="${id}" style="--nc:${col}"><circle class="pu" cx="${p[0]}" cy="${p[1]}" r="${r}"/><circle class="b" cx="${p[0]}" cy="${p[1]}" r="${r}" style="stroke-width:3"/>${fo(ic, p[0], p[1], r * 1.1, col)}<text x="${p[0]}" y="${p[1] + r + 17}">${nm}</text></g>`;
});
const el = this.shadowRoot.getElementById("svg");
el.innerHTML = svg;
if (!this._vb || this._vbLand !== land || !this._moved) {
this._vbLand = land;
this._fitView();
} else this._applyVb();
el.querySelectorAll(".nd").forEach((g) => g.addEventListener("click", (e) => {
if (this._dragged) return;
e.stopPropagation();
this._select(g.dataset.id);
}));
if (this._selId) this._select(this._selId);
}
_liveMap(ip) {
const el = this.shadowRoot.getElementById("svg");
ip.forEach((c) => {
const g = el.querySelector(`.nd[data-id="${CSS.escape(c.id)}"]`);
if (g) g.classList.toggle("act", (c.down || 0) + (c.up || 0) > 2);
});
}
_select(id) {
this._selId = id;
const el = this.shadowRoot.getElementById("svg");
el.querySelectorAll(".nd.sel").forEach((g) => g.classList.remove("sel"));
const info = this.shadowRoot.getElementById("info");
if (!id) return info.classList.remove("on");
const g = el.querySelector(`.nd[data-id="${CSS.escape(id)}"]`);
if (g) g.classList.add("sel");
const hubInfo = {
inet: ["Internet", [["Conexiune", "WAN prin router"]]],
rt: [NM_ROUTER_NAME, [["IP", NM_ROUTER_IP], ["Clienți", String(this._ipClients().filter((c) => c.online).length)]]],
ha: ["Home Assistant", [["Legături", "cablu la router · USB la coordonatorul Zigbee"]]],
zc: [NM_ZIGBEE_COORD, [["Dispozitive", String((this._zig || []).length - 1)]]],
};
let title, kv;
if (hubInfo[id]) [title, kv] = hubInfo[id];
else {
const n = (this._nodes || []).find((x) => x.id === id);
if (!n) return info.classList.remove("on");
title = n.name;
if (n.kind === "ip")
kv = [
["Tip", `${NM_TYPE[n.type]}${n.band ? ` · ${n.band === "2G" ? "2.4 GHz" : "5 GHz"}` : ""}`],
["IP", `<em>${tbEsc(n.ip)}</em>`],
["MAC", `<em>${tbEsc(n.mac)}</em>`],
...(n.signal !== null ? [["Semnal", `${n.signal} dBm`]] : []),
...(n.rate ? [["Viteză legătură", `${Math.round(n.rate / 1000)} Mbit/s`]] : []),
["Trafic acum", `↓ ${nmKbps(n.down)} · ↑ ${nmKbps(n.up)}`],
["Conectat de", nmDur(n.on_t)],
...(n.voice ? [["Comunică cu", "Home Assistant (API ESPHome, prin Wi-Fi)"]] : []),
...(n.via ? [["Conectat prin", "amplificator Wi-Fi"]] : []),
...(n.rep ? [["Rol", "amplificator Wi-Fi, legat de router prin Wi-Fi"], ["Clienți conectați", String(n.kids || 0)], ["MAC-uri văzute", `<em>${tbEsc((n.alias || []).join(", "))}</em>`]] : []),
...(n.sub ? [["Detalii", tbEsc(n.sub)]] : []),
];
else {
const par = (this._zig || []).find((d) => d.ieee === n.parent);
kv = [
["Rol", n.role === "Router" ? "Router (repetor)" : "Dispozitiv final"],
["IEEE", `<em>${tbEsc(n.mac)}</em>`],
["Comunică prin", par ? tbEsc(par.user_given_name || par.name) : "—"],
["LQI", n.lqi !== null && n.lqi !== undefined ? `${n.lqi}` : "—"],
...(n.rssi !== null && n.rssi !== undefined ? [["RSSI", `${n.rssi} dBm`]] : []),
["Model", tbEsc(`${n.manuf || ""} ${n.model || ""}`.trim())],
["Alimentare", n.power === "Mains" ? "rețea" : n.power === "Battery or Unknown" ? "baterie" : tbEsc(n.power || "—")],
...(n.sub ? [["Cameră", tbEsc(n.sub)]] : []),
["Stare", n.online ? "online" : "offline"],
];
if (n.mesh && n.mesh.length) {
const nm = (ie) => {
const d = (this._zig || []).find((x) => x.ieee === ie);
return d ? d.user_given_name || d.name : ie;
};
kv.push(["Vecini mesh", n.mesh.map(([ie, q]) => `${tbEsc(nm(ie))} (${q})`).join(", ")]);
}
}
}
info.innerHTML = `<button class="cl">×</button><b>${tbEsc(title)}</b><div class="kv">${kv.map(([k, v]) => `<span>${k}</span><div>${v}</div>`).join("")}</div>`;
info.classList.add("on");
}
_fitView() {
const bb = this._bb || [0, 0, 1600, 900];
this._vb = bb.slice();
this._applyVb();
}
_applyVb() {
const el = this.shadowRoot.getElementById("svg");
el.setAttribute("viewBox", this._vb.map((v) => v.toFixed(1)).join(" "));
}
_zoom(f, cx, cy) {
const v = this._vb;
const px = cx ?? v[0] + v[2] / 2, py = cy ?? v[1] + v[3] / 2;
const nw = tbClamp(v[2] / f, 200, 6000), nh = (v[3] * nw) / v[2];
this._vb = [px - ((px - v[0]) * nw) / v[2], py - ((py - v[1]) * nh) / v[3], nw, nh];
this._applyVb();
}
_panZoom(svg) {
const pts = new Map();
let last = null, lastD = null;
const toSvg = (x, y) => {
const r = svg.getBoundingClientRect(), v = this._vb;
const s = Math.max(v[2] / r.width, v[3] / r.height);
const ox = (r.width * s - v[2]) / 2, oy = (r.height * s - v[3]) / 2;
return [v[0] - ox + (x - r.left) * s, v[1] - oy + (y - r.top) * s, s];
};
svg.addEventListener("pointerdown", (e) => {
pts.set(e.pointerId, [e.clientX, e.clientY]);
this._dragged = false;
last = [e.clientX, e.clientY];
lastD = null;
});
svg.addEventListener("pointermove", (e) => {
if (!pts.has(e.pointerId) || !this._vb) return;
pts.set(e.pointerId, [e.clientX, e.clientY]);
if (pts.size === 1) {
const [, , s] = toSvg(e.clientX, e.clientY);
const dx = e.clientX - last[0], dy = e.clientY - last[1];
if (Math.abs(dx) + Math.abs(dy) > 3) this._dragged = true;
if (!this._dragged) return;
this._moved = true;
this._vb[0] -= dx * s;
this._vb[1] -= dy * s;
last = [e.clientX, e.clientY];
this._applyVb();
} else if (pts.size === 2) {
const [a, b] = [...pts.values()];
const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
this._dragged = true;
this._moved = true;
if (lastD) {
const [cx, cy] = toSvg((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
this._zoom(d / lastD, cx, cy);
}
lastD = d;
}
});
const up = (e) => {
pts.delete(e.pointerId);
lastD = null;
if (pts.size === 1) last = [...pts.values()][0];
setTimeout(() => (this._dragged = false), 50);
};
svg.addEventListener("pointerup", up);
svg.addEventListener("pointercancel", up);
svg.addEventListener("wheel", (e) => {
e.preventDefault();
this._moved = true;
const [cx, cy] = toSvg(e.clientX, e.clientY);
this._zoom(e.deltaY < 0 ? 1.15 : 0.87, cx, cy);
}, { passive: false });
svg.addEventListener("click", (e) => {
if (!this._dragged && !e.target.closest(".nd")) this._select(null);
});
}
_renderList(anim = true) {
const ip = this._ipClients();
const zg = this._zigNodes().nodes.filter((n) => n.role !== "Coordinator");
let rows = [...ip, ...zg].filter((r) => this._flt[r.type]);
const q = this._q;
if (q) rows = rows.filter((r) => `${r.name} ${r.sub} ${r.ip} ${r.mac}`.toLowerCase().includes(q));
const [sk, sd] = this._sort;
const ipNum = (s) => (s ? s.split(".").reduce((a, b) => a * 256 + +b, 0) : 1e12);
const val = (r) => (sk === "ip" ? ipNum(r.ip) : sk === "sig" ? (r.kind === "zb" ? (r.lqi ?? -1) / 2.55 - 100 : r.signal ?? (r.type === "wired" ? 0 : -999)) : sk === "on" ? (r.online ? 0 : 1) : sk === "type" ? r.type : sk === "tr" ? -((r.down || 0) + (r.up || 0)) : sk === "mac" ? r.mac : r.name.toLowerCase());
rows.sort((a, b) => (a.online === b.online || sk === "on" ? 0 : a.online ? -1 : 1) || (val(a) > val(b) ? sd : val(a) < val(b) ? -sd : 0));
const on = rows.filter((r) => r.online).length;
this.shadowRoot.getElementById("cnt").textContent = `${on} online · ${rows.length - on} offline`;
const th = (k, l, cls = "") => `<th data-s="${k}" class="${cls}${sk === k ? " s" + (sd < 0 ? " r" : "") : ""}">${l}</th>`;
const sigCell = (r) => {
if (r.kind === "zb") {
const c = nmLqiCol(r.lqi);
const lvl = r.lqi == null ? 0 : r.lqi >= 180 ? 4 : r.lqi >= 130 ? 3 : r.lqi >= 80 ? 2 : 1;
return `${nmBars(lvl, c)}LQI ${r.lqi ?? "—"}`;
}
if (r.type === "wired") return `<span class="tg" style="--c:#66bb6a">cablu</span>`;
if (r.signal === null) return "—";
const lvl = r.signal >= -55 ? 4 : r.signal >= -65 ? 3 : r.signal >= -75 ? 2 : 1;
return `${nmBars(lvl, nmSigCol(r.signal))}${r.signal} dBm`;
};
const typeCell = (r) => {
const t = r.kind === "zb" ? (r.role === "Router" ? "Zigbee router" : "Zigbee") : NM_TYPE[r.type] + (r.band ? ` ${r.band === "2G" ? "2.4" : "5"}` : "");
return `<span class="tg" style="--c:${NM_COL[r.type]}">${t}</span>`;
};
const via = (r) => {
if (r.kind !== "zb") return r.via ? " · prin amplificator" : "";
const p = (this._zig || []).find((d) => d.ieee === r.parent);
return p ? ` · prin ${tbEsc(p.user_given_name || p.name)}` : "";
};
const tb = this.shadowRoot.getElementById("tbl");
tb.classList.toggle("an", !!anim);
tb.innerHTML = `<thead><tr>${th("name", "Dispozitiv")}${th("type", "Tip")}${th("ip", "IP")}${th("mac", "MAC / IEEE")}${th("sig", "Semnal")}${th("tr", "Trafic", "hide-sm")}${th("on", "Stare")}</tr></thead>
<tbody>${rows
.map((r, i) => `<tr class="${r.online ? "" : "off"}" style="animation-delay:${Math.min(i, 40) * 0.012}s"><td class="n"><b>${tbEsc(r.name)}</b><small>${tbEsc(r.sub || "")}${via(r)}</small></td><td>${typeCell(r)}</td><td class="m">${tbEsc(r.ip || "—")}</td><td class="m">${tbEsc(r.mac)}</td><td>${sigCell(r)}</td><td class="hide-sm">${r.kind === "ip" ? `↓ ${nmKbps(r.down)}<br>↑ ${nmKbps(r.up)}` : "—"}</td><td>${r.online ? `<span class="tg" style="--c:#66bb6a">online${r.on_t ? " · " + nmDur(r.on_t) : ""}</span>` : `<span class="tg" style="--c:#90a4ae">offline</span>`}</td></tr>`)
.join("")}</tbody>`;
}
}
customElements.get("tb-net-overlay") || customElements.define("tb-net-overlay", TbNetOverlay);
window.TbNetOverlay = TbNetOverlay;
