"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, LifeBuoy, Send } from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { supportFaqs, ticketTopics } from "../data/support";

type TicketFields = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

const initialFields: TicketFields = { name: "", email: "", topic: "", message: "" };
const ease = [0.22, 1, 0.36, 1] as const;
type TicketHistoryItem = { id: string; reference: string; topic: string; status: "open" | "in_progress" | "resolved"; createdAt: string };

function getTicketValidity(fields: TicketFields) {
  return {
    name: fields.name.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()),
    topic: fields.topic.length > 0,
    message: fields.message.trim().length >= 20,
  };
}

export function SupportCenter() {
  const [openFaq, setOpenFaq] = useState<string | null>(supportFaqs[0]?.id ?? null);
  const [fields, setFields] = useState<TicketFields>(initialFields);
  const [touched, setTouched] = useState<Set<keyof TicketFields>>(() => new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reference, setReference] = useState("");
  const [tickets, setTickets] = useState<TicketHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyRequiresLogin, setHistoryRequiresLogin] = useState(false);
  const reduceMotion = useReducedMotion();

  const validity = getTicketValidity(fields);
  const formValid = Object.values(validity).every(Boolean);

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/support/tickets", { cache: "no-store" });
      if (response.status === 401) { setHistoryRequiresLogin(true); return; }
      const payload = await response.json() as { data?: TicketHistoryItem[] };
      if (response.ok) setTickets(payload.data ?? []);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { void loadHistory(); }, [loadHistory]);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const name = event.target.name as keyof TicketFields;
    setFields((current) => ({ ...current, [name]: event.target.value }));
  }

  function touchField(name: keyof TicketFields) {
    setTouched((current) => new Set(current).add(name));
  }

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formValid || submitting) {
      setTouched(new Set(["name", "email", "topic", "message"]));
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fields),
      });
      const payload = await response.json() as { data?: { reference?: string }; error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Sorğu göndərilmədi.");
      setReference(payload.data?.reference ?? "");
      setSubmitted(true);
      await loadHistory();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Sorğu göndərilmədi. Yenidən yoxla.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetTicket() {
    setFields(initialFields);
    setTouched(new Set());
    setSubmitted(false);
    setSubmitError("");
    setReference("");
  }

  return (
    <section id="support" className="support-section route-module-section" aria-labelledby="support-title">
      <motion.div
        className="support-heading"
        initial={reduceMotion ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease }}
      >
        <div>
          <span className="support-kicker">Yardım mərkəzi</span>
          <h1 id="support-title" className="module-page-title">Dəstək</h1>
        </div>
      </motion.div>

      <div className="support-layout">
        <motion.div
          className="faq-panel"
          initial={reduceMotion ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="support-panel-label">
            <span>Tez-tez verilən suallar</span>
            <small>{String(supportFaqs.length).padStart(2, "0")} cavab</small>
          </div>

          <div className="faq-list">
            {supportFaqs.map((faq, index) => {
              const open = openFaq === faq.id;
              const answerId = `faq-answer-${faq.id}`;
              return (
                <div className={`faq-item${open ? " is-open" : ""}`} key={faq.id}>
                  <h3>
                    <button
                      id={`faq-trigger-${faq.id}`}
                      type="button"
                      onClick={() => setOpenFaq(open ? null : faq.id)}
                      aria-expanded={open}
                      aria-controls={answerId}
                    >
                      <span className="faq-number">{String(index + 1).padStart(2, "0")}</span>
                      <strong>{faq.question}</strong>
                      <motion.i animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease }}>
                        <ChevronDown size={16} />
                      </motion.i>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={answerId}
                        className="faq-answer"
                        role="region"
                        aria-labelledby={`faq-trigger-${faq.id}`}
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.38, ease }}
                      >
                        <p>{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="faq-contact-note">
            <LifeBuoy size={17} />
            <p><strong>Hələ də sualın var?</strong> İcma nümayəndəmiz adətən bir iş günü ərzində cavab verir.</p>
          </div>
        </motion.div>

        <motion.div
          className="ticket-panel"
          initial={reduceMotion ? false : { opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.08, ease }}
        >
          <div className="ticket-progress-head">
            <div>
              <span>Dəstək sorğusu göndər</span>
              <small>Məcburi xanaları doldur, sorğunu aidiyyəti komandaya çatdıraq.</small>
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.div
                key="success"
                className="ticket-success"
                initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                role="status"
              >
                <motion.span
                  initial={reduceMotion ? false : { scale: 0, rotate: -18 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 330, damping: 18, delay: 0.12 }}
                >
                  <Check size={24} />
                </motion.span>
                <small>Dəstək sorğusu qəbul edildi</small>
                <h3>Etibarlı əllərdəsən.</h3>
                <p>Sorğun qəbul edildi. İcma nümayəndəmiz {fields.email} ünvanı ilə bir iş günü ərzində əlaqə saxlayacaq.</p>
                {reference && <small>Müraciət kodu: {reference}</small>}
                <button type="button" onClick={resetTicket}>
                  Yeni sorğu göndər <ArrowRight size={14} />
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="ticket-form"
                onSubmit={submitTicket}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              >
                <div className={`floating-field${fields.name ? " has-value" : ""}${touched.has("name") && !validity.name ? " has-error" : ""}`}>
                  <input
                    id="ticket-name"
                    name="name"
                    type="text"
                    value={fields.name}
                    onChange={updateField}
                    onBlur={() => touchField("name")}
                    placeholder=" "
                    autoComplete="name"
                    minLength={2}
                    aria-invalid={touched.has("name") && !validity.name}
                    aria-describedby={touched.has("name") && !validity.name ? "ticket-name-error" : undefined}
                    required
                  />
                  <label htmlFor="ticket-name">Adın</label>
                  {touched.has("name") && !validity.name && <small id="ticket-name-error" className="field-error">Ən azı 2 simvol daxil et.</small>}
                </div>

                <div className={`floating-field${fields.email ? " has-value" : ""}${touched.has("email") && !validity.email ? " has-error" : ""}`}>
                  <input
                    id="ticket-email"
                    name="email"
                    type="email"
                    value={fields.email}
                    onChange={updateField}
                    onBlur={() => touchField("email")}
                    placeholder=" "
                    autoComplete="email"
                    aria-invalid={touched.has("email") && !validity.email}
                    aria-describedby={touched.has("email") && !validity.email ? "ticket-email-error" : undefined}
                    required
                  />
                  <label htmlFor="ticket-email">E-poçt ünvanın</label>
                  {touched.has("email") && !validity.email && <small id="ticket-email-error" className="field-error">Düzgün e-poçt ünvanı daxil et.</small>}
                </div>

                <div className={`floating-field floating-select${fields.topic ? " has-value" : ""}${touched.has("topic") && !validity.topic ? " has-error" : ""}`}>
                  <select
                    id="ticket-topic"
                    name="topic"
                    value={fields.topic}
                    onChange={updateField}
                    onBlur={() => touchField("topic")}
                    aria-invalid={touched.has("topic") && !validity.topic}
                    aria-describedby={touched.has("topic") && !validity.topic ? "ticket-topic-error" : undefined}
                    required
                  >
                    <option value="" disabled aria-label="Mövzu seç" />
                    {ticketTopics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
                  </select>
                  <label htmlFor="ticket-topic">Sənə nə ilə kömək edə bilərik?</label>
                  <ChevronDown size={15} aria-hidden="true" />
                  {touched.has("topic") && !validity.topic && <small id="ticket-topic-error" className="field-error">Ən uyğun mövzunu seç.</small>}
                </div>

                <div className={`floating-field floating-textarea${fields.message ? " has-value" : ""}${touched.has("message") && !validity.message ? " has-error" : ""}`}>
                  <textarea
                    id="ticket-message"
                    name="message"
                    value={fields.message}
                    onChange={updateField}
                    onBlur={() => touchField("message")}
                    placeholder=" "
                    rows={5}
                    minLength={20}
                    aria-invalid={touched.has("message") && !validity.message}
                    aria-describedby={touched.has("message") && !validity.message ? "ticket-message-error" : undefined}
                    required
                  />
                  <label htmlFor="ticket-message">Nə baş verdiyini bizə yaz</label>
                  {touched.has("message") && !validity.message && <small id="ticket-message-error" className="field-error">Bir az daha ətraflı yaz (ən azı 20 simvol).</small>}
                </div>

                <div className="ticket-form-footer">
                  <span>{formValid ? "Sorğu göndərilməyə hazırdır" : "Bütün məcburi xanaları doldur"}</span>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  >
                    {submitting ? <i className="ticket-spinner" /> : <Send size={14} />}
                    {submitting ? "Göndərilir" : "Sorğunu göndər"}
                  </motion.button>
                </div>
                {submitError && <p className="ticket-submit-error" role="alert">{submitError}</p>}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <section className="ticket-history" aria-labelledby="ticket-history-title">
        <header>
          <span>Müraciətlərim</span>
          <h2 id="ticket-history-title">Dəstək tarixçəsi</h2>
        </header>
        {historyLoading ? (
          <div className="ticket-history__loading" aria-label="Müraciətlər yüklənir"><i /><i /></div>
        ) : historyRequiresLogin ? (
          <p className="ticket-history__empty">Müraciət tarixçəsini görmək üçün hesabınıza daxil olun.</p>
        ) : tickets.length === 0 ? (
          <p className="ticket-history__empty">Hesabınıza bağlı dəstək müraciəti yoxdur.</p>
        ) : (
          <div className="ticket-history__list">
            {tickets.map((ticket) => (
              <article key={ticket.id}>
                <div><small>{ticket.reference}</small><strong>{ticket.topic}</strong></div>
                <span className={`is-${ticket.status}`}>{ticketStatusLabel(ticket.status)}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function ticketStatusLabel(status: TicketHistoryItem["status"]) {
  return status === "open" ? "Açıq" : status === "in_progress" ? "İcradadır" : "Həll edilib";
}
