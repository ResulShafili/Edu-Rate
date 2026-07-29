"use client";

import { useRouter } from "next/navigation";
import { PeerDirectory } from "./PeerDirectory";
import { useAuth } from "./AuthProvider";
import { usePlatform } from "./PlatformProvider";

export function ConnectionsExperience() {
  const router = useRouter();
  const { user } = useAuth();
  const { openConversation } = usePlatform();

  const requireAuth = () => router.push("/auth?returnTo=/community");

  return (
    <PeerDirectory
      canInteract={Boolean(user)}
      onMessage={user ? openConversation : requireAuth}
      onRequireAuth={requireAuth}
    />
  );
}
