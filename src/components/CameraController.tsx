import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CameraControllerProps {
  controlsRef: React.RefObject<any>;
  targetRef: React.RefObject<THREE.Vector3>;
  isAnimating: React.RefObject<boolean>;
}

export default function CameraController({
  controlsRef,
  targetRef,
  isAnimating,
}: CameraControllerProps) {
  useFrame(() => {
    if (!controlsRef.current || !targetRef.current) return;
    if (!isAnimating.current) return; // only animate when triggered

    const current = controlsRef.current.target;
    const target = targetRef.current;
    const dist = current.distanceTo(target);

    // Stop animating once close enough
    if (dist < 0.01) {
      isAnimating.current = false;
      return;
    }
    current.lerp(target, 0.05);
    controlsRef.current.update();
  });

  return null;
}
