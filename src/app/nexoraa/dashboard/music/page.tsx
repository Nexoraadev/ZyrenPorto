import { MusicManager } from "@/components/admin/MusicManager";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Music" };

export default async function MusicPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any;
  const { data } = await sb.from("site_settings").select("value").eq("key", "music").single();
  const currentUrl: string = data?.value?.url ?? "";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100">Background Music</h1>
        <p className="text-sm text-dark-500 mt-1 font-mono">
          {`// upload file MP3 yang akan diputar di website`}
        </p>
      </div>
      <MusicManager currentUrl={currentUrl} />
    </div>
  );
}
