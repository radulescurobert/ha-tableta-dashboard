/* ================================================================
*  CALENDAR — public holidays (RO) + reminders (Home tab)
*  <tb-cal> is placed in a panel; it receives .hass and setConfig({holidays, reminders})
*  Click on a day -> sheet with that day's holidays/reminders + reminder form (time, repeat).
*  >>> Reminders need a LOCAL CALENDAR entity (integration "Local Calendar"): set it in defaults below
*      or via the tb-acasa-card config (`reminders:`). The holidays calendar is optional (falls back to built-in RO holidays).
* ================================================================ */
const TBC_CSS = `
:host { display: flex; flex-direction: column; height: 100%; min-height: 0; --rem: #26c6da; --hol: #ff7043; --hol2: #ffb300; }
* { box-sizing: border-box; }
button { font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; border: none; background: none; }
.hd { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.hd ha-icon { --mdc-icon-size: 17px; color: var(--secondary-text-color); }
.mo { font-size: 1.25rem; font-weight: 800; letter-spacing: .01em; text-transform: capitalize;
  background: linear-gradient(90deg, var(--primary-text-color), var(--primary-color)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.yr { font-size: 1.25rem; font-weight: 300; color: var(--secondary-text-color); }
.sp { flex: 1; }
.nb { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
  background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); transition: transform .15s, background .2s; }
.nb:active { transform: scale(.88); background: color-mix(in srgb, var(--primary-color) 25%, transparent); }
.nb ha-icon { --mdc-icon-size: 20px; color: var(--primary-text-color); }
.tdb { height: 30px; padding: 0 12px; border-radius: 999px; font-size: .78rem; font-weight: 700;
  background: color-mix(in srgb, var(--primary-color) 20%, transparent); color: var(--primary-color); }
.wk { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; font-size: .68rem; font-weight: 800; letter-spacing: .08em;
  text-transform: uppercase; color: var(--secondary-text-color); text-align: center; margin-bottom: 3px; }
.wk .we { color: color-mix(in srgb, var(--hol) 75%, var(--secondary-text-color)); }
.gw { flex: 1 1 auto; min-height: 0; position: relative; }
.gr { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: repeat(6, 1fr); gap: 4px; }
.gr.sl { animation: cSlideL .38s cubic-bezier(.2,.8,.2,1) both; }
.gr.sr { animation: cSlideR .38s cubic-bezier(.2,.8,.2,1) both; }
@keyframes cSlideL { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }
@keyframes cSlideR { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: none; } }
.d { position: relative; border-radius: 12px; min-width: 0; min-height: 0; padding: 3px 4px 4px; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 1px;
  background: color-mix(in srgb, var(--primary-text-color) 4%, transparent); transition: transform .15s, background .25s; animation: cIn .45s both; }
@keyframes cIn { from { opacity: 0; transform: scale(.86); } to { opacity: 1; transform: none; } }
.d:active { transform: scale(.92); }
.d .n { font-size: .98rem; font-weight: 600; line-height: 1.55; width: 1.75em; height: 1.75em; display: grid; place-items: center; border-radius: 50%; position: relative; z-index: 1; }
.d.we .n { color: color-mix(in srgb, var(--hol) 70%, var(--primary-text-color)); }
.d.ot { opacity: .32; }
.d.past:not(.ot) .n { opacity: .55; }
.d.hl { background: linear-gradient(150deg, color-mix(in srgb, var(--hol) 26%, transparent), color-mix(in srgb, var(--hol2) 14%, transparent));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--hol) 45%, transparent); }
.d.hl .n { color: var(--hol); font-weight: 800; }
.d .hn { font-size: .54rem; font-weight: 700; line-height: 1.15; max-width: 100%; color: color-mix(in srgb, var(--hol) 80%, var(--primary-text-color));
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.d.td .n { color: #fff; font-weight: 800; background: linear-gradient(135deg, var(--primary-color), var(--rem));
  box-shadow: 0 0 14px color-mix(in srgb, var(--primary-color) 70%, transparent); }
.d.td .n::after { content: ""; position: absolute; inset: -4px; border-radius: 50%; border: 2px solid var(--primary-color); animation: cRing 2.4s ease-out infinite; }
@keyframes cRing { 0% { transform: scale(.85); opacity: .9; } 100% { transform: scale(1.45); opacity: 0; } }
.d.td { background: color-mix(in srgb, var(--primary-color) 14%, transparent); }
.dots { display: flex; gap: 3px; align-items: center; margin-top: auto; min-height: 7px; }
.dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--rem); box-shadow: 0 0 6px var(--rem); animation: cDot 2.2s ease-in-out infinite; }
.dots i:nth-child(2) { animation-delay: .3s; } .dots i:nth-child(3) { animation-delay: .6s; }
@keyframes cDot { 50% { opacity: .45; transform: scale(.8); } }
.dots b { font-size: .55rem; color: var(--rem); font-weight: 800; }
.up { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 8px; flex: 0 0 auto; }
.ui { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 12px; min-width: 0; text-align: left;
  background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); animation: cIn .5s both; }
.ui .ub { flex: 0 0 auto; width: 36px; height: 38px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; color: #fff; }
.ui.rem .ub { background: linear-gradient(160deg, var(--rem), var(--primary-color)); }
.ui.hol .ub { background: linear-gradient(160deg, var(--hol2), var(--hol)); }
.ui .ub b { font-size: 1.02rem; } .ui .ub small { font-size: .56rem; font-weight: 700; text-transform: uppercase; }
.ui .ut { min-width: 0; display: flex; flex-direction: column; }
.ui .ut span { font-size: .8rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ui .ut small { font-size: .66rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.upe { grid-column: 1 / -1; font-size: .78rem; color: var(--secondary-text-color); font-style: italic; padding: 4px 2px; }
/* ---------- day sheet ---------- */
.ov { position: fixed; inset: 0; z-index: 50; display: none; align-items: flex-start; justify-content: center; padding-top: 5vh;
  background: rgba(0,0,0,.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.ov.on { display: flex; animation: cFade .2s both; }
@keyframes cFade { from { opacity: 0; } to { opacity: 1; } }
.sh { width: min(820px, 94vw); max-height: 88vh; overflow: auto; border-radius: 24px; padding: 18px 20px 20px;
  background: var(--card-background-color, #1e1e1e); color: var(--primary-text-color);
  border: 1px solid color-mix(in srgb, var(--primary-color) 35%, transparent);
  box-shadow: 0 20px 60px rgba(0,0,0,.5), 0 0 40px color-mix(in srgb, var(--primary-color) 18%, transparent); animation: cPop .32s cubic-bezier(.2,1.2,.3,1) both; }
@keyframes cPop { from { opacity: 0; transform: translateY(18px) scale(.96); } to { opacity: 1; transform: none; } }
.shh { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.big { width: 62px; height: 62px; border-radius: 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1;
  color: #fff; background: linear-gradient(140deg, var(--primary-color), var(--rem)); box-shadow: 0 6px 20px color-mix(in srgb, var(--primary-color) 45%, transparent); }
.big b { font-size: 1.7rem; } .big small { font-size: .68rem; font-weight: 800; text-transform: uppercase; margin-top: 2px; }
.shd { font-size: 1.35rem; font-weight: 800; text-transform: capitalize; }
.sht { font-size: .9rem; color: var(--secondary-text-color); }
.x { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
.x ha-icon { --mdc-icon-size: 22px; }
.sb { display: grid; grid-template-columns: 1fr 1.15fr; gap: 18px; }
.lbl { font-size: .7rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--secondary-text-color); margin: 0 0 8px; }
.li { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 14px; margin-bottom: 7px; animation: cIn .35s both;
  background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); }
.li.hol { background: linear-gradient(120deg, color-mix(in srgb, var(--hol) 24%, transparent), color-mix(in srgb, var(--hol2) 12%, transparent)); }
.li ha-icon { --mdc-icon-size: 22px; flex: 0 0 auto; }
.li.hol ha-icon { color: var(--hol); } .li.rem ha-icon { color: var(--rem); }
.li .lt { flex: 1; min-width: 0; } .li .lt b { display: block; font-size: .95rem; overflow-wrap: anywhere; }
.li .lt small { font-size: .74rem; color: var(--secondary-text-color); }
.li .tm { font-size: 1.05rem; font-weight: 800; font-variant-numeric: tabular-nums; color: var(--rem); }
.del { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; flex: 0 0 auto; transition: background .2s, width .2s; }
.del ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }
.del.arm { width: auto; padding: 0 12px; border-radius: 999px; background: #e53935; color: #fff; font-size: .78rem; font-weight: 800; }
.del.arm ha-icon { color: #fff; }
.emp { font-size: .85rem; color: var(--secondary-text-color); font-style: italic; padding: 6px 2px; }
.fm { display: flex; flex-direction: column; gap: 10px; padding: 14px; border-radius: 18px;
  background: color-mix(in srgb, var(--primary-color) 7%, transparent); border: 1px solid color-mix(in srgb, var(--primary-color) 18%, transparent); }
.in { width: 100%; font: inherit; font-size: 1rem; padding: 12px 14px; border-radius: 12px; outline: none; color: var(--primary-text-color);
  background: var(--card-background-color, #1e1e1e); border: 1px solid color-mix(in srgb, var(--primary-text-color) 18%, transparent); transition: border-color .2s, box-shadow .2s; }
.in:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 25%, transparent); }
.tr { display: flex; align-items: center; gap: 10px; }
.tmw { display: flex; align-items: center; gap: 4px; }
.st { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
.st ha-icon { --mdc-icon-size: 18px; }
.tv { font-size: 1.9rem; font-weight: 800; font-variant-numeric: tabular-nums; min-width: 2.2ch; text-align: center; }
.tc { font-size: 1.6rem; font-weight: 800; opacity: .6; animation: tbPulseC 1.4s infinite; }
@keyframes tbPulseC { 50% { opacity: .2; } }
.tmw.off { opacity: .3; pointer-events: none; }
.pills { display: flex; flex-wrap: wrap; gap: 6px; }
.pl { padding: 6px 11px; border-radius: 999px; font-size: .8rem; font-weight: 700; background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); transition: background .2s, color .2s; }
.pl.on { background: var(--primary-color); color: var(--text-primary-color, #fff); }
.sv { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 13px; border-radius: 14px; font-weight: 800; font-size: 1rem;
  color: #fff; background: linear-gradient(120deg, var(--primary-color), var(--rem)); box-shadow: 0 6px 18px color-mix(in srgb, var(--primary-color) 40%, transparent); transition: transform .15s, opacity .2s; }
.sv:active { transform: scale(.97); } .sv[disabled] { opacity: .5; }
.sv ha-icon { --mdc-icon-size: 21px; }
.er { font-size: .8rem; color: #ef5350; min-height: 1em; }
.ok { animation: cOk .6s; } @keyframes cOk { 30% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--rem) 45%, transparent); } }
@media (max-width: 700px), (orientation: portrait) { .sb { grid-template-columns: 1fr; } }
`;
const TBC_WD = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];
const TBC_REP = [["", "O dată"], ["FREQ=DAILY", "Zilnic"], ["FREQ=WEEKLY", "Săptămânal"], ["FREQ=MONTHLY", "Lunar"], ["FREQ=YEARLY", "Anual"]];
const tbcEsc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tbc2 = (n) => String(n).padStart(2, "0");
const tbcKey = (d) => `${d.getFullYear()}-${tbc2(d.getMonth() + 1)}-${tbc2(d.getDate())}`;
const tbcParse = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const tbcAdd = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const tbcIso = (d) => {
  const o = -d.getTimezoneOffset(), s = o >= 0 ? "+" : "-", a = Math.abs(o);
  return `${tbcKey(d)}T${tbc2(d.getHours())}:${tbc2(d.getMinutes())}:00${s}${tbc2(Math.floor(a / 60))}:${tbc2(a % 60)}`;
};
const tbcCap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
/* Orthodox Easter (Julian calendar -> Gregorian, valid 1900-2099) */
function tbcEaster(y) {
  const a = y % 4, b = y % 7, c = y % 19, d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7;
  const x = d + e + 114;
  return new Date(y, Math.floor(x / 31) - 1, (x % 31) + 1 + 13);
}
/* Romanian public holidays (Labour Code, art. 139) — used when no Holiday-integration calendar exists. Edit for your country. */
function tbcRoHolidays(y) {
  const E = tbcEaster(y), f = (m, d) => new Date(y, m - 1, d);
  return [
    [f(1, 1), "Anul Nou"], [f(1, 2), "Anul Nou (a 2-a zi)"], [f(1, 6), "Boboteaza"], [f(1, 7), "Sf. Ioan Botezătorul"],
    [f(1, 24), "Unirea Principatelor"], [tbcAdd(E, -2), "Vinerea Mare"], [E, "Paștele"], [tbcAdd(E, 1), "Paștele (a 2-a zi)"],
    [f(5, 1), "Ziua Muncii"], [f(6, 1), "Ziua Copilului"], [tbcAdd(E, 49), "Rusaliile"], [tbcAdd(E, 50), "Rusaliile (a 2-a zi)"],
    [f(8, 15), "Adormirea Maicii Domnului"], [f(11, 30), "Sf. Andrei"], [f(12, 1), "Ziua Națională"],
    [f(12, 25), "Crăciunul"], [f(12, 26), "Crăciunul (a 2-a zi)"],
  ];
}

