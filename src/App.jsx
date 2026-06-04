import { useState, useRef, useEffect } from "react";
import EventCard from "./components/EventCard";
import FilterDrawer from "./components/FilterDrawer";
import Navbar from "./components/Navbar";
import ProgressDots from "./components/ProgressDots";
import ProfilePage from "./components/ProfilePage";
import MapPage from "./components/MapPage";
import { events } from "./data/events";

const filterFn = (event, filter) => {
  if (filter === "all") return true;
  if (filter === "official") return event.type === "official";
  if (filter === "homemade") return event.type === "homemade";
  if (filter === "today") return event.date.toLowerCase().includes("azi");
  if (filter === "weekend") return event.date.toLowerCase().includes("weekend") || event.date.toLowerCase().includes("sâmbătă");
  if (filter === "free") return event.price === "Gratuit";
  return true;
};

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("feed");
  const [activeFilter, setActiveFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const feedRef = useRef(null);

  const filtered = events.filter((e) => filterFn(e, activeFilter));

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const handleScroll = () => {
      const index = Math.round(feed.scrollTop / feed.clientHeight);
      setCurrentIndex(Math.min(index, filtered.length - 1));
    };
    feed.addEventListener("scroll", handleScroll, { passive: true });
    return () => feed.removeEventListener("scroll", handleScroll);
  }, [filtered.length]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: "instant" });
      setCurrentIndex(0);
    }
  }, [activeFilter]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: #000; overflow: hidden; font-family: 'DM Sans', sans-serif; }
        #root { width: 100vw; height: 100dvh; position: relative; overflow: hidden; }
        @keyframes floatHeart {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-80px) scale(0.5); opacity: 0; }
        }
        @keyframes bigHeartPop {
          0%   { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
          50%  { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
          50%       { opacity: 0.8; transform: translateX(-50%) scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* MAP PAGE */}
      {activeTab === "map" && (
        <div style={{
          position: "fixed", inset: 0,
          height: "calc(100dvh - 64px)",
          zIndex: 10,
        }}>
          <MapPage />
        </div>
      )}

      {/* PROFIL PAGE */}
      {activeTab === "profile" && (
        <div style={{
          position: "fixed", inset: 0,
          height: "calc(100dvh - 64px)",
          zIndex: 10,
          animation: "slideUp 0.3s ease-out",
        }}>
          <ProfilePage />
        </div>
      )}

      {/* FEED */}
      <div style={{ display: activeTab === "feed" ? "block" : "none" }}>
        <div
          ref={feedRef}
          style={{
            width: "100%",
            height: "calc(100dvh - 64px)",
            overflowY: "scroll",
            scrollSnapType: "y mandatory",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", gap: 12 }}>
              <span style={{ fontSize: 48 }}>🌙</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16 }}>Niciun eveniment găsit</span>
            </div>
          ) : (
            filtered.map((event, i) => (
              <div key={event.id} style={{ width: "100%", height: "calc(100dvh - 64px)", scrollSnapAlign: "start", scrollSnapStop: "always", flexShrink: 0 }}>
                <EventCard event={event} isActive={i === currentIndex} />
              </div>
            ))
          )}
        </div>

        {filtered.length > 1 && (
          <ProgressDots total={filtered.length} current={currentIndex} color={filtered[currentIndex]?.color} />
        )}

        {/* Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            position: "fixed", top: 20, right: 16,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12, width: 40, height: 40,
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 5, backdropFilter: "blur(10px)", zIndex: 50, padding: 0,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: i === 1 ? 14 : 18, height: 2, borderRadius: 2, background: "rgba(255,255,255,0.8)" }} />
          ))}
        </button>

        {activeFilter !== "all" && (
          <div style={{
            position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
            padding: "5px 14px", borderRadius: 20,
            background: "rgba(255,51,102,0.2)", border: "1px solid rgba(255,51,102,0.4)",
            backdropFilter: "blur(10px)", zIndex: 50,
            display: "flex", alignItems: "center", gap: 6,
            animation: "fadeIn 0.3s ease-out",
          }}>
            <span style={{ fontSize: 10, color: "#FF3366", fontWeight: 700, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {activeFilter}
            </span>
            <button onClick={() => setActiveFilter("all")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,51,102,0.7)", fontSize: 14, lineHeight: 1, padding: 0 }}>
              ×
            </button>
          </div>
        )}

        <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} active={activeFilter} onChange={setActiveFilter} />
      </div>

      <Navbar active={activeTab} onChange={setActiveTab} />
    </>
  );
}
