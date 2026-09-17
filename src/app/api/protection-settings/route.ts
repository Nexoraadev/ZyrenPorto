import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const revalidate = 0;

const defaultSettings = {
  masterEnabled: false,
  disableRightClick: false,
  blurOnLeave: false,
  disableSelection: false,
  blockDevTools: false,
};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "content_protection")
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (data as any)?.value ?? defaultSettings;
    return NextResponse.json(value);
  } catch {
    return NextResponse.json(defaultSettings);
  }
}
