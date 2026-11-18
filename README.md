# Tableta — dashboard pentru tabletă (Fully Kiosk) · export curățat

Dashboard cu carduri custom `tb-*` (Acasă, Fotovoltaic, Căldură, Senzori, Prize, Aspiratoare, Aer, Alarmă, Camere, Rețea, Muzică, F1).
Toate entitățile sunt înlocuite cu `YOUR_*`. Trebuie să le pui pe ale tale.

## Instalare
1. Copiază folderul `www/tableta/` în `/config/www/tableta/` (apare ca `/local/tableta/`).
2. Settings → Dashboards → Resources → adaugă `/local/tableta/tableta-cards.js?v=39`, tip **JavaScript module**.
3. HACS: instalează **kiosk-mode** și **card-mod**. Pentru view-ul F1: integrarea `f1_sensor` și cardurile ei (altfel șterge view-ul F1).
4. Creează un dashboard nou, deschide *Raw configuration editor* și lipește `dashboard.yaml`.
5. Caută ce ai de completat: `grep -rn "YOUR_" www/ dashboard.yaml`
6. După orice modificare de JS, crește `?v=` din resursă și reîncarcă tableta.

## Unde pui entitățile
Fiecare card are sus un comentariu și o funcție `static defaults()` cu valorile implicite. Orice cheie se poate suprascrie și din YAML-ul dashboardului.

| Card / fișier | Ce completezi |
|---|---|
| tb-acasa, tb-pv, tb-heat, tb-cal | entitățile din `defaults()` (meteo, invertor/baterie, centrală/camere, calendar) |
| tb-sensors (în dashboard.yaml) | `climate`: [nume, temperatură, umiditate, baterie, icon]; `battery_exclude` |
| tb-power (în dashboard.yaml) + defaults | `plugs`: p=putere, e=energie, v=tensiune, a=curent, sw=switch, spin=animație; plus consum casă, faze, lumini |
| tb-vacuum | robot(ți) `mk("YOUR_ROBOT_1", ...)` (integrare tip Xiaomi Miot / Dreame) și hărțile `image.*` |
| tb-air | purificatoare + dezumidificator (Xiaomi Miot) |
| tb-alarm | senzor stare alarmă, dispozitive, persoane, camere. Senzorul de stare trebuie să dea: `dezarmat / armat / noapte / alarmă / necunoscut`; dispozitivele: `OK / Alarmă / Sabotaj / Baterie slabă` |
| tb-net, tb-netmap | prefixele routerului/NAS, `NM_ROUTER_IP`, repetoare (ZHA pentru Zigbee) |
| tb-music | `config_entry_id` Music Assistant, boxa implicită, nume boxe. Radioul folosește Radio Browser (țara RO — schimbă în `_radioList()` și `TBM_RADIO_TOP`) |
| tb-gate | `script.YOUR_OPEN_GATE_SCRIPT` (buton poartă) |
| tb-rotate | `DASH` = url-ul dashboardului tău; rotește view-urile, doar în Fully Kiosk |
| Camere | 9 camere `camera.YOUR_CAMERA_n`; helper `input_select.camera_fullscreen_tableta` cu opțiunile `none, camera_1 … camera_9` |

## Note
- Textele sunt în română; le poți schimba direct în JS.
- Cardurile personale au fost scoase.
- `tb-core.js` e baza comună și `tb-mi.js` adaugă more-info la apăsare lungă; nu le modifica dacă nu ești sigur.
