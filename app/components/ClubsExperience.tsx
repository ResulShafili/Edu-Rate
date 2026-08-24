"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ImagePlus, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Club } from "../data/clubs";
import { uploadSecureImage } from "../lib/media-upload";
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
  const [createDraft,setCreateDraft]=useState({name:"",category:"",tagline:"",about:"",meetingDay:"",meetingTime:"",meetingPlace:""});
  const [coverFile,setCoverFile]=useState<File|null>(null);
  const [coverPreview,setCoverPreview]=useState("");
  const coverPreviewRef=useRef("");
  const coverInputRef=useRef<HTMLInputElement>(null);
  const canCreate = Boolean(user?.accessRole && ["teacher", "mentor", "assistant_admin", "admin", "owner_admin"].includes(user.accessRole));

  useEffect(()=>()=>{if(coverPreviewRef.current)URL.revokeObjectURL(coverPreviewRef.current);},[]);

  function selectCover(file?:File){
    setError("");
    if(coverPreviewRef.current)URL.revokeObjectURL(coverPreviewRef.current);
    coverPreviewRef.current="";
    setCoverFile(null);
    setCoverPreview("");
    if(!file&&coverInputRef.current)coverInputRef.current.value="";
    if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setError("Yalnız JPG, PNG və WebP şəkilləri qəbul olunur.");return;}
    if(file.size>5*1024*1024){setError("Klub şəkli 5 MB-dan böyük ola bilməz.");return;}
    coverPreviewRef.current=URL.createObjectURL(file);
    setCoverFile(file);
    setCoverPreview(coverPreviewRef.current);
  }

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
          tagline: String(formData.get("tagline") ?? "").trim(),
          about: String(formData.get("about") ?? "").split(/\r?\n/).map((value)=>value.trim()).filter(Boolean),
          meeting: {
            cadence: "Həftəlik",
            day: String(formData.get("meetingDay") ?? "").trim(),
            time: String(formData.get("meetingTime") ?? "").trim(),
            place: String(formData.get("meetingPlace") ?? "").trim(),
          },
        }),
      });
      const payload = await response.json().catch(() => null) as { data?: { id?: string }; error?: { message?: string } } | null;
      if (!response.ok) throw new Error(payload?.error?.message || "Klub müraciəti göndərilmədi.");
      let imageWarning="";
      if(coverFile&&payload?.data?.id){
        try{await uploadSecureImage(coverFile,"club",payload.data.id);}catch(uploadError){imageWarning=uploadError instanceof Error?uploadError.message:"Şəkil yüklənmədi.";}
      }
      form.reset();
      setCreateDraft({name:"",category:"",tagline:"",about:"",meetingDay:"",meetingTime:"",meetingPlace:""});
      selectCover();
      setSuccess(imageWarning?`Klub yaradıldı, amma şəkil yüklənmədi: ${imageWarning}`:"Klub və örtük şəkli təsdiq üçün göndərildi.");
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
              <div className={`club-create-preview${coverPreview?" has-cover":""}`} aria-label="Klub kartının canlı önizləməsi"><div style={coverPreview?{backgroundImage:`linear-gradient(135deg,rgba(8,37,31,.12),rgba(8,37,31,.62)),url("${coverPreview}")`}:undefined}><span>{coverPreview?"Seçilmiş örtük şəkli":"Örtük şəkli burada görünəcək"}</span></div><small>{createDraft.category||"KATEQORİYA"}</small><h3>{createDraft.name||"Klubun adı burada görünəcək"}</h3><p>{createDraft.tagline||createDraft.about||"Klub haqqında məlumat burada yerləşəcək."}</p></div>
              <form onSubmit={createClub} className="club-create-form">
                <label className="is-wide club-create-cover-picker"><span>Örtük şəkli</span><span className="club-create-cover-actions"><span className="club-create-cover-action"><ImagePlus size={17}/>{coverPreview?"Şəkli dəyiş":"Şəkil seç"}<input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event)=>selectCover(event.target.files?.[0])}/></span>{coverPreview?<button type="button" className="club-create-cover-remove" onClick={()=>selectCover()}><Trash2 size={16}/>Şəkli sil</button>:null}</span><small>JPG, PNG və ya WebP · maksimum 5 MB</small></label>
                <label><span>Klubun adı</span><input name="name" value={createDraft.name} onChange={(e)=>setCreateDraft({...createDraft,name:e.target.value})} minLength={3} maxLength={100} required autoFocus placeholder="Məsələn, Proqramlaşdırma klubu" /></label>
                <label><span>Kateqoriya</span><select name="category" required value={createDraft.category} onChange={(e)=>setCreateDraft({...createDraft,category:e.target.value})}><option value="" disabled>Kateqoriya seç</option><option>Texnologiya</option><option>Akademik</option><option>Yaradıcılıq</option><option>Sosial təsir</option><option>Mədəniyyət</option><option>İdman</option></select></label>
                <label className="is-wide"><span>Qısa şüar</span><input name="tagline" value={createDraft.tagline} onChange={(e)=>setCreateDraft({...createDraft,tagline:e.target.value})} minLength={5} maxLength={220} required placeholder="Klubun əsas fikrini bir cümlə ilə yaz" /></label>
                <label className="is-wide"><span>Haqqında</span><textarea name="about" value={createDraft.about} onChange={(e)=>setCreateDraft({...createDraft,about:e.target.value})} minLength={10} maxLength={3000} rows={4} required placeholder="Klubun fəaliyyəti və üzvlərə verdiyi imkanlar" /></label>
                <label><span>Görüş günü</span><input name="meetingDay" value={createDraft.meetingDay} onChange={(e)=>setCreateDraft({...createDraft,meetingDay:e.target.value})} required placeholder="Məsələn, Çərşənbə"/></label>
                <label><span>Görüş saatı</span><input name="meetingTime" type="time" value={createDraft.meetingTime} onChange={(e)=>setCreateDraft({...createDraft,meetingTime:e.target.value})} required/></label>
                <label className="is-wide"><span>Görüş yeri</span><input name="meetingPlace" value={createDraft.meetingPlace} onChange={(e)=>setCreateDraft({...createDraft,meetingPlace:e.target.value})} minLength={2} maxLength={180} required placeholder="Məsələn, B korpusu, 204-cü otaq"/></label>
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
