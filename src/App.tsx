import { Suspense, lazy, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import LoadingScreen from "./ui/LoadingScreen";
import Hud from "./ui/Hud";
import DialogueCard from "./ui/DialogueCard";
import PromptChip from "./ui/PromptChip";
import MobileControls from "./ui/MobileControls";
import FocusPanels from "./ui/FocusPanels";
import PhotoBook from "./ui/PhotoBook";
import AudioManager from "./ui/AudioManager";
import ArrivalTitle from "./ui/ArrivalTitle";

const Experience = lazy(() => import("./three/Experience"));

export default function App() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const sync = () => setIsTouchDevice(media.matches);
    sync();
    media.addEventListener?.("change", sync);
    return () => media.removeEventListener?.("change", sync);
  }, []);

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [3.4, 3.1, 14.2], fov: 40 }}
        dpr={isTouchDevice ? [1, 1.2] : [1, 1.5]}
        gl={{
          antialias: !isTouchDevice,
          powerPreference: "high-performance",
          toneMappingExposure: 1.05,
        }}
        performance={{ min: isTouchDevice ? 0.4 : 0.5 }}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <LoadingScreen />
      <ArrivalTitle />
      <Hud />
      <PromptChip />
      <DialogueCard />
      <FocusPanels />
      <PhotoBook />
      <MobileControls />
      <AudioManager />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
