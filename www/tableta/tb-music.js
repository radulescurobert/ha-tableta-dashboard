/* ================================================================
*  MUSIC — Music Assistant (players + library)
*  custom:tb-music-card   (players = media_player entities that have the attribute mass_player_type)
*  >>> Edit defaults() below:
*   config_entry_id : the Music Assistant config entry id (Settings → Devices & services → Music Assistant → the URL contains it, or
*                     Developer tools → Actions → music_assistant.get_library lets you pick the integration and shows the id in YAML mode)
*   default_player  : media_player selected when nothing is playing
*   extra_players   : { "media_player.xxx": ["Label", "mdi:icon"] } players outside Music Assistant (radio only), e.g. the tablet itself
*   names           : { "media_player.xxx": ["Label", "mdi:icon"] } display name/icon for Music Assistant players
*  Radio list uses the Radio Browser integration (country RO by default: change "country/RO" in _radioList() and TBM_RADIO_TOP).
* ================================================================ */
const TB_MUSIC_CSS = `
.g { display: grid; grid-template-columns: 0.95fr 1.05fr; gap: 12px; height: 100%; }
.np { display: flex; flex-direction: column; padding: 16px 18px; color: #fff; border: none; background: #10131a; }
.np .bgart { position: absolute; inset: -40px; background-size: cover; background-position: center; filter: blur(46px) saturate(1.5) brightness(.55);
  opacity: .9; transition: background-image 1s; transform: scale(1.1); }
.np .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,12,18,.15), rgba(10,12,18,.75)); }
.np > *:not(.bgart):not(.shade) { position: relative; z-index: 1; }
.pls { display: flex; gap: 6px; flex-wrap: wrap; }
.cb, .pl, .cat { border: none; }
.pl { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-size: .8rem; font-weight: 700;
  background: rgba(255,255,255,.12); backdrop-filter: blur(8px); transition: background .25s, transform .15s; }
.pl ha-icon { --mdc-icon-size: 16px; }
.pl.on { background: #fff; color: #111; }
.pl:active { transform: scale(.94); }
.pl .eq { display: none; }
.pl.playing .eq { display: inline-flex; }
.stage { flex: 1 1 auto; min-height: 0; display: flex; align-items: center; justify-content: center; position: relative; margin: 10px 0 6px; }
.disc { position: absolute; height: 82%; aspect-ratio: 1; border-radius: 50%; left: 50%; transform: translateX(-42%);
  background: repeating-radial-gradient(circle, #111 0 2px, #1d1d1d 2px 4px); box-shadow: 0 10px 40px rgba(0,0,0,.6);
  transition: transform .9s cubic-bezier(.2,.8,.2,1); }
.disc::after { content: ""; position: absolute; inset: 36%; border-radius: 50%; background: var(--acc, #26c6da); box-shadow: inset 0 0 0 6px rgba(0,0,0,.35); }
.disc .spin { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, transparent 0 40%, rgba(255,255,255,.08) 45%, transparent 50% 90%, rgba(255,255,255,.06) 95%, transparent); }
.np.playing .disc { transform: translateX(-4%); }
.np.playing .disc .spin { animation: tbSpin 2.2s linear infinite; }
.art { position: relative; height: 82%; aspect-ratio: 1; border-radius: 18px; overflow: hidden; background: linear-gradient(140deg, #263238, #37474f);
  box-shadow: 0 18px 50px rgba(0,0,0,.55); display: grid; place-items: center; transition: transform .9s cubic-bezier(.2,.8,.2,1); }
.np.playing .art { transform: translateX(-24%); }
.art img { width: 100%; height: 100%; object-fit: cover; display: block; animation: tbFade .6s both; }
.art ha-icon { --mdc-icon-size: 72px; color: rgba(255,255,255,.35); }
.meta { text-align: center; min-height: 0; }
.ti { font-size: 1.45rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ar { font-size: .98rem; opacity: .8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.nx { font-size: .74rem; opacity: .6; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-height: 1em; }
.pr { display: flex; align-items: center; gap: 10px; font-size: .72rem; font-variant-numeric: tabular-nums; opacity: .85; margin: 10px 0 4px; }
.bar { flex: 1; height: 5px; border-radius: 5px; background: rgba(255,255,255,.18); overflow: hidden; }
.bar i { display: block; height: 100%; width: 0; border-radius: 5px; background: linear-gradient(90deg, var(--acc, #26c6da), #fff); transition: width 1s linear; }
.ct { display: flex; align-items: center; justify-content: center; gap: 14px; margin: 4px 0 8px; }
.cb { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.1); transition: transform .15s, background .2s; }
.cb ha-icon { --mdc-icon-size: 24px; }
.cb:active { transform: scale(.88); }
.cb.sm { width: 38px; height: 38px; background: none; opacity: .55; }
.cb.sm.on { opacity: 1; color: var(--acc, #26c6da); }
.cb.big { width: 68px; height: 68px; background: #fff; color: #111; box-shadow: 0 8px 26px rgba(0,0,0,.45); }
.cb.big ha-icon { --mdc-icon-size: 36px; }
.vol { display: flex; align-items: center; gap: 10px; }
.vol ha-icon { --mdc-icon-size: 20px; opacity: .8; }
input[type=range] { -webkit-appearance: none; appearance: none; flex: 1; height: 6px; border-radius: 6px; outline: none;
  background: linear-gradient(90deg, #fff var(--v, 50%), rgba(255,255,255,.2) var(--v, 50%)); }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.5); }
.vv { width: 3ch; text-align: right; font-size: .8rem; font-variant-numeric: tabular-nums; opacity: .85; }
.eq { gap: 2px; align-items: flex-end; height: 12px; }
.eq i { width: 3px; background: currentColor; border-radius: 2px; animation: mEq .9s ease-in-out infinite; }
.eq i:nth-child(2) { animation-delay: .2s; } .eq i:nth-child(3) { animation-delay: .4s; } .eq i:nth-child(4) { animation-delay: .1s; }
@keyframes mEq { 0%,100% { height: 25%; } 50% { height: 100%; } }
.lib { display: flex; flex-direction: column; }
.sr { position: relative; margin-bottom: 8px; }
.sr ha-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); --mdc-icon-size: 20px; color: var(--secondary-text-color); }
.sr input { width: 100%; font: inherit; font-size: .95rem; padding: 10px 12px 10px 40px; border-radius: 12px; outline: none; color: var(--primary-text-color);
  background: color-mix(in srgb, var(--primary-text-color) 6%, transparent); border: 1px solid transparent; transition: border-color .2s; }
.sr input:focus { border-color: var(--primary-color); }
.cats { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.cat { padding: 6px 12px; border-radius: 999px; font-size: .8rem; font-weight: 700; background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); transition: background .2s; }
.cat.on { background: var(--primary-color); color: var(--text-primary-color, #fff); }
.items { flex: 1 1 auto; min-height: 0; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 10px; align-content: start;
  -webkit-overflow-scrolling: touch; padding-bottom: 6px; }
.it { text-align: left; min-width: 0; animation: tbFade .4s both; background: none; border: none; padding: 0; color: inherit; }
.it .cv { aspect-ratio: 1; border-radius: 14px; overflow: hidden; position: relative; background: linear-gradient(140deg, #37474f, #263238); display: grid; place-items: center;
  box-shadow: 0 6px 16px rgba(0,0,0,.25); transition: transform .2s; }
.it.ra .cv { border-radius: 50%; }
.it .cv img { width: 100%; height: 100%; object-fit: cover; display: block; }
.it .cv ha-icon { --mdc-icon-size: 40px; color: rgba(255,255,255,.4); }
.it .cv .pb { position: absolute; right: 8px; bottom: 8px; width: 34px; height: 34px; border-radius: 50%; background: var(--primary-color); color: #fff;
  display: grid; place-items: center; opacity: 0; transform: translateY(6px); transition: opacity .2s, transform .2s; box-shadow: 0 4px 12px rgba(0,0,0,.4); }
.it .cv .pb ha-icon { --mdc-icon-size: 20px; color: #fff; }
.it:active .cv { transform: scale(.95); }
.it:active .cv .pb, .it.go .cv .pb { opacity: 1; transform: none; }
.it .n { font-size: .82rem; font-weight: 700; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.it .s { font-size: .7rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.items.radio { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 8px; }
.sec { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; font-size: .68rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
  color: var(--secondary-text-color); margin: 6px 2px 0; }
.sec::after { content: ""; flex: 1; height: 1px; background: color-mix(in srgb, var(--primary-text-color) 12%, transparent); }
.rr { display: flex; align-items: center; gap: 10px; padding: 8px 10px 8px 8px; border-radius: 14px; text-align: left;
  background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); border: 1px solid transparent; transition: background .2s, border-color .25s, transform .12s; }
.rr:active { transform: scale(.97); background: color-mix(in srgb, var(--primary-color) 18%, transparent); }
.rr .ini { flex: 0 0 auto; width: 36px; height: 36px; border-radius: 11px; display: grid; place-items: center; color: #fff; font-weight: 800; font-size: .95rem;
  background: linear-gradient(140deg, hsl(var(--h), 70%, 55%), hsl(calc(var(--h) + 40), 75%, 42%)); box-shadow: 0 3px 10px hsla(var(--h), 70%, 40%, .35); }
.rr .tx { flex: 1; min-width: 0; }
.rr .tx b { display: block; font-size: .86rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rr .tx small { font-size: .66rem; color: var(--secondary-text-color); }
.rr .tx small.pop { color: var(--primary-color); font-weight: 700; }
.rr .go { flex: 0 0 auto; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 14%, transparent); }
.rr .go ha-icon { --mdc-icon-size: 18px; }
.rr .go .eq { display: none; height: 12px; color: var(--primary-color); }
.rr.on { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 12%, transparent); }
.rr.on .go ha-icon { display: none; }
.rr.on .go .eq { display: inline-flex; }
.emp { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; text-align: center;
  color: var(--secondary-text-color); padding: 30px 20px; font-size: .9rem; line-height: 1.4; }
.emp ha-icon { --mdc-icon-size: 54px; opacity: .45; animation: wxFloatM 3s ease-in-out infinite; }
@keyframes wxFloatM { 50% { transform: translateY(-6px); } }
.toast { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%) translateY(20px); opacity: 0; pointer-events: none; z-index: 5;
  background: rgba(20,20,20,.92); color: #fff; padding: 8px 16px; border-radius: 999px; font-size: .82rem; transition: opacity .25s, transform .25s; }
.toast.on { opacity: 1; transform: translateX(-50%); }
@media (max-width: 899px), (orientation: portrait) { .g { grid-template-columns: 1fr; } .np { min-height: 560px; } .lib { min-height: 520px; } }
`;
const TBM_CATS = [["playlist", "Playlisturi", "mdi:playlist-music", "playlists"], ["album", "Albume", "mdi:album", "albums"], ["artist", "Artiști", "mdi:account-music", "artists"], ["track", "Melodii", "mdi:music-note", "tracks"], ["radio", "Radio", "mdi:radio", "radio"]];
/* Romanian stations pinned first (matched by name, without diacritics). Replace with the stations popular in your country. */
const TBM_RADIO_TOP = ["europa fm", "kiss fm ro", "kiss fm 107", "magic fm", "digi fm", "rock fm", "virgin radio romania", "radio romania actualitati", "radio romania cultural",
  "radio romania muzical", "antena satelor", "radio guerrilla", "radio trinitas", "dance fm", "national fm", "itsy bitsy", "bucuresti fm", "romantic fm",
  "gold fm", "free fm", "vibe fm", "jazz fm romania", "pro fm"];
