interface CreditsMenuProps {
  isOpen: boolean;
  onToggleMenu: () => void;
}

export default function CreditsMenu({
  isOpen,
  onToggleMenu,
}: CreditsMenuProps) {
  return (
    <div
      style={{ zIndex: 200 }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) onToggleMenu();
      }}
    >
      {/* Credits Button */}
      <button
        onClick={onToggleMenu}
        tabIndex={0}
        aria-label={isOpen ? "Close Credits menu" : "Open Credits menu"}
        aria-expanded={isOpen}
        aria-controls="credits-menu"
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          fontWeight: 300,
          fontSize: 25,
        }}
      >
        ?
      </button>

      {/* Credit Panel */}
      {isOpen && (
        <div
          id="credits-menu"
          role="group"
          aria-label="Credits Menu"
          style={{
            marginTop: 8,
            background: "white",
            borderRadius: 12,
            padding: "12px 16px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            minWidth: 200,
          }}
        >
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 16,
              color: "#000",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Honcho Campout Map Made By:
          </p>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              color: "#4c4b4b",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Sydra Hassoun -{" "}
            <a
              href={"https://backwards-sunrise.com/"}
              target="_blank"
              style={{ textDecorationLine: "underline" }}
              aria-label="Link To Sydra Hassoun Portfolio and Freelance Website"
            >
              Backwards Sunrise
            </a>
          </p>
          <br />
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 16,
              color: "#000",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Additional Assets:
          </p>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              color: "#4c4b4b",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Low Poly RV By: inzanegamemaker11
          </p>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              color: "#4c4b4b",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            "Ford Focus Low Poly" by Iron Minecart2 -{" "}
            <a
              href={"https://skfb.ly/ooTHT"}
              target="_blank"
              style={{ textDecorationLine: "underline" }}
              aria-label="External Link to Sketchfab"
            >
              SketchFab Link
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
