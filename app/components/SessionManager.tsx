"use client";

import { MonitorSmartphone, RefreshCw, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Session = {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
};

export function SessionManager() {
  const [items, setItems] = useState<Session[]>([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/auth/actions/sessions", { cache: "no-store" });
    const payload = (await response.json()) as { data?: Session[] };
    if (response.ok) setItems(payload.data ?? []);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [open, load]);

  async function closeOthers() {
    const response = await fetch("/api/auth/actions/sessions", { method: "DELETE" });
    setMessage(response.ok ? "Digər cihaz sessiyaları bağlandı." : "Sessiyalar bağlanmadı.");
    if (response.ok) void load();
  }

  async function closeOne(id: string) {
    const response = await fetch(`/api/auth/actions/sessions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (response.ok) void load();
    else setMessage("Sessiya bağlanmadı.");
  }

  return (
    <section className="profile-security-card" aria-labelledby="profile-security-title">
      <div>
        <span><ShieldCheck size={18} /></span>
        <div>
          <small>Hesab təhlükəsizliyi</small>
          <h2 id="profile-security-title">Aktiv cihazlar</h2>
          <p>Sessiyalarını yoxla və tanımadığın cihazları bağla.</p>
        </div>
      </div>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {open ? <X size={15} /> : <MonitorSmartphone size={15} />}
        {open ? "Bağla" : "Cihazlara bax"}
      </button>
      {open ? (
        <div className="profile-session-list">
          {items.map((item) => (
            <article key={item.id}>
              <MonitorSmartphone size={17} />
              <div>
                <strong>{item.current ? "Bu cihaz" : "Aktiv cihaz"}</strong>
                <small>
                  {item.userAgent || "Brauzer məlumatı yoxdur"} ·{" "}
                  {new Date(item.lastSeenAt).toLocaleString("az-AZ")}
                </small>
              </div>
              {!item.current ? (
                <button type="button" onClick={() => void closeOne(item.id)} aria-label="Sessiyanı bağla">
                  <X size={14} />
                </button>
              ) : null}
            </article>
          ))}
          {!items.length ? <p>Aktiv sessiya tapılmadı.</p> : null}
          <button type="button" className="profile-close-sessions" onClick={() => void closeOthers()}>
            <RefreshCw size={14} /> Digər cihazlardan çıx
          </button>
          {message ? <p role="status">{message}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
