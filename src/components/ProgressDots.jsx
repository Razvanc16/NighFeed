export default function ProgressDots({ total, current, color }) {
  return (
    <div
      style={{
        position: "fixed",
        right: 6,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        zIndex: 50,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 4 : 3,
            height: i === current ? 18 : 8,
            borderRadius: 4,
            background: i === current ? color || "#FF3366" : "rgba(255,255,255,0.25)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: i === current ? `0 0 8px ${color || "#FF3366"}80` : "none",
          }}
        />
      ))}
    </div>
  );
}
