import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BEATS, playBeat, useGame } from "../store";
import { GENRE_COLORS, makeSleeveTexture } from "./textures";

/** Center of the flip-through display, above the crate. */
const CENTER = new THREE.Vector3(6.0, 1.45, 2.75);

function Sleeve({ index }: { index: number }) {
  const beat = BEATS[index];
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);

  const texture = useMemo(
    () =>
      makeSleeveTexture(
        beat.title,
        beat.genre,
        GENRE_COLORS[beat.genre] ?? "#8c5a7a"
      ),
    [beat]
  );

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    const m = mesh.current;
    if (!m || !mat.current) return;
    const g = useGame.getState();
    const active = g.focus === "vinyl";
    const offset = index - g.vinylIndex;
    const abs = Math.abs(offset);

    // current sleeve front and center, neighbors fanned behind
    const target = new THREE.Vector3(
      CENTER.x + Math.min(abs, 3) * 0.13,
      CENTER.y - Math.min(abs, 3) * 0.05,
      CENTER.z + offset * 0.3
    );
    m.position.lerp(target, 0.16);

    const targetRot = offset === 0 ? -Math.PI / 2 : -Math.PI / 2 + offset * 0.12;
    m.rotation.y = THREE.MathUtils.lerp(m.rotation.y, targetRot, 0.14);

    const targetOpacity = !active ? 0 : abs === 0 ? 1 : abs < 4 ? 0.55 - abs * 0.12 : 0;
    mat.current.opacity = THREE.MathUtils.lerp(mat.current.opacity, targetOpacity, 0.16);
    m.visible = mat.current.opacity > 0.02;
  });

  return (
    <mesh
      ref={mesh}
      position={CENTER.toArray()}
      rotation={[0, -Math.PI / 2, 0]}
      onClick={(e) => {
        const g = useGame.getState();
        if (g.focus !== "vinyl") return;
        e.stopPropagation();
        if (g.vinylIndex === index) playBeat(beat);
        else g.setVinylIndex(index);
      }}
      onPointerOver={(e) => {
        if (useGame.getState().focus !== "vinyl") return;
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <planeGeometry args={[0.92, 0.92]} />
      <meshStandardMaterial
        ref={mat}
        map={texture}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        roughness={0.7}
      />
    </mesh>
  );
}

export default function VinylBrowser() {
  return (
    <group>
      {BEATS.map((b, i) => (
        <Sleeve key={b.id} index={i} />
      ))}
    </group>
  );
}
