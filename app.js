// app.js — glue: state <-> URL hash, controls, panel, share, confetti, shortcuts.

const $ = (id) => document.getElementById(id);
const ALL_IDS = MATCHES.map((m) => m.id);

const state = {
  professionKey: "swe",
  reveal: true,   // default: toggle OFF = real fixtures shown; toggle ON disguises them
  selected: new Set(ALL_IDS),
  theme: "dark",
  focusId: null,
};

// ---------- URL hash (shareable state) ----------
function readHash() {
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get("p") && PROFESSIONS.some((p) => p.key === h.get("p"))) state.professionKey = h.get("p");
  if (h.has("r")) state.reveal = h.get("r") === "1";
  if (h.get("t") === "light") state.theme = "light";
  const s = h.get("s");
  if (s === "none") state.selected = new Set();
  else if (s && s !== "all") state.selected = new Set(s.split(",").map(Number).filter((n) => ALL_IDS.includes(n)));
}
function writeHash() {
  const h = new URLSearchParams();
  h.set("p", state.professionKey);
  h.set("r", state.reveal ? "1" : "0");
  if (state.theme === "light") h.set("t", "light");
  if (state.selected.size === 0) h.set("s", "none");
  else if (state.selected.size !== ALL_IDS.length) h.set("s", [...state.selected].join(","));
  history.replaceState(null, "", "#" + h.toString());
}

// ---------- render ----------
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  $("theme").textContent = state.theme === "dark" ? "🌙" : "☀️";
}
function refreshBracket() {
  Bracket.refresh({ professionKey: state.professionKey, reveal: state.reveal, selected: state.selected });
  updateSelCount();
}
function updateSelCount() {
  const n = state.selected.size;
  $("selcount").textContent =
    n === ALL_IDS.length ? `All ${n} matches selected` :
    n === 0 ? "No matches selected" : `${n} of ${ALL_IDS.length} matches selected`;
}
// Switch ON = disguised (reveal=false); OFF = real fixtures shown (reveal=true).
function syncSwitch() {
  $("disguise-toggle").checked = !state.reveal;
  $("switch-text").textContent = state.reveal ? "👀 Revealed" : "🕵️ Disguised";
}

// ---------- profession dropdown ----------
function buildProfessions() {
  const sel = $("profession");
  PROFESSIONS.forEach((p) => {
    const o = document.createElement("option");
    o.value = p.key; o.textContent = `${p.emoji}  ${p.name}`;
    sel.appendChild(o);
  });
  sel.value = state.professionKey;
}

// ---------- invite panel ----------
let panelMatchId = null;
function openPanel(id) {
  const m = MATCHES.find((x) => x.id === id);
  if (!m) return;
  panelMatchId = id;
  state.focusId = id;
  Bracket.focus(id);
  const inv = inviteFor(m, state.professionKey, state.reveal);
  $("panel-round").textContent = `${ROUND_NAMES[m.round]} · Match ${m.id}`;
  $("panel-title").textContent = inv.title;
  $("panel-loc").textContent = `📍 ${inv.location}`;
  $("panel-desc").textContent = inv.description;
  $("panel-real").innerHTML = `<strong>🤫 Actually:</strong> ${inv.real}`;
  $("panel-card").querySelector(".stamp").style.display = state.reveal ? "none" : "";
  $("panel-include-cb").checked = state.selected.has(id);
  $("panel").classList.add("open");
  $("panel").setAttribute("aria-hidden", "false");
}
function closePanel() {
  $("panel").classList.remove("open");
  $("panel").setAttribute("aria-hidden", "true");
}

// ---------- toast ----------
let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

// ---------- confetti ----------
function celebrate() {
  const c = $("confetti");
  c.classList.add("go");
  const ctx = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const colors = ["#34d399", "#f5c518", "#6ea8fe", "#a78bfa", "#ff6b6b"];
  const bits = Array.from({ length: 140 }, () => ({
    x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.4,
    r: 4 + Math.random() * 6, c: colors[(Math.random() * colors.length) | 0],
    vy: 2 + Math.random() * 4, vx: -2 + Math.random() * 4, a: Math.random() * Math.PI, va: -0.2 + Math.random() * 0.4,
  }));
  let frames = 0;
  (function tick() {
    ctx.clearRect(0, 0, c.width, c.height);
    bits.forEach((b) => {
      b.x += b.vx; b.y += b.vy; b.a += b.va;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
      ctx.fillStyle = b.c; ctx.fillRect(-b.r / 2, -b.r / 2, b.r, b.r * 1.6); ctx.restore();
    });
    if (frames++ < 150) requestAnimationFrame(tick);
    else { ctx.clearRect(0, 0, c.width, c.height); c.classList.remove("go"); }
  })();
}

