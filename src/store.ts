import { create } from "zustand";
import * as THREE from "three";

export type Phase = "arrival" | "inside";
export type ArrivalStep = "hello" | "greeting" | "enter";

export interface DialogueContent {
  title: string;
  lines: string[];
  links?: { label: string; url: string }[];
}

export interface NowPlaying {
  id: string;
  title: string;
  genre: string;
}

/** Mutable per-frame data, kept out of React state on purpose. */
export const playerPosRef = { current: new THREE.Vector3(0, 1, 9.5) };
export const playerSpeedRef = { current: 0 };

interface GameState {
  phase: Phase;
  arrivalStep: ArrivalStep;
  doorOpen: boolean;
  dialogue: DialogueContent | null;
  /** id of the interactable the player is currently near */
  nearId: string | null;
  nowPlaying: NowPlaying | null;
  wavePulse: number;

  setPhase: (p: Phase) => void;
  setArrivalStep: (s: ArrivalStep) => void;
  openDoor: () => void;
  openDialogue: (d: DialogueContent) => void;
  closeDialogue: () => void;
  setNearId: (id: string | null) => void;
  setNowPlaying: (b: NowPlaying | null) => void;
  triggerWave: () => void;
}

export const useGame = create<GameState>((set) => ({
  phase: "arrival",
  arrivalStep: "hello",
  doorOpen: false,
  dialogue: null,
  nearId: null,
  nowPlaying: null,
  wavePulse: 0,

  setPhase: (phase) => set({ phase }),
  setArrivalStep: (arrivalStep) => set({ arrivalStep }),
  openDoor: () => set({ doorOpen: true }),
  openDialogue: (dialogue) => set({ dialogue }),
  closeDialogue: () => set({ dialogue: null }),
  setNearId: (nearId) => set({ nearId }),
  setNowPlaying: (nowPlaying) => set({ nowPlaying }),
  triggerWave: () => set((s) => ({ wavePulse: s.wavePulse + 1 })),
}));

/* ---------- beats audio (module singleton) ---------- */

export interface Beat {
  id: string;
  title: string;
  genre: string;
  src: string;
}

const beatCats = [
  { code: "Misc", genre: "Miscellaneous", dir: "misc", n: 1, ext: "wav" },
  { code: "Afro", genre: "Afrobeats", dir: "afro", n: 10, ext: "mp3" },
  { code: "Trap", genre: "Trap", dir: "trap", n: 3, ext: "mp3" },
  { code: "Ama", genre: "Amapiano", dir: "amapiano", n: 4, ext: "mp3" },
];

export const BEATS: Beat[] = beatCats.flatMap((c) =>
  Array.from({ length: c.n }, (_, i) => {
    const nn = String(i + 1).padStart(2, "0");
    return {
      id: `${c.dir}-${nn}`,
      title: `${c.code} ${nn}`,
      genre: c.genre,
      src: `/beats/${c.dir}/${nn}.${c.ext}`,
    };
  })
);

const audio = typeof Audio !== "undefined" ? new Audio() : null;
let beatIndex = -1;

export function spinNextBeat() {
  if (!audio) return;
  beatIndex = (beatIndex + 1) % BEATS.length;
  const beat = BEATS[beatIndex];
  audio.src = beat.src;
  audio.play().catch(() => {});
  useGame.getState().setNowPlaying(beat);
}

export function stopBeat() {
  if (!audio) return;
  audio.pause();
  useGame.getState().setNowPlaying(null);
}

if (audio) {
  audio.addEventListener("ended", () => spinNextBeat());
}

if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__game = useGame;
}
