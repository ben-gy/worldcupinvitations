// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Ben Richardson — https://benrichardson.dev
// Additional terms under AGPL-3.0 section 7(b) apply; see ADDITIONAL-TERMS.md.
// invites.js — turns a football match into a believable (and unique) fake meeting,
// or into its real reveal. Everything here is deterministic: the same match + profession
// always produces the same disguise, so re-rendering never reshuffles the text.

// ---- deterministic PRNG (xfnv1a hash -> mulberry32) ----
function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeRng(seed) {
  const rng = mulberry32(hashSeed(seed));
  return {
    pick: (arr) => arr[Math.floor(rng() * arr.length)],
    chance: (p) => rng() < p,
    int: (n) => Math.floor(rng() * n),
  };
}

// ---- host-city flavour: each venue city gets a corporate-sounding region hook ----
const CITY_HOOK = {
  "Los Angeles":   ["West Coast", "SoCal", "LA office"],
  "Houston":       ["Gulf Coast", "Houston branch", "South Central"],
  "Boston":        ["Northeast", "New England", "Boston office"],
  "Monterrey":     ["LATAM", "Northern Mexico", "Monterrey hub"],
  "Dallas":        ["Texas region", "Central", "Dallas office"],
  "New York / NJ": ["HQ", "East Coast", "NY/NJ office"],
  "Mexico City":   ["LATAM", "Mexico region", "CDMX office"],
  "Atlanta":       ["Southeast", "Atlanta hub", "ATL office"],
  "Seattle":       ["Pacific Northwest", "PNW", "Seattle office"],
  "San Francisco": ["Bay Area", "West Coast", "SF office"],
  "Toronto":       ["Canada East", "Toronto office", "GTA"],
  "Vancouver":     ["Canada West", "Vancouver office", "Pacific"],
  "Miami":         ["Southeast", "Florida region", "Miami office"],
  "Kansas City":   ["Midwest", "KC branch", "Central"],
  "Philadelphia":  ["Mid-Atlantic", "Philly office", "Northeast"],
};

// ---- code-name generator, for that "Project Falcon" energy ----
const CODE_ADJ = ["Blue", "Silver", "Northern", "Atlas", "Quantum", "Falcon", "Crimson", "Granite", "Summit", "Apex", "Cobalt", "Polar", "Onyx", "Aurora", "Titan", "Vector"];
const CODE_NOUN = ["Phoenix", "Horizon", "Compass", "Beacon", "Harbor", "Catalyst", "Meridian", "Cascade", "Lighthouse", "Pioneer", "Voyager", "Keystone", "Frontier", "Anchor", "Nimbus", "Cipher"];

// ---- time helpers ----
function fmtLocal(utcIso, tz, opts) {
  return new Date(utcIso).toLocaleString("en-US", { timeZone: tz, ...opts });
}
function venueTime(m) {
  return fmtLocal(m.utc, m.tz, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
}
function viewerTime(m) {
  // Uses the viewer's own timezone (no tz arg).
  return new Date(m.utc).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
}
function shortReal(m) {
  const d = new Date(m.utc).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  return `${ROUND_NAMES[m.round]} · ${m.home} vs ${m.away} · ${m.stadium}, ${m.city} · ${d}`;
}

// ---- the disguise ----
function buildInvite(match, professionKey) {
  const prof = PROFESSIONS.find((p) => p.key === professionKey) || PROFESSIONS[0];
  const rng = makeRng(`${match.id}:${prof.key}`);

  const hook = rng.pick(CITY_HOOK[match.city] || [match.city]);
  const type = rng.pick(prof.types);
  const qualifier = rng.pick(QUALIFIERS);
  const codename = `${rng.pick(CODE_ADJ)} ${rng.pick(CODE_NOUN)}`;

  // A few title shapes for variety; seed picks one deterministically.
  const shapes = [
    `${qualifier} ${hook} ${type}`,
    `${type} — ${hook} (Project ${codename})`,
    `${hook} ${type}: Project ${codename}`,
    `${qualifier} ${type} — ${hook}`,
    `Project ${codename}: ${hook} ${type}`,
  ];
  const title = rng.pick(shapes);

  // 2–3 fake agenda bullets, no repeats.
  const pool = [...prof.agenda];
  const bullets = [];
  const n = 2 + rng.int(2);
  for (let i = 0; i < n && pool.length; i++) {
    bullets.push(pool.splice(rng.int(pool.length), 1)[0]);
  }
  const location = rng.pick(prof.locations);

  const description =
    `Quick ${hook.toLowerCase()} ${type.toLowerCase()} — shouldn't run long.\n\n` +
    `Agenda:\n` +
    bullets.map((b) => `• ${cap(b)}`).join("\n") +
    `\n\nDial-in details to follow. Please keep this on your calendar.`;

  return { title, description, location, codename, hook, meetingType: type };
}

// ---- the reveal: real fixture details injected into title + description ----
function realDetails(match) {
  const title = `${match.flag} ${ROUND_NAMES[match.round]}: ${match.home} vs ${match.away}`;
  const description =
    `⚽ ${ROUND_NAMES[match.round]} — Match ${match.id}\n` +
    `${match.home} vs ${match.away}\n\n` +
    `🏟️ ${match.stadium}, ${match.city} ${match.flag}\n` +
    `🕐 Kick-off (local): ${venueTime(match)}\n` +
    `🌍 Your time: ${viewerTime(match)}\n\n` +
    `Block it out. Look busy. Enjoy the football. 🤫`;
  return { title, description, location: `${match.stadium}, ${match.city}` };
}

// Build whichever variant the current mode wants. `reveal` = show real details.
function inviteFor(match, professionKey, reveal) {
  const disguise = buildInvite(match, professionKey);
  if (!reveal) return { ...disguise, real: shortReal(match) };
  const real = realDetails(match);
  return { ...real, real: shortReal(match) };
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
