import { MessageSettings } from "@/components/admin/MessageSettings";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Message Settings" };

export default async function MessageSettingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any;
  const { data } = await sb.from("site_settings").select("value").eq("key", "contact_info").single();
  const ci = (data?.value ?? {}) as Record<string, string>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-dark-100">Notification Settings</h1>
        <p className="text-xs text-dark-600 mt-1 font-mono">
          {`// konfigurasi email & WhatsApp notifikasi`}
        </p>
      </div>
      <MessageSettings
        initialEmail={ci.email ?? "ohmyliinnn@gmail.com"}
        initialWa={ci.wa_number ?? ""}
      />
    </div>
  );
}
