import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei"; // useHelper
import * as THREE from "three";
import { useRef } from "react"; // useEffect
import MapScene from "./components/MapScene";
import { useGLTF } from "@react-three/drei";

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
  return (
    <Canvas
      gl={{
        antialias: true, // smooths jagged edges
        toneMapping: THREE.ACESFilmicToneMapping, // how brightness/contrast is processed
        toneMappingExposure: 1, // multiplier
        outputColorSpace: THREE.SRGBColorSpace, // color display
        alpha: true,
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
    </Canvas>
  );
}
//      <color attach="background" args={["white"]} />

// <ambientLight intensity={0.3} color="#ffffff" />
