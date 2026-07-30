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

  if (!isTouch) return null;

  return (
    <>
      {phase === "inside" && (
        <Joystick
          joystickWrapperStyle={{
            position: "fixed",
            left: "calc(14px + env(safe-area-inset-left, 0px))",
            bottom: "calc(82px + env(safe-area-inset-bottom, 0px))",
            width: 144,
            height: 144,
            zIndex: 35,
          }}
        />
      )}
      {prompt && (
        <button className="mobile-x" onClick={prompt.run} aria-label={prompt.label}>
          <span>Tap</span>
          <small>{prompt.label}</small>
        </button>
      )}
    </>
  );
}
