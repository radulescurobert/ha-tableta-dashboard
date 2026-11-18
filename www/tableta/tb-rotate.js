/* Automatic tab rotation on the tablet (Fully Kiosk).
*  - moves to the next tab every 20 s
*  - after a touch / manual tab change it stays 60 s on the current tab
*  - does not rotate while a camera is open fullscreen
*  - skips the tabs listed in SKIP; does not rotate while the network map is open
*  - active only in Fully Kiosk (or with ?rotire=1 in the URL, for testing) and only on the tablet dashboard
*/
(() => {
if (window.__tbRotate) return;
window.__tbRotate = true;
/* >>> EDIT: URL path of YOUR tablet dashboard, with leading and trailing slash */
const DASH = "/YOUR-DASHBOARD-URL-PATH/";
const STEP = 20e3, HOLD = 60e3;
/* view "path" values excluded from rotation (they stay reachable by touch) */
const SKIP = ["tab-path-1", "tab-path-2"];
/* >>> EDIT: input_select helper used for fullscreen camera (see README) — or leave if you create it with this name */
const FS = "input_select.camera_fullscreen_tableta";
const q = new URLSearchParams(location.search);
const ua = navigator.userAgent;
const isTablet = typeof window.fully !== "undefined" || /fully|fkb/i.test(ua) || (/Android/.test(ua) && !/Home ?Assistant/i.test(ua)) || q.get("rotire") === "1";
if (!isTablet || q.get("rotire") === "0") return;
let holdUntil = Date.now() + HOLD;
let lastSwitch = Date.now();
let ownNav = false;
let paths = null;
const hassObj = () => {
const ha = document.querySelector("home-assistant");
return ha && ha.hass;
};
const hold = () => {
holdUntil = Date.now() + HOLD;
};
window.addEventListener("pointerdown", hold, true);
window.addEventListener("keydown", hold, true);
window.addEventListener("location-changed", () => {
if (!ownNav) hold();
});
window.addEventListener("popstate", hold);
async function loadPaths() {
const h = hassObj();
if (!h) return;
try {
const cfg = await h.connection.sendMessagePromise({ type: "lovelace/config", url_path: DASH.replace(/\//g, "") });
paths = (cfg.views || []).map((v, i) => [v, v.path || String(i)]).filter(([v, p]) => !v.subview && v.visible !== false && !SKIP.includes(p)).map(([, p]) => p);
} catch (e) {
paths = null;
}
}
function next() {
if (!location.pathname.startsWith(DASH)) return;
if (document.hidden) return;
if (window.__tbNoRotate) return; /* map/network list open */
const now = Date.now();
if (now < holdUntil || now - lastSwitch < STEP) return;
const h = hassObj();
if (!h) return;
const fs = h.states[FS];
if (fs && fs.state && fs.state !== "none") return;
if (!paths || !paths.length) return void loadPaths();
const cur = location.pathname.slice(DASH.length).split("/")[0];
const i = paths.indexOf(cur);
const nx = paths[(i + 1) % paths.length];
ownNav = true;
history.replaceState(null, "", DASH + nx);
window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: true } }));
ownNav = false;
lastSwitch = now;
}
setTimeout(loadPaths, 3000);
setInterval(loadPaths, 600e3);
setInterval(next, 1000);
})();
