# Doppelkopf-Statistik-App

Dieses Repo enthält eine Doppelkopf-Statistik-PWA für eine Freundesgruppe von
7–10 Spielern. Entwickelt und gepflegt in enger Zusammenarbeit mit Claude
(sowohl über claude.ai als auch über Claude Code). Diese Datei gibt dir den
Hintergrund, damit du nahtlos anschließen kannst, egal von wo aus gearbeitet
wird.

## Kontext zur App

Eine Freundesgruppe von 7-10 Personen spielt regelmäßig Doppelkopf.
Doppelkopf wird immer zu genau 4 Spielern gespielt, aber die 4er-Besetzung
wechselt von Spiel zu Spiel. Die App erfasst, wer wann mit wem gespielt und
wie oft wer was geschafft hat.

## Grundbegriffe (wichtig, nicht verwechseln)

- **Spiel (Session):** Ein Spielabend/eine Sitzung mit genau 4 ausgewählten
  Spielern. Besteht aus beliebig vielen Runden.
- **Runde:** Eine Kartenverteilung samt Ausspielen. Führt zu Punkten für die
  4 Spieler. Pro Runde werden die Gewinner angetippt und EINE Punktzahl
  eingetragen: alle Gewinner bekommen diese Punkte, Verlierer 0 — KEINE
  Platzierung.
- **Solo:** Wird automatisch erkannt. Wenn in einer Runde nur 1 Spieler
  gewinnt oder nur 1 Spieler verliert, war es ein Solo. Sonst Normalspiel
  (meist 2 gegen 2).
- **Platzierung:** Gibt es nur am Ende eines Spiels, berechnet aus der
  Gesamtpunktzahl der Runden. Höchste Punkte = Platz 1 usw. Bei
  Punktgleichheit teilen sich Spieler die Platzierung.

## Punkte-Handling

Die App rechnet KEINE Doppelkopf-Punkte selbst aus. Die Spieler tragen
Punkte pro Runde manuell in Inputfelder ein. So können Regeländerungen
jederzeit umgesetzt werden, ohne die App anzupassen. Die App summiert und
wertet nur aus.

## Stack & Architektur

- Frontend: React 18 als **eine einzige `index.html`**, kein Build-Tool,
  kein npm/Bundler nötig.
- React + ReactDOM werden per `<script>`-Tag von unpkg geladen.
- Der App-Code liegt **vorkompiliert** (`React.createElement`-Aufrufe)
  direkt im `<script>`-Block der `index.html` — kein Babel-in-Browser mehr
  zur Laufzeit.
- Hosting: GitHub Pages (Branch `main`, Ordner `/ (root)`).
- Cloud-Speicher: Cloudflare Worker `doko-speicher` +
  KV-Namespace `doko-kv` (Binding `DOKO_KV`), Passwort-Secret `DOKO_SECRET`.
- Lokaler Fallback: `localStorage`, falls kein Netz.
- Sync-Status wird im Footer angezeigt: „synchronisiert" / „speichert…" /
  „offline – nur lokal".
- Live-URL: https://bastilen.github.io/doppelkopf/

## Kern-Features (Stand: alle 5 Phasen umgesetzt)

- Spielerverwaltung, neues Spiel starten (4 von 7–10 Spielern wählen)
- Rundenerfassung mit automatischer Solo-Erkennung
- Statistiken pro Spieler (Siege auf Runden- UND Spiel-Ebene getrennt,
  Ø-Platzierung, Punkte, Streaks, Solo-Quote)
- Ranglisten (sortierbar) + Graphen (pro Spiel, All-Time mit
  Spielerauswahl und Modi: Punkte / Spiel-Siege / Platz-Punkte)
- Runden nachträglich bearbeiten/löschen (im laufenden Spiel und in
  abgeschlossenen Spielen)
- Zusammenfassung nach Spielende (Platzierungen, Runden, Dauer, Solos, beste
  Runde) mit „Ergebnis teilen" (Teilen-Menü bzw. Zwischenablage), plus Liste
  „Vergangene Spiele" im Spiel-Tab, von der aus jedes Ergebnis erreichbar ist
- Datensicherung im Spieler-Tab: Backup als JSON herunterladen / einspielen
  (Einspielen ersetzt die Daten auf allen Geräten)
- „Duelle" (Head-to-Head): „gegen" (gegnerische Seiten) und „mit"
  (gleiche Seite/Team), sowohl als Gesamt-Bilanz über alle Spiele als auch
  „Pro Spiel" für ein einzelnes Spiel gefiltert

## Bekannte Learnings / Stolpersteine

- **Lesbare Quelle:** Der Kommentar in `index.html` verweist auf eine
  `app-source.jsx`. Die Features „Runden bearbeiten", „Zusammenfassung" und
  „Backup" wurden als JSX geschrieben, mit Babel (classic runtime) kompiliert
  und direkt in die `index.html` eingefügt — eine evtl. vorhandene
  `app-source.jsx` ist daher veraltet. Maßgeblich ist die `index.html`.
- **Testen in Claude Code (Cloud):** unpkg.com ist dort gesperrt. Für
  Playwright-Tests React per `npm i react@18 react-dom@18` lokal holen und
  die unpkg-URLs per `page.route` auf `node_modules/*/umd/*.production.min.js`
  umleiten; den Cloudflare-Worker ebenfalls per `page.route` simulieren.

- **Babel-Import-Bug (historisch, inzwischen umgangen):** Babel-standalone
  fügte beim In-Browser-Transform automatisch eine `import`-Zeile ein
  (automatic JSX runtime), die Browser außerhalb von ES-Modulen ablehnen →
  Blank Screen. Gelöst durch `{ presets: [["react", { runtime: "classic" }]] }`
  bzw. inzwischen durch komplettes Vorkompilieren, sodass zur Laufzeit gar
  kein Babel mehr läuft.
- **box-sizing-Falle:** Die App hatte lange keinen globalen
  `box-sizing: border-box`-Reset. Elemente mit `width: 100%` + Padding
  (z. B. die Zeilen in „Neue Runde") sprengten dadurch auf schmalen
  Handy-Displays den rechten Rand. Fix: globales
  `*, *::before, *::after { box-sizing: border-box; }` im `<style>`-Block,
  plus `overflow-x: hidden` auf `html, body` als Sicherheitsnetz.
- Bei Layout-Änderungen an flexiblen `width: 100%`-Elementen immer auf
  Handy-Breite (~375–390px) testen, nicht nur auf Desktop.

## Arbeitsweise in diesem Projekt

- Bei Änderungswünschen die bestehende App iterativ erweitern, nicht bei
  null anfangen.
- Nachfragen, wenn ein neues Feature mehrdeutig ist, statt Annahmen zu
  treffen.
- Deutsch als Sprache der App und der Kommunikation.
- Vor dem Ausliefern: Rendering-Check (z. B. mit Playwright/Chromium)
  gegen echte Browser-Fehler, nicht nur Babel-Transform-Erfolg — frühere
  Bugs traten erst zur Laufzeit auf, nicht beim reinen Transpilieren.
- Deployment: `index.html` im Repo ersetzen (GitHub UI:
  „Add file → Upload files" → ersetzen → „Commit changes"), GitHub Pages
  baut automatisch neu (1–2 Min). Browser-Cache mit Strg+F5 umgehen.
