/* tb-mi.js — tap-to-history for all tablet cards.
 * Short tap on a display (sensor, value) -> HA more-info dialog with the entity history.
 * On a control (light, fullscreen camera) the tap controls it as before,
 * a long press (~0.5 s) opens the history. Buttons stay plain buttons.
 * Loaded after the cards (see tableta-cards.js); it decorates them without modifying them.
 */
(() => {
  if (window.__tbMi) return;
  window.__tbMi = 1;

  const CSS = `[data-mi], [data-mih] { cursor: pointer; }
[data-mi]:active, [data-mih]:active { filter: brightness(1.15); }`;

  const moreInfo = (node, id) => {
    if (!id) return;
    const ev = new Event("hass-more-info", { bubbles: true, composed: true });
    ev.detail = { entityId: id };
    node.dispatchEvent(ev);
  };

  /* set the attribute only if it changed */
  const set = (el, id, attr = "data-mi") => {
    if (el && typeof id === "string" && id && el.getAttribute(attr) !== id) el.setAttribute(attr, id);
  };

  function init(card) {
    const r = card.shadowRoot;
    const st = document.createElement("style");
    st.textContent = CSS;
    r.appendChild(st);
    let tm = null, held = false, sx = 0, sy = 0;
    const find = (ev) => {
      for (const el of ev.composedPath()) {
        if (el === r) break;
        if (el.nodeType === 1 && el.dataset && (el.dataset.mi || el.dataset.mih)) return el;
      }
      return null;
    };
    const cancel = () => clearTimeout(tm);
    r.addEventListener("pointerdown", (ev) => {
      held = false;
      const el = find(ev);
      if (!el) return;
      sx = ev.clientX;
      sy = ev.clientY;
      cancel();
      tm = setTimeout(() => {
        held = true;
        if (navigator.vibrate) navigator.vibrate(15);
        moreInfo(card, el.dataset.mi || el.dataset.mih);
      }, 550);
    });
    r.addEventListener("pointerup", cancel);
    r.addEventListener("pointercancel", cancel);
    r.addEventListener("pointermove", (ev) => {
      if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 12) cancel();
    });
    r.addEventListener("contextmenu", (ev) => {
      if (find(ev)) ev.preventDefault();
    });
    /* after a long press, the tap no longer triggers anything */
    r.addEventListener("click", (ev) => {
      if (held) {
        held = false;
        ev.stopPropagation();
        ev.preventDefault();
      }
    }, true);
    r.addEventListener("click", (ev) => {
      if (ev.defaultPrevented) return;
      for (const el of ev.composedPath()) {
        if (el === r) break;
        if (el.nodeType !== 1) continue;
        const t = el.tagName;
        if (t === "BUTTON" || t === "INPUT" || t === "SELECT" || t === "A" || (el.dataset && (el.dataset.k || el.dataset.mih))) return;
        if (el.dataset && el.dataset.mi) {
          moreInfo(card, el.dataset.mi);
          return;
        }
      }
    });
  }

  /* ---------- which entity each element has, per card ---------- */
  const byId = (card, map) => {
    const c = card._config;
    for (const [id, k0] of Object.entries(map)) {
      const up = k0.endsWith("^");
      const k = up ? k0.slice(0, -1) : k0;
      let el = card._e(id);
      if (el && up) el = el.parentElement;
      set(el, k.includes(".") ? k : c[k]);
    }
  };
  const nth = (root, sel, ids) => {
    if (!root) return;
    root.querySelectorAll(sel).forEach((el, i) => set(el, ids[i]));
  };

  const D = {
    "tb-acasa-card"(card) {
      byId(card, { tw: "temp^", cond: "weather", hout: "hum^", wind: "weather^", presc: "weather", rise: "sun^", set: "sun^", hourly: "weather", daily: "weather", sum: "summary", tick: "news" });
      nth(card._e("fxl"), ".fxr", (card._config.fx || []).map((f) => f.entity));
    },
    "tb-pv-card"(card) {
      const c = card._config;
      byId(card, {
        sun: "pv", t_pv: "pv", pa1: "pv1", pa2: "pv2", t_pv1: "pv1^", t_pv2: "pv2^", inv: "pv", t_invt: "inv_temp", house: "load", t_load: "load", t_house: "load",
        grid: "imp", t_grid: "imp", t_gridd: "exp", bat: "soc", t_bat: "bat", t_batv: "bat", d_prod: "prod_today", d_prod2: "fc_today", d_bar: "prod_today^", fcn: "fc_rem",
        r_t: "soc", b_e: "soc^", b_s: "bat_status^", b_p: "bat^", b_in: "bat_in^", b_out: "bat_out^", b_t: "bat_temp^", b_soh: "bat_soh^", b_m: "bat_mode^",
        i_m: "inv_model", i_t: "inv_temp^", i_sr: "self_ratio^", i_au: "load_today^", e_co2: "co2^", e_tr: "trees^",
      });
      nth(card._e("tiles"), ".tile", [c.load_today, c.self_today, c.imp_today, c.exp_today, c.load, c.imp]);
      nth(card._e("phases"), ".ph", (c.phases || []).map((p) => p[1]));
      const my = card._e("my");
      if (my) {
        const rows = [["prod_month", "prod_year"], ["load_month", "load_year"], ["imp_month", "imp_year"], ["exp_month", "exp_year"]];
        my.querySelectorAll("tr").forEach((tr, i) => {
          const td = tr.querySelectorAll("td");
          if (rows[i]) {
            set(td[1], c[rows[i][0]]);
            set(td[2], c[rows[i][1]]);
          }
        });
      }
    },
    "tb-heat-card"(card) {
      const c = card._config;
      byId(card, {
        flm: "demand", s_state: "demand", s_flow: "flow", s_ret: "ret", s_dt: "ret", lu: "pump_up", ld: "pump_down", n_c_m10: "c_m10", n_c_p15: "c_p15", c_calc: "flow_calc", c_des: "flow_des",
        tg_curve: "curve", tg_season: "season", g_v: "pressure", needle: "pressure", k_hwc: "hwc^", k_sto: "storage^", k_out: "out^", k_gas: "gas_total^",
        tg_ac: "ac_auto", n_ac_temp: "ac_temp", ac_inj: "inj", ac_n: "ac",
      });
      (c.zones || []).forEach((z, i) => {
        set(card._e(`z${i}`), z.climate);
        const zc = card._e(`zc${i}`);
        set(zc && zc.parentElement, z.temp || z.climate);
        set(card._e(`zh${i}`), z.hours);
      });
      nth(card._e("stats"), ".kv", (c.stats || []).map((s) => s[1]));
    },
    "tb-sensors-card"(card) {
      const c = card._config, h = card._hass;
      (c.climate || []).forEach((x, i) => set(card._e(`cl${i}`), x[1]));
      (c.openings || []).forEach((x, i) => set(card._e(`op${i}`), x[1]));
      (c.motion || []).forEach((x, i) => set(card._e(`mo${i}`), x[1]));
      (c.flood || []).forEach((x, i) => set(card._e(`fl${i}`), x[1]));
      nth(card._e("cams"), ".cam", (c.cameras || []).map((x) => x[1][0]));
      const w = card._e("water");
      if (w) {
        const wt = w.querySelector(".wt");
        if (wt) {
          const k = wt.children;
          set(k[0], c.water_flow);
          set(k[1], c.water_flow);
          set(k[2], c.water_total);
        }
        if (c.shower) nth(w, ".ws > div", [c.shower.day, c.shower.rest_day, c.shower.month, c.shower.rest_month]);
      }
      /* batteries are rebuilt by name: same calculation as in the card */
      const bl = card._e("bats");
      if (bl && h) {
        const ex = c.battery_exclude || [];
        const name = (s) =>
          s.replace(/\s*Battery Battery Level/i, "").replace(/\s*Battery level/i, "").replace(/\s*Battery Level/i, "").replace(/\s*Baterie$/i, "")
            .replace(/\s*\*?\s*$/, "").replace(/\s{2,}/g, " ").trim();
        const byName = new Map();
        Object.values(h.states)
          .filter((s) => s.entity_id.startsWith("sensor.") && s.attributes.device_class === "battery" && !ex.some((x) => s.entity_id.includes(x)))
          .forEach((s) => {
            const n = name(s.attributes.friendly_name || s.entity_id).toLowerCase();
            const v = parseFloat(s.state);
            const o = byName.get(n);
            if (!o || (!isFinite(o.v) && isFinite(v))) byName.set(n, { id: s.entity_id, v });
          });
        bl.querySelectorAll(".br").forEach((el) => {
          const nm = el.querySelector(".nm");
          const hit = nm && byName.get(nm.textContent.trim().toLowerCase());
          if (hit) set(el, hit.id);
        });
      }
    },
    "tb-power-card"(card) {
      const c = card._config;
      (c.plugs || []).forEach((p, i) => set(card._e(`pl${i}`), p.p || p.e || p.sw));
      (c.lights || []).forEach((l, i) => set(card._e(`lt${i}`), l.e, "data-mih"));
      nth(card._e("phs"), ".phc", (c.phases || []).map((p) => p[1]));
      set(card._e("house"), c.house);
    },
    "tb-vacuum-card"(card) {
      (card._config.robots || []).forEach((r, i) => {
        const p = `r${i}_`;
        const up = (id) => {
          const e = card._e(p + id);
          return e && e.parentElement;
        };
        set(card._e(p + "sc"), r.vacuum);
        set(up("st"), r.status);
        set(card._e(p + "bat"), r.battery);
        set(up("er"), r.error);
        set(card._e(p + "bs"), r.vacuum);
        set(up("k1"), r.last_end);
        set(up("k2"), r.clean_time);
        set(up("k5"), r.clean_area);
        set(up("k4"), r.total_count);
        set(card._e(p + "dnd"), r.dnd);
        (r.consumables || []).forEach((x, k) => set(card._e(p + "c" + k), x[1]));
      });
    },
    "tb-air-card"(card) {
      const c = card._config;
      const kvMap = (d) => ({ PM10: d.pm10, "Temperatură": d.temp, Umiditate: d.hum, "Turație": d.rpm, "AQI mediu": d.avg, "Aer purificat": d.volume, "Filtru folosit": d.filter_used, Calitate: d.pm25 });
      (c.purifiers || []).forEach((d, i) => {
        const k = `p${i}_`;
        const up = (id) => {
          const e = card._e(k + id);
          return e && e.parentElement;
        };
        set(up("v"), d.pm25);
        set(up("st"), d.power);
        set(card._e(k + "fl"), d.filter);
        set(up("ch"), d.pm25);
        set(card._e(k + "scr"), d.pm25);
        const kv = card._e(k + "kv");
        if (kv) {
          const m = kvMap(d);
          kv.querySelectorAll(":scope > div").forEach((el) => {
            const lb = el.querySelector("span");
            if (lb) set(el, m[lb.textContent.trim()]);
          });
        }
      });
      const d = c.dehum;
      if (d) {
        const up = (id) => {
          const e = card._e("d_" + id);
          return e && e.parentElement;
        };
        set(up("v"), d.hum);
        set(up("st"), d.humidifier);
        set(up("ch"), d.hum);
        set(card._e("d_scr"), d.hum);
      }
    },
    "tb-alarm-card"(card) {
      const c = card._config;
      byId(card, { sh: "alarm", big: "alarm", sub: "alarm" });
      (c.devices || []).forEach((d, i) => set(card._e(`dv${i}`), d[1]));
      (c.cameras || []).forEach((m, i) => set(card._e(`cm${i}`), m[1], "data-mih"));
      nth(card._e("chips"), ".chp", [c.conn, c.power, ...(c.persons || []).map((p) => p[1])]);
    },
  };

  for (const [tag, deco] of Object.entries(D)) {
    const cls = customElements.get(tag);
    if (!cls || cls.prototype.__tbMi) continue;
    cls.prototype.__tbMi = 1;
    const orig = cls.prototype._update;
    cls.prototype._update = function (...a) {
      const out = orig.apply(this, a);
      try {
        if (!this.__miInit && this.shadowRoot) {
          this.__miInit = 1;
          init(this);
        }
        deco(this);
      } catch (e) {
        /* do not break the card if something is missing */
      }
      return out;
    };
  }
})();
