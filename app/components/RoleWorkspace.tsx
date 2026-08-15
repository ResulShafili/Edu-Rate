"use client";

import { Check, HeartHandshake, MessageCircle, RefreshCw, Send, X } from "lucide-react";
import { useCallback, useState, type FormEvent } from "react";
import useSWR from "swr";
import { createApiClient } from "../lib/api/client";
import type { Peer } from "../data/peers";
import { usePlatform } from "./PlatformProvider";

type WorkspaceMetric = { label: string; value: string | number };
type WorkspaceChatPeer = { id: string; name: string; role: string; focus: string; city: string };
type WorkspaceItem = { id: string; title?: string; text?: string; note?: string; course?: string; status: string; type?: string; rating?: number; chatPeer?: WorkspaceChatPeer };
type MentorApplication = {
  id: string;
  specialty: string;
  biography: string;
  availability: string;
  meetingMode: string;
  languages: string[];
  status: "pending" | "approved" | "rejected";
};
type WorkspaceData = {
  role: "student" | "teacher" | "mentor";
  title: string;
  focus: string;
  metrics: WorkspaceMetric[];
  items: WorkspaceItem[];
  mentorApplication?: MentorApplication | null;
  mentorEnabled?: boolean;
  mentorItems?: WorkspaceItem[];
};

const api = createApiClient({ baseUrl: "/api" });

