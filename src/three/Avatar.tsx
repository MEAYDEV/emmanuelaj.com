import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { playerSpeedRef, useGame } from "../store";

const SKIN = "#96613f";
const HAIR = "#171512";
const SWEATER = "#26262b";
const JEANS = "#262b3a";
const SHOE = "#e8e6e0";

interface AvatarProps {
  showPlumbob?: boolean;
  /** when false the avatar ignores playerSpeedRef (arrival greeter) */
  animateWalk?: boolean;
}

export default function Avatar({ showPlumbob = true, animateWalk = true }: AvatarProps) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Mesh>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const plumbob = useRef<THREE.Mesh>(null);

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

    const speed = animateWalk ? Math.min(playerSpeedRef.current / 4, 1) : 0;
    const swing = Math.sin(t * 9) * 0.55 * speed;

    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;

    const waving = waveT.current < 1.7;
    if (armR.current) {
      if (waving) {
        // arm raised, hand wiggling
        armR.current.rotation.z = THREE.MathUtils.lerp(
          armR.current.rotation.z,
          -2.5 + Math.sin(waveT.current * 14) * 0.28,
          0.25
        );
        armR.current.rotation.x = 0;
      } else {
        armR.current.rotation.z = THREE.MathUtils.lerp(armR.current.rotation.z, 0, 0.12);
        armR.current.rotation.x = -swing;
      }
    }
    if (armL.current) armL.current.rotation.x = swing;

    if (torso.current) {
      torso.current.scale.y = 1 + Math.sin(t * 2.2) * 0.012;
    }
    if (root.current) {
      root.current.position.y = Math.abs(Math.sin(t * 9)) * 0.05 * speed;
    }
    if (plumbob.current) {
      plumbob.current.rotation.y = t * 2.2;
      plumbob.current.position.y = 2.32 + Math.sin(t * 2.6) * 0.05;
    }
  });

  return (
    <group ref={root}>
      {/* legs */}
      <group ref={legL} position={[-0.14, 0.95, 0]}>
        <mesh position={[0, -0.42, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.62, 4, 10]} />
          <meshStandardMaterial color={JEANS} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.86, 0.06]} castShadow>
          <boxGeometry args={[0.17, 0.12, 0.32]} />
          <meshStandardMaterial color={SHOE} roughness={0.6} />
        </mesh>
      </group>
      <group ref={legR} position={[0.14, 0.95, 0]}>
        <mesh position={[0, -0.42, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.62, 4, 10]} />
          <meshStandardMaterial color={JEANS} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.86, 0.06]} castShadow>
          <boxGeometry args={[0.17, 0.12, 0.32]} />
          <meshStandardMaterial color={SHOE} roughness={0.6} />
        </mesh>
      </group>

      {/* torso */}
      <mesh ref={torso} position={[0, 1.22, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.52, 4, 12]} />
        <meshStandardMaterial color={SWEATER} roughness={0.85} />
      </mesh>
      {/* collar */}
      <mesh position={[0, 1.52, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.12, 12]} />
        <meshStandardMaterial color={"#1b1b1f"} roughness={0.85} />
      </mesh>

      {/* arms */}
      <group ref={armL} position={[-0.36, 1.42, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.44, 4, 10]} />
          <meshStandardMaterial color={SWEATER} roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.56, 0]} castShadow>
          <sphereGeometry args={[0.085, 10, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.7} />
        </mesh>
      </group>
      <group ref={armR} position={[0.36, 1.42, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.44, 4, 10]} />
          <meshStandardMaterial color={SWEATER} roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.56, 0]} castShadow>
          <sphereGeometry args={[0.085, 10, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.7} />
        </mesh>
      </group>

      {/* head */}
      <group position={[0, 1.82, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.23, 20, 20]} />
          <meshStandardMaterial color={SKIN} roughness={0.7} />
        </mesh>
        {/* hair */}
        <mesh position={[0, 0.115, -0.02]}>
          <sphereGeometry args={[0.235, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.44]} />
          <meshStandardMaterial color={HAIR} roughness={1} />
        </mesh>
        {/* beard: chin + jawline patch, keeps the face visible */}
        <mesh position={[0, -0.115, 0.085]} scale={[0.85, 0.5, 0.7]}>
          <sphereGeometry args={[0.21, 16, 16, 0, Math.PI * 2, Math.PI * 0.48, Math.PI * 0.52]} />
          <meshStandardMaterial color={HAIR} roughness={1} />
        </mesh>
        {/* eyes */}
        <mesh position={[-0.08, 0.03, 0.195]}>
          <sphereGeometry args={[0.036, 10, 10]} />
          <meshStandardMaterial color="#f6f4ee" roughness={0.3} />
        </mesh>
        <mesh position={[0.08, 0.03, 0.195]}>
          <sphereGeometry args={[0.036, 10, 10]} />
          <meshStandardMaterial color="#f6f4ee" roughness={0.3} />
        </mesh>
        <mesh position={[-0.08, 0.03, 0.225]}>
          <sphereGeometry args={[0.017, 8, 8]} />
          <meshStandardMaterial color="#241c14" roughness={0.4} />
        </mesh>
        <mesh position={[0.08, 0.03, 0.225]}>
          <sphereGeometry args={[0.017, 8, 8]} />
          <meshStandardMaterial color="#241c14" roughness={0.4} />
        </mesh>
      </group>

      {showPlumbob && (
        <mesh ref={plumbob} position={[0, 2.32, 0]} scale={[0.16, 0.28, 0.16]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#16a34a"
            emissive="#15803d"
            emissiveIntensity={1.1}
            roughness={0.25}
          />
        </mesh>
      )}
    </group>
  );
}
