import { useEffect, useState } from "react";
import { Joystick } from "ecctrl/input";
import { useGame } from "../store";
import { useCurrentPrompt } from "./PromptChip";

export default function MobileControls() {
  const [isTouch, setIsTouch] = useState(false);
  const phase = useGame((s) => s.phase);
  const prompt = useCurrentPrompt();

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  if (!isTouch || phase !== "inside") return null;

  return (
    <>
      <Joystick
        joystickWrapperStyle={{
          position: "fixed",
          left: 18,
          bottom: 96,
          width: 150,
          height: 150,
          zIndex: 35,
        }}
      />
      {prompt && (
        <button className="mobile-x" onClick={prompt.run} aria-label={prompt.label}>
          <span>{prompt.key}</span>
          <small>{prompt.label}</small>
        </button>
      )}
    </>
  );
}
