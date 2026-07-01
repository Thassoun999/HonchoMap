import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { MARKER_DATA } from "../constants/markerData";

const MARKER_SPRITES: Record<string, string> = {
  glampingmarker: "/HonchoMap/assets/markers/Glamping.png",
  camping: "/HonchoMap/assets/markers/Camping.png",
  cher_rides: "/HonchoMap/assets/markers/RideCher.png",
  main_camp: "/HonchoMap/assets/markers/MAINCAMP.png",
  new_camp: "/HonchoMap/assets/markers/NEWCAMP.png",
  accessibility: "/HonchoMap/assets/markers/Accessibility.png",
  bar: "/HonchoMap/assets/markers/Bar.png",
  portapotties: "/HonchoMap/assets/markers/ToiletsPorta.png",
  wellness: "/HonchoMap/assets/markers/Health.png",
  rv_camping: "/HonchoMap/assets/markers/RV.png",
  sober_space: "/HonchoMap/assets/markers/SoberSpaces.png",
  artist_bunk: "/HonchoMap/assets/markers/ArtistBunk.png",
  chance_in_sno: "/HonchoMap/assets/markers/SnoChance.png",
  circle_of_whispers: "/HonchoMap/assets/markers/Whispers.png",
  critters_lounge: "/HonchoMap/assets/markers/Critters.png",
  food_court: "/HonchoMap/assets/markers/FoodCourt.png",
  group_shower: "/HonchoMap/assets/markers/GroupShowers.png",
  hemlock_hole: "/HonchoMap/assets/markers/Hemlock.png",
  kitchen: "/HonchoMap/assets/markers/Kitchen.png",
  large_shower: "/HonchoMap/assets/markers/ToiletShowers.png",
  mail_room: "/HonchoMap/assets/markers/Mail.png",
  pick_me_up: "/HonchoMap/assets/markers/PickMeUp.png",
  qff: "/HonchoMap/assets/markers/QFF.png",
  "queeries.001": "/HonchoMap/assets/markers/Queeries.png",
  small_shower: "/HonchoMap/assets/markers/ToiletShowers.png",
  the_grove: "/HonchoMap/assets/markers/Grove.png",
  car_camping: "/HonchoMap/assets/markers/CarCamping.png",
  parking: "/HonchoMap/assets/markers/Parking.png",
  gate: "/HonchoMap/assets/markers/Gate.png",
  salvage: "/HonchoMap/assets/markers/Salvage.png",
};

// Generate a soft yellow glow circle texture procedurally
const glowTexture = (() => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255, 240, 0, 0.9)"); // bright yellow center
  gradient.addColorStop(0.7, "rgba(255, 210, 0, 0.7)"); // mid falloff
  gradient.addColorStop(1, "rgba(255, 180, 0, 0)"); // transparent edge
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
})();

// Remove LARGE_MARKERS — scale now comes from MARKER_DATA

const BASE_WIDTH = 2.25; // was  3
const BASE_HEIGHT = BASE_WIDTH * (500 / 390);

interface MarkerData {
  position: THREE.Vector3;
  markerType: string;
  id: string;
  name: string;
  description: string;
  category: string;
  offset: [number, number, number];
  scale: number;
}

interface SingleMarkerProps {
  position: THREE.Vector3;
  offset: [number, number, number];
  scale: number;
  texture: THREE.Texture;
  onClick: () => void;
  isActive: boolean;
}

function SingleMarker({
  position,
  offset,
  scale,
  texture,
  onClick,
  isActive,
}: SingleMarkerProps) {
  const spriteRef = useRef<THREE.Sprite>(null!);
  const hovered = useRef(false);
  const glowRef = useRef<THREE.Sprite>(null!);

  useFrame(() => {
    if (!spriteRef.current) return;
    const target = hovered.current ? 0.7 : 1.0;
    spriteRef.current.material.opacity = THREE.MathUtils.lerp(
      spriteRef.current.material.opacity,
      target,
      0.15,
    );

    // Glow opacity — fade in when active, fade out when not
    if (glowRef.current) {
      glowRef.current.material.opacity = THREE.MathUtils.lerp(
        glowRef.current.material.opacity,
        isActive ? 1.0 : 0.0,
        0.1,
      );
    }
  });

  const width = BASE_WIDTH * scale;
  const height = BASE_HEIGHT * scale;

  const finalPosition: [number, number, number] = [
    position.x + offset[0],
    position.y + offset[1],
    position.z + offset[2],
  ];

  return (
    <>
      {/* Glow sprite — behind the marker */}
      <sprite
        ref={glowRef}
        position={finalPosition}
        scale={[width * 1.8, height * 1.8, 1]} // larger than marker
      >
        <spriteMaterial
          map={glowTexture}
          transparent={true}
          depthWrite={false}
          sizeAttenuation={true}
          opacity={0} // starts invisible, lerps to 1 when active
        />
      </sprite>

      <sprite
        ref={spriteRef}
        position={finalPosition}
        scale={[width, height, 1]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          hovered.current = true;
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
          hovered.current = false;
        }}
      >
        <spriteMaterial
          map={texture}
          transparent={true}
          depthWrite={false}
          sizeAttenuation={true}
          opacity={1}
        />
      </sprite>
    </>
  );
}

interface MarkersProps {
  scene: THREE.Group;
  visibleMarkerIds: string[];
  markerPositionsRef: React.RefObject<Record<string, THREE.Vector3>>;
  onMarkerClick: (marker: {
    id: string;
    name: string;
    description: string;
    category: string;
  }) => void;
  activeMarkerId: string | null;
}

export default function Markers({
  scene,
  visibleMarkerIds,
  onMarkerClick,
  markerPositionsRef,
  activeMarkerId,
}: MarkersProps) {
  const markerData = useMemo(() => {
    const result: MarkerData[] = [];

    scene.traverse((child) => {
      const data = MARKER_DATA[child.name];
      if (!data) return;

      if (!visibleMarkerIds.includes(child.name)) return;

      if (markerPositionsRef.current) {
        markerPositionsRef.current[child.name] = new THREE.Vector3(
          child.position.x + data.offset[0],
          child.position.y + data.offset[1],
          child.position.z + data.offset[2],
        );
      }

      result.push({
        position: child.position.clone(),
        markerType: data.markerType,
        id: child.name,
        name: data.name,
        description: data.description,
        category: data.category,
        offset: data.offset,
        scale: data.scale,
      });
    });

    return result;
  }, [scene, visibleMarkerIds, markerPositionsRef]);

  const textureArray = useLoader(
    THREE.TextureLoader,
    Object.values(MARKER_SPRITES),
  );

  const textures = Object.fromEntries(
    Object.keys(MARKER_SPRITES).map((key, index) => [key, textureArray[index]]),
  );

  return (
    <>
      {markerData.map((marker) => (
        <SingleMarker
          key={marker.id}
          position={marker.position}
          offset={marker.offset}
          scale={marker.scale}
          texture={textures[marker.markerType]}
          isActive={marker.id === activeMarkerId}
          onClick={() =>
            onMarkerClick({
              id: marker.id,
              name: marker.name,
              description: marker.description,
              category: marker.category,
            })
          }
        />
      ))}
    </>
  );
}
