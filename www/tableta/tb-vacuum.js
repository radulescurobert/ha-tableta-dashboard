/* ================================================================
*  ROBOT VACUUMS (Roborock) — custom:tb-vacuum-card
*  >>> Configure the robots in defaults() below (or pass `robots:` from the dashboard YAML).
*  The helper mk(id, name, floor, color, extra) builds all entity ids from the vacuum's base id:
*    vacuum.<id>, sensor.<id>_stare, sensor.<id>_baterie, select.<id>_intensitate_mop ... (Roborock integration names in Romanian UI;
*    if your HA language differs, the entity ids differ — adjust the patterns in mk()).
*  extra: mode (cleaning mode select), water_shortage (binary_sensor), child_lock (switch, optional),
*         maps: [[<value of select.<id>_selected_map>, <tab label>, <image entity of the map>], ...]
* ================================================================ */
const TB_VAC_CSS = `
.g { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; height: 100%; }
.rb { display: flex; flex-direction: column; gap: 9px; min-height: 0; padding: 11px 13px; animation: tbFade .5s both; }
.rb.err { border-color: #ef5350; box-shadow: 0 0 0 1px #ef535088, 0 6px 18px rgba(0,0,0,.14); }
.hd { display: flex; align-items: center; gap: 10px; }
.scene { flex: 0 0 132px; height: 58px; border-radius: 12px; background: color-mix(in srgb, var(--rc) 10%, transparent); overflow: hidden; position: relative; }
.scene svg { width: 100%; height: 100%; display: block; }
.scene .g-dock, .scene .g-clean, .scene .g-ret, .scene .g-idle { display: none; }
.st-dock .g-dock, .st-clean .g-clean, .st-ret .g-ret, .st-idle .g-idle, .st-err .g-idle { display: inline; }
.st-err .g-idle .idleb { animation: vShake .4s infinite; }
@keyframes vShake { 25% { transform: translateX(-2px) rotate(-4deg); } 75% { transform: translateX(2px) rotate(4deg); } }
.brush { animation: tbSpin .5s linear infinite; transform-box: fill-box; transform-origin: center; }
.lidar { animation: tbPulse 1.2s infinite; }
.bolt { animation: tbPulse 1.4s infinite; }
.idleb { animation: vBreath 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes vBreath { 50% { transform: scale(1.06); } }
.trail { fill: none; stroke: var(--rc); stroke-width: 2; stroke-dasharray: 3 4; opacity: .5; animation: tbDash 1.2s linear infinite; }
.nm { flex: 1; min-width: 0; }
.nm b { font-size: 1.25rem; display: block; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nm b small { font-size: .72rem; font-weight: 600; color: var(--secondary-text-color); margin-left: 6px; letter-spacing: .04em; text-transform: uppercase; }
.chip { display: inline-flex; align-items: center; gap: 5px; margin-top: 3px; padding: 2px 9px; border-radius: 99px; font-size: .74rem; font-weight: 700;
background: color-mix(in srgb, var(--rc) 22%, transparent); color: var(--rc); white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.chip i { width: 7px; height: 7px; border-radius: 50%; background: var(--rc); flex: 0 0 7px; }
.live .chip i { animation: tbPulse .9s infinite; }
.rb.err .chip { color: #ef5350; background: #ef535026; } .rb.err .chip i { background: #ef5350; animation: tbPulse .6s infinite; }
.bat { flex: 0 0 64px; text-align: center; }
.bat svg { width: 28px; height: 46px; display: block; margin: 0 auto; }
.bat b { font-size: .86rem; font-variant-numeric: tabular-nums; }
.bfill { transition: height 1s, y 1s; }
.chg .bfill { animation: vChg 2s ease-in-out infinite; }
@keyframes vChg { 50% { opacity: .55; } }
.errb { display: none; align-items: center; gap: 7px; padding: 5px 10px; border-radius: 10px; background: #ef535026; color: #ef5350; font-size: .78rem; font-weight: 700; }
.rb.err .errb { display: flex; animation: tbPulse 1.6s infinite; }
.errb ha-icon { --mdc-icon-size: 18px; }
.ctl { display: grid; grid-template-columns: 1.4fr repeat(4, 1fr); gap: 6px; }
.ctl button { border: none; border-radius: 11px; height: 36px; display: flex; align-items: center; justify-content: center; gap: 5px; font-size: .76rem; font-weight: 700;
background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); white-space: nowrap; transition: background .3s, transform .1s; }
.ctl button ha-icon { --mdc-icon-size: 18px; }
.ctl button:active { transform: scale(.95); }
.ctl .go { background: var(--rc); color: #fff; }
.ctl .ask { background: #ef5350 !important; color: #fff; animation: tbPulse .7s infinite; }
.ctl button[disabled] { opacity: .35; }
.mid { flex: 1; display: grid; grid-template-columns: 1.25fr 1fr; gap: 9px; min-height: 0; }
.map { position: relative; border-radius: 13px; overflow: hidden; min-height: 0; background: radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--rc) 12%, #0d1117), #0b0e13); }
.map canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; animation: tbFade .6s both; }
.map .sweep { position: absolute; left: 50%; top: 50%; width: 160%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; pointer-events: none; opacity: 0;
background: conic-gradient(from 0deg, transparent 0 300deg, color-mix(in srgb, var(--rc) 45%, transparent) 360deg); transition: opacity .6s; }
.live .map .sweep { opacity: .55; animation: vSweep 3.2s linear infinite; }
@keyframes vSweep { to { transform: translate(-50%, -50%) rotate(360deg); } }
.map .grid { position: absolute; inset: 0; pointer-events: none; opacity: .18;
background-image: linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px); background-size: 22px 22px; }
.mtabs { position: absolute; left: 6px; top: 6px; display: flex; gap: 4px; z-index: 2; }
.mtabs button { border: none; border-radius: 8px; padding: 2px 8px; font-size: .66rem; font-weight: 700; background: rgba(0,0,0,.55); color: #fff; }
.mtabs button.on { background: var(--rc); }
.mtabs button .act { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #66bb6a; margin-left: 4px; vertical-align: middle; }
.mnote { position: absolute; right: 6px; bottom: 5px; font-size: .62rem; color: rgba(255,255,255,.75); background: rgba(0,0,0,.45); padding: 1px 6px; border-radius: 6px; z-index: 2; }
.mlive { position: absolute; right: 6px; top: 6px; font-size: .62rem; font-weight: 800; color: #fff; background: #ef5350; padding: 1px 7px; border-radius: 6px; display: none; z-index: 2; letter-spacing: .06em; }
.live .mlive { display: block; animation: tbPulse 1.2s infinite; }
.nomap { position: absolute; inset: 0; display: grid; place-items: center; color: rgba(255,255,255,.5); font-size: .8rem; }
.info { display: flex; flex-direction: column; gap: 6px; min-height: 0; min-width: 0; }
.kv { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
.kv .w2 { grid-column: span 2; }
.kv div { border-radius: 10px; padding: 4px 8px; background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); min-width: 0; }
.kv span { display: block; font-size: .62rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kv b { font-size: .9rem; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.prog { height: 5px; border-radius: 3px; background: color-mix(in srgb, var(--primary-text-color) 10%, transparent); overflow: hidden; margin-top: 3px; display: none; }
.live .prog { display: block; }
.prog i { display: block; height: 100%; width: 40%; background: var(--rc); border-radius: 3px; animation: vInd 1.6s ease-in-out infinite; }
@keyframes vInd { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
.wk { flex: 1; min-height: 52px; display: flex; flex-direction: column; border-radius: 10px; padding: 4px 8px; background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); }
.wk span.l { font-size: .62rem; color: var(--secondary-text-color); display: flex; justify-content: space-between; }
.bars { flex: 1; display: flex; align-items: flex-end; gap: 4px; min-height: 0; padding-top: 3px; }
.bars div { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; min-width: 0; }
.bars i { width: 100%; border-radius: 4px 4px 1px 1px; background: linear-gradient(var(--rc), color-mix(in srgb, var(--rc) 40%, transparent)); transform-origin: bottom; animation: tbGrowY .9s both; min-height: 2px; }
.bars em { font-size: .56rem; font-style: normal; color: var(--secondary-text-color); line-height: 1.2; }
.bars i.z { background: color-mix(in srgb, var(--primary-text-color) 12%, transparent); }
.acc { display: flex; gap: 5px; flex-wrap: wrap; }
.acc span { display: inline-flex; align-items: center; gap: 4px; font-size: .66rem; font-weight: 600; padding: 2px 7px; border-radius: 99px; background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); color: var(--secondary-text-color); }
.acc span.on { background: color-mix(in srgb, #4fc3f7 22%, transparent); color: #4fc3f7; }
.acc span.bad { background: #ef535026; color: #ef5350; }
.acc ha-icon { --mdc-icon-size: 13px; }
.set { display: grid; grid-template-columns: auto 1fr; gap: 5px 8px; align-items: center; }
.set > span { font-size: .64rem; font-weight: 700; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
.chs { display: flex; gap: 4px; min-width: 0; }
.chs button { flex: 1; border: none; border-radius: 8px; padding: 4px 2px; font-size: .68rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); transition: background .3s, color .3s; min-width: 0; }
.chs button.on { background: var(--rc); color: #fff; box-shadow: 0 0 10px color-mix(in srgb, var(--rc) 50%, transparent); }
.chs button.dnd.on { background: #7e57c2; }
.cons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.cs { display: flex; align-items: center; gap: 6px; min-width: 0; }
.cs svg { flex: 0 0 40px; width: 40px; height: 40px; transform: rotate(-90deg); }
.cs .rg { fill: none; stroke-width: 5; stroke-linecap: round; transition: stroke-dasharray 1.2s; }
.cs.low .rg { animation: tbPulse 1.4s infinite; }
.cs div { min-width: 0; }
.cs b { font-size: .8rem; display: block; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cs span { font-size: .62rem; color: var(--secondary-text-color); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@media (max-height: 760px) {
.g { gap: 9px; } .rb { gap: 7px; padding: 9px 11px; } .scene { height: 50px; flex-basis: 118px; } .ctl button { height: 32px; }
.bat svg { height: 40px; } .nm b { font-size: 1.12rem; } .cs svg { width: 34px; height: 34px; flex-basis: 34px; } .kv b { font-size: .84rem; }
.set { gap: 4px 7px; } .chs button { padding: 3px 2px; }
}
@media (max-width: 899px), (orientation: portrait) { .g { grid-template-columns: 1fr; } .mid { grid-auto-rows: 260px; } }
`;
const TB_VAC_ST = {
charging: "Se încarcă", charging_complete: "Încărcat", idle: "În așteptare", cleaning: "Curăță", returning_home: "Se întoarce la bază",
docking: "Se andochează", paused: "Pauză", error: "Eroare", spot_cleaning: "Curățare punctuală", segment_cleaning: "Curăță camere",
zoned_cleaning: "Curăță zonă", going_to_target: "Merge la țintă", emptying_the_bin: "Golește coșul", washing_the_mop: "Spală mopul",
going_to_wash_the_mop: "Merge să spele mopul", mapping: "Cartografiază", updating: "Se actualizează", device_offline: "Offline",
manual_mode: "Manual", remote_control_active: "Telecomandă", starting: "Pornește", shutting_down: "Se oprește", locked: "Blocat",
charging_problem: "Problemă la încărcare", charger_disconnected: "Bază deconectată", docked: "La bază", returning: "Se întoarce",
robot_status_mopping: "Spală cu mopul", segment_mopping: "Mop pe camere", zoned_mopping: "Mop pe zonă", air_drying_stopping: "Uscare oprită",
};
const TB_VAC_ERR = {
lidar_blocked: "Lidar blocat", bumper_stuck: "Bara de protecție blocată", wheels_suspended: "Roți ridicate", cliff_sensor_error: "Senzor de treaptă",
main_brush_jammed: "Peria principală blocată", side_brush_jammed: "Peria laterală blocată", wheels_jammed: "Roți blocate", robot_trapped: "Robot blocat",
no_dustbin: "Lipsește coșul", filter_blocked: "Filtru înfundat", low_battery: "Baterie descărcată", charging_error: "Eroare încărcare",
robot_tilted: "Robot înclinat", return_to_dock_fail: "Nu găsește baza", cannot_cross_carpet: "Nu poate trece covorul", internal_error: "Eroare internă",
wall_sensor_dirty: "Senzor de perete murdar", optical_flow_sensor_dirt: "Senzor optic murdar", dock: "Problemă la bază", nogo_zone_detected: "Zonă interzisă",
};
const TB_VAC_FAN = { quiet: "Silențios", balanced: "Echilibrat", turbo: "Turbo", max: "Max", gentle: "Delicat", off: "Oprit", custom: "Custom", max_plus: "Max+" };
const TB_VAC_MOP = { off: "Oprit", low: "Slab", medium: "Mediu", high: "Puternic", custom_water_flow: "Custom", mild: "Slab", moderate: "Mediu", intense: "Puternic" };
const TB_VAC_MODE = { vacuum: "Aspirare", vac_and_mop: "Aspirare + mop", mop: "Doar mop" };
const vacRobot = (x, y, s, cls = "") => `<g transform="translate(${x} ${y}) scale(${s})"><g class="${cls}">
<circle r="15" fill="#eceff1" stroke="#90a4ae" stroke-width="1.5"/><circle r="10.5" fill="none" stroke="#cfd8dc" stroke-width="1"/>
<circle cy="-6" r="4.5" fill="#37474f"/><circle cy="-6" r="2" fill="var(--rc)" class="lidar"/>
<g transform="translate(-11 -11)"><g class="brush"><path d="M0-5V5M-5 0H5M-3.5-3.5 3.5 3.5M-3.5 3.5 3.5-3.5" stroke="#78909c" stroke-width="1.2"/></g></g></g></g>`;
class TbVacuumCard extends TbBase {
static defaults() {
const mk = (id, name, floor, color, extra) =>
Object.assign(
{
name, floor, color, vacuum: `vacuum.${id}`, status: `sensor.${id}_stare`, error: `sensor.${id}_eroare_aspirator`, battery: `sensor.${id}_baterie`,
mop_intensity: `select.${id}_intensitate_mop`, selected_map: `select.${id}_selected_map`, dnd: `switch.${id}_nu_deranja`,
dnd_begin: `time.${id}_do_not_disturb_begin`, dnd_end: `time.${id}_do_not_disturb_end`, volume: `number.${id}_volume`,
clean_time: `sensor.${id}_timp_de_curatare`, clean_area: `sensor.${id}_zona_de_curatare`, total_time: `sensor.${id}_timpul_total_de_curatare`,
total_count: `sensor.${id}_total_cleaning_count`, total_area: `sensor.${id}_suprafata_totala_de_curatare`, last_begin: `sensor.${id}_last_clean_begin`,
last_end: `sensor.${id}_last_clean_end`, current_room: `sensor.${id}_current_room`, cleaning: `binary_sensor.${id}_cleaning`, charging: `binary_sensor.${id}_incarcare`,
mop_attached: `binary_sensor.${id}_mop_attached`, water_box: `binary_sensor.${id}_water_box_attached`,
consumables: [
["Perie principală", `sensor.${id}_timp_ramas_pentru_peria_principala`, 300],
["Perie laterală", `sensor.${id}_timp_ramas_pentru_peria_laterala`, 200],
["Filtru", `sensor.${id}_timp_ramas_pentru_filtru`, 150],
["Senzori", `sensor.${id}_timp_ramas_pentru_senzori`, 30],
],
},
extra
);
return {
robots: [
mk("YOUR_ROBOT_1", "Robot 1", "Floor 1", "#26c6da", {
mode: "select.YOUR_ROBOT_1_cleaning_mode", water_shortage: "binary_sensor.YOUR_ROBOT_1_water_shortage",
maps: [["Map 0", "Floor 1", "image.YOUR_ROBOT_1_map_0"], ["Map 1", "Floor 2", "image.YOUR_ROBOT_1_map_1"]],
}),
mk("YOUR_ROBOT_2", "Robot 2", "Floor 2", "#ab47bc", {
mode: "select.YOUR_ROBOT_2_cleaning_mode", water_shortage: "binary_sensor.YOUR_ROBOT_2_water_shortage",
child_lock: "switch.YOUR_ROBOT_2_dock_child_lock", maps: [["Map 0", "Floor 2", "image.YOUR_ROBOT_2_map_0"]],
}),
],
};
}
_robotHtml(r, i) {
const p = `r${i}_`;
const dockG = `<g class="g-dock"><rect x="8" y="12" width="22" height="36" rx="5" fill="#455a64"/><rect x="12" y="17" width="14" height="5" rx="2" fill="var(--rc)" class="bolt"/>
${vacRobot(48, 32, 1)}<path d="M74 22l-6 10h5l-3 9 8-12h-5l3-7z" fill="#ffca28" class="bolt"/></g>`;
const zig = "M30 14 H120 V24 H30 V34 H120 V44 H30 Z";
const cleanG = `<g class="g-clean"><rect x="8" y="12" width="14" height="36" rx="4" fill="#455a64" opacity=".6"/><path d="${zig}" class="trail"/>
<g>${vacRobot(0, 0, 0.62)}<animateMotion dur="9s" repeatCount="indefinite" path="${zig}"/></g></g>`;
const retG = `<g class="g-ret"><rect x="8" y="12" width="22" height="36" rx="5" fill="#455a64"/><rect x="12" y="17" width="14" height="5" rx="2" fill="#66bb6a" class="bolt"/>
<path d="M118 32 H40" class="trail"/><g>${vacRobot(0, 0, 0.8)}<animateMotion dur="3.5s" repeatCount="indefinite" path="M118 32 H48"/></g></g>`;
const idleG = `<g class="g-idle"><rect x="8" y="12" width="22" height="36" rx="5" fill="#455a64" opacity=".7"/>${vacRobot(80, 32, 1, "idleb")}</g>`;
const maps = r.maps.map((m, k) => `<button data-r="${i}" data-m="${k}" id="${p}mt${k}">${tbEsc(m[1])}<span class="act" id="${p}ma${k}" style="display:none"></span></button>`).join("");
const chips = (key, list) => `<div class="chs" id="${p}${key}">${list}</div>`;
const cons = r.consumables
.map((c, k) => `<div class="cs" id="${p}c${k}"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="color-mix(in srgb, var(--primary-text-color) 10%, transparent)" stroke-width="5"/>
<circle class="rg" id="${p}cr${k}" cx="20" cy="20" r="16" stroke-dasharray="0 101"/></svg><div><b id="${p}cv${k}">—</b><span>${tbEsc(c[0])}</span></div></div>`)
.join("");
return `<div class="pn rb" id="${p}box" style="--rc:${r.color};animation-delay:${i * 0.1}s">
<div class="hd"><div class="scene" id="${p}sc"><svg viewBox="0 0 132 64" preserveAspectRatio="xMidYMid meet">${dockG}${cleanG}${retG}${idleG}</svg></div>
<div class="nm"><b>${tbEsc(r.name)}<small>${tbEsc(r.floor)}</small></b><div class="chip"><i></i><span id="${p}st">—</span></div></div>
<div class="bat" id="${p}bat"><svg viewBox="0 0 28 46"><rect x="9" y="1" width="10" height="4" rx="1.5" fill="color-mix(in srgb, var(--primary-text-color) 35%, transparent)"/>
<rect x="2" y="5" width="24" height="40" rx="5" fill="none" stroke="color-mix(in srgb, var(--primary-text-color) 35%, transparent)" stroke-width="2"/>
<rect class="bfill" id="${p}bf" x="5" y="42" width="18" height="0" rx="3" fill="#66bb6a"/></svg><b id="${p}bv">—</b></div></div>
<div class="errb"><ha-icon icon="mdi:alert-circle"></ha-icon><span id="${p}er"></span></div>
<div class="ctl">
<button class="go" data-a="start" data-r="${i}" id="${p}bs"><ha-icon icon="mdi:play"></ha-icon><span>Pornește</span></button>
<button data-a="pause" data-r="${i}" id="${p}bp"><ha-icon icon="mdi:pause"></ha-icon>Pauză</button>
<button data-a="stop" data-r="${i}" id="${p}bx"><ha-icon icon="mdi:stop"></ha-icon>Stop</button>
<button data-a="return_to_base" data-r="${i}" id="${p}bh"><ha-icon icon="mdi:home-import-outline"></ha-icon>Bază</button>
<button data-a="locate" data-r="${i}"><ha-icon icon="mdi:map-marker-radius"></ha-icon>Găsește</button></div>
<div class="mid"><div class="map"><div class="grid"></div><canvas id="${p}img"></canvas><div class="nomap" id="${p}nm">Se încarcă harta…</div><div class="sweep"></div>
<div class="mtabs">${maps}</div><div class="mlive">LIVE</div><div class="mnote" id="${p}mn"></div></div>
<div class="info"><div class="kv">
<div class="w2"><span id="${p}l1">Ultima curățare</span><b id="${p}k1">—</b></div>
<div><span>Durată</span><b id="${p}k2">—</b></div><div><span>Suprafață</span><b id="${p}k5">—</b></div>
<div class="w2"><span>Total: curățări · ore · suprafață</span><b id="${p}k4">—</b></div></div>
<div class="prog"><i></i></div>
<div class="wk"><span class="l"><span>Ultimele 7 zile (m²)</span><span id="${p}ws"></span></span><div class="bars" id="${p}wb"></div></div>
<div class="acc" id="${p}acc"></div></div></div>
<div class="set">
<span>Aspirare</span>${chips("fan", "")}
<span>Mop</span>${chips("mop", "")}
<span>Mod</span><div class="chs"><span class="chs" id="${p}mode" style="flex:2;display:flex;gap:4px"></span><button class="dnd" data-r="${i}" id="${p}dnd" style="flex:1.2">🌙 Nu deranja</button></div>
</div>
<div class="cons">${cons}</div></div>`;
}
_build() {
const c = this._config;
this.shadowRoot.innerHTML = `<style>${TB_BASE_CSS}${TB_VAC_CSS}</style><ha-card><div class="g">${c.robots.map((r, i) => this._robotHtml(r, i)).join("")}</div></ha-card>`;
this._view = c.robots.map(() => null);
this._ask = {};
this.shadowRoot.querySelector(".g").addEventListener("click", (ev) => this._click(ev));
}
_click(ev) {
const b = ev.target.closest("button");
if (!b || b.disabled) return;
const r = this._config.robots[+b.dataset.r];
if (!r) return;
if (b.dataset.a) {
const a = b.dataset.a;
if (a === "start") {
const key = `s${b.dataset.r}`;
if (!this._ask[key]) {
b.classList.add("ask");
b.querySelector("span").textContent = "Sigur?";
this._ask[key] = setTimeout(() => this._unask(key, b), 3500);
return;
}
this._unask(key, b);
}
this._svc("vacuum", a, { entity_id: r.vacuum });
return;
}
if (b.dataset.m !== undefined) {
this._view[+b.dataset.r] = +b.dataset.m;
this._update();
return;
}
if (b.dataset.fan) return this._svc("vacuum", "set_fan_speed", { entity_id: r.vacuum, fan_speed: b.dataset.fan });
if (b.dataset.mop) return this._svc("select", "select_option", { entity_id: r.mop_intensity, option: b.dataset.mop });
if (b.dataset.mode) return this._svc("select", "select_option", { entity_id: r.mode, option: b.dataset.mode });
if (b.classList.contains("dnd")) return this._svc("switch", "toggle", { entity_id: r.dnd });
}
_onStop() {
if (this._mro) {
this._mro.disconnect();
this._mro = null;
}
}
_unask(key, b) {
clearTimeout(this._ask[key]);
delete this._ask[key];
b.classList.remove("ask");
b.querySelector("span").textContent = "Pornește";
this._update();
}
/* Loads the Roborock map image, crops margins and the blue background, then draws it to fill the frame. */
_loadMap(i, src) {
const im = new Image();
im.onload = () => {
if (this._e(`r${i}_img`)._src !== src) return;
const w = im.naturalWidth, h = im.naturalHeight;
const cv = document.createElement("canvas");
cv.width = w;
cv.height = h;
const cx = cv.getContext("2d", { willReadFrequently: true });
cx.drawImage(im, 0, 0);
let d;
try {
d = cx.getImageData(0, 0, w, h);
} catch (e) {
return;
}
const px = d.data;
const bg = [px[0], px[1], px[2], px[3]];
const isBg = (k) => px[k + 3] < 20 || (bg[3] > 20 && Math.abs(px[k] - bg[0]) + Math.abs(px[k + 1] - bg[1]) + Math.abs(px[k + 2] - bg[2]) < 36);
let x0 = w, y0 = h, x1 = -1, y1 = -1;
for (let y = 0; y < h; y++)
for (let x = 0; x < w; x++) {
const k = (y * w + x) * 4;
if (isBg(k)) {
px[k + 3] = 0;
continue;
}
if (x < x0) x0 = x;
if (x > x1) x1 = x;
if (y < y0) y0 = y;
if (y > y1) y1 = y;
}
if (x1 < 0) return;
cx.putImageData(d, 0, 0);
const pad = 2;
x0 = Math.max(0, x0 - pad);
y0 = Math.max(0, y0 - pad);
x1 = Math.min(w - 1, x1 + pad);
y1 = Math.min(h - 1, y1 + pad);
const out = document.createElement("canvas");
out.width = x1 - x0 + 1;
out.height = y1 - y0 + 1;
out.getContext("2d").drawImage(cv, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
this._maps = this._maps || [];
this._maps[i] = out;
this._e(`r${i}_nm`).style.display = "none";
this._drawMap(i);
};
im.src = src;
}
_drawMap(i) {
const m = this._maps && this._maps[i];
const cv = this._e(`r${i}_img`);
if (!m || !cv) return;
const W = cv.clientWidth, H = cv.clientHeight;
if (!(W > 0 && H > 0)) return;
const dpr = window.devicePixelRatio || 1;
cv.width = Math.round(W * dpr);
cv.height = Math.round(H * dpr);
const c = cv.getContext("2d");
c.setTransform(dpr, 0, 0, dpr, 0, 0);
c.clearRect(0, 0, W, H);
c.imageSmoothingEnabled = true;
c.imageSmoothingQuality = "high";
const m0 = 4;
const aw = W - 2 * m0, ah = H - 2 * m0;
const s0 = Math.min(aw / m.width, ah / m.height);
const s90 = Math.min(aw / m.height, ah / m.width);
const rot = s90 > s0 * 1.12;
const sc = rot ? s90 : s0;
c.save();
c.translate(W / 2, H / 2);
if (rot) c.rotate(Math.PI / 2);
c.drawImage(m, (-m.width * sc) / 2, (-m.height * sc) / 2, m.width * sc, m.height * sc);
c.restore();
}
_onStart() {
if (window.ResizeObserver) {
this._mro = new ResizeObserver(() => this._config.robots.forEach((r, i) => this._drawMap(i)));
this._config.robots.forEach((r, i) => this._mro.observe(this._e(`r${i}_img`)));
}
this._loadWeek();
this._every(900e3, () => this._loadWeek());
this._every(30e3, () => this._update());
}
_chips(id, list, cur, attr, dict) {
const html = (list || []).map((o) => `<button data-r="${id[1]}" data-${attr}="${tbEsc(o)}" class="${o === cur ? "on" : ""}">${tbEsc(dict[o] || o.replace(/_/g, " "))}</button>`).join("");
this._h(id, html);
}
_update() {
const h = this._hass;
if (!h) return;
this._config.robots.forEach((r, i) => this._updRobot(r, i, h));
}
_updRobot(r, i, h) {
const p = `r${i}_`;
const vs = tbSt(h, r.vacuum);
const det = tbSt(h, r.status);
const err = tbSt(h, r.error);
const hasErr = vs === "error" || (tbOk(err) && err !== "none");
const live = ["cleaning"].includes(vs) || /clean|mopping|mapping|going_to_target/.test(det || "");
const ret = vs === "returning" || det === "returning_home" || det === "docking";
const docked = vs === "docked" || /charging/.test(det || "");
const paused = vs === "paused";
const scene = hasErr ? "st-err" : live ? "st-clean" : ret ? "st-ret" : docked ? "st-dock" : "st-idle";
const sc = this._e(`${p}sc`);
if (sc.className !== `scene ${scene}`) sc.className = `scene ${scene}`;
const box = this._e(`${p}box`);
box.classList.toggle("live", live);
box.classList.toggle("err", hasErr);
box.style.opacity = tbOk(vs) ? "" : ".55";
let stTxt = TB_VAC_ST[det] || TB_VAC_ST[vs] || (tbOk(vs) ? vs : "indisponibil");
const room = tbSt(h, r.current_room);
if (live && tbOk(room)) stTxt += ` · ${room}`;
if (paused) stTxt = "Pauză";
if (hasErr) stTxt = "Eroare";
this._t(`${p}st`, stTxt);
this._t(`${p}er`, hasErr ? TB_VAC_ERR[err] || (err ? err.replace(/_/g, " ") : "Eroare") : "");
const bat = tbNum(h, r.battery);
const chg = tbSt(h, r.charging) === "on";
const bh = bat !== null ? (tbClamp(bat, 0, 100) / 100) * 37 : 0;
const bf = this._e(`${p}bf`);
bf.setAttribute("height", bh.toFixed(1));
bf.setAttribute("y", (42 - bh + 0).toFixed(1));
bf.setAttribute("fill", bat === null ? "#78909c" : bat < 20 ? "#ef5350" : bat < 50 ? "#ffa726" : "#66bb6a");
this._c(`${p}bat`, "chg", chg && bat < 100);
this._t(`${p}bv`, bat !== null ? `${Math.round(bat)}%${chg ? " ⚡" : ""}` : "—");
const bs = this._e(`${p}bs`);
if (!this._ask[`s${i}`]) bs.querySelector("span").textContent = paused ? "Continuă" : "Pornește";
bs.disabled = live;
this._e(`${p}bp`).disabled = !live;
this._e(`${p}bx`).disabled = !(live || paused || ret);
this._e(`${p}bh`).disabled = docked;
const selMap = tbSt(h, r.selected_map);
const act = Math.max(0, r.maps.findIndex((m) => m[0] === selMap));
const vi = this._view[i] ?? act;
r.maps.forEach((m, k) => {
this._c(`${p}mt${k}`, "on", k === vi);
const a = this._e(`${p}ma${k}`);
if (a) a.style.display = k === act && r.maps.length > 1 ? "" : "none";
});
const im = r.maps[vi] && h.states[r.maps[vi][2]];
const img = this._e(`${p}img`);
if (im && im.attributes.entity_picture) {
const src = `${im.attributes.entity_picture}&v=${encodeURIComponent(im.state)}`;
if (img._src !== src) {
img._src = src;
this._loadMap(i, src);
}
img.style.display = "";
this._e(`${p}nm`).style.display = this._maps && this._maps[i] ? "none" : "";
this._t(`${p}mn`, `actualizată ${tbAgo(im.state)}`);
} else {
img.style.display = "none";
this._e(`${p}nm`).style.display = "";
this._t(`${p}mn`, "");
}
const b0 = tbSt(h, r.last_begin), e0 = tbSt(h, r.last_end);
const fmtD = (iso) => {
const d = new Date(iso);
const today = new Date();
const y = new Date(Date.now() - 864e5);
const day = d.toDateString() === today.toDateString() ? "azi" : d.toDateString() === y.toDateString() ? "ieri" : d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
return `${day} ${tbHHMM(d)}`;
};
const ct = tbNum(h, r.clean_time), ca = tbNum(h, r.clean_area);
this._t(`${p}l1`, live ? "Curățare în curs" : "Ultima curățare");
this._t(`${p}k1`, live ? (tbOk(b0) ? `din ${tbHHMM(new Date(b0))}` : "acum") : tbOk(b0) ? `${fmtD(b0)}${tbOk(e0) ? "–" + tbHHMM(new Date(e0)) : ""}` : "—");
this._t(`${p}k2`, ct !== null ? `${Math.round(ct)} min` : "—");
this._t(`${p}k5`, ca !== null ? `${tbF(ca, 1)} m²` : "—");
const tc = tbNum(h, r.total_count), tt = tbNum(h, r.total_time), ta = tbNum(h, r.total_area);
this._t(`${p}k4`, `${tc !== null ? tbF(tc, 0) : "—"} · ${tt !== null ? tbF(tt, 0) + " h" : "—"} · ${ta !== null ? tbF(ta, 0) + " m²" : "—"}`);
const acc = [];
const bs2 = (id, on, off, ic) => {
const s = tbSt(h, id);
if (!tbOk(s)) return;
acc.push(`<span class="${s === "on" ? "on" : ""}"><ha-icon icon="${ic}"></ha-icon>${s === "on" ? on : off}</span>`);
};
bs2(r.water_box, "Rezervor montat", "Fără rezervor", "mdi:cup-water");
bs2(r.mop_attached, "Mop montat", "Fără mop", "mdi:spray-bottle");
if (tbSt(h, r.water_shortage) === "on") acc.push(`<span class="bad"><ha-icon icon="mdi:water-alert"></ha-icon>Lipsă apă</span>`);
if (r.child_lock && tbSt(h, r.child_lock) === "on") acc.push(`<span class="on"><ha-icon icon="mdi:lock"></ha-icon>Blocare copii</span>`);
const vol = tbNum(h, r.volume);
if (vol !== null) acc.push(`<span><ha-icon icon="mdi:volume-high"></ha-icon>${Math.round(vol)}%</span>`);
const db = tbSt(h, r.dnd_begin), de = tbSt(h, r.dnd_end);
if (tbOk(db) && tbOk(de)) acc.push(`<span><ha-icon icon="mdi:weather-night"></ha-icon>${db.slice(0, 5)}–${de.slice(0, 5)}</span>`);
this._h(`${p}acc`, acc.join(""));
this._chips(`${p}fan`, tbAt(h, r.vacuum, "fan_speed_list"), tbAt(h, r.vacuum, "fan_speed"), "fan", TB_VAC_FAN);
this._chips(`${p}mop`, tbAt(h, r.mop_intensity, "options"), tbSt(h, r.mop_intensity), "mop", TB_VAC_MOP);
this._chips(`${p}mode`, tbAt(h, r.mode, "options"), tbSt(h, r.mode), "mode", TB_VAC_MODE);
this._c(`${p}dnd`, "on", tbSt(h, r.dnd) === "on");
r.consumables.forEach((c, k) => {
const v = tbNum(h, c[1]);
const pct = v !== null ? tbClamp(v / c[2], 0, 1) : 0;
const col = v === null ? "#78909c" : v <= 0 ? "#ef5350" : pct < 0.15 ? "#ff7043" : pct < 0.35 ? "#ffca28" : "#66bb6a";
const ring = this._e(`${p}cr${k}`);
ring.setAttribute("stroke-dasharray", `${(pct * 100.5).toFixed(1)} 101`);
ring.setAttribute("stroke", col);
this._c(`${p}c${k}`, "low", v !== null && pct < 0.15);
this._t(`${p}cv${k}`, v === null ? "—" : v <= 0 ? "De înlocuit" : v < 48 ? `${Math.round(v)} h` : `${Math.round(v)} h · ${Math.round(pct * 100)}%`);
});
}
async _loadWeek() {
const h = this._hass;
if (!h) return;
const c = this._config;
const end = new Date();
const start = new Date(end);
start.setHours(0, 0, 0, 0);
start.setDate(start.getDate() - 6);
const ids = c.robots.flatMap((r) => [r.last_begin, r.clean_area]);
let res;
try {
res = await h.callApi("GET", `history/period/${start.toISOString()}?filter_entity_id=${ids.join(",")}&end_time=${end.toISOString()}&minimal_response&no_attributes`);
} catch (e) {
return;
}
const byId = {};
for (const arr of res || []) if (arr && arr.length) byId[arr[0].entity_id] = arr;
const dayIdx = (t) => Math.floor((t - start.getTime()) / 864e5);
c.robots.forEach((r, i) => {
const p = `r${i}_`;
const cnt = Array(7).fill(0), area = Array(7).fill(0);
const seen = new Set();
(byId[r.last_begin] || []).forEach((x) => {
if (!tbOk(x.state) || seen.has(x.state)) return;
seen.add(x.state);
const t = new Date(x.state).getTime();
const d = dayIdx(t);
if (d >= 0 && d < 7) cnt[d]++;
});
let prev = null;
(byId[r.clean_area] || []).forEach((x, k) => {
const v = parseFloat(x.state);
const t = new Date(x.last_changed || x.last_updated).getTime();
if (!isFinite(v)) return;
if (k > 0 && v !== prev) {
const d = dayIdx(t);
if (d >= 0 && d < 7) area[d] += v;
}
prev = v;
});
const cur = tbNum(h, r.clean_area) || 0;
for (let d = 0; d < 7; d++) if (cnt[d] && !area[d]) area[d] = cur * cnt[d];
const mx = Math.max(...area, 1);
const days = ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"];
const html = area
.map((a, d) => {
const dt = new Date(start.getTime() + d * 864e5);
return `<div title="${cnt[d]} curățări"><i class="${a ? "" : "z"}" style="height:${a ? Math.max((a / mx) * 100, 8) : 4}%;animation-delay:${d * 0.06}s"></i><em>${d === 6 ? "azi" : days[dt.getDay()]}</em></div>`;
})
.join("");
this._h(`${p}wb`, html);
const tot = area.reduce((s, x) => s + x, 0), n = cnt.reduce((s, x) => s + x, 0);
this._t(`${p}ws`, `${n} curățări · ${tbF(tot, 0)} m²`);
});
}
}
TbVacuumCard.fitH = 630;
customElements.get("tb-vacuum-card") || customElements.define("tb-vacuum-card", TbVacuumCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "tb-vacuum-card", name: "Tablet · Robot vacuums", description: "Roborock vacuums: status, maps, controls, consumables — animated" });
