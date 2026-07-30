import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Experience from "./three/Experience";
import LoadingScreen from "./ui/LoadingScreen";
import Hud from "./ui/Hud";
import DialogueCard from "./ui/DialogueCard";
import PromptChip from "./ui/PromptChip";
import MobileControls from "./ui/MobileControls";
import FocusPanels from "./ui/FocusPanels";
import PhotoBook from "./ui/PhotoBook";
import AudioManager from "./ui/AudioManager";
import ArrivalTitle from "./ui/ArrivalTitle";

export default function App() {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [3.4, 3.1, 14.2], fov: 40 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, toneMappingExposure: 1.05 }}
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
