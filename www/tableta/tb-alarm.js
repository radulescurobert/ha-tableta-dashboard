/* ================================================================
*  ALARM (Ajax through the SIA integration) — custom:tb-alarm-card
*  >>> Edit defaults() below (or pass the keys from the dashboard YAML):
*   alarm   : sensor with the panel state; its state must be one of: dezarmat / armat / noapte / alarmă / necunoscut
*             (a template sensor you create; optional attributes: schimbat_de, ultima_schimbare, ultimul_mesaj_la)
*   conn/power : binary_sensors (panel connection, mains power)
*   persons : [[label, person.entity], ...] shown as "home / away" chips
*   devices : [[label, sensor with state OK / Alarmă / Sabotaj / Baterie slabă, icon], ...]
*   cameras : [[label, camera entity, fullscreen option name, [motion binary_sensors]], ...]
*   fullscreen : input_select used by the cameras view; cameras_view : dashboard path of that view
* ================================================================ */
const TB_ALM_CSS = `
.g { display: grid; grid-template-columns: 0.95fr 1.25fr; gap: 12px; height: 100%; }
.col { display: flex; flex-direction: column; gap: 10px; min-height: 0; min-width: 0; }
ha-card { --sc: #66bb6a; transition: box-shadow .6s; }
ha-card.alarm { animation: aFlash 1s ease-in-out infinite; }
@keyframes aFlash { 50% { box-shadow: inset 0 0 0 6px #ef5350, inset 0 0 60px #ef535088; } }
.hero { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; position: relative; overflow: hidden;
background: radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--sc) 22%, transparent), transparent 62%), var(--card-background-color); }
.shield { position: relative; width: 250px; height: 250px; }
.shield svg { width: 100%; height: 100%; overflow: visible; }
.ring1, .ring2 { transform-box: fill-box; transform-origin: center; }
.st-armat .ring1 { animation: tbSpin 14s linear infinite; }
.st-armat .ring2 { animation: tbSpin 9s linear infinite reverse; }
.sweep { opacity: 0; transform-box: view-box; transform-origin: 125px 125px; }
.st-armat .sweep { opacity: 1; animation: tbSpin 3.5s linear infinite; }
.glow { transform-box: fill-box; transform-origin: center; animation: aBreath 4s ease-in-out infinite; }
@keyframes aBreath { 50% { transform: scale(1.06); opacity: .65; } }
.st-alarmă .glow { animation: aBreath .7s ease-in-out infinite; }
.ripple { fill: none; stroke: var(--sc); stroke-width: 3; opacity: 0; transform-box: fill-box; transform-origin: center; }
.st-alarmă .ripple, .st-armat .ripple { animation: aRip 2.4s ease-out infinite; }
.st-alarmă .ripple { animation-duration: 1.2s; stroke-width: 5; }
.ripple.r2 { animation-delay: .8s !important; } .ripple.r3 { animation-delay: 1.6s !important; }
.st-alarmă .ripple.r2 { animation-delay: .4s !important; } .st-alarmă .ripple.r3 { animation-delay: .8s !important; }
@keyframes aRip { from { opacity: .8; transform: scale(.75); } to { opacity: 0; transform: scale(1.35); } }
.body { transition: fill .8s; }
.st-alarmă .shieldg { animation: aShake .35s infinite; transform-box: fill-box; transform-origin: center; }
@keyframes aShake { 25% { transform: rotate(-3deg); } 75% { transform: rotate(3deg); } }
.gl { display: none; } .st-dezarmat .gl-open, .st-armat .gl-lock, .st-noapte .gl-moon, .st-alarmă .gl-alert, .st-necunoscut .gl-q { display: inline; }
.stars circle { opacity: 0; }
.st-noapte .stars circle { animation: aTw 2.6s ease-in-out infinite; }
@keyframes aTw { 50% { opacity: 1; } }
.gl-lock .shackle { animation: aLock 4s ease-in-out infinite; }
@keyframes aLock { 0%, 70%, 100% { transform: translateY(0); } 80% { transform: translateY(-3px); } }
.big { font-size: 2.1rem; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: var(--sc); line-height: 1; text-shadow: 0 0 22px color-mix(in srgb, var(--sc) 50%, transparent); }
.st-alarmă .big { animation: tbPulse .7s infinite; }
.sub { font-size: .86rem; color: var(--secondary-text-color); text-align: center; min-height: 1.2em; }
.sub b { color: var(--primary-text-color); }
.note2 { position: absolute; bottom: 8px; left: 0; right: 0; text-align: center; font-size: .66rem; color: var(--secondary-text-color); opacity: .8; }
.chips { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; flex: 0 0 auto; }
.chp { display: flex; align-items: center; gap: 9px; padding: 8px 11px; border-radius: 14px; background: var(--card-background-color); border: 1px solid color-mix(in srgb, var(--cc) 30%, transparent); min-width: 0; }
.chp .ic { position: relative; width: 32px; height: 32px; flex: 0 0 32px; border-radius: 10px; display: grid; place-items: center; background: color-mix(in srgb, var(--cc) 18%, transparent); }
.chp .ic ha-icon { --mdc-icon-size: 20px; color: var(--cc); }
.chp .ic i { position: absolute; right: -2px; top: -2px; width: 9px; height: 9px; border-radius: 50%; background: var(--cc); box-shadow: 0 0 0 0 var(--cc); animation: aDot 2s infinite; }
@keyframes aDot { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--cc) 70%, transparent); } 100% { box-shadow: 0 0 0 8px transparent; } }
.chp div { min-width: 0; }
.chp b { display: block; font-size: .86rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chp span { display: block; font-size: .66rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.devs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.dv { position: relative; border-radius: 14px; padding: 8px 10px; overflow: hidden; min-width: 0; animation: tbFade .5s both;
background: color-mix(in srgb, var(--dc) 10%, var(--card-background-color)); border: 1px solid color-mix(in srgb, var(--dc) 28%, transparent); }
.dv .top { display: flex; align-items: center; gap: 7px; }
.dv .ic { position: relative; width: 30px; height: 30px; flex: 0 0 30px; border-radius: 10px; display: grid; place-items: center; background: color-mix(in srgb, var(--dc) 20%, transparent); }
.dv .ic ha-icon { --mdc-icon-size: 19px; color: var(--dc); }
.dv b { font-size: .78rem; line-height: 1.15; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.dv .s { margin-top: 5px; font-size: .74rem; font-weight: 800; color: var(--dc); white-space: nowrap; }
.dv .t { font-size: .62rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dv .scan { position: absolute; left: 0; right: 0; height: 40%; top: -40%; background: linear-gradient(transparent, color-mix(in srgb, var(--dc) 22%, transparent), transparent); opacity: 0; pointer-events: none; }
.armedall .dv.ok .scan { opacity: 1; animation: aScan 3s linear infinite; animation-delay: var(--d); }
@keyframes aScan { to { top: 100%; } }
.armedall .dv.ok .ic::after { content: ""; position: absolute; inset: -3px; border-radius: 12px; border: 2px solid var(--dc); opacity: .5; animation: tbPulse 2s infinite; }
.dv.al { animation: aAlarmTile .8s ease-in-out infinite; }
@keyframes aAlarmTile { 50% { background: color-mix(in srgb, #ef5350 32%, var(--card-background-color)); box-shadow: 0 0 18px #ef535088; } }
.dv.al .ic ha-icon { animation: aShake .3s infinite; }
.dv.ta .ic ha-icon { animation: aShake .5s infinite; }
.dv.bt .s { animation: tbPulse 1.4s infinite; }
.dv.na { opacity: .55; }
.cams { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.cam { position: relative; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #000; cursor: pointer; }
.cam img { width: 100%; height: 100%; object-fit: cover; display: block; transition: opacity .5s; }
.cam span { position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 7px 4px; font-size: .64rem; font-weight: 700; color: #fff; background: linear-gradient(transparent, rgba(0,0,0,.75)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cam i { position: absolute; right: 6px; top: 6px; width: 7px; height: 7px; border-radius: 50%; background: #ef5350; animation: tbPulse 1.2s infinite; }
.cam.mv { box-shadow: 0 0 0 2px #ef5350; }
.tl { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.tll { flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none; position: relative; padding-left: 4px; }
.tll::-webkit-scrollbar { display: none; }
.ev { position: relative; display: grid; grid-template-columns: 20px 1fr auto; gap: 8px; align-items: center; padding: 4px 0; animation: tbFade .4s both; }
.ev::before { content: ""; position: absolute; left: 9px; top: 0; bottom: 0; width: 2px; background: color-mix(in srgb, var(--primary-text-color) 10%, transparent); }
.ev:first-child::before { top: 50%; } .ev:last-child::before { bottom: 50%; }
.ev .d { position: relative; width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; background: color-mix(in srgb, var(--ec) 22%, var(--card-background-color)); z-index: 1; }
.ev .d ha-icon { --mdc-icon-size: 13px; color: var(--ec); }
.ev:first-child .d { box-shadow: 0 0 0 0 var(--ec); animation: aDot 2s infinite; --cc: var(--ec); }
.ev b { font-size: .8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ev b small { font-weight: 500; color: var(--secondary-text-color); margin-left: 4px; }
.ev em { font-style: normal; font-size: .7rem; color: var(--secondary-text-color); white-space: nowrap; font-variant-numeric: tabular-nums; }
.empty { color: var(--secondary-text-color); font-size: .8rem; padding: 12px 0; text-align: center; }
.st7 { display: flex; gap: 10px; font-size: .68rem; color: var(--secondary-text-color); }
.st7 b { color: var(--primary-text-color); }
@media (max-height: 760px) { .g, .col { gap: 8px; } .shield { width: 205px; height: 205px; } .big { font-size: 1.8rem; } .chp { padding: 6px 9px; } .dv { padding: 6px 8px; } .dv .s { margin-top: 3px; } }
@media (max-width: 899px), (orientation: portrait) { .g { grid-template-columns: 1fr; } .devs { grid-template-columns: repeat(2, 1fr); } .tl { min-height: 300px; } }
`;
const TB_ALM_STATE = {
dezarmat: ["#66bb6a", "Dezarmat"],
armat: ["#42a5f5", "Armat"],
noapte: ["#ab47bc", "Mod noapte"],
"alarmă": ["#ef5350", "ALARMĂ"],
necunoscut: ["#90a4ae", "Necunoscut"],
};
const TB_DEV_ST = { OK: ["#66bb6a", "OK", "ok"], "Alarmă": ["#ef5350", "ALARMĂ", "al"], Sabotaj: ["#ffa726", "Sabotaj", "ta"], "Baterie slabă": ["#ffca28", "Baterie slabă", "bt"] };
class TbAlarmCard extends TbBase {
static defaults() {
return {
alarm: "sensor.YOUR_ALARM_STATE",
conn: "binary_sensor.YOUR_ALARM_PANEL_CONNECTION",
power: "binary_sensor.YOUR_ALARM_PANEL_MAINS_POWER",
persons: [["Person 1", "person.YOUR_PERSON_1"], ["Person 2", "person.YOUR_PERSON_2"]],
devices: [
["Window 1", "sensor.YOUR_ALARM_DEVICE_1", "mdi:window-closed-variant"],
["Front door", "sensor.YOUR_ALARM_DEVICE_2", "mdi:door-closed"],
["Terrace door", "sensor.YOUR_ALARM_DEVICE_3", "mdi:door-sliding"],
["Window 2", "sensor.YOUR_ALARM_DEVICE_4", "mdi:window-closed-variant"],
["Remote 1", "sensor.YOUR_ALARM_DEVICE_5", "mdi:remote"],
["Remote 2", "sensor.YOUR_ALARM_DEVICE_6", "mdi:remote"],
["Siren", "sensor.YOUR_ALARM_DEVICE_7", "mdi:alarm-light-outline"],
],
cameras: [
["Camera 1", "camera.YOUR_CAMERA_1", "camera_1", ["binary_sensor.YOUR_CAMERA_1_FIELD_DETECTION", "binary_sensor.YOUR_CAMERA_1_LINE_DETECTION"]],
["Camera 2", "camera.YOUR_CAMERA_2", "camera_2", ["binary_sensor.YOUR_CAMERA_2_FIELD_DETECTION", "binary_sensor.YOUR_CAMERA_2_LINE_DETECTION"]],
["Camera 3", "camera.YOUR_CAMERA_3", "camera_3", ["binary_sensor.YOUR_CAMERA_3_FIELD_DETECTION", "binary_sensor.YOUR_CAMERA_3_LINE_DETECTION"]],
["Camera 4", "camera.YOUR_CAMERA_4", "camera_4", ["binary_sensor.YOUR_CAMERA_4_FIELD_DETECTION", "binary_sensor.YOUR_CAMERA_4_LINE_DETECTION"]],
],
fullscreen: "input_select.camera_fullscreen_tableta",
cameras_view: "/YOUR-DASHBOARD-URL-PATH/camere",
};
}
_build() {
const c = this._config;
const stars = Array.from({ length: 9 }, (_, i) => {
const a = (i / 9) * Math.PI * 2, r = 102 + (i % 3) * 8;
return `<circle cx="${(125 + Math.cos(a) * r).toFixed(1)}" cy="${(125 + Math.sin(a) * r).toFixed(1)}" r="${1.6 + (i % 2)}" fill="#e1bee7" style="animation-delay:${(i * 0.31).toFixed(2)}s"/>`;
}).join("");
const shieldPath = "M125 40 L190 64 V120 C190 165 162 196 125 212 C88 196 60 165 60 120 V64 Z";
const hero = `<svg viewBox="0 0 250 250">
<defs><radialGradient id="ag" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="var(--sc)" stop-opacity=".55"/><stop offset="1" stop-color="var(--sc)" stop-opacity="0"/></radialGradient>
<linearGradient id="ab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc)"/><stop offset="1" stop-color="color-mix(in srgb, var(--sc) 55%, #000)"/></linearGradient>
<linearGradient id="asw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--sc)" stop-opacity="0"/><stop offset="1" stop-color="var(--sc)" stop-opacity=".55"/></linearGradient></defs>
<circle class="glow" cx="125" cy="125" r="118" fill="url(#ag)"/>
<circle class="ripple r1" cx="125" cy="125" r="100"/><circle class="ripple r2" cx="125" cy="125" r="100"/><circle class="ripple r3" cx="125" cy="125" r="100"/>
<g class="sweep"><path d="M125 125 L125 13 A112 112 0 0 1 222 69 Z" fill="url(#asw)" opacity=".5"/></g>
<circle class="ring1" cx="125" cy="125" r="112" fill="none" stroke="var(--sc)" stroke-width="2" stroke-dasharray="4 10" opacity=".55"/>
<circle class="ring2" cx="125" cy="125" r="100" fill="none" stroke="var(--sc)" stroke-width="1.5" stroke-dasharray="40 18 6 18" opacity=".35"/>
<g class="stars">${stars}</g>
<g class="shieldg"><path class="body" d="${shieldPath}" fill="url(#ab)" stroke="color-mix(in srgb, var(--sc) 70%, #fff)" stroke-width="3"/>
<path d="M125 52 L178 72 V120 C178 158 155 184 125 198" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="3" stroke-linecap="round"/>
<g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
<g class="gl gl-lock"><path class="shackle" d="M108 118 V102 a17 17 0 0 1 34 0 V118"/><rect x="98" y="116" width="54" height="44" rx="9" fill="#fff" stroke="none"/><circle cx="125" cy="136" r="5" fill="var(--sc)" stroke="none"/><path d="M125 139 V148" stroke="var(--sc)" stroke-width="4"/></g>
<g class="gl gl-open"><path d="M108 118 V100 a17 17 0 0 1 33 -6"/><rect x="98" y="116" width="54" height="44" rx="9" fill="#fff" stroke="none"/><circle cx="125" cy="136" r="5" fill="var(--sc)" stroke="none"/></g>
<g class="gl gl-moon"><path d="M140 96 a32 32 0 1 0 14 44 a26 26 0 1 1 -14 -44 z" fill="#fff" stroke="none"/></g>
<g class="gl gl-alert"><path d="M125 92 V136"/><circle cx="125" cy="156" r="5" fill="#fff" stroke="none"/></g>
<g class="gl gl-q"><path d="M110 108 a15 15 0 1 1 22 13 c-5 3 -7 6 -7 12"/><circle cx="125" cy="152" r="4.5" fill="#fff" stroke="none"/></g>
</g></g></svg>`;
const devs = c.devices.map((d, i) => `<div class="dv" id="dv${i}" style="--d:${(i * 0.35).toFixed(2)}s;animation-delay:${i * 0.05}s"><span class="scan"></span><div class="top"><div class="ic"><ha-icon icon="${d[2]}"></ha-icon></div><b>${tbEsc(d[0])}</b></div><div class="s" id="ds${i}">—</div><div class="t" id="dt${i}"></div></div>`).join("");
const cams = c.cameras.map((m, i) => `<div class="cam" id="cm${i}" data-i="${i}"><img id="ci${i}" alt=""><span>${tbEsc(m[0])}</span></div>`).join("");
this.shadowRoot.innerHTML = `<style>${TB_BASE_CSS}${TB_ALM_CSS}</style>
<ha-card id="card"><div class="g">
<div class="col">
<div class="pn hero" id="hero"><div class="shield" id="sh">${hero}</div><div class="big" id="big">—</div><div class="sub" id="sub"></div>
<div class="note2">Armarea și dezarmarea se fac din aplicația Ajax sau de pe telecomenzi</div></div>
<div class="chips" id="chips"></div>
</div>
<div class="col" id="right">
<div class="pn"><div class="pt"><ha-icon icon="mdi:shield-home-outline"></ha-icon>Dispozitive Ajax<span class="sp"></span><span class="note" id="dvn"></span></div><div class="devs">${devs}</div></div>
<div class="pn"><div class="pt"><ha-icon icon="mdi:cctv"></ha-icon>Camere<span class="sp"></span><span class="note">atinge pentru ecran complet</span></div><div class="cams">${cams}</div></div>
<div class="pn tl"><div class="pt"><ha-icon icon="mdi:timeline-clock-outline"></ha-icon>Ultimele evenimente<span class="sp"></span><span class="st7" id="st7"></span></div><div class="tll" id="tl"><div class="empty">Se încarcă…</div></div></div>
</div>
</div></ha-card>`;
this.shadowRoot.querySelector(".cams").addEventListener("click", (ev) => {
const el = ev.target.closest(".cam");
if (!el) return;
const m = this._config.cameras[+el.dataset.i];
this._svc("input_select", "select_option", { entity_id: this._config.fullscreen, option: m[2] });
history.pushState(null, "", this._config.cameras_view);
window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
});
}
_onStart() {
this._loadTl();
this._every(120e3, () => this._loadTl());
this._every(10e3, () => this._camRefresh());
this._every(30e3, () => this._update());
this._camRefresh();
}
_camRefresh() {
const h = this._hass;
if (!h) return;
this._config.cameras.forEach((m, i) => {
const s = h.states[m[1]];
const img = this._e(`ci${i}`);
if (!s || !img || !s.attributes.entity_picture) return;
const src = `${s.attributes.entity_picture}&t=${Math.floor(Date.now() / 10000)}`;
const pre = new Image();
pre.onload = () => (img.src = src);
pre.src = src;
});
}
_ago(iso) {
if (!iso) return "";
const d = new Date(iso);
if (!isFinite(d)) return "";
const today = new Date().toDateString() === d.toDateString();
const yest = new Date(Date.now() - 864e5).toDateString() === d.toDateString();
return `${today ? "azi" : yest ? "ieri" : d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" })} ${tbHHMM(d)}`;
}
_update() {
const h = this._hass, c = this._config;
const a = h.states[c.alarm];
let st = a ? a.state : "necunoscut";
if (!TB_ALM_STATE[st]) st = "necunoscut";
const [col, label] = TB_ALM_STATE[st];
const card = this._e("card");
card.style.setProperty("--sc", col);
card.classList.toggle("alarm", st === "alarmă");
const sh = this._e("sh");
const cls = `shield st-${st}`;
if (sh.className !== cls) sh.className = cls;
this._t("big", label);
const by = a && a.attributes.schimbat_de, when = a && a.attributes.ultima_schimbare;
const verb = st === "alarmă" ? "declanșată de" : st === "necunoscut" ? "" : st === "dezarmat" ? "dezarmat de" : "armat de";
this._h("sub", st === "necunoscut" ? "Aștept primul eveniment de la centrală (armare / dezarmare)" : `${verb} <b>${tbEsc(by || "—")}</b>${when ? ` · ${this._ago(when)} (${tbAgo(when)})` : ""}`);
this._c("right", "armedall", st === "armat" || st === "noapte");
const conn = tbSt(h, c.conn), pw = tbSt(h, c.power);
const last = a && a.attributes.ultimul_mesaj_la;
const ok = conn === "on";
const chips = [];
chips.push([ok ? "#66bb6a" : "#ef5350", ok ? "mdi:lan-connect" : "mdi:lan-disconnect", ok ? "Centrală conectată" : "Centrală deconectată", last ? `ultimul semnal ${tbAgo(last)}` : "fără semnal"]);
chips.push([pw === "off" ? "#ef5350" : pw === "on" ? "#66bb6a" : "#90a4ae", pw === "off" ? "mdi:power-plug-off" : "mdi:power-plug", pw === "off" ? "Fără curent!" : pw === "on" ? "Alimentare OK" : "Alimentare", pw === "off" ? "centrala merge pe baterie" : pw === "on" ? "rețea 230 V" : "nicio problemă raportată"]);
c.persons.forEach(([n, id]) => {
const s = tbSt(h, id);
const home = s === "home";
chips.push([home ? "#26c6da" : "#78909c", home ? "mdi:home-account" : "mdi:account-arrow-right", n, home ? "acasă" : tbOk(s) ? (s === "not_home" ? "plecat" : s) : "necunoscut"]);
});
const anyHome = c.persons.some(([, id]) => tbSt(h, id) === "home");
if (!anyHome && st === "dezarmat") chips.push(["#ffa726", "mdi:shield-alert-outline", "Nimeni acasă", "alarma e dezarmată!"]);
this._h("chips", chips.map(([cc, ic, b, s]) => `<div class="chp" style="--cc:${cc}"><div class="ic"><ha-icon icon="${ic}"></ha-icon><i></i></div><div><b>${tbEsc(b)}</b><span>${tbEsc(s)}</span></div></div>`).join(""));
let probs = 0;
c.devices.forEach((d, i) => {
const s = h.states[d[1]];
const v = s ? s.state : "unknown";
const [dc, dl, dk] = TB_DEV_ST[v] || ["#90a4ae", "fără date", "na"];
if (dk !== "ok" && dk !== "na") probs++;
const el = this._e(`dv${i}`);
el.className = `dv ${dk}`;
el.style.setProperty("--dc", dc);
const armedTxt = (st === "armat" || st === "noapte") && dk === "ok" ? "Protejat" : dl;
this._t(`ds${i}`, armedTxt);
const le = s && s.attributes.ultimul_eveniment;
this._t(`dt${i}`, le ? tbAgo(le) : v === "OK" ? "fără evenimente" : "");
});
this._t("dvn", probs ? `${probs} cu probleme` : "toate OK");
c.cameras.forEach((m, i) => {
const mv = m[3].some((id) => tbSt(h, id) === "on");
const el = this._e(`cm${i}`);
if (el.classList.contains("mv") !== mv) {
el.classList.toggle("mv", mv);
const dot = el.querySelector("i");
if (mv && !dot) el.insertAdjacentHTML("beforeend", "<i></i>");
if (!mv && dot) dot.remove();
}
});
}
async _loadTl() {
const h = this._hass, c = this._config;
if (!h) return;
const end = new Date(), start = new Date(end - 7 * 864e5);
const devIds = c.devices.map((d) => d[1]);
let main, devs;
try {
[main, devs] = await Promise.all([
h.callApi("GET", `history/period/${start.toISOString()}?filter_entity_id=${c.alarm}&end_time=${end.toISOString()}&significant_changes_only=0`),
h.callApi("GET", `history/period/${start.toISOString()}?filter_entity_id=${devIds.join(",")}&end_time=${end.toISOString()}&minimal_response&no_attributes`),
]);
} catch (e) {
return;
}
const evs = [];
let prev = null, arms = 0, alarms = 0;
for (const p of (main && main[0]) || []) {
const s = p.state;
if (!TB_ALM_STATE[s] || s === "necunoscut" || s === prev) {
if (TB_ALM_STATE[s]) prev = s;
continue;
}
prev = s;
const by = p.attributes && p.attributes.schimbat_de;
if (s === "armat" || s === "noapte") arms++;
if (s === "alarmă") alarms++;
const ic = s === "armat" ? "mdi:shield-lock" : s === "noapte" ? "mdi:weather-night" : s === "alarmă" ? "mdi:alarm-light" : "mdi:shield-off-outline";
evs.push({ t: new Date(p.last_changed).getTime(), c: TB_ALM_STATE[s][0], ic, txt: TB_ALM_STATE[s][1], sub: by ? `de ${by}` : "" });
}
(devs || []).forEach((arr) => {
if (!arr || !arr.length) return;
const id = arr[0].entity_id;
const d = c.devices.find((x) => x[1] === id);
let pv = null;
arr.forEach((p) => {
const s = p.state;
if (s !== pv && TB_DEV_ST[s] && s !== "OK") {
evs.push({ t: new Date(p.last_changed).getTime(), c: TB_DEV_ST[s][0], ic: s === "Alarmă" ? "mdi:alert" : s === "Sabotaj" ? "mdi:hand-back-right-off" : "mdi:battery-alert", txt: TB_DEV_ST[s][1], sub: d ? d[0] : id });
}
if (TB_DEV_ST[s]) pv = s;
});
});
evs.sort((x, y) => y.t - x.t);
const html = evs.length
? evs.slice(0, 40).map((e, i) => `<div class="ev" style="--ec:${e.c};animation-delay:${Math.min(i * 0.04, 0.6)}s"><span class="d"><ha-icon icon="${e.ic}"></ha-icon></span><b>${tbEsc(e.txt)}<small>${tbEsc(e.sub)}</small></b><em>${this._ago(new Date(e.t).toISOString())}</em></div>`).join("")
: `<div class="empty">Niciun eveniment încă. Armările, dezarmările și alarmele vor apărea aici.</div>`;
this._h("tl", html);
this._h("st7", `<span>7 zile:</span><span><b>${arms}</b> armări</span><span><b>${alarms}</b> alarme</span>`);
}
}
TbAlarmCard.fitH = 630;
customElements.get("tb-alarm-card") || customElements.define("tb-alarm-card", TbAlarmCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "tb-alarm-card", name: "Tablet · Alarm", description: "Alarm panel state, devices, cameras and event timeline — animated" });
