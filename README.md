# Fleetline Battleship

A polished, accessible Battleship SPA built with React, TypeScript, Vite, and plain CSS. The game is fully client-side: deploy a 5-ship fleet, then duel an adaptive computer opponent on a 10×10 grid.

## Local setup

```bash
npm install
npm run dev
```

Quality commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Architecture

- `src/game/` contains UI-free board, placement, combat, fleet, and AI functions.
- `src/hooks/useBattleship.ts` owns reducer-driven phases and delayed AI turns.
- `src/components/` contains the accessible board and game presentation.
- Tests are colocated in `__tests__` directories and run with Vitest + Testing Library.

The random placement and AI functions accept an injected RNG. The AI records every fired coordinate in a `Set`, hunts with parity filtering, queues orthogonal neighbors after hits, extends collinear hit runs, and purges targets when a ship sinks.

## Deployment

### Vercel

Import the repository in Vercel. Use the Vite preset, `npm run build` as the build command, and `dist` as the output directory. No environment variables are required.

### Netlify

Create a new site from the repository. Set build command to `npm run build` and publish directory to `dist`. This is a static SPA with no server configuration or secrets.
