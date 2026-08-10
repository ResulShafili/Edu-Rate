"use client";

import { Check, RefreshCw, ShieldCheck, X } from "lucide-react";
import { useCallback, useState } from "react";
import useSWR from "swr";
import { createApiClient } from "../lib/api/client";

type ModerationReview = {
  id: string;
  teacherId: string;
  course: string;
  semester: string;
  text: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const api = createApiClient({ baseUrl: "/api" });

export function ReviewModerationPanel() {
  const [actionId, setActionId] = useState<string | null>(null);
  const loader = useCallback(() => api.get<ModerationReview[]>("/admin/reviews?status=pending"), []);
  const { data, error, isLoading, isValidating, mutate } = useSWR("admin-pending-reviews", loader, {
    revalidateOnFocus: false,
  });

  async function decide(id: string, status: "approved" | "rejected") {
    setActionId(id);
    try {
      await api.patch<ModerationReview, { status: typeof status }>(`/admin/reviews/${encodeURIComponent(id)}`, { status });
      await mutate((current) => current?.filter((review) => review.id !== id), { revalidate: false });
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="admin-review-panel" aria-labelledby="admin-reviews-title" aria-busy={isLoading || isValidating}>
      <header>
        <div>
          <span><ShieldCheck size={14} aria-hidden="true" /> Təhlükəsiz icma</span>
          <h2 id="admin-reviews-title">Rəy moderasiyası</h2>
        </div>
        <button type="button" onClick={() => void mutate()} disabled={isValidating} aria-label="Rəyləri yenilə">
          <RefreshCw size={15} aria-hidden="true" /> Yenilə
        </button>
      </header>

      {isLoading ? (
        <div className="admin-review-skeleton" aria-label="Rəylər yüklənir"><i /><i /><i /></div>
      ) : error ? (
        <div className="admin-review-state" role="alert"><strong>Rəylər yüklənmədi</strong><button type="button" onClick={() => void mutate()}>Yenidən yoxla</button></div>
      ) : !data?.length ? (
        <div className="admin-review-state"><strong>Moderasiya növbəsi boşdur</strong><p>Bütün rəylər yoxlanılıb.</p></div>
      ) : (
        <div className="admin-review-list">
          {data.map((review) => (
            <article key={review.id}>
              <div><span>{review.course} · {review.semester}</span><strong>{review.rating.toFixed(1)} / 5</strong></div>
              <p>{review.text}</p>
              <footer>
                <small>{review.teacherId}</small>
                <div>
                  <button type="button" onClick={() => void decide(review.id, "rejected")} disabled={actionId === review.id}><X size={14} /> Rədd et</button>
                  <button type="button" onClick={() => void decide(review.id, "approved")} disabled={actionId === review.id}><Check size={14} /> Təsdiqlə</button>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
