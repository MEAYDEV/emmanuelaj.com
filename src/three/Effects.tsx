import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

/** Filmic stack kept restrained so faces and materials stay readable. */
export default function Effects() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom
        mipmapBlur
        intensity={0.55}
        luminanceThreshold={0.62}
        luminanceSmoothing={0.3}
        radius={0.7}
      />
      <Vignette offset={0.24} darkness={0.55} eskil={false} />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.00035, 0.00035)}
        radialModulation
        modulationOffset={0.4}
      />
    </EffectComposer>
  );
}
