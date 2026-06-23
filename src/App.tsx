import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei"; // useHelper
import * as THREE from "three";
import { useRef } from "react"; // useEffect
import MapScene from "./components/MapScene";
import { useGLTF } from "@react-three/drei";

// import { EffectComposer, SSAO, ToneMapping } from "@react-three/postprocessing";
// import { BlendFunction, ToneMappingMode } from "postprocessing";

useGLTF.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
);

// the only one with shadow projection
function KeyLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  // useHelper(lightRef, THREE.DirectionalLightHelper, 10);

  /*
  useEffect(() => {
    if (lightRef.current) {
      const helper = new THREE.CameraHelper(lightRef.current.shadow.camera);
      lightRef.current.parent?.add(helper);
    }
  }, []);
  */

  return (
    <directionalLight
      ref={lightRef}
      color="#FFFAAE"
      intensity={3.7 / 1.5}
      position={[-45.3, 47.1, 46.5]}
      castShadow
      shadow-radius={6}
      shadow-bias={-0.00002}
      shadow-normalBias={0.05}
      shadow-mapSize={[4096, 4096]} // Map resolution -- the render of the scene from light's pov into a texture (shadow map)
      shadow-camera-near={0.1} // shadow camera clipping planes (same concept as main camera)
      shadow-camera-far={2000} // shadow camera clipping planes (only objects between these distances will cast shadows, match camera)
      // Shadow camera frustum
      // Since it's orthographic, these define the rectangular area the shadow camera covers.
      // Think of it as a box, anything outside this box won't case or receive shadows.
      // LEFT/RIGHT = X terrain dimension / 2
      // TOP/BOTTOM = Y terrain dimension / 2 (round up)
      shadow-camera-left={-75}
      shadow-camera-right={75}
      shadow-camera-top={55}
      shadow-camera-bottom={-45}
    />
  );
}

function FillLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  // useHelper(lightRef, THREE.DirectionalLightHelper, 10);

  return (
    <directionalLight
      ref={lightRef}
      color="#FFFAAE"
      intensity={2.3 / 1.5}
      position={[64.3, 40.1, 37.8]}
    />
  );
}

function RimLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  // useHelper(lightRef, THREE.DirectionalLightHelper, 10);

  return (
    <directionalLight
      ref={lightRef}
      color="#FFF1C8"
      intensity={1.0 / 1.5}
      position={[-39.1, 32.5, -49.5]}
    />
  );
}

export default function App() {
  // const ssaoColor = new THREE.Color("black");
  return (
    <Canvas
      gl={{
        antialias: true, // smooths jagged edges
        toneMapping: THREE.ACESFilmicToneMapping, // how brightness/contrast is processed
        toneMappingExposure: 0.8, // multiplier
        outputColorSpace: THREE.SRGBColorSpace, // color display
      }}
      camera={{
        fov: 45,
        near: 0.1,
        far: 2000,
        position: [0, 100, 150],
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
      shadows="soft"
    >
      <color attach="background" args={["#e1e1e1"]} />
      <ambientLight intensity={2} color="#ffffff" />
      <KeyLight />
      <FillLight />
      <RimLight />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={20}
        maxDistance={500}
        maxPolarAngle={Math.PI / 2.5}
      />

      <MapScene />
      {/* Post processing — always last inside Canvas 
      
      <EffectComposer multisampling={0} enableNormalPass>
        <SSAO
          blendFunction={BlendFunction.MULTIPLY} // multiples AO result with scene color, darkens occluded area naturally
          samples={32} // how many rays are cast to calculate occlusion (higher = better but more expensive)
          radius={30} // how far the AO effect reaches, small gives tight contact shadows while large give broader ambient darkening
          intensity={15} // how strong the darkening effect
          rings={4} // how many concentric rings of sample points are cast around each pixel. More rings = better quality
          distanceThreshold={1.0} // maximum worl space distance at which occlusion is calculated. The "reach", within 1 world unit coords
          distanceFalloff={0.0} // how gradually the occlusion fades out as the geometry approaches distance threshold. 0 means hard cut off
          rangeThreshold={0.5} //Similar to distanceThreshold but specifically for the depth range — filters out samples that are too far in depth from the current pixel to be considered occluders.
          // Prevents incorrect darkening from distant background geometry.
          rangeFalloff={0.1} // How gradually the range check fades. Small value like 0.1 means a fairly sharp cutoff —
          // geometry either counts as an occluder or it doesn't with minimal blending between.

          bias={0.5} // prevents self-occlusion artifacts. Without it flat surfaces can incorrectly occlude themselves and darken everything
          luminanceInfluence={0.3} // how much surface brightness affects the AO, lower = AO affect dark and bright areas equally
          color={ssaoColor} // the shadow color
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} exposure={1.2} />
      </EffectComposer>
      */}
    </Canvas>
  );
}
/*
For tighter contact shadows reduce radius, for broader keep it where it is. 
For more/less intensity adjust intensity and luminanceInfluence together.
*/
