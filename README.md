# emmanuelaj.com — The Loft

Emmanuel Ajala's personal site, reimagined as a Sims-inspired 3D loft you can
walk around in. Built with React Three Fiber, Rapier physics, and the ecctrl
character controller. The previous 2D site is preserved as the "classic" site.

## Structure

- `src/` — the 3D experience (Vite + React + TypeScript)
  - `three/` — scene: loft geometry, avatar, player controller, camera rig
  - `ui/` — HUD, dialogue cards, prompts, loading screen
  - `data/content.ts` — interactable zones + dialogue copy
- `public/classic/` — the classic 2D site, served at `/classic/`
- `public/beats/` — beat audio files (shared by both sites)
- `docs/3d-portfolio-plan.md` — the full design plan and roadmap

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # typechecks, then outputs to dist/
```

## Deploy

Vercel auto-detects Vite. The classic site ships as static files inside
`public/`, so `/classic/` keeps working with no extra config.

## Controls

- `X` — interact (greet, read, spin records)
- `E` — enter the loft
- `W A S D` / arrows — walk · `Shift` — run · `Space` — jump
- Drag — orbit camera · touch joystick on mobile

## Roadmap (see docs/3d-portfolio-plan.md)

1. ~~Walkable loft + door intro + interaction system~~ (this milestone)
2. 3D pull-out library books (port of thebuggeddev/books)
3. Vinyl crate flip-through with per-record sleeves
4. Supabase admin page for photo book + content
5. Real loft GLB with baked lighting, Ready Player Me avatar
