/* ================================================================
*  NETWORK — router + NAS — custom:tb-net-card
*  Top: animated diagram Internet → router → NAS / clients, with packets flowing according to traffic.
*  Bottom: router details (clients, Wi-Fi, CPU/RAM, 24 h traffic) and NAS (volume, disks, CPU/RAM).
*  >>> Edit defaults() below. Written for the TP-Link Deco/Archer integration (tplink_router) + the QNAP integration.
*  Replace the prefixes r (router) and s (NAS) with the ones in your entity ids; delete keys you don't have.
* ================================================================ */
const TB_NET_CSS = `
.g { display: grid; grid-template-rows: 214px 1fr; gap: 12px; height: 100%; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; min-height: 0; }
.topo { padding: 6px 10px; animation: tbFade .5s both; }
.topo svg { width: 100%; height: 100%; display: block; overflow: visible; }
.lnk { fill: none; stroke: color-mix(in srgb, var(--primary-text-color) 16%, transparent); stroke-width: 3; stroke-linecap: round; }
.lnk.on { stroke: color-mix(in srgb, var(--lc, #29b6f6) 45%, transparent); }
.lnk.dn { stroke: #ef5350; stroke-dasharray: 6 7; animation: tbDash 1s linear infinite; }
.pk { opacity: 0; }
.on .pk { opacity: 1; }
.wv { fill: none; stroke: #29b6f6; stroke-width: 3; stroke-linecap: round; opacity: 0; transform-box: fill-box; transform-origin: 50% 100%; }
.wifi-on .wv { animation: nWave 2.4s ease-out infinite; }
@keyframes nWave { 0% { opacity: 0; transform: scale(.6); } 25% { opacity: .9; } 100% { opacity: 0; transform: scale(1.15); } }
.led { animation: tbPulse 1.6s infinite; }
.hled { opacity: .25; }
.busy .hled { animation: nBlink var(--bk, .5s) steps(2, jump-none) infinite; }
@keyframes nBlink { 0% { opacity: .25; } 100% { opacity: 1; } }
.cl { transform-box: fill-box; transform-origin: center; animation: nBob 3s ease-in-out infinite; }
@keyframes nBob { 50% { transform: translateY(-3px); } }
.tlab { font-size: 13px; font-weight: 700; fill: var(--primary-text-color); }
.tsub { font-size: 11.5px; fill: var(--secondary-text-color); }
.tval { font-size: 12.5px; font-weight: 700; }
.cloud { animation: nFloat 6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes nFloat { 50% { transform: translateX(4px); } }
.dp { display: flex; flex-direction: column; gap: 9px; min-height: 0; animation: tbFade .5s both; }
.hd { display: flex; align-items: center; gap: 10px; }
.hd .ic { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: color-mix(in srgb, var(--ac) 18%, transparent); color: var(--ac); flex: 0 0 40px; }
.hd .ic ha-icon { --mdc-icon-size: 24px; }
.hd .nm { flex: 1; min-width: 0; }
.hd b { display: block; font-size: 1.1rem; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hd small { color: var(--secondary-text-color); font-size: .78rem; }
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 99px; font-size: .74rem; font-weight: 700; background: color-mix(in srgb, var(--ac) 20%, transparent); color: var(--ac); white-space: nowrap; }
.chip i { width: 7px; height: 7px; border-radius: 50%; background: var(--ac); animation: tbPulse 1.4s infinite; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; min-height: 0; }
.box { border-radius: 14px; padding: 9px 11px; background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); min-width: 0; }
.box .l { font-size: .72rem; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
.big { font-size: 2rem; font-weight: 800; line-height: 1; }
.cbar { display: flex; height: 10px; border-radius: 6px; overflow: hidden; margin: 7px 0 6px; background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
.cbar i { display: block; height: 100%; transition: width 1s; transform-origin: left; animation: tbGrowX 1.2s ease-out both; }
.lg { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 10px; font-size: .78rem; }
.lg span { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.lg span i { width: 8px; height: 8px; border-radius: 3px; flex: 0 0 8px; }
.lg b { margin-left: auto; }
.gg { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; align-items: center; }
.rg { position: relative; width: 100%; max-width: 92px; aspect-ratio: 1; margin: 0 auto; }
.rg svg { width: 100%; height: 100%; transform: rotate(135deg); }
.rg .tr { fill: none; stroke: color-mix(in srgb, var(--primary-text-color) 10%, transparent); stroke-width: 10; stroke-linecap: round; }
.rg .vl { fill: none; stroke: var(--rc, #29b6f6); stroke-width: 10; stroke-linecap: round; transition: stroke-dasharray 1s; }
.rg .c { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
.rg .c b { font-size: 1.15rem; line-height: 1; }
.rg .c small { font-size: .66rem; color: var(--secondary-text-color); }
.wf { display: flex; flex-wrap: wrap; gap: 6px; }
.wf button, .wf span.p { border: none; border-radius: 99px; padding: 4px 10px; font-size: .74rem; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;
background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); color: var(--secondary-text-color); }
.wf .on, .wf span.p.on { background: color-mix(in srgb, #29b6f6 22%, transparent); color: #29b6f6; }
.wf ha-icon { --mdc-icon-size: 15px; }
.wf button.arm { background: #ffa726; color: #000; }
.ch { position: relative; flex: 1 1 auto; min-height: 70px; border-radius: 14px; padding: 7px 10px 4px; background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); display: flex; flex-direction: column; }
.ch .l { font-size: .72rem; color: var(--secondary-text-color); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; display: flex; gap: 10px; }
.ch .l .sp { flex: 1; }
.ch .l em { font-style: normal; text-transform: none; letter-spacing: 0; display: inline-flex; align-items: center; gap: 4px; }
.ch .l em i { width: 9px; height: 3px; border-radius: 2px; display: inline-block; }
.ch > .cv { flex: 1; min-height: 0; }
.ch svg { width: 100%; height: 100%; display: block; }
.kv { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 12px; font-size: .8rem; }
.kv div { display: flex; justify-content: space-between; gap: 8px; white-space: nowrap; }
.kv span { color: var(--secondary-text-color); }
.vol { display: grid; grid-template-columns: 104px 1fr; gap: 12px; align-items: center; }
.donut { position: relative; width: 104px; height: 104px; }
.donut svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.donut .c { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
.donut .c b { font-size: 1.3rem; line-height: 1; }
.donut .c small { font-size: .66rem; color: var(--secondary-text-color); }
.disks { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dk { display: grid; grid-template-columns: 44px 1fr; gap: 8px; align-items: center; border-radius: 14px; padding: 8px 10px; background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); --dc: #66bb6a; }
.dk svg { width: 44px; height: 44px; }
.dk .pl { transform-box: fill-box; transform-origin: center; animation: tbSpin 1.4s linear infinite; }
.dk.bad { --dc: #ef5350; }
.dk b { font-size: .92rem; display: block; }
.dk small { font-size: .72rem; color: var(--secondary-text-color); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bars { display: grid; gap: 7px; }
.br { display: grid; grid-template-columns: 74px 1fr 44px; gap: 8px; align-items: center; font-size: .8rem; }
.br span { color: var(--secondary-text-color); }
.br .t { height: 9px; border-radius: 5px; background: color-mix(in srgb, var(--primary-text-color) 9%, transparent); overflow: hidden; }
.br .t i { display: block; height: 100%; border-radius: 5px; transition: width 1s; }
.br b { text-align: right; }
.nbtn { position: absolute; top: 8px; right: 10px; display: flex; gap: 6px; z-index: 1; }
.nbtn button { border: none; border-radius: 99px; padding: 6px 12px; font-size: .78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;
background: color-mix(in srgb, var(--primary-color, #03a9f4) 18%, transparent); color: var(--primary-color, #03a9f4); }
.nbtn button ha-icon { --mdc-icon-size: 17px; }
.nbtn button:active { transform: scale(.95); }
@media (max-width: 899px), (orientation: portrait) {
.g { grid-template-rows: auto auto; height: auto; }
.row { grid-template-columns: 1fr; }
.topo { padding: 44px 4px 4px; }
.topo svg { height: auto; aspect-ratio: 880 / 205; }
.topo .tval { font-size: 24px; } .topo .tlab { font-size: 25px; } .topo .tsub { font-size: 18px; }
.nbtn { left: 10px; right: 10px; justify-content: flex-end; }
.ch { flex: 0 0 140px; }
.two { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
}
@media (max-width: 520px) {
.two, .disks { grid-template-columns: 1fr; }
.vol { grid-template-columns: 90px 1fr; } .donut { width: 90px; height: 90px; }
.kv { grid-template-columns: 1fr; }
.hd b { font-size: 1rem; } .hd small { white-space: normal; }
.ch .l { flex-wrap: wrap; }
}
`;
/* traffic conversions */
const tbMbit = (v, unit) => {
if (v === null) return null;
const u = String(unit || "").toLowerCase();
if (u === "kib/s") return (v * 8 * 1024) / 1e6;
if (u === "mib/s") return (v * 8 * 1048576) / 1e6;
if (u === "kb/s" || u === "kbit/s") return v / 1000;
if (u === "b/s" || u === "bit/s") return v / 1e6;
if (u === "gbit/s") return v * 1000;
return v; /* Mbit/s */
};
const tbRate = (m) => (m === null ? "—" : m >= 100 ? `${tbF(m, 0)} Mbit/s` : m >= 1 ? `${tbF(m, 1)} Mbit/s` : `${tbF(m * 1000, 0)} kbit/s`);
const tbDur = (sec) => {
if (sec === null || !isFinite(sec)) return "—";
const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60);
return d ? `${d} ${d === 1 ? "zi" : "zile"} ${h} h` : h ? `${h} h ${m} min` : `${m} min`;
};
const tbRingArc = (pct, r = 40, sweep = 270) => {
const c = 2 * Math.PI * r, L = (c * sweep) / 360;
return [`${(L * tbClamp(pct, 0, 1)).toFixed(1)} ${c.toFixed(1)}`, `${L.toFixed(1)} ${c.toFixed(1)}`];
};
const tbLoadCol = (p) => (p === null ? "#90a4ae" : p >= 85 ? "#ef5350" : p >= 60 ? "#ffa726" : "#66bb6a");
const tbTempCol = (t, warn = 45, crit = 55) => (t === null ? "#90a4ae" : t >= crit ? "#ef5350" : t >= warn ? "#ffa726" : "#66bb6a");

