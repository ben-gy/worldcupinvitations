// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Ben Richardson — https://benrichardson.dev
// Additional terms under AGPL-3.0 section 7(b) apply; see ADDITIONAL-TERMS.md.
// ics.js — builds a standards-compliant .ics file from the selected matches,
// using whichever text the current mode (disguise/reveal) produces.

const MATCH_DURATION_MIN = 150; // kickoff -> +2h30 covers stoppage, ET and penalties.

function icsDate(d) {
  // -> YYYYMMDDTHHMMSSZ (UTC)
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
function icsEscape(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
// Fold lines at 75 octets per RFC 5545 (simple char-based fold is fine for our text).
function fold(line) {
  if (line.length <= 75) return line;
  const out = [];
  let s = line;
  out.push(s.slice(0, 75));
  s = s.slice(75);
  while (s.length) { out.push(" " + s.slice(0, 74)); s = s.slice(74); }
  return out.join("\r\n");
}

function buildICS(matches, professionKey, reveal) {
  const now = icsDate(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//26wc.ben.gy//World Cup Invitations//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Important Meetings",
  ];

  matches.forEach((m) => {
    const inv = inviteFor(m, professionKey, reveal);
    const start = new Date(m.utc);
    const end = new Date(start.getTime() + MATCH_DURATION_MIN * 60000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:wc2026-m${m.id}@26wc.ben.gy`,
      `DTSTAMP:${now}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      fold(`SUMMARY:${icsEscape(inv.title)}`),
      fold(`DESCRIPTION:${icsEscape(inv.description)}`),
      fold(`LOCATION:${icsEscape(inv.location)}`),
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "BEGIN:VALARM",
      "TRIGGER:-PT10M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder",
      "END:VALARM",
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadICS(matches, professionKey, reveal) {
  const ics = buildICS(matches, professionKey, reveal);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "important-meetings.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return matches.length;
}
