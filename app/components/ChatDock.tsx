"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- remote chat hydration and external target synchronization are intentionally effect-driven */

import { AnimatePresence, motion, useDragControls, useReducedMotion } from "framer-motion";
import { Ban, BellOff, Check, Crown, Flag, MessageCircle, MessagesSquare, MoreVertical, Send, Trash2, UsersRound, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from "react";
import { io, type Socket } from "socket.io-client";
import type { Peer } from "../data/peers";
import { useAuth } from "./AuthProvider";
import type { ClubChatTarget } from "./PlatformProvider";
import { useCurrentAvatar } from "../lib/current-avatar";

type ApiMessage = { id: string; conversationId: string; senderId: string; senderName?: string; senderInitials?: string; senderAvatarUrl?:string; body: string; createdAt: string; deleted?:boolean };
type ApiConversation = { id: string; peer: { id: string; name: string; role: string; faculty: string; program: string; city: string; avatarUrl?:string }; lastMessage: string; updatedAt: string; unreadCount: number; muted:boolean };
type ApiGroup = { id: string; kind: "club"; club: { id: string; slug: string; name: string }; memberCount: number; isAdmin: boolean; lastMessage: string; updatedAt: string; unreadCount: number; muted:boolean };
type ActiveChat = { kind: "direct"; conversationId?: string; peer: Peer; muted:boolean } | { kind: "group"; conversationId: string; peer: Peer; group: ClubChatTarget; muted:boolean };
type Props = { peer?: Peer | null; group?: ClubChatTarget | null; open: boolean; onOpenChange: (open: boolean) => void };

export function ChatDock({ peer, group, open, onOpenChange }: Props) {
  const { user } = useAuth();
  const currentAvatar=useCurrentAvatar(user?.id);
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
  const [canDrag, setCanDrag] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimer = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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
      setActive({ kind: "group", conversationId: group.conversationId, peer, group, muted:false });
    } else {
      setTab("direct");
      setActive({ kind: "direct", peer, muted:false });
    }
  }, [group, peer]);

  useEffect(() => {
    setMenuOpen(false);
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
          socket.on("message:new", (message: ApiMessage) => message.conversationId === id && setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]));
          socket.on("message:deleted", (payload: { conversationId: string; messageId: string }) => payload.conversationId === id && setMessages((current) => current.map((item) => item.id===payload.messageId?{...item,body:"Mesaj silindi",deleted:true}:item)));
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

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" }));
  }, [messages, typing, open, reduceMotion]);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const body = draft.trim();
    const id = active?.conversationId;
    if (!body || !id) return;
    setDraft("");
    socketRef.current?.emit("typing", { conversationId: id, active: false });
    const response = await fetch(`/api/community/conversations/${id}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body }) });
    const payload = await response.json() as { data?: ApiMessage; error?: { message?: string } };
    if (!response.ok || !payload.data) { setDraft(body); setError(payload.error?.message ?? "Mesaj göndərilmədi."); return; }
    setMessages((current) => current.some((item) => item.id === payload.data!.id) ? current : [...current, payload.data!]);
    void refreshDirectory();
  }

  async function removeMessage(messageId: string) {
    const id = active?.conversationId;
    if (!id) return;
    const response = await fetch(`/api/community/conversations/${id}/messages/${messageId}`, { method: "DELETE" });
    if (!response.ok) { setError("Mesaj silinmədi."); return; }
    setMessages((current) => current.map((message) => message.id===messageId?{...message,body:"Mesaj silindi",deleted:true}:message));
    void refreshDirectory();
  }

  async function report(entityType:"message"|"profile"|"club",entityId:string){setMenuOpen(false);setError("");const response=await fetch("/api/community/reports",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({entityType,entityId,reason:"abuse",details:"İstifadəçi tərəfindən yoxlanılması istənildi."})});if(response.ok)setFeedback("Şikayət moderasiya komandasına göndərildi.");else setError("Şikayət göndərilmədi.");}
  async function mute(){if(!active?.conversationId)return;setMenuOpen(false);setError("");const muted=!active.muted;const response=await fetch(`/api/community/conversations/${active.conversationId}/mute`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({muted})});if(!response.ok){setError("Bildiriş seçimi dəyişdirilmədi.");return;}setActive((current)=>current?{...current,muted}:current);setConversations((items)=>items.map((item)=>item.id===active.conversationId?{...item,muted}:item));setGroups((items)=>items.map((item)=>item.id===active.conversationId?{...item,muted}:item));setFeedback(muted?"Söhbətin bildirişləri səssizə alındı.":"Söhbətin bildirişləri yenidən aktiv edildi.");}
  async function block(){if(!active||active.kind!=="direct")return;setMenuOpen(false);setError("");const blockedConversationId=active.conversationId;const response=await fetch("/api/community/blocks",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({userId:active.peer.id})});if(!response.ok){setError("İstifadəçi bloklanmadı.");return;}if(blockedConversationId)setConversations((items)=>items.filter((item)=>item.id!==blockedConversationId));setActive(null);setMessages([]);setFeedback("İstifadəçi bloklandı və söhbət siyahıdan çıxarıldı.");void refreshDirectory();}

  function changeDraft(value: string) {
    setDraft(value);
    if (!active?.conversationId) return;
    socketRef.current?.emit("typing", { conversationId: active.conversationId, active: Boolean(value.trim()) });
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => socketRef.current?.emit("typing", { conversationId: active.conversationId, active: false }), 1200);
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); }
  }

  const unreadCount = conversations.reduce((sum, item) => sum + item.unreadCount, 0) + groups.reduce((sum, item) => sum + item.unreadCount, 0);
  const accent = active?.peer.accent ?? "#8fc15f";
  const glow = active?.peer.glow ?? "rgba(143,193,95,.28)";

  return (
    <div className="chat-dock" style={{ "--peer-accent": accent, "--peer-glow": glow } as CSSProperties}>
      <AnimatePresence>{!open ? <motion.button id="chat-launcher" type="button" className={`chat-launcher${currentAvatar.data?.secureUrl?" has-avatar":""}`} style={currentAvatar.data?.secureUrl?{...avatarStyle(currentAvatar.data.secureUrl),"--peer-accent":accent,"--peer-glow":glow} as CSSProperties:undefined} aria-label="Mesajları aç" onClick={() => onOpenChange(true)} initial={reduceMotion ? false : { opacity: 0, scale: .85, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .85 }}><span className="launcher-pulse" />{currentAvatar.data?.secureUrl?<span className="launcher-message-mark"><MessageCircle size={12}/></span>:<MessageCircle size={21} />}{unreadCount ? <i>{Math.min(unreadCount, 9)}</i> : null}</motion.button> : null}</AnimatePresence>
      <AnimatePresence>{open ? (
        <motion.section className="chat-panel chat-center" role="dialog" aria-label="Mesaj mərkəzi" drag={canDrag} dragControls={dragControls} dragListener={false} dragMomentum={false} initial={reduceMotion ? false : { opacity: 0, y: 24, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .96 }}>
          <aside className="chat-center-sidebar">
            <header onPointerDown={(event) => canDrag && dragControls.start(event)}><span><MessagesSquare size={18} /></span><div><strong>Mesajlar</strong><small>{conversations.length + groups.length} söhbət</small></div></header>
            <div className="chat-center-tabs"><button type="button" className={tab === "direct" ? "active" : ""} onClick={() => setTab("direct")}>Söhbətlər</button><button type="button" className={tab === "group" ? "active" : ""} onClick={() => setTab("group")}>Klub qrupları</button></div>
            <div className="chat-center-list">
              {tab === "direct" ? conversations.map((conversation) => <button type="button" key={conversation.id} className={active?.conversationId === conversation.id ? "active" : ""} onClick={() => setActive({ kind: "direct", conversationId: conversation.id, peer: apiPeer(conversation.peer), muted:conversation.muted })}><span className={`chat-list-avatar${conversation.peer.avatarUrl?" has-image":""}`} style={avatarStyle(conversation.peer.avatarUrl)}>{conversation.peer.avatarUrl?null:initials(conversation.peer.name)}</span><span><strong>{conversation.peer.name}</strong><small>{conversation.lastMessage || conversation.peer.program}</small></span>{conversation.muted?<BellOff className="chat-list-muted" size={13}/>:conversation.unreadCount ? <b>{conversation.unreadCount}</b> : null}</button>) : groups.map((item) => <button type="button" key={item.id} className={active?.conversationId === item.id ? "active" : ""} onClick={() => setActive({ kind: "group", conversationId: item.id, peer: groupPeer(item), group: groupTarget(item), muted:item.muted })}><span className="chat-list-avatar is-group"><UsersRound size={16} /></span><span><strong>{item.club.name}</strong><small>{item.lastMessage || `${item.memberCount} üzv`}</small></span>{item.muted?<BellOff className="chat-list-muted" size={13}/>:item.isAdmin ? <Crown size={14} /> : item.unreadCount ? <b>{item.unreadCount}</b> : null}</button>)}
              {tab === "direct" && !conversations.length ? <p>Qəbul edilmiş əlaqələrin söhbətləri burada görünəcək.</p> : null}
              {tab === "group" && !groups.length ? <p>Kluba qoşulduqda qrupu burada görəcəksən.</p> : null}
            </div>
          </aside>
          <main className="chat-center-main">
            <button type="button" className="chat-center-close" onClick={() => onOpenChange(false)} aria-label="Mesajları bağla"><X size={19} /></button>
            {active ? <>
              <header className="chat-header" onPointerDown={(event) => canDrag && dragControls.start(event)}><div className="chat-person"><span className={`chat-person-avatar${active.kind==="direct"&&active.peer.avatarUrl?" has-image":""}`} style={active.kind==="direct"?avatarStyle(active.peer.avatarUrl):undefined}>{active.kind === "group" ? <UsersRound size={17} /> : active.peer.avatarUrl?null:active.peer.initials}<i className="online" /></span><div><h2>{active.peer.name}</h2><p>{active.kind === "group" ? `${active.group.memberCount} üzv · klub qrupu` : active.peer.role}{active.muted?" · səssizdədir":""}</p></div></div><div ref={menuRef} className="chat-more" onPointerDown={(event)=>event.stopPropagation()}><button type="button" className="chat-more-trigger" onClick={()=>setMenuOpen((value)=>!value)} aria-label="Söhbət seçimləri" aria-haspopup="menu" aria-expanded={menuOpen}><MoreVertical size={18}/></button><AnimatePresence>{menuOpen?<motion.div className="chat-more-menu" role="menu" initial={reduceMotion?false:{opacity:0,y:-6,scale:.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-4,scale:.98}}><button type="button" role="menuitem" onClick={()=>void mute()}>{active.muted?<Volume2 size={16}/>:<BellOff size={16}/>}<span><strong>{active.muted?"Səsi aktiv et":"Səssizə al"}</strong><small>{active.muted?"Yeni bildirişləri yenidən göstər":"Yeni mesaj bildirişlərini dayandır"}</small></span></button><button type="button" role="menuitem" onClick={()=>void report(active.kind==="group"?"club":"profile",active.peer.id)}><Flag size={16}/><span><strong>Şikayət et</strong><small>Moderasiya komandasına göndər</small></span></button>{active.kind==="direct"?<button type="button" role="menuitem" className="is-danger" onClick={()=>void block()}><Ban size={16}/><span><strong>İstifadəçini blokla</strong><small>Əlaqəni və yeni mesajları dayandır</small></span></button>:null}</motion.div>:null}</AnimatePresence></div></header>
              <div ref={listRef} className="message-list" data-pattern={conversationPattern(active.conversationId)} role="log" aria-live="polite"><div className="message-day"><span>Mesajlar</span></div>{loading ? <p className="chat-state">Yüklənir…</p> : null}{error ? <p className="form-error" role="alert">{error}</p> : null}{feedback ? <p className="chat-feedback" role="status">{feedback}</p> : null}{!loading && !error && !messages.length ? <p className="chat-state">İlk mesajı sən yaz.</p> : null}<AnimatePresence initial={false}>{messages.map((message) => { const own = message.senderId === user?.id; const canDelete = !message.deleted && (own || (active.kind === "group" && active.group.isAdmin)); return <motion.div key={message.id} className={`message-row ${own ? "message-own" : "message-peer"}`} data-deleted={message.deleted?"true":undefined} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{!own ? <span className={`message-avatar${message.senderAvatarUrl?" has-image":""}`} style={avatarStyle(message.senderAvatarUrl)}>{message.senderAvatarUrl?null:message.senderInitials || active.peer.initials}</span> : null}<div>{active.kind === "group" && !own ? <strong className="message-sender-name">{message.senderName || "Klub üzvü"}</strong> : null}<p>{message.body}</p><span>{new Intl.DateTimeFormat("az-AZ", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}{own ? <Check size={11} /> : null}{canDelete ? <button type="button" className="message-delete" onClick={() => void removeMessage(message.id)} aria-label="Mesajı sil"><Trash2 size={11} /></button> : null}</span></div></motion.div>; })}{typing ? <motion.div className="typing-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className={`message-avatar${active.peer.avatarUrl?" has-image":""}`} style={avatarStyle(active.peer.avatarUrl)}>{active.peer.avatarUrl?null:active.peer.initials}</span><div className="typing-bubble"><i /><i /><i /></div></motion.div> : null}</AnimatePresence></div>
              <form className="chat-composer" onSubmit={(event) => void send(event)}><label className="sr-only" htmlFor="chat-message">Mesaj</label><textarea id="chat-message" value={draft} onChange={(event) => changeDraft(event.target.value)} onKeyDown={keyDown} rows={1} maxLength={2000} placeholder="Mesajını yaz…" /><button type="submit" disabled={!draft.trim() || !active.conversationId}><Send size={17} /></button><span className="composer-hint">Enter ilə göndər · Shift + Enter ilə yeni sətir</span></form>
            </> : <div className="chat-center-empty">{feedback ? <p className="chat-feedback" role="status">{feedback}</p> : null}<MessagesSquare size={30} /><h2>Söhbət seç</h2><p>Şəxsi söhbətlər və klub qrupları ayrı siyahılarda saxlanılır.</p></div>}
          </main>
        </motion.section>
      ) : null}</AnimatePresence>
    </div>
  );
}

function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("az")).join(""); }
function apiPeer(peer: ApiConversation["peer"]): Peer { return { id: peer.id, name: peer.name, initials: initials(peer.name), role: peer.role, focus: peer.program, bio: "", city: peer.city, status: "online", accent: "#8fc15f", glow: "rgba(143,193,95,.28)", mutuals: 0, tags: [], openingMessage: "", reply: "",avatarUrl:peer.avatarUrl }; }
function groupTarget(item: ApiGroup): ClubChatTarget { return { conversationId: item.id, clubId: item.club.id, name: item.club.name, initials: initials(item.club.name), memberCount: item.memberCount, isAdmin: item.isAdmin }; }
function groupPeer(item: ApiGroup): Peer { return { id: item.club.id, name: item.club.name, initials: initials(item.club.name), role: "Klub qrupu", focus: `${item.memberCount} üzv`, bio: "", city: "", status: "online", accent: "#44766c", glow: "rgba(68,118,108,.28)", mutuals: 0, tags: [], openingMessage: "", reply: "" }; }
function conversationPattern(id?:string){return String([...(id??"edurate")].reduce((total,character)=>total+character.charCodeAt(0),0)%3);}
function avatarStyle(url?:string):CSSProperties|undefined{return url?{backgroundImage:`url("${url}")`,"--avatar-image":`url("${url}")`} as CSSProperties:undefined;}
