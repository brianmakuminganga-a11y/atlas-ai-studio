import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

interface GenerateRequest {
  prompt: string;
  size?: string;
}

const SIZE_MAP: Record<string, { width: number; height: number }> = {
  "1024x1024": { width: 1024, height: 1024 },
  "1344x768": { width: 1344, height: 768 },
  "768x1344": { width: 768, height: 1344 },
  "1440x720": { width: 1440, height: 720 },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, size = "1024x1024" } = body as GenerateRequest;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const dims = SIZE_MAP[size] || SIZE_MAP["1024x1024"];
    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "REPLICATE_API_TOKEN not configured",
      }, { status: 500 });
    }

    const createRes = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Prefer: "wait",
        },
        body: JSON.stringify({
          input: {
            prompt: prompt.trim(),
            width: dims.width,
            height: dims.height,
            num_outputs: 1,
            guidance_scale: 3.5,
            num_inference_steps: 28,
            output_format: "png",
            output_quality: 95,
          },
        }),
      }
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      return NextResponse.json({
        success: false,
        error: `Replicate error: ${errText}`,
      }, { status: 500 });
    }

    const prediction = await createRes.json();
    let output = prediction.output;
    const status = prediction.status;

    if (status === "starting" || status === "processing") {
      const getUrl = prediction.urls?.get;
      if (getUrl) {
        for (let i = 0; i < 60; i++) {
          await new Promise((r) => setTimeout(r, 1500));
          const pollRes = await fetch(getUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const pollData = await pollRes.json();
          if (pollData.status === "succeeded") {
            output = pollData.output;
            break;
          }
          if (pollData.status === "failed" || pollData.status === "canceled") {
            return NextResponse.json({
              success: false,
              error: `Generation ${pollData.status}`,
            }, { status: 500 });
          }
        }
      }
    }

    if (!output || (Array.isArray(output) && output.length === 0)) {
      return NextResponse.json({
        success: false,
        error: "No output from FLUX.1",
      }, { status: 500 });
    }

    const imageUrl = Array.isArray(output) ? output[0] : output;

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return NextResponse.json({
        success: false,
        error: "Failed to download generated image",
      }, { status: 500 });
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    return NextResponse.json({
      success: true,
      prompt,
      size,
      image: base64,
      imageUrl,
      model: "flux-1.1-pro",
      timestamp: Date.now(),
      owner: "Nganga Makumi",
      studio: "Atlas AI Studio",
    });
  } catch (err: any) {
    console.error("[generate] error:", err);
    return NextResponse.json({
      success: false,
      error: err?.message || "Generation failed",
    }, { status: 500 });
  }
            }
