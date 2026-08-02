"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, MapPin, MessageCircle, RefreshCw, UserPlus } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { peers, type Peer } from "../data/peers";

const statusLabels: Record<Peer["status"], string> = {
  online: "onlayn",
  away: "fasilədə",
  offline: "oflayn",
};

type PeerDirectoryProps = {
  canInteract: boolean;
  onMessage: (peer: Peer) => void;
  onRequireAuth: () => void;
};

function PeerSkeleton() {
  return (
    <div className="peer-skeleton" aria-hidden="true">
      <div className="skeleton-topline" />
      <div className="skeleton-avatar" />
      <div className="skeleton-line skeleton-line-wide" />
      <div className="skeleton-line skeleton-line-short" />
      <div className="skeleton-copy" />
      <div className="skeleton-tags"><span /><span /></div>
    </div>
  );
}

export function PeerDirectory({ canInteract, onMessage, onRequireAuth }: PeerDirectoryProps) {
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [connected, setConnected] = useState<Set<string>>(() => new Set());
  const refreshTimerRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1150);
    return () => {
      window.clearTimeout(timer);
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const orderedPeers = [...peers.slice(offset), ...peers.slice(0, offset)];

  function refreshDirectory() {
    setLoading(true);
    if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = window.setTimeout(() => {
      setOffset((current) => (current + 3) % peers.length);
      setLoading(false);
    }, reduceMotion ? 80 : 720);
  }

  function toggleConnection(peerId: string) {
    if (!canInteract) {
      onRequireAuth();
      return;
    }
    setConnected((current) => {
      const next = new Set(current);
      if (next.has(peerId)) next.delete(peerId);
      else next.add(peerId);
      return next;
    });
  }

  return (
    <section id="peers" className="peers-section route-module-section" aria-labelledby="peers-title">
      <motion.div
        className="peers-heading"
        initial={reduceMotion ? false : { opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <span className="section-kicker section-kicker-dark">Tələbə şəbəkəsi</span>
          <h1 id="peers-title" className="module-page-title">İcma</h1>
        </div>
        <div className="peers-heading-aside">
          <button type="button" onClick={refreshDirectory} disabled={loading}>
            <RefreshCw size={14} className={loading ? "is-spinning" : ""} />
            Yeni üzlər
          </button>
        </div>
      </motion.div>

      <div className="directory-meta">
        <span><i /> Bu həftə 2 418 icma üzvü aktivdir</span>
      </div>

      <div
        className="peers-grid"
        aria-busy={loading}
        aria-label={loading ? "İcma kataloqu yüklənir" : "İcma kataloqu"}
      >
        <span className="sr-only" role="status">
          {loading ? "Sənin üçün uyğun insanlar tapılır" : "İcma kataloqu yükləndi"}
        </span>
        <AnimatePresence mode="popLayout">
          {loading
            ? Array.from({ length: 8 }, (_, index) => <PeerSkeleton key={`skeleton-${index}`} />)
            : orderedPeers.map((peer, index) => {
                const isConnected = connected.has(peer.id);
                return (
                  <motion.article
                    layout
                    layoutId={`peer-card-${peer.id}`}
                    key={peer.id}
                    className="peer-card"
                    style={{
                      "--peer-accent": peer.accent,
                      "--peer-glow": peer.glow,
                    } as CSSProperties}
                    initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.48, delay: index * 0.035, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="peer-card-topline">
                      <span className={`peer-status ${peer.status}`}><i />{statusLabels[peer.status]}</span>
                      <span>{String(peer.mutuals).padStart(2, "0")} ortaq tanış</span>
                    </div>

                    <div className="peer-avatar" aria-hidden="true">
                      <span>{peer.initials}</span>
                      <i className="peer-avatar-orbit" />
                    </div>

                    <div className="peer-identity">
                      <h3>{peer.name}</h3>
                      <p>{peer.role} · {peer.focus}</p>
                    </div>

                    <p className="peer-bio">{peer.bio}</p>

                    <div className="peer-tags">
                      {peer.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>

                    <div className="peer-location">
                      <MapPin size={12} /> {peer.city}
                    </div>

                    <div className="peer-actions">
                      <button
                        type="button"
                        className={isConnected ? "is-connected" : ""}
                        onClick={() => toggleConnection(peer.id)}
                        aria-pressed={isConnected}
                      >
                        {isConnected ? <Check size={14} /> : <UserPlus size={14} />}
                        {canInteract ? (isConnected ? "Əlaqədəsiniz" : "Əlaqə qur") : "Giriş et"}
                      </button>
                      <button type="button" className="peer-message" onClick={() => onMessage(peer)}>
                        <MessageCircle size={14} /> Mesaj yaz
                      </button>
                    </div>
                  </motion.article>
                );
              })}
        </AnimatePresence>
      </div>
    </section>
  );
}
