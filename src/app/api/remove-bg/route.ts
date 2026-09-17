import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.REMOVEBG_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "REMOVEBG_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Forward ke remove.bg API
    const rbFormData = new FormData();
    rbFormData.append("image_file", file);
    rbFormData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: rbFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `remove.bg error: ${errText}` },
        { status: response.status }
      );
    }

    // Return PNG hasil remove bg sebagai base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({
      result: `data:image/png;base64,${base64}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
