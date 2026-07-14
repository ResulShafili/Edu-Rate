"use client";

import { PeerDirectory } from "./PeerDirectory";
import { usePlatform } from "./PlatformProvider";

export function ConnectionsExperience() {
  const { openConversation } = usePlatform();

  return <PeerDirectory onMessage={openConversation} />;
}
