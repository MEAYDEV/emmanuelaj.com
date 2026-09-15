import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";
import { useGame } from "../store";
import { makeBrickTexture, makeWoodFloorTexture, makeRugTexture } from "./textures";

/* palette */
const BRICK = "#63413a";
const WOOD_FLOOR = "#7a5c40";
const WOOD_WARM = "#8a6a4a";
const STEEL = "#191c22";
const CHARCOAL = "#26292f";
const CREAM = "#c9c0b0";

function Bx({
  p,
  s,
  c,
  r = [0, 0, 0],
  rough = 0.9,
  metal = 0,
  emissive,
  ei = 0,
  shadow = true,
  map,
}: {
  p: [number, number, number];
  s: [number, number, number];
  c: string;
  r?: [number, number, number];
  rough?: number;
  metal?: number;
  emissive?: string;
  ei?: number;
  shadow?: boolean;
  map?: THREE.Texture;
}) {
  return (
    <mesh position={p} rotation={r} castShadow={shadow} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial
        color={c}
        map={map}
        roughness={rough}
        metalness={metal}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={ei}
      />
    </mesh>
  );
}

/* ---------------- structural shell (all solid) ---------------- */

function Shell() {
  const brickMap = useMemo(() => makeBrickTexture(), []);
  const floorMap = useMemo(() => makeWoodFloorTexture(), []);

  return (
    <group userData={{ cameraCollide: true }}>
      {/* floors — slight sheen picks up the environment reflections */}
      <Bx p={[0, -0.1, 0]} s={[14.4, 0.2, 12.4]} c={WOOD_FLOOR} rough={0.55} metal={0.06} map={floorMap} />
      <Bx p={[0, -0.11, 8.6]} s={[20, 0.2, 5.4]} c="#3a3d45" />

      {/* side walls */}
      <Bx p={[-7.2, 3.5, 0]} s={[0.4, 7.2, 12.4]} c={BRICK} map={brickMap} />
      <Bx p={[7.2, 3.5, 0]} s={[0.4, 7.2, 12.4]} c={BRICK} map={brickMap} />

      {/* back window wall */}
      <Bx p={[0, 3.5, -6.2]} s={[14.8, 7.2, 0.4]} c={STEEL} />

      {/* front wall with door opening */}
      <Bx p={[-4, 3.5, 6.2]} s={[6.8, 7.2, 0.4]} c={BRICK} map={brickMap} />
      <Bx p={[4, 3.5, 6.2]} s={[6.8, 7.2, 0.4]} c={BRICK} map={brickMap} />
      <Bx p={[0, 4.85, 6.2]} s={[1.3, 4.7, 0.4]} c={BRICK} map={brickMap} />

      {/* ceiling */}
      <Bx p={[0, 7.15, 0]} s={[14.8, 0.2, 12.8]} c="#17181d" shadow={false} />

      {/* mezzanine platform */}
      <Bx p={[4.6, 3.2, -3]} s={[4.8, 0.25, 6]} c={WOOD_WARM} rough={0.7} />

      {/* mezzanine railing */}
      {Array.from({ length: 8 }, (_, i) => (
        <Bx
          key={`rz${i}`}
          p={[2.25, 3.7, -5.7 + i * 0.78]}
          s={[0.06, 0.85, 0.06]}
          c={STEEL}
          metal={0.6}
          rough={0.4}
        />
      ))}
      <Bx p={[2.25, 4.15, -3]} s={[0.08, 0.08, 6]} c={STEEL} metal={0.6} rough={0.4} />
      {Array.from({ length: 6 }, (_, i) => (
        <Bx
          key={`rx${i}`}
          p={[2.6 + i * 0.85, 3.7, -0.06]}
          s={[0.06, 0.85, 0.06]}
          c={STEEL}
          metal={0.6}
          rough={0.4}
        />
      ))}
      <Bx p={[4.6, 4.15, -0.06]} s={[4.8, 0.08, 0.08]} c={STEEL} metal={0.6} rough={0.4} />

      {/* support column */}
      <Bx p={[2.25, 1.6, -0.05]} s={[0.2, 3.2, 0.2]} c={STEEL} metal={0.5} rough={0.5} />

      {/* spiral staircase */}
      <SpiralStairs />

      {/* --- big furniture (solid) --- */}
      {/* sofa facing TV (left wall) */}
      <Bx p={[-3.3, 0.35, -3.2]} s={[1.0, 0.55, 2.3]} c="#3f5d4e" rough={0.95} />
      <Bx p={[-2.85, 0.85, -3.2]} s={[0.28, 1.0, 2.3]} c="#365144" rough={0.95} />
      <Bx p={[-3.3, 0.68, -1.95]} s={[1.0, 0.42, 0.26]} c="#365144" rough={0.95} />
      <Bx p={[-3.3, 0.68, -4.45]} s={[1.0, 0.42, 0.26]} c="#365144" rough={0.95} />
      {/* seat cushions */}
      <Bx p={[-3.25, 0.68, -2.7]} s={[0.85, 0.14, 0.85]} c="#4a6d5a" rough={1} />
      <Bx p={[-3.25, 0.68, -3.7]} s={[0.85, 0.14, 0.85]} c="#456856" rough={1} />

      {/* coffee table */}
      <Bx p={[-4.7, 0.24, -3.2]} s={[0.8, 0.3, 1.5]} c={CHARCOAL} rough={0.6} />

      {/* TV console */}
      <Bx p={[-6.75, 0.35, -3.2]} s={[0.5, 0.7, 2.6]} c={CHARCOAL} rough={0.7} />

      {/* kitchen counter along back wall */}
      <Bx p={[-4.5, 0.5, -5.4]} s={[4.4, 1.0, 1.1]} c="#23262d" rough={0.7} />
      <Bx p={[-4.5, 1.03, -5.4]} s={[4.55, 0.07, 1.2]} c={CREAM} rough={0.4} />

      {/* bookshelf under mezzanine, against right wall (open-front unit) */}
      <Bx p={[6.88, 1.5, -4.2]} s={[0.18, 3.0, 2.7]} c="#4e3a29" rough={0.85} />
      <Bx p={[6.66, 1.5, -2.88]} s={[0.5, 3.0, 0.09]} c="#4e3a29" rough={0.85} />
      <Bx p={[6.66, 1.5, -5.52]} s={[0.5, 3.0, 0.09]} c="#4e3a29" rough={0.85} />
      <Bx p={[6.66, 2.97, -4.2]} s={[0.5, 0.09, 2.73]} c="#4e3a29" rough={0.85} />
      <Bx p={[6.66, 0.26, -4.2]} s={[0.5, 0.52, 2.73]} c="#3c2c1f" rough={0.85} />

      {/* vinyl stand + crate */}
      <Bx p={[6.55, 0.45, 1.6]} s={[0.75, 0.9, 1.5]} c={CHARCOAL} rough={0.7} />
      <Bx p={[6.5, 0.31, 2.95]} s={[0.62, 0.62, 0.72]} c={WOOD_WARM} rough={0.9} />

      {/* desk against left wall */}
      <Bx p={[-6.55, 0.4, 3.4]} s={[0.8, 0.8, 2.0]} c={WOOD_WARM} rough={0.8} />

      {/* mezzanine bed */}
      <Bx p={[5.2, 3.55, -4.6]} s={[2.2, 0.42, 1.9]} c="#3b3f4c" rough={0.95} />
      <Bx p={[6.15, 3.95, -4.6]} s={[0.25, 0.9, 1.9]} c="#2e323d" rough={0.95} />

      {/* mezzanine dresser */}
      <Bx p={[2.9, 3.72, -5.55]} s={[1.3, 0.8, 0.5]} c={CHARCOAL} rough={0.7} />
    </group>
  );
}

