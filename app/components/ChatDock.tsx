"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, react-hooks/refs -- remote chat hydration and external target synchronization are intentionally effect-driven; refs are read only inside event handlers */

import { AnimatePresence, motion, useDragControls, useReducedMotion } from "framer-motion";
import { Ban, BellOff, Check, CheckCheck, ChevronDown, Crown, Flag, MessageCircle, MessagesSquare, MoreVertical, Pencil, Plus, Reply, Send, SmilePlus, Trash2, UsersRound, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from "react";
import { io, type Socket } from "socket.io-client";
import type { Peer } from "../data/peers";
import { useAuth } from "./AuthProvider";
import type { ClubChatTarget } from "./PlatformProvider";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const;
type ReactionEmoji = (typeof REACTIONS)[number];
type ApiReaction = { emoji: ReactionEmoji; count: number; mine?: boolean };
type ReplyPreview = { id: string; senderName: string; body: string; deleted: boolean };
type ApiMessage = { id: string; conversationId: string; senderId: string; senderName?: string; senderInitials?: string; senderAvatarUrl?: string; body: string; createdAt: string; deleted?: boolean; editedAt?: string; replyTo?: ReplyPreview; reactions?: ApiReaction[]; status?: "sent" | "read" };
type ApiConversation = { id: string; peer: { id: string; name: string; role: string; faculty: string; program: string; city: string; avatarUrl?: string }; lastMessage: string; updatedAt: string; unreadCount: number; muted: boolean };
type ApiGroup = { id: string; kind: "club"; club: { id: string; slug: string; name: string }; memberCount: number; isAdmin: boolean; lastMessage: string; updatedAt: string; unreadCount: number; muted: boolean };
type ApiContact = ApiConversation["peer"];
type ApiConnection = { id: string; requesterId: string; recipientId: string; status: "pending" | "accepted" | "blocked" };
type ActiveChat = { kind: "direct"; conversationId?: string; peer: Peer; muted: boolean } | { kind: "group"; conversationId: string; peer: Peer; group: ClubChatTarget; muted: boolean };
type Props = { peer?: Peer | null; group?: ClubChatTarget | null; open: boolean; onOpenChange: (open: boolean) => void };

export function ChatDock({ peer, group, open, onOpenChange }: Props) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [tab, setTab] = useState<"direct" | "group">("direct");
  const [active, setActive] = useState<ActiveChat | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [contacts, setContacts] = useState<ApiContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [canDrag, setCanDrag] = useState(false);
  const [replyTo, setReplyTo] = useState<ApiMessage | null>(null);
  const [editing, setEditing] = useState<ApiMessage | null>(null);
  const [actionsFor, setActionsFor] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimer = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();

  const refreshDirectory = useCallback(async () => {
    if (!user) return;
    const [directResponse, groupResponse] = await Promise.all([
      fetch("/api/community/conversations", { cache: "no-store" }),
      fetch("/api/community/groups", { cache: "no-store" }),
    ]);
    const directPayload = await directResponse.json() as { data?: ApiConversation[] };
    const groupPayload = await groupResponse.json() as { data?: ApiGroup[] };
    if (directResponse.ok) setConversations(directPayload.data ?? []);
    if (groupResponse.ok) setGroups(groupPayload.data ?? []);
  }, [user]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 900px)");
    const update = () => setCanDrag(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => { void refreshDirectory(); }, [refreshDirectory]);
  useEffect(() => { if (open) void refreshDirectory(); }, [open, refreshDirectory]);

  useEffect(() => {
    if (!peer) return;
    if (group) {
      setTab("group");
      setActive({ kind: "group", conversationId: group.conversationId, peer, group, muted: false });
    } else {
      setTab("direct");
      setActive({ kind: "direct", peer, muted: false });
    }
  }, [group, peer]);

  useEffect(() => {
    setMenuOpen(false);
    setReplyTo(null);
    setEditing(null);
    setActionsFor(null);
    if (active || !open) setFeedback("");
  }, [active?.conversationId, open]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false); };
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, [menuOpen]);

  useEffect(() => {
    if (!open || !active || !user) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setMessages([]);
    void (async () => {
      try {
        let id = active.conversationId ?? "";
        if (!id && active.kind === "direct") {
          const response = await fetch("/api/community/conversations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ peerId: active.peer.id }) });
          const payload = await response.json() as { data?: { id: string }; error?: { message?: string } };
          if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "Söhbət açılmadı.");
          id = payload.data.id;
          if (!cancelled) setActive((current) => current?.kind === "direct" ? { ...current, conversationId: id } : current);
        }
        const [messageResponse, ticketResponse] = await Promise.all([
          fetch(`/api/community/conversations/${id}/messages`, { cache: "no-store" }),
          fetch("/api/realtime/ticket", { method: "POST" }),
        ]);
        const messagePayload = await messageResponse.json() as { data?: ApiMessage[]; error?: { message?: string } };
        const ticketPayload = await ticketResponse.json() as { data?: { ticket: string; socketUrl: string } };
        if (!messageResponse.ok) throw new Error(messagePayload.error?.message ?? "Mesajlar yüklənmədi.");
        if (cancelled) return;
        setMessages(messagePayload.data ?? []);
        void fetch(`/api/community/conversations/${id}/read`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({}) });
        if (ticketResponse.ok && ticketPayload.data) {
          const socket = io(ticketPayload.data.socketUrl, { path: "/socket.io", auth: { ticket: ticketPayload.data.ticket }, transports: ["websocket", "polling"] });
          socketRef.current = socket;
          socket.emit("conversation:join", id);
          socket.on("message:new", (message: ApiMessage) => {
            if (message.conversationId !== id) return;
            setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
            if (message.senderId !== user.id) void fetch(`/api/community/conversations/${id}/read`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({}) });
          });
          socket.on("message:deleted", (payload: { conversationId: string; messageId: string }) => payload.conversationId === id && setMessages((current) => current.map((item) => item.id === payload.messageId ? { ...item, body: "Mesaj silindi", deleted: true, reactions: undefined } : item)));
          socket.on("message:edited", (payload: { conversationId: string; messageId: string; body: string; editedAt: string }) => payload.conversationId === id && setMessages((current) => current.map((item) => item.id === payload.messageId ? { ...item, body: payload.body, editedAt: payload.editedAt } : item)));
          socket.on("message:reaction", (payload: { conversationId: string; messageId: string; reactions: ApiReaction[] }) => payload.conversationId === id && setMessages((current) => current.map((item) => item.id === payload.messageId ? { ...item, reactions: mergeReactions(item.reactions, payload.reactions) } : item)));
          socket.on("message:read", (payload: { conversationId: string; userId: string }) => { if (payload.conversationId === id && payload.userId !== user.id) setMessages((current) => current.map((item) => item.senderId === user.id && item.status ? { ...item, status: "read" } : item)); });
          socket.on("typing", (payload: { conversationId: string; userId: string; active: boolean }) => payload.conversationId === id && payload.userId !== user.id && setTyping(payload.active));
        }
      } catch (value) {
        if (!cancelled) setError(value instanceof Error ? value.message : "Söhbət açılmadı.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    };
  }, [active?.conversationId, active?.kind, active?.peer.id, open, user]);

  const scrollToEnd = useCallback((behavior: ScrollBehavior) => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior }));
  }, []);

  useEffect(() => {
    if (!open) return;
    if (atBottom) scrollToEnd(reduceMotion ? "auto" : "smooth");
  }, [messages, typing, open, reduceMotion, atBottom, scrollToEnd]);

  function onListScroll() {
    const node = listRef.current;
    if (!node) return;
    setAtBottom(node.scrollHeight - node.scrollTop - node.clientHeight < 90);
  }

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const body = draft.trim();
    const id = active?.conversationId;
    if (!body || !id) return;
    if (editing) { await saveEdit(body); return; }
    setDraft("");
    const pendingReply = replyTo;
    setReplyTo(null);
    socketRef.current?.emit("typing", { conversationId: id, active: false });
    const response = await fetch(`/api/community/conversations/${id}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body, ...(pendingReply ? { replyToId: pendingReply.id } : {}) }) });
    const payload = await response.json() as { data?: ApiMessage; error?: { message?: string } };
    if (!response.ok || !payload.data) { setDraft(body); setReplyTo(pendingReply); setError(payload.error?.message ?? "Mesaj göndərilmədi."); return; }
    setMessages((current) => current.some((item) => item.id === payload.data!.id) ? current : [...current, payload.data!]);
    setAtBottom(true);
    void refreshDirectory();
  }

  async function saveEdit(body: string) {
    const id = active?.conversationId;
    const target = editing;
    if (!id || !target) return;
    setDraft("");
    setEditing(null);
    const response = await fetch(`/api/community/conversations/${id}/messages/${target.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ body }) });
    const payload = await response.json() as { data?: ApiMessage; error?: { message?: string } };
    if (!response.ok || !payload.data) { setError(payload.error?.message ?? "Mesaj redaktə edilmədi."); return; }
    setMessages((current) => current.map((item) => item.id === target.id ? { ...item, body: payload.data!.body, editedAt: payload.data!.editedAt } : item));
  }

  async function removeMessage(messageId: string) {
    const id = active?.conversationId;
    if (!id) return;
    setActionsFor(null);
    const response = await fetch(`/api/community/conversations/${id}/messages/${messageId}`, { method: "DELETE" });
    if (!response.ok) { setError("Mesaj silinmədi."); return; }
    setMessages((current) => current.map((message) => message.id === messageId ? { ...message, body: "Mesaj silindi", deleted: true, reactions: undefined } : message));
    void refreshDirectory();
  }

  async function toggleReaction(messageId: string, emoji: ReactionEmoji) {
    const id = active?.conversationId;
    if (!id) return;
    setActionsFor(null);
    setMessages((current) => current.map((item) => item.id === messageId ? { ...item, reactions: applyOwnReaction(item.reactions, emoji) } : item));
    const response = await fetch(`/api/community/conversations/${id}/messages/${messageId}/reactions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ emoji }) });
    const payload = await response.json() as { data?: { reactions: ApiReaction[] }; error?: { message?: string } };
    if (!response.ok || !payload.data) { setError(payload.error?.message ?? "Reaksiya əlavə edilmədi."); void refreshActiveMessages(); return; }
    setMessages((current) => current.map((item) => item.id === messageId ? { ...item, reactions: payload.data!.reactions.length ? payload.data!.reactions : undefined } : item));
  }

  async function refreshActiveMessages() {
    const id = active?.conversationId;
    if (!id) return;
    const response = await fetch(`/api/community/conversations/${id}/messages`, { cache: "no-store" });
    const payload = await response.json() as { data?: ApiMessage[] };
    if (response.ok) setMessages(payload.data ?? []);
  }

  function startReply(message: ApiMessage) {
    setEditing(null);
    setReplyTo(message);
    setActionsFor(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function startEdit(message: ApiMessage) {
    setReplyTo(null);
    setEditing(message);
    setDraft(message.body);
    setActionsFor(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function cancelComposerContext() {
    setReplyTo(null);
    if (editing) { setEditing(null); setDraft(""); }
  }

  async function report(entityType: "message" | "profile" | "club", entityId: string) { setMenuOpen(false); setActionsFor(null); setError(""); const response = await fetch("/api/community/reports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entityType, entityId, reason: "abuse", details: "İstifadəçi tərəfindən yoxlanılması istənildi." }) }); if (response.ok) setFeedback("Şikayət moderasiya komandasına göndərildi."); else setError("Şikayət göndərilmədi."); }
  async function mute() { if (!active?.conversationId) return; setMenuOpen(false); setError(""); const muted = !active.muted; const response = await fetch(`/api/community/conversations/${active.conversationId}/mute`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ muted }) }); if (!response.ok) { setError("Bildiriş seçimi dəyişdirilmədi."); return; } setActive((current) => current ? { ...current, muted } : current); setConversations((items) => items.map((item) => item.id === active.conversationId ? { ...item, muted } : item)); setGroups((items) => items.map((item) => item.id === active.conversationId ? { ...item, muted } : item)); setFeedback(muted ? "Söhbətin bildirişləri səssizə alındı." : "Söhbətin bildirişləri yenidən aktiv edildi."); }
  async function block() { if (!active || active.kind !== "direct") return; setMenuOpen(false); setError(""); const blockedConversationId = active.conversationId; const response = await fetch("/api/community/blocks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: active.peer.id }) }); if (!response.ok) { setError("İstifadəçi bloklanmadı."); return; } if (blockedConversationId) setConversations((items) => items.filter((item) => item.id !== blockedConversationId)); setActive(null); setMessages([]); setFeedback("İstifadəçi bloklandı və söhbət siyahıdan çıxarıldı."); void refreshDirectory(); }

  async function openContacts() {
    setContactsOpen(true); setContactsLoading(true); setError("");
    try {
      const [usersResponse, connectionsResponse] = await Promise.all([fetch("/api/community/users", { cache: "no-store" }), fetch("/api/community/connections", { cache: "no-store" })]);
      const usersPayload = await usersResponse.json() as { data?: ApiContact[]; error?: { message?: string } };
      const connectionsPayload = await connectionsResponse.json() as { data?: ApiConnection[]; error?: { message?: string } };
      if (!usersResponse.ok || !connectionsResponse.ok) throw new Error(usersPayload.error?.message ?? connectionsPayload.error?.message ?? "Əlaqələr yüklənmədi.");
      const accepted = new Set((connectionsPayload.data ?? []).filter((item) => item.status === "accepted").map((item) => item.requesterId === user?.id ? item.recipientId : item.requesterId));
      setContacts((usersPayload.data ?? []).filter((item) => accepted.has(item.id)));
    } catch (value) { setError(value instanceof Error ? value.message : "Əlaqələr yüklənmədi."); setContacts([]); } finally { setContactsLoading(false); }
  }

  async function startContactChat(contact: ApiContact) {
    setError("");
    const response = await fetch("/api/community/conversations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ peerId: contact.id }) });
    const payload = await response.json() as { data?: { id: string }; error?: { message?: string } };
    if (!response.ok || !payload.data) { setError(payload.error?.message ?? "Söhbət açıla bilmədi."); return; }
    setContactsOpen(false); setTab("direct"); setActive({ kind: "direct", conversationId: payload.data.id, peer: apiPeer(contact), muted: false });
  }

  function changeDraft(value: string) {
    setDraft(value);
    if (!active?.conversationId || editing) return;
    socketRef.current?.emit("typing", { conversationId: active.conversationId, active: Boolean(value.trim()) });
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => socketRef.current?.emit("typing", { conversationId: active.conversationId, active: false }), 1200);
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); }
    if (event.key === "Escape" && (replyTo || editing)) { event.preventDefault(); cancelComposerContext(); }
  }

  function insertEmoji(emoji: string) {
    setDraft((current) => `${current}${emoji}`);
    setEmojiOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function scrollToMessage(messageId: string) {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-message="${CSS.escape(messageId)}"]`) ?? null;
    if (!node) return;
    node.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    node.classList.add("message-flash");
    window.setTimeout(() => node.classList.remove("message-flash"), 1200);
  }

  const unreadCount = conversations.reduce((sum, item) => sum + item.unreadCount, 0) + groups.reduce((sum, item) => sum + item.unreadCount, 0);
  const accent = active?.peer.accent ?? "#8fc15f";
  const glow = active?.peer.glow ?? "rgba(143,193,95,.28)";
  const rendered = useMemo(() => buildTimeline(messages), [messages]);

  return (
    <div className="chat-dock" style={{ "--peer-accent": accent, "--peer-glow": glow } as CSSProperties}>
      <AnimatePresence>{!open ? <motion.button id="chat-launcher" type="button" className="chat-launcher" aria-label="Mesajları aç" onClick={() => onOpenChange(true)} initial={reduceMotion ? false : { opacity: 0, scale: .85, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .85 }}><span className="launcher-pulse" /><MessageCircle size={21} />{unreadCount ? <i>{Math.min(unreadCount, 9)}</i> : null}</motion.button> : null}</AnimatePresence>
      <AnimatePresence>{open ? (
        <motion.section className="chat-panel chat-center" role="dialog" aria-label="Mesaj mərkəzi" drag={canDrag} dragControls={dragControls} dragListener={false} dragMomentum={false} initial={reduceMotion ? false : { opacity: 0, y: 24, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .96 }}>
          <aside className="chat-center-sidebar">
            <header onPointerDown={(event) => canDrag && dragControls.start(event)}><span><MessagesSquare size={18} /></span><div><strong>Mesajlar</strong><small>{conversations.length + groups.length} söhbət</small></div><button type="button" className="chat-new-trigger" aria-label="Yeni söhbət başlat" aria-expanded={contactsOpen} onPointerDown={(event) => event.stopPropagation()} onClick={() => contactsOpen ? setContactsOpen(false) : void openContacts()}><Plus size={18} /></button></header>
            <AnimatePresence>{contactsOpen ? <motion.div className="chat-contact-picker" initial={reduceMotion ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}><header><div><strong>Yeni söhbət</strong><small>Əlaqələrindən birini seç</small></div><button type="button" onClick={() => setContactsOpen(false)} aria-label="Əlaqə siyahısını bağla"><X size={16} /></button></header><div>{contactsLoading ? <p>Əlaqələr yüklənir…</p> : contacts.length ? contacts.map((contact) => <button type="button" key={contact.id} onClick={() => void startContactChat(contact)}><span className={`chat-list-avatar${contact.avatarUrl ? " has-image" : ""}`} style={avatarStyle(contact.avatarUrl)}>{contact.avatarUrl ? null : initials(contact.name)}</span><span><strong>{contact.name}</strong><small>{contact.program || contact.role}</small></span><MessageCircle size={15} /></button>) : <p>Mesaj yaza biləcəyin qəbul edilmiş əlaqə yoxdur.</p>}</div></motion.div> : null}</AnimatePresence>
            <div className="chat-center-tabs"><button type="button" className={tab === "direct" ? "active" : ""} onClick={() => setTab("direct")}>Söhbətlər</button><button type="button" className={tab === "group" ? "active" : ""} onClick={() => setTab("group")}>Klub qrupları</button></div>
            <div className="chat-center-list">
              {tab === "direct" ? conversations.map((conversation) => <button type="button" key={conversation.id} className={active?.conversationId === conversation.id ? "active" : ""} onClick={() => setActive({ kind: "direct", conversationId: conversation.id, peer: apiPeer(conversation.peer), muted: conversation.muted })}><span className={`chat-list-avatar${conversation.peer.avatarUrl ? " has-image" : ""}`} style={avatarStyle(conversation.peer.avatarUrl)}>{conversation.peer.avatarUrl ? null : initials(conversation.peer.name)}</span><span><strong>{conversation.peer.name}</strong><small>{conversation.lastMessage || conversation.peer.program}</small></span>{conversation.muted ? <BellOff className="chat-list-muted" size={13} /> : conversation.unreadCount ? <b>{conversation.unreadCount}</b> : null}</button>) : groups.map((item) => <button type="button" key={item.id} className={active?.conversationId === item.id ? "active" : ""} onClick={() => setActive({ kind: "group", conversationId: item.id, peer: groupPeer(item), group: groupTarget(item), muted: item.muted })}><span className="chat-list-avatar is-group"><UsersRound size={16} /></span><span><strong>{item.club.name}</strong><small>{item.lastMessage || `${item.memberCount} üzv`}</small></span>{item.muted ? <BellOff className="chat-list-muted" size={13} /> : item.isAdmin ? <Crown size={14} /> : item.unreadCount ? <b>{item.unreadCount}</b> : null}</button>)}
              {tab === "direct" && !conversations.length ? <p>Qəbul edilmiş əlaqələrin söhbətləri burada görünəcək.</p> : null}
              {tab === "group" && !groups.length ? <p>Kluba qoşulduqda qrupu burada görəcəksən.</p> : null}
            </div>
          </aside>
          <main className="chat-center-main">
            <button type="button" className="chat-center-close" onClick={() => onOpenChange(false)} aria-label="Mesajları bağla"><X size={19} /></button>
            {active ? <>
              <header className="chat-header" onPointerDown={(event) => canDrag && dragControls.start(event)}><div className="chat-person"><span className={`chat-person-avatar${active.kind === "direct" && active.peer.avatarUrl ? " has-image" : ""}`} style={active.kind === "direct" ? avatarStyle(active.peer.avatarUrl) : undefined}>{active.kind === "group" ? <UsersRound size={17} /> : active.peer.avatarUrl ? null : active.peer.initials}<i className="online" /></span><div><h2>{active.peer.name}</h2><p>{typing ? <span className="chat-status-typing">yazır…</span> : active.kind === "group" ? `${active.group.memberCount} üzv · klub qrupu` : "onlayn"}{active.muted ? " · səssizdədir" : ""}</p></div></div><div ref={menuRef} className="chat-more" onPointerDown={(event) => event.stopPropagation()}><button type="button" className="chat-more-trigger" onClick={() => setMenuOpen((value) => !value)} aria-label="Söhbət seçimləri" aria-haspopup="menu" aria-expanded={menuOpen}><MoreVertical size={18} /></button><AnimatePresence>{menuOpen ? <motion.div className="chat-more-menu" role="menu" initial={reduceMotion ? false : { opacity: 0, y: -6, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: .98 }}><button type="button" role="menuitem" onClick={() => void mute()}>{active.muted ? <Volume2 size={16} /> : <BellOff size={16} />}<span><strong>{active.muted ? "Səsi aktiv et" : "Səssizə al"}</strong><small>{active.muted ? "Yeni bildirişləri yenidən göstər" : "Yeni mesaj bildirişlərini dayandır"}</small></span></button><button type="button" role="menuitem" onClick={() => void report(active.kind === "group" ? "club" : "profile", active.peer.id)}><Flag size={16} /><span><strong>Şikayət et</strong><small>Moderasiya komandasına göndər</small></span></button>{active.kind === "direct" ? <button type="button" role="menuitem" className="is-danger" onClick={() => void block()}><Ban size={16} /><span><strong>İstifadəçini blokla</strong><small>Əlaqəni və yeni mesajları dayandır</small></span></button> : null}</motion.div> : null}</AnimatePresence></div></header>
              <div ref={listRef} className="message-list" data-pattern={conversationPattern(active.conversationId)} role="log" aria-live="polite" onScroll={onListScroll}>
                {loading ? <p className="chat-state">Yüklənir…</p> : null}
                {error ? <p className="form-error" role="alert">{error}</p> : null}
                {feedback ? <p className="chat-feedback" role="status">{feedback}</p> : null}
                {!loading && !error && !messages.length ? <p className="chat-state">İlk mesajı sən yaz.</p> : null}
                <AnimatePresence initial={false}>
                  {rendered.map((entry) => entry.type === "day"
                    ? <div key={entry.key} className="message-day"><span>{entry.label}</span></div>
                    : (() => {
                      const message = entry.message;
                      const own = message.senderId === user?.id;
                      const canDelete = !message.deleted && (own || (active.kind === "group" && active.group.isAdmin));
                      const canEdit = own && !message.deleted;
                      return (
                        <motion.div key={message.id} data-message={message.id} className={`message-row ${own ? "message-own" : "message-peer"}${entry.groupStart ? " group-start" : ""}${entry.groupEnd ? " group-end" : ""}${actionsFor === message.id ? " actions-open" : ""}`} data-deleted={message.deleted ? "true" : undefined} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} layout={reduceMotion ? false : "position"}>
                          {!own ? (entry.groupEnd ? <span className={`message-avatar${message.senderAvatarUrl ? " has-image" : ""}`} style={avatarStyle(message.senderAvatarUrl)}>{message.senderAvatarUrl ? null : message.senderInitials || active.peer.initials}</span> : <span className="message-avatar message-avatar-spacer" aria-hidden="true" />) : null}
                          <div className="message-bubble-wrap">
                            {active.kind === "group" && !own && entry.groupStart ? <strong className="message-sender-name">{message.senderName || "Klub üzvü"}</strong> : null}
                            <div className="message-bubble">
                              {message.replyTo ? <button type="button" className="message-quote" onClick={() => scrollToMessage(message.replyTo!.id)}><span>{message.replyTo.senderName}</span><small>{message.replyTo.deleted ? "Mesaj silindi" : message.replyTo.body}</small></button> : null}
                              <p>{message.body}</p>
                              <span className="message-meta">{message.editedAt && !message.deleted ? <em className="message-edited">redaktə olundu</em> : null}{new Intl.DateTimeFormat("az-AZ", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}{own && message.status ? (message.status === "read" ? <CheckCheck className="tick tick-read" size={13} /> : <Check className="tick" size={12} />) : null}</span>
                              {!message.deleted ? <div className="message-actions"><button type="button" onClick={() => setActionsFor((current) => current === message.id ? null : message.id)} aria-label="Reaksiya seç"><SmilePlus size={14} /></button><button type="button" onClick={() => startReply(message)} aria-label="Cavab yaz"><Reply size={14} /></button>{canEdit ? <button type="button" onClick={() => startEdit(message)} aria-label="Mesajı redaktə et"><Pencil size={13} /></button> : null}{canDelete ? <button type="button" onClick={() => void removeMessage(message.id)} aria-label="Mesajı sil"><Trash2 size={13} /></button> : null}</div> : null}
                              <AnimatePresence>{actionsFor === message.id && !message.deleted ? <motion.div className="reaction-bar" initial={reduceMotion ? false : { opacity: 0, y: 6, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: .9 }}>{REACTIONS.map((emoji) => <button type="button" key={emoji} onClick={() => void toggleReaction(message.id, emoji)} aria-label={`${emoji} reaksiyası`}>{emoji}</button>)}</motion.div> : null}</AnimatePresence>
                            </div>
                            {message.reactions?.length ? <div className={`message-reactions${own ? " own" : ""}`}>{message.reactions.map((reaction) => <button type="button" key={reaction.emoji} className={reaction.mine ? "mine" : ""} onClick={() => void toggleReaction(message.id, reaction.emoji)}><span>{reaction.emoji}</span>{reaction.count > 1 ? <b>{reaction.count}</b> : null}</button>)}</div> : null}
                          </div>
                        </motion.div>
                      );
                    })())}
                  {typing ? <motion.div key="typing" className="typing-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><span className={`message-avatar${active.peer.avatarUrl ? " has-image" : ""}`} style={avatarStyle(active.peer.avatarUrl)}>{active.peer.avatarUrl ? null : active.peer.initials}</span><div className="typing-bubble"><i /><i /><i /></div></motion.div> : null}
                </AnimatePresence>
              </div>
              <AnimatePresence>{!atBottom ? <motion.button type="button" className="chat-scroll-bottom" onClick={() => { setAtBottom(true); scrollToEnd(reduceMotion ? "auto" : "smooth"); }} aria-label="Ən son mesaja keç" initial={reduceMotion ? false : { opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .8 }}><ChevronDown size={18} /></motion.button> : null}</AnimatePresence>
              <form className="chat-composer" onSubmit={(event) => void send(event)}>
                <AnimatePresence>{replyTo || editing ? <motion.div className="composer-context" initial={reduceMotion ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}><div className="composer-context-body"><span>{editing ? "Redaktə" : `Cavab: ${replyTo?.senderName ?? ""}`}</span><small>{editing ? editing.body : replyTo?.deleted ? "Mesaj silindi" : replyTo?.body}</small></div><button type="button" onClick={cancelComposerContext} aria-label="Ləğv et"><X size={15} /></button></motion.div> : null}</AnimatePresence>
                <div className="composer-row">
                  <div className="composer-emoji">
                    <button type="button" className="composer-emoji-trigger" onClick={() => setEmojiOpen((value) => !value)} aria-label="Emoji əlavə et" aria-expanded={emojiOpen}><SmilePlus size={19} /></button>
                    <AnimatePresence>{emojiOpen ? <motion.div className="composer-emoji-panel" initial={reduceMotion ? false : { opacity: 0, y: 8, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: .96 }}>{EMOJIS.map((emoji) => <button type="button" key={emoji} onClick={() => insertEmoji(emoji)}>{emoji}</button>)}</motion.div> : null}</AnimatePresence>
                  </div>
                  <label className="sr-only" htmlFor="chat-message">Mesaj</label>
                  <textarea ref={inputRef} id="chat-message" value={draft} onChange={(event) => changeDraft(event.target.value)} onKeyDown={keyDown} rows={1} maxLength={2000} placeholder={editing ? "Mesajı redaktə et…" : "Mesajını yaz…"} />
                  <button type="submit" disabled={!draft.trim() || !active.conversationId}>{editing ? <Check size={18} /> : <Send size={17} />}</button>
                </div>
                <span className="composer-hint">Enter ilə göndər · Shift + Enter ilə yeni sətir</span>
              </form>
            </> : <div className="chat-center-empty">{feedback ? <p className="chat-feedback" role="status">{feedback}</p> : null}<MessagesSquare size={30} /><h2>Söhbət seç</h2><p>Şəxsi söhbətlər və klub qrupları ayrı siyahılarda saxlanılır.</p></div>}
          </main>
        </motion.section>
      ) : null}</AnimatePresence>
    </div>
  );
}

