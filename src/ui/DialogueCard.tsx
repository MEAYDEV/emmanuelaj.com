import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../store";

export default function DialogueCard() {
  const dialogue = useGame((s) => s.dialogue);
  const fullText = useMemo(
    () => (dialogue ? dialogue.lines.join("\n\n") : ""),
    [dialogue]
  );
  const [chars, setChars] = useState(0);
  const doneTyping = chars >= fullText.length;
  const charsRef = useRef(0);
  charsRef.current = chars;

  useEffect(() => {
    setChars(0);
    if (!fullText) return;
    const t = setInterval(() => {
      setChars((c) => {
        if (c >= fullText.length) {
          clearInterval(t);
          return c;
        }
        return c + 2;
      });
    }, 18);
    return () => clearInterval(t);
  }, [fullText]);

  useEffect(() => {
    if (!dialogue) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyX" || e.code === "Enter" || e.code === "Escape" || e.code === "Space") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogue, fullText]);

  if (!dialogue) return null;

  function advance() {
    if (charsRef.current < fullText.length) {
      setChars(fullText.length);
    } else {
      const g = useGame.getState();
      g.closeDialogue();
      if (g.phase === "arrival" && g.arrivalStep === "greeting") {
        g.setArrivalStep("enter");
      }
    }
  }

  return (
    <div className="dialogue-backdrop" onClick={advance}>
      <div className="dialogue" onClick={(e) => e.stopPropagation()}>
        <h2>{dialogue.title}</h2>
        <p>
          {fullText.slice(0, chars)}
          {!doneTyping && <span className="caret" />}
        </p>
        {doneTyping && dialogue.links && (
          <div className="dialogue-links">
            {dialogue.links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener">
                {l.label}
              </a>
            ))}
          </div>
        )}
        <div className="dialogue-footer">
          <span>
            <span className="keycap">X</span> {doneTyping ? "close" : "skip"}
          </span>
          <button onClick={advance}>{doneTyping ? "Close" : "Skip"}</button>
        </div>
      </div>
    </div>
  );
}