function SpiralStairs() {
  const steps = useMemo(() => {
    const arr: { p: [number, number, number]; rotY: number }[] = [];
    const cx = 3.35;
    const cz = 1.75;
    const n = 14;
    const a0 = Math.PI * 0.9;
    const da = -(Math.PI * 1.42) / n;
    for (let i = 0; i < n; i++) {
      const a = a0 + da * i;
      arr.push({
        p: [cx + Math.cos(a) * 0.68, 0.12 + i * 0.22, cz + Math.sin(a) * 0.68],
        rotY: -a + Math.PI / 2,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {/* center pole */}
      <mesh position={[3.35, 1.7, 1.75]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 3.4, 12]} />
        <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.4} />
      </mesh>
      {steps.map((s, i) => (
        <Bx
          key={i}
          p={s.p}
          r={[0, s.rotY, 0]}
          s={[1.15, 0.07, 0.4]}
          c={WOOD_WARM}
          rough={0.7}
        />
      ))}
      {/* top landing bridging to mezzanine */}
      <Bx p={[3.4, 3.26, 0.5]} s={[1.4, 0.12, 1.1]} c={WOOD_WARM} rough={0.7} />
    </group>
  );
}

/* ---------------- decorative (no colliders) ---------------- */

const SPINE_COLORS = ["#b5543c", "#c9a24a", "#5f7d5a", "#4a6d8c", "#8c5a7a", "#c97b4a", "#7a8c93", "#a44a42"];

function Decor() {
  const rugWarm = useMemo(() => makeRugTexture("#8a4f3d", "#c9a24a"), []);
  const rugCool = useMemo(() => makeRugTexture("#44506e", "#8fa8d8"), []);

  return (
    <group>
      {/* window panes + mullions on back wall */}
      {Array.from({ length: 6 }, (_, col) =>
        Array.from({ length: 3 }, (_, row) => (
          <mesh
            key={`pane-${col}-${row}`}
            position={[-5.5 + col * 2.2, 1.65 + row * 2.05, -5.97]}
          >
            <planeGeometry args={[1.95, 1.85]} />
            <meshStandardMaterial
              color="#101a2e"
              emissive="#182b52"
              emissiveIntensity={0.55}
              roughness={0.15}
              metalness={0.4}
            />
          </mesh>
        ))
      )}

      {/* ceiling beams */}
      {[-4.2, -1.6, 1, 3.6].map((z) => (
        <Bx key={z} p={[0, 6.55, z]} s={[14.4, 0.28, 0.32]} c={STEEL} metal={0.5} rough={0.5} shadow={false} />
      ))}

      {/* rugs */}
      <mesh position={[-4.4, 0.02, -3.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.9, 48]} />
        <meshStandardMaterial map={rugWarm} color="#ffffff" roughness={1} />
      </mesh>
      <mesh position={[0.4, 0.02, 2.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.5, 48]} />
        <meshStandardMaterial map={rugCool} color="#ffffff" roughness={1} />
      </mesh>

      {/* TV: frame + screen */}
      <Bx p={[-6.52, 1.85, -3.2]} s={[0.08, 1.42, 2.5]} c="#0a0b0e" rough={0.4} />
      <mesh position={[-6.47, 1.85, -3.2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.3, 1.25]} />
        <meshStandardMaterial color="#0e1420" emissive="#1d2f42" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>

      {/* bookshelf boards + spines */}
      {[0.55, 1.35, 2.15, 2.9].map((y) => (
        <Bx key={y} p={[6.6, y, -4.2]} s={[0.4, 0.05, 2.6]} c="#3c2c1f" rough={0.9} />
      ))}
      {/* decorative spines on top + bottom rows; middle row holds the real books */}
      {[0.55, 2.15].map((rowY, row) =>
        Array.from({ length: 11 }, (_, i) => {
          const h = 0.3 + ((i * 7 + row * 3) % 4) * 0.035;
          return (
            <Bx
              key={`sp-${row}-${i}`}
              p={[6.58, rowY + h / 2 + 0.03, -5.35 + i * 0.21]}
              s={[0.24, h, 0.14]}
              c={SPINE_COLORS[(i + row * 3) % SPINE_COLORS.length]}
              rough={0.85}
            />
          );
        })
      )}
      {/* photo book on the mezzanine dresser */}
      <Bx p={[2.9, 4.16, -5.5]} s={[0.34, 0.06, 0.26]} c="#7a3b2e" rough={0.8} />
      <Bx p={[2.9, 4.2, -5.5]} s={[0.3, 0.025, 0.22]} c={CREAM} rough={0.9} />

      {/* desk decor: laptop */}
      <Bx p={[-6.45, 0.83, 3.4]} s={[0.34, 0.025, 0.5]} c="#9aa0a8" metal={0.6} rough={0.4} />
      <mesh position={[-6.62, 0.99, 3.4]} rotation={[0, Math.PI / 2, -0.35]}>
        <boxGeometry args={[0.5, 0.34, 0.02]} />
        <meshStandardMaterial color="#0f141c" emissive="#2b4a66" emissiveIntensity={1.1} roughness={0.3} />
      </mesh>
      {/* desk chair */}
      <Bx p={[-5.6, 0.45, 3.4]} s={[0.5, 0.08, 0.5]} c={CHARCOAL} rough={0.6} />
      <Bx p={[-5.6, 0.22, 3.4]} s={[0.08, 0.4, 0.08]} c={STEEL} metal={0.5} />
      <Bx p={[-5.36, 0.8, 3.4]} s={[0.08, 0.65, 0.5]} c={CHARCOAL} rough={0.6} />

      {/* kitchen stools */}
      {[-3.3, -4.5, -5.7].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.56, -4.55]} castShadow>
            <cylinderGeometry args={[0.2, 0.22, 0.07, 14]} />
            <meshStandardMaterial color={WOOD_WARM} roughness={0.8} />
          </mesh>
          <mesh position={[x, 0.27, -4.55]}>
            <cylinderGeometry args={[0.04, 0.04, 0.52, 8]} />
            <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* bed duvet + pillows */}
      <Bx p={[4.9, 3.82, -4.6]} s={[1.5, 0.14, 1.7]} c="#5d7263" rough={1} />
      <Bx p={[5.95, 3.85, -5.1]} s={[0.45, 0.14, 0.6]} c={CREAM} rough={1} />
      <Bx p={[5.95, 3.85, -4.15]} s={[0.45, 0.14, 0.6]} c={CREAM} rough={1} />

      {/* posters on right wall above bed (mezzanine) */}
      <Poster p={[6.94, 4.9, -5.0]} base="#2f6e4f">
        {/* futbol: white circle */}
        <mesh position={[0, 0.06, 0.011]}>
          <circleGeometry args={[0.2, 24]} />
          <meshStandardMaterial color="#f2efe6" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.06, 0.012]}>
          <circleGeometry args={[0.08, 5]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.8} />
        </mesh>
      </Poster>
      <Poster p={[6.94, 4.9, -3.7]} base="#1d1d22">
        {/* piano keys */}
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[-0.24 + i * 0.12, -0.18, 0.011]}>
            <planeGeometry args={[0.1, 0.42]} />
            <meshStandardMaterial color="#f2efe6" roughness={0.8} />
          </mesh>
        ))}
        {[0, 1, 3].map((i) => (
          <mesh key={i} position={[-0.18 + i * 0.12, -0.1, 0.012]}>
            <planeGeometry args={[0.06, 0.26]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
        ))}
      </Poster>
      <Poster p={[6.94, 4.9, -2.4]} base="#8f4032">
        {/* barbell */}
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[0.5, 0.05]} />
          <meshStandardMaterial color="#f2efe6" roughness={0.8} />
        </mesh>
        <mesh position={[-0.2, 0, 0.012]}>
          <planeGeometry args={[0.07, 0.24]} />
          <meshStandardMaterial color="#f2efe6" roughness={0.8} />
        </mesh>
        <mesh position={[0.2, 0, 0.012]}>
          <planeGeometry args={[0.07, 0.24]} />
          <meshStandardMaterial color="#f2efe6" roughness={0.8} />
        </mesh>
      </Poster>
      <Poster p={[6.94, 4.9, -1.1]} base="#b26a2f">
        {/* waveform */}
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[-0.24 + i * 0.06, 0, 0.011]}>
            <planeGeometry args={[0.035, 0.12 + Math.abs(Math.sin(i * 1.7)) * 0.34]} />
            <meshStandardMaterial color="#f8e9d2" roughness={0.8} />
          </mesh>
        ))}
      </Poster>

      {/* plants */}
      <Plant p={[-6.3, 0, 5.2]} />
      <Plant p={[6.3, 0, 5.2]} />
      <Plant p={[2.75, 3.33, -0.7]} small />

      {/* floor lamps */}
      <Lamp p={[-6.2, 0, -0.6]} />
      <Lamp p={[5.9, 0, 4.9]} />

      {/* pendant over living area */}
      <mesh position={[-4.4, 4.5, -3.2]}>
        <cylinderGeometry args={[0.01, 0.01, 5, 6]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[-4.4, 2.15, -3.2]}>
        <cylinderGeometry args={[0.3, 0.42, 0.3, 18, 1, true]} />
        <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-4.4, 2.05, -3.2]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#ffd9a0" emissive="#ffb45c" emissiveIntensity={2.4} />
      </mesh>

      {/* exterior: stoop, mailbox, wall lamp, planters, steel canopy */}
      <Bx p={[0, 0.01, 7.05]} s={[1.9, 0.03, 1.2]} c="#5c4a3a" rough={1} />
      {/* stoop edge strip */}
      <Bx p={[0, 0.04, 7.65]} s={[1.9, 0.06, 0.08]} c="#3a3228" rough={0.9} />
      {/* steel canopy over the door */}
      <Bx p={[0, 2.95, 6.85]} s={[2.4, 0.06, 1.1]} c="#12141a" metal={0.55} rough={0.35} />
      <Bx p={[-1.05, 2.55, 6.55]} s={[0.05, 0.8, 0.05]} c={STEEL} metal={0.55} rough={0.4} shadow={false} />
      <Bx p={[1.05, 2.55, 6.55]} s={[0.05, 0.8, 0.05]} c={STEEL} metal={0.55} rough={0.4} shadow={false} />
      <group position={[1.6, 0, 8.2]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 1.0, 8]} />
          <meshStandardMaterial color={STEEL} metalness={0.5} roughness={0.5} />
        </mesh>
        <Bx p={[0, 1.1, 0]} s={[0.3, 0.24, 0.44]} c="#a44a42" rough={0.6} />
        <Bx p={[0.1, 1.3, 0]} s={[0.035, 0.14, 0.035]} c="#ddd" rough={0.4} />
      </group>
      {/* wall sconce */}
      <mesh position={[0, 3.35, 6.52]}>
        <cylinderGeometry args={[0.08, 0.12, 0.14, 12]} />
        <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.25, 6.52]}>
        <sphereGeometry args={[0.1, 14, 14]} />
        <meshStandardMaterial color="#ffd9a0" emissive="#ffb45c" emissiveIntensity={2.8} />
      </mesh>
      <Plant p={[-1.85, 0, 7.25]} />
      <Plant p={[1.85, 0, 7.25]} />

      {/* front facade windows — steel industrial mullions, warm interior glow */}
      {[-3.6, 3.6].map((x) => (
        <group key={x}>
          <mesh position={[x, 2.4, 6.42]}>
            <planeGeometry args={[2.2, 2.7]} />
            <meshStandardMaterial
              color="#20160e"
              emissive="#ff9d45"
              emissiveIntensity={0.85}
              roughness={0.35}
            />
          </mesh>
          {/* steel frame */}
          <Bx p={[x - 1.12, 2.4, 6.45]} s={[0.08, 2.85, 0.08]} c={STEEL} metal={0.55} rough={0.35} shadow={false} />
          <Bx p={[x + 1.12, 2.4, 6.45]} s={[0.08, 2.85, 0.08]} c={STEEL} metal={0.55} rough={0.35} shadow={false} />
          <Bx p={[x, 3.8, 6.45]} s={[2.32, 0.08, 0.08]} c={STEEL} metal={0.55} rough={0.35} shadow={false} />
          <Bx p={[x, 1.0, 6.45]} s={[2.32, 0.08, 0.08]} c={STEEL} metal={0.55} rough={0.35} shadow={false} />
          {/* mullions */}
          <Bx p={[x, 2.4, 6.44]} s={[2.2, 0.04, 0.04]} c={STEEL} metal={0.55} rough={0.35} shadow={false} />
          <Bx p={[x, 2.4, 6.44]} s={[0.04, 2.7, 0.04]} c={STEEL} metal={0.55} rough={0.35} shadow={false} />
        </group>
      ))}
      {/* house number plate — EA */}
      <Bx p={[-1.15, 2.05, 6.45]} s={[0.36, 0.26, 0.04]} c="#12141a" metal={0.45} rough={0.35} />
      <mesh position={[-1.15, 2.05, 6.48]}>
        <planeGeometry args={[0.28, 0.18]} />
        <meshBasicMaterial color="#c9a24a" />
      </mesh>
      {/* brass kick plate under door */}
      <Bx p={[0, 0.18, 6.42]} s={[1.35, 0.28, 0.06]} c="#8b6a45" metal={0.7} rough={0.35} />
    </group>
  );
}

