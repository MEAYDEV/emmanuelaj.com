import { useCallback, useEffect } from "react";
import { useGame } from "../store";
import { INTERACTABLES, INTRO_DIALOGUE } from "../data/content";

interface Prompt {
  key: string;
  label: string;
  run: () => void;
}

export function useCurrentPrompt(): Prompt | null {
  const phase = useGame((s) => s.phase);
  const arrivalStep = useGame((s) => s.arrivalStep);
  const dialogue = useGame((s) => s.dialogue);
  const nearId = useGame((s) => s.nearId);
  const focus = useGame((s) => s.focus);

  if (dialogue || focus) return null;

  if (phase === "arrival") {
    if (arrivalStep === "hello") {
      return {
        key: "X",
        label: "Say hello",
        run: () => {
          const g = useGame.getState();
          g.triggerWave();
          g.setArrivalStep("greeting");
          g.openDialogue(INTRO_DIALOGUE);
        },
      };
    }
    if (arrivalStep === "enter") {
      return {
        key: "E",
        label: "Come inside",
        run: () => {
          const g = useGame.getState();
          g.openDoor();
          g.setPhase("inside");
        },
      };
    }
    return null;
  }

  if (!nearId) return null;
  const item = INTERACTABLES.find((i) => i.id === nearId);
  if (!item) return null;

  return {
    key: "X",
    label: item.label,
    run: () => {
      const g = useGame.getState();
      if (item.action === "library") {
        g.setFocus("library");
      } else if (item.action === "vinyl") {
        g.setFocus("vinyl");
      } else if (item.action === "photos") {
        g.setFocus("photos");
      } else if (item.dialogue) {
        g.openDialogue(item.dialogue);
      }
    },
  };
}

export default function PromptChip() {
  const prompt = useCurrentPrompt();
  const run = prompt?.run;
  const key = prompt?.key;

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!run || !key) return;
      if (e.code === `Key${key}`) {
        e.preventDefault();
        run();
      }
    },
    [run, key]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  if (!prompt) return null;

  return (
    <button className="prompt" onClick={prompt.run}>
      <span className="keycap">{prompt.key}</span>
      {prompt.label}
    </button>
  );
}
