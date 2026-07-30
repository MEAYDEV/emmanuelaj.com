import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { Ecctrl, type EcctrlHandle } from "ecctrl";
import { useJoystickStore } from "ecctrl/input";
import Avatar from "./Avatar";
import { playerPosRef, playerSpeedRef, playerYawRef, useGame } from "../store";
import { INTERACTABLES } from "../data/content";

const KEYMAP: Record<string, "forward" | "backward" | "leftward" | "rightward" | "run" | "jump"> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "leftward",
  ArrowLeft: "leftward",
  KeyD: "rightward",
  ArrowRight: "rightward",
  ShiftLeft: "run",
  ShiftRight: "run",
  Space: "jump",
};

export default function Player() {
  const ecctrl = useRef<EcctrlHandle>(null);
  const model = useRef<THREE.Group>(null);
  const yaw = useRef(Math.PI);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const action = KEYMAP[e.code];
      if (!action) return;
      e.preventDefault();
      const g = useGame.getState();
      if (g.dialogue || g.focus) return;
      ecctrl.current?.setMovement({ [action]: true });
    };
    const up = (e: KeyboardEvent) => {
      const action = KEYMAP[e.code];
      if (!action) return;
      ecctrl.current?.setMovement({ [action]: false });
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame(() => {
    const handle = ecctrl.current;
    if (!handle) return;

    const g = useGame.getState();

    // freeze while a dialogue or focus mode is open
    if (g.dialogue || g.focus) {
      handle.setMovement({
        forward: false,
        backward: false,
        leftward: false,
        rightward: false,
        joystick: { x: 0, y: 0 },
      });
    } else {
      // touch joystick passthrough
      const joy = useJoystickStore.getState().joysticks["default"];
      if (joy) {
        handle.setMovement({ joystick: { x: joy.x, y: joy.y } });
      }
    }

    playerPosRef.current.copy(handle.currPos);
    const v = handle.currLinVel;
    playerSpeedRef.current = Math.hypot(v.x, v.z);

    // face the direction of travel (model faces +z at yaw 0);
    // threshold above deceleration overshoot so the yaw doesn't flip on stop
    if (model.current && playerSpeedRef.current > 1.2) {
      const target = Math.atan2(v.x, v.z);
      let diff = target - yaw.current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      yaw.current += diff * 0.16;
      model.current.rotation.y = yaw.current;
    }
    playerYawRef.current = yaw.current;

    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__playerDebug = {
        pos: [handle.currPos.x, handle.currPos.y, handle.currPos.z],
        vel: [v.x, v.y, v.z],
        input: { ...handle.input },
      };
    }

    // proximity detection
    const p = playerPosRef.current;
    let nearest: string | null = null;
    let bestDist = Infinity;
    for (const item of INTERACTABLES) {
      const dx = p.x - item.position[0];
      const dz = p.z - item.position[2];
      const dy = Math.abs(p.y - 1.1 - item.position[1]);
      const d = Math.hypot(dx, dz);
      if (d < item.radius && dy < 1.8 && d < bestDist) {
        bestDist = d;
        nearest = item.id;
      }
    }
    if (nearest !== g.nearId) g.setNearId(nearest);
  });

  return (
    <Ecctrl
      ref={ecctrl}
      position={[0, 1.12, 3.0]}
      capsuleHalfHeight={0.6}
      capsuleRadius={0.3}
      floatHeight={0.2}
      maxWalkVel={2.6}
      maxRunVel={5}
      enableToggleRun={false}
      accDeltaTime={0.15}
      decDeltaTime={0.08}
      springK={60}
      dampingC={10}
    >
      <group ref={model} position={[0, -1.1, 0]} rotation={[0, Math.PI, 0]}>
        <Avatar />
      </group>
    </Ecctrl>
  );
}
