import { useEffect } from "react";
import { useGame } from "../store";
import { startCrackle, stopCrackle, tick, whoosh } from "../lib/audio";

/** Maps game-state transitions to the synthesized sound layer. */
export default function AudioManager() {
  useEffect(() => {
    const unsub = useGame.subscribe((state, prev) => {
      if (state.dialogue && !prev.dialogue) tick(760);
      if (!state.dialogue && prev.dialogue) tick(520);
      if (state.phase === "inside" && prev.phase === "arrival") whoosh();
      if (state.focus !== prev.focus) {
        if (state.focus) whoosh();
        else tick(480);
      }
      if (state.selectedBook && state.selectedBook !== prev.selectedBook) tick(880);
      if (state.vinylIndex !== prev.vinylIndex) tick(660);
      if (state.nowPlaying && !prev.nowPlaying) startCrackle();
      if (!state.nowPlaying && prev.nowPlaying) stopCrackle();
      if (state.wavePulse !== prev.wavePulse) tick(920);
    });
    return unsub;
  }, []);

  return null;
}
