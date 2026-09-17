import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "No URL" }, { status: 400 });

  try {
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch" }, { status: 400 });

    const blob        = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/png";

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type":                 contentType,
        "Access-Control-Allow-Origin":  "*",
        "Cache-Control":                "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