/* short names for holidays (in day cells and in the "upcoming" list); the full name stays in the day sheet */
const TBC_SHORT = [
  [/andrei/i, "Sf. Andrei"], [/național|national/i, "Ziua Națională"], [/unir/i, "Mica Unire"],
  [/boboteaz/i, "Boboteaza"], [/ioan/i, "Sf. Ioan"], [/vinerea/i, "Vinerea Mare"], [/pa[șs]t/i, "Paștele"],
  [/rusal|cincizecim/i, "Rusaliile"], [/adormirea|maria|maicii/i, "Sf. Maria"], [/copil/i, "Ziua Copilului"],
  [/muncii/i, "1 Mai"], [/cr[ăa]ciun/i, "Crăciunul"], [/anul nou/i, "Anul Nou"],
];
const tbcShort = (t) => { const m = TBC_SHORT.find(([r]) => r.test(t)); return m ? m[1] : t; };

class TbCal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const t = new Date();
    this._view = new Date(t.getFullYear(), t.getMonth(), 1);
    this._map = new Map();
    this._up = [];
    this._rep = "";
    this._h = 9; this._m = 0;
  }
  setConfig(c) {
    /* >>> EDIT: "reminders" = YOUR Local Calendar entity; "holidays" = optional holidays calendar */
    this._cfg = Object.assign({ holidays: "calendar.YOUR_HOLIDAYS_CALENDAR", reminders: "calendar.YOUR_REMINDERS_CALENDAR", days_ahead: 120 }, c || {});
  }
  set hass(h) {
    this._hass = h;
    if (!this._cfg) this.setConfig({});
    if (!this._built) this._build();
    const hol = this._holId();
    const sig = [hol, this._cfg.reminders].map((id) => (id && h.states[id] ? h.states[id].last_updated : "-")).join("|");
    if (sig !== this._sig) { this._sig = sig; this._load(); }
  }
  get hass() { return this._hass; }
  connectedCallback() {
    this._tm = setInterval(() => {
      const k = tbcKey(new Date());
      if (k !== this._today) { this._today = k; this._render(); }
    }, 60e3);
    this._tl = setInterval(() => this._load(), 10 * 60e3);
  }
  disconnectedCallback() { clearInterval(this._tm); clearInterval(this._tl); }
  _holId() {
    const h = this._hass, c = this._cfg;
    if (h.states[c.holidays]) return c.holidays;
    if (this._holAuto && h.states[this._holAuto]) return this._holAuto;
    const f = Object.keys(h.states).find((id) => id.startsWith("calendar.") && id !== c.reminders && /rom[aâ]nia|s[aă]rb[aă]tori|holiday/i.test(`${id} ${h.states[id].attributes.friendly_name || ""}`));
    this._holAuto = f || null;
    return this._holAuto;
  }
  $(id) { return this.shadowRoot.getElementById(id); }
  _build() {
    this._built = true;
    this._today = tbcKey(new Date());
    this.shadowRoot.innerHTML = `<style>${TBC_CSS}</style>
<div class="hd"><ha-icon icon="mdi:calendar-month"></ha-icon><span class="mo" id="mo"></span><span class="yr" id="yr"></span><span class="sp"></span>
<button class="tdb" id="tdb">Azi</button><button class="nb" id="pv"><ha-icon icon="mdi:chevron-left"></ha-icon></button><button class="nb" id="nx"><ha-icon icon="mdi:chevron-right"></ha-icon></button></div>
<div class="wk">${TBC_WD.map((w, i) => `<span class="${i > 4 ? "we" : ""}">${w}</span>`).join("")}</div>
<div class="gw" id="gw"><div class="gr" id="gr"></div></div>
<div class="up" id="up"></div>
<div class="ov" id="ov"><div class="sh" id="sh">
 <div class="shh"><div class="big" id="bg"></div><div><div class="shd" id="shd"></div><div class="sht" id="sht"></div></div><span class="sp"></span>
  <button class="x" id="x"><ha-icon icon="mdi:close"></ha-icon></button></div>
 <div class="sb">
  <div><div class="lbl">În această zi</div><div id="shl"></div></div>
  <div class="fm" id="fm">
   <div class="lbl" style="margin:0">Memento nou</div>
   <input class="in" id="ti" type="text" maxlength="120" placeholder="Ce vrei să-ți amintesc?" autocomplete="off">
   <div class="tr">
    <div class="tmw" id="tmw">
     <button class="st" data-s="h-1"><ha-icon icon="mdi:minus"></ha-icon></button><span class="tv" id="th">09</span><button class="st" data-s="h+1"><ha-icon icon="mdi:plus"></ha-icon></button>
     <span class="tc">:</span>
     <button class="st" data-s="m-5"><ha-icon icon="mdi:minus"></ha-icon></button><span class="tv" id="tmm">00</span><button class="st" data-s="m+5"><ha-icon icon="mdi:plus"></ha-icon></button>
    </div>
    <span class="sp"></span><button class="pl" id="ad">Toată ziua</button>
   </div>
   <div class="pills" id="qk">${["07:00", "09:00", "12:00", "15:00", "18:00", "20:00"].map((t) => `<button class="pl" data-t="${t}">${t}</button>`).join("")}</div>
   <div class="lbl" style="margin:2px 0 0">Repetă</div>
   <div class="pills" id="rp">${TBC_REP.map((r) => `<button class="pl" data-r="${r[0]}">${r[1]}</button>`).join("")}</div>
   <button class="sv" id="sv"><ha-icon icon="mdi:bell-plus-outline"></ha-icon>Adaugă memento</button>
   <div class="er" id="er"></div>
  </div>
 </div>
</div></div>`;
    this.$("pv").addEventListener("click", () => this._go(-1));
    this.$("nx").addEventListener("click", () => this._go(1));
    this.$("tdb").addEventListener("click", () => { const t = new Date(); const d = (t.getFullYear() - this._view.getFullYear()) * 12 + t.getMonth() - this._view.getMonth(); if (d) this._go(d); else this._open(tbcKey(t)); });
    this.$("gr").addEventListener("click", (e) => { const b = e.target.closest(".d"); if (b) this._open(b.dataset.d); });
    this.$("up").addEventListener("click", (e) => { const b = e.target.closest(".ui"); if (b) this._open(b.dataset.d); });
    const gw = this.$("gw");
    gw.addEventListener("touchstart", (e) => { this._tx = e.touches[0].clientX; this._ty = e.touches[0].clientY; }, { passive: true });
    gw.addEventListener("touchend", (e) => {
      if (this._tx === undefined) return;
      const dx = e.changedTouches[0].clientX - this._tx, dy = e.changedTouches[0].clientY - this._ty;
      this._tx = undefined;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) this._go(dx < 0 ? 1 : -1);
    }, { passive: true });
    this.$("ov").addEventListener("click", (e) => { if (e.target.id === "ov") this._close(); });
    this.$("x").addEventListener("click", () => this._close());
    this.$("tmw").addEventListener("click", (e) => {
      const b = e.target.closest(".st"); if (!b) return;
      const s = b.dataset.s, n = parseInt(s.slice(1), 10);
      if (s[0] === "h") this._h = (this._h + n + 24) % 24; else this._m = (this._m + n + 60) % 60;
      this._showTime();
    });
    this.$("qk").addEventListener("click", (e) => { const b = e.target.closest(".pl"); if (!b) return; const [h, m] = b.dataset.t.split(":").map(Number); this._h = h; this._m = m; this._allDay = false; this._showTime(); });
    this.$("ad").addEventListener("click", () => { this._allDay = !this._allDay; this._showTime(); });
    this.$("rp").addEventListener("click", (e) => { const b = e.target.closest(".pl"); if (!b) return; this._rep = b.dataset.r; this._showRep(); });
    this.$("sv").addEventListener("click", () => this._save());
    this.$("ti").addEventListener("keydown", (e) => { if (e.key === "Enter") this._save(); });
    this.$("shl").addEventListener("click", (e) => { const b = e.target.closest(".del"); if (b) this._del(b); });
    this._render();
  }
  _go(n) {
    this._view = new Date(this._view.getFullYear(), this._view.getMonth() + n, 1);
    this._slide = n > 0 ? "sl" : "sr";
    this._render();
    this._load();
  }
  _range() {
    const f = this._view;
    const start = tbcAdd(f, -((f.getDay() + 6) % 7));
    return [start, tbcAdd(start, 42)];
  }
  async _fetch(id, s, e) {
    if (!id || !this._hass.states[id]) return [];
    try {
      return (await this._hass.callApi("GET", `calendars/${id}?start=${encodeURIComponent(s.toISOString())}&end=${encodeURIComponent(e.toISOString())}`)) || [];
    } catch (err) {
      console.warn("tb-cal", id, err);
      return [];
    }
  }
  async _load() {
    if (!this._hass) return;
    const [g0, g1] = this._range();
    const t0 = tbcParse(tbcKey(new Date()));
    const s = g0 < t0 ? g0 : t0;
    const ahead = tbcAdd(t0, this._cfg.days_ahead);
    const e = g1 > ahead ? g1 : ahead;
    const req = (this._req = (this._req || 0) + 1);
    const holId = this._holId();
    const [hol0, rem] = await Promise.all([this._fetch(holId, s, e), this._fetch(this._cfg.reminders, s, e)]);
    let hol = hol0;
    if (!holId) {
      hol = [];
      for (let y = s.getFullYear(); y <= e.getFullYear(); y++)
        tbcRoHolidays(y).forEach(([d, n]) => { if (d >= s && d < e) hol.push({ summary: n, start: { date: tbcKey(d) }, end: { date: tbcKey(tbcAdd(d, 1)) } }); });
    }
    if (req !== this._req) return;
    const map = new Map(), all = [];
    const push = (k, it) => { if (!map.has(k)) map.set(k, []); map.get(k).push(it); };
    const ingest = (list, kind) => list.forEach((ev) => {
      const allDay = !!(ev.start && ev.start.date);
      const it = { kind, title: ev.summary || "(fără titlu)", allDay, uid: ev.uid, rid: ev.recurrence_id, rrule: ev.rrule, desc: ev.description };
      if (allDay) {
        let d = tbcParse(ev.start.date);
        const end = ev.end && ev.end.date ? tbcParse(ev.end.date) : tbcAdd(d, 1);
        it.key = tbcKey(d); it.ts = d.getTime();
        for (let i = 0; i < 40 && d < end; i++, d = tbcAdd(d, 1)) push(tbcKey(d), it);
      } else {
        const d = new Date(ev.start.dateTime);
        it.key = tbcKey(d); it.ts = d.getTime(); it.time = `${tbc2(d.getHours())}:${tbc2(d.getMinutes())}`;
        push(it.key, it);
      }
      all.push(it);
    });
    ingest(hol, "hol");
    ingest(rem, "rem");
    map.forEach((l) => l.sort((a, b) => (a.kind === b.kind ? (a.allDay === b.allDay ? a.ts - b.ts : a.allDay ? -1 : 1) : a.kind === "hol" ? -1 : 1)));
    const now = Date.now(), tk = tbcKey(new Date());
    this._up = all.filter((it) => (it.allDay ? it.key >= tk : it.ts >= now)).sort((a, b) => a.ts - b.ts || (a.kind === "hol" ? -1 : 1)).slice(0, 3);
    this._map = map;
    this._render(true);
    if (this._open_k) this._renderDay();
  }
  _render(quiet) {
    if (!this._built) return;
    const v = this._view, tk = tbcKey(new Date());
    this.$("mo").textContent = v.toLocaleDateString("ro-RO", { month: "long" });
    this.$("yr").textContent = v.getFullYear();
    const [g0] = this._range();
    let html = "";
    for (let i = 0; i < 42; i++) {
      const d = tbcAdd(g0, i), k = tbcKey(d);
      const items = this._map.get(k) || [];
      const hols = items.filter((x) => x.kind === "hol"), rems = items.filter((x) => x.kind === "rem");
      const cls = ["d", d.getMonth() !== v.getMonth() ? "ot" : "", i % 7 > 4 ? "we" : "", k === tk ? "td" : "", k < tk ? "past" : "", hols.length ? "hl" : ""].filter(Boolean).join(" ");
      const dots = rems.slice(0, 3).map(() => "<i></i>").join("") + (rems.length > 3 ? `<b>+${rems.length - 3}</b>` : "");
      html += `<button class="${cls}" data-d="${k}" style="animation-delay:${quiet ? 0 : (i * 0.012).toFixed(3)}s">
<span class="n">${d.getDate()}</span>${hols.length ? `<span class="hn">${tbcEsc(tbcShort(hols[0].title))}</span>` : ""}<span class="dots">${dots}</span></button>`;
    }
    const gr = this.$("gr");
    if (gr._h !== html) {
      gr._h = html;
      gr.innerHTML = html;
      if (quiet) gr.querySelectorAll(".d").forEach((b) => (b.style.animation = "none"));
    }
    if (this._slide) {
      gr.classList.remove("sl", "sr"); void gr.offsetWidth; gr.classList.add(this._slide); this._slide = null;
    }
    const up = this._up.map((it, i) => {
      const d = tbcParse(it.key);
      const days = Math.round((d - tbcParse(tk)) / 864e5);
      const rel = days === 0 ? "azi" : days === 1 ? "mâine" : `în ${days} zile`;
      const sub = it.kind === "hol" ? `Sărbătoare · ${rel}` : `${it.allDay ? "Toată ziua" : it.time} · ${rel}`;
      return `<button class="ui ${it.kind}" data-d="${it.key}" style="animation-delay:${i * 0.08}s"><div class="ub"><b>${d.getDate()}</b><small>${d.toLocaleDateString("ro-RO", { month: "short" }).replace(".", "")}</small></div>
<div class="ut"><span>${tbcEsc(it.kind === "hol" ? tbcShort(it.title) : it.title)}</span><small>${sub}</small></div></button>`;
    }).join("");
    const upEl = this.$("up");
    const uh = up || `<div class="upe">Niciun memento sau sărbătoare în următoarele ${this._cfg.days_ahead} zile — atinge o zi ca să adaugi unul.</div>`;
    if (upEl._h !== uh) { upEl._h = uh; upEl.innerHTML = uh; }
  }
  _open(k) {
    this._open_k = k;
    const d = tbcParse(k), isToday = k === tbcKey(new Date());
    this.$("bg").innerHTML = `<b>${d.getDate()}</b><small>${d.toLocaleDateString("ro-RO", { month: "short" }).replace(".", "")}</small>`;
    this.$("shd").textContent = isToday ? "Azi" : tbcCap(d.toLocaleDateString("ro-RO", { weekday: "long" }));
    this.$("sht").textContent = d.toLocaleDateString("ro-RO", { weekday: isToday ? "long" : undefined, day: "numeric", month: "long", year: "numeric" });
    if (isToday) { const n = new Date(); this._h = (n.getHours() + 1) % 24; this._m = 0; } else { this._h = 9; this._m = 0; }
    this._allDay = false; this._rep = "";
    this.$("ti").value = "";
    this.$("er").textContent = "";
    this._showTime(); this._showRep();
    this._renderDay();
    this.$("ov").classList.add("on");
  }
  _close() { this._open_k = null; this.$("ov").classList.remove("on"); }
  _showTime() {
    this.$("th").textContent = tbc2(this._h);
    this.$("tmm").textContent = tbc2(this._m);
    this.$("tmw").classList.toggle("off", !!this._allDay);
    this.$("ad").classList.toggle("on", !!this._allDay);
    const t = `${tbc2(this._h)}:${tbc2(this._m)}`;
    this.$("qk").querySelectorAll(".pl").forEach((b) => b.classList.toggle("on", !this._allDay && b.dataset.t === t));
  }
  _showRep() { this.$("rp").querySelectorAll(".pl").forEach((b) => b.classList.toggle("on", b.dataset.r === this._rep)); }
  _renderDay() {
    const items = this._map.get(this._open_k) || [];
    const repTxt = (r) => { const f = (TBC_REP.find((x) => x[0] && r && r.startsWith(x[0])) || [])[1]; return f ? ` · se repetă ${f.toLowerCase()}` : ""; };
    this.$("shl").innerHTML = items.length
      ? items.map((it, i) => it.kind === "hol"
        ? `<div class="li hol" style="animation-delay:${i * 0.05}s"><ha-icon icon="mdi:party-popper"></ha-icon><div class="lt"><b>${tbcEsc(it.title)}</b><small>Sărbătoare legală</small></div></div>`
        : `<div class="li rem" style="animation-delay:${i * 0.05}s"><ha-icon icon="mdi:bell-ring-outline"></ha-icon>${it.allDay ? "" : `<span class="tm">${it.time}</span>`}
<div class="lt"><b>${tbcEsc(it.title)}</b><small>${it.allDay ? "Toată ziua" : "Memento"}${repTxt(it.rrule)}</small></div>
<button class="del" data-uid="${tbcEsc(it.uid)}" data-rid="${tbcEsc(it.rid || "")}" data-rr="${it.rrule ? 1 : 0}" title="Șterge"><ha-icon icon="mdi:trash-can-outline"></ha-icon></button></div>`).join("")
      : `<div class="emp">Nimic programat. Adaugă un memento în dreapta.</div>`;
  }
  async _save() {
    const title = this.$("ti").value.trim(), er = this.$("er"), sv = this.$("sv");
    if (!title) { er.textContent = "Scrie mai întâi ce vrei să-ți amintesc."; this.$("ti").focus(); return; }
    const k = this._open_k, day = tbcParse(k);
    const ev = { summary: title };
    if (this._allDay) {
      ev.dtstart = k; ev.dtend = tbcKey(tbcAdd(day, 1));
    } else {
      const s = new Date(day.getFullYear(), day.getMonth(), day.getDate(), this._h, this._m);
      if (!this._rep && s.getTime() < Date.now() - 30e3) { er.textContent = "Ora aleasă a trecut deja."; return; }
      ev.dtstart = tbcIso(s); ev.dtend = tbcIso(new Date(s.getTime() + 15 * 60e3));
    }
    if (this._rep) ev.rrule = this._rep;
    er.textContent = ""; sv.disabled = true;
    try {
      await this._hass.callWS({ type: "calendar/event/create", entity_id: this._cfg.reminders, event: ev });
      this.$("ti").value = "";
      sv.classList.remove("ok"); void sv.offsetWidth; sv.classList.add("ok");
      await this._load();
    } catch (e) {
      er.textContent = `Nu am putut salva: ${e && e.message ? e.message : e}`;
    } finally { sv.disabled = false; }
  }
  async _del(b) {
    if (!b.classList.contains("arm")) {
      b.classList.add("arm");
      b.innerHTML = `<ha-icon icon="mdi:trash-can"></ha-icon>${b.dataset.rr === "1" ? "Șterge seria" : "Șterge"}`;
      clearTimeout(b._t); b._t = setTimeout(() => { b.classList.remove("arm"); b.innerHTML = '<ha-icon icon="mdi:trash-can-outline"></ha-icon>'; }, 3500);
      return;
    }
    clearTimeout(b._t);
    try {
      await this._hass.callWS({ type: "calendar/event/delete", entity_id: this._cfg.reminders, uid: b.dataset.uid });
      await this._load();
    } catch (e) {
      this.$("er").textContent = `Nu am putut șterge: ${e && e.message ? e.message : e}`;
    }
  }
}
customElements.get("tb-cal") || customElements.define("tb-cal", TbCal);

/* also as a standalone Lovelace card: type: custom:tb-cal-card */
class TbCalCard extends HTMLElement {
  setConfig(c) { this._c = c; if (this._cal) this._cal.setConfig(c); }
  set hass(h) {
    if (!this._cal) {
      const card = document.createElement("ha-card");
      card.style.cssText = "padding:12px 14px;height:460px;display:flex;flex-direction:column";
      this._cal = document.createElement("tb-cal");
      this._cal.setConfig(this._c);
      card.appendChild(this._cal);
      this.appendChild(card);
    }
    this._cal.hass = h;
  }
  getCardSize() { return 9; }
}
customElements.get("tb-cal-card") || customElements.define("tb-cal-card", TbCalCard);
