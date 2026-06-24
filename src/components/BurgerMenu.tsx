interface BurgerMenuProps {
  categories: string[];
  activeFilters: string[];
  onToggleFilter: (category: string) => void;
  isOpen: boolean;
  onToggleMenu: () => void;
}

export default function BurgerMenu({
  categories,
  activeFilters,
  onToggleFilter,
  isOpen,
  onToggleMenu,
}: BurgerMenuProps) {
  return (
    <div
      style={{ zIndex: 200 }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) onToggleMenu();
      }}
    >
      {/* Burger Button */}
      <button
        onClick={onToggleMenu}
        tabIndex={0}
        aria-label={isOpen ? "Close filter menu" : "Open filter menu"}
        aria-expanded={isOpen}
        aria-controls="filter-menu"
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
        }}
      >
        <span
          style={{ width: 20, height: 2, background: "#333", borderRadius: 2 }}
        />
        <span
          style={{ width: 20, height: 2, background: "#333", borderRadius: 2 }}
        />
        <span
          style={{ width: 20, height: 2, background: "#333", borderRadius: 2 }}
        />
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div
          id="filter-menu"
          role="group"
          aria-label="Filter markers by category"
          style={{
            position: "absolute",
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
              fontSize: 12,
              color: "#888",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Filter by Category
          </p>
          {categories.map((category) => (
            <label
              key={category}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 0",
                cursor: "pointer",
                fontSize: 14,
                color: "#333",
              }}
            >
              <input
                type="checkbox"
                checked={activeFilters.includes(category)}
                onChange={() => onToggleFilter(category)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onToggleFilter(category);
                }}
                aria-label={`Filter by ${category}`}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              {category}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
