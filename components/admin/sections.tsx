"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Lightbulb,
  Bug,
  Megaphone as SiteMessageIcon,
  MessageSquarePlus,
  Trash2,
  UserRound,
  Megaphone,
  Send,
  ImagePlus,
  X,
  Check,
  Search,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { adminApi, type AdminThread, type AdminUser, type ContactMessage } from "../../features/admin/adminApi";
import {
  SUPPORT_KIND_LABELS,
  type SupportKind,
  type SupportMessage,
  type SupportUnreadByKind,
} from "../../features/support/supportApi";
import { Button } from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Field";

function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const reload = () => fn().then(setData).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => void reload(), deps);
  return { data, reload, setData };
}

const card = "rounded-xl border border-border bg-surface";

/* ---------------- Dashboard ---------------- */
export function DashboardSection() {
  const { data } = useAsync(() => adminApi.stats());
  const cards = [
    { label: "کاربران", value: data?.users },
    { label: "گفتگوهای باز", value: data?.openThreads },
    { label: "پیام‌های خوانده‌نشده", value: data?.unreadContact },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className={`${card} p-6`}>
          <p className="text-3xl font-extrabold text-accent">{c.value ?? "—"}</p>
          <p className="mt-1 text-sm text-text-muted">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Users ---------------- */
export function UsersSection() {
  const [q, setQ] = useState("");
  const { data, reload } = useAsync(() => adminApi.listUsers(q), [q]);

  async function patch(u: AdminUser, p: Partial<AdminUser>) {
    await adminApi.updateUser(u.id, p);
    await reload();
  }
  async function remove(u: AdminUser) {
    if (!confirm(`حذف ${u.email}؟`)) return;
    await adminApi.deleteUser(u.id);
    await reload();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-sm">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی ایمیل یا نام…" />
      </div>
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full text-right text-sm">
          <thead className="border-b border-border text-text-muted">
            <tr>
              <th className="p-3 font-medium">ایمیل</th>
              <th className="p-3 font-medium">نقش</th>
              <th className="p-3 font-medium">فعال</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data?.users.map((u) => (
              <tr key={u.id} className="border-b border-border/60 last:border-0">
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <div className="w-36">
                    <Select value={u.role} onChange={(e) => patch(u, { role: e.target.value as AdminUser["role"] })}>
                      <option value="user">کاربر</option>
                      <option value="admin">ادمین</option>
                      <option value="super_admin">سوپرادمین</option>
                    </Select>
                  </div>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => patch(u, { is_active: !u.is_active })}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${u.is_active ? "bg-accent/15 text-accent" : "bg-red-500/10 text-red-400"}`}
                  >
                    {u.is_active ? "فعال" : "غیرفعال"}
                  </button>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => remove(u)}
                    className="rounded-lg text-xs text-red-400 transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Communications (CoachOps parity) ---------------- */
type Tab = SupportKind | "outreach";
const KIND_ICONS: Record<SupportKind, typeof MessageSquare> = {
  live_chat: MessageSquare,
  feature_request: Lightbulb,
  bug_report: Bug,
  site_message: SiteMessageIcon,
};
const TABS: { id: Tab; label: string; icon: typeof MessageSquare }[] = [
  { id: "live_chat", label: SUPPORT_KIND_LABELS.live_chat, icon: KIND_ICONS.live_chat },
  { id: "feature_request", label: SUPPORT_KIND_LABELS.feature_request, icon: KIND_ICONS.feature_request },
  { id: "bug_report", label: SUPPORT_KIND_LABELS.bug_report, icon: KIND_ICONS.bug_report },
  { id: "site_message", label: SUPPORT_KIND_LABELS.site_message, icon: KIND_ICONS.site_message },
  { id: "outreach", label: "پیام جدید", icon: MessageSquarePlus },
];
const UNREAD_POLL_MS = 3000;

export function CommunicationsSection() {
  const [tab, setTab] = useState<Tab>("live_chat");
  const [online, setOnline] = useState(true);
  const [byKind, setByKind] = useState<SupportUnreadByKind | null>(null);

  useEffect(() => {
    void adminApi.supportStatus().then((r) => setOnline(r.online));
  }, []);

  async function refreshUnread() {
    setByKind((await adminApi.unreadByKind()).byKind);
  }
  useEffect(() => {
    void refreshUnread();
    const i = setInterval(refreshUnread, UNREAD_POLL_MS);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-border/80 bg-panel/50 p-1 shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            const unread = id === "outreach" ? 0 : byKind?.[id] ?? 0;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                  active ? "bg-surface text-text shadow-sm ring-1 ring-border/60" : "text-text-muted hover:bg-panel hover:text-text"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-accent" : ""}`} />
                {label}
                {unread > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-1.5">
          <span className={`h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-red-500"}`} />
          <span className="text-xs font-medium text-text">{online ? "آنلاین" : "آفلاین"}</span>
          <button
            type="button"
            onClick={async () => setOnline((await adminApi.setSupportStatus(!online)).online)}
            className="rounded-lg text-xs font-medium text-accent transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            {online ? "آفلاین شو" : "آنلاین شو"}
          </button>
        </div>
      </div>

      {tab === "outreach" ? <OutreachPanel onSent={refreshUnread} /> : <ThreadsPanel kind={tab} onRead={refreshUnread} />}
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  open: "باز",
  waiting_admin: "منتظر پاسخ ادمین",
  waiting_user: "منتظر پاسخ کاربر",
  resolved: "حل‌شده",
  closed: "بسته‌شده",
};

function ThreadsPanel({ kind, onRead }: { kind: SupportKind; onRead: () => void }) {
  const { data, reload } = useAsync(() => adminApi.listThreads(kind), [kind]);
  const [active, setActive] = useState<AdminThread | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [sending, setSending] = useState(false);
  const lastAt = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActive(null);
    setMessages([]);
  }, [kind]);

  async function open(t: AdminThread) {
    setActive(t);
    const { messages: initial } = await adminApi.threadMessages(t.id);
    setMessages(initial);
    lastAt.current = initial.at(-1)?.created_at ?? null;
    await adminApi.markThreadRead(t.id).catch(() => {});
    onRead();
    await reload();
  }
  // Incremental poll of the active conversation.
  useEffect(() => {
    if (!active) return;
    const i = setInterval(async () => {
      const { messages: fresh } = await adminApi.threadMessages(active.id, lastAt.current ?? undefined);
      if (fresh.length) {
        setMessages((prev) => [...prev, ...fresh]);
        lastAt.current = fresh.at(-1)?.created_at ?? lastAt.current;
        await adminApi.markThreadRead(active.id).catch(() => {});
        onRead();
      }
    }, 3000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function pickImage(file: File | undefined) {
    if (!file) return;
    setImage({ file, preview: URL.createObjectURL(file) });
  }
  function clearImage() {
    if (image) URL.revokeObjectURL(image.preview);
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function reply() {
    if (!active || (!text.trim() && !image) || sending) return;
    setSending(true);
    try {
      let image_url: string | undefined;
      if (image) image_url = await adminApi.uploadMedia(image.file);
      const { message } = await adminApi.reply(active.id, { body: text.trim() || undefined, image_url });
      setMessages((p) => [...p, message]);
      lastAt.current = message.created_at;
      setText("");
      clearImage();
      await reload();
    } finally {
      setSending(false);
    }
  }

  async function setStatus(status: string) {
    if (!active) return;
    const { thread } = await adminApi.setThreadStatus(active.id, status);
    setActive(thread);
    await reload();
  }

  async function removeThread(t: AdminThread, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("این گفتگو برای همیشه حذف شود؟")) return;
    await adminApi.deleteThread(t.id);
    if (active?.id === t.id) {
      setActive(null);
      setMessages([]);
    }
    await reload();
  }

  return (
    <div className={`${card} flex min-h-[28rem] overflow-hidden`}>
      <aside className="flex w-full max-w-xs shrink-0 flex-col border-e border-border">
        {data?.threads.length === 0 && <p className="p-4 text-sm text-text-muted">گفتگویی نیست.</p>}
        <ul className="flex-1 overflow-y-auto p-2">
          {data?.threads.map((t) => (
            <li key={t.id} className="relative mb-1">
              <button
                type="button"
                onClick={() => open(t)}
                className={`w-full rounded-lg px-3 py-2.5 pe-10 text-start transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                  active?.id === t.id ? "bg-accent/15 text-accent" : "hover:bg-panel"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-text">
                    {t.user_first_name || t.user_email}
                  </span>
                  {t.admin_unread_count > 0 && (
                    <span className="shrink-0 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {t.admin_unread_count}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-text-muted">{t.last_message_body || "—"}</p>
              </button>
              <button
                type="button"
                onClick={(e) => removeThread(t, e)}
                className="absolute end-2 top-2 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                aria-label="حذف گفتگو"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        {!active ? (
          <p className="m-auto text-sm text-text-muted">یک گفتگو را انتخاب کنید.</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-text">{active.user_email}</p>
                <p className="text-xs text-text-muted">{STATUS_LABELS[active.status] ?? active.status}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {active.status !== "resolved" && (
                  <Button size="sm" variant="secondary" onClick={() => setStatus("resolved")}>
                    <Check className="h-3.5 w-3.5" />
                    علامت حل‌شده
                  </Button>
                )}
                {active.status !== "closed" && (
                  <Button size="sm" variant="ghost" onClick={() => setStatus("closed")}>
                    بستن
                  </Button>
                )}
              </div>
            </div>
            <MessageList ref={scrollRef} messages={messages} />
            <div className="flex flex-col gap-2 border-t border-border p-3">
              {image && (
                <div className="relative w-fit">
                  <img src={image.preview} alt="" className="h-20 w-20 rounded-lg border border-border object-cover" />
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
              <div className="flex items-end gap-2">
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
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-panel text-text-muted transition-colors hover:bg-panel-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  aria-label="افزودن تصویر"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
                <Textarea
                  rows={1}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void reply();
                    }
                  }}
                  placeholder="پاسخ…"
                  className="max-h-28 min-h-[2.5rem] flex-1"
                />
                <Button onClick={reply} disabled={sending} className="h-10 w-10 !p-0" aria-label="ارسال">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

const MessageList = forwardRef<HTMLDivElement, { messages: SupportMessage[] }>(function MessageList(
  { messages },
  ref,
) {
  return (
    <div ref={ref} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
      {messages.length === 0 && (
        <p className="m-auto flex items-center gap-2 text-sm text-text-muted">
          <MessageSquare className="h-4 w-4" /> هنوز پیامی نیست.
        </p>
      )}
      {messages.map((m) => {
        const outgoing = m.sender_role === "admin";
        return (
          <div
            key={m.id}
            className={`flex w-fit max-w-[78%] flex-col gap-1.5 break-words px-3 py-2 text-sm shadow-sm ${
              outgoing
                ? "ms-auto rounded-2xl rounded-ee-md bg-accent text-white shadow-accent/20"
                : "me-auto rounded-2xl rounded-es-md border border-border bg-panel text-text shadow-black/5"
            }`}
          >
            {m.image_url && (
              <a href={m.image_url} target="_blank" rel="noreferrer">
                <img src={m.image_url} alt="" className="max-h-44 max-w-full rounded-lg" />
              </a>
            )}
            {m.body && <span className="whitespace-pre-wrap">{m.body}</span>}
          </div>
        );
      })}
    </div>
  );
});

function userInitial(u: { email: string; first_name: string | null; last_name?: string | null }) {
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return (name || u.email).charAt(0).toUpperCase();
}
function userDisplayName(u: { email: string; first_name: string | null; last_name?: string | null }) {
  return [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email;
}
function userDisplaySub(u: { email: string; first_name: string | null; last_name?: string | null }) {
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return name ? u.email : null;
}

function OutreachPanel({ onSent }: { onSent: () => void }) {
  const [mode, setMode] = useState<"user" | "all">("user");
  const [kind, setKind] = useState<SupportKind>("live_chat");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<{ id: string; email: string; first_name: string | null; last_name: string | null }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmBroadcast, setConfirmBroadcast] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (mode !== "user") return;
    setLoadingUsers(true);
    const t = setTimeout(async () => {
      try {
        setUsers((await adminApi.searchUsers(query)).users);
      } finally {
        setLoadingUsers(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, mode]);

  const pendingInput = useRef<{ body?: string; image_url?: string }>({});

  async function executeSend(input: { body?: string; image_url?: string }) {
    setSending(true);
    setError(null);
    try {
      if (mode === "all") {
        await adminApi.broadcast(input.body ?? "", input.image_url);
        onSent();
      } else {
        if (!selectedUserId) {
          setError("یک کاربر را انتخاب کنید.");
          return;
        }
        await adminApi.sendToUser(selectedUserId, input.body ?? "", kind, input.image_url);
        onSent();
        setSelectedUserId("");
        setQuery("");
      }
      setConfirmBroadcast(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ارسال پیام ناموفق بود.");
    } finally {
      setSending(false);
    }
  }

  async function handleSend(input: { body?: string; image_url?: string }) {
    if (mode === "all") {
      pendingInput.current = input;
      setConfirmBroadcast(true);
      return;
    }
    await executeSend(input);
  }

  return (
    <div className="flex h-[34rem] min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold text-text">پیام جدید</h2>
        <p className="mt-1 text-sm text-text-muted">
          {mode === "all" ? "این پیام به همهٔ کاربران فعال ارسال می‌شود." : "یک کاربر را پیدا کنید و مستقیم برایش پیام بفرستید."}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
        <div className="inline-flex w-fit rounded-full border border-border bg-panel p-1">
          <button
            type="button"
            onClick={() => setMode("user")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
              mode === "user" ? "bg-accent text-white shadow-sm" : "text-text-muted hover:text-text"
            }`}
          >
            <UserRound className="h-4 w-4" />
            ارسال به کاربر خاص
          </button>
          <button
            type="button"
            onClick={() => setMode("all")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
              mode === "all" ? "bg-accent text-white shadow-sm" : "text-text-muted hover:text-text"
            }`}
          >
            <Megaphone className="h-4 w-4" />
            ارسال همگانی
          </button>
        </div>

        {mode === "user" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text">نوع گفتگو</label>
            <div className="w-56">
              <Select value={kind} onChange={(e) => setKind(e.target.value as SupportKind)}>
                {(["live_chat", "feature_request", "bug_report"] as const).map((k) => (
                  <option key={k} value={k}>
                    {SUPPORT_KIND_LABELS[k]}
                  </option>
                ))}
              </Select>
            </div>

            <label className="block text-sm font-medium text-text">جستجوی کاربر</label>
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجوی ایمیل یا نام…"
                className="w-full rounded-xl border border-border bg-bg py-2.5 ps-10 pe-4 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
              />
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-panel/30">
              {loadingUsers ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال بارگذاری…
                </div>
              ) : users.length === 0 ? (
                <p className="py-8 text-center text-sm text-text-muted">کاربری یافت نشد.</p>
              ) : (
                <ul className="divide-y divide-border p-1">
                  {users.map((u) => {
                    const isSelected = selectedUserId === u.id;
                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedUserId(u.id)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                            isSelected ? "bg-accent/15 text-accent" : "hover:bg-panel"
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              isSelected ? "bg-accent text-white" : "bg-panel text-text-muted"
                            }`}
                          >
                            {userInitial(u)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-text">{userDisplayName(u)}</span>
                            {userDisplaySub(u) && (
                              <span className="block truncate text-xs text-text-muted">{userDisplaySub(u)}</span>
                            )}
                          </span>
                          {isSelected && <Check className="h-4 w-4 shrink-0 text-accent" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
        )}

        <div className="mt-auto">
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <SupportComposer
              disabled={sending}
              placeholder="متن پیام…"
              sendLabel={mode === "all" ? "ارسال همگانی" : "ارسال به کاربر خاص"}
              uploadFn={(f) => adminApi.uploadMedia(f)}
              onSend={handleSend}
            />
          </div>
        </div>
      </div>

      {confirmBroadcast && (
        <ConfirmDialog
          open={confirmBroadcast}
          onClose={() => !sending && setConfirmBroadcast(false)}
          onConfirm={() => executeSend(pendingInput.current)}
          title="ارسال همگانی"
          message="این پیام به تمام کاربران فعال ارسال می‌شود. مطمئنی؟"
          confirmLabel="ارسال همگانی"
          variant="danger"
          loading={sending}
        />
      )}
    </div>
  );
}

/* ---------------- Shared: composer + confirm modal ---------------- */
function SupportComposer({
  disabled,
  placeholder,
  sendLabel,
  uploadFn,
  onSend,
}: {
  disabled?: boolean;
  placeholder?: string;
  sendLabel?: string;
  uploadFn: (file: File) => Promise<string>;
  onSend: (input: { body?: string; image_url?: string }) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clearImage() {
    setImageUrl(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadFn(file);
      clearImage();
      setImageUrl(url);
      setImagePreview(URL.createObjectURL(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "آپلود تصویر ناموفق بود.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSend() {
    const text = body.trim();
    if (!text && !imageUrl) return;
    setSending(true);
    setError(null);
    try {
      await onSend({ body: text || undefined, image_url: imageUrl ?? undefined });
      setBody("");
      clearImage();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ارسال پیام ناموفق بود.");
    } finally {
      setSending(false);
    }
  }

  const busy = disabled || sending || uploading;
  const canSend = Boolean(body.trim() || imageUrl);

  return (
    <div className="shrink-0 border-t border-border/50 bg-surface/90 p-3 backdrop-blur-sm">
      {imagePreview && (
        <div className="relative mb-2 ms-1 inline-block">
          <img src={imagePreview} alt="" className="h-14 rounded-xl object-cover ring-1 ring-border/60" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -end-1.5 -top-1.5 rounded-full bg-surface p-0.5 text-text-muted shadow ring-1 ring-border hover:text-text"
            aria-label="حذف تصویر"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      {error && <p className="mb-2 px-1 text-xs text-red-500">{error}</p>}
      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
        />
        <div className="flex min-w-0 flex-1 items-end gap-1 rounded-2xl border border-border/70 bg-bg px-2 py-1.5 shadow-inner">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="mb-0.5 shrink-0 rounded-xl p-2 text-text-muted transition-colors hover:bg-panel hover:text-text disabled:opacity-40"
            aria-label="افزودن تصویر"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
          </button>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={busy}
            rows={1}
            placeholder={placeholder ?? "پیام…"}
            className="max-h-24 min-h-[1.75rem] flex-1 resize-none border-0 bg-transparent py-1.5 text-sm leading-relaxed text-text placeholder:text-text-muted focus:outline-none focus:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
        </div>
        <button
          type="button"
          disabled={busy || !canSend}
          onClick={() => void handleSend()}
          aria-label={sendLabel ?? "ارسال"}
          className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-md shadow-accent/25 transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-panel disabled:text-text-muted disabled:shadow-none"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    </div>
  );
}

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "primary",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  loading?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="ms-auto rounded-lg p-1 text-text-muted transition-colors hover:bg-panel hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                variant === "danger" ? "bg-red-500/15 text-red-500" : "bg-accent/15 text-accent"
              }`}
            >
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-sm leading-relaxed text-text-muted">{message}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
              {cancelLabel ?? "انصراف"}
            </Button>
            <Button
              variant={variant === "danger" ? "danger" : "primary"}
              size="sm"
              onClick={() => void onConfirm()}
              disabled={loading}
            >
              {loading ? "در حال ارسال…" : confirmLabel ?? "تأیید"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Contact ---------------- */
export function ContactSection() {
  const { data } = useAsync(() => adminApi.listContact());
  return (
    <div className="flex flex-col gap-3">
      {data?.messages.length === 0 && <p className="text-sm text-text-muted">پیامی نیست.</p>}
      {(data?.messages ?? []).map((m: ContactMessage) => (
        <div key={m.id} className={`${card} p-4`}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-text">{m.name}</span>
            <span className="text-xs text-text-muted">{m.created_at}</span>
          </div>
          <p className="text-xs text-text-muted">
            {m.email}
            {m.phone ? ` • ${m.phone}` : ""}
          </p>
          <p className="mt-2 text-sm text-text">{m.message}</p>
        </div>
      ))}
    </div>
  );
}

