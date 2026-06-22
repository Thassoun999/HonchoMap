import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const C2_MODELS: Record<string, string> = {
  Trees_2: "/HonchoMap/assets/models/tree_pine.glb",
  Trees_3: "/HonchoMap/assets/models/tree_birch.glb",
  Trees_1: "/HonchoMap/assets/models/tree_oak.glb",
};

interface InstancesProps {
  scene: THREE.Group;
}

/*
What This Does Differently

Collects all transforms for each instance type first
Creates one InstancedMesh per unique mesh part — so Trees_2 (pine) with 150 instances = 1 draw call regardless of count
Uses setMatrixAt to position/rotate/scale each instance via a transformation matrix — this is how InstancedMesh works under the hood

Important Note on Multi-Part Meshes
Your trees likely have multiple mesh parts (trunk + leaves = 2 meshes). Each part becomes its own InstancedMesh, so a two-part tree still only costs 2 draw calls total for all 150 instances combined — still massively better than 300 draw calls with clone().
Try this and let me know what you see in the browser. Any errors in the console?
*/
// Component for one unique mesh type's instances
function MeshInstances({
  sourceScene,
  transforms,
}: {
  sourceScene: THREE.Group;
  transforms: {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
  }[];
}) {
  const meshes = useMemo(() => {
    const result: {
      geometry: THREE.BufferGeometry;
      material: THREE.Material | THREE.Material[];
    }[] = [];
    sourceScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        result.push({ geometry: child.geometry, material: child.material });
      }
    });
    return result;
  }, [sourceScene]);

  return (
    <>
      {meshes.map(
        (mesh, meshIndex) =>
          transforms
            .map((transform, i) => {
              const matrix = new THREE.Matrix4();
              matrix.compose(
                transform.position,
                new THREE.Quaternion().setFromEuler(transform.rotation),
                transform.scale,
              );

              const instancedMesh = new THREE.InstancedMesh(
                mesh.geometry,
                mesh.material,
                transforms.length,
              );

              transforms.forEach((t, idx) => {
                const m = new THREE.Matrix4();
                m.compose(
                  t.position,
                  new THREE.Quaternion().setFromEuler(t.rotation),
                  t.scale,
                );
                instancedMesh.setMatrixAt(idx, m);
              });

              instancedMesh.instanceMatrix.needsUpdate = true;

              return <primitive key={`${meshIndex}`} object={instancedMesh} />;
            })
            .slice(0, 1), // one primitive per mesh part, not per instance
      )}
    </>
  );
}

export default function Instances({ scene }: InstancesProps) {
  // Load all C2 models
  const loadedModels = {
    Trees_2: useGLTF(C2_MODELS.Trees_2).scene,
    Trees_3: useGLTF(C2_MODELS.Trees_3).scene,
    Trees_1: useGLTF(C2_MODELS.Trees_1).scene,
  };

  // Collect transforms per instance_type
  const transformsByType = useMemo(() => {
    const result: Record<
      string,
      { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }[]
    > = {};

    Object.keys(C2_MODELS).forEach((key) => (result[key] = []));

    scene.traverse((child) => {
      const instanceType = child.userData?.instance_type;
      if (!instanceType || !C2_MODELS[instanceType]) return;

      result[instanceType].push({
        position: child.position.clone(),
        rotation: child.rotation.clone(),
        scale: child.scale.clone(),
      });
    });

    return result;
  }, [scene]);

  return (
    <>
      {Object.entries(loadedModels).map(([type, sourceScene]) => (
        <MeshInstances
          key={type}
          sourceScene={sourceScene}
          transforms={transformsByType[type] ?? []}
        />
      ))}
    </>
  );
}
