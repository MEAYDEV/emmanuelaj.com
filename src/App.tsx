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

export default function App() {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 2.2, 14.5], fov: 42 }}
        dpr={[1, 1.75]}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <LoadingScreen />
      <Hud />
      <PromptChip />
      <DialogueCard />
      <FocusPanels />
      <PhotoBook />
      <MobileControls />
    </>
  );
}
