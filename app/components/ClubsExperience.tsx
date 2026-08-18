"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Club } from "../data/clubs";
import { useAuth } from "./AuthProvider";
import { ClubCard } from "./ClubCard";

type ClubsExperienceProps = {
  clubs: readonly Club[];
  failed?:boolean;
};

export function ClubsExperience({ clubs, failed=false }: ClubsExperienceProps) {
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createDraft,setCreateDraft]=useState({name:"",category:"",description:""});
  const canCreate = Boolean(user?.accessRole && ["teacher", "mentor", "assistant_admin", "admin"].includes(user.accessRole));

  async function createClub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSuccess("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/clubs", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? "").trim(),
          category: String(formData.get("category") ?? "").trim(),
          description: String(formData.get("description") ?? "").trim(),
        }),
      });
      const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
      if (!response.ok) throw new Error(payload?.error?.message || "Klub müraciəti göndərilmədi.");
      form.reset();
      setCreateDraft({name:"",category:"",description:""});
      setSuccess("Klub müraciəti təsdiq üçün göndərildi.");
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Klub müraciəti göndərilmədi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="clubs-experience">
      <section className="clubs-hero" aria-labelledby="clubs-directory-title">
        <motion.div
          className="clubs-hero-copy"
          initial={reducedMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <span className="clubs-hero-eyebrow">
            <Sparkles size={13} strokeWidth={1.8} aria-hidden="true" />
            Tələbə birlikləri
          </span>
          <h1 id="clubs-directory-title" className="module-page-title">
            Klublar və icmalar
          </h1>
        </motion.div>
      </section>

      <section className="clubs-directory" aria-labelledby="clubs-list-title">
        <header className="clubs-section-heading">
          <div>
            <span>Klublar və təşkilatlar</span>
            <h2 id="clubs-list-title">Klub kataloqu</h2>
          </div>
          {canCreate ? (
            <button type="button" className="club-create-trigger" onClick={() => { setError(""); setSuccess(""); setCreateOpen(true); }}>
              <Plus size={18} aria-hidden="true" />
              Klub yarat
            </button>
          ) : null}
        </header>

        {failed ? <div className="clubs-catalog-state" role="alert"><strong>Klub kataloqu yüklənmədi.</strong><p>Bağlantını yoxlayıb səhifəni yenidən açın.</p></div>
        : clubs.length===0 ? <div className="clubs-catalog-state"><strong>Aktiv klub yoxdur.</strong><p>Yeni klublar təsdiqləndikdə burada görünəcək.</p></div>
        : <div className="clubs-directory-grid">
          {clubs.map((club, index) => (
            <ClubCard key={club.slug} club={club} index={index} />
          ))}
        </div>}
      </section>

      <AnimatePresence>
        {createOpen ? (
          <motion.div className="club-create-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setCreateOpen(false); }}>
            <motion.section
              className="club-create-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="club-create-title"
              initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
            >
              <header>
                <div><small>YENİ KLUB</small><h2 id="club-create-title">Klub yarat</h2></div>
                <button type="button" onClick={() => setCreateOpen(false)} aria-label="Pəncərəni bağla"><X size={19} /></button>
              </header>
              <p className="club-create-intro">Əsas məlumatları yaz. Klub yoxlanıldıqdan sonra kataloqda görünəcək.</p>
              <div className="club-create-preview" aria-label="Klub kartının canlı önizləməsi"><div><span>Örtük şəkli təsdiqdən sonra burada olacaq</span></div><small>{createDraft.category||"KATEQORİYA"}</small><h3>{createDraft.name||"Klubun adı burada görünəcək"}</h3><p>{createDraft.description||"Klub haqqında qısa təsvir burada yerləşəcək."}</p></div>
              <form onSubmit={createClub} className="club-create-form">
                <label><span>Klubun adı</span><input name="name" value={createDraft.name} onChange={(e)=>setCreateDraft({...createDraft,name:e.target.value})} minLength={3} maxLength={100} required autoFocus placeholder="Məsələn, Proqramlaşdırma klubu" /></label>
                <label><span>Kateqoriya</span><select name="category" required value={createDraft.category} onChange={(e)=>setCreateDraft({...createDraft,category:e.target.value})}><option value="" disabled>Kateqoriya seç</option><option>Texnologiya</option><option>Akademik</option><option>Yaradıcılıq</option><option>Sosial təsir</option><option>Mədəniyyət</option><option>İdman</option></select></label>
                <label className="is-wide"><span>Qısa təsvir</span><textarea name="description" value={createDraft.description} onChange={(e)=>setCreateDraft({...createDraft,description:e.target.value})} minLength={10} maxLength={500} rows={4} required placeholder="Klubun məqsədini qısa və aydın yaz" /></label>
                {error ? <p className="club-create-message is-error" role="alert">{error}</p> : null}
                {success ? <p className="club-create-message is-success" role="status">{success}</p> : null}
                <footer><button type="button" onClick={() => setCreateOpen(false)}>Ləğv et</button><button type="submit" disabled={pending}>{pending ? "Göndərilir…" : "Təsdiqə göndər"}</button></footer>
              </form>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>

    </div>
  );
}
