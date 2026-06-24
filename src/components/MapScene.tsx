import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import Instances from "./Instances";
import River from "./River";
import Markers from "./Markers";

/*
 tells Drei to start downloading the GLB immediately when this module loads, before the component even renders. 
 Without this, loading starts only when the component mounts, which is later. 
 Running this at module level (outside the component) gives you the earliest possible start on the download — 
 important for a 100MB file.
 */
useGLTF.preload("/HonchoMap/assets/models/map_scene.glb");

interface MapSceneProps {
  onMarkerClick: (marker: {
    id: string;
    name: string;
    description: string;
    category: string;
  }) => void;
  visibleMarkerIds: string[];
  markerPositionsRef: React.RefObject<Record<string, THREE.Vector3>>;
}

export default function MapScene({
  onMarkerClick,
  visibleMarkerIds,
  markerPositionsRef,
}: MapSceneProps) {
  const { scene } = useGLTF("/HonchoMap/assets/models/map_scene.glb");

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    const pathTexture = textureLoader.load(
      "/HonchoMap/assets/textures/Terrain_Paths.png",
    );
    pathTexture.colorSpace = THREE.SRGBColorSpace;

    scene.traverse((child) => {
      // Each child is split amongst material names!
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.name === "Ground") {
          const material = new THREE.MeshStandardMaterial({
            vertexColors: true, // important for vertex colors
            roughness: 1.0,
            metalness: 0.0,
          });

          //onBeforeCompile — this is the key technique for customizing MeshStandardMaterial without losing its lighting calculations.
          //Chance to modify shader string. shader.uniforms is where you pass data from JS to GLSL
          material.onBeforeCompile = (shader) => {
            shader.uniforms.pathTexture = { value: pathTexture };

            // Vertex shader injection — modifying the vertex shader by finding specific strings
            // and replacing them with expanded versions.

            // First replace adds a varying vec2 vUv2 declaration — a varying is a variable that gets passed from the
            // vertex shader to the fragment shader per-vertex, interpolated across the surface.
            // Second replace captures the UV coordinates (uv) into vUv2 right after Three.js's own UV processing.
            // We use vUv2 as a custom name to avoid conflicting with Three.js's internal vUv variable.
            shader.vertexShader = shader.vertexShader.replace(
              "void main() {",
              `varying vec2 vUv2;
               varying vec3 vNormal2;
              void main() {`,
            );

            shader.vertexShader = shader.vertexShader.replace(
              "#include <uv_vertex>",
              `#include <uv_vertex>
              vUv2 = uv;
              vNormal2 = normalize(normalMatrix * normal);`,
            );

            // Fragment shader declaration — adds the uniform and varying declarations to the fragment shader
            // so it can receive the texture and UV data.

            // uniform sampler2D pathTexture declares the texture input — uniform means it's the same value for every pixel
            // (set from JavaScript), sampler2D is the GLSL type for a 2D texture.
            // varying vec2 vUv2 receives the interpolated UV from the vertex shader.
            shader.fragmentShader = shader.fragmentShader.replace(
              "void main() {",
              `uniform sampler2D pathTexture;
              varying vec2 vUv2;
              varying vec3 vNormal2;
              void main() {`,
            );

            // Path Blending Logic --  injected right after #include <color_fragment> which is where
            // Three.js has already processed the vertex colors into diffuseColor.

            // vec2 correctedUv = vec2(vUv2.x, 1.0 - vUv2.y) — flips the Y axis to correct Blender vs WebGL UV convention difference
            // vec4 texColor = texture2D(pathTexture, correctedUv) — samples your path PNG at this pixel's UV coordinate, returning RGBA color

            // float factor = clamp(length(texColor.rgb) / 1.732, 0.0, 1.0) —
            // converts the texture color to a single 0-1 value representing brightness.
            // length() calculates the vector magnitude of RGB. 1.732 is sqrt(3) —
            // the maximum possible length of a unit RGB vector — so this normalizes it to 0-1 range.
            // clamp ensures it never goes outside 0-1

            // factor = smoothstep(0.05, 0.07, factor) — sharpens the edge between path and terrain.
            // Values below 0.05 snap to 0 (no path), values above 0.07 snap to 1 (full path), with a smooth transition between

            // vec3 pathColor = vec3(0.596, 0.651, 0.435) — your hardcoded path color in 0-1 RGB

            // diffuseColor.rgb = mix(diffuseColor.rgb, pathColor, factor) —
            // blends between the existing vertex color (diffuseColor.rgb, already set by Three.js)
            // and your path color based on factor.
            // This modifies diffuseColor in place, which then flows into all of Three.js's normal
            // lighting calculations below it in the shader
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <color_fragment>",
              `#include <color_fragment>
              
              // Correct sRGB vertex colors to linear
              diffuseColor.rgb = pow(diffuseColor.rgb, vec3(1.02));

              vec2 correctedUv = vec2(vUv2.x, 1.0 - vUv2.y);
              vec4 texColor = texture2D(pathTexture, correctedUv);
              
              float factor = clamp(length(texColor.rgb) / 1.732, 0.0, 1.0);
              factor = smoothstep(0.1, .7, factor);
              
              // vec3 pathColor = vec3(0.45, 0.38, 0.22);    
              // vec3 pathColor = vec3(0.48, 0.38, 0.24);  
              vec3 pathColor = vec3(0.503, 0.542, 0.244);              
              diffuseColor.rgb = clamp(mix(diffuseColor.rgb, pathColor, factor), 0.0, 1.0);
              
              // Elevation edge darkening — faces pointing up stay bright, cliff faces darken
              float elevation = dot(vNormal2, vec3(0.0, 1.0, 0.0));
              elevation = clamp(elevation, 0.0, 1.0);
              float darkenFactor = mix(0.4, 1.0, elevation);
              diffuseColor.rgb *= darkenFactor;
              `,
            );
          };

          child.material = material;
        }

        ["Bridge_Planks", "Bridge_Planks_1", "Bridge_Planks_2"].forEach(
          (name) => {
            if (child.name === name) {
              const mat = child.material as THREE.MeshStandardMaterial;
              if (mat.name === "Rainbow Wood.002") {
                // console.log("Found you!");
                mat.color.setScalar(12);
              }
            }
          },
        );
      }
    });
  }, [scene]);

  return (
    <>
      <primitive object={scene} />
      <Instances scene={scene} />
      <River />
      <Markers
        scene={scene}
        onMarkerClick={onMarkerClick}
        visibleMarkerIds={visibleMarkerIds}
        markerPositionsRef={markerPositionsRef}
      />
    </>
  );
}
//castShadow receiveShadow
