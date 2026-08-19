"use client";

import { useState, useEffect } from "react";

const APP_PASSWORD = "makumi-atlas-2026";

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [particles, setParticles] = useState<Array<{ left: number; delay: number; size: number }>>([]);

  useEffect(() => {
    const arr = Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 10,
      size: 1 + Math.random() * 3,
    }));
    setParticles(arr);
  }, []);

  const tryPassword = () => {
    if (pwInput === APP_PASSWORD) {
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Wrong password. Try again.");
    }
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setImage("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size: "1024x1024" }),
      });
      const data = await res.json();
      if (data.success) {
        setImage(data.image);
      } else {
        setError(data.error || "Generation failed");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // === PASSWORD SCREEN (magical) ===
  if (!authed) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0B0B0F",
          color: "#F5F2E8",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "20%",
            width: "400px",
            height: "400px",
            background: "#F5A623",
            opacity: 0.15,
            borderRadius: "50%",
            filter: "blur(80px)",
            animation: "pulse 4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "20%",
            width: "350px",
            height: "350px",
            background: "#E94560",
            opacity: 0.12,
            borderRadius: "50%",
            filter: "blur(80px)",
            animation: "pulse 4s ease-in-out infinite 2s",
            pointerEvents: "none",
          }}
        />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.left}%`,
              bottom: "-10px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: "#F5A623",
              borderRadius: "50%",
              opacity: 0.4,
              animation: `floatUp 15s linear infinite ${p.delay}s`,
              pointerEvents: "none",
            }}
          />
        ))}

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.15; }
            50% { transform: scale(1.2); opacity: 0.25; }
          }
          @keyframes floatUp {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 0.6; }
            90% { opacity: 0.6; }
            100% { transform: translateY(-110vh) translateX(50px); opacity: 0; }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(245, 166, 35, 0.4); }
            50% { box-shadow: 0 0 40px rgba(245, 166, 35, 0.8); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        <div style={{ maxWidth: "400px", width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #F5A623, #B45309)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
              fontWeight: "bold",
              color: "#0B0B0F",
              marginBottom: "1.5rem",
              animation: "glow 3s ease-in-out infinite",
            }}
          >
            A
          </div>
          <h1
            style={{
              fontSize: "2.2rem",
              marginBottom: "0.5rem",
              background: "linear-gradient(90deg, #F5A623, #E94560, #F5A623)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s linear infinite",
            }}
          >
            Atlas AI Studio
          </h1>
          <p style={{ color: "#9A9AA5", fontSize: "0.85rem", marginBottom: "2rem" }}>
            Africa's most majestic AI · Private beta
          </p>
          <input
            type="password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryPassword()}
            placeholder="Enter access password"
            style={{
              width: "100%",
              background: "rgba(20, 20, 26, 0.8)",
              backdropFilter: "blur(10px)",
              color: "#F5F2E8",
              border: "1px solid #2A2A35",
              borderRadius: "12px",
              padding: "1rem",
              fontSize: "1rem",
              outline: "none",
              marginBottom: "1rem",
              textAlign: "center",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
            onBlur={(e) => (e.target.style.borderColor = "#2A2A35")}
          />
          {pwError && (
            <div style={{ color: "#E94560", fontSize: "0.85rem", marginBottom: "1rem", animation: "fadeIn 0.3s ease" }}>
              {pwError}
            </div>
          )}
          <button
            onClick={tryPassword}
            style={{
              width: "100%",
              padding: "1rem",
              background: "linear-gradient(90deg, #F5A623, #E94560)",
              color: "#0B0B0F",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            ✨ Unlock the Magic
          </button>
        </div>
      </main>
    );
  }

  // === MAIN GENERATOR (magical) ===
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0B0B0F",
        color: "#F5F2E8",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem 1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 166, 35, 0.4); }
          50% { box-shadow: 0 0 40px rgba(245, 166, 35, 0.8); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseOrb {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.3); opacity: 0.2; }
        }
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-110vh); opacity: 0; }
        }
      `}</style>

      {/* Animated background orbs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "500px",
          height: "500px",
          background: "#F5A623",
          opacity: 0.1,
          borderRadius: "50%",
          filter: "blur(100px)",
          animation: "pulseOrb 6s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "400px",
          height: "400px",
          background: "#E94560",
          opacity: 0.1,
          borderRadius: "50%",
          filter: "blur(100px)",
          animation: "pulseOrb 6s ease-in-out infinite 3s",
          pointerEvents: "none",
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            bottom: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: "#F5A623",
            borderRadius: "50%",
            opacity: 0.3,
            animation: `floatUp 20s linear infinite ${p.delay}s`,
            pointerEvents: "none",
          }}
        />
      ))}

      <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem", animation: "fadeIn 0.6s ease" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #F5A623, #B45309)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "38px",
              fontWeight: "bold",
              color: "#0B0B0F",
              marginBottom: "1rem",
              animation: "glow 3s ease-in-out infinite",
            }}
          >
            A
          </div>
          <h1
            style={{
              fontSize: "2.3rem",
              marginBottom: "0.5rem",
              background: "linear-gradient(90deg, #F5A623, #E94560, #F5A623)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s linear infinite",
            }}
          >
            Atlas AI Studio
          </h1>
          <p style={{ color: "#9A9AA5", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            FLUX.1 image generation · by Nganga Makumi
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "#4ADE80" }}>
            <span style={{
              width: "6px",
              height: "6px",
              background: "#4ADE80",
              borderRadius: "50%",
              animation: "spinSlow 2s linear infinite",
            }} />
            ATLAS consciousness online
          </div>
        </div>

        <div style={{ animation: "fadeIn 0.8s ease" }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your vision... e.g. A majestic lion on a savanna hill at sunset"
            style={{
              width: "100%",
              minHeight: "100px",
              background: "rgba(20, 20, 26, 0.8)",
              backdropFilter: "blur(10px)",
              color: "#F5F2E8",
              border: "1px solid #2A2A35",
              borderRadius: "12px",
              padding: "1rem",
              fontSize: "1rem",
              resize: "vertical",
              outline: "none",
              marginBottom: "1rem",
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#F5A623";
              e.target.style.boxShadow = "0 0 0 3px rgba(245, 166, 35, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#2A2A35";
              e.target.style.boxShadow = "none";
            }}
          />

          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            style={{
              width: "100%",
              padding: "1rem",
              background: loading
                ? "#2A2A35"
                : "linear-gradient(90deg, #F5A623, #E94560)",
              color: "#0B0B0F",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.2s, box-shadow 0.3s",
              boxShadow: loading ? "none" : "0 4px 20px rgba(245, 166, 35, 0.3)",
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {loading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #0B0B0F",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spinSlow 1s linear infinite",
                  }}
                />
                Generating magic...
              </span>
            ) : (
              "✨ Generate Image"
            )}
          </button>
        </div>

        {error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "rgba(233, 69, 96, 0.1)",
              border: "1px solid #E94560",
              borderRadius: "12px",
              color: "#E94560",
              fontSize: "0.9rem",
              animation: "fadeIn 0.3s ease",
            }}
          >
            {error}
          </div>
        )}

        {image && (
          <div style={{ marginTop: "1.5rem", animation: "fadeIn 0.5s ease" }}>
            <img
              src={`data:image/png;base64,${image}`}
              alt="Generated"
              style={{
                width: "100%",
                borderRadius: "16px",
                border: "1px solid #2A2A35",
                boxShadow: "0 8px 40px rgba(245, 166, 35, 0.2)",
              }}
            />
            <a
              href={`data:image/png;base64,${image}`}
              download="atlas-ai.png"
              style={{
                display: "block",
                marginTop: "0.75rem",
                padding: "0.85rem",
                background: "rgba(20, 20, 26, 0.8)",
                backdropFilter: "blur(10px)",
                color: "#F5A623",
                border: "1px solid #F5A623",
                borderRadius: "12px",
                textAlign: "center",
                textDecoration: "none",
                fontWeight: "bold",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245, 166, 35, 0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(20, 20, 26, 0.8)")}
            >
              ↓ Download Image
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
