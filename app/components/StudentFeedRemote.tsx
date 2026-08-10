"use client";

import { RefreshCw } from "lucide-react";
import useSWR from "swr";
import type { AnnouncementItem, StudentFeedItem } from "../data/network";
import { StudentFeed } from "./StudentFeed";

type NetworkPayload = {
  announcements: AnnouncementItem[];
  items: StudentFeedItem[];
};

async function loadNetwork(): Promise<NetworkPayload> {
  const response = await fetch("/api/network", { headers: { Accept: "application/json" } });
  const payload = await response.json() as { data?: NetworkPayload; error?: { message?: string } };
  if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "Elanlar yüklənmədi.");
  return payload.data;
}

export function StudentFeedRemote() {
  const { data, error, isLoading, isValidating, mutate } = useSWR("student-network", loadNetwork, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  if (isLoading) {
    return (
      <section className="feed-remote-state" aria-label="Elanlar yüklənir" aria-busy="true">
        <div><i /><i /><i /></div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="feed-remote-state is-error" role="alert">
        <h1>Elanlar hazırda açılmır</h1>
        <p>Bağlantını yoxlayıb yenidən cəhd et.</p>
        <button type="button" onClick={() => void mutate()}><RefreshCw size={16} /> Yenidən yoxla</button>
      </section>
    );
  }

  return (
    <div aria-busy={isValidating}>
      <StudentFeed announcements={data.announcements} items={data.items} />
    </div>
  );
}
