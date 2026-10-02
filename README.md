# The Case of the Stolen Crown

Browser-based real-time multiplayer mystery game for the college multiplayer competition.

## MVP
- 2–8 players
- Room codes and live lobby
- Server-authoritative Thief assignment
- Public Case Info, timeline and evidence
- Private clues delivered only to the intended socket
- Private accusations
- Reveal and scoring
- Rematch
- Exactly 2 humans: static Dr. Evelyn Vale is added as a possible suspect and can never be the Thief
- 3–8 humans: Dr. Vale is omitted from the case data

## Run
```bash
npm install
npm start
```

Then open http://localhost:3000.

## Deploy
Use a host that supports a persistent Node.js process and WebSockets. Set PORT if required.

## Next
Truth-first case generator, formal evidence validator, reconnect tokens, QR/share URL, automatic timers, movement/time validation, acceptance tests, rate limiting and room expiry.
