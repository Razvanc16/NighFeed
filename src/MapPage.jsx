import { useEffect, useRef, useState } from "react";
import { events } from "../data/events";

const filters = [
  { id: "all", label: "Toate", icon: "✦" },
  { id: "official", label: "Oficial", icon: "⚡" },
  { id: "homemade", label: "Homemade", icon: "🏠" },
  { id: "today", label: "Azi", icon: "🔥" },
  { id: "weekend", label: "Weekend", icon: "🎉" },
  { id: "free", label: "Gratuit", icon: "💸" },
];

const filterFn = (event, filter) => {
  if (filter === "all") return true;
  if (filter === "official") return event.type === "official";
  if (filter === "homemade") return event.type === "homemade";
  if (filter === "today") return event.date.toLowerCase().includes("azi");
  if (filter === "weekend") return event.date.toLowerCase().includes("weekend") || event.date.toLowerCase().includes("sâmbătă");
  if (filter === "free") return event.price === "Gratuit";
  return true;
};

// Coordinates for demo events
const eventCoords = {
  1: [44.4668, 26.0470],  // Romexpo
  2: [44.4588, 26.0921],  // Floreasca
  3: [44.4323, 26.1063],  // Centru Vechi
  4: [44.4268, 26.0199],  // Militari
  5: [46.7712, 23.6236],  // Cluj
};