const tbmNorm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const tbmT = (s) => { s = Math.max(0, Math.round(s || 0)); const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, "0")}`; };

class TbMusicCard extends TbBase {
  static defaults() {
    return { config_entry_id: "YOUR_MUSIC_ASSISTANT_CONFIG_ENTRY_ID", default_player: "media_player.YOUR_DEFAULT_SPEAKER", limit: 80,
      /* players outside Music Assistant (radio only), e.g. the tablet running Fully Kiosk */
      extra_players: {},
      /* display name and icon for Music Assistant players */
      names: { "media_player.YOUR_TABLET_PLAYER": ["Tablet", "mdi:tablet"], "media_player.YOUR_TV": ["Living TV", "mdi:television"], "media_player.YOUR_VOICE_ASSISTANT": ["Voice Assistant", "mdi:microphone-variant"] } };
  }
  _build() {
    this._cat = "album";
    this._q = "";
    try { this._sel = localStorage.getItem("tbm_player") || null; } catch (e) { this._sel = null; }
    this.shadowRoot.innerHTML = `<style>${TB_BASE_CSS}${TB_MUSIC_CSS}</style>
<ha-card><div class="g">
<div class="pn np" id="np"><div class="bgart" id="bgart"></div><div class="shade"></div>
 <div class="pt" style="color:rgba(255,255,255,.7)"><ha-icon icon="mdi:speaker-wireless"></ha-icon>Unde cânt<span class="sp"></span><span class="note" id="pst"></span></div>
 <div class="pls" id="pls"></div>
 <div class="stage"><div class="disc"><div class="spin"></div></div><div class="art" id="art"><ha-icon icon="mdi:music"></ha-icon></div></div>
 <div class="meta"><div class="ti" id="ti">Nimic nu cântă</div><div class="ar" id="ar">Alege ceva din bibliotecă</div><div class="nx" id="nx"></div></div>
 <div class="pr"><span id="pc">0:00</span><div class="bar"><i id="pb"></i></div><span id="pd">0:00</span></div>
 <div class="ct">
  <button class="cb sm" id="sh" title="Amestecă"><ha-icon icon="mdi:shuffle-variant"></ha-icon></button>
  <button class="cb" id="pv"><ha-icon icon="mdi:skip-previous"></ha-icon></button>
  <button class="cb big" id="pp"><ha-icon icon="mdi:play"></ha-icon></button>
  <button class="cb" id="nxb"><ha-icon icon="mdi:skip-next"></ha-icon></button>
  <button class="cb sm" id="rp" title="Repetă"><ha-icon icon="mdi:repeat-off"></ha-icon></button>
 </div>
 <div class="vol"><ha-icon id="vic" icon="mdi:volume-medium"></ha-icon><input type="range" id="vr" min="0" max="100" step="1"><span class="vv" id="vv"></span></div>
