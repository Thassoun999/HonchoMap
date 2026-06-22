import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import Instances from "./Instances";

useGLTF.preload("/HonchoMap/assets/models/map_scene.glb");

export default function MapScene() {
  const { scene } = useGLTF("/HonchoMap/assets/models/map_scene.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if (child.userData && child.userData.instance_type) {
        console.log(child.name, child.userData.instance_type);
      }
    });
  }, [scene]);

  return (
    <>
      <primitive object={scene} />
      <Instances scene={scene} />
    </>
  );
}