// Confirmation toast
const ConfirmCard = ({ event, onConfirm, onCancel }) => (
  <div style={{
    position: "fixed", bottom: 80, left: 16, right: 16,
    background: "rgba(12,12,14,0.97)",
    border: `1px solid ${event.color}50`,
    borderRadius: 20, padding: "16px",
    backdropFilter: "blur(20px)",
    zIndex: 1000,
    animation: "slideUp 0.3s ease-out",
    boxShadow: `0 8px 40px ${event.color}30`,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${event.color}20`, border: `1px solid ${event.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
        {event.type === "official" ? "⚡" : "🏠"}
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{event.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace" }}>{event.date} · {event.price}</div>
      </div>
    </div>
    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", marginBottom: 14 }}>
      Vrei să te înscrii la acest eveniment?
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={onCancel} style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
        Anulează
      </button>
      <button onClick={onConfirm} style={{ flex: 2, padding: "10px", background: `linear-gradient(135deg, ${event.color}, ${event.color}cc)`, border: "none", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", boxShadow: `0 4px 16px ${event.color}40` }}>
        ✅ Vreau să vin!
      </button>
    </div>
  </div>
);

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [confirmEvent, setConfirmEvent] = useState(null);
  const [attending, setAttending] = useState({});
  const [toast, setToast] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load attending state
  useEffect(() => {
    const state = {};
    events.forEach(e => {
      state[e.id] = JSON.parse(localStorage.getItem(`attending_${e.id}`)) || false;
    });
    setAttending(state);
  }, []);

  // Load Leaflet CSS + JS dynamically
  useEffect(() => {
    if (document.getElementById("leaflet-css")) {
      setLeafletLoaded(true);
      return;
    }
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Init map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;
    const L = window.L;

    const map = L.map(mapRef.current, {
      center: [44.4268, 26.1025],
      zoom: 12,
      zoomControl: false,
    });

    // Dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#4FC3F7;border:3px solid #fff;box-shadow:0 0 0 4px rgba(79,195,247,0.3);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup("<b>Tu ești aici</b>");
      });
    }
  }, [leafletLoaded]);

  // Update markers when filter changes
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    // Remove old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const filtered = events.filter(e => filterFn(e, activeFilter));

    filtered.forEach(event => {
      const coords = eventCoords[event.id];
      if (!coords) return;

      const isHomemade = event.type === "homemade";
      const isAttending = attending[event.id];

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            position:relative;
            display:flex;
            flex-direction:column;
            align-items:center;
          ">
            <div style="
              width:36px;height:36px;border-radius:50%;
              background:${event.color};
              border:3px solid ${isAttending ? '#fff' : event.color + '80'};
              display:flex;align-items:center;justify-content:center;
              font-size:16px;
              box-shadow:0 4px 16px ${event.color}60;
              cursor:pointer;
            ">${isHomemade ? "🏠" : "⚡"}</div>
            <div style="
              width:0;height:0;
              border-left:6px solid transparent;
              border-right:6px solid transparent;
              border-top:8px solid ${event.color};
              margin-top:-2px;
            "></div>
          </div>
        `,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44],
      });

      // For homemade, slightly blur the coordinates
      let markerCoords = coords;
      if (isHomemade) {
        markerCoords = [
          coords[0] + (Math.random() - 0.5) * 0.008,
          coords[1] + (Math.random() - 0.5) * 0.008,
        ];
      }

      const marker = L.marker(markerCoords, { icon })
        .addTo(map)
        .on("click", () => setSelectedEvent(event));

      markersRef.current.push(marker);
    });
  }, [leafletLoaded, activeFilter, attending]);

  const handleAttend = (event) => {
    const newVal = !attending[event.id];
    setAttending(prev => ({ ...prev, [event.id]: newVal }));
    localStorage.setItem(`attending_${event.id}`, JSON.stringify(newVal));
    setConfirmEvent(null);
    setSelectedEvent(null);
    setToast(newVal ? `✅ Înscris la ${event.title}!` : `Ai renunțat`);
    setTimeout(() => setToast(null), 2500);
  };

  const handleNavigate = (event) => {
    const coords = eventCoords[event.id];
    if (!coords) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`, "_blank");
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#080808" }}>

      {/* Map container */}
      <div ref={mapRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />

      {/* Filter chips */}
      <div style={{
        position: "absolute", top: 16, left: 0, right: 0,
        display: "flex", gap: 6, padding: "0 12px",
        overflowX: "auto", zIndex: 500,
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            style={{
              flexShrink: 0,
              padding: "6px 12px",
              borderRadius: 20,
              background: activeFilter === f.id ? "rgba(255,51,102,0.9)" : "rgba(10,10,12,0.85)",
              border: `1px solid ${activeFilter === f.id ? "#FF3366" : "rgba(255,255,255,0.15)"}`,
              color: activeFilter === f.id ? "#fff" : "rgba(255,255,255,0.7)",
              fontSize: 12, fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", gap: 5,
              transition: "all 0.2s",
            }}
          >
            <span>{f.icon}</span> {f.label}
          </button>
        ))}
      </div>

      {/* Event count badge */}
      <div style={{
        position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)",
        background: "rgba(10,10,12,0.85)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20, padding: "4px 12px", zIndex: 500, backdropFilter: "blur(10px)",
      }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Mono', monospace" }}>
          {events.filter(e => filterFn(e, activeFilter)).length} evenimente
        </span>
      </div>

      {/* Selected event popup */}
      {selectedEvent && !confirmEvent && (
        <div style={{
          position: "absolute", bottom: 80, left: 16, right: 16,
          background: "rgba(12,12,14,0.97)",
          border: `1px solid ${selectedEvent.color}40`,
          borderRadius: 20, padding: "16px",
          backdropFilter: "blur(20px)",
          zIndex: 600,
          animation: "slideUp 0.25s ease-out",
          boxShadow: `0 8px 40px rgba(0,0,0,0.5)`,
        }}>
          {/* Close */}
          <button onClick={() => setSelectedEvent(null)} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "rgba(255,255,255,0.5)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ×
          </button>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${selectedEvent.color}20`, border: `1px solid ${selectedEvent.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {selectedEvent.type === "official" ? "⚡" : "🏠"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: selectedEvent.color, fontWeight: 700, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
                {selectedEvent.type === "official" ? "⚡ Oficial" : "🏠 Homemade"}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", lineHeight: 1.2 }}>
                {selectedEvent.title}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Mono', monospace" }}>🕐 {selectedEvent.date}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Mono', monospace" }}>📍 {selectedEvent.type === "homemade" ? "Zonă aproximativă" : selectedEvent.venue}</div>
            <div style={{ fontSize: 12, color: selectedEvent.color, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{selectedEvent.price}</div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setConfirmEvent(selectedEvent)}
              style={{
                flex: 2, padding: "11px",
                background: attending[selectedEvent.id] ? `${selectedEvent.color}30` : `linear-gradient(135deg, ${selectedEvent.color}, ${selectedEvent.color}cc)`,
                border: `1px solid ${attending[selectedEvent.id] ? selectedEvent.color : "transparent"}`,
                borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                boxShadow: attending[selectedEvent.id] ? "none" : `0 4px 16px ${selectedEvent.color}40`,
              }}
            >
              {attending[selectedEvent.id] ? "✅ Participi" : "⭐ Vreau să vin"}
            </button>
            <button
              onClick={() => handleNavigate(selectedEvent)}
              style={{
                flex: 1, padding: "11px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 12, color: "#fff", fontSize: 13,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              }}
            >
              🗺️ Navighez
            </button>
          </div>
        </div>
      )}

      {/* Confirm card */}
      {confirmEvent && (
        <ConfirmCard
          event={confirmEvent}
          onConfirm={() => handleAttend(confirmEvent)}
          onCancel={() => setConfirmEvent(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "absolute", bottom: 90, left: "50%", transform: "translateX(-50%)",
          background: "rgba(20,20,20,0.95)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 20, padding: "10px 20px", zIndex: 700,
          color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          backdropFilter: "blur(20px)", whiteSpace: "nowrap",
          animation: "fadeIn 0.3s ease-out",
        }}>
          {toast}
        </div>
      )}

      {/* Leaflet attribution fix */}
      <style>{`
        .leaflet-control-attribution { display: none !important; }
        .leaflet-control-zoom { border: 1px solid rgba(255,255,255,0.1) !important; background: rgba(10,10,12,0.9) !important; }
        .leaflet-control-zoom a { color: rgba(255,255,255,0.7) !important; background: transparent !important; border-color: rgba(255,255,255,0.1) !important; }
        .leaflet-popup-content-wrapper { background: rgba(12,12,14,0.97) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #fff !important; border-radius: 12px !important; }
        .leaflet-popup-tip { background: rgba(12,12,14,0.97) !important; }
      `}</style>
    </div>
  );
}
