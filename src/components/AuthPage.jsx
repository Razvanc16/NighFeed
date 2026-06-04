import { useState } from "react";
import { supabase } from "../supabase";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!email || !password) { setError("Completează email și parola!"); return; }
    if (mode === "register" && !username) { setError("Completează username-ul!"); return; }
    if (password.length < 6) { setError("Parola trebuie să aibă minim 6 caractere!"); return; }

    setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username } }
        });
        if (error) throw error;
        setSuccess("Cont creat! Verifică emailul pentru confirmare 📧");
        setTimeout(() => onAuth(data.user), 2000);
      }
    } catch (err) {
      setError(err.message === "Invalid login credentials" ? "Email sau parolă incorectă" : err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "#080808",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 24px",
      animation: "slideUp 0.3s ease-out",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: "linear-gradient(135deg, #FF3366, #FF6B35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: "0 0 40px rgba(255,51,102,0.4)",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <circle cx="12" cy="12" r="5"/>
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
          </svg>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "'Syne', sans-serif" }}>
          Night<span style={{ color: "#FF3366" }}>Feed</span>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
          {mode === "login" ? "Bine ai revenit 👋" : "Creează-ți contul 🚀"}
        </div>
      </div>

      {/* Form */}
      <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "register" && (
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Username</div>
            <input
              type="text" placeholder="ex: razvan_nightfeed"
              value={username} onChange={e => setUsername(e.target.value)}
              style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
            />
          </div>
        )}

        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email</div>
          <input
            type="email" placeholder="email@exemplu.com"
            value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
          />
        </div>

        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Parolă</div>
          <input
            type="password" placeholder="minim 6 caractere"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
          />
        </div>

        {error && (
          <div style={{ padding: "10px 14px", background: "rgba(255,51,102,0.15)", border: "1px solid rgba(255,51,102,0.3)", borderRadius: 10, color: "#FF3366", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: "10px 14px", background: "rgba(0,200,100,0.15)", border: "1px solid rgba(0,200,100,0.3)", borderRadius: 10, color: "#00C864", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
            {success}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "14px",
            background: loading ? "rgba(255,51,102,0.4)" : "linear-gradient(135deg, #FF3366, #FF6B35)",
            border: "none", borderRadius: 14,
            color: "#fff", fontSize: 16, fontWeight: 700,
            fontFamily: "'Syne', sans-serif",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 20px rgba(255,51,102,0.3)",
            marginTop: 4,
          }}
        >
          {loading ? "Se procesează..." : mode === "login" ? "Intră în cont" : "Creează contul"}
        </button>

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>
            {mode === "login" ? "Nu ai cont? " : "Ai deja cont? "}
          </span>
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
            style={{ background: "none", border: "none", color: "#FF3366", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
          >
            {mode === "login" ? "Înregistrează-te" : "Autentifică-te"}
          </button>
        </div>
      </div>
    </div>
  );
}
