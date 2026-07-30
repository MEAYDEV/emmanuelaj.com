import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { playerSpeedRef, useGame } from "../store";

/** Warm medium-dark skin — matches the portrait direction. */
const SKIN = "#a06a45";
const SKIN_DEEP = "#7c4f34";
const SKIN_LIGHT = "#b87d56";
const HAIR = "#1a1512";
const FLEECE = "#1e1f24";
const FLEECE_LIGHT = "#2c2e36";
const COLLAR = "#121318";
const JEANS = "#2a3142";
const JEANS_SEAM = "#1e2430";
const SHOE = "#eceae4";
const SHOE_SOLE = "#1a1a1c";

interface AvatarProps {
  showPlumbob?: boolean;
  animateWalk?: boolean;
}

/**
 * Stylized character — intentional silhouette, readable face from mid-distance,
 * quarter-zip fleece, afro + short beard. Motion: idle breath, walk cycle, wave.
 * Limbs are hinged groups so the silhouette stays connected from any angle.
 */
export default function Avatar({ showPlumbob = true, animateWalk = true }: AvatarProps) {
  const root = useRef<THREE.Group>(null);
  const hips = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const plumbob = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);

  const waveSeen = useRef(0);
  const waveT = useRef(99);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const pulse = useGame.getState().wavePulse;
    if (pulse !== waveSeen.current) {
      waveSeen.current = pulse;
      waveT.current = 0;
    }
    waveT.current += delta;

    const speed = animateWalk ? Math.min(playerSpeedRef.current / 3.6, 1) : 0;
    const walkPhase = t * 9.2;
    const swing = Math.sin(walkPhase) * 0.52 * speed;
    const breath = Math.sin(t * 1.85) * 0.012;
    const idle = speed < 0.12;
    const weight = idle ? Math.sin(t * 0.7) * 0.035 : 0;

    if (legL.current) {
      legL.current.rotation.x = THREE.MathUtils.damp(legL.current.rotation.x, swing, 12, delta);
      legL.current.rotation.z = THREE.MathUtils.damp(legL.current.rotation.z, weight * 0.4, 4, delta);
    }
    if (legR.current) {
      legR.current.rotation.x = THREE.MathUtils.damp(legR.current.rotation.x, -swing, 12, delta);
      legR.current.rotation.z = THREE.MathUtils.damp(legR.current.rotation.z, -weight * 0.4, 4, delta);
    }

    const waving = waveT.current < 1.95;
    if (armR.current) {
      if (waving) {
        const wiggle = Math.sin(waveT.current * 14) * 0.28;
        armR.current.rotation.z = THREE.MathUtils.damp(
          armR.current.rotation.z,
          -2.45 + wiggle,
          11,
          delta
        );
        armR.current.rotation.x = THREE.MathUtils.damp(armR.current.rotation.x, -0.4, 9, delta);
        armR.current.rotation.y = THREE.MathUtils.damp(armR.current.rotation.y, 0.35, 8, delta);
      } else {
        armR.current.rotation.z = THREE.MathUtils.damp(armR.current.rotation.z, 0.1 + weight, 6, delta);
        armR.current.rotation.x = THREE.MathUtils.damp(
          armR.current.rotation.x,
          -swing * 0.95,
          10,
          delta
        );
        armR.current.rotation.y = THREE.MathUtils.damp(armR.current.rotation.y, 0, 6, delta);
      }
    }
    if (armL.current) {
      armL.current.rotation.z = THREE.MathUtils.damp(armL.current.rotation.z, -0.1 - weight, 6, delta);
      armL.current.rotation.x = THREE.MathUtils.damp(armL.current.rotation.x, swing * 0.95, 10, delta);
    }

    if (hips.current) {
      hips.current.rotation.z = THREE.MathUtils.damp(hips.current.rotation.z, weight * 0.6, 4, delta);
      hips.current.position.y = breath * 0.25;
    }
    if (torso.current) {
      torso.current.scale.y = 1 + breath;
      torso.current.position.y = breath * 0.35;
      torso.current.rotation.y = THREE.MathUtils.damp(
        torso.current.rotation.y,
        Math.sin(walkPhase) * 0.06 * speed,
        8,
        delta
      );
    }
    if (head.current) {
      const look = idle && animateWalk ? Math.sin(t * 0.5) * 0.1 : idle ? Math.sin(t * 0.45) * 0.06 : 0;
      const nod = idle ? Math.sin(t * 0.9) * 0.025 : Math.abs(Math.sin(walkPhase)) * 0.03 * speed;
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, look, 3.2, delta);
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, nod, 4, delta);
      head.current.position.y = Math.abs(Math.sin(walkPhase)) * 0.018 * speed;
    }
    if (root.current) {
      root.current.position.y = Math.abs(Math.sin(walkPhase)) * 0.038 * speed;
    }
    if (plumbob.current) {
      plumbob.current.rotation.y = t * 1.9;
      plumbob.current.position.y = 2.42 + Math.sin(t * 2.35) * 0.065;
      const mat = plumbob.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.5 + Math.sin(t * 2.35) * 0.55;
    }
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.sin(t * 2.35) * 0.07;
      glow.current.scale.setScalar(1 + Math.sin(t * 2.35) * 0.1);
    }
  });

  return (
    <group ref={root}>
      {/* —— hips / pelvis (connects legs to torso — kills the floating-capsule look) —— */}
      <group ref={hips} position={[0, 0.98, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.2, 0.12, 6, 12]} />
          <meshStandardMaterial color={JEANS} roughness={0.88} />
        </mesh>
        {/* belt */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <torusGeometry args={[0.22, 0.028, 8, 24]} />
          <meshStandardMaterial color={JEANS_SEAM} roughness={0.7} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0.1, 0.22]}>
          <boxGeometry args={[0.06, 0.05, 0.03]} />
          <meshStandardMaterial color="#8b6a45" metalness={0.55} roughness={0.35} />
        </mesh>
      </group>

      {/* —— legs —— */}
      <group ref={legL} position={[-0.12, 0.92, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.095, 0.52, 6, 12]} />
          <meshStandardMaterial color={JEANS} roughness={0.88} />
        </mesh>
        {/* knee highlight */}
        <mesh position={[0, -0.38, 0.06]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color={JEANS_SEAM} roughness={0.9} />
        </mesh>
        {/* ankle / sock peek */}
        <mesh position={[0, -0.72, 0]} castShadow>
          <cylinderGeometry args={[0.072, 0.078, 0.1, 12]} />
          <meshStandardMaterial color="#c8c4bc" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.8, 0.08]} castShadow>
          <boxGeometry args={[0.17, 0.09, 0.32]} />
          <meshStandardMaterial color={SHOE} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.86, 0.03]}>
          <boxGeometry args={[0.17, 0.035, 0.34]} />
          <meshStandardMaterial color={SHOE_SOLE} roughness={0.92} />
        </mesh>
      </group>
      <group ref={legR} position={[0.12, 0.92, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.095, 0.52, 6, 12]} />
          <meshStandardMaterial color={JEANS} roughness={0.88} />
        </mesh>
        <mesh position={[0, -0.38, 0.06]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color={JEANS_SEAM} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.72, 0]} castShadow>
          <cylinderGeometry args={[0.072, 0.078, 0.1, 12]} />
          <meshStandardMaterial color="#c8c4bc" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.8, 0.08]} castShadow>
          <boxGeometry args={[0.17, 0.09, 0.32]} />
          <meshStandardMaterial color={SHOE} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.86, 0.03]}>
          <boxGeometry args={[0.17, 0.035, 0.34]} />
          <meshStandardMaterial color={SHOE_SOLE} roughness={0.92} />
        </mesh>
      </group>

      {/* —— torso: quarter-zip fleece silhouette —— */}
      <group ref={torso} position={[0, 1.22, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.255, 0.5, 6, 14]} />
          <meshStandardMaterial color={FLEECE} roughness={0.8} />
        </mesh>
        {/* chest panel / zip channel */}
        <mesh position={[0, 0.06, 0.235]} castShadow>
          <boxGeometry args={[0.055, 0.52, 0.018]} />
          <meshStandardMaterial color={FLEECE_LIGHT} roughness={0.65} metalness={0.12} />
        </mesh>
        {/* zipper pull */}
        <mesh position={[0, 0.2, 0.255]}>
          <boxGeometry args={[0.038, 0.065, 0.022]} />
          <meshStandardMaterial color="#8b6a45" metalness={0.55} roughness={0.35} />
        </mesh>
        {/* collar */}
        <mesh position={[0, 0.36, 0.01]} castShadow>
          <cylinderGeometry args={[0.14, 0.185, 0.11, 14]} />
          <meshStandardMaterial color={COLLAR} roughness={0.85} />
        </mesh>
        {/* shoulders — glued to torso so arms don't float */}
        <mesh position={[-0.27, 0.24, 0]} castShadow>
          <sphereGeometry args={[0.125, 14, 14]} />
          <meshStandardMaterial color={FLEECE} roughness={0.8} />
        </mesh>
        <mesh position={[0.27, 0.24, 0]} castShadow>
          <sphereGeometry args={[0.125, 14, 14]} />
          <meshStandardMaterial color={FLEECE} roughness={0.8} />
        </mesh>
      </group>

      {/* —— arms: upper + forearm + hand —— */}
      <group ref={armL} position={[-0.3, 1.42, 0]}>
        <mesh position={[-0.02, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.078, 0.28, 5, 12]} />
          <meshStandardMaterial color={FLEECE} roughness={0.8} />
        </mesh>
        <mesh position={[-0.02, -0.42, 0]} castShadow>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={FLEECE} roughness={0.8} />
        </mesh>
        <mesh position={[-0.02, -0.58, 0]} castShadow>
          <capsuleGeometry args={[0.065, 0.18, 5, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
        <mesh position={[-0.02, -0.72, 0.02]} castShadow>
          <sphereGeometry args={[0.068, 12, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
      </group>
      <group ref={armR} position={[0.3, 1.42, 0]}>
        <mesh position={[0.02, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.078, 0.28, 5, 12]} />
          <meshStandardMaterial color={FLEECE} roughness={0.8} />
        </mesh>
        <mesh position={[0.02, -0.42, 0]} castShadow>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={FLEECE} roughness={0.8} />
        </mesh>
        <mesh position={[0.02, -0.58, 0]} castShadow>
          <capsuleGeometry args={[0.065, 0.18, 5, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
        <mesh position={[0.02, -0.72, 0.02]} castShadow>
          <sphereGeometry args={[0.068, 12, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
      </group>

      {/* —— head —— */}
      <group ref={head} position={[0, 1.82, 0]}>
        {/* neck */}
        <mesh position={[0, -0.18, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.085, 0.12, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.65} />
        </mesh>
        <mesh castShadow>
          <sphereGeometry args={[0.215, 28, 28]} />
          <meshStandardMaterial color={SKIN} roughness={0.58} />
        </mesh>
        {/* cheek warmth */}
        <mesh position={[-0.12, -0.02, 0.12]} scale={[0.55, 0.45, 0.4]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color={SKIN_LIGHT} roughness={0.7} transparent opacity={0.45} />
        </mesh>
        <mesh position={[0.12, -0.02, 0.12]} scale={[0.55, 0.45, 0.4]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color={SKIN_LIGHT} roughness={0.7} transparent opacity={0.45} />
        </mesh>
        {/* ears */}
        <mesh position={[-0.2, 0, 0]} rotation={[0, 0, 0.3]} castShadow>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color={SKIN_DEEP} roughness={0.7} />
        </mesh>
        <mesh position={[0.2, 0, 0]} rotation={[0, 0, -0.3]} castShadow>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color={SKIN_DEEP} roughness={0.7} />
        </mesh>
        {/* short afro with fade volume */}
        <mesh position={[0, 0.085, -0.01]} castShadow>
          <sphereGeometry args={[0.232, 22, 22, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial color={HAIR} roughness={1} />
        </mesh>
        <mesh position={[-0.155, 0.02, 0]} scale={[0.55, 0.72, 0.72]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color={HAIR} roughness={1} />
        </mesh>
        <mesh position={[0.155, 0.02, 0]} scale={[0.55, 0.72, 0.72]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color={HAIR} roughness={1} />
        </mesh>
        {/* short beard / mustache silhouette */}
        <mesh position={[0, -0.1, 0.105]} scale={[0.8, 0.36, 0.52]}>
          <sphereGeometry args={[0.19, 16, 16]} />
          <meshStandardMaterial color={HAIR} roughness={1} />
        </mesh>
        {/* brows */}
        <mesh position={[-0.07, 0.085, 0.188]} rotation={[0.12, 0, 0.14]}>
          <boxGeometry args={[0.072, 0.014, 0.018]} />
          <meshStandardMaterial color={HAIR} roughness={1} />
        </mesh>
        <mesh position={[0.07, 0.085, 0.188]} rotation={[0.12, 0, -0.14]}>
          <boxGeometry args={[0.072, 0.014, 0.018]} />
          <meshStandardMaterial color={HAIR} roughness={1} />
        </mesh>
        {/* eyes — slightly emissive whites so they read at night */}
        <mesh position={[-0.065, 0.028, 0.192]}>
          <sphereGeometry args={[0.032, 14, 14]} />
          <meshStandardMaterial color="#f7f4ee" roughness={0.2} emissive="#f7f4ee" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0.065, 0.028, 0.192]}>
          <sphereGeometry args={[0.032, 14, 14]} />
          <meshStandardMaterial color="#f7f4ee" roughness={0.2} emissive="#f7f4ee" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[-0.065, 0.028, 0.22]}>
          <sphereGeometry args={[0.016, 12, 12]} />
          <meshStandardMaterial color="#2a1c12" roughness={0.3} />
        </mesh>
        <mesh position={[0.065, 0.028, 0.22]}>
          <sphereGeometry args={[0.016, 12, 12]} />
          <meshStandardMaterial color="#2a1c12" roughness={0.3} />
        </mesh>
        {/* catchlights */}
        <mesh position={[-0.057, 0.036, 0.232]}>
          <sphereGeometry args={[0.006, 6, 6]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
        <mesh position={[0.073, 0.036, 0.232]}>
          <sphereGeometry args={[0.006, 6, 6]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
        {/* nose */}
        <mesh position={[0, -0.012, 0.208]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color={SKIN_DEEP} roughness={0.68} />
        </mesh>
        {/* soft smile */}
        <mesh position={[0, -0.072, 0.188]} rotation={[0.28, 0, 0]}>
          <torusGeometry args={[0.042, 0.009, 6, 14, Math.PI]} />
          <meshStandardMaterial color={SKIN_DEEP} roughness={0.7} />
        </mesh>
      </group>

      {/* —— Sims plumbob + soft glow —— */}
      {showPlumbob && (
        <group>
          <mesh ref={plumbob} position={[0, 2.42, 0]} scale={[0.135, 0.235, 0.135]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color="#34d399"
              emissive="#10b981"
              emissiveIntensity={1.5}
              roughness={0.18}
              metalness={0.18}
            />
          </mesh>
          <mesh ref={glow} position={[0, 2.42, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={0.2} depthWrite={false} />
          </mesh>
        </group>
      )}
    </group>
  );
}
