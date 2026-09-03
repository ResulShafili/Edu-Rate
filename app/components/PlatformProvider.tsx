"use client";

import { MotionConfig } from "framer-motion";
import dynamic from "next/dynamic";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Peer } from "../data/peers";
import { useAuth } from "./AuthProvider";

// Çat yalnız giriş etmiş istifadəçi üçün və yalnız lazım olduqda yüklənir.
// Beləcə socket.io-client və çat kodu ilkin paketi ağırlaşdırmır — sayt tez açılır.
const ChatDock = dynamic(() => import("./ChatDock").then((module) => module.ChatDock), { ssr: false });

type PlatformContextValue = {
  activePeer: Peer | null;
  chatOpen: boolean;
  openConversation: (peer: Peer) => void;
  openClubConversation: (group: ClubChatTarget) => void;
  setChatOpen: (open: boolean) => void;
};

export type ClubChatTarget = {
  conversationId: string;
  clubId: string;
  name: string;
  initials: string;
  memberCount: number;
  isAdmin: boolean;
};

const PlatformContext = createContext<PlatformContextValue | null>(null);

type PlatformProviderProps = {
  children: ReactNode;
};

export function PlatformProvider({ children }: PlatformProviderProps) {
  const { user } = useAuth();
  const [activePeer, setActivePeer] = useState<Peer | null>(null);
  const [activeGroup, setActiveGroup] = useState<ClubChatTarget | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const value = useMemo<PlatformContextValue>(() => ({
    activePeer,
    chatOpen,
    openConversation(peer) {
      setActivePeer(peer);
      setActiveGroup(null);
      setChatOpen(true);
    },
    openClubConversation(group) {
      setActiveGroup(group);
      setActivePeer({ id: group.clubId, name: group.name, initials: group.initials, role: "Klub qrupu", focus: `${group.memberCount} üzv`, bio: "", city: "", status: "online", accent: "#44766c", glow: "rgba(68,118,108,.28)", mutuals: 0, tags: [], openingMessage: "", reply: "" });
      setChatOpen(true);
    },
    setChatOpen,
  }), [activePeer, chatOpen]);

  return (
    <MotionConfig reducedMotion="user">
      <PlatformContext.Provider value={value}>
        {children}
        {user ? (
          <ChatDock peer={activePeer} group={activeGroup} open={chatOpen} onOpenChange={setChatOpen} />
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
