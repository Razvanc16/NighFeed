import { useState, useRef, useEffect } from "react";

const HeartParticle = ({ x, y, id }) => (
  <div
    key={id}
    style={{
      position: "absolute",
      left: x - 12,
      top: y - 12,
      fontSize: "24px",
      pointerEvents: "none",
      animation: "floatHeart 1.2s ease-out forwards",
      zIndex: 100,
    }}
  >
    ❤️
  </div>
);

const BigHeart = ({ show }) => (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "100px",
      opacity: show ? 1 : 0,
      transition: "opacity 0.1s",
      animation: show ? "bigHeartPop 0.7s ease-out forwards" : "none",
      pointerEvents: "none",
      zIndex: 99,
      filter: "drop-shadow(0 0 30px rgba(255,100,100,0.8))",
    }}
  >
    ❤️
  </div>
);

// Toast notification component
const Toast = ({ message, show, color }) => (
  <div
    style={{
      position: "fixed",
      bottom: 90,
      left: "50%",
      transform: `translateX(-50%) translateY(${show ? "0" : "20px"})`,
      opacity: show ? 1 : 0,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      background: "rgba(20,20,20,0.95)",
      border: `1px solid ${color}60`,
      borderRadius: 20,
      padding: "10px 20px",
      color: "#fff",
      fontSize: 13,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 500,
      zIndex: 300,
      backdropFilter: "blur(20px)",
      boxShadow: `0 4px 20px ${color}30`,
      whiteSpace: "nowrap",
      pointerEvents: "none",
    }}
  >
    {message}
  </div>
);

