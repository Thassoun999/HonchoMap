import { useProgress } from "@react-three/drei";

export default function LoadingScreen() {
  const { active } = useProgress();

  if (!active) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(to right, #ffc6df,  #60b9fc)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <p
        style={{
          fontSize: 14,
          color: "#555",
          marginBottom: 16,
          fontWeight: 500,
        }}
      >
        Loading Map...
      </p>
      <div
        style={{
          width: 200,
          height: 4,
          background: "#ddd",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#333",
            borderRadius: 2,
            animation: "loading 1.5s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
