"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, LifeBuoy, Send } from "lucide-react";
import {
  useEffect,
  useRef,
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
  const submitTimer = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  const validity = getTicketValidity(fields);
  const completedFields = Object.values(validity).filter(Boolean).length;
  const progress = completedFields * 25;

  useEffect(() => () => {
    if (submitTimer.current) window.clearTimeout(submitTimer.current);
  }, []);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const name = event.target.name as keyof TicketFields;
    setFields((current) => ({ ...current, [name]: event.target.value }));
  }

  function touchField(name: keyof TicketFields) {
    setTouched((current) => new Set(current).add(name));
  }

  function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (progress < 100 || submitting) return;
    setSubmitting(true);
    submitTimer.current = window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, reduceMotion ? 80 : 720);
  }

  function resetTicket() {
    setFields(initialFields);
    setTouched(new Set());
    setSubmitted(false);
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
        <span className="support-kicker">05 / Dəstək</span>
        <div>
          <h1 id="support-title" className="module-page-title">Dəstək</h1>
          <p>Əvvəlcə aydın cavab. Lazım olanda isə qayğıkeş bir insan.</p>
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
              <small>Qalanını biz həll edəcəyik.</small>
            </div>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.strong
                key={progress}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              >
                {progress}%
              </motion.strong>
            </AnimatePresence>
          </div>
          <div
            className="ticket-progress"
            role="progressbar"
            aria-label="Dəstək sorğusunun tamamlanması"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-valuetext={`4 məcburi xanadan ${completedFields} xana tamamlanıb`}
          >
            <motion.span
              style={{ transformOrigin: "left center" }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease }}
            />
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
                <p>Təsdiqi {fields.email} ünvanına göndərdik. İcma nümayəndəmiz tezliklə səninlə əlaqə saxlayacaq.</p>
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
                  <span>{progress < 100 ? "Göndərmək üçün bütün xanaları doldur" : "Göndərməyə hazırsan"}</span>
                  <motion.button
                    type="submit"
                    disabled={progress < 100 || submitting}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  >
                    {submitting ? <i className="ticket-spinner" /> : <Send size={14} />}
                    {submitting ? "Göndərilir" : "Sorğunu göndər"}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
