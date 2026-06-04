import { useState, useRef, useEffect } from "react";

// SVG Icons
const HeartIcon = ({ filled, color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={filled ? color : "rgba(255,255,255,0.8)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const StarIcon = ({ filled, color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={filled ? color : "rgba(255,255,255,0.8)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const CheckIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const HeartParticle = ({ x, y, id, color }) => (
  <div style={{
    position: "absolute", left: x - 10, top: y - 10,
    pointerEvents: "none",
    animation: "floatHeart 1.2s ease-out forwards",
    zIndex: 100,
  }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  </div>
);

const BigHeart = ({ show, color }) => (
  <div style={{
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    opacity: show ? 1 : 0,
    animation: show ? "bigHeartPop 0.7s ease-out forwards" : "none",
    pointerEvents: "none", zIndex: 99,
    filter: `drop-shadow(0 0 30px ${color}80)`,
  }}>
    <svg width="100" height="100" viewBox="0 0 24 24" fill={color}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  </div>
);

const Toast = ({ message, show, color }) => (
  <div style={{
    position: "fixed", bottom: 90, left: "50%",
    transform: `translateX(-50%) translateY(${show ? "0" : "20px"})`,
    opacity: show ? 1 : 0,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    background: "rgba(20,20,20,0.95)",
    border: `1px solid ${color}60`, borderRadius: 20,
    padding: "10px 20px", color: "#fff", fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    zIndex: 300, backdropFilter: "blur(20px)",
    boxShadow: `0 4px 20px ${color}30`,
    whiteSpace: "nowrap", pointerEvents: "none",
  }}>
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

  useEffect(() => {
    const savedLiked = JSON.parse(localStorage.getItem(`liked_${event.id}`)) || false;
    setLikeCount(event.likes + (savedLiked ? 1 : 0));
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
    if (now - lastTap.current < 300) triggerLike(e);
    lastTap.current = now;
  };

  const triggerLike = (e) => {
    if (!liked) {
      setLiked(true);
      setLikeCount(c => c + 1);
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
    setHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => setHearts([]), 1400);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(c => newLiked ? c + 1 : c - 1);
    localStorage.setItem(`liked_${event.id}`, JSON.stringify(newLiked));
  };

  const handleAttend = (e) => {
    e.stopPropagation();
    const newAttending = !attending;
    setAttending(newAttending);
    setAttendCount(c => newAttending ? c + 1 : c - 1);
    localStorage.setItem(`attending_${event.id}`, JSON.stringify(newAttending));
    if (newAttending) showToast(`Ești pe lista pentru ${event.title}!`, event.color);
    else showToast(`Ai renunțat la ${event.title}`, "rgba(255,255,255,0.5)");
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: event.title, text: `${event.title} — ${event.venue} · ${event.date}`, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast("Link copiat!", event.color);
    }
  };

  const formatNum = (n) => n >= 1000 ? (n / 1000).toFixed(1) + "k" : n;

  const ActionBtn = ({ onClick, children, active, label }) => (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: 0 }}>
      <div style={{
        width: 46, height: 46, borderRadius: "50%",
        background: active ? `${event.color}25` : "rgba(255,255,255,0.08)",
        border: `1.5px solid ${active ? event.color : "rgba(255,255,255,0.15)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: active ? `0 0 20px ${event.color}50` : "none",
        transition: "all 0.2s",
        transform: active ? "scale(1.08)" : "scale(1)",
        backdropFilter: "blur(10px)",
      }}>
        {children}
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700,
        color: active ? event.color : "rgba(255,255,255,0.55)",
        fontFamily: "'DM Mono', monospace",
        transition: "color 0.2s",
      }}>
        {label}
      </span>
    </button>
  );

  return (
    <div ref={cardRef} onClick={handleDoubleTap} style={{
      width: "100%", height: "100%", position: "relative",
      background: event.bgColor, overflow: "hidden",
      userSelect: "none", WebkitUserSelect: "none", cursor: "pointer", flexShrink: 0,
    }}>
      {/* BG */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${event.color}40 0%, transparent 70%)` }} />
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${event.color}30 0%, transparent 70%)`, filter: "blur(40px)", animation: isActive ? "pulse 3s ease-in-out infinite" : "none" }} />

      {/* Icon */}
      <div style={{ position: "absolute", top: "18%", left: "50%", transform: "translateX(-50%)", width: 120, height: 120, borderRadius: 28, background: `${event.color}20`, border: `1.5px solid ${event.color}50`, backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>
        {event.type === "official" ? "⚡" : "🏠"}
      </div>

      {/* Gradient */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "65%", background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)" }} />

      {/* Badge */}
      <div style={{ position: "absolute", top: 20, left: 16, padding: "4px 10px", borderRadius: 20, background: event.type === "official" ? `${event.color}30` : "rgba(255,255,255,0.1)", border: `1px solid ${event.type === "official" ? event.color + "80" : "rgba(255,255,255,0.2)"}`, backdropFilter: "blur(10px)", display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 11 }}>{event.type === "official" ? "⚡" : "🏠"}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: event.type === "official" ? event.color : "rgba(255,255,255,0.85)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
          {event.type === "official" ? "Oficial" : "Homemade"}
        </span>
      </div>

      {/* Content */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 64, padding: "0 16px 28px" }}>
        <div style={{ fontSize: 11, color: event.color, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 6, opacity: 0.9 }}>{event.organizer}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 8, fontFamily: "'Syne', sans-serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{event.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Mono', monospace" }}>📍 {event.venue}</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>·</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Mono', monospace" }}>🕐 {event.date}</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: 0, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>{event.description}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {event.tags.map(tag => (
            <span key={tag} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 12, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Mono', monospace" }}>#{tag}</span>
          ))}
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: `${event.color}25`, color: event.color, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{event.price}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ position: "absolute", right: 12, bottom: 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <ActionBtn onClick={handleLike} active={liked} label={formatNum(likeCount)}>
          <HeartIcon filled={liked} color={event.color} />
        </ActionBtn>
        <ActionBtn onClick={handleAttend} active={attending} label={formatNum(attendCount)}>
          {attending ? <CheckIcon color={event.color} /> : <StarIcon filled={false} color={event.color} />}
        </ActionBtn>
        <ActionBtn onClick={handleShare} active={false} label="Share">
          <ShareIcon />
        </ActionBtn>
      </div>

      {hearts.map(h => <HeartParticle key={h.id} x={h.x} y={h.y} id={h.id} color={event.color} />)}
      <BigHeart show={bigHeart} color={event.color} />
      <Toast show={toast.show} message={toast.message} color={toast.color} />
    </div>
  );
}
