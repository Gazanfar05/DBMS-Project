import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = "http://localhost:5000/api";

// 3D Particle Canvas
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });
  const raf = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    particles.current = [];
    for (let i = 0; i < 90; i++) {
      particles.current.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random() * 600 + 100,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2.5 + 0.5,
        hue: 170 + Math.random() * 60,
      });
    }

    const mousemove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", mousemove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const mx = (mouse.current.x - cx) * 0.002;
      const my = (mouse.current.y - cy) * 0.002;

      particles.current.forEach((p) => {
        p.x += p.vx + mx * (600 / p.z);
        p.y += p.vy + my * (600 / p.z);
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const scale = 600 / p.z;
        const r = p.r * scale;
        const alpha = Math.min(0.7, scale * 0.4);

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
        ctx.fill();
      });

      particles.current.forEach((a, i) => {
        particles.current.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(190, 80%, 70%, ${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", mousemove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: "none",
        background:
          "linear-gradient(135deg, #050e1a 0%, #0a1628 50%, #060c18 100%)",
      }}
    />
  );
}

// 3D Tilt Card
function TiltCard({ children, style = {}, className = "" }) {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -8;
    const rotY = ((x - cx) / cx) * 8;
    ref.current.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
  };
  const handleMouseLeave = () => {
    ref.current.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: "transform 0.15s ease",
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Glassmorphic Panel
const glass = {
  background: "rgba(10, 25, 50, 0.55)",
  backdropFilter: "blur(20px) saturate(1.8)",
  WebkitBackdropFilter: "blur(20px) saturate(1.8)",
  border: "1px solid rgba(0, 220, 200, 0.18)",
  borderRadius: "20px",
};

// Symptom Tag
function SymptomTag({ label, onRemove }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background:
          "linear-gradient(135deg, rgba(0,220,200,0.15) 0%, rgba(0,150,255,0.15) 100%)",
        border: "1px solid rgba(0,220,200,0.4)",
        borderRadius: 99,
        padding: "5px 14px",
        fontSize: 13,
        color: "#7ef8f0",
        fontFamily: "'Space Grotesk', sans-serif",
        animation: "tagPop 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          color: "#7ef8f0",
          cursor: "pointer",
          padding: 0,
          fontSize: 15,
          lineHeight: 1,
          opacity: 0.6,
        }}
      >
        ×
      </button>
    </div>
  );
}

// Severity Badge
function SeverityBadge({ level }) {
  const map = {
    Low: {
      bg: "rgba(0,200,100,0.15)",
      border: "rgba(0,200,100,0.5)",
      text: "#4fffb0",
      icon: "▼",
    },
    Medium: {
      bg: "rgba(255,170,0,0.15)",
      border: "rgba(255,170,0,0.5)",
      text: "#ffd700",
      icon: "◆",
    },
    High: {
      bg: "rgba(255,50,50,0.15)",
      border: "rgba(255,80,80,0.5)",
      text: "#ff7070",
      icon: "▲",
    },
  };
  const s = map[level] || map.Medium;
  return (
    <span
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 99,
        padding: "3px 14px",
        color: s.text,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {s.icon} {level}
    </span>
  );
}

