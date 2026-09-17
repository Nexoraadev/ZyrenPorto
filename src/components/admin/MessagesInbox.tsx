"use client";

import { useState, useTransition } from "react";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { Mail, MailOpen, Trash2, Send, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id:         string;
  created_at: string;
  name:       string;
  email:      string;
  message:    string;
  read:       boolean;
  replied:    boolean;
}

interface MessagesInboxProps {
  messages: Message[];
}

export function MessagesInbox({ messages: initialMessages }: MessagesInboxProps) {
  const [messages,   setMessages  ] = useState(initialMessages);
  const [selected,   setSelected  ] = useState<Message | null>(null);
  const [replyText,  setReplyText ] = useState("");
  const [sending,    setSending   ] = useState(false);
  const [sendError,  setSendError ] = useState("");
  const [sendOk,     setSendOk    ] = useState(false);
  const [, startTransition] = useTransition();

  async function markRead(msg: Message) {
    if (msg.read) return;
    const supabase = createAdminClient();
    await supabase.from("messages").update({ read: true }).eq("id", msg.id);
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
  }

  async function markReplied(id: string) {
    const supabase = createAdminClient();
    await supabase.from("messages").update({ replied: true }).eq("id", id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, replied: true } : m));
    if (selected?.id === id) setSelected(s => s ? { ...s, replied: true } : null);
  }

  async function deleteMsg(msg: Message) {
    if (!confirm(`Hapus pesan dari ${msg.name}?`)) return;
    const supabase = createAdminClient();
    await supabase.from("messages").delete().eq("id", msg.id);
    setMessages(prev => prev.filter(m => m.id !== msg.id));
    if (selected?.id === msg.id) setSelected(null);
  }

  async function handleSendReply() {
    if (!selected || !replyText.trim()) return;
    setSending(true);
    setSendError("");
    setSendOk(false);

    try {
      const res = await fetch("/api/email-reply", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          to:              selected.email,
          toName:          selected.name,
          replyText:       replyText.trim(),
          originalMessage: selected.message,
          messageId:       selected.id,
        }),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        setSendError(json.error ?? "Gagal mengirim email.");
      } else {
        setSendOk(true);
        setReplyText("");
        markReplied(selected.id);
        // Hide success after 3s
        setTimeout(() => setSendOk(false), 3000);
      }
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Error");
    } finally {
      setSending(false);
    }
  }

  function handleSelect(msg: Message) {
    setSelected(msg);
    setReplyText("");
    setSendError("");
    setSendOk(false);
    startTransition(() => markRead(msg));
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="flex gap-4 h-[calc(100vh-180px)]">

      {/* ── Message list ──────────────────────────────────────────────── */}
      <div className="w-80 shrink-0 flex flex-col gap-2 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-dark-600">
            <Mail size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-mono">{`// belum ada pesan`}</p>
          </div>
        ) : messages.map(msg => (
          <button key={msg.id} onClick={() => handleSelect(msg)}
            className={cn(
              "text-left p-4 rounded-xl border transition-all",
              selected?.id === msg.id
                ? "border-blood-700 bg-blood-950/30"
                : "border-dark-800 bg-dark-900/30 hover:border-dark-700 hover:bg-dark-900/50",
              !msg.read && "border-l-2 border-l-blood-600"
            )}>
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-sm font-medium", !msg.read ? "text-dark-100" : "text-dark-400")}>
                {msg.name}
              </span>
              <div className="flex items-center gap-1.5">
                {!msg.read
                  ? <MailOpen size={12} className="text-blood-500" />
                  : <Mail size={12} className="text-dark-600" />
                }
                {msg.replied && <Check size={11} className="text-green-500" />}
              </div>
            </div>
            <p className="text-[11px] text-dark-600 font-mono">{msg.email}</p>
            <p className="text-xs text-dark-500 mt-1.5 line-clamp-2 leading-relaxed">{msg.message}</p>
            <p className="text-[10px] text-dark-700 font-mono mt-2">{formatDate(msg.created_at)}</p>
          </button>
        ))}
      </div>

      {/* ── Message detail + reply ─────────────────────────────────────── */}
      <div className="flex-1 card-dark rounded-xl border border-dark-800 overflow-hidden flex flex-col">
        {selected ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-dark-800 flex items-start justify-between gap-4 bg-dark-950/50">
              <div>
                <h2 className="font-semibold text-dark-100 text-base">{selected.name}</h2>
                <p className="text-xs text-dark-500 font-mono mt-0.5">{selected.email}</p>
                <p className="text-[10px] text-dark-700 font-mono mt-1">{formatDate(selected.created_at)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!selected.replied && (
                  <button onClick={() => markReplied(selected.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-700 hover:border-dark-600 text-dark-400 hover:text-dark-200 text-xs font-mono transition-colors">
                    <Check size={12} /> Tandai Dibalas
                  </button>
                )}
                <button onClick={() => deleteMsg(selected)}
                  className="p-1.5 rounded-lg border border-dark-800 hover:border-blood-800 text-dark-600 hover:text-blood-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Message body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="bg-dark-900/50 rounded-xl p-5 border border-dark-800">
                <p className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              {selected.replied && (
                <div className="flex items-center gap-2 mt-4 text-xs text-green-500 font-mono">
                  <Check size={12} /> Sudah dibalas
                </div>
              )}
            </div>

            {/* Reply box */}
            <div className="px-6 py-4 border-t border-dark-800 bg-dark-900/30">
              <p className="text-[10px] font-mono text-dark-600 mb-2">
                Balas ke <span className="text-dark-400">{selected.email}</span> via Resend
              </p>
              <textarea
                rows={3}
                value={replyText}
                onChange={e => { setReplyText(e.target.value); setSendError(""); setSendOk(false); }}
                onKeyDown={e => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSendReply();
                }}
                placeholder={`Tulis balasan untuk ${selected.name}…`}
                className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-dark-800 text-dark-200 placeholder-dark-700 text-sm focus:outline-none focus:border-blood-700 transition-colors resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <div>
                  {sendError && (
                    <p className="text-xs text-blood-400 font-mono">{sendError}</p>
                  )}
                  {sendOk && (
                    <p className="text-xs text-green-500 font-mono flex items-center gap-1">
                      <Check size={11} /> Email terkirim ke {selected.email}
                    </p>
                  )}
                  {!sendError && !sendOk && (
                    <p className="text-[10px] text-dark-700 font-mono">Ctrl+Enter untuk kirim</p>
                  )}
                </div>
                <button
                  onClick={handleSendReply}
                  disabled={sending || !replyText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blood-700 hover:bg-blood-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
                >
                  {sending
                    ? <><Loader2 size={12} className="animate-spin" /> Mengirim…</>
                    : <><Send size={12} /> Kirim Email</>
                  }
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-dark-600">
            <Mail size={40} className="opacity-30" />
            <p className="text-sm font-mono">{`// pilih pesan untuk dibaca`}</p>
          </div>
        )}
      </div>
    </div>
  );
}
