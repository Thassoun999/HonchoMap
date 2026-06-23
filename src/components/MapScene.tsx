import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import Instances from "./Instances";

useGLTF.preload("/HonchoMap/assets/models/map_scene.glb");

const terrainVertexShader = `
  varying vec2 vUv;
  varying vec3 vColor;
  
  void main() {
    vUv = uv;
    vColor = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const terrainFragmentShader = `
  uniform sampler2D pathTexture;
  varying vec2 vUv;
  varying vec3 vColor;
  
  void main() {
    vec2 correctedUv = vec2(vUv.x, 1.0 - vUv.y);
    vec4 texColor = texture2D(pathTexture, correctedUv);
    
    vec3 linearColor = pow(vColor, vec3(0.25));
    float factor = clamp(length(texColor.rgb) / 1.732, 0.0, 1.0);
    factor = smoothstep(0.05, 0.07, factor);

    vec3 pathColor = vec3(0.596, 0.651, 0.435);

    vec3 finalColor = mix(linearColor, pathColor, factor);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function MapScene() {
  const { scene } = useGLTF("/HonchoMap/assets/models/map_scene.glb");

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    const pathTexture = textureLoader.load(
      "/HonchoMap/assets/textures/Terrain_Paths.png",
    );
    pathTexture.colorSpace = THREE.SRGBColorSpace;

    scene.traverse((child) => {
      /*
      if (child.userData && child.userData.instance_type) {
        console.log(child.name, child.userData.instance_type);
      }*/

      if (child instanceof THREE.Mesh) {
        // Terrain custom shader
        if (child.name === "Ground") {
          console.log("UV attributes:", child.geometry.attributes);
          // replace with your terrain mesh name
          const shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: terrainVertexShader,
            fragmentShader: terrainFragmentShader,
            uniforms: {
              pathTexture: { value: pathTexture },
            },
            vertexColors: true,
          });
          child.material = shaderMaterial;
        }

        // Rainbow bridge brightness boost
        // Cube017 = "Bridge_Planks"
        if (child.name === "Cube017") {
          // replace with your bridge plank mesh name
          // (child.material as THREE.MeshBasicMaterial).color.setScalar(1.8);
          console.log(child.material);
        }
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
