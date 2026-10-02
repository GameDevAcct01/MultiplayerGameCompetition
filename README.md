# The Case of the Stolen Crown

A browser-based, real-time multiplayer mystery game for 2–8 players.

## Included
- Node.js + Express + Socket.IO authoritative multiplayer server.
- Truth-first mystery generator and evidence validation.
- Eight playable characters with dossier-style portrait art.
- Exactly 2-human rule: Dr. Evelyn Vale appears only with exactly two human players, is a possible suspect, and can never be the Thief. With 3–8 humans she is omitted from case data.
- Public Case Info, timeline, evidence, and private per-player clues.
- Secret server-side Thief assignment.
- Private accusations, timed investigation, reveal, scoring, rematch, and disconnect handling.
- Museum movement graph used by the case generator.
- Mobile-friendly browser interface.

## Run locally

`npm install`
`npm start`

Then open http://localhost:3000.

## Rules

One human is the Thief. Investigators who correctly accuse the Thief receive +3. The Thief receives +5 for escaping accusation and +1 for causing another player to be accused.

The case generator constructs a hidden truth first, distributes evidence derived from that truth, and validates that the generated case has time and movement evidence before it can start.

## Architecture

Browser phones → Socket.IO → Node.js authoritative server → case generator / validation / scoring.

Private roles and clues are sent only through the intended player's socket.

## Deployment

This repository is the complete browser-game source, but GitHub itself is not a persistent Node/WebSocket game host. A public live URL still requires a hosting provider that supports Node.js and WebSockets.