class TbNetCard extends TbBase {
static defaults() {
const r = "YOUR_ROUTER_PREFIX", s = "YOUR_NAS_PREFIX";
return {
router: {
name: "Router",
cpu: `sensor.${r}_cpu_used`,
mem: `sensor.${r}_memory_used`,
clients: `sensor.${r}_total_clients`,
main: `sensor.${r}_total_main_wifi_clients`,
iot: `sensor.${r}_total_iot_clients`,
wired: `sensor.${r}_total_wired_clients`,
guest: `sensor.${r}_total_guest_wifi_clients`,
wan_up: `sensor.${r}_wan_uptime`,
wan_ip: `sensor.${r}_wan_ipv4_address`,
lan_ip: `sensor.${r}_lan_ipv4_address`,
dhcp: `sensor.${r}_dhcp_reservations`,
wan_ok: "binary_sensor.YOUR_ROUTER_WAN_STATUS",
down: "sensor.YOUR_ROUTER_DOWNLOAD_SPEED",
up: "sensor.YOUR_ROUTER_UPLOAD_SPEED",
update: `update.${r}_update`,
/* [name, entity, can be toggled from the tablet] — keep the main Wi-Fi OFF the toggle list so you don't cut the tablet's own connection */
wifi: [
["2.4 GHz", `switch.${r}_wifi_2_4g`, false],
["5 GHz", `switch.${r}_wifi_5g`, false],
["IoT 2.4", `switch.${r}_iot_wifi_2_4g`, false],
["IoT 5", `switch.${r}_iot_wifi_5g`, false],
["Oaspeți 2.4", `switch.${r}_guest_wifi_2_4g`, true],
["Oaspeți 5", `switch.${r}_guest_wifi_5g`, true],
],
},
nas: {
name: "NAS",
status: `sensor.${s}_status`,
cpu: `sensor.${s}_cpu_usage`,
mem: `sensor.${s}_memory_usage`,
temp: `sensor.${s}_system_temperature`,
cpu_temp: `sensor.${s}_cpu_temperature`,
uptime: `sensor.${s}_uptime`,
vol_pct: `sensor.${s}_volume_used_datavol1`,
used: `sensor.${s}_used_space_datavol1`,
free: `sensor.${s}_free_space_datavol1`,
link: `sensor.${s}_eth0_link`,
rx: `sensor.${s}_eth0_download`,
tx: `sensor.${s}_eth0_upload`,
disks: [
{ status: `sensor.${s}_drive_0_1_status`, temp: `sensor.${s}_drive_0_1_temperature`, name: "Disc 1" },
{ status: `sensor.${s}_drive_0_2_status`, temp: `sensor.${s}_drive_0_2_temperature`, name: "Disc 2" },
],
},
};
}
_topo() {
const pk = (id, path, col, n) =>
Array.from({ length: n }, (_, i) => `<circle class="pk" r="4.2" fill="${col}"><animateMotion id="${id}${i}" dur="2s" begin="-${(i * 2) / n}s" repeatCount="indefinite" path="${path}"/></circle>`).join("");
const pWan = "M150,100 L370,100", pWanR = "M370,100 L150,100";
const pLan = "M492,100 L732,100", pLanR = "M732,100 L492,100";
const clients = [
["mdi:cellphone", 330, 178, "main"],
["mdi:lightbulb-on-outline", 430, 186, "iot"],
["mdi:ethernet", 530, 178, "wired"],
];
return `<svg viewBox="20 0 880 205" preserveAspectRatio="xMidYMid meet">
<defs>
<linearGradient id="nRt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#37474f"/><stop offset="1" stop-color="#263238"/></linearGradient>
<linearGradient id="nNas" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#455a64"/><stop offset="1" stop-color="#37474f"/></linearGradient>
</defs>
<g id="wanG" style="--lc:#29b6f6"><path class="lnk" id="wanL" d="${pWan}"/>${pk("pd", pWan, "#29b6f6", 3)}${pk("pu", pWanR, "#ab47bc", 2)}</g>
<g id="lanG" style="--lc:#66bb6a"><path class="lnk" id="lanL" d="${pLan}"/>${pk("nd", pLan, "#66bb6a", 3)}${pk("nu", pLanR, "#ffa726", 2)}</g>
<g id="cliG">${clients.map(([, x, y]) => `<path class="lnk on" style="--lc:#90a4ae;stroke-width:2;stroke-dasharray:3 6" d="M430,124 L${x},${y - 18}"/>`).join("")}</g>
<g class="cloud"><path d="M58,112 a24,24 0 0 1 6,-47 a32,32 0 0 1 60,-6 a22,22 0 0 1 22,30 a17,17 0 0 1 -4,23 z" fill="#29b6f6" opacity=".18" stroke="#29b6f6" stroke-width="2.5"/>
<circle cx="100" cy="88" r="15" fill="none" stroke="#29b6f6" stroke-width="2"/><ellipse cx="100" cy="88" rx="6.5" ry="15" fill="none" stroke="#29b6f6" stroke-width="1.6"/><path d="M85,88 H115 M88,80 H112 M88,96 H112" stroke="#29b6f6" stroke-width="1.4"/></g>
<text class="tlab" x="100" y="138" text-anchor="middle">Internet</text>
<text class="tsub" x="100" y="154" text-anchor="middle" id="tWan">—</text>
<text class="tval" x="260" y="86" text-anchor="middle" fill="#29b6f6" id="tDn">↓ —</text>
<text class="tval" x="260" y="124" text-anchor="middle" fill="#ab47bc" id="tUp">↑ —</text>
<g id="rtG">
<g id="wifiW"><path class="wv" d="M412,42 a26,26 0 0 1 36,0"/><path class="wv" style="animation-delay:.6s" d="M402,32 a40,40 0 0 1 56,0"/><path class="wv" style="animation-delay:1.2s" d="M392,22 a54,54 0 0 1 76,0"/></g>
<path d="M392,74 L384,40 M410,72 L406,46 M450,72 L454,46 M468,74 L476,40" stroke="#546e7a" stroke-width="5" stroke-linecap="round"/>
<rect x="370" y="72" width="120" height="50" rx="12" fill="url(#nRt)" stroke="#78909c" stroke-width="1.5"/>
${[0, 1, 2, 3, 4].map((i) => `<circle class="led" style="animation-delay:${i * 0.25}s" cx="${398 + i * 16}" cy="108" r="3.2" fill="${i ? "#66bb6a" : "#29b6f6"}"/>`).join("")}
<text x="430" y="94" text-anchor="middle" font-size="11" font-weight="700" fill="#cfd8dc">ROUTER</text>
</g>
<text class="tlab" x="430" y="146" text-anchor="middle" id="tRt" opacity="0">Router</text>
${clients.map(([ic, x, y, k], i) => `<g class="cl" style="animation-delay:${i * 0.5}s"><circle cx="${x}" cy="${y - 4}" r="15" fill="var(--card-background-color)" stroke="#90a4ae" stroke-width="1.5"/><foreignObject x="${x - 10}" y="${y - 14}" width="20" height="20"><ha-icon icon="${ic}" style="--mdc-icon-size:20px;color:#b0bec5"></ha-icon></foreignObject><text class="tval" x="${x + 21}" y="${y + 1}" fill="var(--primary-text-color)" id="tc_${k}">—</text></g>`).join("")}
<text class="tval" x="612" y="86" text-anchor="middle" fill="#66bb6a" id="tNd">—</text>
<text class="tval" x="612" y="124" text-anchor="middle" fill="#ffa726" id="tNu">—</text>
<g id="nasG">
<rect x="732" y="52" width="118" height="96" rx="10" fill="url(#nNas)" stroke="#78909c" stroke-width="1.5"/>
${[0, 1].map((i) => `<g><rect x="${748 + i * 46}" y="62" width="40" height="64" rx="5" fill="#263238" stroke="#546e7a"/>${[0, 1, 2, 3].map((j) => `<line x1="${754 + i * 46}" x2="${782 + i * 46}" y1="${70 + j * 7}" y2="${70 + j * 7}" stroke="#455a64" stroke-width="2"/>`).join("")}<circle class="hled" style="animation-delay:${i * 0.17}s" cx="${768 + i * 46}" cy="116" r="3.5" fill="#66bb6a" id="hl${i}"/></g>`).join("")}
<circle class="led" cx="752" cy="138" r="3" fill="#29b6f6"/><rect x="764" y="135" width="70" height="5" rx="2.5" fill="#263238"/>
</g>
<text class="tlab" x="791" y="168" text-anchor="middle">Storage</text>
<text class="tsub" x="791" y="184" text-anchor="middle" id="tNas">—</text>
</svg>`;
}
_build() {
const c = this._config;
const ring = (id, lbl) => `<div class="rg" id="${id}"><svg viewBox="0 0 100 100"><circle class="tr" cx="50" cy="50" r="40" id="${id}t"/><circle class="vl" cx="50" cy="50" r="40" id="${id}v"/></svg><div class="c"><b id="${id}n">—</b><small>${lbl}</small></div></div>`;
this.shadowRoot.innerHTML = `<style>${TB_BASE_CSS}${TB_NET_CSS}</style><ha-card><div class="g">
<div class="pn topo" id="topo"><div class="nbtn"><button data-o="map"><ha-icon icon="mdi:graph-outline"></ha-icon>Hartă rețea</button><button data-o="list"><ha-icon icon="mdi:format-list-bulleted"></ha-icon>Dispozitive</button></div>${this._topo()}</div>
<div class="row">
<div class="pn dp" style="--ac:#29b6f6;animation-delay:.1s">
<div class="hd"><div class="ic"><ha-icon icon="mdi:router-wireless"></ha-icon></div><div class="nm"><b>Router · ${tbEsc(c.router.name)}</b><small id="rSub">—</small></div><span class="chip" id="rChip"><i></i><span id="rSt">—</span></span></div>
<div class="two">
<div class="box"><div class="l">Dispozitive conectate</div><div class="big" id="rCl">—</div><div class="cbar" id="rBar"></div><div class="lg" id="rLg"></div></div>
<div class="box"><div class="gg">${ring("rCpu", "procesor")}${ring("rMem", "memorie")}</div></div>
</div>
<div class="wf" id="rWf"></div>
<div class="ch"><div class="l"><span>Trafic internet · 24 h</span><span class="sp"></span><em><i style="background:#29b6f6"></i>↓ <b id="rDmax">—</b></em><em><i style="background:#ab47bc"></i>↑ <b id="rUmax">—</b></em></div><div class="cv" id="rCh"></div></div>
</div>
<div class="pn dp" style="--ac:#66bb6a;animation-delay:.2s" id="nBox">
<div class="hd"><div class="ic"><ha-icon icon="mdi:nas"></ha-icon></div><div class="nm"><b>Storage · ${tbEsc(c.nas.name)}</b><small id="nSub">—</small></div><span class="chip" id="nChip"><i></i><span id="nSt">—</span></span></div>
<div class="vol"><div class="donut"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke-width="12" stroke="color-mix(in srgb, var(--primary-text-color) 10%, transparent)"/><circle cx="50" cy="50" r="40" fill="none" stroke-width="12" stroke-linecap="round" id="nDv" stroke="#66bb6a" stroke-dasharray="0 252" style="transition:stroke-dasharray 1.4s"/></svg><div class="c"><b id="nPct">—</b><small>ocupat</small></div></div>
<div class="kv" id="nKv"></div></div>
<div class="disks" id="nDisks"></div>
<div class="bars" id="nBars"></div>
<div class="ch"><div class="l"><span>Trafic storage · 24 h</span><span class="sp"></span><em><i style="background:#66bb6a"></i>primește <b id="nRmax">—</b></em><em><i style="background:#ffa726"></i>trimite <b id="nTmax">—</b></em></div><div class="cv" id="nCh"></div></div>
</div>
</div></div></ha-card>`;
this.shadowRoot.querySelector(".row").addEventListener("click", (ev) => this._click(ev));
this.shadowRoot.querySelector(".nbtn").addEventListener("click", (ev) => {
const b = ev.target.closest("button[data-o]");
if (b && window.TbNetOverlay) this._ov = window.TbNetOverlay.open(this._hass, b.dataset.o);
});
const [, full] = tbRingArc(1);
this.shadowRoot.querySelectorAll(".rg .tr").forEach((e) => e.setAttribute("stroke-dasharray", full));
this._hist = {};
}
_click(ev) {
const b = ev.target.closest("button[data-e]");
if (!b) return;
/* two taps within 4 s so nothing is toggled by accident */
if (this._armed !== b.dataset.e) {
this._armed = b.dataset.e;
b.classList.add("arm");
clearTimeout(this._armT);
this._armT = setTimeout(() => {
this._armed = null;
this._update();
}, 4000);
return;
}
this._armed = null;
clearTimeout(this._armT);
this._svc("switch", "toggle", { entity_id: b.dataset.e });
}
_onStart() {
this._loadHist();
this._every(600e3, () => this._loadHist());
this._every(60e3, () => this._update());
}
async _loadHist() {
const r = this._config.router;
if (!this._hass) return;
try {
const n = this._config.nas;
this._hist = await tbHistory(this._hass, [r.down, r.up, n.rx, n.tx], 24);
this._chS = {};
this._update();
} catch (e) {
/* no history */
}
}
_ring(id, v, col) {
const [da] = tbRingArc((v || 0) / 100);
this._a(`${id}v`, "stroke-dasharray", da);
this._sv(id, "--rc", col);
this._t(`${id}n`, v !== null ? `${Math.round(v)}%` : "—");
}
/* packet duration on a link: more traffic → faster packets */
_speed(pref, n, mbit, show) {
const dur = show ? tbClamp(3.2 - Math.log10(1 + (mbit || 0) * 10) * 0.9, 0.6, 3.2) : 3;
const key = `${pref}:${dur.toFixed(1)}`;
this._spd = this._spd || {};
if (this._spd[pref] === key) return;
this._spd[pref] = key;
for (let i = 0; i < n; i++) {
const a = this._e(`${pref}${i}`);
if (a) {
a.setAttribute("dur", `${dur.toFixed(2)}s`);
a.setAttribute("begin", `-${((i * dur) / n).toFixed(2)}s`);
}
}
}
_update() {
const h = this._hass, c = this._config, r = c.router, n = c.nas;
if (this._ov && this._ov.isConnected) this._ov.hass = h;
const wanSt = tbSt(h, r.wan_ok);
const wanUp = tbNum(h, r.wan_up);
const rAvail = tbOk(tbSt(h, r.clients)) || tbOk(tbSt(h, r.cpu));
const wanOk = wanSt ? wanSt === "on" : rAvail;
const dn = tbMbit(tbNum(h, r.down), tbAt(h, r.down, "unit_of_measurement"));
const up = tbMbit(tbNum(h, r.up), tbAt(h, r.up, "unit_of_measurement"));
this._t("tDn", `↓ ${tbRate(dn)}`);
this._t("tUp", `↑ ${tbRate(up)}`);
this._t("tWan", wanOk ? `conectat · ${tbDur(wanUp)}` : "fără internet");
const wanG = this._e("wanG");
wanG.classList.toggle("on", wanOk);
this._c("wanL", "on", wanOk);
this._c("wanL", "dn", !wanOk);
this._speed("pd", 3, dn, wanOk);
this._speed("pu", 2, up, wanOk);
wanG.querySelectorAll("circle.pk").forEach((e, i) => (e.style.display = i >= 3 && (up || 0) < 0.05 ? "none" : ""));
const anyWifi = r.wifi.some(([, e]) => tbSt(h, e) === "on");
this._c("wifiW", "wifi-on", anyWifi);
this.shadowRoot.querySelectorAll("#wifiW .wv").forEach((e) => (e.style.animationPlayState = anyWifi ? "running" : "paused"));
const tot = tbNum(h, r.clients);
const parts = [
["Wi-Fi", tbNum(h, r.main), "#29b6f6"],
["IoT", tbNum(h, r.iot), "#ffca28"],
["Cablu", tbNum(h, r.wired), "#66bb6a"],
["Oaspeți", tbNum(h, r.guest), "#ab47bc"],
];
this._t("rCl", tot !== null ? Math.round(tot) : "—");
const sum = parts.reduce((a, p) => a + (p[1] || 0), 0) || 1;
this._h("rBar", parts.map((p) => `<i style="width:${((p[1] || 0) / sum) * 100}%;background:${p[2]}"></i>`).join(""));
this._h("rLg", parts.map((p) => `<span><i style="background:${p[2]}"></i>${p[0]}<b>${p[1] !== null ? Math.round(p[1]) : "—"}</b></span>`).join(""));
this._t("tc_main", tbF(tbNum(h, r.main), 0));
this._t("tc_iot", tbF(tbNum(h, r.iot), 0));
this._t("tc_wired", tbF(tbNum(h, r.wired), 0));
const rc = tbNum(h, r.cpu), rm = tbNum(h, r.mem);
this._ring("rCpu", rc, tbLoadCol(rc));
this._ring("rMem", rm, tbLoadCol(rm));
const updOn = tbSt(h, r.update) === "on";
const rAc = !rAvail ? "#90a4ae" : !wanOk ? "#ef5350" : updOn ? "#ffa726" : "#29b6f6";
this._sv("rChip", "--ac", rAc);
this._t("rSt", !rAvail ? "indisponibil" : !wanOk ? "fără internet" : updOn ? "update disponibil" : "online");
this._t("rSub", `LAN ${tbSt(h, r.lan_ip) || "—"} · WAN ${tbSt(h, r.wan_ip) || "—"} · ${tbF(tbNum(h, r.dhcp), 0)} IP-uri rezervate`);
this._h(
"rWf",
r.wifi
.filter(([, e]) => h.states[e])
.map(([nm, e, can]) => {
const on = tbSt(h, e) === "on";
const ic = nm.startsWith("Oaspeți") ? "mdi:account-group" : nm.startsWith("IoT") ? "mdi:home-automation" : "mdi:wifi";
const arm = this._armed === e ? " arm" : "";
return can
? `<button data-e="${e}" class="${on ? "on" : ""}${arm}"><ha-icon icon="${ic}"></ha-icon>${nm}${arm ? " · încă o dată" : ""}</button>`
: `<span class="p ${on ? "on" : ""}"><ha-icon icon="${on ? ic : "mdi:wifi-off"}"></ha-icon>${nm}</span>`;
})
.join("")
);
this._chart();
const st = tbSt(h, n.status);
const nAvail = tbOk(st);
const good = st === "good";
const disks = n.disks.map((d) => ({ ...d, st: tbSt(h, d.status), t: tbNum(h, d.temp), model: tbAt(h, d.status, "Model") }));
const diskBad = disks.some((d) => tbOk(d.st) && !/^(ok|good|ready)$/i.test(d.st));
const nAc = !nAvail ? "#90a4ae" : !good || diskBad ? "#ef5350" : "#66bb6a";
this._sv("nChip", "--ac", nAc);
this._t("nSt", !nAvail ? "indisponibil" : diskBad ? "problemă disc" : good ? "sănătos" : st);
const upIso = tbSt(h, n.uptime);
const upSec = tbOk(upIso) ? (Date.now() - new Date(upIso).getTime()) / 1000 : null;
this._t("nSub", `pornit de ${tbDur(upSec)} · rețea ${tbSt(h, n.link) === "Up" ? "conectată" : tbSt(h, n.link) === "Down" ? "deconectată" : "—"}`);
const pct = tbNum(h, n.vol_pct);
const used = tbNum(h, n.used), free = tbNum(h, n.free);
const C = 2 * Math.PI * 40;
this._a("nDv", "stroke-dasharray", `${((C * tbClamp(pct || 0, 0, 100)) / 100).toFixed(1)} ${C.toFixed(1)}`);
this._a("nDv", "stroke", pct >= 90 ? "#ef5350" : pct >= 75 ? "#ffa726" : "#66bb6a");
this._t("nPct", pct !== null ? `${Math.round(pct)}%` : "—");
const gb = (v) => (v === null ? "—" : v >= 1024 ? `${tbF(v / 1024, 2)} TB` : `${tbF(v, 0)} GB`);
const rx = tbMbit(tbNum(h, n.rx), tbAt(h, n.rx, "unit_of_measurement"));
const tx = tbMbit(tbNum(h, n.tx), tbAt(h, n.tx, "unit_of_measurement"));
this._h(
"nKv",
[
["Folosit", gb(used)],
["Liber", gb(free)],
["Total", used !== null && free !== null ? gb(used + free) : "—"],
["Volum", "DataVol1"],
["Primește", tbRate(rx)],
["Trimite", tbRate(tx)],
]
.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`)
.join("")
);
this._h(
"nDisks",
disks
.map((d, i) => {
const ok = !tbOk(d.st) || /^(ok|good|ready)$/i.test(d.st);
const tc = tbTempCol(d.t, 45, 52);
return `<div class="dk ${ok ? "" : "bad"}"><svg viewBox="0 0 44 44"><rect x="5" y="3" width="34" height="38" rx="5" fill="#37474f" stroke="var(--dc)" stroke-width="1.6"/><g class="pl" style="animation-duration:${1.1 + i * 0.2}s"><circle cx="22" cy="19" r="11" fill="#546e7a"/><circle cx="22" cy="19" r="2.5" fill="#cfd8dc"/><path d="M22,8 A11,11 0 0 1 33,19" stroke="#b0bec5" stroke-width="1.5" fill="none"/></g><path d="M31,33 L23,22" stroke="#cfd8dc" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="35" r="2" fill="var(--dc)"/></svg>
<div><b>${tbEsc(d.name)} · <span style="color:var(--dc)">${tbEsc(tbOk(d.st) ? (ok ? "OK" : d.st) : "—")}</span></b><small><span style="color:${tc};font-weight:700">${d.t !== null ? `${Math.round(d.t)} °C` : "—"}</span> · ${tbEsc(d.model || "")}</small></div></div>`;
})
.join("")
);
const nc = tbNum(h, n.cpu), nm = tbNum(h, n.mem), nt = tbNum(h, n.temp);
const bar = (l, v, max, txt, col) => `<div class="br"><span>${l}</span><div class="t"><i style="width:${v === null ? 0 : tbClamp((v / max) * 100, 2, 100)}%;background:${col}"></i></div><b>${txt}</b></div>`;
this._h(
"nBars",
bar("Procesor", nc, 100, nc !== null ? `${Math.round(nc)}%` : "—", tbLoadCol(nc)) +
bar("Memorie", nm, 100, nm !== null ? `${Math.round(nm)}%` : "—", tbLoadCol(nm)) +
bar("Temperatură", nt, 70, nt !== null ? `${Math.round(nt)} °C` : "—", tbTempCol(nt, 50, 60))
);
const lanOk = nAvail && tbSt(h, n.link) !== "Down";
this._e("lanG").classList.toggle("on", lanOk);
this._c("lanL", "on", lanOk);
this._c("lanL", "dn", !lanOk);
this._speed("nd", 3, rx, lanOk);
this._speed("nu", 2, tx, lanOk);
this._t("tNd", lanOk ? `→ ${tbRate(rx)}` : "");
this._t("tNu", lanOk ? `← ${tbRate(tx)}` : "");
this._t("tNas", nAvail ? `${pct !== null ? Math.round(pct) + "% ocupat · " : ""}${disks.map((d) => (d.t !== null ? Math.round(d.t) + "°" : "—")).join(" / ")}` : "indisponibil");
const act = Math.max(rx || 0, tx || 0);
const nasG = this._e("nasG");
nasG.classList.toggle("busy", nAvail);
nasG.style.setProperty("--bk", `${tbClamp(1.2 - Math.log10(1 + act * 10) * 0.4, 0.12, 1.2).toFixed(2)}s`);
[0, 1].forEach((i) => this._a(`hl${i}`, "fill", diskBad ? "#ef5350" : "#66bb6a"));
}
_chart() {
const r = this._config.router, n = this._config.nas;
this._chart1("rCh", "rDmax", "rUmax", r.down, r.up, "#29b6f6", "#ab47bc", "nG1");
this._chart1("nCh", "nRmax", "nTmax", n.rx, n.tx, "#66bb6a", "#ffa726", "nG2");
}
_chart1(box, lmA, lmB, idA, idB, colA, colB, gid) {
const h = this._hass;
const t1 = Date.now(), t0 = t1 - 864e5;
const ser = (id) => {
const u = tbAt(h, id, "unit_of_measurement");
return tbResample((this._hist || {})[id] || [], t0, t1, 15 * 60e3).filter((x) => x.v !== null).map((x) => ({ t: x.t, v: tbMbit(x.v, u) }));
};
const a = ser(idA), b = ser(idB);
const sig = `${a.length}:${b.length}:${a.length ? a[a.length - 1].v : ""}:${b.length ? b[b.length - 1].v : ""}`;
this._chS = this._chS || {};
if (this._chS[box] === sig) return;
this._chS[box] = sig;
if (a.length < 2 && b.length < 2) {
this._h(box, `<svg viewBox="0 0 300 60" preserveAspectRatio="none"><text x="150" y="34" text-anchor="middle" font-size="11" fill="currentColor" opacity=".4">se încarcă istoricul…</text></svg>`);
return;
}
const mx = (s) => (s.length ? Math.max(...s.map((x) => x.v)) : null);
const hi = Math.max(0.01, mx(a) || 0, mx(b) || 0);
const W = 400, H = 80;
const xy = (s) => s.map((x) => [((x.t - t0) / (t1 - t0)) * W, H - 2 - (x.v / hi) * (H - 8)]);
const pa = a.length > 1 ? tbPath(xy(a)) : "", pb = b.length > 1 ? tbPath(xy(b)) : "";
this._t(lmA, `max ${tbRate(mx(a))}`);
this._t(lmB, `max ${tbRate(mx(b))}`);
this._h(
box,
`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colA}" stop-opacity=".45"/><stop offset="1" stop-color="${colA}" stop-opacity="0"/></linearGradient></defs>
${pa ? `<path d="${pa} L${W},${H} L0,${H} Z" fill="url(#${gid})"/><path d="${pa}" fill="none" stroke="${colA}" stroke-width="2" vector-effect="non-scaling-stroke" class="draw" style="--len:1400"/>` : ""}
${pb ? `<path d="${pb}" fill="none" stroke="${colB}" stroke-width="1.6" vector-effect="non-scaling-stroke" class="draw" style="--len:1400"/>` : ""}</svg>`
);
}
}
TbNetCard.fitH = 630;
customElements.get("tb-net-card") || customElements.define("tb-net-card", TbNetCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "tb-net-card", name: "Tablet · Network", description: "Router and NAS — animated diagram with traffic, clients, disks" });
