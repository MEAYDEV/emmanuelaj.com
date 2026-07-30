# "The Loft" — Sims-Inspired 3D portfolio plan

A playable, Sims-style virtual home for emmanuelaj.com. You (an avatar) greet
visitors at the front door of a double-height industrial loft, invite them in,
and let them explore rooms where every object is a piece of the portfolio.

---

## 1. Experience walkthrough

### Scene 0 — Arrival (front door)
- Camera starts outside a loft door (exposed brick, steel-framed window, warm
  interior light spilling out).
- Emmanuel's avatar stands by the door in an idle animation with a green
  Sims-style **plumbob** rotating above his head.
- A game-style keycap prompt appears: **`X` — Say hello** (clickable on
  mobile/desktop, or press the physical key).
- Pressing X: avatar waves (Mixamo "waving" clip) and a Sims-style dialogue
  card types out a short intro ("I'm Emmanuel. I make apps, AI things, and
  beats. Come in — look around, touch stuff.").
- Second prompt: **`E` — Come inside** → door opens, camera follows through.

### Scene 1 — The loft (main floor, free roam)
Double-height industrial loft: brick walls, black steel beams, huge
factory-style windows, a **spiral staircase** to a mezzanine bedroom.
Visitor controls the avatar in third person (WASD / arrows / touch joystick),
Sims-style. Interactive objects glow softly and raise a keycap prompt when the
avatar is near:

| Zone | Object | Interaction |
|---|---|---|
| Living area | TV / console | "Apps" — Whispae + Furtone cards with store links |
| Library wall | 3D bookshelf | Adapted from [thebuggeddev/books](https://github.com/thebuggeddev/books): pull a book off the shelf, it flips to face camera, shows notes + a buy link |
| Music corner | Turntable + record crate | Flip through vinyl sleeves (one per beat); click a record → it drops on the platter, spins, tonearm moves, the beat plays from `/beats` |
| Desk nook | Laptop | GitHub projects + Medium writing |
| Mezzanine bedroom | Posters on the wall | Futbol, piano, gym, afrobeats poster art; hovering names the hobby |
| Bedroom shelf | **Photo book** | Pick it up → page-flip viewer with photos managed from the admin page |
| Front door mat | Contact | Mailbox or doorbell → email + socials |

### Ever-present game UI
- Bottom-left: mini "needs" panel parody (Fun: MAX, Curiosity: MAX) for flavor.
- Bottom-right: controls hint + "Lite site" escape hatch (the current 2D site).
- Loading screen with rotating Sims-style joke tips ("Reticulating splines…",
  "Compiling beats…").

---

## 2. Tech stack (researched, current best practice)

| Layer | Choice | Why |
|---|---|---|
| Build | Vite + React + TypeScript | Fast, standard for R3F apps |
| 3D | three.js via **@react-three/fiber** + **@react-three/drei** | Component model fits a house of interactive zones |
| Physics | **@react-three/rapier** | Colliders for walls/furniture |
| Character controller | **pmndrs/ecctrl** | Production-ready third-person controller: WASD, camera follow, touch joystick, works with Rapier out of the box |
| State | zustand | Game state (current zone, dialogue open, audio playing) without React re-render cost |
| Avatar | **Ready Player Me** GLB (created from a photo) + **Mixamo** animations (idle, walk, wave, sit) | No Blender skills needed; standard pipeline |
| House assets | CC0 kits: Kenney furniture (Poly Pizza has a CC0 **spiral staircase**: poly.pizza/m/HXfmM6RYeJ), assembled + customized in Blender; Sweet Home 3D (the tool from the PortableApps link) can be used to draft the floor plan before modeling | Free, license-safe, low-poly = fast loading |
| Bookshelf | Port of **thebuggeddev/books** (single-file three.js showcase, procedural covers + optional cover URLs) into an R3F component fed by CMS data | Exactly the interaction requested |
| Audio | Existing `/beats` mp3/wavs + Web Audio API (vinyl crackle layer, spin-up pitch bend) | Reuses current content |
| Admin + content | **Supabase**: auth (single admin), Postgres tables (`books`, `photos`, `beats_meta`), Storage bucket for photo uploads; public read via RLS | Needed for "upload photos via admin page" on a static host |
| Hosting | Vercel (same as now) | `/` = 3D experience, `/classic` = current 2D site, `/admin` = CMS |

### Key packages
```
react react-dom three @react-three/fiber @react-three/drei
@react-three/rapier ecctrl zustand @supabase/supabase-js
```

---

## 3. Content model (Supabase)

```sql
books  (id, title, author, status 'read'|'reading', notes, cover_url, buy_url, sort)
photos (id, storage_path, caption, taken_at, sort)
beats_meta (id, file_path, title, genre, sleeve_color)
site_copy (key, value)   -- intro dialogue, about text
```

- `/admin` (protected by Supabase email+password auth, single user):
  - Photos tab: drag-drop upload → Storage bucket → row in `photos`.
  - Books tab: add title/author/buy link, upload or link a cover.
  - Beats tab: edit titles/genres for the existing audio files.
- The 3D site reads with the anon key (RLS: public `SELECT`, admin-only writes).

---

## 4. Asset production

1. **Avatar**: Ready Player Me from a portrait photo → `avatar.glb`; retarget
   Mixamo clips (Idle, Walking, Waving, Sitting) — standard glb+fbx pipeline.
2. **House**: block out the floor plan (optionally in Sweet Home 3D), then
   assemble in Blender from Kenney/Poly Pizza CC0 kits; add double-height brick
   walls, steel beams, window wall, spiral staircase, mezzanine. Bake ambient
   occlusion into lightmaps; export one Draco-compressed `loft.glb`.
3. **Posters**: 4–6 generated poster images (futbol, piano, gym, afrobeats,
   Whispae, Furtone) as textures on wall planes.
4. **Vinyl sleeves**: procedural covers (same trick as the books repo) colored
   by genre.

---

## 5. Performance & accessibility

- Draco + KTX2 compression, `useGLTF.preload`, Suspense boundaries per zone.
- Mutate object transforms via refs in `useFrame` (never React state per frame).
- Target < 8 MB initial payload; lazy-load audio + photo book content.
- Mobile: ecctrl touch joystick; if WebGL is unavailable or
  `prefers-reduced-motion`, redirect to `/classic`.
- SEO: server-rendered fallback content in the HTML shell; `/classic` keeps
  full crawlable content.

---

## 6. Build phases

1. **Scaffold + shell** — Vite/R3F app in the repo (current site moves to
   `/classic`), placeholder loft geometry, ecctrl walking, door-intro camera.
2. **Game feel** — plumbob, keycap prompt system, dialogue cards, X-to-greet
   flow, loading screen.
3. **Zones** — library (books port), vinyl player wired to `/beats`, posters,
   desk, contact.
4. **CMS** — Supabase schema + `/admin` app + RLS; photo book reads uploads.
5. **Polish + ship** — real loft model pass, baked lighting, mobile QA,
   `/classic` fallback wiring, deploy to Vercel.

Risks: the loft GLB is the biggest craft lift (mitigate with CC0 kits +
simple materials); Supabase adds env vars to Vercel (documented in README).
