// 2026 FIFA World Cup — Knockout stage (Round of 32 → Final + 3rd place).
// Group stage is still live, so team SLOTS are placeholders ("Winners Group A").
// Dates, kickoff times, venues and the bracket structure are the real published schedule.
// `utc` is the kickoff in UTC (ISO). `tz` is the venue's IANA timezone for local-time display.
// `feedsInto` = the match id the winner advances to (used to draw connectors + lay out the bracket).

const FLAG = { USA: "🇺🇸", Mexico: "🇲🇽", Canada: "🇨🇦" };

const MATCHES = [
  // ---- Round of 32 ----
  { id: 73, round: "R32", utc: "2026-06-28T19:00:00Z", tz: "America/Los_Angeles", stadium: "SoFi Stadium",            city: "Los Angeles",     country: "USA",    home: "Runners-up Group A", away: "Runners-up Group B", feedsInto: 90 },
  { id: 76, round: "R32", utc: "2026-06-29T17:00:00Z", tz: "America/Chicago",     stadium: "NRG Stadium",             city: "Houston",         country: "USA",    home: "Winners Group C",   away: "Runners-up Group F", feedsInto: 91 },
  { id: 74, round: "R32", utc: "2026-06-29T20:30:00Z", tz: "America/New_York",    stadium: "Gillette Stadium",        city: "Boston",          country: "USA",    home: "Winners Group E",   away: "3rd Group A/B/C/D/F", feedsInto: 89 },
  { id: 75, round: "R32", utc: "2026-06-30T01:00:00Z", tz: "America/Monterrey",   stadium: "Estadio BBVA",            city: "Monterrey",       country: "Mexico", home: "Winners Group F",   away: "Runners-up Group C", feedsInto: 90 },
  { id: 78, round: "R32", utc: "2026-06-30T17:00:00Z", tz: "America/Chicago",     stadium: "AT&T Stadium",            city: "Dallas",          country: "USA",    home: "Runners-up Group E", away: "Runners-up Group I", feedsInto: 91 },
  { id: 77, round: "R32", utc: "2026-06-30T21:00:00Z", tz: "America/New_York",    stadium: "MetLife Stadium",         city: "New York / NJ",   country: "USA",    home: "Winners Group I",   away: "3rd Group C/D/F/G/H", feedsInto: 89 },
  { id: 79, round: "R32", utc: "2026-07-01T01:00:00Z", tz: "America/Mexico_City", stadium: "Estadio Azteca",          city: "Mexico City",     country: "Mexico", home: "Winners Group A",   away: "3rd Group C/E/F/H/I", feedsInto: 92 },
  { id: 80, round: "R32", utc: "2026-07-01T16:00:00Z", tz: "America/New_York",    stadium: "Mercedes-Benz Stadium",   city: "Atlanta",         country: "USA",    home: "Winners Group L",   away: "3rd Group E/H/I/J/K", feedsInto: 92 },
  { id: 82, round: "R32", utc: "2026-07-01T20:00:00Z", tz: "America/Los_Angeles", stadium: "Lumen Field",             city: "Seattle",         country: "USA",    home: "Winners Group G",   away: "3rd Group A/E/H/I/J", feedsInto: 94 },
  { id: 81, round: "R32", utc: "2026-07-02T00:00:00Z", tz: "America/Los_Angeles", stadium: "Levi's Stadium",          city: "San Francisco",   country: "USA",    home: "Winners Group D",   away: "3rd Group B/E/F/I/J", feedsInto: 94 },
  { id: 84, round: "R32", utc: "2026-07-02T19:00:00Z", tz: "America/Los_Angeles", stadium: "SoFi Stadium",            city: "Los Angeles",     country: "USA",    home: "Winners Group H",   away: "Runners-up Group J", feedsInto: 93 },
  { id: 83, round: "R32", utc: "2026-07-02T23:00:00Z", tz: "America/Toronto",     stadium: "BMO Field",               city: "Toronto",         country: "Canada", home: "Runners-up Group K", away: "Runners-up Group L", feedsInto: 93 },
  { id: 85, round: "R32", utc: "2026-07-03T03:00:00Z", tz: "America/Vancouver",   stadium: "BC Place",                city: "Vancouver",       country: "Canada", home: "Winners Group B",   away: "3rd Group E/F/G/I/J", feedsInto: 96 },
  { id: 88, round: "R32", utc: "2026-07-03T18:00:00Z", tz: "America/Chicago",     stadium: "AT&T Stadium",            city: "Dallas",          country: "USA",    home: "Runners-up Group D", away: "Runners-up Group G", feedsInto: 95 },
  { id: 86, round: "R32", utc: "2026-07-03T22:00:00Z", tz: "America/New_York",    stadium: "Hard Rock Stadium",       city: "Miami",           country: "USA",    home: "Winners Group J",   away: "Runners-up Group H", feedsInto: 95 },
  { id: 87, round: "R32", utc: "2026-07-04T01:30:00Z", tz: "America/Chicago",     stadium: "Arrowhead Stadium",       city: "Kansas City",     country: "USA",    home: "Winners Group K",   away: "3rd Group D/E/I/J/L", feedsInto: 96 },

  // ---- Round of 16 ----
  { id: 90, round: "R16", utc: "2026-07-04T17:00:00Z", tz: "America/Chicago",     stadium: "NRG Stadium",             city: "Houston",         country: "USA",    home: "Winners Match 73",  away: "Winners Match 75", feedsInto: 97 },
  { id: 89, round: "R16", utc: "2026-07-04T21:00:00Z", tz: "America/New_York",    stadium: "Lincoln Financial Field", city: "Philadelphia",    country: "USA",    home: "Winners Match 74",  away: "Winners Match 77", feedsInto: 97 },
  { id: 91, round: "R16", utc: "2026-07-05T20:00:00Z", tz: "America/New_York",    stadium: "MetLife Stadium",         city: "New York / NJ",   country: "USA",    home: "Winners Match 76",  away: "Winners Match 78", feedsInto: 99 },
  { id: 92, round: "R16", utc: "2026-07-06T00:00:00Z", tz: "America/Mexico_City", stadium: "Estadio Azteca",          city: "Mexico City",     country: "Mexico", home: "Winners Match 79",  away: "Winners Match 80", feedsInto: 99 },
  { id: 93, round: "R16", utc: "2026-07-06T19:00:00Z", tz: "America/Chicago",     stadium: "AT&T Stadium",            city: "Dallas",          country: "USA",    home: "Winners Match 83",  away: "Winners Match 84", feedsInto: 98 },
  { id: 94, round: "R16", utc: "2026-07-07T00:00:00Z", tz: "America/Los_Angeles", stadium: "Lumen Field",             city: "Seattle",         country: "USA",    home: "Winners Match 81",  away: "Winners Match 82", feedsInto: 98 },
  { id: 95, round: "R16", utc: "2026-07-07T16:00:00Z", tz: "America/New_York",    stadium: "Mercedes-Benz Stadium",   city: "Atlanta",         country: "USA",    home: "Winners Match 86",  away: "Winners Match 88", feedsInto: 100 },
  { id: 96, round: "R16", utc: "2026-07-07T20:00:00Z", tz: "America/Vancouver",   stadium: "BC Place",                city: "Vancouver",       country: "Canada", home: "Winners Match 85",  away: "Winners Match 87", feedsInto: 100 },

  // ---- Quarter-finals ----
  { id: 97,  round: "QF", utc: "2026-07-09T20:00:00Z", tz: "America/New_York",    stadium: "Gillette Stadium",        city: "Boston",          country: "USA",    home: "Winners Match 89",  away: "Winners Match 90", feedsInto: 101 },
  { id: 98,  round: "QF", utc: "2026-07-10T19:00:00Z", tz: "America/Los_Angeles", stadium: "SoFi Stadium",            city: "Los Angeles",     country: "USA",    home: "Winners Match 93",  away: "Winners Match 94", feedsInto: 101 },
  { id: 99,  round: "QF", utc: "2026-07-11T21:00:00Z", tz: "America/New_York",    stadium: "Hard Rock Stadium",       city: "Miami",           country: "USA",    home: "Winners Match 91",  away: "Winners Match 92", feedsInto: 102 },
  { id: 100, round: "QF", utc: "2026-07-12T01:00:00Z", tz: "America/Chicago",     stadium: "Arrowhead Stadium",       city: "Kansas City",     country: "USA",    home: "Winners Match 95",  away: "Winners Match 96", feedsInto: 102 },

  // ---- Semi-finals ----
  { id: 101, round: "SF", utc: "2026-07-14T19:00:00Z", tz: "America/Chicago",     stadium: "AT&T Stadium",            city: "Dallas",          country: "USA",    home: "Winners Match 97",  away: "Winners Match 98",  feedsInto: 104 },
  { id: 102, round: "SF", utc: "2026-07-15T19:00:00Z", tz: "America/New_York",    stadium: "Mercedes-Benz Stadium",   city: "Atlanta",         country: "USA",    home: "Winners Match 99",  away: "Winners Match 100", feedsInto: 104 },

  // ---- Third place play-off ----
  { id: 103, round: "3RD", utc: "2026-07-18T21:00:00Z", tz: "America/New_York",   stadium: "Hard Rock Stadium",       city: "Miami",           country: "USA",    home: "Losers Match 101",  away: "Losers Match 102",  feedsInto: null },

  // ---- Final ----
  { id: 104, round: "FINAL", utc: "2026-07-19T19:00:00Z", tz: "America/New_York", stadium: "MetLife Stadium",         city: "New York / NJ",   country: "USA",    home: "Winners Match 101", away: "Winners Match 102", feedsInto: null },
];

const ROUND_NAMES = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-final",
  SF: "Semi-final",
  "3RD": "Third-place play-off",
  FINAL: "Final",
};

MATCHES.forEach((m) => { m.flag = FLAG[m.country] || "🏟️"; });
