"use client";

import { Check, RefreshCw, X } from "lucide-react";
import { useCallback, useState } from "react";
import useSWR from "swr";
import { createApiClient } from "../lib/api/client";

type WorkspaceMetric = { label: string; value: string | number };
type WorkspaceItem = { id: string; title?: string; text?: string; note?: string; course?: string; status: string; type?: string; rating?: number };
type WorkspaceData = { role: "student" | "teacher" | "mentor"; title: string; focus: string; metrics: WorkspaceMetric[]; items: WorkspaceItem[] };
const api = createApiClient({ baseUrl: "/api" });

export function RoleWorkspace() {
  const loader = useCallback(() => api.get<WorkspaceData>("/workspace"), []);
  const { data, error, isLoading, isValidating, mutate } = useSWR("role-workspace", loader, { revalidateOnFocus: false });
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function decide(id: string, status: "accepted" | "rejected") {
    setActionId(id);
    setActionError("");
    try {
      await api.patch(`/workspace/mentorship/${encodeURIComponent(id)}`, { status });
      await mutate();
    } catch {
      setActionError("Müraciətin vəziyyəti yenilənmədi. Yenidən cəhd et.");
    } finally { setActionId(null); }
  }

  if (isLoading) return <section className="role-workspace is-loading"><div className="workspace-skeleton"><i /><i /><i /></div></section>;
  if (error || !data) return <section className="role-workspace"><div className="workspace-state" role="alert"><h1>Panel açılmadı</h1><p>Bağlantını yoxlayıb yenidən cəhd et.</p><button type="button" onClick={() => void mutate()}><RefreshCw size={15} /> Yenidən yoxla</button></div></section>;

  return (
    <section className="role-workspace" aria-labelledby="workspace-title" aria-busy={isValidating}>
      <header className="workspace-header"><div><span>{roleLabel(data.role)}</span><h1 id="workspace-title">{data.title}</h1><p>{data.focus}</p></div><button type="button" onClick={() => void mutate()} disabled={isValidating}><RefreshCw size={15} /> Yenilə</button></header>
      <div className="workspace-metrics">{data.metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}</div>
      <section className="workspace-queue" aria-labelledby="workspace-queue-title"><header><span>Canlı məlumat</span><h2 id="workspace-queue-title">{queueTitle(data.role)}</h2></header>
        {actionError && <p className="workspace-action-error" role="alert">{actionError}</p>}
        {!data.items.length ? <div className="workspace-state"><h3>Hazırda yeni məlumat yoxdur</h3><p>Yeni əməliyyatlar olduqda burada görünəcək.</p></div> : <div className="workspace-items">{data.items.map((item) => <article key={item.id}><div><span>{item.course ?? item.type ?? "Müraciət"}</span>{item.rating !== undefined && <strong>{item.rating.toFixed(1)} / 5</strong>}</div><h3>{item.title ?? item.note ?? "Mentorluq müraciəti"}</h3>{item.text && <p>{item.text}</p>}<footer><small>{statusLabel(item.status)}</small>{data.role === "mentor" && item.status === "pending" && <div><button type="button" onClick={() => void decide(item.id, "rejected")} disabled={actionId === item.id}><X size={14} /> Rədd et</button><button type="button" onClick={() => void decide(item.id, "accepted")} disabled={actionId === item.id}><Check size={14} /> Qəbul et</button></div>}</footer></article>)}</div>}
      </section>
    </section>
  );
}

function roleLabel(role: WorkspaceData["role"]) { return role === "teacher" ? "Tədris məkanı" : role === "mentor" ? "Mentorluq məkanı" : "Tələbə məkanı"; }
function queueTitle(role: WorkspaceData["role"]) { return role === "teacher" ? "Müəllim rəyləri" : role === "mentor" ? "Mentorluq müraciətləri" : "Qeydiyyatlarım"; }
function statusLabel(status: string) { return ({ pending: "Gözləyir", approved: "Təsdiqlənib", rejected: "Rədd edilib", accepted: "Qəbul edilib", cancelled: "Ləğv edilib" } as Record<string, string>)[status] ?? status; }
