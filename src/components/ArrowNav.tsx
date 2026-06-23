interface ArrowNavProps {
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number | null;
  total: number;
}

export default function ArrowNav({
  onPrev,
  onNext,
  currentIndex,
  total,
}: ArrowNavProps) {
  if (total === 0) return null;
  return (
    <>
      {/* Left Arrow */}
      <button
        onClick={onPrev}
        aria-label="Previous marker"
        tabIndex={0}
        style={{
          position: "fixed",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "white",
          border: "none",
          cursor: "pointer",
          fontSize: 20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
        }}
      >
        ‹
      </button>

      {/* Right Arrow */}
      <button
        onClick={onNext}
        aria-label="Next marker"
        tabIndex={0}
        style={{
          position: "fixed",
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "white",
          border: "none",
          cursor: "pointer",
          fontSize: 20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
        }}
      >
        ›
      </button>

      {/* Counter */}
      {currentIndex !== null && (
        <div
          aria-live="polite"
          aria-label={`Marker ${currentIndex + 1} of ${total}`}
          style={{
            position: "fixed",
            bottom: "auto",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: 12,
            zIndex: 200,
          }}
        >
          {currentIndex + 1} / {total}
        </div>
      )}
    </>
  );
}
