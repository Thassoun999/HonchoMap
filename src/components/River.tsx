import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function River() {
  const { scene, animations } = useGLTF("/HonchoMap/assets/models/river.glb");
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (animations.length > 0) {
      // AnimationMixer drives the animation on the scene
      const mixer = new THREE.AnimationMixer(scene);
      mixerRef.current = mixer;

      // Get the first (only) animation clip
      const clip = animations[0];
      const action = mixer.clipAction(clip);

      // Set to loop indefinitely
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
    }

    return () => {
      // Cleanup mixer on unmount
      mixerRef.current?.stopAllAction();
    };
  }, [scene, animations]);

  // useFrame runs every render frame — advances the animation by delta time
  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  return <primitive object={scene} castShadow receiveShadow />;
}
