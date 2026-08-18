"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

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

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0B0B0F",
        color: "#F5F2E8",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #F5A623, #B45309)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "bold",
              color: "#0B0B0F",
              marginBottom: "1rem",
            }}
          >
            A
          </div>
          <h1
            style={{
              fontSize: "2rem",
              background: "linear-gradient(to right, #F5A623, #E94560)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "0.5rem",
            }}
          >
            Atlas AI Studio
          </h1>
          <p style={{ color: "#9A9AA5", fontSize: "0.9rem" }}>
            FLUX.1 image generation · by Nganga Makumi
          </p>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your vision... e.g. A majestic lion on a savanna hill at sunset"
          style={{
            width: "100%",
            minHeight: "100px",
            background: "#14141A",
            color: "#F5F2E8",
            border: "1px solid #2A2A35",
            borderRadius: "8px",
            padding: "1rem",
            fontSize: "1rem",
            resize: "vertical",
            outline: "none",
            marginBottom: "1rem",
          }}
        />

        <button
          onClick={generate}
          disabled={loading || !prompt.trim()}
          style={{
            width: "100%",
            padding: "1rem",
            background: loading ? "#2A2A35" : "#F5A623",
            color: "#0B0B0F",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Generating... (30s)" : "Generate Image"}
        </button>

        {error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#E9456020",
              border: "1px solid #E94560",
              borderRadius: "8px",
              color: "#E94560",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        {image && (
          <div style={{ marginTop: "1rem" }}>
            <img
              src={`data:image/png;base64,${image}`}
              alt="Generated"
              style={{
                width: "100%",
                borderRadius: "12px",
                border: "1px solid #2A2A35",
              }}
            />
            <a
              href={`data:image/png;base64,${image}`}
              download="atlas-ai.png"
              style={{
                display: "block",
                marginTop: "0.5rem",
                padding: "0.75rem",
                background: "#14141A",
                color: "#F5A623",
                border: "1px solid #F5A623",
                borderRadius: "8px",
                textAlign: "center",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Download Image
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
