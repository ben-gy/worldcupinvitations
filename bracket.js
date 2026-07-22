// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Ben Richardson — https://benrichardson.dev
// Additional terms under AGPL-3.0 section 7(b) apply; see ADDITIONAL-TERMS.md.
// bracket.js — lays out the full knockout tree as an SVG and makes it a
// pan/zoom "canvas". Layout is derived from each match's `feedsInto`, so the
// tree shape is computed, not hand-placed.

const Bracket = (function () {
  const NS = "http://www.w3.org/2000/svg";
  const NODE_W = 168, NODE_H = 60, COL_GAP = 56, ROW_GAP = NODE_H + 18;

  let svg, viewport, container, opts = {};
  let state = { tx: 0, ty: 0, scale: 1 };
  let bounds = { w: 0, h: 0 };
  const byId = {};
  const pos = {};
  const childrenOf = {};
  const nodeEls = {};

  MATCHES.forEach((m) => { byId[m.id] = m; });
  MATCHES.forEach((m) => { if (m.feedsInto) (childrenOf[m.feedsInto] ||= []).push(m.id); });
  Object.values(childrenOf).forEach((a) => a.sort((x, y) => x - y));

  function sideOf(id) {
    let cur = id;
    while (cur) {
      if (cur === 101) return "L";
      if (cur === 102) return "R";
      if (cur === 104) return "C";
      if (cur === 103) return "3";
      cur = byId[cur].feedsInto;
    }
    return "C";
  }
  function colFor(m, side) {
    if (m.round === "FINAL" || m.round === "3RD") return 4;
    const idx = { R32: 0, R16: 1, QF: 2, SF: 3 }[m.round];
    return side === "R" ? 8 - idx : idx;
  }

  // ---- layout ----
  let leftLeaf = 0, rightLeaf = 0;
  function yOf(id) {
    if (pos[id] && pos[id].y != null) return pos[id].y;
    const kids = childrenOf[id];
    let y;
    if (!kids || !kids.length) {
      const side = sideOf(id);
      y = (side === "R" ? rightLeaf++ : leftLeaf++) * ROW_GAP;
    } else {
      const ys = kids.map(yOf);
      y = ys.reduce((a, b) => a + b, 0) / ys.length;
    }
    (pos[id] || (pos[id] = {})).y = y;
    return y;
  }

  function layout() {
    yOf(104);
    MATCHES.forEach((m) => {
      if (m.id === 103) return;
      const side = sideOf(m.id);
      (pos[m.id] || (pos[m.id] = {})).x = colFor(m, side) * (NODE_W + COL_GAP);
    });
    // 3rd place: tuck it just under the Final.
    const maxY = Math.max(...MATCHES.filter((m) => m.id !== 103).map((m) => pos[m.id].y));
    pos[103] = { x: pos[104].x, y: maxY + ROW_GAP * 1.4 };

    const xs = MATCHES.map((m) => pos[m.id].x);
    const ys = MATCHES.map((m) => pos[m.id].y);
    bounds.w = Math.max(...xs) + NODE_W;
    bounds.h = Math.max(...ys) + NODE_H;
  }

  // ---- drawing ----
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function trunc(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }

  function drawConnectors() {
    MATCHES.forEach((m) => {
      if (!m.feedsInto || !pos[m.feedsInto]) return;
      const a = pos[m.id], b = pos[m.feedsInto];
      const side = sideOf(m.id);
      const x1 = side === "R" ? a.x : a.x + NODE_W;
      const x2 = side === "R" ? b.x + NODE_W : b.x;
      const y1 = a.y + NODE_H / 2, y2 = b.y + NODE_H / 2;
      const midX = (x1 + x2) / 2;
      const d = `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
      el("path", { d, class: "conn", "data-from": m.id, fill: "none" }, viewport);
    });
  }

  function drawNodes() {
    MATCHES.forEach((m) => {
      const p = pos[m.id];
      const g = el("g", { class: "node", "data-id": m.id, "data-round": m.round, transform: `translate(${p.x},${p.y})`, tabindex: "0", role: "button" }, viewport);
      el("rect", { class: "node-bg", x: 0, y: 0, width: NODE_W, height: NODE_H, rx: 12 }, g);
      el("rect", { class: "node-accent", x: 0, y: 0, width: 5, height: NODE_H, rx: 2 }, g);
      el("circle", { class: "node-check", cx: NODE_W - 14, cy: 15, r: 7 }, g);
      const tick = el("path", { class: "node-tick", d: `M ${NODE_W - 17} 15 l 2.4 2.6 l 4.2 -5`, fill: "none" }, g);
      const t1 = el("text", { class: "node-title", x: 12, y: 24 }, g);
      const t2 = el("text", { class: "node-sub", x: 12, y: 44 }, g);
      nodeEls[m.id] = { g, t1, t2, tick };

      g.addEventListener("click", () => opts.onSelect && opts.onSelect(m.id));
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); opts.onSelect && opts.onSelect(m.id); } });
      g.addEventListener("mouseenter", () => highlightPath(m.id, true));
      g.addEventListener("mouseleave", () => highlightPath(m.id, false));
    });
  }

  function highlightPath(id, on) {
    svg.classList.toggle("has-hover", on);
    let cur = id;
    const chain = [];
    while (cur) { chain.push(cur); cur = byId[cur].feedsInto; }
    chain.forEach((cid) => {
      if (nodeEls[cid]) nodeEls[cid].g.classList.toggle("lit", on);
      const conn = viewport.querySelector(`path.conn[data-from="${cid}"]`);
      if (conn) conn.classList.toggle("lit", on);
    });
  }

  // ---- label refresh (mode / profession / selection) ----
  function refresh(s) {
    Object.assign(opts, s);
    MATCHES.forEach((m) => {
      const inv = inviteFor(m, opts.professionKey, opts.reveal);
      const ne = nodeEls[m.id];
      ne.t1.textContent = trunc(inv.title, 22);
      ne.t2.textContent = opts.reveal
        ? trunc(`${m.city} · ${shortKick(m)}`, 26)
        : `${ROUND_NAMES[m.round]} · ${m.flag}`;
      const sel = opts.selected ? opts.selected.has(m.id) : true;
      ne.g.classList.toggle("selected", sel);
    });
  }
  function shortKick(m) {
    return new Date(m.utc).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  function focus(id) {
    Object.values(nodeEls).forEach((n) => n.g.classList.remove("focused"));
    if (nodeEls[id]) nodeEls[id].g.classList.add("focused");
  }

  // ---- pan / zoom ----
  function apply() { viewport.setAttribute("transform", `translate(${state.tx},${state.ty}) scale(${state.scale})`); }
  function clampScale(s) { return Math.min(2.2, Math.max(0.25, s)); }

  function zoomBy(factor, cx, cy) {
    const rect = container.getBoundingClientRect();
    cx = cx == null ? rect.width / 2 : cx;
    cy = cy == null ? rect.height / 2 : cy;
    const ns = clampScale(state.scale * factor);
    const k = ns / state.scale;
    state.tx = cx - (cx - state.tx) * k;
    state.ty = cy - (cy - state.ty) * k;
    state.scale = ns;
    apply();
  }

  function fit() {
    const rect = container.getBoundingClientRect();
    const pad = 40;
    const s = clampScale(Math.min((rect.width - pad * 2) / bounds.w, (rect.height - pad * 2) / bounds.h));
    state.scale = s;
    state.tx = (rect.width - bounds.w * s) / 2;
    state.ty = (rect.height - bounds.h * s) / 2;
    apply();
  }

  function centerOn(id) {
    const p = pos[id]; if (!p) return;
    const rect = container.getBoundingClientRect();
    state.tx = rect.width / 2 - (p.x + NODE_W / 2) * state.scale;
    state.ty = rect.height / 2 - (p.y + NODE_H / 2) * state.scale;
    apply();
  }

  function initPanZoom() {
    let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0, moved = false;
    container.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".node")) return; // let nodes handle their own clicks
      dragging = true; moved = false; sx = e.clientX; sy = e.clientY; ox = state.tx; oy = state.ty;
      container.setPointerCapture(e.pointerId); container.classList.add("grabbing");
    });
    container.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      state.tx = ox + (e.clientX - sx); state.ty = oy + (e.clientY - sy);
      if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 3) moved = true;
      apply();
    });
    const end = (e) => { dragging = false; container.classList.remove("grabbing"); };
    container.addEventListener("pointerup", end);
    container.addEventListener("pointercancel", end);
    container.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      zoomBy(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - rect.left, e.clientY - rect.top);
    }, { passive: false });
  }

  function render(svgEl, options) {
    svg = svgEl; opts = options || {};
    container = svg.parentElement;
    viewport = el("g", { id: "bk-viewport" }, svg);
    layout();
    drawConnectors();
    drawNodes();
    initPanZoom();
    refresh({ professionKey: opts.professionKey, reveal: opts.reveal, selected: opts.selected });
    fit();
  }

  return { render, refresh, fit, zoomBy, focus, centerOn };
})();
