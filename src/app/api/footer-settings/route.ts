import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (await createClient()) as any;
    const { data } = await sb.from("site_settings").select("key,value")
      .in("key", ["site_logo","contact_info","footer_copyright"]);

    const map: Record<string, Record<string, unknown>> = {};
    for (const row of data ?? []) map[row.key] = row.value;

    const ci = (map.contact_info ?? {}) as Record<string, string>;
    return NextResponse.json({
      logo_url:  (map.site_logo?.url  as string) ?? null,
      copyright: (map.footer_copyright?.text as string) ?? "Reavlenia Arezha",
      socials: {
        github:    ci.github    ?? "https://github.com/Rheaglitch",
        linkedin:  ci.linkedin  ?? "https://linkedin.com/",
        instagram: ci.instagram ?? "https://instagram.com/",
        email:     ci.email     ?? "ohmyliinnn@gmail.com",
      },
    });
  } catch {
    return NextResponse.json({ logo_url: null, copyright: "Reavlenia Arezha", socials: {} });
  }
}
