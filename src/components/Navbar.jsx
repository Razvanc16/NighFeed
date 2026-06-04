const tabs = [
  { id: "feed", icon: "▶", label: "Feed" },
  { id: "search", icon: "◎", label: "Caută" },
  { id: "post", icon: "✚", label: "Post" },
  { id: "map", icon: "◈", label: "Hartă" },
  { id: "profile", icon: "◉", label: "Profil" },
];

export default function Navbar({ active, onChange }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 100,
        padding: "0 4px env(safe-area-inset-bottom, 0)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const isPost = tab.id === "post";
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              background: isPost
                ? "linear-gradient(135deg, #FF3366, #FF6B35)"
                : "none",
              border: isPost ? "none" : "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: isPost ? 0 : 3,
              padding: isPost ? 0 : "4px 12px",
              borderRadius: isPost ? "50%" : 12,
              width: isPost ? 44 : "auto",
              height: isPost ? 44 : "auto",
              justifyContent: "center",
              boxShadow: isPost ? "0 4px 20px rgba(255,51,102,0.4)" : "none",
              transform: isPost ? "translateY(-8px)" : "none",
              transition: "all 0.2s",
            }}
          >
            <span
              style={{
                fontSize: isPost ? 22 : 18,
                color: isPost
                  ? "#fff"
                  : isActive
                  ? "#FF3366"
                  : "rgba(255,255,255,0.4)",
                transition: "color 0.15s",
                lineHeight: 1,
              }}
            >
              {tab.icon}
            </span>
            {!isPost && (
              <span
                style={{
                  fontSize: 10,
                  color: isActive ? "#FF3366" : "rgba(255,255,255,0.35)",
                  fontWeight: isActive ? 700 : 400,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.05em",
                  transition: "color 0.15s",
                }}
              >
                {tab.label}
              </span>
            )}
            {isActive && !isPost && (
              <div
                style={{
                  position: "absolute",
                  bottom: 6,
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: "#FF3366",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