export default function EventCard({ event, isActive }) {
  const [liked, setLiked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`liked_${event.id}`)) || false; } catch { return false; }
  });
  const [likeCount, setLikeCount] = useState(event.likes);
  const [attending, setAttending] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`attending_${event.id}`)) || false; } catch { return false; }
  });
  const [attendCount, setAttendCount] = useState(event.attending);
  const [hearts, setHearts] = useState([]);
  const [bigHeart, setBigHeart] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", color: "#fff" });
  const lastTap = useRef(0);
  const cardRef = useRef(null);
  const toastTimer = useRef(null);

  // Sync like count with localStorage delta
  useEffect(() => {
    const savedLiked = JSON.parse(localStorage.getItem(`liked_${event.id}`)) || false;
    setLikeCount(event.likes + (savedLiked ? 1 : 0));
  }, []);

  useEffect(() => {
    const savedAttending = JSON.parse(localStorage.getItem(`attending_${event.id}`)) || false;
    setAttendCount(event.attending + (savedAttending ? 1 : 0));
  }, []);

  const showToast = (message, color) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ show: true, message, color });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2000);
  };

  const handleDoubleTap = (e) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      triggerLike(e);
    }
    lastTap.current = now;
  };

  const triggerLike = (e) => {
    if (!liked) {
      setLiked(true);
      setLikeCount((c) => c + 1);
      localStorage.setItem(`liked_${event.id}`, "true");
    }

    setBigHeart(true);
    setTimeout(() => setBigHeart(false), 700);

    const rect = cardRef.current?.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - (rect?.left || 0);
    const y = clientY - (rect?.top || 0);

    const newHearts = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 60,
    }));
    setHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => setHearts([]), 1400);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => newLiked ? c + 1 : c - 1);
    localStorage.setItem(`liked_${event.id}`, JSON.stringify(newLiked));
  };

  const handleAttend = (e) => {
    e.stopPropagation();
    const newAttending = !attending;
    setAttending(newAttending);
    setAttendCount((c) => newAttending ? c + 1 : c - 1);
    localStorage.setItem(`attending_${event.id}`, JSON.stringify(newAttending));
    
    if (newAttending) {
      showToast(`✅ Ești pe lista pentru ${event.title}!`, event.color);
    } else {
      showToast(`Ai renunțat la ${event.title}`, "rgba(255,255,255,0.5)");
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `${event.title} — ${event.venue} · ${event.date}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast("🔗 Link copiat!", event.color);
    }
  };

  const formatNum = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n);

  return (
    <div
      ref={cardRef}
      onClick={handleDoubleTap}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: event.bgColor,
        overflow: "hidden",
        userSelect: "none",
        WebkitUserSelect: "none",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {/* Background visual */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${event.color}40 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      {/* Animated glow orb */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${event.color}30 0%, transparent 70%)`,
          filter: "blur(40px)",
          animation: isActive ? "pulse 3s ease-in-out infinite" : "none",
        }}
      />

      {/* Icon */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: 120,
          borderRadius: 28,
          background: `${event.color}20`,
          border: `1.5px solid ${event.color}50`,
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 52,
        }}
      >
        {event.type === "official" ? "⚡" : "🏠"}
      </div>

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "65%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)",
        }}
      />

      {/* Badge */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 16,
          padding: "4px 10px",
          borderRadius: 20,
          background: event.type === "official" ? `${event.color}30` : "rgba(255,255,255,0.1)",
          border: `1px solid ${event.type === "official" ? event.color + "80" : "rgba(255,255,255,0.2)"}`,
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <span style={{ fontSize: 11 }}>{event.type === "official" ? "⚡" : "🏠"}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: event.type === "official" ? event.color : "rgba(255,255,255,0.85)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {event.type === "official" ? "Oficial" : "Homemade"}
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 64,
          padding: "0 16px 28px",
        }}
      >
        <div style={{ fontSize: 11, color: event.color, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 6, opacity: 0.9 }}>
          {event.organizer}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 8, fontFamily: "'Syne', sans-serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
          {event.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Mono', monospace" }}>📍 {event.venue}</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>·</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Mono', monospace" }}>🕐 {event.date}</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: 0, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
          {event.description}
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {event.tags.map((tag) => (
            <span key={tag} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 12, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Mono', monospace" }}>
              #{tag}
            </span>
          ))}
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: `${event.color}25`, color: event.color, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
            {event.price}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: 90,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Like */}
        <button onClick={handleLike} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: liked ? `${event.color}30` : "rgba(255,255,255,0.1)",
            border: `1.5px solid ${liked ? event.color : "rgba(255,255,255,0.2)"}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            boxShadow: liked ? `0 0 16px ${event.color}60` : "none",
            transition: "all 0.2s", backdropFilter: "blur(10px)",
            transform: liked ? "scale(1.1)" : "scale(1)",
          }}>
            {liked ? "❤️" : "🤍"}
          </div>
          <span style={{ fontSize: 11, color: liked ? event.color : "rgba(255,255,255,0.6)", fontWeight: 700, fontFamily: "'DM Mono', monospace", transition: "color 0.2s" }}>
            {formatNum(likeCount)}
          </span>
        </button>

        {/* Attend */}
        <button onClick={handleAttend} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: attending ? `${event.color}30` : "rgba(255,255,255,0.1)",
            border: `1.5px solid ${attending ? event.color : "rgba(255,255,255,0.2)"}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            boxShadow: attending ? `0 0 16px ${event.color}60` : "none",
            transition: "all 0.2s", backdropFilter: "blur(10px)",
            transform: attending ? "scale(1.1)" : "scale(1)",
          }}>
            {attending ? "✅" : "⭐"}
          </div>
          <span style={{ fontSize: 11, color: attending ? event.color : "rgba(255,255,255,0.6)", fontWeight: 700, fontFamily: "'DM Mono', monospace", transition: "color 0.2s" }}>
            {formatNum(attendCount)}
          </span>
        </button>

        {/* Share */}
        <button onClick={handleShare} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            backdropFilter: "blur(10px)", transition: "all 0.2s",
          }}>
            🔗
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
            Share
          </span>
        </button>
      </div>

      {/* Double tap hearts */}
      {hearts.map((h) => (
        <HeartParticle key={h.id} x={h.x} y={h.y} id={h.id} />
      ))}
      <BigHeart show={bigHeart} />

      {/* Toast */}
      <Toast show={toast.show} message={toast.message} color={toast.color} />
    </div>
  );
}
