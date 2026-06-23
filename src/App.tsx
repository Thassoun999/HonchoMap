import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei"; // useHelper
import * as THREE from "three";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"; // useEffect
import MapScene from "./components/MapScene";
import { useGLTF } from "@react-three/drei";
import CameraController from "./components/CameraController";

// import { EffectComposer, SSAO, ToneMapping } from "@react-three/postprocessing";
// import { BlendFunction, ToneMappingMode } from "postprocessing";

// Outside component — derive visible markers list
import { MARKER_DATA } from "./constants/markerData";
import BurgerMenu from "./components/BurgerMenu";
import ArrowNav from "./components/ArrowNav";
import LoadingScreen from "./components/LoadingScreen";

const ALL_MARKER_IDS = Object.keys(MARKER_DATA);
const ALL_CATEGORIES = [
  "Camping & Lodging",
  "Amenities",
  "Health & Wellness",
  "Ride Cher",
  "Areas",
  "Stages",
];

useGLTF.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
);

// the only one with shadow projection
function KeyLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  // useHelper(lightRef, THREE.DirectionalLightHelper, 10);

  /*
  useEffect(() => {
    if (lightRef.current) {
      const helper = new THREE.CameraHelper(lightRef.current.shadow.camera);
      lightRef.current.parent?.add(helper);
    }
  }, []);
  */

  return (
    <directionalLight
      ref={lightRef}
      color="#FFFAAE"
      intensity={3.7 / 1.5}
      position={[-45.3, 47.1, 46.5]}
      castShadow
      shadow-radius={5}
      shadow-bias={-0.00002}
      shadow-normalBias={0.05}
      shadow-mapSize={[4096, 4096]} // Map resolution -- the render of the scene from light's pov into a texture (shadow map)
      shadow-camera-near={0.1} // shadow camera clipping planes (same concept as main camera)
      shadow-camera-far={2000} // shadow camera clipping planes (only objects between these distances will cast shadows, match camera)
      // Shadow camera frustum
      // Since it's orthographic, these define the rectangular area the shadow camera covers.
      // Think of it as a box, anything outside this box won't case or receive shadows.
      // LEFT/RIGHT = X terrain dimension / 2
      // TOP/BOTTOM = Y terrain dimension / 2 (round up)
      shadow-camera-left={-75}
      shadow-camera-right={75}
      shadow-camera-top={55}
      shadow-camera-bottom={-45}
    />
  );
}

function FillLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  // useHelper(lightRef, THREE.DirectionalLightHelper, 10);

  return (
    <directionalLight
      ref={lightRef}
      color="#FFFAAE"
      intensity={2.3 / 1.5}
      position={[64.3, 40.1, 37.8]}
    />
  );
}

function RimLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  // useHelper(lightRef, THREE.DirectionalLightHelper, 10);

  return (
    <directionalLight
      ref={lightRef}
      color="#FFF1C8"
      intensity={1.0 / 1.5}
      position={[-39.1, 32.5, -49.5]}
    />
  );
}

