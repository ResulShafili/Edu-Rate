"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BellOff,
  Check,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { Peer } from "../data/peers";

type ChatMessage = {
  id: string;
  author: "me" | "peer";
  text: string;
  time: string;
  status?: "sent" | "read";
};

type ChatDockProps = {
  peer: Peer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function starterMessages(peer: Peer): ChatMessage[] {
  return [
    {
      id: `${peer.id}-hello`,
      author: "peer",
      text: peer.openingMessage,
      time: "09:42",
    },
    {
      id: `${peer.id}-reply`,
      author: "me",
      text: "Əlbəttə — söhbətimizi davam etdirməyi mən də istəyirdim.",
      time: "09:46",
      status: "read",
    },
  ];
}

function TypingIndicator({ peer }: { peer: Peer }) {
  return (
    <motion.div
      className="typing-row"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      aria-label={`${peer.name} yazır`}
    >
      <span className="message-avatar" style={{ "--peer-accent": peer.accent } as CSSProperties}>
        {peer.initials}
      </span>
      <div className="typing-bubble" aria-hidden="true">
        <i /><i /><i />
      </div>
    </motion.div>
  );
}

export function ChatDock({ peer, open, onOpenChange }: ChatDockProps) {
  const [draft, setDraft] = useState("");
  const [typingPeerId, setTypingPeerId] = useState<string | null>(null);
  const [settingsPeerId, setSettingsPeerId] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [compact, setCompact] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [messagesByPeer, setMessagesByPeer] = useState<Record<string, ChatMessage[]>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<number | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const stickToBottomRef = useRef(true);
  const lastScrolledPeerRef = useRef(peer.id);
  const reduceMotion = useReducedMotion();

  const messages = messagesByPeer[peer.id] ?? starterMessages(peer);
  const isTyping = typingPeerId === peer.id;
  const settingsOpen = settingsPeerId === peer.id;

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => composerRef.current?.focus(), reduceMotion ? 0 : 360);
    return () => {
      window.clearTimeout(focusTimer);
      previousFocusRef.current?.focus();
    };
  }, [open, reduceMotion]);

  useEffect(() => {
    if (lastScrolledPeerRef.current !== peer.id) {
      lastScrolledPeerRef.current = peer.id;
      stickToBottomRef.current = true;
    }
    if (!open || !stickToBottomRef.current) return;
    const list = listRef.current;
    if (!list) return;
    window.requestAnimationFrame(() => {
      list.scrollTo({
        top: list.scrollHeight,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }, [messages.length, isTyping, open, peer.id, reduceMotion]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (settingsOpen && !settingsRef.current?.contains(event.target as Node)) {
        setSettingsPeerId(null);
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (settingsOpen) setSettingsPeerId(null);
      else if (open) onOpenChange(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange, open, settingsOpen]);

  useEffect(() => () => {
    if (replyTimerRef.current) window.clearTimeout(replyTimerRef.current);
  }, []);

  function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const newMessage: ChatMessage = {
      id: `${peer.id}-${Date.now()}`,
      author: "me",
      text,
      time: new Intl.DateTimeFormat("az-AZ", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()),
      status: "sent",
    };

    stickToBottomRef.current = true;
    setMessagesByPeer((current) => ({
      ...current,
      [peer.id]: [...(current[peer.id] ?? starterMessages(peer)), newMessage],
    }));
    setDraft("");
    setTypingPeerId(peer.id);

    if (replyTimerRef.current) window.clearTimeout(replyTimerRef.current);
    const activePeer = peer;
    replyTimerRef.current = window.setTimeout(() => {
      const reply: ChatMessage = {
        id: `${activePeer.id}-auto-${Date.now()}`,
        author: "peer",
        text: activePeer.reply,
        time: new Intl.DateTimeFormat("az-AZ", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()),
      };
      setMessagesByPeer((current) => ({
        ...current,
        [activePeer.id]: [...(current[activePeer.id] ?? starterMessages(activePeer)), reply],
      }));
      setTypingPeerId(null);
    }, reduceMotion ? 450 : 1650);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      sendMessage();
    }
  }

  function handleScroll() {
    const list = listRef.current;
    if (!list) return;
    stickToBottomRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 72;
  }

  function clearConversation() {
    setMessagesByPeer((current) => ({ ...current, [peer.id]: [] }));
    setSettingsPeerId(null);
  }

  return (
    <div className="chat-dock" style={{ "--peer-accent": peer.accent, "--peer-glow": peer.glow } as CSSProperties}>
      <AnimatePresence>
        {!open && (
          <motion.button
            id="chat-launcher"
            type="button"
            className="chat-launcher"
            aria-label={`${peer.name} ilə söhbəti aç`}
            aria-expanded="false"
            aria-controls="edurate-chat-panel"
            onClick={() => onOpenChange(true)}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.8, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.82, y: 10 }}
            whileHover={reduceMotion ? undefined : { scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="launcher-pulse" />
            <MessageCircle size={21} />
            <i>1</i>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            id="edurate-chat-panel"
            className={`chat-panel ${compact ? "is-compact" : ""}`}
            role="dialog"
            aria-label={`${peer.name} ilə söhbət`}
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.94, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.72 }}
          >
            <div className="chat-panel-glow" aria-hidden="true" />
            <header className="chat-header">
              <div className="chat-person">
                <span className="chat-person-avatar">{peer.initials}<i className={peer.status} /></span>
                <div>
                  <h2>{peer.name}</h2>
                  <p>{peer.status === "online" ? "İndi aktivdir" : peer.status === "away" ? "Bir azdan qayıdacaq" : "Adətən gün ərzində cavab verir"}</p>
                </div>
              </div>
              <div className="chat-header-actions" ref={settingsRef}>
                <button
                  type="button"
                  className={settingsOpen ? "active" : ""}
                  onClick={() => setSettingsPeerId((current) => current === peer.id ? null : peer.id)}
                  aria-label="Söhbət tənzimləmələri"
                  aria-expanded={settingsOpen}
                  aria-controls="chat-settings-panel"
                >
                  <motion.span animate={{ rotate: settingsOpen ? 90 : 0 }}><MoreHorizontal size={19} /></motion.span>
                </button>
                <button type="button" onClick={() => onOpenChange(false)} aria-label="Söhbəti bağla">
                  <X size={18} />
                </button>

                <AnimatePresence>
                  {settingsOpen && (
                    <motion.div
                      id="chat-settings-panel"
                      className="chat-settings"
                      initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      role="group"
                      aria-label="Söhbət seçimləri"
                    >
                      <span>Söhbət</span>
                      <button type="button" onClick={() => setMuted((current) => !current)} aria-pressed={muted}>
                        <BellOff size={15} /> Bildirişləri səssizə al <i>{muted && <Check size={12} />}</i>
                      </button>
                      <button type="button" onClick={() => setPinned((current) => !current)} aria-pressed={pinned}>
                        <Pin size={15} /> Söhbəti yuxarıda saxla <i>{pinned && <Check size={12} />}</i>
                      </button>
                      <button type="button" onClick={() => setCompact((current) => !current)} aria-pressed={compact}>
                        <MessageCircle size={15} /> Yığcam görünüş <i>{compact && <Check size={12} />}</i>
                      </button>
                      <button type="button" className="danger" onClick={clearConversation}>
                        <Trash2 size={15} /> Söhbət tarixçəsini sil
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </header>

            <div className="chat-context">
              <span>Ortaq maraq</span>
              <strong>{peer.focus}</strong>
            </div>

            <div
              ref={listRef}
              className="message-list"
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
              onScroll={handleScroll}
            >
              <div className="message-day"><span>Bu gün</span></div>
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`message-row ${message.author === "me" ? "message-own" : "message-peer"}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 12, x: message.author === "me" ? 12 : -12 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {message.author === "peer" && (
                      <span className="message-avatar" style={{ "--peer-accent": peer.accent } as CSSProperties}>{peer.initials}</span>
                    )}
                    <div>
                      <p>{message.text}</p>
                      <span>{message.time}{message.author === "me" && <Check size={11} aria-label={message.status === "read" ? "Oxunub" : "Göndərilib"} />}</span>
                    </div>
                  </motion.div>
                ))}
                {isTyping && <TypingIndicator key="typing" peer={peer} />}
              </AnimatePresence>
            </div>

            <form className="chat-composer" onSubmit={sendMessage}>
              <label className="sr-only" htmlFor="chat-message">{peer.name} üçün mesaj</label>
              <textarea
                ref={composerRef}
                id="chat-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                rows={1}
                placeholder="Mesajını yaz…"
              />
              <button type="submit" disabled={!draft.trim()} aria-label="Mesajı göndər">
                <Send size={17} />
              </button>
              <span className="composer-hint">Göndərmək üçün Enter · Yeni sətir üçün Shift + Enter</span>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
