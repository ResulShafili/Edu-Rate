"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "./AuthProvider";
import { usePlatform } from "./PlatformProvider";

const KINDS = [
  { value: "satiram", label: "Satıram" },
  { value: "axtariram", label: "Axtarıram" },
  { value: "pulsuz", label: "Pulsuz verirəm" },
  { value: "komek", label: "Kömək təklif edirəm" },
] as const;

const CATEGORIES = [
  { value: "kitab", label: "Kitab" },
  { value: "texnika", label: "Texnika" },
  { value: "ders", label: "Dərs köməyi" },
  { value: "yasayis", label: "Yaşayış" },
  { value: "diger", label: "Digər" },
] as const;

type Kind = (typeof KINDS)[number]["value"];
type Category = (typeof CATEGORIES)[number]["value"];

type Listing = {
  id: string;
  title: string;
  details: string;
  kind: Kind;
  category: Category;
  price: string;
  createdAt: string;
  mine: boolean;
  contact?: { userId: string; name: string };
};

const emptyDraft = { title: "", details: "", kind: "satiram" as Kind, category: "kitab" as Category, price: "" };

function label(list: readonly { value: string; label: string }[], value: string) {
  return list.find((item) => item.value === value)?.label ?? value;
}

export function MarketplaceExperience() {
  const { user } = useAuth();
  const { openConversation } = usePlatform();
  const reduceMotion = Boolean(useReducedMotion());
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const query = filter === "all" ? "" : `?category=${filter}`;
        const response = await fetch(`/api/marketplace${query}`, { cache: "no-store" });
        const payload = await response.json() as { data?: Listing[] };
        if (!cancelled && response.ok) setListings(payload.data ?? []);
      } catch {
        // Şəbəkə xətası: boş siyahı.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (draft.title.trim().length < 4) {
      setError("Elanın başlığını yaz.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: draft.title.trim(),
          details: draft.details.trim(),
          kind: draft.kind,
          category: draft.category,
          price: draft.price.trim(),
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new Error(payload?.error?.message ?? "Elan yerləşdirilmədi.");
      }
      setDraft(emptyDraft);
      setFormOpen(false);
      const query = filter === "all" ? "" : `?category=${filter}`;
      const refreshed = await fetch(`/api/marketplace${query}`, { cache: "no-store" });
      const payload = await refreshed.json() as { data?: Listing[] };
      if (refreshed.ok) setListings(payload.data ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Elan yerləşdirilmədi.");
    } finally {
      setSaving(false);
    }
  }

  async function close(id: string) {
    const previous = listings;
    setListings((current) => current.filter((item) => item.id !== id));
    const response = await fetch(`/api/marketplace/${id}`, { method: "DELETE" });
    if (!response.ok) { setListings(previous); setError("Elan bağlanmadı."); }
  }

  return (
    <section className="market-shell">
      <header className="section-heading">
        <div>
          <span>Tələbə lövhəsi</span>
          <h1 className="module-page-title">Elanlar lövhəsi</h1>
        </div>
        {user ? (
          <button type="button" className="kuds-primary-button" onClick={() => setFormOpen((value) => !value)}>
            <Plus size={16} /> Elan yerləşdir
          </button>
        ) : (
          <Link href="/auth" className="kuds-primary-button">Elan üçün daxil ol</Link>
        )}
      </header>

      <p className="compare-lead">
        Kitab, kalkulyator, dərs köməyi və ya ev yoldaşı — tələbədən tələbəyə. Əlaqə məlumatı yalnız daxil olmuş
        istifadəçilərə görünür və danışıq platformanın öz söhbətində aparılır.
      </p>

      <div className="market-filters">
        <button type="button" className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>Hamısı</button>
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            className={filter === category.value ? "is-active" : ""}
            onClick={() => setFilter(category.value)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {formOpen && user ? (
          <motion.form
            className="schedule-form"
            onSubmit={submit}
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="schedule-form__grid">
              <label>
                Başlıq
                <input
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  maxLength={140}
                  placeholder="Riyazi analiz dərsliyi"
                />
              </label>
              <label>
                Qiymət (istəyə bağlı)
                <input
                  value={draft.price}
                  onChange={(event) => setDraft({ ...draft, price: event.target.value })}
                  maxLength={40}
                  placeholder="15 AZN"
                />
              </label>
              <label>
                Elan növü
                <select value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as Kind })}>
                  {KINDS.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
                </select>
              </label>
              <label>
                Kateqoriya
                <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as Category })}>
                  {CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </select>
              </label>
            </div>
            <label>
              Təfərrüat
              <textarea
                value={draft.details}
                onChange={(event) => setDraft({ ...draft, details: event.target.value })}
                maxLength={1000}
                rows={3}
                placeholder="Vəziyyəti, nəşr ili, harada təhvil verə bilərsən…"
              />
            </label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <div className="schedule-form__actions">
              <button type="submit" className="kuds-primary-button" disabled={saving}>{saving ? "Yerləşdirilir…" : "Elanı yerləşdir"}</button>
              <button type="button" onClick={() => { setFormOpen(false); setError(""); }}>Ləğv et</button>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>

      {loading ? <p className="chat-state">Elanlar yüklənir…</p> : listings.length ? (
        <div className="market-grid">
          {listings.map((listing) => (
            <article key={listing.id} className="market-card">
              <div className="market-card__head">
                <span className={`market-kind market-kind--${listing.kind}`}>{label(KINDS, listing.kind)}</span>
                <small>{label(CATEGORIES, listing.category)}</small>
              </div>
              <h2>{listing.title}</h2>
              {listing.price ? <strong className="market-price">{listing.price}</strong> : null}
              {listing.details ? <p>{listing.details}</p> : null}
              <div className="market-card__foot">
                {listing.mine ? (
                  <button type="button" className="market-close" onClick={() => void close(listing.id)}>
                    <Trash2 size={13} /> Elanı bağla
                  </button>
                ) : listing.contact ? (
                  <button
                    type="button"
                    className="market-contact"
                    onClick={() => openConversation({
                      id: listing.contact!.userId,
                      name: listing.contact!.name,
                      initials: listing.contact!.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("az")).join(""),
                      role: "Tələbə",
                      focus: "",
                      bio: "",
                      city: "",
                      status: "online",
                      accent: "#8fc15f",
                      glow: "rgba(143,193,95,.28)",
                      mutuals: 0,
                      tags: [],
                      openingMessage: "",
                      reply: "",
                    })}
                  >
                    <MessageCircle size={13} /> {listing.contact.name}-ə yaz
                  </button>
                ) : (
                  <Link href="/auth" className="market-contact">Əlaqə üçün daxil ol</Link>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="schedule-empty">
          <ShoppingBag size={28} />
          <h2>Hələ elan yoxdur</h2>
          <p>Keçən semestrdən qalan dərsliyi sat, kalkulyator axtar və ya dərs köməyi təklif et — ilk elanı sən yerləşdir.</p>
        </div>
      )}
    </section>
  );
}