</div>
<div class="pn lib">
 <div class="pt"><ha-icon icon="mdi:bookshelf"></ha-icon>Biblioteca de muzică<span class="sp"></span><span class="note" id="cnt"></span></div>
 <div class="sr"><ha-icon icon="mdi:magnify"></ha-icon><input id="q" type="search" placeholder="Caută artist, album, melodie…" autocomplete="off"></div>
 <div class="cats" id="cats">${TBM_CATS.map(([k, n, i]) => `<button class="cat${k === this._cat ? " on" : ""}" data-c="${k}">${n}</button>`).join("")}</div>
 <div class="items" id="items"></div>
</div>
</div><div class="toast" id="toast"></div></ha-card>`;
    const $ = (id) => this._e(id);
    $("pls").addEventListener("click", (e) => { const b = e.target.closest(".pl"); if (!b) return; this._sel = b.dataset.e; try { localStorage.setItem("tbm_player", this._sel); } catch (x) {} this._update(); });
    $("pp").addEventListener("click", () => {
      if (this._isMA(this._sel)) return this._mp("media_play_pause");
      /* the tablet (Fully Kiosk) doesn't report its state reliably — we remember ourselves whether we started something on it */
      if (this._xplay && this._xplay[this._sel]) { this._xplay[this._sel] = false; this._mp("media_stop"); this._update(); return; }
      this._toast("Alege un post de radio din listă");
    });
    $("pv").addEventListener("click", () => this._mp("media_previous_track"));
    $("nxb").addEventListener("click", () => this._mp("media_next_track"));
    $("sh").addEventListener("click", () => { const s = this._st(); if (s) this._mp("shuffle_set", { shuffle: !s.attributes.shuffle }); });
    $("rp").addEventListener("click", () => { const s = this._st(); if (!s) return; const r = s.attributes.repeat || "off"; this._mp("repeat_set", { repeat: r === "off" ? "all" : r === "all" ? "one" : "off" }); });
    const vr = $("vr");
    vr.addEventListener("input", () => { this._vdrag = true; this._showVol(vr.value / 100); });
    vr.addEventListener("change", () => { this._mp("volume_set", { volume_level: vr.value / 100 }); setTimeout(() => (this._vdrag = false), 1500); });
    $("cats").addEventListener("click", (e) => { const b = e.target.closest(".cat"); if (!b) return; this._cat = b.dataset.c; this.shadowRoot.querySelectorAll(".cat").forEach((c) => c.classList.toggle("on", c === b)); this._loadLib(); });
    $("q").addEventListener("input", () => { clearTimeout(this._qt); this._qt = setTimeout(() => { this._q = $("q").value.trim(); this._loadLib(); }, 450); });
    $("items").addEventListener("click", (e) => { const b = e.target.closest(".it"); if (b) this._play(b); });
  }
  _onStart() {
    this._every(1000, () => this._tick());
    this._loadLib();
  }
  _players() {
    const h = this._hass;
    const ma = Object.keys(h.states).filter((id) => id.startsWith("media_player.") && h.states[id].attributes.mass_player_type !== undefined && h.states[id].state !== "unavailable")
      .sort((a, b) => (h.states[a].attributes.friendly_name || a).localeCompare(h.states[b].attributes.friendly_name || b));
    const ex = Object.keys(this._config.extra_players || {}).filter((id) => h.states[id] && h.states[id].state !== "unavailable");
    return ma.concat(ex);
  }
  _isMA(id) { const s = id && this._hass.states[id]; return !!(s && s.attributes.mass_player_type !== undefined); }
  _pname(id) { const x = (this._config.extra_players || {})[id] || (this._config.names || {})[id]; return x ? x[0] : (this._hass.states[id].attributes.friendly_name || id); }
  _st() { return this._sel ? this._hass.states[this._sel] : null; }
  _mp(service, data = {}) {
    if (!this._sel) return;
    return this._hass.callService("media_player", service, Object.assign({ entity_id: this._sel }, data)).catch((e) => this._toast(`Eroare: ${e.message || e}`));
  }
  _toast(t) {
    const el = this._e("toast"); el.textContent = t; el.classList.add("on");
    clearTimeout(this._tt); this._tt = setTimeout(() => el.classList.remove("on"), 2600);
  }
  _showVol(v) {
    const p = Math.round((v || 0) * 100);
    this._e("vv").textContent = p;
    this._e("vr").style.setProperty("--v", `${p}%`);
    this._a("vic", "icon", p === 0 ? "mdi:volume-off" : p < 35 ? "mdi:volume-low" : p < 70 ? "mdi:volume-medium" : "mdi:volume-high");
  }
  _update() {
    const h = this._hass;
    const pl = this._players();
    if (!this._sel || !pl.includes(this._sel)) {
      const playing = pl.find((id) => h.states[id].state === "playing");
      this._sel = playing || (pl.includes(this._config.default_player) ? this._config.default_player : pl[0]) || null;
    }
    this._h("pls", pl.length ? pl.map((id) => {
      const s = h.states[id], on = id === this._sel, play = s.state === "playing";
      const xp = (this._config.extra_players || {})[id] || (this._config.names || {})[id];
      const ic = xp ? xp[1] : (s.attributes.friendly_name || "").match(/voice/i) ? "mdi:microphone-variant" : s.attributes.device_class === "tv" ? "mdi:television" : "mdi:speaker";
      return `<button class="pl${on ? " on" : ""}${play ? " playing" : ""}" data-e="${id}"><ha-icon icon="${ic}"></ha-icon>${tbEsc(this._pname(id))}<span class="eq"><i></i><i></i><i></i><i></i></span></button>`;
    }).join("") : '<span class="mut" style="color:rgba(255,255,255,.6)">Nicio boxă disponibilă în Music Assistant.</span>');
    const s = this._st();
    let a = s ? s.attributes : {};
    const ma = this._isMA(this._sel);
    const playing = !!(s && (s.state === "playing" || (!ma && this._xplay && this._xplay[this._sel])));
    this._c("np", "playing", playing);
    ["pv", "nxb", "sh", "rp"].forEach((id) => { const e = this._e(id); e.style.opacity = ma ? "" : ".25"; e.style.pointerEvents = ma ? "" : "none"; });
    this._t("pst", s ? ({ playing: "redă", paused: "pauză", idle: "liber", off: "oprit" }[s.state] || s.state) : "");
    if (!ma && playing && this._radioName && !a.media_title) a = Object.assign({}, a, { media_title: this._radioName, media_artist: "Radio" });
    const has = s && a.media_title;
    this._t("ti", has ? a.media_title : "Nimic nu cântă");
    this._t("ar", has ? [a.media_artist, a.media_album_name].filter(Boolean).join(" · ") : "Alege ceva din bibliotecă");
    const pic = has ? a.entity_picture || "" : "";
    if (pic !== this._pic) {
      this._pic = pic;
      this._e("art").innerHTML = pic ? `<img src="${tbEsc(pic)}" alt="">` : '<ha-icon icon="mdi:music"></ha-icon>';
      this._e("bgart").style.backgroundImage = pic ? `url("${pic.replace(/"/g, "%22")}")` : "radial-gradient(circle at 30% 30%, #1e3c72, #10131a 70%)";
    }
    this._h("pp", `<ha-icon icon="${playing ? "mdi:pause" : "mdi:play"}"></ha-icon>`);
    this._c("sh", "on", !!a.shuffle);
    this._c("rp", "on", a.repeat && a.repeat !== "off");
    this._h("rp", `<ha-icon icon="${a.repeat === "one" ? "mdi:repeat-once" : a.repeat === "all" ? "mdi:repeat" : "mdi:repeat-off"}"></ha-icon>`);
    if (!this._vdrag && a.volume_level !== undefined) { this._e("vr").value = Math.round(a.volume_level * 100); this._showVol(a.volume_level); }
    this._tick();
    const qk = s ? `${this._sel}|${a.media_content_id || ""}` : "";
    if (qk !== this._qk) { this._qk = qk; this._loadNext(); }
  }
  _tick() {
    const s = this._st();
    if (!s) return;
    const a = s.attributes, dur = a.media_duration || 0;
    let pos = a.media_position || 0;
    if (s.state === "playing" && a.media_position_updated_at) pos += (Date.now() - new Date(a.media_position_updated_at).getTime()) / 1000;
    pos = Math.min(pos, dur || pos);
    this._t("pc", tbmT(pos));
    this._t("pd", dur ? tbmT(dur) : "—");
    this._e("pb").style.width = dur ? `${((pos / dur) * 100).toFixed(2)}%` : "0%";
  }
  async _ws(service, data, target) {
    const msg = { type: "call_service", domain: "music_assistant", service, service_data: data, return_response: true };
    if (target) msg.target = target;
    const r = await this._hass.callWS(msg);
    return r && r.response;
  }
  async _loadNext() {
    this._t("nx", "");
    if (!this._sel) return;
    try {
      const r = await this._ws("get_queue", {}, { entity_id: this._sel });
      const q = r && r[this._sel];
      const n = q && q.next_item;
      const mi = n && (n.media_item || n);
      if (mi && mi.name) this._t("nx", `Urmează: ${mi.name}${mi.artists && mi.artists[0] ? ` — ${mi.artists[0].name}` : ""}`);
    } catch (e) { /* queue not available */ }
  }
  async _loadLib() {
    if (!this._hass) return;
    const cat = TBM_CATS.find((c) => c[0] === this._cat);
    const req = (this._lreq = (this._lreq || 0) + 1);
    this._c("items", "radio", cat[0] === "radio");
    this._h("items", '<div class="emp"><ha-icon icon="mdi:loading" style="animation:tbSpin 1s linear infinite"></ha-icon></div>');
    let items = [];
    try {
      if (cat[0] === "radio") {
        items = await this._radioList();
        if (this._q) { const q = tbmNorm(this._q); items = items.filter((it) => it._n.includes(q)); }
        else items = items.slice(0, 160);
      } else if (this._q) {
        const r = await this._ws("search", { config_entry_id: this._config.config_entry_id, name: this._q, media_type: [cat[0]], limit: this._config.limit });
        items = (r && r[cat[3]]) || [];
      } else {
        const r = await this._ws("get_library", { config_entry_id: this._config.config_entry_id, media_type: cat[0], limit: this._config.limit, order_by: "name" });
        items = (r && r.items) || [];
      }
    } catch (e) {
      if (req !== this._lreq) return;
      this._h("items", `<div class="emp"><ha-icon icon="mdi:alert-circle-outline"></ha-icon>Nu am putut încărca biblioteca.<br><small>${tbEsc(e.message || e)}</small></div>`);
      return;
    }
    if (req !== this._lreq) return;
    this._items = items;
    this._t("cnt", cat[0] === "radio" ? `${(this._radio || []).length} posturi din România` : items.length ? `${items.length} ${cat[1].toLowerCase()}` : "");
    if (!items.length) {
      this._h("items", `<div class="emp"><ha-icon icon="${cat[2]}"></ha-icon>${this._q ? `Nimic găsit pentru „${tbEsc(this._q)}”.` : cat[0] === "radio" ? "Nu am putut încărca posturile de radio." : `Nu ai încă ${cat[1].toLowerCase()} în bibliotecă.<br>Adaugă muzica ta în Music Assistant și apare aici.`}</div>`);
      return;
    }
    if (cat[0] === "radio") {
      const hue = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
      const row = (it, i) => {
        const ini = (it.name.replace(/^radio\s+/i, "").match(/[A-Za-zĂÂÎȘȚăâîșț0-9]/) || ["♪"])[0].toUpperCase();
        const on = this._radioOn && this._radioOn === it.uri;
        return `<button class="it rr${on ? " on" : ""}" data-i="${i}" style="--h:${hue(it._n)};animation-delay:${Math.min(i, 30) * 0.015}s">
<span class="ini">${tbEsc(ini)}</span><span class="tx"><b>${tbEsc(it.name)}</b><small class="${it._sub ? "pop" : ""}">${it._sub ? "★ Popular" : "Radio · România"}</small></span>
<span class="go"><ha-icon icon="mdi:play"></ha-icon><span class="eq"><i></i><i></i><i></i><i></i></span></span></button>`;
      };
      const top = items.map((it, i) => [it, i]).filter(([it]) => it._sub);
      const rest = items.map((it, i) => [it, i]).filter(([it]) => !it._sub);
      let html = "";
      if (top.length) html += `<div class="sec">Populare</div>` + top.map(([it, i]) => row(it, i)).join("");
      if (rest.length) html += `<div class="sec">${this._q ? "Rezultate" : "Toate posturile A–Z"}</div>` + rest.map(([it, i]) => row(it, i)).join("");
      this._h("items", html);
      return;
    }
    this._h("items", items.map((it, i) => {
      const img = typeof it.image === "string" ? it.image : it.image && (it.image.path || it.image.url);
      const sub = it._sub !== undefined ? it._sub : it.artists && it.artists.length ? it.artists.map((x) => x.name).join(", ") : it.owner || (it.album && it.album.name) || "";
      return `<button class="it${cat[0] === "artist" || cat[0] === "radio" ? " ra" : ""}" data-i="${i}" style="animation-delay:${Math.min(i, 30) * 0.02}s">
<div class="cv">${img ? `<img loading="lazy" referrerpolicy="no-referrer" src="${tbEsc(img)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('ha-icon'),{icon:'${cat[2]}'}))">` : `<ha-icon icon="${cat[2]}"></ha-icon>`}<span class="pb"><ha-icon icon="mdi:play"></ha-icon></span></div>
<div class="n">${tbEsc(it.name)}</div><div class="s">${tbEsc(sub)}</div></button>`;
    }).join(""));
  }
  /* Stations from the Radio Browser integration (media source), without duplicates, popular ones first */
  async _radioList() {
    if (this._radio && Date.now() - this._radioT < 6 * 3600e3) return this._radio;
    const r = await this._hass.callWS({ type: "media_source/browse_media", media_content_id: "media-source://radio_browser/country/RO" });
    const seen = new Map();
    (r.children || []).filter((c) => c.can_play).forEach((c) => {
      const n = tbmNorm(c.title);
      if (!n) return;
      const prev = seen.get(n);
      if (!prev || (!prev.image && c.thumbnail)) seen.set(n, { name: c.title.trim(), uri: c.media_content_id, image: c.thumbnail || null, _radio: true, _n: n, _sub: "" });
    });
    const all = [...seen.values()];
    const top = [];
    TBM_RADIO_TOP.forEach((k) => { const it = all.find((x) => x._n.startsWith(k) && !top.includes(x)); if (it) { it._sub = "Popular"; top.push(it); } });
    const rest = all.filter((x) => !top.includes(x)).sort((a, b) => a._n.localeCompare(b._n));
    this._radio = top.concat(rest);
    this._radioT = Date.now();
    return this._radio;
  }
  async _play(b) {
    const it = (this._items || [])[+b.dataset.i];
    if (!it || !this._sel) return;
    if (!it._radio && !this._isMA(this._sel)) return this._toast("Pe tabletă merge deocamdată doar radioul");
    b.classList.add("go"); setTimeout(() => b.classList.remove("go"), 1200);
    try {
      if (it._radio) {
        await this._hass.callService("media_player", "play_media", { entity_id: this._sel, media_content_id: it.uri, media_content_type: "music" });
        this._radioOn = it.uri;
        this._radioName = it.name;
        if (!this._isMA(this._sel)) { this._xplay = this._xplay || {}; this._xplay[this._sel] = true; this._update(); }
        this.shadowRoot.querySelectorAll(".rr").forEach((r) => r.classList.toggle("on", r === b));
      }
      else await this._hass.callService("music_assistant", "play_media", { entity_id: this._sel, media_id: it.uri, media_type: it.media_type || this._cat, enqueue: "replace" });
      const n = this._hass.states[this._sel];
      this._toast(`▶ ${it.name} pe ${n ? this._pname(this._sel) : this._sel}`);
    } catch (e) {
      this._toast(`Nu am putut reda: ${e.message || e}`);
    }
  }
}
customElements.get("tb-music-card") || customElements.define("tb-music-card", TbMusicCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "tb-music-card", name: "Tablet · Music", description: "Music Assistant players, library and radio" });
