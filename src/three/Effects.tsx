import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

/** Filmic stack kept restrained so faces and materials stay readable. */
export default function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        mipmapBlur
        intensity={0.5}
        luminanceThreshold={0.65}
        luminanceSmoothing={0.32}
        radius={0.65}
      />
      <Vignette offset={0.26} darkness={0.5} eskil={false} />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0003, 0.0003)}
        radialModulation
        modulationOffset={0.45}
      />
    </EffectComposer>
  );
}