const EMOJIS = ["😀", "😄", "😁", "😊", "🙂", "😉", "😍", "😘", "😎", "🤩", "🥳", "😜", "🤔", "😐", "😴", "😢", "😭", "😡", "👍", "👎", "👏", "🙏", "💪", "🔥", "✨", "🎉", "❤️", "💚", "💙", "💜", "☕", "📚", "🎓", "⚽", "🎵", "✅"] as const;

type TimelineEntry =
  | { type: "day"; key: string; label: string }
  | { type: "message"; key: string; message: ApiMessage; groupStart: boolean; groupEnd: boolean };

function buildTimeline(messages: ApiMessage[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  let lastDay = "";
  messages.forEach((message, index) => {
    const date = new Date(message.createdAt);
    const dayKey = date.toDateString();
    if (dayKey !== lastDay) {
      entries.push({ type: "day", key: `day-${dayKey}`, label: dayLabel(date) });
      lastDay = dayKey;
    }
    const previous = messages[index - 1];
    const next = messages[index + 1];
    const sameAsPrevious = Boolean(previous) && previous.senderId === message.senderId && new Date(previous.createdAt).toDateString() === dayKey && Math.abs(date.getTime() - new Date(previous.createdAt).getTime()) < 4 * 60 * 1000;
    const sameAsNext = Boolean(next) && next.senderId === message.senderId && new Date(next.createdAt).toDateString() === dayKey && Math.abs(new Date(next.createdAt).getTime() - date.getTime()) < 4 * 60 * 1000;
    entries.push({ type: "message", key: message.id, message, groupStart: !sameAsPrevious, groupEnd: !sameAsNext });
  });
  return entries;
}

function dayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Bu gün";
  if (date.toDateString() === yesterday.toDateString()) return "Dünən";
  return new Intl.DateTimeFormat("az-AZ", { day: "numeric", month: "long", year: date.getFullYear() === today.getFullYear() ? undefined : "numeric" }).format(date);
}

