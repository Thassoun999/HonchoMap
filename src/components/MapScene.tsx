import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

/*
 tells Drei to start downloading the GLB immediately when this module loads, before the component even renders. 
 Without this, loading starts only when the component mounts, which is later. 
 Running this at module level (outside the component) gives you the earliest possible start on the download — 
 important for a 100MB file.
 */
useGLTF.preload("/HonchoMap/assets/models/map_scene.glb");

export default function MapScene() {
  const { scene } = useGLTF("/HonchoMap/assets/models/map_scene.glb");

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    const pathTexture = textureLoader.load(
      "/HonchoMap/assets/textures/Terrain_Paths.png",
    );
    pathTexture.colorSpace = THREE.SRGBColorSpace;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.name === "Ground") {
          const material = new THREE.MeshStandardMaterial({
            vertexColors: true, // important for vertex colors
            roughness: 1.0,
            metalness: 0.0,
          });

          //onBeforeCompile — this is the key technique for customizing MeshStandardMaterial without losing its lighting calculations.
          material.onBeforeCompile = (shader) => {
            shader.uniforms.pathTexture = { value: pathTexture };

            shader.vertexShader = shader.vertexShader.replace(
              "void main() {",
              `varying vec2 vUv2;
              void main() {`,
            );

            shader.vertexShader = shader.vertexShader.replace(
              "#include <uv_vertex>",
              `#include <uv_vertex>
              vUv2 = uv;`,
            );

            shader.fragmentShader = shader.fragmentShader.replace(
              "void main() {",
              `uniform sampler2D pathTexture;
              varying vec2 vUv2;
              void main() {`,
            );

            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <color_fragment>",
              `#include <color_fragment>
              
              vec2 correctedUv = vec2(vUv2.x, 1.0 - vUv2.y);
              vec4 texColor = texture2D(pathTexture, correctedUv);
              
              float factor = clamp(length(texColor.rgb) / 1.732, 0.0, 1.0);
              factor = smoothstep(0.05, 0.07, factor);
              
              vec3 pathColor = vec3(0.596, 0.651, 0.435);
              
              diffuseColor.rgb = mix(diffuseColor.rgb, pathColor, factor);`,
            );
          };

          child.material = material;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}
