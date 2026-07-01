"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import {
  createThread,
  fetchMessages,
  fetchSupportStatus,
  fetchThreads,
  markRead,
  sendMessage,
  uploadSupportImage,
  SUPPORT_KIND_LABELS,
  type SupportKind,
  type SupportMessage,
} from "./supportApi";
import { Icon } from "../../components/ui/Icon";

const POLL_MS = 3000;
const TICKET_POLL_MS = 15000;
const PRESENCE_POLL_MS = 15000;
const KIND_ORDER: SupportKind[] = ["live_chat", "feature_request", "bug_report", "site_message"];

export function SupportChatWidget() {
  const { isAuthenticated, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<SupportKind>("live_chat");
  const [online, setOnline] = useState(true);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const lastAt = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("parag:open-chat", onOpen);
    return () => window.removeEventListener("parag:open-chat", onOpen);
  }, []);

  // Presence indicator, polled regardless of open state.
  useEffect(() => {
    const refresh = () => void fetchSupportStatus().then((r) => setOnline(r.online));
    refresh();
    const i = setInterval(refresh, PRESENCE_POLL_MS);
    return () => clearInterval(i);
  }, []);

  const loadThreadForKind = useCallback(async (k: SupportKind) => {
    const { threads } = await fetchThreads();
    const existing = threads.find((t) => t.kind === k);
    if (existing) return existing.id;
    const { thread } = await createThread(k, k !== "live_chat" && k !== "site_message");
    return thread.id;
  }, []);

  useEffect(() => {
    if (!open || !isAuthenticated) return;
    let active = true;
    setMessages([]);
    setThreadId(null);
    lastAt.current = null;
    void loadThreadForKind(kind).then(async (id) => {
      if (!active) return;
      setThreadId(id);
      const { messages: initial } = await fetchMessages(id);
      if (!active) return;
      setMessages(initial);
      lastAt.current = initial.at(-1)?.created_at ?? null;
      void markRead(id);
    });
    return () => {
      active = false;
    };
  }, [open, isAuthenticated, kind, loadThreadForKind]);

  // Poll for new messages while open (live chat faster than tickets).
  useEffect(() => {
    if (!open || !threadId) return;
    const interval = kind === "live_chat" ? POLL_MS : TICKET_POLL_MS;
    const i = setInterval(async () => {
      const { messages: fresh } = await fetchMessages(threadId, lastAt.current ?? undefined);
      if (fresh.length) {
        setMessages((prev) => [...prev, ...fresh]);
        lastAt.current = fresh.at(-1)?.created_at ?? lastAt.current;
        void markRead(threadId);
      }
    }, interval);
    return () => clearInterval(i);
  }, [open, threadId, kind]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  function pickImage(file: File | undefined) {
    if (!file) return;
    setImage({ file, preview: URL.createObjectURL(file) });
  }
  function clearImage() {
    if (image) URL.revokeObjectURL(image.preview);
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const readOnly = kind === "site_message";

  async function send() {
    const body = text.trim();
    if ((!body && !image) || !threadId || busy || readOnly) return;
    setBusy(true);
    try {
      let image_url: string | undefined;
      if (image) image_url = await uploadSupportImage(image.file);
      const { message } = await sendMessage(threadId, { body: body || undefined, image_url });
      setMessages((prev) => [...prev, message]);
      lastAt.current = message.created_at;
      setText("");
      clearImage();
    } finally {
      setBusy(false);
    }
  }

  if (loading) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="گفتگو با پشتیبانی"
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-white shadow-2xl shadow-accent/40 transition-transform hover:scale-105"
      >
        <Icon name={open ? "close" : "chat"} />
      </button>

      {open && (
        <div className="glass fixed bottom-24 left-6 z-50 flex h-[32rem] w-[24rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl border border-border/70 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="flex items-center gap-2 border-b border-border/60 bg-panel/60 px-4 py-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white">
              <Icon name="chat" />
              <span
                className={`absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-panel ${
                  online ? "animate-pulse bg-emerald-400" : "bg-red-500"
                }`}
              />
            </span>
            <div>
              <p className="text-sm font-bold text-text">پشتیبانی پاراگ</p>
              <p className="text-xs text-text-muted">{online ? "آنلاین — معمولاً سریع پاسخ می‌دهیم" : "آفلاین"}</p>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-text-muted">برای گفتگو با پشتیبانی وارد شوید.</p>
              <a href="/login" className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white">
                ورود / ثبت‌نام
              </a>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <p className="py-8 text-center text-sm text-text-muted">پیام خود را بنویسید…</p>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex w-fit max-w-[80%] flex-col gap-1.5 break-words rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      m.sender_role === "user"
                        ? "ms-auto rounded-ee-md bg-accent text-white shadow-accent/20"
                        : "me-auto rounded-es-md border border-border bg-panel text-text shadow-black/5"
                    }`}
                  >
                    {m.image_url && (
                      <a href={m.image_url} target="_blank" rel="noreferrer">
                        <img src={m.image_url} alt="" className="max-h-40 max-w-full rounded-lg" />
                      </a>
                    )}
                    {m.body && <span className="whitespace-pre-wrap">{m.body}</span>}
                  </div>
                ))}
              </div>

              {readOnly ? (
                <p className="border-t border-border/60 px-4 py-3 text-center text-xs text-text-muted">
                  این یک پیام سیستمی یک‌طرفه است.
                </p>
              ) : (
                <div className="flex flex-col gap-2 border-t border-border/60 p-3">
                  {image && (
                    <div className="relative w-fit">
                      <img src={image.preview} alt="" className="h-16 w-16 rounded-lg border border-border object-cover" />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -end-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                        aria-label="حذف تصویر"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => pickImage(e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      aria-label="افزودن تصویر"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors hover:text-text"
                    >
                      <ImagePlus className="h-4 w-4" />
                    </button>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder="پیام…"
                      className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={send}
                      disabled={busy}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white disabled:opacity-50"
                    >
                      <Icon name="send" />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-1 border-t border-border/60 p-2">
                {KIND_ORDER.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`rounded-lg px-1 py-1.5 text-center text-[11px] font-medium transition-colors ${
                      kind === k ? "bg-accent/15 text-accent" : "text-text-muted hover:bg-panel hover:text-text"
                    }`}
                  >
                    {SUPPORT_KIND_LABELS[k]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
