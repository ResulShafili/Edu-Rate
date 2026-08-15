"use client";
/* eslint-disable react-hooks/set-state-in-effect -- the authenticated directory refresh is effect-driven */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, MapPin, MessageCircle, RefreshCw, UserPlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Peer } from "../data/peers";

type Props = { canInteract: boolean; currentUserId?: string; onMessage: (peer: Peer) => void; onRequireAuth: () => void };
type ApiUser = { id: string; name: string; role: string; faculty: string; program: string; city: string };
type Connection = { id: string; requesterId: string; recipientId: string; status: "pending" | "accepted" | "blocked" };
type ApiConversation = { id: string; peer: ApiUser; lastMessage: string; updatedAt: string; unreadCount: number };

const colors = [
  ["#b9a7ff", "rgba(185,167,255,.34)"],
  ["#c8ff4d", "rgba(200,255,77,.3)"],
  ["#77b8ff", "rgba(119,184,255,.32)"],
  ["#7de5d1", "rgba(125,229,209,.3)"],
];

function PeerSkeleton() {
  return <div className="peer-skeleton" aria-hidden="true"><div className="skeleton-topline" /><div className="skeleton-avatar" /><div className="skeleton-line skeleton-line-wide" /><div className="skeleton-line skeleton-line-short" /><div className="skeleton-copy" /><div className="skeleton-tags"><span /><span /></div></div>;
}

function toPeer(user: ApiUser, index: number): Peer {
  const [accent, glow] = colors[index % colors.length];
  return {
    id: user.id,
    name: user.name,
    initials: user.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("az")).join(""),
    role: roleLabel(user.role),
    focus: user.program,
    bio: user.faculty,
    city: user.city,
    status: "online",
    accent,
    glow,
    mutuals: 0,
    tags: [user.faculty, user.program].filter(Boolean).slice(0, 2),
    openingMessage: "",
    reply: "",
  };
}

