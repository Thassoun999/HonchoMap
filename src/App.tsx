import { Canvas } from "@react-three/fiber";
import { OrbitControls, useHelper } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";
import MapScene from "./components/MapScene";
import { useGLTF } from "@react-three/drei";

useGLTF.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
);

function KeyLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  useHelper(lightRef, THREE.DirectionalLightHelper, 10);

  return (
    <directionalLight
      ref={lightRef}
      color="#FFFAAE"
      intensity={3.7}
      position={[-45.3, 47.1, 46.5]}
    />
  );
}

function FillLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  useHelper(lightRef, THREE.DirectionalLightHelper, 10);

  return (
    <directionalLight
      ref={lightRef}
      color="#FFFAAE"
      intensity={2.3}
      position={[64.3, 40.1, 37.8]}
    />
  );
}

function RimLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  useHelper(lightRef, THREE.DirectionalLightHelper, 10);

  return (
    <directionalLight
      ref={lightRef}
      color="#FFF1C8"
      intensity={1.0}
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
        toneMappingExposure: 3, // multiplier
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
    >
      <color attach="background" args={["white"]} />

      <KeyLight />
      <FillLight />
      <RimLight />
      <ambientLight intensity={0.3} color="#ffffff" />

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
