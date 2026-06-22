import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 2000,
          position: [0, 100, 150],
        }}
      >
        {/* White background */}
        <color attach="background" args={["white"]} />

        {/* Lighting placeholder */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} />

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={20}
          maxDistance={500}
          maxPolarAngle={Math.PI / 2.5}
        />

        <mesh>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </Canvas>
    </div>
  );
}