function Poster({
  p,
  base,
  children,
}: {
  p: [number, number, number];
  base: string;
  children?: React.ReactNode;
}) {
  return (
    <group position={p} rotation={[0, -Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[0.85, 1.15]} />
        <meshStandardMaterial color={base} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[0.95, 1.25]} />
        <meshStandardMaterial color="#14151a" roughness={0.8} />
      </mesh>
      {children}
    </group>
  );
}

function Plant({ p, small = false }: { p: [number, number, number]; small?: boolean }) {
  const s = small ? 0.55 : 1;
  return (
    <group position={p} scale={s}>
      {/* terracotta pot */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.44, 16]} />
        <meshStandardMaterial color="#8a4f3d" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.24, 0.22, 0.06, 16]} />
        <meshStandardMaterial color="#9a5c48" roughness={0.95} />
      </mesh>
      {/* soil */}
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial color="#2a1c14" roughness={1} />
      </mesh>
      {/* layered foliage — monstera silhouette via stacked spheres */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.34, 14, 14]} />
        <meshStandardMaterial color="#3a5c38" roughness={0.9} />
      </mesh>
      <mesh position={[0.18, 1.0, 0.08]} castShadow>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#4a6d44" roughness={0.9} />
      </mesh>
      <mesh position={[-0.16, 0.98, -0.06]} castShadow>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#2f5230" roughness={0.9} />
      </mesh>
      <mesh position={[0.02, 1.18, 0.05]} castShadow>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#557a4e" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Lamp({ p }: { p: [number, number, number] }) {
  return (
    <group position={p}>
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2.1, 8]} />
        <meshStandardMaterial color={STEEL} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.05, 14]} />
        <meshStandardMaterial color={STEEL} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.18, 0]}>
        <cylinderGeometry args={[0.16, 0.26, 0.34, 14, 1, true]} />
        <meshStandardMaterial color="#d8c6a4" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.12, 0]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#ffd9a0" emissive="#ffb45c" emissiveIntensity={2.2} />
      </mesh>
    </group>
  );
}

