import { createClient } from "@/lib/supabase/server";
import { WaInbox } from "@/components/admin/WaInbox";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "WA Inbox" };

export default async function WaInboxPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any;

  const { data: messages } = await sb
    .from("messages_wa")
    .select("*")
    .order("created_at", { ascending: false });

  const unread = (messages ?? []).filter((m: { read: boolean }) => !m.read).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-100 flex items-center gap-3">
            WA Inbox
            {unread > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-blood-700 text-white">
                {unread} baru
              </span>
            )}
          </h1>
          <p className="text-xs text-dark-600 mt-1 font-mono">
            {`// pesan WhatsApp masuk via Fonnte webhook`}
          </p>
        </div>
      </div>
      <WaInbox messages={messages ?? []} />
    </div>
  );
}
