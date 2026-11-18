/* ================================================================
*  HEATING  (custom:tb-heat-card)
*  Built for: gas boiler with eBUS (ebusd) + zone thermostats (climate entities) + 2 circulation pumps (switches).
*  >>> Replace the "YOUR_..." entities in defaults() below (or pass them from the dashboard YAML).
*      Zones: add/remove objects in `zones` (the layout shows up to 5 columns).
*      Optional entities can be set to "" (they are then hidden / show "—").
* ================================================================ */
const TB_HEAT_CSS = `
.g { display: grid; grid-template-columns: 1.3fr 1fr .8fr; grid-template-rows: 1.12fr 1fr .62fr; gap: 10px; height: 100%; }
.sch { padding: 8px 10px; }
.sch svg { width: 100%; height: calc(100% - 22px); display: block; }
.box { fill: color-mix(in srgb, var(--primary-text-color) 6%, var(--card-background-color)); stroke: color-mix(in srgb, var(--primary-text-color) 25%, transparent); stroke-width: 1.5; }
.slbl { font-size: 12px; font-weight: 700; fill: var(--secondary-text-color); letter-spacing: .05em; }
.sv { font-size: 17px; font-weight: 800; }
.pipe { fill: none; stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; opacity: .35; }
.flowing .pipe { opacity: 1; stroke-dasharray: 10 7; animation: tbDash .9s linear infinite; }
.flame { transform-box: fill-box; transform-origin: 50% 100%; opacity: .25; filter: grayscale(1); transition: opacity 1s; }
.burn .flame { opacity: 1; filter: drop-shadow(0 0 8px #ff9800); animation: hFlick .35s ease-in-out infinite alternate; }
.burn .flame.f2 { animation-duration: .5s; animation-delay: .1s; }
@keyframes hFlick { from { transform: scale(1,1) skewX(-2deg); } to { transform: scale(.92,1.12) skewX(3deg); } }
.imp { transform-box: fill-box; transform-origin: center; }
.on .imp { animation: tbSpin 1s linear infinite; }
.pumpc { fill: var(--card-background-color); stroke: color-mix(in srgb, var(--primary-text-color) 40%, transparent); stroke-width: 2; }
.on .pumpc { stroke: #66bb6a; filter: drop-shadow(0 0 5px #66bb6a); }
.dem { fill: #616161; }
.demand .dem { fill: #ff7043; animation: tbPulse 1.2s infinite; filter: drop-shadow(0 0 5px #ff7043); }
.ctl { display: flex; flex-direction: column; gap: 8px; }
.cg { display: grid; grid-template-columns: 1fr 1.1fr; gap: 10px; align-items: center; flex: 1; min-height: 0; }
.cg svg { width: 100%; height: 100%; max-height: 170px; }
.cax { font-size: 10px; fill: var(--secondary-text-color); }
.cline { fill: none; stroke: url(#hcg); stroke-width: 3.5; stroke-linecap: round; }
.cdot { fill: #ff7043; }
.cring { fill: none; stroke: #ff7043; stroke-width: 2; transform-box: fill-box; transform-origin: center; animation: hRing 1.8s ease-out infinite; }
@keyframes hRing { from { transform: scale(.4); opacity: 1; } to { transform: scale(2.4); opacity: 0; } }
.stp { display: grid; grid-template-columns: 1fr auto; gap: 4px 8px; align-items: center; font-size: .8rem; }
.stp .lb { color: var(--secondary-text-color); }
.nb { display: inline-flex; align-items: center; gap: 4px; }
.nb button { width: 30px; height: 30px; border-radius: 10px; border: none; background: color-mix(in srgb, var(--primary-text-color) 9%, transparent); font-size: 1.1rem; font-weight: 700; line-height: 1; }
.nb button:active { background: var(--primary-color); color: #fff; }
.nb b { min-width: 46px; text-align: center; font-size: .95rem; }
.tg { display: flex; align-items: center; gap: 8px; padding: 5px 10px; border-radius: 12px; border: none; width: 100%;
background: color-mix(in srgb, var(--primary-text-color) 6%, transparent); font-size: .82rem; text-align: left; }
.tg ha-icon { --mdc-icon-size: 18px; color: var(--secondary-text-color); }
.tg .sw { margin-left: auto; width: 34px; height: 19px; border-radius: 10px; background: color-mix(in srgb, var(--primary-text-color) 22%, transparent); position: relative; transition: background .3s; flex: 0 0 auto; }
.tg .sw::after { content: ""; position: absolute; top: 2px; left: 2px; width: 15px; height: 15px; border-radius: 50%; background: #fff; transition: transform .3s; }
.tg.on .sw { background: var(--tgc, #ff7043); }
.tg.on .sw::after { transform: translateX(15px); }
.tg.on ha-icon { color: var(--tgc, #ff7043); }
.tg.ro { cursor: default; }
.gauge svg { width: 100%; height: 118px; display: block; }
.gtx { font-size: 26px; font-weight: 800; fill: var(--primary-text-color); text-anchor: middle; }
.gsub { font-size: 11px; fill: var(--secondary-text-color); text-anchor: middle; }
.needle { transform-origin: 100px 100px; transition: transform 1.6s cubic-bezier(.3,1.5,.5,1); }
.kv { display: flex; justify-content: space-between; gap: 6px; font-size: .82rem; padding: 3px 0; border-bottom: 1px dashed color-mix(in srgb, var(--primary-text-color) 10%, transparent); }
.kv:last-child { border-bottom: none; }
.kv span:first-child { color: var(--secondary-text-color); display: flex; align-items: center; gap: 5px; }
.kv ha-icon { --mdc-icon-size: 16px; }
.kv b { white-space: nowrap; }
.zones { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; min-height: 0; }
.zn { position: relative; border-radius: 18px; padding: 10px 12px; display: flex; flex-direction: column; overflow: hidden; min-height: 0;
background: var(--card-background-color); border: 1.5px solid color-mix(in srgb, var(--zc) 30%, transparent); transition: border-color .6s, box-shadow .6s; animation: tbFade .5s both; }
.zn::before { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--zc) 0%, transparent), color-mix(in srgb, var(--zc) 14%, transparent)); opacity: .4; transition: opacity .8s; pointer-events: none; }
.zn.heat { border-color: var(--zc); animation: hGlow 2.2s ease-in-out infinite; }
.zn.heat::before { opacity: 1; }
@keyframes hGlow { 50% { box-shadow: 0 0 20px color-mix(in srgb, var(--zc) 55%, transparent); } }
.zn.off { opacity: .55; filter: grayscale(.7); }
.zn.win { border-color: #4fc3f7; }
.zh { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: .95rem; position: relative; }
.zh ha-icon { --mdc-icon-size: 20px; color: var(--zc); }
.zh .pw { margin-left: auto; background: none; border: none; padding: 2px; line-height: 0; color: var(--secondary-text-color); border-radius: 50%; }
.zh .pw ha-icon { color: inherit; --mdc-icon-size: 20px; }
.zn:not(.off) .pw { color: var(--zc); }
.zt { display: flex; align-items: flex-start; gap: 2px; margin-top: 4px; position: relative; }
.zt b { font-size: 2.5rem; font-weight: 300; line-height: 1; }
.zt small { font-size: 1.1rem; margin-top: 4px; }
.zt .tr { margin: 6px 0 0 6px; --mdc-icon-size: 22px; }
.waves { position: absolute; right: 12px; top: 40px; width: 36px; height: 46px; opacity: 0; transition: opacity .6s; }
.heat .waves { opacity: 1; }
.waves path { fill: none; stroke: var(--zc); stroke-width: 3; stroke-linecap: round; animation: hRise 1.8s ease-in infinite; }
.waves path:nth-child(2) { animation-delay: .6s; } .waves path:nth-child(3) { animation-delay: 1.2s; }
@keyframes hRise { 0% { transform: translateY(14px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-12px); opacity: 0; } }
.zs { display: flex; gap: 8px; font-size: .78rem; color: var(--secondary-text-color); margin-top: 3px; position: relative; flex-wrap: wrap; }
.zst { font-weight: 700; color: var(--zc); }
.win .zst { color: #4fc3f7; animation: tbPulse 1.4s infinite; }
.zg { flex: 1 1 auto; min-height: 0; margin: 6px -4px 0; position: relative; }
.zg svg { width: 100%; height: 100%; display: block; }
.zg .zl { font-size: 9px; fill: var(--secondary-text-color); }
.zset { display: flex; align-items: center; justify-content: space-between; padding-top: 6px; position: relative; }
.zset button { width: 40px; height: 40px; border-radius: 13px; border: none; font-size: 1.4rem; font-weight: 600;
background: color-mix(in srgb, var(--zc) 16%, transparent); color: var(--primary-text-color); }
.zset button:active { background: var(--zc); color: #fff; transform: scale(.94); }
.zset div { text-align: center; line-height: 1.1; }
.zset small { display: block; font-size: .65rem; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .05em; }
.zset b { font-size: 1.25rem; }
.zset b.pend { color: var(--zc); }
.zbar { height: 5px; border-radius: 3px; margin-top: 7px; background: color-mix(in srgb, var(--primary-text-color) 9%, transparent); overflow: hidden; position: relative; }
.zbar i { display: block; height: 100%; border-radius: 3px; background: var(--zc); transition: width 1.2s; }
.zhrs { font-size: .7rem; color: var(--secondary-text-color); margin-top: 3px; position: relative; }
.ch { grid-column: 1 / 2; display: flex; flex-direction: column; }
.ch .cw { flex: 1; min-height: 0; }
.ch svg { width: 100%; height: 100%; display: block; }
.ax { font-size: 10px; fill: var(--secondary-text-color); }
.gl { stroke: color-mix(in srgb, var(--primary-text-color) 9%, transparent); stroke-dasharray: 3 4; }
.leg { display: flex; gap: 12px; font-size: .72rem; text-transform: none; letter-spacing: 0; font-weight: 600; }
.leg i { display: inline-block; width: 10px; height: 3px; border-radius: 2px; margin-right: 4px; vertical-align: 3px; }
.ac .fan { --mdc-icon-size: 20px; }
.ac.acon .fan { animation: tbSpin 1.2s linear infinite; color: #4fc3f7; }
.st { display: grid; grid-template-columns: 1fr; gap: 0; } .st .kv { padding: 2px 0; font-size: .78rem; }
@media (max-height: 760px) { .g { gap: 8px; grid-template-rows: 1.1fr 1fr .62fr; } .gauge svg { height: 90px; } .kv { font-size: .76rem; padding: 2px 0; } .st .kv { padding: 1px 0; font-size: .72rem; } .zn { padding: 8px 10px; } .zt b { font-size: 2.1rem; } .zset button { width: 34px; height: 34px; font-size: 1.2rem; } .zset b { font-size: 1.1rem; } .nb button { width: 27px; height: 27px; } .tg { padding: 4px 9px; font-size: .78rem; } .stp { font-size: .76rem; } }
@media (max-width: 899px), (orientation: portrait) {
.g { grid-template-columns: 1fr; grid-template-rows: none; } .zones { grid-template-columns: repeat(2, 1fr); } .sch { min-height: 280px; } .ch { grid-column: auto; min-height: 180px; }
}
`;
class TbHeatCard extends TbBase {
static defaults() {
/* >>> eBUS entity prefix of YOUR boiler (e.g. "sensor.ebusd_boiler_") — the suffixes below are the ebusd message names */
const e = "sensor.YOUR_EBUSD_PREFIX_";
return {
zones: [
/* >>> one object per heating zone. climate = thermostat entity; temp/hum = room sensors; hours = "heating hours today" sensor (optional);
          window = window contact (optional); wlock = input_boolean "heating blocked by open window" (optional) */
{ name: "Zone 1", climate: "climate.YOUR_ZONE_1", temp: "sensor.YOUR_ZONE_1_TEMPERATURE", hum: "sensor.YOUR_ZONE_1_HUMIDITY", hours: "sensor.YOUR_ZONE_1_HEATING_HOURS_TODAY", window: "binary_sensor.YOUR_ZONE_1_WINDOW", wlock: "input_boolean.YOUR_ZONE_1_WINDOW_LOCK", icon: "mdi:bed-king-outline", color: "#ff9800" },
{ name: "Zone 2", climate: "climate.YOUR_ZONE_2", temp: "sensor.YOUR_ZONE_2_TEMPERATURE", hum: "sensor.YOUR_ZONE_2_HUMIDITY", hours: "sensor.YOUR_ZONE_2_HEATING_HOURS_TODAY", window: "binary_sensor.YOUR_ZONE_2_WINDOW", wlock: "input_boolean.YOUR_ZONE_2_WINDOW_LOCK", icon: "mdi:hanger", color: "#ffc107" },
{ name: "Zone 3", climate: "climate.YOUR_ZONE_3", temp: "sensor.YOUR_ZONE_3_TEMPERATURE", hum: "sensor.YOUR_ZONE_3_HUMIDITY", hours: "sensor.YOUR_ZONE_3_HEATING_HOURS_TODAY", window: "binary_sensor.YOUR_ZONE_3_WINDOW", wlock: "input_boolean.YOUR_ZONE_3_WINDOW_LOCK", icon: "mdi:tumble-dryer", color: "#ab47bc" },
{ name: "Zone 4", climate: "climate.YOUR_ZONE_4", temp: "sensor.YOUR_ZONE_4_TEMPERATURE", hum: "sensor.YOUR_ZONE_4_HUMIDITY", hours: "sensor.YOUR_ZONE_4_HEATING_HOURS_TODAY", icon: "mdi:shower-head", color: "#03a9f4" },
{ name: "Zone 5", climate: "climate.YOUR_ZONE_5", temp: "sensor.YOUR_ZONE_5_TEMPERATURE", hum: "sensor.YOUR_ZONE_5_HUMIDITY", hours: "sensor.YOUR_ZONE_5_HEATING_HOURS_TODAY", icon: "mdi:sofa-outline", color: "#ef5350" },
],
out: "sensor.YOUR_OUTDOOR_TEMPERATURE",
flow: e + "flowtemp_temp",
ret: e + "returntemp_temp",
flow_des: e + "flowtempdesired",
flow_calc: "sensor.YOUR_CALCULATED_FLOW_TEMP", /* optional: flow temperature computed by your heating curve */
hwc: e + "hwctemp_temp",
storage: e + "storagetemp_temp",
storage_des: e + "storagetempdesired",
pressure: e + "waterpressure_press",
pump: e + "status01_pumpstate",
demand: "binary_sensor.YOUR_HEAT_DEMAND",
call: "switch.YOUR_ROOM_THERMOSTAT_OR_HEAT_CALL",
pump_up: "switch.YOUR_PUMP_UPPER_FLOOR", /* >>> circuit 1 pump (schematic label "ETAJ") */
pump_down: "switch.YOUR_PUMP_GROUND_FLOOR", /* >>> circuit 2 pump (label "PARTER") */
season: "input_boolean.YOUR_HEATING_SEASON", /* optional helpers (input_boolean / input_number) */
curve: "input_boolean.YOUR_HEATING_CURVE_AUTO",
c_m10: "input_number.YOUR_FLOW_AT_MINUS_10",
c_p15: "input_number.YOUR_FLOW_AT_PLUS_15",
ac_auto: "input_boolean.YOUR_AC_FROM_SURPLUS_AUTO", /* optional: AC-from-solar-surplus panel (remove the panel if you don't use it) */
ac_temp: "input_number.YOUR_AC_SURPLUS_TEMPERATURE",
ac: "climate.YOUR_AC",
inj: "sensor.YOUR_GRID_EXPORT_POWER",
soc: "sensor.YOUR_BATTERY_SOC",
gas_heat: "sensor.YOUR_GAS_HEATING_DAILY_ESTIMATE", /* optional */
gas_hwc: "sensor.YOUR_GAS_HOTWATER_DAILY_ESTIMATE",
gas_total: "sensor.YOUR_GAS_TOTAL_DAILY_ESTIMATE",
stats: [
["Porniri arzător", e + "hcstarts", "mdi:fire"],
["Porniri pompă", e + "hcpumpstarts", "mdi:pump"],
["Ore încălzire", e + "hchours", "mdi:clock-outline"],
["Ore ventilator", e + "fanhours", "mdi:fan"],
["Până la revizie", e + "hourstillservice", "mdi:wrench-clock"],
],
};
}
_build() {
const c = this._config;
const loop = (y0, id, label) => {
// supply (red) -> coil -> return (blue)
const sup = `M128,${y0 + 15} H250 V${y0}`;
let coil = `M250,${y0} H470`;
const rows = 4;
for (let r = 1; r <= rows; r++) coil += ` V${y0 + r * 14} H${r % 2 ? 262 : 470}`;
const ret = `M262,${y0 + rows * 14} V${y0 + rows * 14 + 12} H128`;
return `<g id="${id}"><path class="pipe" stroke="#ef5350" d="${sup}"/><path class="pipe" stroke="url(#hcoil${id})" d="${coil}"/><path class="pipe" stroke="#42a5f5" d="${ret}"/>
<linearGradient id="hcoil${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y0 + rows * 14}"><stop offset="0" stop-color="#ff7043"/><stop offset="1" stop-color="#4fc3f7"/></linearGradient>
<g transform="translate(196 ${y0 + 15})"><circle class="pumpc" r="12"/><g class="imp"><path d="M0,-8 L3,0 L-3,0 Z M0,8 L-3,0 L3,0 Z M-8,0 L0,-3 L0,3 Z M8,0 L0,3 L0,-3 Z" fill="currentColor" opacity=".8"/></g></g>
<text x="470" y="${y0 - 8}" text-anchor="end" class="slbl">${label} · <tspan id="${id}_st">—</tspan></text></g>`;
};
const sch = `<svg viewBox="0 0 480 262" preserveAspectRatio="xMidYMid meet" style="color:var(--primary-text-color)">
<rect class="box" x="10" y="8" width="118" height="246" rx="16"/>
<text x="69" y="30" text-anchor="middle" class="slbl">CENTRALĂ</text>
<circle class="dem" cx="112" cy="24" r="5"/>
<g id="flm" transform="translate(69 112)">
<path class="flame" d="M0,-58 C18,-34 30,-20 26,0 C23,16 12,24 0,24 C-12,24 -23,16 -26,0 C-30,-20 -10,-30 0,-58 Z" fill="url(#hfl1)"/>
<path class="flame f2" d="M0,-30 C9,-18 15,-8 13,4 C11,14 6,18 0,18 C-6,18 -11,14 -13,4 C-15,-8 -6,-14 0,-30 Z" fill="url(#hfl2)"/>
<rect x="-34" y="26" width="68" height="6" rx="3" fill="color-mix(in srgb, var(--primary-text-color) 30%, transparent)"/>
</g>
<text id="s_state" x="69" y="166" text-anchor="middle" class="slbl" style="font-size:11px">—</text>
<text x="20" y="194" class="slbl" style="fill:#ef5350">TUR</text><text id="s_flow" x="118" y="194" text-anchor="end" class="sv" style="fill:#ef5350">—</text>
<text x="20" y="218" class="slbl" style="fill:#42a5f5">RETUR</text><text id="s_ret" x="118" y="218" text-anchor="end" class="sv" style="fill:#42a5f5">—</text>
<text x="20" y="242" class="slbl">ΔT</text><text id="s_dt" x="118" y="242" text-anchor="end" class="sv" style="font-size:14px">—</text>
<defs><linearGradient id="hfl1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff6f00"/><stop offset=".6" stop-color="#ffa000"/><stop offset="1" stop-color="#ffecb3"/></linearGradient>
<linearGradient id="hfl2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#29b6f6"/><stop offset="1" stop-color="#fff59d"/></linearGradient></defs>
${loop(46, "lu", "ETAJ")}${loop(166, "ld", "PARTER")}
</svg>`;
const zones = c.zones
.map(
(z, i) => `<div class="zn off" id="z${i}" style="--zc:${z.color};animation-delay:${i * 0.07}s">
<div class="zh"><ha-icon icon="${z.icon}"></ha-icon><span>${tbEsc(z.name)}</span><button class="pw" data-i="${i}" data-a="pw" title="Pornește / oprește"><ha-icon icon="mdi:power"></ha-icon></button></div>
<svg class="waves" viewBox="0 0 36 46"><path d="M6,40 q-5,-7 0,-14 t0,-14"/><path d="M18,40 q-5,-7 0,-14 t0,-14"/><path d="M30,40 q-5,-7 0,-14 t0,-14"/></svg>
<div class="zt"><b id="zc${i}">—</b><small>°</small><ha-icon class="tr" id="zr${i}"></ha-icon></div>
<div class="zs"><span id="zhm${i}"></span><span class="zst" id="zst${i}"></span></div>
<div class="zg" id="zg${i}"></div>
<div class="zset"><button data-i="${i}" data-a="dn">−</button><div><small>Setat</small><b id="zs${i}">—</b></div><button data-i="${i}" data-a="up">+</button></div>
<div class="zbar"><i id="zb${i}" style="width:0"></i></div><div class="zhrs" id="zh${i}"></div></div>`
)
.join("");
this.shadowRoot.innerHTML = `<style>${TB_BASE_CSS}${TB_HEAT_CSS}</style>
<ha-card><div class="g">
<div class="pn sch" id="sch"><div class="pt"><ha-icon icon="mdi:water-boiler"></ha-icon>Centrală și circuite<span class="sp"></span><span class="note" id="s_note"></span></div>${sch}</div>
<div class="pn ctl">
<div class="pt" style="margin:0"><ha-icon icon="mdi:chart-bell-curve-cumulative"></ha-icon>Curbă de încălzire<span class="sp"></span><span class="note" id="c_note"></span></div>
<div class="cg"><div id="cgraph" style="height:100%;min-height:0"></div>
<div class="stp">
<span class="lb">Tur −10°</span><span class="nb"><button data-n="c_m10" data-d="-1">−</button><b id="n_c_m10">—</b><button data-n="c_m10" data-d="1">+</button></span>
<span class="lb">Tur +15°</span><span class="nb"><button data-n="c_p15" data-d="-1">−</button><b id="n_c_p15">—</b><button data-n="c_p15" data-d="1">+</button></span>
<span class="lb">Tur calculat</span><b id="c_calc" style="text-align:center">—</b>
<span class="lb">Tur cerut</span><b id="c_des" style="text-align:center">—</b>
</div></div>
<button class="tg" id="tg_curve" data-t="curve" style="--tgc:#ff7043"><ha-icon icon="mdi:chart-bell-curve"></ha-icon>Curbă automată (eBUS)<span class="sw"></span></button>
<button class="tg ro" id="tg_season" style="--tgc:#66bb6a"><ha-icon icon="mdi:sun-snowflake-variant"></ha-icon><span id="season_t">Sezon încălzire</span><span class="sw"></span></button>
</div>
<div class="pn gauge"><div class="pt"><ha-icon icon="mdi:gauge"></ha-icon>Presiune · ACM · Gaz</div>
<svg viewBox="0 0 200 122"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#ef5350"/><stop offset=".3" stop-color="#ffca28"/><stop offset=".45" stop-color="#66bb6a"/><stop offset=".72" stop-color="#66bb6a"/><stop offset=".85" stop-color="#ffca28"/><stop offset="1" stop-color="#ef5350"/></linearGradient></defs>
<path d="M22,100 A78,78 0 0,1 178,100" fill="none" stroke="url(#gg)" stroke-width="12" stroke-linecap="round" opacity=".85"/>
<g class="needle" id="needle" style="transform:rotate(-90deg)"><path d="M100,100 L97,100 L100,34 L103,100 Z" fill="var(--primary-text-color)"/></g><circle cx="100" cy="100" r="7" fill="var(--primary-text-color)"/>
<text class="gsub" x="22" y="116">0</text><text class="gsub" x="178" y="116">3</text><text class="gsub" x="100" y="66">bar</text><text id="g_v" class="gtx" x="100" y="117" style="font-size:19px">—</text></svg>
<div class="kv"><span><ha-icon icon="mdi:water-thermometer" style="color:#ffb300"></ha-icon>ACM</span><b id="k_hwc">—</b></div>
<div class="kv"><span><ha-icon icon="mdi:water-boiler" style="color:#ff7043"></ha-icon>Boiler</span><b id="k_sto">—</b></div>
<div class="kv"><span><ha-icon icon="mdi:thermometer" style="color:#4fc3f7"></ha-icon>Afară</span><b id="k_out">—</b></div>
<div class="kv"><span><ha-icon icon="mdi:fire" style="color:#ff7043"></ha-icon>Gaz azi</span><b id="k_gas">—</b></div>
</div>
<div class="zones">${zones}</div>
<div class="pn ch"><div class="pt"><ha-icon icon="mdi:chart-line"></ha-icon>Tur / retur 24 h<span class="sp"></span><span class="leg"><span><i style="background:#ef5350"></i>Tur</span><span><i style="background:#42a5f5"></i>Retur</span><span><i style="background:#ffb300"></i>Cerut</span><span><i style="background:#4fc3f7;opacity:.5"></i>Afară</span></span></div><div class="cw" id="chart"></div></div>
<div class="pn ac" id="acp"><div class="pt"><ha-icon class="fan" icon="mdi:fan"></ha-icon>AC din surplus solar<span class="sp"></span><span class="note" id="ac_n"></span></div>
<button class="tg" id="tg_ac" data-t="ac_auto" style="--tgc:#ffb300;margin-bottom:6px"><ha-icon icon="mdi:solar-power"></ha-icon>Pornire automată din surplus<span class="sw"></span></button>
<div class="stp"><span class="lb">Temperatură AC</span><span class="nb"><button data-n="ac_temp" data-d="-1">−</button><b id="n_ac_temp">—</b><button data-n="ac_temp" data-d="1">+</button></span>
<span class="lb">Injectare · baterie</span><b id="ac_inj" style="text-align:center">—</b></div>
</div>
<div class="pn"><div class="pt"><ha-icon icon="mdi:counter"></ha-icon>Statistici centrală</div><div class="st" id="stats"></div></div>
</div></ha-card>`;
this._pend = {};
this.shadowRoot.querySelector(".zones").addEventListener("click", (ev) => {
const b = ev.target.closest("button[data-a]");
if (b) this._zoneAct(+b.dataset.i, b.dataset.a);
});
this.shadowRoot.querySelectorAll("button[data-n]").forEach((b) => b.addEventListener("click", () => this._numAct(b.dataset.n, +b.dataset.d)));
this.shadowRoot.querySelectorAll("button.tg[data-t]").forEach((b) =>
b.addEventListener("click", () => this._svc("input_boolean", "toggle", { entity_id: this._config[b.dataset.t] }))
);
}
_onStart() {
this._loadChart();
this._every(600e3, () => this._loadChart());
}
_zoneAct(i, a) {
const z = this._config.zones[i], st = this._hass.states[z.climate];
if (!st) return;
if (a === "pw") {
this._svc("climate", "set_hvac_mode", { entity_id: z.climate, hvac_mode: st.state === "off" ? "heat" : "off" });
return;
}
const cur = this._pend[i] !== undefined ? this._pend[i] : parseFloat(st.attributes.temperature);
if (!isFinite(cur)) return;
const nv = tbClamp(Math.round((cur + (a === "up" ? 0.5 : -0.5)) * 2) / 2, st.attributes.min_temp || 7, st.attributes.max_temp || 30);
this._pend[i] = nv;
this._t(`zs${i}`, `${tbF(nv, 1)}°`);
this._c(`zs${i}`, "pend", true);
clearTimeout(this["_zt" + i]);
this["_zt" + i] = setTimeout(async () => {
await this._svc("climate", "set_temperature", { entity_id: z.climate, temperature: nv });
setTimeout(() => {
delete this._pend[i];
this._c(`zs${i}`, "pend", false);
this._update();
}, 1500);
}, 900);
}
_numAct(key, dir) {
const id = this._config[key], st = this._hass.states[id];
if (!st) return;
const step = parseFloat(st.attributes.step) || 1;
const cur = this._pend[key] !== undefined ? this._pend[key] : parseFloat(st.state);
if (!isFinite(cur)) return;
const nv = tbClamp(cur + dir * step, parseFloat(st.attributes.min), parseFloat(st.attributes.max));
this._pend[key] = nv;
this._t("n_" + key, `${tbF(nv, step < 1 ? 1 : 0)}°`);
clearTimeout(this["_nt" + key]);
this["_nt" + key] = setTimeout(async () => {
await this._svc("input_number", "set_value", { entity_id: id, value: nv });
setTimeout(() => {
delete this._pend[key];
this._update();
}, 1500);
}, 800);
}
_update() {
const h = this._hass, c = this._config;
const n = (k) => tbNum(h, c[k]);
const flow = n("flow"), ret = n("ret"), out = n("out");
const pumpSt = tbSt(h, c.pump);
const demand = tbSt(h, c.demand) === "on" || tbSt(h, c.call) === "on";
const upOn = tbSt(h, c.pump_up) === "on", dnOn = tbSt(h, c.pump_down) === "on";
const burn = demand && (pumpSt === "on" || (flow !== null && ret !== null && flow - ret > 2));
this._c("sch", "demand", demand);
this._c("flm", "burn", burn);
this._e("sch").classList.toggle("burn", burn);
this._t("s_state", burn ? "ARZĂTOR PORNIT" : demand ? "CERERE CĂLDURĂ" : pumpSt === "hwc" ? "APĂ CALDĂ" : "STANDBY");
this._t("s_flow", flow !== null ? `${tbF(flow, 1)}°` : "—");
this._t("s_ret", ret !== null ? `${tbF(ret, 1)}°` : "—");
this._t("s_dt", flow !== null && ret !== null ? `${tbF(flow - ret, 1)}°` : "—");
this._c("lu", "flowing", upOn);
this._c("lu", "on", upOn);
this._c("ld", "flowing", dnOn);
this._c("ld", "on", dnOn);
this._t("lu_st", upOn ? "pompă pornită" : "pompă oprită");
this._t("ld_st", dnOn ? "pompă pornită" : "pompă oprită");
this._t("s_note", `pompă centrală: ${({ on: "pornită", off: "oprită", overrun: "post-funcționare", hwc: "ACM" })[pumpSt] || "—"}`);
// curve
const m10 = this._pend.c_m10 ?? n("c_m10"), p15 = this._pend.c_p15 ?? n("c_p15");
this._t("n_c_m10", m10 !== null ? `${tbF(m10, 0)}°` : "—");
this._t("n_c_p15", p15 !== null ? `${tbF(p15, 0)}°` : "—");
this._t("c_calc", n("flow_calc") !== null ? `${tbF(n("flow_calc"), 1)}°` : "—");
this._t("c_des", n("flow_des") !== null ? `${tbF(n("flow_des"), 1)}°` : "—");
const csig = `${m10}|${p15}|${out}`;
if (csig !== this._csig) {
this._csig = csig;
this._curve(m10, p15, out);
}
const curveOn = tbSt(h, c.curve) === "on";
this._c("tg_curve", "on", curveOn);
this._t("c_note", curveOn ? "automat" : "manual");
const seas = tbSt(h, c.season) === "on";
this._c("tg_season", "on", seas);
this._t("season_t", seas ? "Sezon de încălzire activ" : "Sezon de încălzire oprit");
// pressure etc.
const p = n("pressure");
this._e("needle").style.transform = `rotate(${p !== null ? -90 + (tbClamp(p, 0, 3) / 3) * 180 : -90}deg)`;
this._t("g_v", p !== null ? `${tbF(p, 2)}` : "—");
this._t("k_hwc", n("hwc") !== null ? `${tbF(n("hwc"), 1)} °C` : "—");
this._t("k_sto", n("storage") !== null ? `${tbF(n("storage"), 1)} / ${tbF(n("storage_des"), 0)} °C` : "—");
this._t("k_out", out !== null ? `${tbF(out, 1)} °C` : "—");
this._t("k_gas", n("gas_total") !== null ? `${tbF(n("gas_total"), 0)} kWh (înc. ${tbF(n("gas_heat"), 0)} · ACM ${tbF(n("gas_hwc"), 0)})` : "—");
// zones
c.zones.forEach((z, i) => {
const st = h.states[z.climate];
if (!st) return;
const a = st.attributes;
const off = st.state === "off";
const heat = a.hvac_action === "heating";
const win = tbSt(h, z.wlock) === "on" || tbSt(h, z.window) === "on";
const el = this._e(`z${i}`);
el.classList.toggle("off", off);
el.classList.toggle("heat", heat && !off);
el.classList.toggle("win", win);
const cur = parseFloat(a.current_temperature), tgt = parseFloat(a.temperature);
this._t(`zc${i}`, isFinite(cur) ? tbF(cur, 1) : "—");
const tr = this._e(`zr${i}`);
const icon = !isFinite(cur) || !isFinite(tgt) || off ? "" : cur < tgt - 0.25 ? "mdi:arrow-up-thin" : cur > tgt + 0.25 ? "mdi:arrow-down-thin" : "mdi:check";
if (tr.getAttribute("icon") !== icon) tr.setAttribute("icon", icon);
tr.style.color = icon === "mdi:arrow-up-thin" ? z.color : icon === "mdi:arrow-down-thin" ? "#4fc3f7" : "#66bb6a";
if (this._pend[i] === undefined) this._t(`zs${i}`, isFinite(tgt) ? `${tbF(tgt, 1)}°` : "—");
const hm = tbNum(h, z.hum);
this._t(`zhm${i}`, hm !== null ? `💧 ${tbF(hm, 0)}%` : "");
this._t(`zst${i}`, win ? "Geam deschis" : off ? "Oprit" : heat ? "Încălzește" : "Inactiv");
const hr = tbNum(h, z.hours);
this._e(`zb${i}`).style.width = `${hr !== null ? tbClamp((hr / 12) * 100, 0, 100) : 0}%`;
const hh = Math.floor(hr || 0), mm = Math.round(((hr || 0) - hh) * 60);
this._t(`zh${i}`, hr !== null ? `${hh} h ${String(mm).padStart(2, "0")} min încălzire azi` : "");
});
// AC
const acAuto = tbSt(h, c.ac_auto) === "on";
this._c("tg_ac", "on", acAuto);
const acst = h.states[c.ac];
const acOn = acst && acst.state !== "off" && tbOk(acst.state);
this._c("acp", "acon", acOn);
this._t("ac_n", acst ? (acOn ? `AC ${acst.state === "heat" ? "încălzește" : acst.state} · ${tbF(parseFloat(acst.attributes.current_temperature), 1)}°` : "AC oprit") : "");
const at = this._pend.ac_temp ?? n("ac_temp");
this._t("n_ac_temp", at !== null ? `${tbF(at, 0)}°` : "—");
this._t("ac_inj", `${tbP(n("inj"))} · ${tbF(n("soc"), 0)}%`);
this._h(
"stats",
c.stats.map(([l, id, ic]) => `<div class="kv"><span><ha-icon icon="${ic}"></ha-icon>${l}</span><b>${tbOk(tbSt(h, id)) ? Number(tbSt(h, id)).toLocaleString("ro-RO") : "—"}</b></div>`).join("")
);
}
_zoneCharts(hs) {
const t1 = Date.now(), t0 = t1 - 12 * 3600e3;
this._config.zones.forEach((z, i) => {
const pts = tbResample(hs[z.temp], t0, t1, 10 * 60e3).filter((p) => p.v !== null);
if (pts.length < 2) return;
const st = this._hass.states[z.climate];
const tgt = st ? parseFloat(st.attributes.temperature) : NaN;
const vals = pts.map((p) => p.v).concat(isFinite(tgt) ? [tgt] : []);
const lo = Math.min(...vals) - 0.3, hi = Math.max(...vals) + 0.3;
const W = 200, H = 60;
const X = (t) => ((t - t0) / (t1 - t0)) * W;
const Y = (v) => 4 + ((hi - v) / (hi - lo)) * (H - 8);
const d = tbPath(pts.map((p) => [X(p.t), Y(p.v)]));
const tl = isFinite(tgt) ? `<line x1="0" x2="${W}" y1="${Y(tgt).toFixed(1)}" y2="${Y(tgt).toFixed(1)}" stroke="${z.color}" stroke-dasharray="3 4" stroke-width="1.2" opacity=".8" vector-effect="non-scaling-stroke"/>` : "";
this._h(
`zg${i}`,
`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="zgg${i}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${z.color}" stop-opacity=".35"/><stop offset="1" stop-color="${z.color}" stop-opacity="0"/></linearGradient></defs>
${tl}<path d="${d} L${W},${H} L0,${H} Z" fill="url(#zgg${i})"/><path d="${d}" fill="none" stroke="${z.color}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`
);
});
}
_curve(m10, p15, out) {
if (m10 === null || p15 === null) return;
const W = 220, H = 150, L = 26, R = 8, T = 10, B = 20;
const X = (t) => L + ((t + 15) / 35) * (W - L - R);
const lo = 20, hi = 50;
const Y = (v) => T + ((hi - v) / (hi - lo)) * (H - T - B);
const f = (t) => tbClamp(m10 + ((p15 - m10) * (t + 10)) / 25, Math.min(m10, p15), Math.max(m10, p15));
let g = "";
for (const v of [20, 30, 40, 50]) g += `<line class="gl" x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}"/><text class="cax" x="${L - 4}" y="${Y(v) + 3}" text-anchor="end">${v}°</text>`;
for (const t of [-15, -5, 5, 15, 20]) g += `<text class="cax" x="${X(t)}" y="${H - 5}" text-anchor="middle">${t}°</text>`;
const pts = [];
for (let t = -15; t <= 20; t += 1) pts.push([X(t), Y(f(t))]);
let dot = "";
if (out !== null) {
const tt = tbClamp(out, -15, 20);
dot = `<line x1="${X(tt)}" x2="${X(tt)}" y1="${T}" y2="${H - B}" stroke="#4fc3f7" stroke-dasharray="3 3" opacity=".7"/><circle class="cring" cx="${X(tt)}" cy="${Y(f(tt))}" r="6"/><circle class="cdot" cx="${X(tt)}" cy="${Y(f(tt))}" r="5"/>`;
}
this._h(
"cgraph",
`<svg viewBox="0 0 ${W} ${H}"><defs><linearGradient id="hcg" x1="0" x2="1"><stop offset="0" stop-color="#ef5350"/><stop offset="1" stop-color="#ffca28"/></linearGradient></defs>${g}<path class="cline draw" style="--len:400" d="${tbPath(pts)}"/>${dot}<text class="cax" x="${W - R}" y="${T + 8}" text-anchor="end">tur ↑ · afară →</text></svg>`
);
}
async _loadChart() {
if (!this._hass) return;
const c = this._config;
let hs = {};
try {
hs = await tbHistory(this._hass, [c.flow, c.ret, c.flow_des, c.out, ...c.zones.map((z) => z.temp).filter(Boolean)], 24);
} catch (e) {
return;
}
this._zoneCharts(hs);
const t1 = Date.now(), t0 = t1 - 24 * 3600e3, step = 5 * 60e3;
const S = (id) => tbResample(hs[id], t0, t1, step).filter((p) => p.v !== null);
const fl = S(c.flow), rt = S(c.ret), ds = S(c.flow_des), ot = S(c.out);
const all = [...fl, ...rt, ...ds, ...ot].map((p) => p.v);
if (!all.length) return;
const lo = Math.floor(Math.min(...all) / 5) * 5, hi = Math.ceil(Math.max(...all) / 5) * 5 || lo + 5;
const W = 620, H = 120, L = 28, R = 6, T = 6, B = 16;
const X = (t) => L + ((t - t0) / (t1 - t0)) * (W - L - R);
const Y = (v) => T + ((hi - v) / (hi - lo || 1)) * (H - T - B);
const P = (arr) => tbPath(arr.map((p) => [X(p.t), Y(p.v)]));
let g = "";
for (let v = lo; v <= hi; v += Math.max(5, Math.round((hi - lo) / 4 / 5) * 5)) g += `<line class="gl" x1="${L}" x2="${W - R}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text class="ax" x="${L - 4}" y="${(Y(v) + 3).toFixed(1)}" text-anchor="end">${v}°</text>`;
for (let k = 0; k <= 24; k += 4) g += `<text class="ax" x="${X(t0 + k * 3600e3).toFixed(1)}" y="${H - 3}" text-anchor="middle">${tbHHMM(new Date(t0 + k * 3600e3))}</text>`;
this._h(
"chart",
`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${g}
<path d="${P(ot)}" fill="none" stroke="#4fc3f7" stroke-width="1.5" opacity=".5"/>
<path d="${P(ds)}" fill="none" stroke="#ffb300" stroke-width="1.5" stroke-dasharray="4 3"/>
<path class="draw" style="--len:2200" d="${P(rt)}" fill="none" stroke="#42a5f5" stroke-width="2"/>
<path class="draw" style="--len:2200" d="${P(fl)}" fill="none" stroke="#ef5350" stroke-width="2"/></svg>`
);
}
}
customElements.get("tb-heat-card") || customElements.define("tb-heat-card", TbHeatCard);
