import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { events } from "../data/events";

const PROFILE_KEY = "nightfeed_profile_id";

export default function ProfilePage({ user, onLogout }) {
  const [view, setView] = useState("loading"); // loading | setup | profile
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("attending");
  const [attendingEvents, setAttendingEvents] = useState([]);
  const [likedEvents, setLikedEvents] = useState([]);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    nume: "", prenume: "", varsta: "", gen: "", hobby: "", avatar_url: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const savedId = localStorage.getItem(PROFILE_KEY);
    if (savedId) {
      loadProfile(savedId);
    } else {
      setView("setup");
    }

    const attending = events.filter(e => JSON.parse(localStorage.getItem(`attending_${e.id}`)) === true);
    const liked = events.filter(e => JSON.parse(localStorage.getItem(`liked_${e.id}`)) === true);
    setAttendingEvents(attending);
    setLikedEvents(liked);
  }, []);

  const loadProfile = async (id) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (data) {
      setProfile(data);
      setForm({ nume: data.nume || "", prenume: data.prenume || "", varsta: data.varsta || "", gen: data.gen || "", hobby: data.hobby || "", avatar_url: data.avatar_url || "" });
      setView("profile");
    } else {
      setView("setup");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (profileId) => {
    if (!avatarFile) return form.avatar_url;
    const ext = avatarFile.name.split(".").pop();
    const path = `${profileId}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
    if (error) return form.avatar_url;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.nume || !form.prenume) {
      alert("Completează cel puțin numele și prenumele!");
      return;
    }
    setSaving(true);
    try {
      const existingId = localStorage.getItem(PROFILE_KEY);
      let profileId = existingId;

      if (!profileId) {
        const { data, error } = await supabase.from("profiles").insert([{ ...form, varsta: Number(form.varsta) || null }]).select().single();
        if (error) throw error;
        profileId = data.id;
        localStorage.setItem(PROFILE_KEY, profileId);
      }

      const avatarUrl = await uploadAvatar(profileId);

      const { data, error } = await supabase.from("profiles").update({ ...form, varsta: Number(form.varsta) || null, avatar_url: avatarUrl }).eq("id", profileId).select().single();
      if (error) throw error;

      setProfile(data);
      setEditing(false);
      setView("profile");
    } catch (err) {
      alert("Eroare la salvare: " + err.message);
    }
    setSaving(false);
  };

  const handleRemoveAttending = (eventId) => {
    localStorage.setItem(`attending_${eventId}`, "false");
    setAttendingEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const avatarSrc = avatarPreview || profile?.avatar_url;

  if (view === "loading") {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#080808" }}>
        <div style={{ fontSize: 32, animation: "pulse 1.5s ease-in-out infinite" }}>🌙</div>
      </div>
    );
  }

  const isSetup = view === "setup" || editing;

  return (
    <div style={{ width: "100%", height: "100%", background: "#080808", overflowY: "auto", paddingBottom: 80 }}>

      {/* SETUP / EDIT FORM */}
      {isSetup && (
        <div style={{ padding: "50px 20px 20px", animation: "slideUp 0.3s ease-out" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>
            {editing ? "Editează profilul" : "Creează-ți profilul"}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace", marginBottom: 28 }}>
            Apare pe NightFeed
          </div>

          {/* Avatar upload */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 90, height: 90, borderRadius: "50%",
                background: avatarSrc ? "transparent" : "rgba(255,51,102,0.15)",
                border: "2px dashed rgba(255,51,102,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", overflow: "hidden", position: "relative",
              }}
            >
              {avatarSrc ? (
                <img src={avatarSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 32 }}>📷</span>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace", marginTop: 8 }}>
              Apasă pentru poză
            </div>
          </div>

          {/* Form fields */}
          {[
            { key: "prenume", label: "Prenume", placeholder: "ex: Razvan", type: "text" },
            { key: "nume", label: "Nume", placeholder: "ex: Chiceanu", type: "text" },
            { key: "varsta", label: "Vârstă", placeholder: "ex: 22", type: "number" },
            { key: "hobby", label: "Hobby-uri", placeholder: "ex: muzică, fotbal, gaming", type: "text" },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {field.label}
              </div>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, color: "#fff", fontSize: 15,
                  fontFamily: "'DM Sans', sans-serif", outline: "none",
                }}
              />
            </div>
          ))}

          {/* Gen */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Gen
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Masculin", "Feminin", "Altul"].map(g => (
                <button
                  key={g}
                  onClick={() => setForm(f => ({ ...f, gen: g }))}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 12,
                    background: form.gen === g ? "rgba(255,51,102,0.2)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${form.gen === g ? "rgba(255,51,102,0.5)" : "rgba(255,255,255,0.1)"}`,
                    color: form.gen === g ? "#FF3366" : "rgba(255,255,255,0.5)",
                    fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                    fontWeight: form.gen === g ? 700 : 400,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%", padding: "14px",
              background: saving ? "rgba(255,51,102,0.4)" : "linear-gradient(135deg, #FF3366, #FF6B35)",
              border: "none", borderRadius: 14,
              color: "#fff", fontSize: 16, fontWeight: 700,
              fontFamily: "'Syne', sans-serif", cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 4px 20px rgba(255,51,102,0.3)",
              transition: "all 0.2s",
            }}
          >
            {saving ? "Se salvează..." : editing ? "Salvează modificările" : "Creează profilul 🚀"}
          </button>

          {editing && (
            <button
              onClick={() => { setEditing(false); setAvatarPreview(null); }}
              style={{ width: "100%", padding: "12px", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", marginTop: 10 }}
            >
              Anulează
            </button>
          )}
        </div>
      )}

      {/* PROFILE VIEW */}
      {!isSetup && profile && (
        <div style={{ animation: "slideUp 0.3s ease-out" }}>
          {/* Header */}
          <div style={{
            padding: "50px 20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 70, height: 70, borderRadius: "50%",
              background: "linear-gradient(135deg, #FF3366, #FF6B35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, overflow: "hidden", flexShrink: 0,
              border: "2px solid rgba(255,51,102,0.4)",
            }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : "🌙"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>
                {profile.prenume} {profile.nume}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                {profile.varsta ? `${profile.varsta} ani` : ""}{profile.gen ? ` · ${profile.gen}` : ""}
              </div>
              {profile.hobby && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
                  🎯 {profile.hobby}
                </div>
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10, padding: "8px 12px", color: "rgba(255,255,255,0.6)",
                fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer",
              }}
            >
              Editează
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", padding: "16px 20px", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { label: "Particip", value: attendingEvents.length, icon: "✅" },
              { label: "Apreciate", value: likedEvents.length, icon: "❤️" },
            ].map(stat => (
              <div key={stat.label} style={{
                flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "12px", textAlign: "center",
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", padding: "16px 20px 8px", gap: 8 }}>
            {[
              { id: "attending", label: "Particip", icon: "✅" },
              { id: "liked", label: "Apreciate", icon: "❤️" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 12,
                  border: `1px solid ${activeTab === tab.id ? "rgba(255,51,102,0.5)" : "rgba(255,255,255,0.08)"}`,
                  background: activeTab === tab.id ? "rgba(255,51,102,0.15)" : "rgba(255,255,255,0.04)",
                  cursor: "pointer", color: activeTab === tab.id ? "#FF3366" : "rgba(255,255,255,0.4)",
                  fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace", transition: "all 0.2s",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Event list */}
          <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {(activeTab === "attending" ? attendingEvents : likedEvents).length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.25)" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>{activeTab === "attending" ? "🎉" : "🤍"}</div>
                <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                  {activeTab === "attending" ? "Nu ești înscris la niciun eveniment" : "Nu ai apreciat niciun eveniment"}
                </div>
              </div>
            ) : (
              (activeTab === "attending" ? attendingEvents : likedEvents).map(event => (
                <div key={event.id} style={{
                  borderRadius: 14, background: event.bgColor,
                  border: `1px solid ${event.color}30`, padding: "14px",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at top left, ${event.color}15 0%, transparent 60%)`, pointerEvents: "none" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: `${event.color}20`, border: `1px solid ${event.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {event.type === "official" ? "⚡" : "🏠"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{event.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                        {event.date} · {event.price}
                      </div>
                    </div>
                    {activeTab === "attending" && (
                      <button onClick={() => handleRemoveAttending(event.id)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 10px", color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
                        Renunț
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
