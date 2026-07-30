import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

/** Floating dust motes caught in the light — sells the "lived-in loft at night" feel. */
function Dust() {
  const group = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const count = 220;
    const positions = new Float32Array(count * 3);
    const rand = (i: number) => {
      const x = Math.sin(i * 78.233 + 43.7) * 43758.5453;
      return x - Math.floor(x);
    };
    for (let i = 0; i < count; i++) {
      positions[i * 3] = -6.8 + rand(i) * 13.6;
      positions[i * 3 + 1] = 0.2 + rand(i + 300) * 6.2;
      positions[i * 3 + 2] = -5.8 + rand(i + 600) * 11.6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = t * 0.008;
      group.current.position.y = Math.sin(t * 0.14) * 0.25;
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <pointsMaterial
          color="#ffe2b0"
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.32}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/** Soft diagonal moonlight shafts falling in from the window wall. */
function LightShafts() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "rgba(255,255,255,0.85)");
    grad.addColorStop(0.55, "rgba(255,255,255,0.28)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const shaft = (x: number, w: number, o: number) => (
    <mesh key={x} position={[x, 3.3, -3.1]} rotation={[-0.62, 0, 0]}>
      <planeGeometry args={[w, 7.2]} />
      <meshBasicMaterial
        map={texture}
        color="#8fa8d8"
        transparent
        opacity={o}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );

  return (
    <group>
      {shaft(-4.4, 1.9, 0.055)}
      {shaft(-1.6, 1.5, 0.04)}
      {shaft(1.2, 1.7, 0.05)}
    </group>
  );
}

/** Procedural environment reflections (no HDR download) — subtle sheen on floors and steel. */
function Reflections() {
  return (
    <Environment resolution={64} environmentIntensity={0.35}>
      <Lightformer intensity={1.4} color="#aebfe8" position={[0, 4, -9]} scale={[12, 5, 1]} />
      <Lightformer intensity={0.7} color="#ffb45c" position={[-6, 2.4, 0]} rotation-y={Math.PI / 2} scale={[7, 2.5, 1]} />
      <Lightformer intensity={0.5} color="#ffcf8a" position={[5, 2, 3]} rotation-y={-Math.PI / 2} scale={[5, 2, 1]} />
      <Lightformer intensity={0.35} color="#6f87c9" position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
    </Environment>
  );
}

export default function Atmosphere() {
  return (
    <group>
      <Dust />
      <LightShafts />
      <Reflections />
    </group>
  );
}
