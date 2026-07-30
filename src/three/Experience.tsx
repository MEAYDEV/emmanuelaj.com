import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdaptiveDpr, CameraControls, PerspectiveCamera, Stars } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import Loft from "./Loft";
import Player from "./Player";
import Avatar from "./Avatar";
import LibraryBooks from "./LibraryBooks";
import VinylBrowser from "./VinylBrowser";
import Atmosphere from "./Atmosphere";
import Effects from "./Effects";
import { playerPosRef, useGame } from "../store";
import { INTERACTABLES } from "../data/content";

const FOCUS_CAMS = {
  library: { pos: [4.55, 1.85, -4.2], tgt: [6.7, 1.5, -4.2] },
  vinyl: { pos: [4.35, 1.6, 2.75], tgt: [6.1, 1.35, 2.75] },
  photos: { pos: [3.4, 4.9, -3.2], tgt: [2.9, 3.7, -5.3] },
} as const;

const GREETER_POS = new THREE.Vector3(0.35, 0, 7.9);
// Mesh forward = +Z. Greeter faces the visitor on the stoop.
const GREETER_FACE = new THREE.Vector3(0.35, 1.55, 7.9);

/** Arrival-only camera — dedicated PerspectiveCamera so nothing else owns the lens. */
function ArrivalCamera() {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const introT = useRef(0);

  useFrame((_, delta) => {
    const cam = camRef.current;
    if (!cam) return;
    introT.current += delta;
    const t = introT.current;
    // Outside on the stoop, looking in at the greeter's face.
    let pos: THREE.Vector3;
    if (t < 1.25) {
      const k = THREE.MathUtils.smootherstep(t / 1.25, 0, 1);
      pos = new THREE.Vector3(3.2, 2.8, 13.5).lerp(new THREE.Vector3(1.4, 2.1, 12.0), k);
    } else if (t < 2.7) {
      const k = THREE.MathUtils.smootherstep((t - 1.25) / 1.45, 0, 1);
      pos = new THREE.Vector3(1.4, 2.1, 12.0).lerp(new THREE.Vector3(0.35, 1.55, 11.0), k);
    } else {
      pos = new THREE.Vector3(0.35, 1.55, 11.0);
    }
    cam.position.copy(pos);
    cam.up.set(0, 1, 0);
    cam.lookAt(GREETER_FACE);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
  });

  return <PerspectiveCamera ref={camRef} makeDefault fov={34} near={0.1} far={80} />;
}

function InsideCameraRig() {
  const controls = useRef<CameraControls>(null);
  const prevPhase = useRef<string>("arrival");
  const phase = useGame((s) => s.phase);
  const focus = useGame((s) => s.focus);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    if (focus) {
      const cam = FOCUS_CAMS[focus];
      c.enabled = false;
      c.smoothTime = 0.55;
      c.setLookAt(cam.pos[0], cam.pos[1], cam.pos[2], cam.tgt[0], cam.tgt[1], cam.tgt[2], true);
      return;
    }
    const entering = prevPhase.current === "arrival";
    prevPhase.current = phase;
    const p = playerPosRef.current;
    c.enabled = true;
    c.smoothTime = entering ? 0.75 : 0.32;
    c.setLookAt(p.x, p.y + 1.75, p.z + 3.0, p.x, p.y + 0.7, p.z, true);
    const timer = setTimeout(() => {
      if (controls.current) controls.current.smoothTime = 0.2;
    }, 2000);
    return () => clearTimeout(timer);
  }, [phase, focus]);

  useFrame(() => {
    const g = useGame.getState();
    if (g.focus) return;
    const p = playerPosRef.current;
    controls.current?.moveTo(p.x, p.y + 0.65, p.z, true);
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={2.0}
      maxDistance={8.5}
      maxPolarAngle={Math.PI * 0.48}
      draggingSmoothTime={0.12}
      azimuthRotateSpeed={0.55}
      polarRotateSpeed={0.45}
    />
  );
}

function ArrivalGreeter() {
  const key = useRef<THREE.SpotLight>(null);

  useFrame(() => {
    if (key.current) {
      key.current.target.position.copy(GREETER_FACE);
      key.current.target.updateMatrixWorld();
    }
  });

  // Face the visitor (+Z). Dedicated arrival camera sits further along +Z.
  return (
    <group position={[GREETER_POS.x, GREETER_POS.y, GREETER_POS.z]} rotation={[0, 0, 0]}>
      <Avatar animateWalk={false} />
      <spotLight
        ref={key}
        position={[0.55, 2.55, 10.8]}
        angle={0.4}
        penumbra={0.65}
        intensity={70}
        distance={10}
        color="#ffe8d0"
        castShadow={false}
      />
      <pointLight position={[0.35, 1.65, 9.8]} intensity={28} distance={4.5} color="#ffd4a8" />
      <pointLight position={[-0.9, 2.2, 8.6]} intensity={10} distance={4.5} color="#a8bce8" />
      <pointLight position={[0.9, 1.9, 9.2]} intensity={8} distance={3.5} color="#fff0dd" />
    </group>
  );
}

