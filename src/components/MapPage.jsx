import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import { events as staticEvents } from "../data/events";

const filters = [
  { id: "all", label: "Toate", icon: "✦" },
  { id: "official", label: "Oficial", icon: "⚡" },
  { id: "homemade", label: "Homemade", icon: "🏠" },
  { id: "today", label: "Azi", icon: "🔥" },
  { id: "free", label: "Gratuit", icon: "💸" },
];

const filterFn = (event, filter) => {
  if (filter === "all") return true;
  if (filter === "official") return event.type === "official";
  if (filter === "homemade") return event.type === "homemade";
  if (filter === "today") return event.date?.toLowerCase().includes("azi");
  if (filter === "free") return event.price === "Gratuit";
  return true;
};

const staticCoords = {
  1: [44.4668, 26.0470],
  2: [44.4588, 26.0921],
  3: [44.4323, 26.1063],
  4: [44.4268, 26.0199],
  5: [46.7712, 23.6236],
};

export default function MapPage({ user }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const circlesRef = useRef([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attending, setAttending] = useState({});
  const [toast, setToast] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [postedEvents, setPostedEvents] = useState([]);

  useEffect(() => {
    const state = {};
    staticEvents.forEach(e => {
      state[e.id] = JSON.parse(localStorage.getItem(`attending_${e.id}`)) || false;
    });
    setAttending(state);
    loadPostedEvents();
  }, []);

  const loadPostedEvents = async () => {
    const { data } = await supabase.from("posted_events").select("*").not("lat", "is", null);
    setPostedEvents(data || []);
  };

  useEffect(() => {
    if (document.getElementById("leaflet-css")) { setLeafletLoaded(true); return; }
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

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center: [44.4268, 26.1025], zoom: 12, zoomControl: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapInstanceRef.current = map;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#4FC3F7;border:3px solid #fff;box-shadow:0 0 0 4px rgba(79,195,247,0.3);"></div>`,
          iconSize: [16, 16], iconAnchor: [8, 8],
        });
        L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
      });
    }
  }, [leafletLoaded]);

  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    markersRef.current.forEach(m => map.removeLayer(m));
    circlesRef.current.forEach(c => map.removeLayer(c));
    markersRef.current = [];
    circlesRef.current = [];

    // Static events
    const allEvents = [
      ...staticEvents.filter(e => filterFn(e, activeFilter)).map(e => ({
        ...e, coords: staticCoords[e.id], isHomemade: e.type === "homemade", isPosted: false,
      })),
      ...postedEvents.filter(e => filterFn(e, activeFilter)).map(e => ({
        id: `posted_${e.id}`,
        title: e.title, venue: e.venue, date: e.date, price: e.price || "Gratuit",
        type: e.type, description: e.description,
        color: e.type === "official" ? "#FF3366" : "#FFB800",
        coords: [e.lat, e.lng],
        isHomemade: e.type === "homemade",
        isPosted: true,
        rawId: e.id,
      })),
    ].filter(e => e.coords);

    allEvents.forEach(event => {
      const isHomemade = event.isHomemade;
      const color = event.color || "#FF3366";

      // For homemade: show circle + blurred pin
      let markerCoords = event.coords;
      if (isHomemade) {
        markerCoords = [
          event.coords[0] + (Math.random() - 0.5) * 0.001,
          event.coords[1] + (Math.random() - 0.5) * 0.001,
        ];
        // Draw privacy circle ~100m
        const circle = L.circle(event.coords, {
          radius: 150,
          color: color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 1.5,
          opacity: 0.4,
          dashArray: "6, 4",
        }).addTo(map);
        circlesRef.current.push(circle);
      }

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="width:36px;height:36px;border-radius:50%;background:${color};border:3px solid ${attending[event.id] ? '#fff' : color + '80'};display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 16px ${color}60;cursor:pointer;${isHomemade ? 'filter:blur(1.5px);' : ''}">
              ${isHomemade ? "🏠" : "⚡"}
            </div>
            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${color};margin-top:-2px;"></div>
          </div>
        `,
        iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -44],
      });

      const marker = L.marker(markerCoords, { icon }).addTo(map).on("click", () => setSelectedEvent(event));
      markersRef.current.push(marker);
    });
  }, [leafletLoaded, activeFilter, attending, postedEvents]);

  const handleAttend = (event) => {
    const newVal = !attending[event.id];
    setAttending(prev => ({ ...prev, [event.id]: newVal }));
    localStorage.setItem(`attending_${event.id}`, JSON.stringify(newVal));
    setSelectedEvent(null);
    setToast(newVal ? `✅ Înscris la ${event.title}!` : "Ai renunțat");
    setTimeout(() => setToast(null), 2500);
  };

  const handleNavigate = (event) => {
    if (!event.coords) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.coords[0]},${event.coords[1]}`, "_blank");
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#080808" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />

      {/* Filter chips */}
      <div style={{ position: "absolute", top: 16, left: 0, right: 0, display: "flex", gap: 6, padding: "0 12px", overflowX: "auto", zIndex: 500, scrollbarWidth: "none" }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 20, background: activeFilter === f.id ? "rgba(255,51,102,0.9)" : "rgba(10,10,12,0.85)", border: `1px solid ${activeFilter === f.id ? "#FF3366" : "rgba(255,255,255,0.15)"}`, color: activeFilter === f.id ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace", cursor: "pointer", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s" }}>
            <span>{f.icon}</span> {f.label}
          </button>
        ))}
      </div>

      {/* Selected event popup */}
      {selectedEvent && (
        <div style={{ position: "absolute", bottom: 80, left: 16, right: 16, background: "rgba(12,12,14,0.97)", border: `1px solid ${selectedEvent.color}40`, borderRadius: 20, padding: "16px", backdropFilter: "blur(20px)", zIndex: 600, animation: "slideUp 0.25s ease-out", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
          <button onClick={() => setSelectedEvent(null)} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "rgba(255,255,255,0.5)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>

          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${selectedEvent.color}20`, border: `1px solid ${selectedEvent.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {selectedEvent.type === "official" ? "⚡" : "🏠"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: selectedEvent.color, fontWeight: 700, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", marginBottom: 3 }}>
                {selectedEvent.type === "official" ? "⚡ Oficial" : "🏠 Homemade"}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{selectedEvent.title}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Mono', monospace" }}>🕐 {selectedEvent.date}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Mono', monospace" }}>
              📍 {selectedEvent.isHomemade ? "Zonă aproximativă 🔒" : selectedEvent.venue}
            </span>
            <span style={{ fontSize: 12, color: selectedEvent.color, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{selectedEvent.price}</span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => handleAttend(selectedEvent)} style={{ flex: 2, padding: "11px", background: attending[selectedEvent.id] ? `${selectedEvent.color}30` : `linear-gradient(135deg, ${selectedEvent.color}, ${selectedEvent.color}cc)`, border: `1px solid ${attending[selectedEvent.id] ? selectedEvent.color : "transparent"}`, borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
              {attending[selectedEvent.id] ? "✅ Participi" : "⭐ Vreau să vin"}
            </button>
            <button onClick={() => handleNavigate(selectedEvent)} style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
              🗺️ Navighez
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "absolute", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "rgba(20,20,20,0.95)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "10px 20px", zIndex: 700, color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif", backdropFilter: "blur(20px)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      <style>{`
        .leaflet-control-attribution { display: none !important; }
        .leaflet-control-zoom { border: 1px solid rgba(255,255,255,0.1) !important; background: rgba(10,10,12,0.9) !important; }
        .leaflet-control-zoom a { color: rgba(255,255,255,0.7) !important; background: transparent !important; border-color: rgba(255,255,255,0.1) !important; }
      `}</style>
    </div>
  );
}