export function RoleWorkspace() {
  const { openConversation } = usePlatform();
  const loader = useCallback(() => api.get<WorkspaceData>("/workspace"), []);
  const { data, error, isLoading, isValidating, mutate } = useSWR("role-workspace", loader, { revalidateOnFocus: false });
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [applicationPending, setApplicationPending] = useState(false);

  async function decide(id: string, status: "accepted" | "rejected") {
    setActionId(id);
    setActionError("");
    try {
      await api.patch(`/workspace/mentorship/${encodeURIComponent(id)}`, { status });
      await mutate();
    } catch {
      setActionError("Müraciətin vəziyyəti yenilənmədi. Yenidən cəhd et.");
    } finally {
      setActionId(null);
    }
  }

  async function submitMentorApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplicationPending(true);
    setActionError("");
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      await api.post("/workspace/mentor-application", {
        specialty: String(values.get("specialty") ?? "").trim(),
        biography: String(values.get("biography") ?? "").trim(),
        availability: String(values.get("availability") ?? "").trim(),
        meetingMode: String(values.get("meetingMode") ?? "Onlayn"),
        languages: [String(values.get("language") ?? "Azərbaycan dili")],
      });
      setApplicationOpen(false);
      form.reset();
      await mutate();
    } catch (submissionError) {
      setActionError(submissionError instanceof Error ? submissionError.message : "Mentorluq müraciəti göndərilmədi.");
    } finally {
      setApplicationPending(false);
    }
  }

  if (isLoading) return <section className="role-workspace is-loading"><div className="workspace-skeleton"><i /><i /><i /></div></section>;
  if (error || !data) return <section className="role-workspace"><div className="workspace-state" role="alert"><h1>Panel açılmadı</h1><p>Bağlantını yoxlayıb yenidən cəhd et.</p><button type="button" onClick={() => void mutate()}><RefreshCw size={15} /> Yenidən yoxla</button></div></section>;

  const mentorApplication = data.mentorApplication;
  const canApplyForMentorship = data.role === "teacher"
    && !data.mentorEnabled
    && (!mentorApplication || mentorApplication.status === "rejected");

  function openMentorApplication() {
    setApplicationOpen(true);
    window.requestAnimationFrame(() => {
      document.getElementById("mentor-path-title")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function openMentorshipChat(chatPeer: WorkspaceChatPeer) {
    const initials = chatPeer.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("az")).join("");
    openConversation({
      id: chatPeer.id,
      name: chatPeer.name,
      initials,
      role: chatPeer.role,
      focus: chatPeer.focus,
      bio: "Aktiv mentorluq söhbəti",
      city: chatPeer.city,
      status: "online",
      accent: "#8fc15f",
      glow: "rgba(143, 193, 95, 0.28)",
      mutuals: 0,
      tags: ["Mentorluq"],
      openingMessage: "",
      reply: "",
    } satisfies Peer);
  }

  return (
    <section className="role-workspace" aria-labelledby="workspace-title" aria-busy={isValidating}>
      <header className="workspace-header">
        <div><span>{roleLabel(data.role)}</span><h1 id="workspace-title">{data.title}</h1><p>{data.focus}</p></div>
        <div className="workspace-header-actions">
          {canApplyForMentorship && (
            <button type="button" className="is-primary" onClick={openMentorApplication}>
              <HeartHandshake size={15} /> {mentorApplication?.status === "rejected" ? "Yenidən müraciət et" : "Mentor kimi müraciət et"}
            </button>
          )}
          {data.role === "teacher" && mentorApplication?.status === "pending" && <span className="workspace-header-status">Mentor müraciəti yoxlanılır</span>}
          {data.role === "teacher" && data.mentorEnabled && <span className="workspace-header-status is-approved"><Check size={14} /> Mentor profili aktivdir</span>}
          <button type="button" onClick={() => void mutate()} disabled={isValidating}><RefreshCw size={15} /> Yenilə</button>
        </div>
      </header>
      <div className="workspace-metrics">{data.metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}</div>

      {data.role === "teacher" && (
        <section className="workspace-mentor-path" aria-labelledby="mentor-path-title">
          <div className="workspace-mentor-copy">
            <span><HeartHandshake size={15} aria-hidden="true" /> Əlavə peşəkar imkan</span>
            <h2 id="mentor-path-title">Mentor kimi fəaliyyət göstər</h2>
            <p>Müəllim hesabını dəyişmədən ekspertiza sahən üzrə mentorluq müraciəti göndər.</p>
          </div>

          {data.mentorEnabled ? (
            <div className="workspace-mentor-status is-approved"><Check size={16} /><span><strong>Mentor profilin aktivdir</strong><small>Mentor kataloqunda görünürsən və müraciətləri bu paneldən idarə edə bilərsən.</small></span></div>
          ) : mentorApplication?.status === "pending" ? (
            <div className="workspace-mentor-status"><RefreshCw size={16} /><span><strong>Müraciət yoxlanılır</strong><small>Rəhbərlik təsdiqlədikdən sonra mentor profilin avtomatik açılacaq.</small></span></div>
          ) : applicationOpen ? (
            <form className="workspace-mentor-form" onSubmit={submitMentorApplication}>
              <label><span>Ekspertiza sahəsi</span><input name="specialty" defaultValue={data.focus} minLength={2} maxLength={180} required /></label>
              <label className="is-wide"><span>Mentorluq haqqında qısa məlumat</span><textarea name="biography" rows={4} minLength={20} maxLength={1200} placeholder="Tələbələrə hansı mövzularda və necə dəstək verə bilərsən?" required /></label>
              <label><span>Əlçatanlıq</span><input name="availability" placeholder="Məsələn, həftəiçi 18:00-dan sonra" minLength={2} maxLength={240} required /></label>
              <label><span>Görüş formatı</span><select name="meetingMode" defaultValue="Onlayn"><option>Onlayn</option><option>Əyani</option><option>Hibrid</option></select></label>
              <label><span>Dil</span><select name="language" defaultValue="Azərbaycan dili"><option>Azərbaycan dili</option><option>İngilis dili</option></select></label>
              <div className="workspace-mentor-actions"><button type="button" onClick={() => setApplicationOpen(false)} disabled={applicationPending}>Ləğv et</button><button type="submit" disabled={applicationPending}><Send size={14} /> {applicationPending ? "Göndərilir…" : "Müraciəti göndər"}</button></div>
            </form>
          ) : canApplyForMentorship ? (
            <button type="button" className="workspace-mentor-apply" onClick={openMentorApplication}><HeartHandshake size={16} /> {mentorApplication?.status === "rejected" ? "Yenidən müraciət et" : "Mentor olmaq üçün müraciət et"}</button>
          ) : null}
        </section>
      )}

      {actionError && <p className="workspace-action-error" role="alert">{actionError}</p>}
      <WorkspaceQueue title={queueTitle(data.role)} items={data.items} allowActions={data.role === "mentor"} actionId={actionId} onDecide={decide} onMessage={openMentorshipChat} />
      {data.role === "teacher" && data.mentorEnabled && (
        <WorkspaceQueue title="Mentorluq müraciətləri" items={data.mentorItems ?? []} allowActions actionId={actionId} onDecide={decide} onMessage={openMentorshipChat} />
      )}
    </section>
  );
}

function WorkspaceQueue({ title, items, allowActions, actionId, onDecide, onMessage }: {
  title: string;
  items: WorkspaceItem[];
  allowActions: boolean;
  actionId: string | null;
  onDecide: (id: string, status: "accepted" | "rejected") => Promise<void>;
  onMessage: (peer: WorkspaceChatPeer) => void;
}) {
  return (
    <section className="workspace-queue" aria-label={title}><header><span>Canlı məlumat</span><h2>{title}</h2></header>
      {!items.length ? <div className="workspace-state"><h3>Hazırda yeni məlumat yoxdur</h3><p>Yeni əməliyyatlar olduqda burada görünəcək.</p></div> : <div className="workspace-items">{items.map((item) => <article key={item.id}><div><span>{item.course ?? item.type ?? "Müraciət"}</span>{item.rating !== undefined && <strong>{item.rating.toFixed(1)} / 5</strong>}</div><h3>{item.title ?? item.note ?? "Mentorluq müraciəti"}</h3>{item.text && <p>{item.text}</p>}<footer><small>{statusLabel(item.status)}</small>{allowActions && item.status === "pending" ? <div><button type="button" onClick={() => void onDecide(item.id, "rejected")} disabled={actionId === item.id}><X size={14} /> Rədd et</button><button type="button" onClick={() => void onDecide(item.id, "accepted")} disabled={actionId === item.id}><Check size={14} /> Qəbul et</button></div> : item.status === "accepted" && item.chatPeer ? <div><button type="button" className="workspace-message-button" onClick={() => onMessage(item.chatPeer!)}><MessageCircle size={14} /> Mesaj yaz</button></div> : null}</footer></article>)}</div>}
    </section>
  );
}

function roleLabel(role: WorkspaceData["role"]) { return role === "teacher" ? "Tədris məkanı" : role === "mentor" ? "Mentorluq məkanı" : "Tələbə məkanı"; }
function queueTitle(role: WorkspaceData["role"]) { return role === "teacher" ? "Müəllim qiymətləndirmələri" : role === "mentor" ? "Mentorluq müraciətləri" : "Qeydiyyatlarım"; }
function statusLabel(status: string) { return ({ pending: "Gözləyir", approved: "Təsdiqlənib", rejected: "Rədd edilib", accepted: "Qəbul edilib", cancelled: "Ləğv edilib" } as Record<string, string>)[status] ?? status; }
