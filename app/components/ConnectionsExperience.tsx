"use client";

import { useState } from "react";
import { peers, type Peer } from "../data/peers";
import { ChatDock } from "./ChatDock";
import { PeerDirectory } from "./PeerDirectory";

export function ConnectionsExperience() {
  const [activePeer, setActivePeer] = useState<Peer>(peers[0]);
  const [chatOpen, setChatOpen] = useState(false);

  function openConversation(peer: Peer) {
    setActivePeer(peer);
    setChatOpen(true);
  }

  return (
    <>
      <PeerDirectory onMessage={openConversation} />
      <ChatDock peer={activePeer} open={chatOpen} onOpenChange={setChatOpen} />
    </>
  );
}