function applyOwnReaction(reactions: ApiReaction[] | undefined, emoji: ReactionEmoji): ApiReaction[] {
  const list = (reactions ?? []).map((reaction) => ({ ...reaction }));
  const mineIndex = list.findIndex((reaction) => reaction.mine);
  if (mineIndex >= 0 && list[mineIndex].emoji === emoji) {
    list[mineIndex].count -= 1;
    list[mineIndex].mine = false;
    return list.filter((reaction) => reaction.count > 0);
  }
  if (mineIndex >= 0) { list[mineIndex].count -= 1; list[mineIndex].mine = false; }
  const target = list.find((reaction) => reaction.emoji === emoji);
  if (target) { target.count += 1; target.mine = true; } else list.push({ emoji, count: 1, mine: true });
  return list.filter((reaction) => reaction.count > 0);
}

function mergeReactions(current: ApiReaction[] | undefined, incoming: ApiReaction[]): ApiReaction[] | undefined {
  const mineEmoji = current?.find((reaction) => reaction.mine)?.emoji;
  const merged = incoming.map((reaction) => ({ ...reaction, mine: reaction.emoji === mineEmoji }));
  return merged.length ? merged : undefined;
}

function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("az")).join(""); }
function apiPeer(peer: ApiConversation["peer"]): Peer { return { id: peer.id, name: peer.name, initials: initials(peer.name), role: peer.role, focus: peer.program, bio: "", city: peer.city, status: "online", accent: "#8fc15f", glow: "rgba(143,193,95,.28)", mutuals: 0, tags: [], openingMessage: "", reply: "", avatarUrl: peer.avatarUrl }; }
function groupTarget(item: ApiGroup): ClubChatTarget { return { conversationId: item.id, clubId: item.club.id, name: item.club.name, initials: initials(item.club.name), memberCount: item.memberCount, isAdmin: item.isAdmin }; }
function groupPeer(item: ApiGroup): Peer { return { id: item.club.id, name: item.club.name, initials: initials(item.club.name), role: "Klub qrupu", focus: `${item.memberCount} üzv`, bio: "", city: "", status: "online", accent: "#44766c", glow: "rgba(68,118,108,.28)", mutuals: 0, tags: [], openingMessage: "", reply: "" }; }
function conversationPattern(id?: string) { return String([...(id ?? "edurate")].reduce((total, character) => total + character.charCodeAt(0), 0) % 3); }
function avatarStyle(url?: string): CSSProperties | undefined { return url ? { backgroundImage: `url("${url}")`, "--avatar-image": `url("${url}")` } as CSSProperties : undefined; }