export default function App() {
  const [started, setStarted] = useState(false);

  const controlsRef = useRef<any>(null);
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const markerPositionsRef = useRef<Record<string, THREE.Vector3>>({});
  const isCameraAnimating = useRef(false);

  // const ssaoColor = new THREE.Color("black");
  const [activeMarker, setActiveMarker] = useState<{
    id: string;
    name: string;
    description: string;
    category: string;
  } | null>(null);

  const [activeFilters, setActiveFilters] = useState<string[]>([
    ...ALL_CATEGORIES,
  ]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleMarkerIds = useMemo(() => {
    return ALL_MARKER_IDS.filter((id) =>
      activeFilters.includes(MARKER_DATA[id].category),
    );
  }, [activeFilters]);

  // Arrow navigation
  const goToMarker = useCallback(
    (index: number) => {
      if (visibleMarkerIds.length === 0) return;
      const wrappedIndex =
        ((index % visibleMarkerIds.length) + visibleMarkerIds.length) %
        visibleMarkerIds.length;
      setFocusedIndex(wrappedIndex);
      const id = visibleMarkerIds[wrappedIndex];
      const data = MARKER_DATA[id];

      // Move camera to marker position
      const position = markerPositionsRef.current[id];
      if (position) {
        cameraTargetRef.current.copy(position);
        isCameraAnimating.current = true; // trigger animation
      }

      setActiveMarker({
        id,
        name: data.name,
        description: data.description,
        category: data.category,
      });
    },
    [visibleMarkerIds],
  );

  const handlePrev = useCallback(() => {
    goToMarker((focusedIndex ?? 0) - 1);
  }, [focusedIndex, goToMarker]);

  const handleNext = useCallback(() => {
    goToMarker((focusedIndex ?? -1) + 1);
  }, [focusedIndex, goToMarker]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setActiveMarker(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  const handleMarkerClick = useCallback(
    (marker: {
      id: string;
      name: string;
      description: string;
      category: string;
    }) => {
      setActiveMarker(marker);
      const idx = visibleMarkerIds.indexOf(marker.id);
      if (idx !== -1) setFocusedIndex(idx);
    },
    [visibleMarkerIds],
  );

  const handleMarkerClose = useCallback(() => {
    setActiveMarker(null);
    setFocusedIndex(null);
  }, []);

  const toggleFilter = useCallback((category: string) => {
    setActiveFilters((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  }, []);

  return (
    <>
      {!started ? (
        // Splash screen
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#e1e1e1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => setStarted(true)}
            style={{
              padding: "12px 32px",
              fontSize: 40,
              fontWeight: 600,
              background: "#111",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onPointerEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = "#444";
            }}
            onPointerLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = "#111";
            }}
            onPointerDown={(e) => {
              (e.target as HTMLButtonElement).style.background = "#888";
            }}
            onPointerUp={(e) => {
              (e.target as HTMLButtonElement).style.background = "#444";
            }}
          >
            Explore Map
          </button>
        </div>
      ) : (
        <>
          <Canvas
            gl={{
              antialias: true, // smooths jagged edges
              toneMapping: THREE.ACESFilmicToneMapping, // how brightness/contrast is processed
              toneMappingExposure: 0.8, // multiplier
              outputColorSpace: THREE.SRGBColorSpace, // color display
            }}
            camera={{
              fov: 45,
              near: 0.1,
              far: 2000,
              position: [0, 75, 105],
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            shadows="soft"
          >
            <color attach="background" args={["#e1e1e1"]} />
            <ambientLight intensity={1.8} color="#ffffff" />
            <KeyLight />
            <FillLight />
            <RimLight />

            <OrbitControls
              enableDamping={true}
              dampingFactor={0.05} // lower = more smoothing, higher = snappier
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={20}
              maxDistance={500}
              maxPolarAngle={Math.PI / 2.5}
              ref={controlsRef}
            />

            <CameraController
              controlsRef={controlsRef}
              targetRef={cameraTargetRef}
              isAnimating={isCameraAnimating}
            />

            <Suspense fallback={null}>
              <MapScene
                onMarkerClick={handleMarkerClick}
                visibleMarkerIds={visibleMarkerIds}
                markerPositionsRef={markerPositionsRef}
              />
            </Suspense>
            {/* Post processing — always last inside Canvas 
      
      <EffectComposer multisampling={0} enableNormalPass>
        <SSAO
          blendFunction={BlendFunction.MULTIPLY} // multiples AO result with scene color, darkens occluded area naturally
          samples={32} // how many rays are cast to calculate occlusion (higher = better but more expensive)
          radius={30} // how far the AO effect reaches, small gives tight contact shadows while large give broader ambient darkening
          intensity={15} // how strong the darkening effect
          rings={4} // how many concentric rings of sample points are cast around each pixel. More rings = better quality
          distanceThreshold={1.0} // maximum worl space distance at which occlusion is calculated. The "reach", within 1 world unit coords
          distanceFalloff={0.0} // how gradually the occlusion fades out as the geometry approaches distance threshold. 0 means hard cut off
          rangeThreshold={0.5} //Similar to distanceThreshold but specifically for the depth range — filters out samples that are too far in depth from the current pixel to be considered occluders.
          // Prevents incorrect darkening from distant background geometry.
          rangeFalloff={0.1} // How gradually the range check fades. Small value like 0.1 means a fairly sharp cutoff —
          // geometry either counts as an occluder or it doesn't with minimal blending between.

          bias={0.5} // prevents self-occlusion artifacts. Without it flat surfaces can incorrectly occlude themselves and darken everything
          luminanceInfluence={0.3} // how much surface brightness affects the AO, lower = AO affect dark and bright areas equally
          color={ssaoColor} // the shadow color
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} exposure={1.2} />
      </EffectComposer>
      */}
          </Canvas>

          <BurgerMenu
            categories={ALL_CATEGORIES}
            activeFilters={activeFilters}
            onToggleFilter={toggleFilter}
            isOpen={menuOpen}
            onToggleMenu={() => setMenuOpen((prev) => !prev)}
          />

          <ArrowNav
            onPrev={handlePrev}
            onNext={handleNext}
            currentIndex={focusedIndex}
            total={visibleMarkerIds.length}
          />

          {/* Tooltip UI — outside Canvas, regular HTML */}
          <div
            role="dialog"
            aria-modal="false"
            aria-label={activeMarker?.name ?? "Marker info"}
            aria-hidden={!activeMarker}
            style={{
              position: "fixed",
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
              background: "white",
              padding: "20px 28px",
              borderRadius: 16,
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
              zIndex: 100,
              width: "min(600px, 90vw)", // wider, but responsive on mobile
              opacity: activeMarker ? 1 : 0,
              pointerEvents: activeMarker ? "auto" : "none",
              transition: "opacity 0.15s ease",
            }}
          >
            <button
              onClick={handleMarkerClose}
              aria-label="Close marker info"
              tabIndex={activeMarker ? 0 : -1}
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 20,
                color: "#999",
                lineHeight: 1,
              }}
            >
              ×
            </button>
            <p
              style={{
                fontSize: 15,
                color: "#605e5e",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}
            >
              {activeMarker?.category ?? ""}
            </p>
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: 24,
                fontWeight: 700,
                color: "#111",
                lineHeight: 1.2,
              }}
            >
              {activeMarker?.name ?? ""}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 18,
                color: "#000",
                lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}
            >
              {activeMarker?.description || ""}
            </p>
          </div>
          <LoadingScreen />
        </>
      )}
    </>
  );
}
/*
For tighter contact shadows reduce radius, for broader keep it where it is. 
For more/less intensity adjust intensity and luminanceInfluence together.
*/
