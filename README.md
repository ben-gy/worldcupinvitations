# World Cup Invitations 🕵️⚽

> Block your calendar. Watch in peace.

A tiny, static, no-build website that disguises every **2026 FIFA World Cup knockout match**
(Round of 32 → Final) as a believable, boring work meeting. Pick your profession, browse the full
knockout bracket, flip between **Disguise** and **Reveal**, and download one `.ics` calendar file
that quietly fills your work calendar so you can watch the football undetected.

**Live:** https://26wc.ben.gy

## How it works

- **Pick your cover** — your profession reskins every invite (a lawyer gets "Deposition Prep", an
  engineer gets "Incident Post-mortem", etc.).
- **Full-page knockout bracket** — pan (drag), zoom (scroll / `+` `-`), fit (`F`). Click any match
  to see its invite.
- **Disguise ↔ Reveal toggle** (`R`) — flip the bracket and the export between the fake meeting text
  and the real fixture (stage, date, local kick-off, venue, city).
- **Download** (`D`) — one `.ics` with every selected match, importable into Google / Outlook / Apple
  Calendar. Times are stored in UTC so they show correctly in your local timezone.
- **Share** — your profession, selection and mode live in the URL, so a shared link reproduces your setup.

Group stage is still live, so team matchups show as bracket slots ("Winners Group A") until the
groups conclude — the dates, venues and times are the real published schedule.

## Tech

Plain HTML/CSS/JS, zero dependencies, zero build step. Everything runs client-side and offline.

| File | Purpose |
|------|---------|
| `index.html` | Page shell, controls, invite panel, meta tags |
| `styles.css` | Undercover theme, dark/light, animations |
| `data/matches.js` | The 32 knockout fixtures (UTC times, venues, slots) |
| `data/professions.js` | Per-profession disguise vocabulary |
| `invites.js` | Deterministic disguise + reveal generator |
| `bracket.js` | SVG bracket layout + pan/zoom |
| `ics.js` | `.ics` calendar builder |
| `app.js` | State, URL hash, panel, confetti, shortcuts |

## Local dev

```sh
python3 -m http.server 4321
# open http://localhost:4321
```

## Deploy (GitHub Pages + Cloudflare DNS)

1. Push to a public GitHub repo; enable **Pages** (branch `main`, root).
2. The repo `CNAME` file sets the custom domain to `26wc.ben.gy`.
3. In Cloudflare, add a **CNAME** record: `26wc` → `<your-username>.github.io`, **DNS-only**.
4. Enable "Enforce HTTPS" in the repo Pages settings once the cert provisions.

---

Made for football fans with too many meetings. Not affiliated with FIFA.

## license

[GNU Affero General Public License v3.0 or later](./LICENSE), with an attribution
requirement added under section 7(b) — see
[ADDITIONAL-TERMS.md](./ADDITIONAL-TERMS.md).

In short: you may run, modify, redistribute and even sell this, but if you
distribute it — or run a modified version where other people can reach it — you
have to publish your source under the same licence and keep the attribution. A
separate commercial licence without those obligations is available on request:
<hi@ben.gy>.

Third-party components keep their own licences — see
[THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md).