/* ---------------- turntable (record spins while playing) ---------------- */

function Turntable() {
  const record = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const playing = !!useGame.getState().nowPlaying;
    if (record.current && playing) record.current.rotation.y -= delta * 3.4;
    if (arm.current) {
      arm.current.rotation.y = THREE.MathUtils.lerp(
        arm.current.rotation.y,
        playing ? -0.55 : 0,
        0.08
      );
    }
  });

  return (
    <group position={[6.55, 0.9, 1.6]}>
      {/* deck */}
      <Bx p={[0, 0.05, 0]} s={[0.62, 0.1, 1.05]} c="#111318" rough={0.4} />
      {/* platter + record */}
      <group ref={record} position={[-0.02, 0.12, -0.18]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.02, 28]} />
          <meshStandardMaterial color="#0a0a0c" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.012, 20]} />
          <meshStandardMaterial color="#c97b4a" roughness={0.6} />
        </mesh>
      </group>
      {/* tonearm */}
      <group ref={arm} position={[0.2, 0.16, 0.32]}>
        <mesh position={[0, 0, -0.19]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.4, 8]} />
          <meshStandardMaterial color="#c8ccd4" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 10]} />
          <meshStandardMaterial color="#c8ccd4" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      {/* leaning records in crate */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh
          key={i}
          position={[-0.06 + i * 0.05, -0.35, 1.32]}
          rotation={[0, 0, 0.12 + i * 0.04]}
        >
          <boxGeometry args={[0.03, 0.5, 0.5]} />
          <meshStandardMaterial color={SPINE_COLORS[i * 2]} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- animated front door — steel + frosted glass ---------------- */

function Door() {
  const hinge = useRef<THREE.Group>(null);
  const spill = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const open = useGame.getState().doorOpen;
    if (hinge.current) {
      hinge.current.rotation.y = THREE.MathUtils.damp(
        hinge.current.rotation.y,
        open ? -1.95 : 0,
        4.5,
        delta
      );
    }
    if (spill.current) {
      const mat = spill.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, open ? 0.22 : 0, 3.5, delta);
      spill.current.visible = mat.opacity > 0.01;
    }
  });

  return (
    <group>
      {/* steel frame */}
      <Bx p={[-0.68, 1.3, 6.2]} s={[0.14, 2.7, 0.5]} c="#12141a" metal={0.55} rough={0.35} />
      <Bx p={[0.68, 1.3, 6.2]} s={[0.14, 2.7, 0.5]} c="#12141a" metal={0.55} rough={0.35} />
      <Bx p={[0, 2.68, 6.2]} s={[1.5, 0.14, 0.5]} c="#12141a" metal={0.55} rough={0.35} />
      <Bx p={[0, 0.04, 6.2]} s={[1.5, 0.1, 0.5]} c="#12141a" metal={0.55} rough={0.35} />

      {/* hinged panel: dark steel with frosted glass pane */}
      <group ref={hinge} position={[-0.6, 0, 6.2]}>
        <mesh position={[0.6, 1.3, 0]} castShadow>
          <boxGeometry args={[1.2, 2.55, 0.08]} />
          <meshStandardMaterial color="#1a1d24" metalness={0.45} roughness={0.4} />
        </mesh>
        {/* glass pane */}
        <mesh position={[0.6, 1.55, 0.05]}>
          <planeGeometry args={[0.72, 1.35]} />
          <meshStandardMaterial
            color="#c9d6e8"
            emissive="#ffb45c"
            emissiveIntensity={0.35}
            transparent
            opacity={0.55}
            roughness={0.15}
            metalness={0.2}
          />
        </mesh>
        {/* glass mullion cross */}
        <Bx p={[0.6, 1.55, 0.055]} s={[0.72, 0.03, 0.02]} c="#0e1015" metal={0.5} rough={0.4} shadow={false} />
        <Bx p={[0.6, 1.55, 0.055]} s={[0.03, 1.35, 0.02]} c="#0e1015" metal={0.5} rough={0.4} shadow={false} />
        {/* handle */}
        <mesh position={[1.05, 1.3, 0.08]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.22, 10]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[1.05, 1.18, 0.08]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* warm light spill onto the stoop when the door opens */}
      <mesh
        ref={spill}
        position={[0, 0.02, 7.15]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <planeGeometry args={[3.2, 2.4]} />
        <meshBasicMaterial color="#ffb45c" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ---------------- boundaries ---------------- */

function Barriers() {
  return (
    <group>
      {/* stoop edges */}
      <CuboidCollider args={[10, 2, 0.3]} position={[0, 1, 11.4]} />
      <CuboidCollider args={[0.3, 2, 3]} position={[-10.1, 1, 8.6]} />
      <CuboidCollider args={[0.3, 2, 3]} position={[10.1, 1, 8.6]} />
    </group>
  );
}

export default function Loft() {
  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid">
        <Shell />
      </RigidBody>
      <Barriers />
      <Decor />
      <Turntable />
      <Door />
    </group>
  );
}
