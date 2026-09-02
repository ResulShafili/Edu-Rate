"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Clock, MapPin, Plus, Sparkles, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "./AuthProvider";

const TONES = ["mint", "lilac", "blue", "coral", "gold", "sage"] as const;
type Tone = (typeof TONES)[number];

type Entry = {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  tone: Tone;
};

type CampusEvent = { id: string; title: string; startAt: string; location?: string };

const DAYS = [
  { value: 1, label: "Bazar ertəsi", short: "B.e" },
  { value: 2, label: "Çərşənbə axşamı", short: "Ç.a" },
  { value: 3, label: "Çərşənbə", short: "Çər" },
  { value: 4, label: "Cümə axşamı", short: "C.a" },
  { value: 5, label: "Cümə", short: "Cüm" },
  { value: 6, label: "Şənbə", short: "Şən" },
] as const;

const emptyDraft = {
  subject: "",
  teacher: "",
  room: "",
  dayOfWeek: 1,
  start: "09:00",
  end: "10:30",
  tone: "mint" as Tone,
};

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function toClock(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

function todayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

export function ScheduleExperience() {
  const { user } = useAuth();
  const reduceMotion = Boolean(useReducedMotion());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const response = await fetch("/api/timetable", { cache: "no-store" });
        const payload = await response.json() as { data?: Entry[] };
        if (!cancelled && response.ok) setEntries(payload.data ?? []);
      } catch {
        // Şəbəkə xətası sakit keçilir; boş cədvəl göstərilir.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/catalog/events", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { data: [] }))
      .then((payload: { data?: CampusEvent[] }) => {
        if (!cancelled) setEvents(payload.data ?? []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const today = todayIndex();
  const minuteNow = now.getHours() * 60 + now.getMinutes();

  const todayEntries = useMemo(
    () => entries.filter((entry) => entry.dayOfWeek === today).sort((a, b) => a.startMinute - b.startMinute),
    [entries, today],
  );

  const nextEntry = useMemo(
    () => todayEntries.find((entry) => entry.endMinute > minuteNow),
    [todayEntries, minuteNow],
  );

  const todayEvents = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return events
      .filter((item) => {
        const at = new Date(item.startAt).getTime();
        return at >= start.getTime() && at < end.getTime();
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [events]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const startMinute = toMinutes(draft.start);
    const endMinute = toMinutes(draft.end);
    if (draft.subject.trim().length < 2) {
      setError("Fənnin adını yaz.");
      return;
    }
    if (endMinute <= startMinute) {
      setError("Bitmə vaxtı başlama vaxtından sonra olmalıdır.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/timetable", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject: draft.subject.trim(),
          teacher: draft.teacher.trim(),
          room: draft.room.trim(),
          dayOfWeek: draft.dayOfWeek,
          startMinute,
          endMinute,
          tone: draft.tone,
        }),
      });
      const payload = await response.json() as { data?: Entry; error?: { message?: string } };
      if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "Dərs əlavə edilmədi.");
      const created = payload.data;
      setEntries((current) => [...current, created]);
      setDraft({ ...emptyDraft, dayOfWeek: draft.dayOfWeek });
      setFormOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Dərs əlavə edilmədi.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const previous = entries;
    setEntries((current) => current.filter((item) => item.id !== id));
    const response = await fetch(`/api/timetable/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setEntries(previous);
      setError("Dərs silinmədi.");
    }
  }

  if (!user) {
    return (
      <section className="schedule-shell">
        <header className="section-heading">
          <div>
            <span>Cədvəl</span>
            <h1 className="module-page-title">Dərs cədvəlin</h1>
          </div>
        </header>
        <div className="schedule-empty">
          <CalendarDays size={30} />
          <h2>Cədvəlini burada saxla</h2>
          <p>Həftəlik dərslərini əlavə et — hər gün nə vaxt, harada və kiminlə dərsin olduğunu bir baxışda gör.</p>
          <Link href="/auth" className="kuds-primary-button">Daxil ol</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="schedule-shell">
      <header className="section-heading">
        <div>
          <span>Cədvəl</span>
          <h1 className="module-page-title">Dərs cədvəlin</h1>
        </div>
        <button type="button" className="kuds-primary-button" onClick={() => setFormOpen((value) => !value)}>
          <Plus size={16} /> Dərs əlavə et
        </button>
      </header>

      <div className="today-panel">
        <div className="today-panel__head">
          <Sparkles size={16} />
          <h2>Bu gün kampusda</h2>
          <small>
            {new Intl.DateTimeFormat("az-AZ", { weekday: "long", day: "numeric", month: "long" }).format(now)}
          </small>
        </div>

        {nextEntry ? (
          <div className={`today-next tone-${nextEntry.tone}`}>
            <span className="today-next__label">
              {nextEntry.startMinute <= minuteNow ? "İndi davam edir" : "Növbəti dərs"}
            </span>
            <strong>{nextEntry.subject}</strong>
            <p>
              <span><Clock size={13} /> {toClock(nextEntry.startMinute)}–{toClock(nextEntry.endMinute)}</span>
              {nextEntry.room ? <span><MapPin size={13} /> {nextEntry.room}</span> : null}
              {nextEntry.teacher ? <span><User size={13} /> {nextEntry.teacher}</span> : null}
            </p>
          </div>
        ) : (
          <p className="today-none">
            {todayEntries.length ? "Bu günün dərsləri bitdi." : "Bu gün üçün dərs qeyd olunmayıb."}
          </p>
        )}

        {todayEvents.length ? (
          <ul className="today-events">
            {todayEvents.slice(0, 3).map((item) => (
              <li key={item.id}>
                <span>
                  {new Intl.DateTimeFormat("az-AZ", { hour: "2-digit", minute: "2-digit" }).format(new Date(item.startAt))}
                </span>
                <strong>{item.title}</strong>
                {item.location ? <small>{item.location}</small> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <AnimatePresence>
        {formOpen ? (
          <motion.form
            className="schedule-form"
            onSubmit={submit}
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="schedule-form__grid">
              <label>
                Fənn
                <input
                  value={draft.subject}
                  onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
                  maxLength={120}
                  placeholder="Riyazi analiz"
                />
              </label>
              <label>
                Müəllim
                <input
                  value={draft.teacher}
                  onChange={(event) => setDraft({ ...draft, teacher: event.target.value })}
                  maxLength={120}
                  placeholder="Ad Soyad"
                />
              </label>
              <label>
                Auditoriya
                <input
                  value={draft.room}
                  onChange={(event) => setDraft({ ...draft, room: event.target.value })}
                  maxLength={80}
                  placeholder="204"
                />
              </label>
              <label>
                Gün
                <select
                  value={draft.dayOfWeek}
                  onChange={(event) => setDraft({ ...draft, dayOfWeek: Number(event.target.value) })}
                >
                  {DAYS.map((day) => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Başlayır
                <input type="time" value={draft.start} onChange={(event) => setDraft({ ...draft, start: event.target.value })} />
              </label>
              <label>
                Bitir
                <input type="time" value={draft.end} onChange={(event) => setDraft({ ...draft, end: event.target.value })} />
              </label>
            </div>
            <div className="schedule-form__tones">
              {TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  className={`tone-chip tone-${tone}${draft.tone === tone ? " is-active" : ""}`}
                  onClick={() => setDraft({ ...draft, tone })}
                  aria-label={`${tone} rəngi`}
                  aria-pressed={draft.tone === tone}
                />
              ))}
            </div>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <div className="schedule-form__actions">
              <button type="submit" className="kuds-primary-button" disabled={saving}>
                {saving ? "Saxlanılır…" : "Saxla"}
              </button>
              <button type="button" onClick={() => { setFormOpen(false); setError(""); }}>Ləğv et</button>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>

      {loading ? (
        <p className="chat-state">Cədvəl yüklənir…</p>
      ) : (
        <div className="week-grid">
          {DAYS.map((day) => {
            const dayEntries = entries
              .filter((entry) => entry.dayOfWeek === day.value)
              .sort((a, b) => a.startMinute - b.startMinute);
            return (
              <div key={day.value} className={`week-day${day.value === today ? " is-today" : ""}`}>
                <header>
                  <strong>{day.short}</strong>
                  <span>{day.label}</span>
                </header>
                {dayEntries.length ? (
                  <ul>
                    {dayEntries.map((entry) => (
                      <li key={entry.id} className={`lesson tone-${entry.tone}`}>
                        <div>
                          <strong>{entry.subject}</strong>
                          <small>
                            {toClock(entry.startMinute)}–{toClock(entry.endMinute)}
                            {entry.room ? ` · ${entry.room}` : ""}
                          </small>
                          {entry.teacher ? <em>{entry.teacher}</em> : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => void remove(entry.id)}
                          aria-label={`${entry.subject} dərsini sil`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="week-day__empty">Dərs yoxdur</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && entries.length === 0 ? (
        <div className="schedule-empty">
          <CalendarDays size={28} />
          <h2>Cədvəlin hələ boşdur</h2>
          <p>İlk dərsini əlavə et — sonra hər gün açanda növbəti dərsin və kampusdakı tədbirlər burada görünəcək.</p>
          <button type="button" className="kuds-primary-button" onClick={() => setFormOpen(true)}>
            <Plus size={16} /> İlk dərsi əlavə et
          </button>
        </div>
      ) : null}
    </section>
  );
}