function InteractableMarkers() {
  const ref = useRef<THREE.Group>(null);
  const phase = useGame((s) => s.phase);
  const focus = useGame((s) => s.focus);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const nearId = useGame.getState().nearId;
    ref.current.children.forEach((child) => {
      const active = child.userData.id === nearId;
      const breathe = 1 + Math.sin(t * 2.6 + child.position.x) * 0.05;
      child.scale.setScalar(active ? breathe * 1.18 : breathe);
      const ring = child.children[0] as THREE.Mesh;
      const fill = child.children[1] as THREE.Mesh;
      const ringMat = ring.material as THREE.MeshStandardMaterial;
      const fillMat = fill.material as THREE.MeshBasicMaterial;
      ringMat.emissiveIntensity = active ? 2.4 : 0.7;
      ringMat.opacity = active ? 0.95 : 0.38;
      fillMat.opacity = active ? 0.18 : 0.05;
      child.rotation.y = t * (active ? 0.55 : 0.15);
    });
  });

  if (phase !== "inside" || focus) return null;

  return (
    <group ref={ref}>
      {INTERACTABLES.map((item) => (
        <group
          key={item.id}
          position={[item.position[0], item.position[1] + 0.035, item.position[2]]}
          userData={{ id: item.id }}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.42, 0.52, 40]} />
            <meshStandardMaterial
              color="#4ade80"
              emissive="#4ade80"
              emissiveIntensity={0.7}
              transparent
              opacity={0.38}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
            <circleGeometry args={[0.42, 40]} />
            <meshBasicMaterial
              color="#4ade80"
              transparent
              opacity={0.05}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CityBackdrop() {
  const buildings = useMemo(() => {
    const rand = (i: number) => {
      const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 14 }, (_, i) => ({
      x: -26 + i * 4 + rand(i) * 2.5,
      h: 5 + rand(i + 40) * 13,
      w: 2.4 + rand(i + 80) * 2.2,
      z: -20 - rand(i + 120) * 12,
    }));
  }, []);

  return (
    <group>
      {/* ground plane so the horizon isn't void */}
      <mesh position={[0, -0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0c0e13" roughness={1} />
      </mesh>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2 - 0.2, b.z]}>
          <boxGeometry args={[b.w, b.h, 3]} />
          <meshStandardMaterial
            color="#0d1017"
            emissive="#1a2438"
            emissiveIntensity={0.35}
            roughness={0.9}
          />
        </mesh>
      ))}
      {/* moon */}
      <mesh position={[-16, 22, -38]}>
        <sphereGeometry args={[2.2, 20, 20]} />
        <meshStandardMaterial color="#e9e6da" emissive="#e9e6da" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

export default function Experience() {
  const phase = useGame((s) => s.phase);

  return (
    <>
      <color attach="background" args={["#0b0d14"]} />
      <fog attach="fog" args={["#0b0d14", 22, 60]} />
      <Stars radius={70} depth={25} count={1600} factor={3.2} fade speed={0.6} />

      {/* lighting — cool moonlight + warm interior pools */}
      <ambientLight intensity={0.32} color="#7a8aad" />
      <hemisphereLight args={["#8fa3c8", "#2a2018", 0.35]} />
      <directionalLight
        position={[-8, 14, -12]}
        intensity={1.35}
        color="#b8c8e8"
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0002}
      />
      {/* warm interior lights */}
      <pointLight position={[-4.4, 2.3, -3.2]} intensity={28} distance={10} decay={2} color="#ffb45c" />
      <pointLight position={[-6.2, 2.3, -0.6]} intensity={16} distance={7} decay={2} color="#ffb45c" />
      <pointLight position={[5.9, 2.3, 4.9]} intensity={16} distance={7} decay={2} color="#ffb45c" />
      <pointLight position={[4.6, 4.6, -3.6]} intensity={14} distance={7} decay={2} color="#ffcf8a" />
      <pointLight position={[5.4, 2.4, -0.6]} intensity={12} distance={6} decay={2} color="#ffb45c" />
      {/* library nook */}
      <pointLight position={[5.2, 2.5, -4.2]} intensity={12} distance={5.5} decay={2} color="#ffcf8a" />
      {/* porch sconce */}
      <pointLight position={[0, 3.3, 7.2]} intensity={26} distance={10} decay={2} color="#ffb45c" />
      {/* soft fill from facade windows */}
      <pointLight position={[-3.6, 2.4, 6.0]} intensity={8} distance={5} decay={2} color="#ff9d45" />
      <pointLight position={[3.6, 2.4, 6.0]} intensity={8} distance={5} decay={2} color="#ff9d45" />

      <Physics timeStep={1 / 60}>
        <Loft />
        {phase === "inside" ? <Player /> : <ArrivalGreeter />}
      </Physics>

      <LibraryBooks />
      <VinylBrowser />
      <InteractableMarkers />
      <CityBackdrop />
      <Atmosphere />
      {/* Camera must mount before Effects so the composer binds the right lens */}
      {phase === "arrival" ? <ArrivalCamera /> : <InsideCameraRig />}
      <Effects />
      <AdaptiveDpr />
    </>
  );
}
