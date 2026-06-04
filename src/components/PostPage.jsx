import { useState, useRef } from "react";
import { supabase } from "../supabase";

export default function PostPage({ user, onClose }) {
  const [form, setForm] = useState({
    title: "", venue: "", date: "", price: "", type: "homemade",
    description: "", tags: "", ticket_link: "",
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef(null);

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.venue || !form.date) {
      alert("Completează titlul, locația și data!"); return;
    }
    if (!user) { alert("Trebuie să fii autentificat!"); return; }

    setLoading(true);
    try {
      let cover_url = null;
      if (coverFile) {
        const path = `covers/${user.id}_${Date.now()}`;
        const { error } = await supabase.storage.from("covers").upload(path, coverFile, { upsert: true });
        if (!error) {
          const { data } = supabase.storage.from("covers").getPublicUrl(path);
          cover_url = data.publicUrl;
        }
      }

      const { error } = await supabase.from("posted_events").insert([{
        ...form,
        cover_url,
        user_id: user.id,
        verified: false,
      }]);

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 2500);
    } catch (err) {
      alert("Eroare: " + err.message);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#080808", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 64 }}>🎉</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>Eveniment trimis!</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: "0 32px" }}>
          Va apărea în feed după verificare de către echipa NightFeed.
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", background: "#080808", overflowY: "auto", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "50px 20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>Adaugă eveniment</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace", marginTop: 3 }}>Va fi verificat înainte de publicare</div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "6px 12px", color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
          Închide
        </button>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        {/* Cover image */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: "100%", height: 160, borderRadius: 16,
            background: coverPreview ? "transparent" : "rgba(255,51,102,0.08)",
            border: `2px dashed ${coverPreview ? "transparent" : "rgba(255,51,102,0.3)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", marginBottom: 20, overflow: "hidden", position: "relative",
          }}
        >
          {coverPreview
            ? <img src={coverPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace" }}>Adaugă poză cover</div>
              </div>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleCover} style={{ display: "none" }} />

        {/* Tip eveniment */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tip eveniment</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ id: "official", label: "⚡ Oficial" }, { id: "homemade", label: "🏠 Homemade" }].map(t => (
              <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))} style={{
                flex: 1, padding: "10px", borderRadius: 12,
                background: form.type === t.id ? "rgba(255,51,102,0.2)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${form.type === t.id ? "rgba(255,51,102,0.5)" : "rgba(255,255,255,0.1)"}`,
                color: form.type === t.id ? "#FF3366" : "rgba(255,255,255,0.5)",
                fontSize: 13, fontWeight: form.type === t.id ? 700 : 400,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.15s",
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Fields */}
        {[
          { key: "title", label: "Titlu eveniment *", placeholder: "ex: SAGA Festival", type: "text" },
          { key: "venue", label: "Locație *", placeholder: "ex: Romexpo, București", type: "text" },
          { key: "date", label: "Dată și oră *", placeholder: "ex: Sâmbătă, 22:00", type: "text" },
          { key: "price", label: "Preț", placeholder: "ex: 80 RON sau Gratuit", type: "text" },
          { key: "tags", label: "Tag-uri", placeholder: "ex: techno, club, party", type: "text" },
          { key: "ticket_link", label: "Link bilete", placeholder: "https://...", type: "url" },
        ].map(field => (
          <div key={field.key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{field.label}</div>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={form[field.key]}
              onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
            />
          </div>
        ))}

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Descriere</div>
          <textarea
            placeholder="Descrie evenimentul..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "none" }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "14px",
            background: loading ? "rgba(255,51,102,0.4)" : "linear-gradient(135deg, #FF3366, #FF6B35)",
            border: "none", borderRadius: 14, color: "#fff",
            fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 20px rgba(255,51,102,0.3)",
          }}
        >
          {loading ? "Se trimite..." : "Trimite evenimentul 🚀"}
        </button>
      </div>
    </div>
  );
}
