"use client";

import { MotionConfig } from "framer-motion";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { peers, type Peer } from "../data/peers";
import { ChatDock } from "./ChatDock";
import { useAuth } from "./AuthProvider";

type PlatformContextValue = {
  activePeer: Peer;
  chatOpen: boolean;
  openConversation: (peer: Peer) => void;
  setChatOpen: (open: boolean) => void;
};

const PlatformContext = createContext<PlatformContextValue | null>(null);

type PlatformProviderProps = {
  children: ReactNode;
};

export function PlatformProvider({ children }: PlatformProviderProps) {
  const { user } = useAuth();
  const [activePeer, setActivePeer] = useState<Peer>(peers[0]);
  const [chatOpen, setChatOpen] = useState(false);

  const value = useMemo<PlatformContextValue>(() => ({
    activePeer,
    chatOpen,
    openConversation(peer) {
      setActivePeer(peer);
      setChatOpen(true);
    },
    setChatOpen,
  }), [activePeer, chatOpen]);

  return (
    <MotionConfig reducedMotion="user">
      <PlatformContext.Provider value={value}>
        {children}
        {user ? (
          <ChatDock peer={activePeer} open={chatOpen} onOpenChange={setChatOpen} />
        ) : null}
      </PlatformContext.Provider>
    </MotionConfig>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) throw new Error("usePlatform PlatformProvider daxilində istifadə olunmalıdır.");
  return context;
}