// Doctor Card
function DoctorCard({ doctor }) {
  return (
    <TiltCard style={{ ...glass, padding: "20px 22px", flex: "1 1 260px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00dcc8, #0096ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "#fff",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {doctor.name?.charAt(0) || "D"}
        </div>
        <div>
          <div
            style={{
              color: "#e8f4ff",
              fontWeight: 600,
              fontSize: 15,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {doctor.name}
          </div>
          <div style={{ color: "#7ef8f0", fontSize: 12, marginTop: 2 }}>
            {doctor.specialization}
          </div>
        </div>
        <div style={{ marginLeft: "auto", color: "#ffd700", fontSize: 13 }}>
          ★ {doctor.rating || "N/A"}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {doctor.location && (
          <div
            style={{
              color: "rgba(200,230,255,0.65)",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>📍</span> {doctor.location}
          </div>
        )}
        {doctor.phone && (
          <div
            style={{
              color: "rgba(200,230,255,0.65)",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>📞</span> {doctor.phone}
          </div>
        )}
        {doctor.email && (
          <div
            style={{
              color: "rgba(200,230,255,0.65)",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>✉</span> {doctor.email}
          </div>
        )}
      </div>
    </TiltCard>
  );
}

// Animated Number
function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value || 0);
    const duration = 900;
    const step = (end / duration) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(parseFloat(start.toFixed(1)));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <>
      {display}
      {suffix}
    </>
  );
}

// Main App
export default function HealthMatchApp() {
  const [page, setPage] = useState("checker");
  const [symptoms, setSymptoms] = useState([]);
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("M");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/symptoms`)
      .then((r) => r.json())
      .then((data) => setAllSymptoms(Array.isArray(data) ? data : []))
      .catch(() => setAllSymptoms([]));
  }, []);

  const filteredSuggestions = allSymptoms
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchText.toLowerCase()) &&
        !symptoms.includes(s.name) &&
        searchText.length > 0,
    )
    .slice(0, 6);

  const addSymptom = (name) => {
    if (!symptoms.includes(name) && symptoms.length < 10) {
      setSymptoms((prev) => [...prev, name]);
      setSearchText("");
    }
  };

  const removeSymptom = (name) =>
    setSymptoms((prev) => prev.filter((s) => s !== name));

  const predict = async () => {
    setError("");
    if (symptoms.length < 3) {
      setError("Please select at least 3 symptoms.");
      return;
    }
    if (!age || isNaN(age) || age < 1 || age > 120) {
      setError("Please enter a valid age (1-120).");
      return;
    }
    if (!userName.trim() || !userEmail.trim()) {
      setError("Please enter your name and email.");
      return;
    }

    setLoading(true);
    setResult(null);
    setSaved(false);

    try {
      await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, email: userEmail }),
      });

      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, age: parseInt(age, 10), gender }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message || "Prediction failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const saveResult = async () => {
    if (!result || !userEmail) return;
    try {
      await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName || "User", email: userEmail }),
      });

      await fetch(`${API_BASE}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          age: parseInt(age, 10),
          gender,
          symptoms,
          disease: result.disease,
          confidence: result.confidence,
          severity: result.severity,
          doctor_id: result.doctors?.[0]?.id || null,
        }),
      });
      setSaved(true);
    } catch {
      setError("Failed to save result.");
    }
  };

  const loadHistory = useCallback(async () => {
    if (!userEmail) return;
    setHistLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/history?email=${encodeURIComponent(userEmail)}`,
      );
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setHistLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (page === "history") loadHistory();
  }, [page, loadHistory]);

  const NavBtn = ({ id, label }) => (
    <button
      onClick={() => {
        setPage(id);
        setMobileMenu(false);
      }}
      style={{
        background:
          page === id
            ? "linear-gradient(135deg, rgba(0,220,200,0.25), rgba(0,150,255,0.25))"
            : "transparent",
        border:
          page === id
            ? "1px solid rgba(0,220,200,0.5)"
            : "1px solid transparent",
        borderRadius: 10,
        padding: "8px 20px",
        color: page === id ? "#7ef8f0" : "rgba(200,230,255,0.6)",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "'Space Grotesk', sans-serif",
        transition: "all 0.2s ease",
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,220,200,0.3); border-radius: 3px; }
        @keyframes tagPop {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,220,200,0.4); }
          50% { box-shadow: 0 0 0 14px rgba(0,220,200,0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .predict-btn {
          background: linear-gradient(135deg, #00dcc8, #0096ff);
          border: none; border-radius: 14px;
          padding: 16px 40px; font-size: 16px; font-weight: 600;
          color: #fff; cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          transition: all 0.3s ease;
          position: relative; overflow: hidden;
          animation: pulse 2.5s infinite;
        }
        .predict-btn:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(0,220,200,0.35); }
        .predict-btn:disabled { opacity: 0.5; cursor: not-allowed; animation: none; transform: none; }
        .predict-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.12), transparent);
          transform: translateX(-100%); transition: transform 0.4s;
        }
        .predict-btn:hover::after { transform: translateX(100%); }
        .input-field {
          background: rgba(0,220,200,0.05);
          border: 1px solid rgba(0,220,200,0.2);
          border-radius: 12px; padding: 12px 16px;
          color: #e8f4ff; font-size: 14px;
          font-family: 'Space Grotesk', sans-serif;
          outline: none; transition: all 0.2s ease;
          width: 100%;
        }
        .input-field:focus {
          border-color: rgba(0,220,200,0.6);
          box-shadow: 0 0 0 3px rgba(0,220,200,0.1);
          background: rgba(0,220,200,0.08);
        }
        .input-field::placeholder { color: rgba(200,230,255,0.3); }
        .suggestion-item {
          padding: 10px 16px; cursor: pointer;
          color: rgba(200,230,255,0.8); font-size: 14px;
          font-family: 'Space Grotesk', sans-serif;
          transition: background 0.15s ease;
        }
        .suggestion-item:hover { background: rgba(0,220,200,0.12); color: #7ef8f0; }
        .result-card {
          animation: slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1);
        }
        .history-row {
          animation: slideUp 0.4s ease both;
        }
        .gender-btn {
          flex: 1; padding: 10px; border-radius: 10px; cursor: pointer;
          font-size: 13px; font-weight: 500; transition: all 0.2s ease;
          font-family: 'Space Grotesk', sans-serif;
        }
        @media (max-width: 900px) {
          .two-col-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-btn { display: inline-flex !important; }
          .mobile-nav-menu { display: flex !important; }
          .footer-text { font-size: 11px !important; }
        }
      `}</style>

      <ParticleCanvas />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <nav
          style={{
            ...glass,
            borderRadius: 0,
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00dcc8, #0096ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                boxShadow: "0 0 20px rgba(0,220,200,0.4)",
              }}
            >
              H
            </div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#e8f4ff",
                fontFamily: "'Outfit', sans-serif",
                background: "linear-gradient(90deg, #7ef8f0, #60b3ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              HealthMatch
            </span>
          </div>
          <button
            className="mobile-nav-btn"
            onClick={() => setMobileMenu((prev) => !prev)}
            style={{
              display: "none",
              background: "transparent",
              border: "1px solid rgba(0,220,200,0.35)",
              borderRadius: 10,
              color: "#7ef8f0",
              padding: "8px 10px",
              cursor: "pointer",
            }}
          >
            {mobileMenu ? "✕" : "☰"}
          </button>
          <div className="desktop-nav" style={{ display: "flex", gap: 8 }}>
            <NavBtn id="checker" label="⚕ Symptom Checker" />
            <NavBtn id="history" label="📋 History" />
          </div>
        </nav>

        {mobileMenu && (
          <div
            className="mobile-nav-menu"
            style={{
              display: "none",
              gap: 8,
              padding: "10px 20px",
              borderBottom: "1px solid rgba(0,220,200,0.12)",
            }}
          >
            <NavBtn id="checker" label="⚕ Symptom Checker" />
            <NavBtn id="history" label="📋 History" />
          </div>
        )}

        <main style={{ maxWidth: 980, margin: "0 auto", padding: "40px 20px 80px" }}>
          {page === "checker" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div style={{ textAlign: "center", paddingBottom: 8 }}>
                <h1
                  style={{
                    fontSize: "clamp(2rem, 5vw, 3.2rem)",
                    fontWeight: 700,
                    fontFamily: "'Outfit', sans-serif",
                    lineHeight: 1.1,
                    background:
                      "linear-gradient(135deg, #7ef8f0 0%, #60b3ff 50%, #c084fc 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: 12,
                  }}
                >
                  AI Health Intelligence
                </h1>
                <p
                  style={{
                    color: "rgba(200,230,255,0.55)",
                    fontSize: 15,
                    fontWeight: 300,
                  }}
                >
                  Enter your symptoms for instant AI-powered diagnostic insights
                </p>
              </div>

              <div
                className="two-col-grid"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <TiltCard style={{ ...glass, padding: "24px" }}>
                    <div
                      style={{
                        color: "#7ef8f0",
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 16,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Patient Profile
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label
                          style={{
                            color: "rgba(200,230,255,0.5)",
                            fontSize: 12,
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Full Name
                        </label>
                        <input
                          className="input-field"
                          placeholder="Your name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            color: "rgba(200,230,255,0.5)",
                            fontSize: 12,
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Email
                        </label>
                        <input
                          className="input-field"
                          placeholder="you@email.com"
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 14 }}>
                        <div style={{ flex: 1 }}>
                          <label
                            style={{
                              color: "rgba(200,230,255,0.5)",
                              fontSize: 12,
                              display: "block",
                              marginBottom: 6,
                            }}
                          >
                            Age
                          </label>
                          <input
                            className="input-field"
                            placeholder="e.g. 35"
                            type="number"
                            min="1"
                            max="120"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label
                            style={{
                              color: "rgba(200,230,255,0.5)",
                              fontSize: 12,
                              display: "block",
                              marginBottom: 6,
                            }}
                          >
                            Gender
                          </label>
                          <div style={{ display: "flex", gap: 6 }}>
                            {["M", "F"].map((g) => (
                              <button
                                key={g}
                                className="gender-btn"
                                onClick={() => setGender(g)}
                                style={{
                                  background:
                                    gender === g
                                      ? "linear-gradient(135deg, rgba(0,220,200,0.25), rgba(0,150,255,0.25))"
                                      : "rgba(0,220,200,0.05)",
                                  border:
                                    gender === g
                                      ? "1px solid rgba(0,220,200,0.5)"
                                      : "1px solid rgba(0,220,200,0.15)",
                                  color:
                                    gender === g
                                      ? "#7ef8f0"
                                      : "rgba(200,230,255,0.45)",
                                }}
                              >
                                {g === "M" ? "♂ Male" : "♀ Female"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TiltCard>

                  <TiltCard style={{ ...glass, padding: "24px" }}>
                    <div
                      style={{
                        color: "#7ef8f0",
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 16,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Symptoms{" "}
                      <span
                        style={{ color: "rgba(200,230,255,0.4)", fontWeight: 400 }}
                      >
                        ({symptoms.length}/10 - min 3)
                      </span>
                    </div>

                    <div style={{ position: "relative", marginBottom: 14 }}>
                      <input
                        className="input-field"
                        placeholder="Search & add symptom..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            filteredSuggestions.length > 0
                          ) {
                            addSymptom(filteredSuggestions[0].name);
                          }
                        }}
                      />
                      {filteredSuggestions.length > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 6px)",
                            left: 0,
                            right: 0,
                            background: "rgba(5,15,35,0.95)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(0,220,200,0.25)",
                            borderRadius: 12,
                            zIndex: 50,
                            overflow: "hidden",
                          }}
                        >
                          {filteredSuggestions.map((s) => (
                            <div
                              key={s.id}
                              className="suggestion-item"
                              onClick={() => addSymptom(s.name)}
                            >
                              + {s.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        minHeight: 40,
                      }}
                    >
                      {symptoms.length === 0 && (
                        <div
                          style={{
                            color: "rgba(200,230,255,0.25)",
                            fontSize: 13,
                            paddingTop: 4,
                          }}
                        >
                          No symptoms added yet
                        </div>
                      )}
                      {symptoms.map((s) => (
                        <SymptomTag key={s} label={s} onRemove={() => removeSymptom(s)} />
                      ))}
                    </div>
                  </TiltCard>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div
                    style={{
                      ...glass,
                      padding: "28px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 20,
                      minHeight: 200,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <DNAOrb />
                    <div
                      style={{ textAlign: "center", position: "relative", zIndex: 1 }}
                    >
                      <div
                        style={{
                          color: "rgba(200,230,255,0.5)",
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        Diagnostic Engine
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color:
                            symptoms.length >= 3
                              ? "#7ef8f0"
                              : "rgba(200,230,255,0.35)",
                          transition: "color 0.3s",
                        }}
                      >
                        {symptoms.length >= 3
                          ? "✓ Ready to analyze"
                          : `Add ${3 - symptoms.length} more symptom${
                              3 - symptoms.length !== 1 ? "s" : ""
                            }`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      className="predict-btn"
                      onClick={predict}
                      disabled={loading || symptoms.length < 3}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                      }}
                    >
                      {loading ? (
                        <>
                          <span
                            style={{
                              display: "inline-block",
                              width: 18,
                              height: 18,
                              border: "2px solid rgba(255,255,255,0.3)",
                              borderTopColor: "#fff",
                              borderRadius: "50%",
                              animation: "spin 0.7s linear infinite",
                            }}
                          />
                          Analyzing...
                        </>
                      ) : (
                        "⚡ Analyze Symptoms"
                      )}
                    </button>
                  </div>

                  {error && (
                    <div
                      style={{
                        ...glass,
                        padding: "14px 18px",
                        borderColor: "rgba(255,80,80,0.35)",
                        background: "rgba(255,30,30,0.08)",
                        color: "#ff7070",
                        fontSize: 13,
                        animation: "slideUp 0.3s ease",
                      }}
                    >
                      ⚠ {error}
                    </div>
                  )}
                </div>
              </div>

              {result && (
                <div
                  className="result-card"
                  style={{ display: "flex", flexDirection: "column", gap: 20 }}
                >
                  <div
                    style={{
                      ...glass,
                      padding: "30px 32px",
                      background: "rgba(0,40,80,0.6)",
                      borderColor: "rgba(0,220,200,0.35)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: -60,
                        right: -60,
                        width: 220,
                        height: 220,
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle, rgba(0,220,200,0.12) 0%, transparent 70%)",
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 16,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "rgba(200,230,255,0.5)",
                            fontSize: 12,
                            fontWeight: 500,
                            marginBottom: 8,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                          }}
                        >
                          Predicted Condition
                        </div>
                        <div
                          style={{
                            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                            fontWeight: 700,
                            fontFamily: "'Outfit', sans-serif",
                            background:
                              "linear-gradient(135deg, #7ef8f0, #60b3ff)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            marginBottom: 12,
                          }}
                        >
                          {result.disease}
                        </div>
                        <SeverityBadge level={result.severity} />
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            color: "rgba(200,230,255,0.5)",
                            fontSize: 12,
                            marginBottom: 4,
                          }}
                        >
                          Confidence
                        </div>
                        <div
                          style={{
                            fontSize: 42,
                            fontWeight: 700,
                            fontFamily: "'Outfit', sans-serif",
                            background:
                              "linear-gradient(135deg, #7ef8f0, #c084fc)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          <AnimatedNumber value={result.confidence} suffix="%" />
                        </div>
                        <ConfidenceBar value={result.confidence} />
                      </div>
                    </div>

                    {userEmail && (
                      <div style={{ marginTop: 20 }}>
                        <button
                          onClick={saveResult}
                          disabled={saved}
                          style={{
                            background: saved
                              ? "rgba(0,200,100,0.15)"
                              : "rgba(0,220,200,0.12)",
                            border: `1px solid ${
                              saved
                                ? "rgba(0,200,100,0.4)"
                                : "rgba(0,220,200,0.3)"
                            }`,
                            borderRadius: 10,
                            padding: "8px 22px",
                            color: saved ? "#4fffb0" : "#7ef8f0",
                            cursor: saved ? "default" : "pointer",
                            fontSize: 13,
                            fontFamily: "'Space Grotesk', sans-serif",
                            transition: "all 0.2s",
                          }}
                        >
                          {saved ? "✓ Saved to history" : "💾 Save to history"}
                        </button>
                      </div>
                    )}
                  </div>

                  {result.doctors && result.doctors.length > 0 && (
                    <div>
                      <div
                        style={{
                          color: "#7ef8f0",
                          fontSize: 13,
                          fontWeight: 600,
                          marginBottom: 14,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        Recommended Specialists
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                        {result.doctors.map((d) => (
                          <DoctorCard key={d.id} doctor={d} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      ...glass,
                      padding: "14px 18px",
                      background: "rgba(255,170,0,0.06)",
                      borderColor: "rgba(255,170,0,0.25)",
                      color: "rgba(255,210,100,0.7)",
                      fontSize: 12,
                    }}
                  >
                    ⚠ This is an AI-assisted tool for informational purposes only.
                    Always consult a qualified healthcare professional for medical
                    diagnosis and treatment.
                  </div>
                </div>
              )}
            </div>
          )}

          {page === "history" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <h2
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: "'Outfit', sans-serif",
                  background: "linear-gradient(135deg, #7ef8f0, #60b3ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Consultation History
              </h2>

              <TiltCard style={{ ...glass, padding: 24, maxWidth: 480 }}>
                <div
                  style={{
                    color: "rgba(200,230,255,0.5)",
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  Enter your email to view history
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    className="input-field"
                    placeholder="your@email.com"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadHistory()}
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={loadHistory}
                    style={{
                      background: "linear-gradient(135deg, #00dcc8, #0096ff)",
                      border: "none",
                      borderRadius: 12,
                      padding: "12px 22px",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'Space Grotesk', sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Load
                  </button>
                </div>
              </TiltCard>

              {histLoading && (
                <div
                  style={{
                    textAlign: "center",
                    color: "rgba(200,230,255,0.4)",
                    padding: 40,
                    fontSize: 14,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 24,
                      height: 24,
                      border: "2px solid rgba(0,220,200,0.3)",
                      borderTopColor: "#00dcc8",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                      marginRight: 10,
                      verticalAlign: "middle",
                    }}
                  />
                  Loading...
                </div>
              )}

              {!histLoading && history.length === 0 && userEmail && (
                <div
                  style={{
                    ...glass,
                    padding: 32,
                    textAlign: "center",
                    color: "rgba(200,230,255,0.4)",
                    fontSize: 14,
                  }}
                >
                  No history found for{" "}
                  <strong style={{ color: "#7ef8f0" }}>{userEmail}</strong>
                </div>
              )}

              {history.map((h, i) => (
                <div
                  key={h.id}
                  className="history-row"
                  style={{
                    ...glass,
                    padding: "22px 26px",
                    animationDelay: `${i * 0.07}s`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          fontFamily: "'Outfit', sans-serif",
                          color: "#e8f4ff",
                          marginBottom: 4,
                        }}
                      >
                        {h.predicted_disease}
                      </div>
                      <SeverityBadge level={h.severity_level} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          color: "rgba(200,230,255,0.4)",
                          fontSize: 12,
                        }}
                      >
                        {new Date(h.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div style={{ color: "#7ef8f0", fontSize: 13, marginTop: 4 }}>
                        {h.confidence_score?.toFixed(1)}% confidence
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {h.symptoms?.split(",").map((s) => (
                      <span
                        key={s}
                        style={{
                          background: "rgba(0,220,200,0.08)",
                          border: "1px solid rgba(0,220,200,0.2)",
                          borderRadius: 99,
                          padding: "3px 12px",
                          color: "rgba(200,230,255,0.6)",
                          fontSize: 12,
                        }}
                      >
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                  {h.doctor_name && (
                    <div
                      style={{
                        marginTop: 12,
                        color: "rgba(200,230,255,0.5)",
                        fontSize: 12,
                        display: "flex",
                        gap: 6,
                      }}
                    >
                      <span>👨‍⚕️</span>
                      <span>
                        {h.doctor_name}
                        {h.location ? ` · ${h.location}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <footer
          style={{
            ...glass,
            borderRadius: 0,
            borderLeft: "none",
            borderRight: "none",
            borderBottom: "none",
            padding: "20px 24px",
            textAlign: "center",
            color: "rgba(200,230,255,0.3)",
            fontSize: 12,
          }}
        >
          <span className="footer-text">
            © 2024 HealthMatch - AI Health Intelligence · Always consult a
            professional for medical advice
          </span>
        </footer>
      </div>
    </>
  );
}

// DNA Orb Graphic
function DNAOrb() {
  const canvasRef = useRef(null);
  const t = useRef(0);
  const raf = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 180;

    const draw = () => {
      ctx.clearRect(0, 0, 200, 180);
      const cx = 100;
      const cy = 90;
      t.current += 0.025;

      for (let i = 0; i < 40; i++) {
        const progress = i / 39;
        const angle = progress * Math.PI * 3 + t.current;
        const x1 = cx + Math.cos(angle) * 35;
        const x2 = cx + Math.cos(angle + Math.PI) * 35;
        const y = 20 + progress * 140;
        const z1 = Math.sin(angle);
        const z2 = Math.sin(angle + Math.PI);
        const alpha1 = (z1 + 1) / 2;
        const alpha2 = (z2 + 1) / 2;

        ctx.beginPath();
        ctx.arc(x1, y, 3 + alpha1 * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,220,200,${0.3 + alpha1 * 0.7})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x2, y, 3 + alpha2 * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,179,255,${0.3 + alpha2 * 0.7})`;
        ctx.fill();

        if (i % 4 === 0) {
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = `rgba(192,132,252,${0.2 + Math.abs(z1) * 0.3})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
      g.addColorStop(0, "rgba(0,220,200,0.06)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 200, height: 180, position: "relative", zIndex: 1 }}
    />
  );
}

// Confidence Bar
function ConfidenceBar({ value }) {
  return (
    <div
      style={{
        marginTop: 8,
        width: 140,
        height: 6,
        background: "rgba(200,230,255,0.1)",
        borderRadius: 99,
        overflow: "hidden",
        marginLeft: "auto",
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          background: `linear-gradient(90deg, #00dcc8, ${
            value > 70 ? "#4fffb0" : value > 40 ? "#ffd700" : "#ff7070"
          })`,
          borderRadius: 99,
          transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: "0 0 8px rgba(0,220,200,0.5)",
        }}
      />
    </div>
  );
}