// ---------- actions ----------
function doDownload() {
  const chosen = MATCHES.filter((m) => state.selected.has(m.id));
  if (!chosen.length) { toast("Pick at least one match first 🙂"); return; }
  downloadICS(chosen, state.professionKey, state.reveal);
  celebrate();
  toast(`You're covered 🎉 ${chosen.length} meeting${chosen.length > 1 ? "s" : ""} added`);
}
async function doShare() {
  writeHash();
  const url = location.href;
  try { await navigator.clipboard.writeText(url); toast("Share link copied 🔗"); }
  catch { toast("Copy this: " + url); }
}
function setDisguised(disguised) {
  state.reveal = !disguised;
  syncSwitch();
  $("bracket").classList.add("decoding");
  setTimeout(() => $("bracket").classList.remove("decoding"), 500);
  refreshBracket(); writeHash();
  if (panelMatchId != null && $("panel").classList.contains("open")) openPanel(panelMatchId);
  toast(disguised ? "🕵️ Disguised — meetings on" : "👀 Cover off — real fixtures shown");
}
function flipDisguise() { setDisguised(state.reveal /* currently revealed -> disguise */); }

// ---------- wire up ----------
function init() {
  readHash();
  applyTheme();
  buildProfessions();
  Bracket.render($("bracket"), { professionKey: state.professionKey, reveal: state.reveal, selected: state.selected, onSelect: openPanel });
  updateSelCount();
  syncSwitch();

  $("profession").addEventListener("change", (e) => { state.professionKey = e.target.value; refreshBracket(); writeHash(); if ($("panel").classList.contains("open")) openPanel(panelMatchId); });
  $("disguise-toggle").addEventListener("change", (e) => setDisguised(e.target.checked));
  $("download").addEventListener("click", doDownload);
  $("share").addEventListener("click", doShare);
  $("theme").addEventListener("click", () => { state.theme = state.theme === "dark" ? "light" : "dark"; applyTheme(); writeHash(); });

  $("select-all").addEventListener("click", () => { state.selected = new Set(ALL_IDS); refreshBracket(); writeHash(); if ($("panel").classList.contains("open")) $("panel-include-cb").checked = true; });
  $("select-none").addEventListener("click", () => { state.selected = new Set(); refreshBracket(); writeHash(); if ($("panel").classList.contains("open")) $("panel-include-cb").checked = false; });

  $("zoom-in").addEventListener("click", () => Bracket.zoomBy(1.2));
  $("zoom-out").addEventListener("click", () => Bracket.zoomBy(0.83));
  $("zoom-fit").addEventListener("click", () => Bracket.fit());

  $("panel-close").addEventListener("click", closePanel);
  $("panel-include-cb").addEventListener("change", (e) => {
    if (panelMatchId == null) return;
    if (e.target.checked) state.selected.add(panelMatchId); else state.selected.delete(panelMatchId);
    refreshBracket(); writeHash();
  });
  $("copy-title").addEventListener("click", () => copyFrom("panel-title", "Title copied"));
  $("copy-desc").addEventListener("click", () => copyFrom("panel-desc", "Description copied"));

  document.addEventListener("keydown", (e) => {
    if (/input|select|textarea/i.test(e.target.tagName)) return;
    if (e.key === "r" || e.key === "R") flipDisguise();
    else if (e.key === "d" || e.key === "D") doDownload();
    else if (e.key === "f" || e.key === "F") Bracket.fit();
    else if (e.key === "+" || e.key === "=") Bracket.zoomBy(1.2);
    else if (e.key === "-" || e.key === "_") Bracket.zoomBy(0.83);
    else if (e.key === "Escape") closePanel();
  });

  window.addEventListener("resize", () => Bracket.fit());
}
async function copyFrom(id, msg) {
  try { await navigator.clipboard.writeText($(id).textContent); toast(msg + " ✅"); }
  catch { toast("Copy failed — select the text manually"); }
}

init();
