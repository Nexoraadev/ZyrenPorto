"use client";

import { useState, useTransition } from "react";
import { createAdminClient } from "@/lib/supabase/admin-client";
import {
  MessageSquare, Trash2, Reply, Check, Phone,
  ArrowDownLeft, ArrowUpRight, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WaMessage {
  id:          string;
  created_at:  string;
  sender:      string;
  sender_name: string | null;
  message:     string;
  read:        boolean;
  replied:     boolean;
  direction?:  "inbound" | "outbound";  // inbound = dari webhook/chat WA, outbound = dari form landing page
}

interface WaInboxProps {
  messages: WaMessage[];
}

// Group messages by sender number — each unique number = 1 conversation thread
function groupBySender(messages: WaMessage[]) {
  const map = new Map<string, WaMessage[]>();
  for (const msg of messages) {
    const key = msg.sender;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(msg);
  }
  // Sort each thread oldest-first for chat view
  for (const [, msgs] of map) {
    msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  // Return sorted by latest message descending
  return Array.from(map.entries()).sort((a, b) => {
    const latA = a[1][a[1].length - 1].created_at;
    const latB = b[1][b[1].length - 1].created_at;
    return new Date(latB).getTime() - new Date(latA).getTime();
  });
}

export function WaInbox({ messages: initialMessages }: WaInboxProps) {
  const [messages,   setMessages  ] = useState(initialMessages);
  const [activeSender, setActiveSender] = useState<string | null>(null);
  const [replyText,  setReplyText ] = useState("");
  const [replying,   setReplying  ] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [, startTransition] = useTransition();

  const threads = groupBySender(messages);
  const activeThread = activeSender
    ? (threads.find(([s]) => s === activeSender)?.[1] ?? [])
    : [];

  // Get display name for a sender
  const displayName = (sender: string) => {
    const msgs = messages.filter(m => m.sender === sender);
    return msgs.find(m => m.sender_name)?.sender_name ?? sender;
  };

  const unreadInThread = (sender: string) =>
    messages.filter(m => m.sender === sender && !m.read).length;

  // Mark all messages from this sender as read
  async function markThreadRead(sender: string) {
    const unread = messages.filter(m => m.sender === sender && !m.read);
    if (unread.length === 0) return;
    const supabase = createAdminClient();
    const ids = unread.map(m => m.id);
    await supabase.from("messages_wa").update({ read: true }).in("id", ids);
    setMessages(prev => prev.map(m => m.sender === sender ? { ...m, read: true } : m));
  }

  async function deleteThread(sender: string) {
    const name = displayName(sender);
    if (!confirm(`Hapus semua pesan dari ${name}?`)) return;
    const supabase = createAdminClient();
    const ids = messages.filter(m => m.sender === sender).map(m => m.id);
    await supabase.from("messages_wa").delete().in("id", ids);
    setMessages(prev => prev.filter(m => m.sender !== sender));
    if (activeSender === sender) setActiveSender(null);
  }

  async function handleReply() {
    if (!activeSender || !replyText.trim()) return;
    setReplying(true);
    setReplyError("");

    try {
      const res = await fetch("/api/wa-reply", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          target:  activeSender,
          message: replyText.trim(),
        }),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        setReplyError(json.error ?? "Gagal mengirim balasan.");
      } else {
        // Add outgoing message to local state for immediate display
        const newMsg: WaMessage = {
          id:          `temp-${Date.now()}`,
          created_at:  new Date().toISOString(),
          sender:      activeSender,
          sender_name: "Zyrenn (Kamu)",
          message:     replyText.trim(),
          read:        true,
          replied:     true,
          direction:   "outbound",
        };
        setMessages(prev => [...prev, newMsg]);
        setReplyText("");
      }
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : "Error");
    } finally {
      setReplying(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("messages_wa")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setMessages(data);
    } catch (e) {
      console.error("Refresh error:", e);
    } finally {
      setRefreshing(false);
    }
  }

  function handleSelectThread(sender: string) {
    setActiveSender(sender);
    setReplyText("");
    setReplyError("");
    startTransition(() => markThreadRead(sender));
  }

  const formatTime = (d: string) => {
    const date = new Date(d);
    const now  = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86_400_000);

    if (days === 0) return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    if (days === 1) return "Kemarin";
    if (days < 7)  return date.toLocaleDateString("id-ID", { weekday: "short" });
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const formatFull = (d: string) => new Date(d).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const totalUnread = messages.filter(m => !m.read).length;

  return (
    <div className="flex gap-4 h-[calc(100vh-180px)]">
      {/* ── Thread list (left panel) ────────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col gap-0 overflow-y-auto rounded-xl border border-dark-800 bg-dark-950">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-950">
          <span className="text-xs font-mono text-dark-500">
            {threads.length} percakapan
            {totalUnread > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-blood-700 text-white text-[10px]">
                {totalUnread}
              </span>
            )}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh"
            className="p-1 rounded text-dark-600 hover:text-dark-300 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {threads.length === 0 ? (
          <div className="text-center py-12 px-4 text-dark-600">
            <MessageSquare size={28} className="mx-auto mb-3 opacity-40" />
            <p className="text-xs font-mono">{`// belum ada pesan WA`}</p>
            <p className="text-[10px] font-mono text-dark-700 mt-2 leading-relaxed">
              Pastikan webhook Fonnte sudah dikonfigurasi di Settings
            </p>
          </div>
        ) : threads.map(([sender, msgs]) => {
          const latest   = msgs[msgs.length - 1];
          const unread   = unreadInThread(sender);
          const isActive = activeSender === sender;

          return (
            <button
              key={sender}
              onClick={() => handleSelectThread(sender)}
              className={cn(
                "text-left px-4 py-3 border-b border-dark-800/50 transition-all",
                isActive
                  ? "bg-blood-950/40 border-l-2 border-l-blood-600"
                  : "hover:bg-dark-900/50",
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={cn(
                  "text-sm font-medium truncate max-w-[160px]",
                  unread > 0 ? "text-dark-100" : "text-dark-400"
                )}>
                  {displayName(sender)}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-blood-700 text-white text-[9px] font-mono">
                      {unread}
                    </span>
                  )}
                  <span className="text-[9px] text-dark-700 font-mono">{formatTime(latest.created_at)}</span>
                </div>
              </div>
              <p className="text-[10px] text-dark-600 font-mono flex items-center gap-1 mb-1">
                <Phone size={8} /> {sender}
              </p>
              <div className="flex items-center gap-1">
                {latest.direction === "outbound"
                  ? <ArrowUpRight size={9} className="text-blood-700 shrink-0" />
                  : <ArrowDownLeft size={9} className="text-green-700 shrink-0" />
                }
                <p className="text-[11px] text-dark-500 truncate leading-relaxed">{latest.message}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Chat view (right panel) ─────────────────────────────────── */}
      <div className="flex-1 card-dark rounded-xl border border-dark-800 overflow-hidden flex flex-col">
        {activeSender ? (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between gap-4 bg-dark-950/50">
              <div>
                <h2 className="font-semibold text-dark-100 text-base">{displayName(activeSender)}</h2>
                <p className="text-xs text-dark-500 font-mono mt-0.5 flex items-center gap-1">
                  <Phone size={10} /> {activeSender}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => deleteThread(activeSender)}
                  title="Hapus semua pesan dari nomor ini"
                  className="p-1.5 rounded-lg border border-dark-800 hover:border-blood-800 text-dark-600 hover:text-blood-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
              {activeThread.map((msg, i) => {
                const isOut = msg.direction === "outbound";
                const prevMsg = i > 0 ? activeThread[i - 1] : null;
                const showDate = !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="text-center my-3">
                        <span className="text-[10px] font-mono text-dark-700 bg-dark-900 px-3 py-1 rounded-full border border-dark-800">
                          {new Date(msg.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                    )}
                    <div className={cn("flex", isOut ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative group",
                        isOut
                          ? "bg-blood-800/70 text-dark-100 rounded-tr-sm"
                          : "bg-dark-800/80 text-dark-200 rounded-tl-sm border border-dark-700/50"
                      )}>
                        {/* Direction badge */}
                        {!isOut && (
                          <div className="flex items-center gap-1 mb-1">
                            <ArrowDownLeft size={9} className="text-green-500" />
                            <span className="text-[9px] font-mono text-green-600">
                              {msg.direction === "outbound" ? "" : "dari WA"}
                            </span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        <div className={cn(
                          "flex items-center gap-1 mt-1",
                          isOut ? "justify-end" : "justify-start"
                        )}>
                          <span className="text-[9px] opacity-50 font-mono">
                            {formatTime(msg.created_at)}
                          </span>
                          {isOut && msg.replied && <Check size={9} className="text-green-400 opacity-70" />}
                        </div>
                        {/* Full date tooltip */}
                        <span className="absolute hidden group-hover:block -top-6 left-0 text-[9px] font-mono text-dark-600 bg-dark-950 border border-dark-800 rounded px-2 py-0.5 whitespace-nowrap z-10">
                          {formatFull(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply box */}
            <div className="px-4 py-4 border-t border-dark-800 bg-dark-900/30">
              <div className="flex gap-2">
                <input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleReply();
                    }
                  }}
                  placeholder={`Balas ke ${displayName(activeSender)}…`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-dark-900 border border-dark-800 text-dark-200 placeholder-dark-700 text-sm focus:outline-none focus:border-blood-700 transition-colors"
                />
                <button
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blood-700 hover:bg-blood-600 disabled:opacity-50 text-white text-xs font-medium transition-colors shrink-0"
                >
                  <Reply size={12} />
                  {replying ? "Kirim…" : "Kirim"}
                </button>
              </div>
              {replyError && (
                <p className="text-xs text-blood-400 font-mono mt-2">{replyError}</p>
              )}
              <p className="text-[10px] text-dark-700 font-mono mt-1.5">
                Enter untuk kirim
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-dark-600">
            <MessageSquare size={40} className="opacity-25" />
            <p className="text-sm font-mono">{`// pilih percakapan`}</p>
            <p className="text-xs font-mono text-dark-700">
              Pesan masuk dari webhook & form landing page akan muncul di sini
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
