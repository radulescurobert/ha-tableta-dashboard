/* "Open gate" button on the Sensors tab (patch over tb-sensors-card).
   Tap 1 = arm (4 s), tap 2 = runs the script below.
   >>> EDIT: set GATE to YOUR script entity (or pass `gate: script.xxx` in the card YAML). */
(() => {
  const GATE = "script.YOUR_OPEN_GATE_SCRIPT"; // <<< YOUR ENTITY
  const CSS = `
.gate { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border-radius: 14px; border: 1px solid color-mix(in srgb, #66bb6a 45%, transparent); background: color-mix(in srgb, #66bb6a 16%, transparent); color: var(--primary-text-color); font-family: inherit; font-weight: 700; font-size: 1.05rem; cursor: pointer; transition: background .2s, border-color .2s; }
.gate ha-icon { --mdc-icon-size: 26px; color: #66bb6a; }
.gate.arm { background: color-mix(in srgb, #ffa726 28%, transparent); border-color: #ffa726; animation: tbPulse 1s infinite; }
.gate.arm ha-icon { color: #ffa726; }
.gate.go { background: color-mix(in srgb, #29b6f6 26%, transparent); border-color: #29b6f6; }
.gate.go ha-icon { color: #29b6f6; }`;
  const apply = () => {
    const C = customElements.get("tb-sensors-card");
    if (!C || C.prototype.__gate) return !!C;
    const orig = C.prototype._build;
    C.prototype._build = function (...a) {
      const r = orig.apply(this, a);
      const root = this.shadowRoot;
      const cams = root && root.getElementById("cams");
      if (!cams || root.getElementById("gate")) return r;
      const st = document.createElement("style");
      st.textContent = CSS;
      root.appendChild(st);
      const pn = document.createElement("div");
      pn.className = "pn";
      pn.innerHTML = `<button class="gate" id="gate" type="button"><ha-icon icon="mdi:gate"></ha-icon><span id="gatet">Deschide poarta</span></button>`;
      const camPn = cams.closest(".pn");
      camPn.parentNode.insertBefore(pn, camPn);
      const g = pn.querySelector("#gate"), t = pn.querySelector("#gatet");
      let timer;
      const reset = () => { g.classList.remove("arm", "go"); t.textContent = "Deschide poarta"; };
      g.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (g.classList.contains("go")) return;
        clearTimeout(timer);
        if (!g.classList.contains("arm")) {
          g.classList.add("arm");
          t.textContent = "Atinge din nou ca să deschizi";
          timer = setTimeout(reset, 4000);
          return;
        }
        g.classList.remove("arm");
        g.classList.add("go");
        t.textContent = "Se deschide…";
        this._hass.callService("script", "turn_on", { entity_id: (this._config && this._config.gate) || GATE });
        timer = setTimeout(reset, 4000);
      });
      return r;
    };
    C.prototype.__gate = true;
    return true;
  };
  if (!apply()) customElements.whenDefined("tb-sensors-card").then(apply);
})();
