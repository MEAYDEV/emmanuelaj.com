import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CameraControls, Stars } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import Loft from "./Loft";
import Player from "./Player";
import Avatar from "./Avatar";
import { playerPosRef, useGame } from "../store";
import { INTERACTABLES } from "../data/content";

function CameraRig() {
  const controls = useRef<CameraControls>(null);
  const phase = useGame((s) => s.phase);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.smoothTime = 0.22;
    if (phase === "arrival") {
      c.enabled = false;
      c.setLookAt(0.3, 2.1, 11.6, 0.75, 1.35, 6.7, false);
    } else {
      c.enabled = true;
      c.setLookAt(0, 2.7, 5.8, 0, 1.5, 3.0, true);
    }
  }, [phase]);

  useFrame(() => {
    if (useGame.getState().phase !== "inside") return;
    const p = playerPosRef.current;
    controls.current?.moveTo(p.x, p.y + 0.6, p.z, true);
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={2.2}
      maxDistance={7}
      maxPolarAngle={Math.PI * 0.49}
      draggingSmoothTime={0.08}
    />
  );
}

function ArrivalGreeter() {
  return (
    <group position={[0.75, 0, 6.85]}>
      <Avatar animateWalk={false} />
    </group>
  );
}

function InteractableMarkers() {
  const ref = useRef<THREE.Group>(null);
  const phase = useGame((s) => s.phase);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const nearId = useGame.getState().nearId;
    ref.current.children.forEach((child) => {
      const active = child.userData.id === nearId;
      const s = 1 + Math.sin(t * 3 + child.position.x) * 0.06;
      child.scale.setScalar(active ? s * 1.15 : s);
      const mesh = child.children[0] as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = active ? 2.2 : 0.9;
      mat.opacity = active ? 0.95 : 0.5;
    });
  });

  if (phase !== "inside") return null;

  return (
    <group ref={ref}>
      {INTERACTABLES.map((item) => (
        <group
          key={item.id}
          position={[item.position[0], item.position[1] + 0.04, item.position[2]]}
          userData={{ id: item.id }}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.38, 0.5, 28]} />
            <meshStandardMaterial
              color="#4ade80"
              emissive="#4ade80"
              emissiveIntensity={0.9}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
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

      {/* lighting */}
      <ambientLight intensity={0.45} color="#8899bb" />
      <directionalLight
        position={[-6, 12, -10]}
        intensity={1.1}
        color="#aebfe8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      {/* warm interior lights */}
      <pointLight position={[-4.4, 2.3, -3.2]} intensity={22} distance={9} color="#ffb45c" />
      <pointLight position={[-6.2, 2.3, -0.6]} intensity={14} distance={7} color="#ffb45c" />
      <pointLight position={[5.9, 2.3, 4.9]} intensity={14} distance={7} color="#ffb45c" />
      <pointLight position={[4.6, 4.6, -3.6]} intensity={12} distance={7} color="#ffcf8a" />
      <pointLight position={[5.4, 2.4, -0.6]} intensity={10} distance={6} color="#ffb45c" />
      {/* porch light */}
      <pointLight position={[0, 3.0, 7.2]} intensity={16} distance={8} color="#ffb45c" />

      <Physics timeStep={1 / 60}>
        <Loft />
        {phase === "inside" ? <Player /> : <ArrivalGreeter />}
      </Physics>

      <InteractableMarkers />
      <CityBackdrop />
      <CameraRig />
    </>
  );
}
