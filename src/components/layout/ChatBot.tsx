"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User, WifiOff, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";

const BALL_SIZE    = 44;
const SAFE_PADDING = 16;
const STORAGE_KEY  = "zyrenn_chat_pos";
const HIST_KEY     = "zyrenn_chat_history";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
  ts:   number;
}

function clampPos(x: number, y: number) {
  // On mobile, reserve space above bottom nav (64px) + safe padding
  const bottomReserve = window.innerWidth < 768 ? 64 + 16 : SAFE_PADDING;
  return {
    x: Math.max(SAFE_PADDING, Math.min(window.innerWidth  - BALL_SIZE - SAFE_PADDING, x)),
    y: Math.max(SAFE_PADDING, Math.min(window.innerHeight - BALL_SIZE - bottomReserve, y)),
  };
}
function defaultPos() {
  // Chat button sits just above the bottom nav on mobile
  // On desktop keep original behaviour
  const bottomOffset = window.innerWidth < 768 ? 64 + 16 : 20;
  return clampPos(
    window.innerWidth  - BALL_SIZE - 20,
    window.innerHeight - BALL_SIZE - bottomOffset,
  );
}

// ── Offline card ──────────────────────────────────────────────────────────────
function OfflineCard() {
  return (
    <div className="mx-2 my-1">
      <div className="rounded-xl border border-dark-700 bg-dark-900/80 p-4 text-center space-y-3">
        <div className="w-9 h-9 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center mx-auto">
          <WifiOff size={16} className="text-dark-500" />
        </div>
        <div>
          <p className="text-xs font-semibold text-dark-300">AI sedang offline</p>
          <p className="text-[10px] text-dark-600 mt-1 leading-relaxed">
            Chatbot tidak tersedia saat ini. Kamu tetap bisa menghubungi Zyrenn langsung!
          </p>
        </div>
        <Link
          href="/#contact"
          onClick={() => {
            // Scroll to contact section
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-medium transition-colors"
        >
          <ArrowDown size={12} />
          Kirim Pesan ke Zyrenn
        </Link>
        <p className="text-[9px] text-dark-700 font-mono">
          via email atau WhatsApp di bawah halaman
        </p>
      </div>
    </div>
  );
}

// ── Chat window ───────────────────────────────────────────────────────────────
function ChatWindow({
  messages, input, setInput, sending, onSend, onClose, ballPos,
}: {
  messages: ChatMessage[];
  input:    string;
  setInput: (v: string) => void;
  sending:  boolean;
  onSend:   () => void;
  onClose:  () => void;
  ballPos:  { x: number; y: number };
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isOffline = messages.length > 0 && messages[messages.length - 1]?.text === "__OFFLINE__";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const windowW = 320;
  const windowH = 420;
  let left = ballPos.x + BALL_SIZE - windowW;
  let top  = ballPos.y - windowH - 8;
  if (top  < 8) top  = ballPos.y + BALL_SIZE + 8;
  if (left < 8) left = 8;
  if (left + windowW > window.innerWidth - 8) left = window.innerWidth - windowW - 8;

  return (
    <div
      className="fixed z-[9991] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
      style={{
        left:      `${left}px`,
        top:       `${top}px`,
        width:     `${windowW}px`,
        height:    `${windowH}px`,
        background: "var(--bg-primary, #0a0a0a)",
        border:     "1px solid rgba(6,182,212,0.35)",
        animation:  "chatSlideIn 0.18s ease",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: "rgba(6,182,212,0.25)", background: "rgba(6,182,212,0.08)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-cyan-700 flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-dark-100">Zyren AI</p>
            <p className={cn("text-[9px] font-mono", isOffline ? "text-dark-600" : "text-cyan-500")}>
              {isOffline ? "● Offline" : "● Online"}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-dark-500 hover:text-dark-200 hover:bg-dark-800 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-950/40 border border-cyan-900/60 flex items-center justify-center">
              <Bot size={18} className="text-cyan-400" />
            </div>
            <p className="text-xs text-dark-400">Hai! Ada yang bisa aku bantu?</p>
            <p className="text-[10px] text-dark-700 font-mono">Tanya soal Zyrenn, proyek, atau kolaborasi</p>
          </div>
        )}

        {messages.map((msg) => {
          // Offline message — render special card
          if (msg.role === "bot" && msg.text === "__OFFLINE__") {
            return <OfflineCard key={msg.ts} />;
          }
          return (
            <div key={msg.ts} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "bot" && (
                <div className="w-6 h-6 rounded-full bg-cyan-950/40 border border-cyan-900/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={11} className="text-cyan-400" />
                </div>
              )}
              <div className={cn(
                "max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-cyan-700 text-white rounded-tr-sm"
                  : "bg-dark-800 text-dark-200 border border-dark-700 rounded-tl-sm"
              )}>
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={11} className="text-dark-400" />
                </div>
              )}
            </div>
          );
        })}

        {sending && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-cyan-950/40 border border-cyan-900/60 flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={11} className="text-cyan-400" />
            </div>
            <div className="px-3 py-2 rounded-2xl rounded-tl-sm bg-dark-800 border border-dark-700">
              <div className="flex items-center gap-1">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-1.5 h-1.5 bg-dark-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input — hidden when offline */}
      {!isOffline && (
        <div className="px-3 py-3 border-t shrink-0" style={{ borderColor: "rgba(6,182,212,0.15)" }}>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              placeholder="Ketik pesan..."
              className="flex-1 px-3 py-2 rounded-xl bg-dark-900 border border-dark-800 text-dark-200 placeholder-dark-700 text-sm focus:outline-none focus:border-cyan-600 transition-colors"
            />
            <button onClick={onSend} disabled={sending || !input.trim()}
              className="w-9 h-9 rounded-xl bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0">
              {sending
                ? <Loader2 size={14} className="text-white animate-spin" />
                : <Send size={14} className="text-white" />}
            </button>
          </div>
          <p className="text-[9px] font-mono text-dark-800 text-center mt-1.5">Powered by n8n × Gemini</p>
        </div>
      )}

      <style>{`
        @keyframes chatSlideIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Main ChatBot ──────────────────────────────────────────────────────────────
export function ChatBot() {
  const pathname = usePathname();
  const isAdmin  = pathname.startsWith("/nexoraa");

  const [pos,      setPos     ] = useState({ x: -999, y: -999 });
  const [open,     setOpen    ] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input,    setInput   ] = useState("");
  const [sending,  setSending ] = useState(false);

  const posRef     = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const movedTotal = useRef(0);
  const dragOffset = useRef({ x: 0, y: 0 });

  if (isAdmin) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    try {
      // Always use fresh defaultPos — ignore stale saved position
      // so repositioning fixes take effect immediately without requiring
      // the user to clear localStorage manually.
      localStorage.removeItem(STORAGE_KEY);
      const p = defaultPos();
      const c = clampPos(p.x, p.y);
      setPos(c); posRef.current = c;
    } catch {
      const p = defaultPos(); setPos(p); posRef.current = p;
    }
    try {
      const hist = localStorage.getItem(HIST_KEY);
      if (hist) setMessages(JSON.parse(hist));
    } catch {}
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fn = () => { const c = clampPos(posRef.current.x, posRef.current.y); posRef.current = c; setPos({...c}); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const savePos = (x: number, y: number) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y })); } catch {}
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const nx = e.clientX - dragOffset.current.x;
      const ny = e.clientY - dragOffset.current.y;
      movedTotal.current += Math.abs(nx - posRef.current.x) + Math.abs(ny - posRef.current.y);
      const c = clampPos(nx, ny); posRef.current = c; setPos({...c});
    };
    const onUp = (e: MouseEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      savePos(posRef.current.x, posRef.current.y);
      if (movedTotal.current < 8) { e.stopPropagation(); setOpen(o => !o); }
      movedTotal.current = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const t = e.touches[0];
      const nx = t.clientX - dragOffset.current.x;
      const ny = t.clientY - dragOffset.current.y;
      movedTotal.current += Math.abs(nx - posRef.current.x) + Math.abs(ny - posRef.current.y);
      const c = clampPos(nx, ny); posRef.current = c; setPos({...c});
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      savePos(posRef.current.x, posRef.current.y);
      if (movedTotal.current < 8) { e.preventDefault(); setOpen(o => !o); }
      movedTotal.current = 0;
    };
    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("touchmove",  onTouchMove, { passive: false });
    window.addEventListener("touchend",   onTouchEnd,  { passive: false });
    return () => {
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mouseup",    onUp);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  }, []);

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true; movedTotal.current = 0;
    dragOffset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
  }
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    isDragging.current = true; movedTotal.current = 0;
    dragOffset.current = { x: t.clientX - posRef.current.x, y: t.clientY - posRef.current.y };
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = { role: "user", text, ts: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setSending(true);

    try {
      const res  = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ chatInput: text, sessionId: getSessionId() }),
      });
      const data = await res.json();
      const raw  = data?.output ?? data?.reply ?? data?.response ?? data?.text ?? data?.message ?? "OFFLINE";
      const reply = (raw === "OFFLINE" || !raw) ? "__OFFLINE__" : String(raw);

      const botMsg: ChatMessage = { role: "bot", text: reply, ts: Date.now() };
      const updated = [...next, botMsg];
      setMessages(updated);
      try { localStorage.setItem(HIST_KEY, JSON.stringify(updated.slice(-40))); } catch {}
    } catch {
      const botMsg: ChatMessage = { role: "bot", text: "__OFFLINE__", ts: Date.now() };
      const updated = [...next, botMsg];
      setMessages(updated);
    } finally {
      setSending(false);
    }
  }

  const mounted = pos.x > -900;

  return (
    <>
      {open && mounted && (
        <ChatWindow
          messages={messages} input={input} setInput={setInput}
          sending={sending} onSend={handleSend}
          onClose={() => setOpen(false)} ballPos={pos}
        />
      )}
      <button
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        aria-label={open ? "Tutup chat" : "Buka chat"}
        className={cn(
          "fixed z-[9992] select-none touch-none flex items-center justify-center transition-opacity duration-300",
          mounted ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{
          left: pos.x, top: pos.y,
          width: `${BALL_SIZE}px`, height: `${BALL_SIZE}px`,
          borderRadius: "50%",
          background: open
            ? "linear-gradient(135deg,#0e7490,#164e63)"
            : "linear-gradient(135deg,#06b6d4,#0e7490)",
          border: "2px solid rgba(34,211,238,0.5)",
          boxShadow: open
            ? "0 4px 20px rgba(8,145,178,0.4)"
            : "0 4px 20px rgba(8,145,178,0.55),0 0 0 0 rgba(34,211,238,0.4)",
          cursor: isDragging.current ? "grabbing" : "grab",
          animation: open ? "none" : "chatPulse 2.5s ease-in-out infinite",
        }}
      >
        {open
          ? <X             size={17} className="text-white pointer-events-none" />
          : <MessageCircle size={17} className="text-white pointer-events-none" />}
        <style>{`
          @keyframes chatPulse {
            0%,100% { box-shadow:0 4px 20px rgba(8,145,178,0.55),0 0 0 0   rgba(34,211,238,0.4); }
            50%      { box-shadow:0 4px 20px rgba(8,145,178,0.55),0 0 0 10px rgba(34,211,238,0); }
          }
        `}</style>
      </button>
    </>
  );
}

function getSessionId(): string {
  const key = "zyrenn_session_id";
  try {
    let id = localStorage.getItem(key);
    if (!id) { id = `sess_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; localStorage.setItem(key, id); }
    return id;
  } catch { return `sess_${Date.now()}`; }
}