export function PeerDirectory({ canInteract, currentUserId, onMessage, onRequireAuth }: Props) {
  const [loading, setLoading] = useState(true);
  const [directory, setDirectory] = useState<Peer[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [error, setError] = useState("");
  const [actionPeerId, setActionPeerId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (!canInteract) {
        setDirectory([]);
        setConnections([]);
        setConversations([]);
        return;
      }
      const [usersResponse, connectionsResponse, conversationsResponse] = await Promise.all([
        fetch("/api/community/users", { cache: "no-store" }),
        fetch("/api/community/connections", { cache: "no-store" }),
        fetch("/api/community/conversations", { cache: "no-store" }),
      ]);
      const users = await usersResponse.json() as { data?: ApiUser[]; error?: { message?: string } };
      const links = await connectionsResponse.json() as { data?: Connection[]; error?: { message?: string } };
      const chats = await conversationsResponse.json() as { data?: ApiConversation[]; error?: { message?: string } };
      if (!usersResponse.ok || !connectionsResponse.ok || !conversationsResponse.ok) {
        throw new Error(users.error?.message || links.error?.message || chats.error?.message || "İcma yüklənmədi.");
      }
      setDirectory((users.data ?? []).map(toPeer));
      setConnections(links.data ?? []);
      setConversations(chats.data ?? []);
    } catch (value) {
      setError(value instanceof Error ? value.message : "İcma yüklənmədi.");
    } finally {
      setLoading(false);
    }
  }, [canInteract]);

  useEffect(() => { void load(); }, [load]);

  const acceptedPeers = useMemo(() => directory.filter((peer) => connections.some((item) => item.status === "accepted" && (item.requesterId === peer.id || item.recipientId === peer.id))), [connections, directory]);
  const conversationsByPeer = useMemo(() => new Map(conversations.map((conversation) => [conversation.peer.id, conversation])), [conversations]);

  async function updateConnection(peerId: string) {
    if (!canInteract) { onRequireAuth(); return; }
    const current = connections.find((item) => item.requesterId === peerId || item.recipientId === peerId);
    if (current?.status === "accepted" || current?.status === "blocked") return;
    const outgoing = current?.status === "pending" && current.requesterId === currentUserId;
    const method = outgoing ? "DELETE" : current ? "PATCH" : "POST";
    const path = current ? `/api/community/connections/${current.id}` : "/api/community/connections";
    const hasBody = method === "POST" || method === "PATCH";
    setActionPeerId(peerId);
    setError("");
    try {
      const response = await fetch(path, {
        method,
        headers: hasBody ? { "content-type": "application/json" } : undefined,
        body: method === "POST" ? JSON.stringify({ userId: peerId }) : method === "PATCH" ? JSON.stringify({}) : undefined,
      });
      if (!response.ok) {
        const failed = await response.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new Error(failed?.error?.message ?? "Əlaqə yenilənmədi.");
      }
      if (method === "DELETE") {
        setConnections((items) => items.filter((item) => item.id !== current?.id));
        window.dispatchEvent(new CustomEvent("edurate:connections-changed"));
        return;
      }
      const payload = await response.json() as { data: Connection };
      setConnections((items) => [...items.filter((item) => item.id !== payload.data.id), payload.data]);
      window.dispatchEvent(new CustomEvent("edurate:connections-changed"));
    } catch (value) {
      setError(value instanceof Error ? value.message : "Əlaqə yenilənmədi.");
    } finally {
      setActionPeerId(null);
    }
  }

  return (
    <section id="peers" className="peers-section route-module-section" aria-labelledby="peers-title">
      <motion.div className="peers-heading" initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div><span className="section-kicker section-kicker-dark">Tələbə şəbəkəsi</span><h1 id="peers-title" className="module-page-title">İcma</h1></div>
        <div className="peers-heading-aside"><button type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={14} className={loading ? "is-spinning" : ""} /> Yenilə</button></div>
      </motion.div>

      {canInteract ? (
        <section className="community-chat-hub" aria-labelledby="community-chat-title">
          <header><span><MessageCircle size={18} aria-hidden="true" /></span><div><h2 id="community-chat-title">Mesajlar</h2><p>Əlaqədə olduğun insanlarla söhbətlər</p></div></header>
          {loading ? (
            <div className="community-chat-skeleton" aria-label="Söhbətlər yüklənir"><i /><i /><i /></div>
          ) : acceptedPeers.length ? (
            <div className="community-chat-list">
              {acceptedPeers.map((peer) => {
                const conversation = conversationsByPeer.get(peer.id);
                return (
                  <button key={peer.id} type="button" onClick={() => onMessage(peer)}>
                    <span className="community-chat-avatar">{peer.initials}</span>
                    <span className="community-chat-copy"><strong>{peer.name}</strong><small>{conversation?.lastMessage || "Söhbəti başlat"}</small></span>
                    {conversation?.unreadCount ? <b aria-label={`${conversation.unreadCount} oxunmamış mesaj`}>{conversation.unreadCount}</b> : <MessageCircle size={16} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="community-chat-empty">Əlaqə sorğusu qəbul edildikdə söhbətlər burada görünəcək.</p>
          )}
        </section>
      ) : null}

      <div className="directory-meta"><span><i />{directory.length} aktiv istifadəçi</span></div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {!canInteract && !loading ? <div className="empty-state"><h2>İcmaya qoşul</h2><p>Real istifadəçiləri görmək və əlaqə qurmaq üçün hesabına daxil ol.</p><button type="button" className="kuds-primary-button" onClick={onRequireAuth}>Daxil ol</button></div> : null}
      <div className="peers-grid" aria-busy={loading}>
        <AnimatePresence mode="popLayout">
          {loading ? Array.from({ length: 4 }, (_, index) => <PeerSkeleton key={index} />) : directory.map((peer, index) => {
            const connection = connections.find((item) => item.requesterId === peer.id || item.recipientId === peer.id);
            const accepted = connection?.status === "accepted";
            const blocked = connection?.status === "blocked";
            const incoming = connection?.status === "pending" && connection.recipientId === currentUserId;
            const outgoing = connection?.status === "pending" && connection.requesterId === currentUserId;
            const actionPending = actionPeerId === peer.id;
            return (
              <motion.article layout key={peer.id} className="peer-card" style={{ "--peer-accent": peer.accent, "--peer-glow": peer.glow } as CSSProperties} initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.42, delay: index * 0.03 }}>
                <div className="peer-card-topline"><span className="peer-status online"><i />onlayn</span><span>Real hesab</span></div>
                <div className="peer-avatar" aria-hidden="true"><span>{peer.initials}</span><i className="peer-avatar-orbit" /></div>
                <div className="peer-identity"><h3>{peer.name}</h3><p>{peer.role} · {peer.focus}</p></div>
                <p className="peer-bio">{peer.bio}</p>
                <div className="peer-tags">{peer.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <div className="peer-location"><MapPin size={12} />{peer.city}</div>
                <div className="peer-actions">
                  <button type="button" className={accepted || outgoing ? "is-connected" : ""} disabled={accepted || blocked || actionPending} aria-busy={actionPending} title={outgoing ? "Sorğunu geri çək" : undefined} onClick={() => void updateConnection(peer.id)}>
                    {accepted ? <Check size={14} /> : <UserPlus size={14} />}{actionPending ? outgoing ? "Geri çəkilir…" : "Göndərilir…" : accepted ? "Əlaqədəsiniz" : blocked ? "Əlaqə məhdudlaşdırılıb" : incoming ? "Qəbul et" : outgoing ? "Sorğunu geri çək" : "Əlaqə qur"}
                  </button>
                  <button type="button" className="peer-message" disabled={!accepted} title={!accepted ? "Əvvəlcə əlaqə qəbul edilməlidir" : undefined} onClick={() => onMessage(peer)}><MessageCircle size={14} />Mesaj yaz</button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

function roleLabel(role: string) {
  return ({ student: "Tələbə", teacher: "Müəllim", mentor: "Mentor", assistant_admin: "Admin köməkçisi", admin: "Administrator" } as Record<string, string>)[role] ?? role;
}
