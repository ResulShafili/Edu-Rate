"use client";

import { useRouter } from "next/navigation";
import { PeerDirectory } from "./PeerDirectory";
import { useAuth } from "./AuthProvider";
import { usePlatform } from "./PlatformProvider";

export function ConnectionsExperience() {
  const router = useRouter();
  const { user } = useAuth();
  const { openClubConversation, openConversation } = usePlatform();

  const requireAuth = () => router.push("/auth?returnTo=/community");

  return (
    <PeerDirectory
      canInteract={Boolean(user)}
      currentUserId={user?.id}
      onMessage={user ? openConversation : requireAuth}
      onGroupMessage={user ? openClubConversation : requireAuth}
      onRequireAuth={requireAuth}
    />
  );
}
