import { useState } from "react";
import { supabase } from "../supabase";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | register | verify
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Completează email și parola!"); return; }
    if (mode === "register" && !username) { setError("Completează username-ul!"); return; }
    if (password.length < 6) { setError("Parola trebuie să aibă minim 6 caractere!"); return; }

    setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            setError("Emailul nu e confirmat. Verifică inbox-ul!");
          } else if (error.message.includes("Invalid login credentials")) {
            setError("Email sau parolă incorectă!");
          } else {
            setError(error.message);
          }
          setLoading(false);
          return;
        }
        onAuth(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username } }
        });
        if (error) {
          if (error.message.includes("already registered")) {
            setError("Există deja un cont cu acest email!");
          } else {
            setError(error.message);
          }
          setLoading(false);
          return;
        }
        // Show verify email screen
        setMode("verify");
      }
    } catch (err) {
      setError(err.message);
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
      </div>

      {/* Verify email screen */}
      {mode === "verify" ? (
        <div style={{ width: "100%", maxWidth: 340, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>
            Verifică emailul!
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, marginBottom: 24 }}>
            Am trimis un link de confirmare la <span style={{ color: "#FF3366" }}>{email}</span>. Dă click pe link și revino aici să te loghezi.
          </div>
          <button
            onClick={() => setMode("login")}
            style={{
              width: "100%", padding: "14px",
              background: "linear-gradient(135deg, #FF3366, #FF6B35)",
              border: "none", borderRadius: 14,
              color: "#fff", fontSize: 16, fontWeight: 700,
              fontFamily: "'Syne', sans-serif", cursor: "pointer",
            }}
          >
            Mergi la login →
          </button>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif" }}>
              {mode === "login" ? "Bine ai revenit 👋" : "Cont nou 🚀"}
            </div>
          </div>

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
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ background: "none", border: "none", color: "#FF3366", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
            >
              {mode === "login" ? "Înregistrează-te" : "Autentifică-te"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
