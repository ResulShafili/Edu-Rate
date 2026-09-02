"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowBigUp, MessageCircleQuestion, Plus, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "./AuthProvider";

const TOPICS = [
  { value: "kampus", label: "Kampus" },
  { value: "tedris", label: "Tədris" },
  { value: "yasayis", label: "Yaşayış" },
  { value: "texniki", label: "Texniki" },
  { value: "diger", label: "Digər" },
] as const;

type Topic = (typeof TOPICS)[number]["value"];

type Question = {
  id: string;
  title: string;
  body: string;
  topic: Topic;
  createdAt: string;
  voteCount: number;
  answerCount: number;
  voted: boolean;
  mine: boolean;
};

type Answer = { id: string; body: string; createdAt: string; mine: boolean };

function topicLabel(topic: Topic) {
  return TOPICS.find((item) => item.value === topic)?.label ?? "Digər";
}

function relative(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "indi";
  if (minutes < 60) return `${minutes} dəq əvvəl`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} saat əvvəl`;
  return new Intl.DateTimeFormat("az-AZ", { day: "numeric", month: "long" }).format(new Date(iso));
}

export function QuestionsExperience() {
  const { user } = useAuth();
  const reduceMotion = Boolean(useReducedMotion());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sort, setSort] = useState<"new" | "top">("new");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", topic: "kampus" as Topic });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [answerDraft, setAnswerDraft] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/questions?sort=${sort}`, { cache: "no-store" });
        const payload = await response.json() as { data?: Question[] };
        if (!cancelled && response.ok) setQuestions(payload.data ?? []);
      } catch {
        // Şəbəkə xətası: boş siyahı göstərilir.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sort]);

  async function ask(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (draft.title.trim().length < 8) {
      setError("Sualı bir az daha aydın yaz (ən azı 8 simvol).");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: draft.title.trim(), body: draft.body.trim(), topic: draft.topic }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new Error(payload?.error?.message ?? "Sual göndərilmədi.");
      }
      setDraft({ title: "", body: "", topic: draft.topic });
      setFormOpen(false);
      const refreshed = await fetch(`/api/questions?sort=${sort}`, { cache: "no-store" });
      const payload = await refreshed.json() as { data?: Question[] };
      if (refreshed.ok) setQuestions(payload.data ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sual göndərilmədi.");
    } finally {
      setSaving(false);
    }
  }

  async function vote(id: string) {
    if (!user) return;
    setQuestions((current) => current.map((item) => item.id === id
      ? { ...item, voted: !item.voted, voteCount: item.voteCount + (item.voted ? -1 : 1) }
      : item));
    const response = await fetch(`/api/questions/${id}/vote`, { method: "POST" });
    if (!response.ok) {
      setQuestions((current) => current.map((item) => item.id === id
        ? { ...item, voted: !item.voted, voteCount: item.voteCount + (item.voted ? -1 : 1) }
        : item));
    }
  }

  async function openAnswers(id: string) {
    const next = openId === id ? null : id;
    setOpenId(next);
    setAnswerDraft("");
    if (!next || answers[next]) return;
    const response = await fetch(`/api/questions/${id}/answers`, { cache: "no-store" });
    const payload = await response.json() as { data?: Answer[] };
    if (response.ok) setAnswers((current) => ({ ...current, [id]: payload.data ?? [] }));
  }

  async function answer(event: FormEvent, id: string) {
    event.preventDefault();
    const body = answerDraft.trim();
    if (body.length < 2) return;
    setAnswerDraft("");
    const response = await fetch(`/api/questions/${id}/answers`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!response.ok) { setError("Cavab göndərilmədi."); return; }
    const refreshed = await fetch(`/api/questions/${id}/answers`, { cache: "no-store" });
    const payload = await refreshed.json() as { data?: Answer[] };
    if (refreshed.ok) setAnswers((current) => ({ ...current, [id]: payload.data ?? [] }));
    setQuestions((current) => current.map((item) => item.id === id ? { ...item, answerCount: item.answerCount + 1 } : item));
  }

  async function remove(id: string) {
    const previous = questions;
    setQuestions((current) => current.filter((item) => item.id !== id));
    const response = await fetch(`/api/questions/${id}`, { method: "DELETE" });
    if (!response.ok) { setQuestions(previous); setError("Sual silinmədi."); }
  }

  return (
    <section className="questions-shell">
      <header className="section-heading">
        <div>
          <span>Kampus sualları</span>
          <h1 className="module-page-title">Soruş, cavab al</h1>
        </div>
        {user ? (
          <button type="button" className="kuds-primary-button" onClick={() => setFormOpen((value) => !value)}>
            <Plus size={16} /> Sual ver
          </button>
        ) : (
          <Link href="/auth" className="kuds-primary-button">Sual vermək üçün daxil ol</Link>
        )}
      </header>

      <p className="compare-lead">
        Suallar <strong>anonim</strong> görünür — adın heç yerdə göstərilmir. Kampus, tədris, yaşayış və texniki
        məsələlər üzrə soruş; cavabı bilən tələbələr kömək etsin.
      </p>

      <div className="questions-sort">
        <button type="button" className={sort === "new" ? "is-active" : ""} onClick={() => setSort("new")}>Yeni</button>
        <button type="button" className={sort === "top" ? "is-active" : ""} onClick={() => setSort("top")}>Ən çox səs</button>
      </div>

      <AnimatePresence>
        {formOpen && user ? (
          <motion.form
            className="schedule-form"
            onSubmit={ask}
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label>
              Sual
              <input
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                maxLength={180}
                placeholder="Kitabxana həftəsonu neçəyə qədər açıqdır?"
              />
            </label>
            <label>
              Əlavə detal (istəyə bağlı)
              <textarea
                value={draft.body}
                onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                maxLength={1200}
                rows={3}
                placeholder="Kontekst əlavə et ki, cavab daha dəqiq olsun."
              />
            </label>
            <div className="questions-topics">
              {TOPICS.map((topic) => (
                <button
                  key={topic.value}
                  type="button"
                  className={draft.topic === topic.value ? "is-active" : ""}
                  onClick={() => setDraft({ ...draft, topic: topic.value })}
                  aria-pressed={draft.topic === topic.value}
                >
                  {topic.label}
                </button>
              ))}
            </div>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <div className="schedule-form__actions">
              <button type="submit" className="kuds-primary-button" disabled={saving}>{saving ? "Göndərilir…" : "Sualı göndər"}</button>
              <button type="button" onClick={() => { setFormOpen(false); setError(""); }}>Ləğv et</button>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>

      {loading ? <p className="chat-state">Suallar yüklənir…</p> : questions.length ? (
        <ul className="questions-list">
          {questions.map((question) => (
            <li key={question.id} className="question-card">
              <button
                type="button"
                className={`question-vote${question.voted ? " is-voted" : ""}`}
                onClick={() => void vote(question.id)}
                disabled={!user}
                aria-label={question.voted ? "Səsini geri al" : "Bu sual mənim də marağımdadır"}
              >
                <ArrowBigUp size={17} />
                <b>{question.voteCount}</b>
              </button>
              <div className="question-body">
                <div className="question-meta">
                  <span className="question-topic">{topicLabel(question.topic)}</span>
                  <small>{relative(question.createdAt)}</small>
                  {question.mine ? <em>sənin sualın</em> : null}
                </div>
                <h2>{question.title}</h2>
                {question.body ? <p>{question.body}</p> : null}
                <div className="question-actions">
                  <button type="button" onClick={() => void openAnswers(question.id)}>
                    <MessageCircleQuestion size={14} />
                    {question.answerCount ? `${question.answerCount} cavab` : "Cavab yaz"}
                  </button>
                  {question.mine ? (
                    <button type="button" className="is-danger" onClick={() => void remove(question.id)}>
                      <Trash2 size={13} /> Sil
                    </button>
                  ) : null}
                </div>

                <AnimatePresence>
                  {openId === question.id ? (
                    <motion.div
                      className="question-answers"
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {(answers[question.id] ?? []).map((item) => (
                        <div key={item.id} className="question-answer">
                          <p>{item.body}</p>
                          <small>{relative(item.createdAt)}{item.mine ? " · sənin cavabın" : ""}</small>
                        </div>
                      ))}
                      {(answers[question.id] ?? []).length === 0 ? (
                        <p className="week-day__empty">Hələ cavab yoxdur — ilk cavabı sən yaz.</p>
                      ) : null}
                      {user ? (
                        <form className="question-answer-form" onSubmit={(event) => void answer(event, question.id)}>
                          <input
                            value={answerDraft}
                            onChange={(event) => setAnswerDraft(event.target.value)}
                            maxLength={1200}
                            placeholder="Cavabını yaz…"
                          />
                          <button type="submit" disabled={answerDraft.trim().length < 2} aria-label="Cavabı göndər">
                            <Send size={15} />
                          </button>
                        </form>
                      ) : (
                        <Link href="/auth" className="welcome-secondary">Cavab yazmaq üçün daxil ol</Link>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="schedule-empty">
          <MessageCircleQuestion size={28} />
          <h2>Hələ sual yoxdur</h2>
          <p>Birinci kursda ağlına gələn hər sual burada yerini tapa bilər — kitabxana saatları, imtahan qaydaları, kampusda nahar.</p>
        </div>
      )}
    </section>
  );
}
