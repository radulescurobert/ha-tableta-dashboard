/* ================================================================
*  PHOTOVOLTAIC card  (custom:tb-pv-card)
*  >>> Replace every "YOUR_..." entity in defaults() below (or pass it from the dashboard YAML).
*  Power sensors in W/Wh are converted automatically to kW/kWh.
* ================================================================ */
const tbFlowDur = (kw) => (kw < 0.3 ? 3.4 : kw < 1 ? 2.5 : kw < 2 ? 1.8 : kw < 3.5 ? 1.3 : 0.9);
const TB_PV_CSS = `
.g { display: grid; grid-template-columns: 1.18fr 1fr; gap: 12px; height: 100%; }
.col { display: flex; flex-direction: column; gap: 12px; min-height: 0; min-width: 0; }
.dia { flex: 1 1 auto; padding: 8px; background: radial-gradient(120% 90% at 15% 0%, color-mix(in srgb, #ffb300 var(--sunmix, 10%), var(--card-background-color)) 0%, var(--card-background-color) 60%); transition: background 2s; }
.dia svg { width: 100%; height: 100%; display: block; }
.dia .pt { position: absolute; left: 14px; top: 12px; z-index: 1; }
.lbl { font-size: 13px; fill: var(--secondary-text-color); font-weight: 600; letter-spacing: .04em; }
.val { font-size: 21px; font-weight: 800; fill: var(--primary-text-color); }
.sval { font-size: 14px; font-weight: 700; fill: var(--primary-text-color); }
.fp { fill: none; stroke: color-mix(in srgb, var(--primary-text-color) 14%, transparent); stroke-width: 4; stroke-linecap: round; }
.fp.on { stroke: var(--fc); stroke-opacity: .5; stroke-dasharray: 8 6; animation: tbDash 1.1s linear infinite; }
.fp.on.rev { animation-direction: reverse; }
.node { fill: color-mix(in srgb, var(--primary-text-color) 7%, var(--card-background-color)); stroke: color-mix(in srgb, var(--primary-text-color) 22%, transparent); stroke-width: 1.5; }
.rays line { stroke: #ffc107; stroke-width: 4; stroke-linecap: round; }
.rays { transform-box: fill-box; transform-origin: center; animation: tbSpin var(--rs, 30s) linear infinite; }
.sunc { transition: opacity 1.5s; }
.halo { transform-box: fill-box; transform-origin: center; animation: pvHalo 3.5s ease-in-out infinite; }
@keyframes pvHalo { 50% { transform: scale(1.18); opacity: .6; } }
.panel { fill: url(#pvPanel); stroke: #90caf9; stroke-width: 1.2; }
.pgrid { stroke: rgba(144,202,249,.45); stroke-width: 1; }
.shine { fill: url(#pvShine); opacity: 0; }
.prod .shine { opacity: 1; animation: pvShine 3.2s ease-in-out infinite; }
@keyframes pvShine { from { transform: translateX(-90px); } to { transform: translateX(120px); } }
.led { fill: #616161; }
.prod .led { fill: #00e676; animation: tbPulse 1.4s infinite; filter: drop-shadow(0 0 4px #00e676); }
.win { fill: #37474f; transition: fill 1s; }
.lit .win { fill: #ffe082; animation: pvWin 4s ease-in-out infinite; }
@keyframes pvWin { 50% { fill: #ffd54f; } }
.batbody { fill: none; stroke: color-mix(in srgb, var(--primary-text-color) 45%, transparent); stroke-width: 2.5; }
.batfill { transition: width 1.5s cubic-bezier(.2,.8,.2,1), fill 1s; }
.batwave { opacity: 0; }
.chg .batwave { opacity: .5; animation: pvWave 1.6s linear infinite; }
.dis .batwave { opacity: .35; animation: pvWave 1.6s linear infinite reverse; }
@keyframes pvWave { from { transform: translateX(-24px); } to { transform: translateX(0); } }
.bolt { opacity: 0; fill: #fff; }
.chg .bolt { opacity: 1; animation: tbPulse 1.2s infinite; }
.tower { fill: none; stroke: color-mix(in srgb, var(--primary-text-color) 55%, transparent); stroke-width: 2; stroke-linejoin: round; }
.imp .spark { opacity: 1; animation: tbPulse .8s infinite; }
.spark { opacity: 0; fill: #ffeb3b; }
.chart { flex: 0 0 31%; display: flex; flex-direction: column; }
.chart svg { flex: 1; width: 100%; min-height: 0; }
.ax { font-size: 11px; fill: var(--secondary-text-color); }
.gl { stroke: color-mix(in srgb, var(--primary-text-color) 9%, transparent); stroke-dasharray: 3 4; }
.leg { display: flex; gap: 14px; font-size: .75rem; color: var(--secondary-text-color); text-transform: none; letter-spacing: 0; font-weight: 600; }
.leg i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 4px; vertical-align: -1px; }
.today { flex: 0 0 auto; }
.prog { position: relative; height: 16px; border-radius: 9px; background: color-mix(in srgb, var(--primary-text-color) 9%, transparent); overflow: hidden; margin: 4px 0 10px; }
.prog i { position: absolute; inset: 0 auto 0 0; border-radius: 9px; background: linear-gradient(90deg, #ff8f00, #ffd54f); transition: width 1.5s; }
.prog i::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent); animation: pvSweep 2.4s infinite; }
@keyframes pvSweep { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
.prow { display: flex; align-items: baseline; gap: 8px; }
.prow b { font-size: 1.9rem; font-weight: 800; }
.prow .mut { font-size: .9rem; }
.tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.tile { border-radius: 12px; padding: 8px 10px; background: color-mix(in srgb, var(--tc, var(--primary-color)) 11%, transparent); animation: tbFade .5s both; min-width: 0; }
.tile .l { display: flex; align-items: center; gap: 5px; font-size: .7rem; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .04em; white-space: nowrap; overflow: hidden; }
.tile .l ha-icon { --mdc-icon-size: 15px; color: var(--tc); }
.tile .v { font-size: 1.18rem; font-weight: 800; margin-top: 2px; white-space: nowrap; }
.tile .v small { font-size: .72rem; font-weight: 500; color: var(--secondary-text-color); }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; flex: 1 1 auto; min-height: 0; }
.ring { display: flex; align-items: center; gap: 12px; }
.ring svg { width: 96px; height: 96px; flex: 0 0 auto; }
.ring .bg { fill: none; stroke: color-mix(in srgb, var(--primary-text-color) 10%, transparent); stroke-width: 10; }
.ring .fg { fill: none; stroke-width: 10; stroke-linecap: round; transition: stroke-dashoffset 1.5s cubic-bezier(.2,.8,.2,1), stroke 1s; transform: rotate(-90deg); transform-origin: 50% 50%; }
.ring text { font-size: 22px; font-weight: 800; fill: var(--primary-text-color); text-anchor: middle; }
.kv { display: flex; justify-content: space-between; gap: 8px; font-size: .84rem; padding: 3px 0; border-bottom: 1px dashed color-mix(in srgb, var(--primary-text-color) 10%, transparent); }
.kv:last-child { border-bottom: none; }
.kv span:first-child { color: var(--secondary-text-color); }
.kv b { font-weight: 700; white-space: nowrap; }
.ph { display: grid; grid-template-columns: 26px 1fr auto; gap: 8px; align-items: center; font-size: .82rem; margin: 3px 0; }
.ph .bar { height: 7px; border-radius: 4px; background: color-mix(in srgb, var(--primary-text-color) 10%, transparent); overflow: hidden; }
.ph .bar i { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #26c6da, #66bb6a); transition: width 1s; }
table.my { width: 100%; border-collapse: collapse; font-size: .86rem; }
.my th { text-align: right; font-size: .7rem; color: var(--secondary-text-color); font-weight: 700; text-transform: uppercase; letter-spacing: .05em; padding: 2px 4px; }
.my th:first-child, .my td:first-child { text-align: left; }
.my td { text-align: right; padding: 4px; border-top: 1px solid color-mix(in srgb, var(--primary-text-color) 8%, transparent); font-variant-numeric: tabular-nums; white-space: nowrap; }
.my td:first-child { color: var(--secondary-text-color); }
.my td ha-icon { --mdc-icon-size: 16px; margin-right: 4px; }
.eco { display: flex; gap: 14px; margin-top: 8px; font-size: .82rem; color: var(--secondary-text-color); }
.eco ha-icon { --mdc-icon-size: 18px; color: #66bb6a; }
@media (max-height: 760px) { .g, .col, .row2 { gap: 9px; } .prow b { font-size: 1.55rem; } .prog { height: 13px; margin: 3px 0 7px; } .tiles { gap: 6px; } .tile { padding: 5px 8px; } .tile .v { font-size: 1.02rem; } .ring { gap: 8px; } .ring svg { width: 70px; height: 70px; } .kv { font-size: .76rem; padding: 2px 0; } .ph { font-size: .74rem; margin: 1px 0; grid-template-columns: 22px 1fr auto; } .eco { margin-top: 4px; font-size: .76rem; } table.my { font-size: .78rem; } .my td { padding: 2px 4px; } .my th { padding: 0 4px; } }
@media (max-width: 899px), (orientation: portrait) { .g { grid-template-columns: 1fr; } .dia { min-height: 380px; } .chart { min-height: 220px; } }
`;
class TbPvCard extends TbBase {
static defaults() {
return {
peak_kw: 6, /* >>> your installed peak power in kW */
/* >>> REPLACE all entities below with yours. Empty string "" = hidden / not available */
pv: "sensor.YOUR_PV_DC_POWER",
pv1_v: "sensor.YOUR_PV1_VOLTAGE",
pv1_a: "sensor.YOUR_PV1_CURRENT",
pv2_v: "sensor.YOUR_PV2_VOLTAGE",
pv2_a: "sensor.YOUR_PV2_CURRENT",
load: "sensor.YOUR_HOUSE_CONSUMPTION_POWER",
grid: "sensor.YOUR_GRID_POWER", /* positive = export, negative = import */
bat: "sensor.YOUR_BATTERY_POWER", /* positive = charging */
soc: "sensor.YOUR_BATTERY_SOC",
cap: "sensor.YOUR_BATTERY_CAPACITY_KWH",
bat_mode: "sensor.YOUR_BATTERY_MODE",
bat_status: "sensor.YOUR_BATTERY_STATUS",
bat_temp: "sensor.YOUR_BATTERY_TEMPERATURE",
bat_soh: "sensor.YOUR_BATTERY_SOH_OR_CALIBRATION",
bat_in: "sensor.YOUR_BATTERY_CHARGED_TODAY",
bat_out: "sensor.YOUR_BATTERY_DISCHARGED_TODAY",
prod_today: "sensor.YOUR_PRODUCTION_TODAY", /* kWh, daily utility_meter */
fc_today: "sensor.YOUR_FORECAST_TODAY", /* optional: forecast production today (kWh), e.g. Forecast.Solar */
fc_rem: "",
load_today: "sensor.YOUR_CONSUMPTION_TODAY",
self_today: "sensor.YOUR_SELF_CONSUMED_TODAY",
imp_today: "sensor.YOUR_IMPORT_TODAY",
exp_today: "sensor.YOUR_EXPORT_TODAY",
prod_month: "sensor.YOUR_PRODUCTION_MONTH",
prod_year: "sensor.YOUR_PRODUCTION_YEAR",
load_month: "sensor.YOUR_CONSUMPTION_MONTH",
load_year: "sensor.YOUR_CONSUMPTION_YEAR",
imp_month: "sensor.YOUR_IMPORT_MONTH",
imp_year: "sensor.YOUR_IMPORT_YEAR",
exp_month: "sensor.YOUR_EXPORT_MONTH",
exp_year: "sensor.YOUR_EXPORT_YEAR",
self_ratio: "sensor.YOUR_SELF_CONSUMPTION_PERCENT",
co2: "sensor.YOUR_CO2_AVOIDED",
trees: "sensor.YOUR_TREES_EQUIVALENT",
inv_model: "",
inv_temp: "sensor.YOUR_INVERTER_TEMPERATURE",
phases: [
["L1", "sensor.YOUR_PHASE_A_VOLTAGE", "sensor.YOUR_PHASE_A_CURRENT"],
["L2", "sensor.YOUR_PHASE_B_VOLTAGE", "sensor.YOUR_PHASE_B_CURRENT"],
["L3", "sensor.YOUR_PHASE_C_VOLTAGE", "sensor.YOUR_PHASE_C_CURRENT"],
],
};
}
_build() {
// panels: parallelograms with a grid
const panel = (x, y, id) => {
const w = 92, hh = 50, sk = 20;
let grid = "";
for (let i = 1; i < 4; i++) {
const t = i / 4;
grid += `<line class="pgrid" x1="${x + sk - sk * 0 + w * t}" y1="${y}" x2="${x + w * t}" y2="${y + hh}"/>`;
}
grid += `<line class="pgrid" x1="${x + sk / 2}" y1="${y + hh / 2}" x2="${x + w + sk / 2}" y2="${y + hh / 2}"/>`;
return `<g id="${id}"><clipPath id="c${id}"><polygon points="${x + sk},${y} ${x + w + sk},${y} ${x + w},${y + hh} ${x},${y + hh}"/></clipPath>
<polygon class="panel" points="${x + sk},${y} ${x + w + sk},${y} ${x + w},${y + hh} ${x},${y + hh}"/>${grid}
<g clip-path="url(#c${id})"><rect class="shine" x="${x}" y="${y}" width="40" height="${hh}"/></g>
<line x1="${x + w / 2 + 6}" y1="${y + hh}" x2="${x + w / 2 + 6}" y2="${y + hh + 12}" stroke="#78909c" stroke-width="3"/></g>`;
};
let rays = "";
for (let i = 0; i < 12; i++) {
const a = (i * Math.PI) / 6;
rays += `<line x1="${(Math.cos(a) * 34).toFixed(1)}" y1="${(Math.sin(a) * 34).toFixed(1)}" x2="${(Math.cos(a) * 48).toFixed(1)}" y2="${(Math.sin(a) * 48).toFixed(1)}"/>`;
}
const svg = `<svg viewBox="0 0 640 430" preserveAspectRatio="xMidYMid meet">
<defs>
<radialGradient id="pvSun"><stop offset="0" stop-color="#fff8e1"/><stop offset=".55" stop-color="#ffd54f"/><stop offset="1" stop-color="#ff8f00"/></radialGradient>
<radialGradient id="pvHalo"><stop offset="0" stop-color="rgba(255,213,79,.55)"/><stop offset="1" stop-color="rgba(255,213,79,0)"/></radialGradient>
<linearGradient id="pvPanel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e3a5f"/><stop offset="1" stop-color="#0d2137"/></linearGradient>
<linearGradient id="pvShine" x1="0" x2="1"><stop offset="0" stop-color="rgba(255,255,255,0)"/><stop offset=".5" stop-color="rgba(255,255,255,.55)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></linearGradient>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<!-- paths -->
<path id="p_pv1" class="fp" style="--fc:#ffb300" d="M152,128 C152,175 270,170 300,196"/>
<path id="p_pv2" class="fp" style="--fc:#ffb300" d="M272,128 C272,160 310,170 318,196"/>
<path id="p_house" class="fp" style="--fc:#26c6da" d="M362,236 L478,236"/>
<path id="p_bat" class="fp" style="--fc:#66bb6a" d="M318,276 L318,328"/>
<path id="p_grid" class="fp" style="--fc:#ef5350" d="M540,118 L540,190"/>
<g id="f_pv1"></g><g id="f_pv2"></g><g id="f_house"></g><g id="f_bat"></g><g id="f_grid"></g>
<!-- sun -->
<g id="sun" class="sunc" transform="translate(60 76)"><circle r="46" fill="url(#pvHalo)" class="halo"/><g class="rays">${rays}</g><circle r="27" fill="url(#pvSun)"/></g>
<text id="t_pv" x="60" y="146" text-anchor="middle" class="val">—</text>
<text x="60" y="164" text-anchor="middle" class="lbl">PRODUCȚIE</text>
<!-- panels -->
<g id="panels">${panel(104, 66, "pa1")}${panel(224, 66, "pa2")}</g>
<text x="152" y="58" text-anchor="middle" class="lbl">PV1 · <tspan id="t_pv1" class="sval">—</tspan></text>
<text x="272" y="58" text-anchor="middle" class="lbl">PV2 · <tspan id="t_pv2" class="sval">—</tspan></text>
<!-- inverter -->
<g id="inv"><rect class="node" x="276" y="196" width="86" height="80" rx="12"/>
<rect x="290" y="210" width="58" height="22" rx="4" fill="#263238"/><text id="t_invp" x="319" y="226" text-anchor="middle" style="font-size:12px;font-weight:700;fill:#80cbc4">—</text>
<circle class="led" cx="292" cy="262" r="4.5"/><text x="341" y="266" text-anchor="middle" class="lbl" style="font-size:11px">INVERTOR</text></g>
<text id="t_invt" x="268" y="262" text-anchor="end" class="lbl" style="font-size:12px"></text>
<!-- house -->
<g id="house" transform="translate(484 196)"><path class="node" d="M8,34 L56,0 L104,34 L104,92 L8,92 Z"/>
<rect class="win" x="24" y="44" width="22" height="18" rx="2"/><rect class="win" x="66" y="44" width="22" height="18" rx="2"/>
<rect x="45" y="66" width="22" height="26" rx="2" fill="color-mix(in srgb, var(--primary-text-color) 25%, transparent)"/></g>
<text id="t_load" x="540" y="316" text-anchor="middle" class="val">—</text>
<text x="540" y="334" text-anchor="middle" class="lbl">CONSUM CASĂ</text>
<text id="t_house" x="420" y="226" text-anchor="middle" class="sval"></text>
<!-- grid -->
<g id="grid" transform="translate(540 18)"><path class="tower" d="M-20,96 L-6,10 L6,10 L20,96 M-11,50 L11,50 M-14,72 L14,72 M-6,10 L-26,22 L26,22 L6,10 M-8,36 L-30,44 L30,44 L8,36 M-11,50 L14,72 M11,50 L-14,72"/>
<circle class="spark" cx="-26" cy="26" r="3"/><circle class="spark" cx="26" cy="26" r="3" style="animation-delay:.4s"/><circle class="spark" cx="-30" cy="48" r="3" style="animation-delay:.2s"/><circle class="spark" cx="30" cy="48" r="3" style="animation-delay:.6s"/></g>
<text x="508" y="66" text-anchor="end" class="lbl">REȚEA</text>
<text id="t_grid" x="566" y="160" class="sval"></text>
<text id="t_gridd" x="566" y="176" class="lbl" style="font-size:11px"></text>
<!-- battery -->
<g id="bat" transform="translate(248 334)"><rect class="batbody" x="0" y="0" width="134" height="60" rx="10"/><rect x="134" y="20" width="8" height="20" rx="3" fill="color-mix(in srgb, var(--primary-text-color) 45%, transparent)"/>
<clipPath id="bclip"><rect x="5" y="5" width="124" height="50" rx="6"/></clipPath>
<g clip-path="url(#bclip)"><rect id="bfill" class="batfill" x="5" y="5" width="0" height="50" fill="#66bb6a"/>
<path class="batwave" d="M-24,5 q6,6 12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0 v50 h-168 z" fill="#fff"/></g>
<text id="t_soc" x="67" y="38" text-anchor="middle" class="val" style="font-size:20px">—</text>
<path class="bolt" d="M18,14 L10,32 L17,32 L13,46 L24,26 L17,26 L22,14 Z"/></g>
<text id="t_bat" x="315" y="414" text-anchor="middle" class="sval"></text>
<text id="t_batv" x="334" y="306" class="sval"></text>
</svg>`;
this.shadowRoot.innerHTML = `<style>${TB_BASE_CSS}${TB_PV_CSS}</style>
<ha-card><div class="g">
<div class="col">
<div class="pn dia" id="dia"><div class="pt"><ha-icon icon="mdi:solar-power-variant"></ha-icon>Flux energie acum</div>${svg}</div>
<div class="pn chart"><div class="pt"><ha-icon icon="mdi:chart-areaspline"></ha-icon>Ultimele 24 de ore<span class="sp"></span>
<span class="leg"><span><i style="background:#ffb300"></i>Producție kW</span><span><i style="background:#26c6da"></i>Consum kW</span><span><i style="background:#66bb6a"></i>Baterie %</span></span></div>
<div id="chart" style="flex:1;min-height:0;display:flex"></div></div>
</div>
<div class="col">
<div class="pn today"><div class="pt"><ha-icon icon="mdi:white-balance-sunny"></ha-icon>Azi<span class="sp"></span><span id="fcn" class="note"></span></div>
<div class="prow"><b id="d_prod">—</b><span class="mut" id="d_prod2"></span></div>
<div class="prog"><i id="d_bar" style="width:0%"></i></div>
<div class="tiles" id="tiles"></div></div>
<div class="row2">
<div class="pn"><div class="pt"><ha-icon icon="mdi:home-battery-outline"></ha-icon>Baterie</div>
<div class="ring"><svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="40"/><circle id="r_fg" class="fg" cx="50" cy="50" r="40" stroke-dasharray="251.3" stroke-dashoffset="251.3"/><text id="r_t" x="50" y="58">—</text></svg>
<div style="flex:1;min-width:0"><div class="kv"><span>Stocat</span><b id="b_e">—</b></div><div class="kv"><span>Stare</span><b id="b_s">—</b></div><div class="kv"><span>Putere</span><b id="b_p">—</b></div></div></div>
<div class="kv"><span>Încărcat azi</span><b id="b_in">—</b></div><div class="kv"><span>Descărcat azi</span><b id="b_out">—</b></div>
<div class="kv"><span>Temperatură</span><b id="b_t">—</b></div><div class="kv"><span>Calibrare SOH</span><b id="b_soh">—</b></div><div class="kv"><span>Mod</span><b id="b_m" style="font-size:.76rem">—</b></div>
</div>
<div class="pn"><div class="pt"><ha-icon icon="mdi:solar-panel"></ha-icon>Invertor<span class="sp"></span><span class="note" id="i_m"></span></div>
<div id="phases"></div>
<div class="kv"><span>Temperatură internă</span><b id="i_t">—</b></div>
<div class="kv"><span>Autoconsum producție azi</span><b id="i_sr">—</b></div>
<div class="kv"><span>Autonomie azi</span><b id="i_au">—</b></div>
<div class="eco"><span><ha-icon icon="mdi:molecule-co2"></ha-icon> <b id="e_co2">—</b> evitat</span><span><ha-icon icon="mdi:pine-tree"></ha-icon> <b id="e_tr">—</b> copaci</span></div>
</div>
</div>
<div class="pn"><div class="pt"><ha-icon icon="mdi:calendar-month-outline"></ha-icon>Lună și an</div>
<table class="my"><tr><th></th><th>Luna aceasta</th><th>Anul acesta</th></tr><tbody id="my"></tbody></table></div>
</div>
</div></ha-card>`;
this._fk = {};
}
_onStart() {
this._loadChart();
this._every(600e3, () => this._loadChart());
}
_flow(id, active, rev, kw, color) {
const dur = tbFlowDur(Math.abs(kw || 0));
const key = active ? `${rev ? 1 : 0}|${dur}|${color}` : "off";
if (this._fk[id] === key) return;
this._fk[id] = key;
const p = this._e("p_" + id);
p.classList.toggle("on", !!active);
p.classList.toggle("rev", !!rev);
if (color) p.style.setProperty("--fc", color);
const g = this._e("f_" + id);
if (!active) {
g.innerHTML = "";
return;
}
const n = 3;
let s = "";
for (let i = 0; i < n; i++) {
s += `<circle r="5" fill="${color}" filter="url(#glow)"><animateMotion dur="${dur}s" begin="${(-(dur * i) / n).toFixed(2)}s" repeatCount="indefinite" ${rev ? 'keyPoints="1;0" keyTimes="0;1" calcMode="linear"' : ""}><mpath href="#p_${id}"/></animateMotion></circle>`;
}
g.innerHTML = s;
}
_update() {
const h = this._hass, c = this._config;
const n = (k) => {
const v = tbNum(h, c[k]);
if (v === null) return null;
const u = tbAt(h, c[k], "unit_of_measurement");
return u === "W" || u === "Wh" ? v / 1000 : v;
};
const str = (i) => {
const v = tbNum(h, c[`pv${i}_v`]), a = tbNum(h, c[`pv${i}_a`]);
return v !== null && a !== null ? (v * a) / 1000 : n(`pv${i}`);
};
const pv = Math.max(n("pv") || 0, 0), pv1 = Math.max(str(1) || 0, 0), pv2 = Math.max(str(2) || 0, 0);
const gp = c.grid ? n("grid") : null; /* meter: + export, - import */
const load = n("load");
const imp = gp !== null ? Math.max(-gp, 0) : Math.max(n("imp") || 0, 0);
const exp = gp !== null ? Math.max(gp, 0) : Math.max(n("exp") || 0, 0);
const bat = n("bat") || 0, soc = n("soc"), cap = n("cap");
const night = tbSt(h, "sun.sun") === "below_horizon";
// sun
const sun = this._e("sun");
sun.style.opacity = pv > 0.02 ? 1 : night ? 0.25 : 0.55;
sun.style.setProperty("--rs", `${tbClamp(32 - pv * 4.5, 5, 32).toFixed(1)}s`);
this._sv("dia", "--sunmix", `${Math.round(tbClamp(pv / c.peak_kw, 0, 1) * 32)}%`);
this._c("panels", "prod", pv > 0.02);
this._c("inv", "prod", pv > 0.02);
this._t("t_pv", tbP(pv));
this._t("t_pv1", tbP(pv1));
this._t("t_pv2", tbP(pv2));
this._t("t_invp", pv > 0.02 ? `${Math.round((pv / c.peak_kw) * 100)}%` : night ? "noapte" : "standby");
const it = n("inv_temp");
this._t("t_invt", it !== null ? `${tbF(it, 1)} °C` : "");
// flows
this._flow("pv1", pv1 > 0.01, false, pv1, "#ffb300");
this._flow("pv2", pv2 > 0.01, false, pv2, "#ffb300");
const charge = bat > 0.02 ? bat : 0, dis = bat < -0.02 ? -bat : 0;
const acOut = load !== null ? Math.max(load - imp + exp, 0) : Math.max(pv - charge + dis, 0);
this._flow("house", acOut > 0.02, false, acOut, "#26c6da");
this._t("t_house", acOut > 0.02 ? tbP(acOut) : "");
this._flow("bat", charge > 0 || dis > 0, dis > 0, charge || dis, dis > 0 ? "#ab47bc" : "#66bb6a");
this._t("t_batv", charge || dis ? tbP(charge || dis) : "");
const gImp = imp > 0.02, gExp = exp > 0.02;
this._flow("grid", gImp || gExp, gExp, gImp ? imp : exp, gImp ? "#ef5350" : "#7e57c2");
this._c("grid", "imp", gImp);
this._t("t_grid", gImp ? tbP(imp) : gExp ? tbP(exp) : "0 W");
this._t("t_gridd", gImp ? "IMPORT" : gExp ? "EXPORT" : "ECHILIBRU");
this._e("t_grid").style.fill = gImp ? "#ef5350" : gExp ? "#7e57c2" : "";
// house
this._t("t_load", tbP(load));
this._c("house", "lit", (load || 0) > 0.05);
// battery
const socV = soc !== null ? tbClamp(soc, 0, 100) : 0;
const col = socV < 20 ? "#ef5350" : socV < 50 ? "#ffa726" : "#66bb6a";
this._a("bfill", "width", ((124 * socV) / 100).toFixed(1));
this._a("bfill", "fill", col);
this._t("t_soc", soc !== null ? `${Math.round(soc)}%` : "—");
this._c("bat", "chg", charge > 0);
this._c("bat", "dis", dis > 0);
const bTxt = charge > 0 ? `Se încarcă · ${tbP(charge)}` : dis > 0 ? `Se descarcă · ${tbP(dis)}` : socV >= 99 ? "Plină · în așteptare" : "În așteptare";
this._t("t_bat", bTxt);
// Today panel
const pt = n("prod_today"), fc = n("fc_today"), fr = fc !== null && pt !== null ? Math.max(fc - pt, 0) : n("fc_rem");
this._t("d_prod", pt !== null ? `${tbF(pt, 1)} kWh` : "—");
this._t("d_prod2", fc ? `din ${tbF(fc, 1)} kWh estimat` : "");
this._e("d_bar").style.width = `${fc ? tbClamp((pt / fc) * 100, 0, 100) : 0}%`;
this._t("fcn", fr !== null ? `mai sunt ~${tbF(fr, 1)} kWh azi` : "");
const lt = n("load_today"), it2 = n("imp_today");
const tile = (l, ic, v, u, col2) => `<div class="tile" style="--tc:${col2}"><div class="l"><ha-icon icon="${ic}"></ha-icon>${l}</div><div class="v">${v}<small> ${u}</small></div></div>`;
const tiles =
tile("Consum casă", "mdi:home-lightning-bolt-outline", tbF(lt, 1), "kWh", "#26c6da") +
tile("Din panouri", "mdi:solar-power", tbF(n("self_today"), 1), "kWh", "#ffb300") +
tile("Import rețea", "mdi:transmission-tower-import", tbF(it2, 1), "kWh", "#ef5350") +
tile("Export rețea", "mdi:transmission-tower-export", tbF(n("exp_today"), 1), "kWh", "#7e57c2") +
tile("Acum consum", "mdi:flash", load !== null ? tbP(load).split(" ")[0] : "—", load !== null ? tbP(load).split(" ")[1] : "", "#26c6da") +
tile("Acum rețea", gExp ? "mdi:arrow-up-bold" : "mdi:arrow-down-bold", tbP(gImp ? imp : exp).split(" ")[0], `${tbP(gImp ? imp : exp).split(" ")[1] || ""} ${gImp ? "import" : gExp ? "export" : ""}`, gImp ? "#ef5350" : "#7e57c2");
this._h("tiles", tiles);
// battery panel
const fg = this._e("r_fg");
fg.style.strokeDashoffset = (251.3 * (1 - socV / 100)).toFixed(1);
fg.style.stroke = col;
this._t("r_t", soc !== null ? `${Math.round(soc)}%` : "—");
this._t("b_e", soc !== null && cap ? `${tbF((soc / 100) * cap, 1)} / ${tbF(cap, 1)} kWh` : "—");
this._t("b_s", charge > 0 ? "Încărcare" : dis > 0 ? "Descărcare" : tbOk(tbSt(h, c.bat_status)) ? ({ Operating: "Activă", Running: "Activă", Standby: "În așteptare", Offline: "Offline", Fault: "Defect", "Sleep mode": "Repaus" }[tbSt(h, c.bat_status)] || tbSt(h, c.bat_status)) : "—");
this._t("b_p", tbP(Math.abs(bat)));
this._t("b_in", `${tbF(n("bat_in"), 2)} kWh`);
this._t("b_out", `${tbF(n("bat_out"), 2)} kWh`);
this._t("b_t", `${tbF(n("bat_temp"), 1)} °C`);
const sohS = tbSt(h, c.bat_soh);
this._t("b_soh", tbOk(sohS) ? ({ Idle: "Inactivă", Calibrating: "În curs", "In progress": "În curs", Failed: "Eșuată", Done: "Terminată", Completed: "Terminată" }[sohS] || sohS) : "—");
const mode = tbSt(h, c.bat_mode);
this._t("b_m", mode === "Maximum self-consumption" || mode === "Maximise self consumption" ? "Autoconsum maxim" : mode === "Time of use" ? "Program orar" : mode === "Fully fed to grid" ? "Totul în rețea" : tbOk(mode) ? mode : "—");
// inverter
this._t("i_m", c.inv_model && tbOk(tbSt(h, c.inv_model)) ? tbSt(h, c.inv_model) : "");
this._h(
"phases",
c.phases
.map(([lb, v, a]) => {
const vv = tbNum(h, v), aa = tbNum(h, a);
const pct = vv ? tbClamp(((vv - 200) / 50) * 100, 4, 100) : 0;
return `<div class="ph"><b>${lb}</b><div class="bar"><i style="width:${pct.toFixed(0)}%"></i></div><span>${tbF(vv, 1)} V${aa !== null ? ` · ${tbF(aa, 2)} A` : ""}</span></div>`;
})
.join("")
);
this._t("i_t", `${tbF(it, 1)} °C`);
this._t("i_sr", n("self_ratio") !== null ? `${tbF(n("self_ratio"), 0)}%` : "—");
this._t("i_au", lt ? `${tbF(tbClamp((1 - (it2 || 0) / lt) * 100, 0, 100), 0)}%` : "—");
const co2 = n("co2");
this._t("e_co2", co2 !== null ? (co2 >= 1000 ? `${tbF(co2 / 1000, 1)} t` : `${tbF(co2, 0)} kg`) : "—");
this._t("e_tr", tbF(n("trees"), 0));
const r = (lb, ic, col2, a, b) => `<tr><td><ha-icon icon="${ic}" style="color:${col2}"></ha-icon>${lb}</td><td>${tbF(n(a), 1)} kWh</td><td>${tbF(n(b), 0)} kWh</td></tr>`;
this._h(
"my",
r("Producție", "mdi:solar-power", "#ffb300", "prod_month", "prod_year") +
r("Consum casă", "mdi:home-lightning-bolt-outline", "#26c6da", "load_month", "load_year") +
r("Import rețea", "mdi:transmission-tower-import", "#ef5350", "imp_month", "imp_year") +
r("Export rețea", "mdi:transmission-tower-export", "#7e57c2", "exp_month", "exp_year")
);
}
async _loadChart() {
if (!this._hass) return;
const c = this._config;
let hs = {};
try {
hs = await tbHistory(this._hass, [c.pv, c.load, c.soc], 24);
} catch (e) {
return;
}
const t1 = Date.now(), t0 = t1 - 24 * 3600e3, step = 5 * 60e3;
const kw = (id) => {
const u = tbAt(this._hass, id, "unit_of_measurement");
const f = u === "W" ? 1000 : 1;
return (hs[id] || []).map((p) => ({ t: p.t, v: p.v / f }));
};
const pv = tbResample(kw(c.pv), t0, t1, step), ld = tbResample(kw(c.load), t0, t1, step), sc = tbResample(hs[c.soc], t0, t1, step);
const W = 640, H = 170, L = 34, R = 34, T = 8, B = 20;
const max = Math.max(1, ...pv.map((p) => p.v || 0), ...ld.map((p) => p.v || 0));
const top = Math.ceil(max);
const X = (t) => L + ((t - t0) / (t1 - t0)) * (W - L - R);
const Y = (v) => T + (1 - v / top) * (H - T - B);
const Ys = (v) => T + (1 - v / 100) * (H - T - B);
const line = (arr, fy) => tbPath(arr.filter((p) => p.v !== null).map((p) => [X(p.t), fy(p.v)]));
const pvp = pv.filter((p) => p.v !== null);
const area = pvp.length ? `${line(pvp, Y)} L${X(pvp[pvp.length - 1].t).toFixed(1)},${H - B} L${X(pvp[0].t).toFixed(1)},${H - B} Z` : "";
let grid = "";
for (let k = 0; k <= 4; k++) {
const v = (top * k) / 4, y = Y(v);
grid += `<line class="gl" x1="${L}" x2="${W - R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/><text class="ax" x="${L - 5}" y="${(y + 4).toFixed(1)}" text-anchor="end">${tbF(v, v < 10 && top < 5 ? 1 : 0)}</text><text class="ax" x="${W - R + 5}" y="${(y + 4).toFixed(1)}">${25 * k}%</text>`;
}
for (let hh = 0; hh <= 24; hh += 4) {
const t = t0 + hh * 3600e3;
grid += `<text class="ax" x="${X(t).toFixed(1)}" y="${H - 4}" text-anchor="middle">${tbHHMM(new Date(t))}</text>`;
}
this._h(
"chart",
`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:100%"><defs><linearGradient id="pvA" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffb300" stop-opacity=".55"/><stop offset="1" stop-color="#ffb300" stop-opacity=".03"/></linearGradient></defs>
${grid}<path d="${area}" fill="url(#pvA)"/><path class="draw" style="--len:2400" d="${line(pv, Y)}" fill="none" stroke="#ffb300" stroke-width="2"/>
<path class="draw" style="--len:2400;animation-delay:.3s" d="${line(ld, Y)}" fill="none" stroke="#26c6da" stroke-width="2"/>
<path d="${line(sc, Ys)}" fill="none" stroke="#66bb6a" stroke-width="2" stroke-dasharray="5 4"/></svg>`
);
}
}
customElements.get("tb-pv-card") || customElements.define("tb-pv-card", TbPvCard);
