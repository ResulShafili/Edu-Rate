"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  CalendarDays,
  Check,
  GraduationCap,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Sparkles,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import useSWR from "swr";
import {
  canonicalUniversity,
  faculties,
  getProgramsForFaculty,
  isFacultyName,
  isValidFacultyProgram,
  type FacultyName,
} from "../data/academic-programs";
import type { ProfileStat, ProfileUpdateInput } from "../data/user";
import {
  isAuthProviderUnavailable,
  useAuth,
} from "./AuthProvider";
import { SessionManager } from "./SessionManager";
import { SecureImagePicker } from "./SecureImagePicker";
import type { MediaAsset } from "../lib/media-upload";

const ease = [0.22, 1, 0.36, 1] as const;
const enterTransition = { duration: 0.62, ease };
const viewportOnce = { once: true, margin: "-48px" } as const;

const statIcons: Record<ProfileStat["id"], LucideIcon> = {
  events: CalendarDays,
  connections: UsersRound,
  saved: Bookmark,
};
const metricIcons: LucideIcon[] = [CalendarDays, UsersRound, Bookmark, BadgeCheck];

type ProfileWorkspace = {
  metrics: Array<{ label: string; value: string | number }>;
  items: Array<{ id: string; title?: string; text?: string; status: string; type?: string }>;
};

type ProfileConnection = {
  id: string;
  name: string;
  role: string;
  program: string;
  city: string;
};

async function loadProfileWorkspace(): Promise<ProfileWorkspace> {
  const response = await fetch("/api/workspace", { cache: "no-store" });
  const payload = await response.json() as { data?: ProfileWorkspace; error?: { message?: string } };
  if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "Profil göstəriciləri yüklənmədi.");
  return payload.data;
}

async function loadAvatar():Promise<MediaAsset|null>{const response=await fetch("/api/media/avatar/me",{cache:"no-store"});const payload=await response.json() as {data?:MediaAsset|null};return response.ok?payload.data??null:null;}

async function loadProfileConnections(currentUserId: string): Promise<ProfileConnection[]> {
  const [usersResponse, connectionsResponse] = await Promise.all([
    fetch("/api/community/users", { cache: "no-store" }),
    fetch("/api/community/connections", { cache: "no-store" }),
  ]);
  const usersPayload = await usersResponse.json() as {
    data?: Array<{ id: string; name: string; role: string; program: string; city: string }>;
    error?: { message?: string };
  };
  const connectionsPayload = await connectionsResponse.json() as {
    data?: Array<{ id: string; requesterId: string; recipientId: string; status: string }>;
    error?: { message?: string };
  };
  if (!usersResponse.ok || !connectionsResponse.ok) {
    throw new Error(usersPayload.error?.message ?? connectionsPayload.error?.message ?? "Əlaqələr yüklənmədi.");
  }

  const users = new Map((usersPayload.data ?? []).map((entry) => [entry.id, entry]));
  return (connectionsPayload.data ?? [])
    .filter((entry) => entry.status === "accepted")
    .flatMap((entry) => {
      const peerId = entry.requesterId === currentUserId ? entry.recipientId : entry.requesterId;
      const peer = users.get(peerId);
      return peer ? [{ id: peer.id, name: peer.name, role: peer.role, program: peer.program, city: peer.city }] : [];
    });
}

export function UserProfileDashboard() {
  const [editing, setEditing] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [editFaculty, setEditFaculty] = useState<FacultyName | "">("");
  const [editProgram, setEditProgram] = useState("");
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const reduceMotion = Boolean(useReducedMotion());
  const router = useRouter();
  const {
    credentialAuthAvailable,
    signOut,
    signOutHref,
    status,
    updateProfile,
    user,
  } = useAuth();
  const submitting = status === "submitting";
  const workspace = useSWR(user ? `profile-workspace-summary:${user.id}` : null, loadProfileWorkspace, {
    revalidateOnFocus: false,
  });
  const avatar=useSWR(user?`profile-avatar:${user.id}`:null,loadAvatar,{revalidateOnFocus:false});
  const profileConnections = useSWR(
    user ? `profile-connections:${user.id}` : null,
    () => loadProfileConnections(user!.id),
    { revalidateOnFocus: false },
  );

  useEffect(() => {
    const refreshConnections = () => { void profileConnections.mutate(); };
    window.addEventListener("edurate:connections-changed", refreshConnections);
    return () => window.removeEventListener("edurate:connections-changed", refreshConnections);
  }, [profileConnections]);

  async function handleSignOut() {
    if (submitting) return;
    setProfileMessage("");

    try {
      await signOut();
      router.push("/auth");
    } catch (error) {
      setProfileMessage(
        isAuthProviderUnavailable(error)
          ? "Hesab provayderi qoşulmayıb; bu sessiya üçün çıxış əməliyyatı əlçatan deyil."
          : "Hesabdan çıxmaq mümkün olmadı. Yenidən cəhd et.",
      );
    }
  }

  async function handleProfileUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || submitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const input: ProfileUpdateInput = {
      name: readValue(formData, "name"),
      university: readValue(formData, "university"),
      faculty: readValue(formData, "faculty"),
      program: readValue(formData, "program"),
      year: readValue(formData, "year"),
      about: readValue(formData, "about"),
    };

    if (!input.name || input.university !== canonicalUniversity) {
      setProfileMessage("Adını daxil et və universitet olaraq Qarabağ Universitetini seç.");
      return;
    }

    if (user.accessRole === "student" && !isValidFacultyProgram(input.faculty, input.program)) {
      setProfileMessage("Fakültə və ixtisası uyğun siyahıdan seç.");
      return;
    }
    if (user.accessRole !== "student" && input.program.length < 2) {
      setProfileMessage(user.accessRole === "teacher" ? "Tədris sahəsini daxil et." : "Ekspertiza sahəsini daxil et.");
      return;
    }

    try {
      await updateProfile(input);
      setEditing(false);
      setProfileMessage("Profil məlumatların yeniləndi.");
    } catch (error) {
      setProfileMessage(
        isAuthProviderUnavailable(error)
          ? "Profil yaddaşı hələ qoşulmayıb; dəyişikliklər saxlanılmadı."
          : "Profili yeniləmək mümkün olmadı. Yenidən cəhd et.",
      );
    }
  }

  if (!user) {
    return (
      <section className="profile-section profile-empty-section" aria-labelledby="profile-empty-title">
        <motion.div
          className="profile-empty-card"
          initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={enterTransition}
        >
          <span className="profile-empty-mark" aria-hidden="true"><Sparkles size={20} /></span>
          <span className="profile-kicker">Şəxsi öyrənmə məkanın</span>
          <h1 id="profile-empty-title">Profilin səni gözləyir.</h1>
          <p>Tədbirlərini, əlaqələrini və inkişaf yolunu bir yerdə görmək üçün hesabına daxil ol.</p>
          <Link href="/auth" className="profile-empty-action">
            Daxil ol <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </motion.div>
      </section>
    );
  }

  const isStudent = user.accessRole === "student";
  const baseProfileMetrics = workspace.data?.metrics.map((metric, index) => ({
    id: `workspace-${index}`,
    label: metric.label,
    value: metric.value,
    Icon: metricIcons[index % metricIcons.length],
  })) ?? user.stats.map((stat) => ({ ...stat, Icon: statIcons[stat.id] }));
  const profileMetrics = [
    ...baseProfileMetrics.filter((metric) => metric.id !== "connections" && !metric.label.toLocaleLowerCase("az").includes("əlaqə")),
    {
      id: "connections",
      label: "Əlaqələr",
      value: profileConnections.isLoading ? "—" : profileConnections.data?.length ?? 0,
      Icon: UsersRound,
    },
  ];
  const recentItems = workspace.data?.items ?? [];

  return (
    <section className="profile-section" aria-labelledby="profile-title">
      <div className="profile-ambient profile-ambient-one" aria-hidden="true" />
      <div className="profile-ambient profile-ambient-two" aria-hidden="true" />

      <motion.header
        className="profile-hero"
        initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={enterTransition}
      >
        <div className="profile-avatar-shell" aria-hidden="true">
          <span className={`profile-avatar${avatar.data?.secureUrl?" has-image":""}`} style={avatar.data?.secureUrl?{"--avatar-image":`url("${avatar.data.secureUrl}")`} as CSSProperties:undefined}>{avatar.data?.secureUrl?null:user.initials}</span>
          <i className="profile-avatar-orbit" />
          <i className="profile-avatar-status" />
        </div>

        <div className="profile-hero-copy">
          <span className="profile-kicker">Profil</span>
          <h1 id="profile-title">{user.name}</h1>
          <p>{user.program}</p>
          <div className="profile-identity-meta">
            <span><BadgeCheck size={14} aria-hidden="true" /> {user.role}</span>
            <span><Mail size={14} aria-hidden="true" /> {user.email}</span>
            <span><MapPin size={14} aria-hidden="true" /> {user.city}</span>
          </div>
        </div>

        <div className="profile-hero-actions">
          {credentialAuthAvailable && (
            <button
              type="button"
              className="profile-edit-button"
              aria-expanded={editing}
              aria-controls="profile-edit-panel"
              onClick={() => {
                if (!editing) {
                  const nextFaculty = isStudent && isFacultyName(user.faculty) ? user.faculty : "";
                  setEditFaculty(nextFaculty);
                  setEditProgram(
                    isStudent ? (isValidFacultyProgram(nextFaculty, user.program) ? user.program : "") : user.program,
                  );
                }
                setEditing((open) => !open);
                setProfileMessage("");
              }}
            >
              {editing ? <X size={15} aria-hidden="true" /> : <Pencil size={15} aria-hidden="true" />}
              {editing ? "Redaktəni bağla" : "Məlumatları redaktə et"}
            </button>
          )}
          {signOutHref ? (
            <a href={signOutHref} className="profile-signout-button">
              <LogOut size={15} aria-hidden="true" /> Hesabdan çıx
            </a>
          ) : (
            <button type="button" className="profile-signout-button" onClick={handleSignOut} disabled={submitting}>
              <LogOut size={15} aria-hidden="true" /> Hesabdan çıx
            </button>
          )}
        </div>
      </motion.header>

      <AnimatePresence initial={false}>
        {editing && (
          <motion.section
            id="profile-edit-panel"
            className="profile-edit-panel"
            aria-labelledby="profile-edit-title"
            initial={reduceMotion ? false : { opacity: 0, y: -16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -12, scale: 0.99 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.36, ease }}
          >
            <div className="profile-edit-heading">
              <div>
                <span>Hesab</span>
                <h2 id="profile-edit-title">Profil məlumatları</h2>
              </div>
            </div>

            <form className="profile-edit-form" onSubmit={handleProfileUpdate}>
              <div className="profile-image-field"><span>Profil şəkli</span><SecureImagePicker kind="avatar" currentUrl={avatar.data?.secureUrl} onChange={(asset)=>void avatar.mutate(asset,false)}/></div>
              <ProfileEditField label="Ad və soyad" name="name" defaultValue={user.name} autoComplete="name" required />
              <label className="profile-edit-field">
                <span>Universitet</span>
                <select name="university" defaultValue={canonicalUniversity} autoComplete="organization" required>
                  <option value={canonicalUniversity}>{canonicalUniversity}</option>
                </select>
              </label>
              {isStudent ? <label className="profile-edit-field">
                <span>Fakültə</span>
                <select
                  name="faculty"
                  value={editFaculty}
                  autoComplete="organization-title"
                  onChange={(event) => {
                    const faculty = event.target.value;
                    setEditFaculty(isFacultyName(faculty) ? faculty : "");
                    setEditProgram("");
                  }}
                  required
                >
                  <option value="" disabled>Fakültəni seç</option>
                  {faculties.map((faculty) => <option key={faculty} value={faculty}>{faculty}</option>)}
                </select>
              </label> : <input type="hidden" name="faculty" value={user.faculty} />}
              <label className="profile-edit-field">
                <span>{isStudent ? "İxtisas" : user.accessRole === "teacher" ? "Tədris sahəsi" : "Ekspertiza sahəsi"}</span>
                {isStudent ? <select
                  name="program"
                  value={editProgram}
                  onChange={(event) => setEditProgram(event.target.value)}
                  disabled={!editFaculty}
                  required
                >
                  <option value="" disabled>{editFaculty ? "İxtisası seç" : "Əvvəl fakültəni seç"}</option>
                  {getProgramsForFaculty(editFaculty).map((program) => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select> : <input name="program" type="text" value={editProgram} onChange={(event) => setEditProgram(event.target.value)} required />}
              </label>
              <ProfileEditField label={isStudent ? "Kurs" : "Təcrübə / vəzifə"} name="year" defaultValue={user.year} />
              <label className="profile-edit-field profile-edit-about">
                <span>Mənim haqqımda</span>
                <textarea name="about" defaultValue={user.about} maxLength={280} rows={4} />
              </label>

              <div className="profile-edit-footer">
                <button type="button" onClick={() => setEditing(false)} disabled={submitting}>Ləğv et</button>
                <motion.button
                  type="submit"
                  className="profile-save-button"
                  disabled={submitting}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                >
                  <Check size={15} aria-hidden="true" /> {submitting ? "Yadda saxlanılır…" : "Yadda saxla"}
                </motion.button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <p
        className={`profile-status-message${profileMessage ? " is-visible" : ""}`}
        role={profileMessage.includes("mümkün olmadı") || profileMessage.includes("daxil et") || profileMessage.includes("seç") || profileMessage.includes("qoşulmayıb") ? "alert" : "status"}
        aria-live="polite"
      >
        {profileMessage}
      </p>

      <SessionManager />

      <motion.div
        className="profile-stats"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={enterTransition}
        aria-label="Profil göstəriciləri"
      >
        {profileMetrics.map((stat) => {
          const Icon = stat.Icon;
          const value = typeof stat.value === "number" ? String(stat.value).padStart(2, "0") : stat.value;
          return (
            <button
              key={stat.id}
              type="button"
              className={`profile-stat-card${stat.id === "connections" ? " profile-stat-button" : ""}`}
              onClick={stat.id === "connections" ? () => setConnectionsOpen(true) : undefined}
              disabled={stat.id !== "connections"}
              aria-haspopup={stat.id === "connections" ? "dialog" : undefined}
            >
              <span><Icon size={16} aria-hidden="true" /></span>
              <strong>{value}</strong>
              <p>{stat.label}</p>
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {connectionsOpen ? (
          <motion.div
            className="profile-connections-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" className="profile-connections-backdrop" onClick={() => setConnectionsOpen(false)} aria-label="Əlaqələr siyahısını bağla" />
            <motion.section
              className="profile-connections-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-connections-title"
              initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 32 }}
            >
              <header>
                <div><span>İcma</span><h2 id="profile-connections-title">Əlaqələrin</h2></div>
                <button type="button" onClick={() => setConnectionsOpen(false)} aria-label="Bağla"><X size={18} /></button>
              </header>
              {profileConnections.error ? (
                <p className="profile-connections-empty" role="alert">Əlaqələri yükləmək mümkün olmadı.</p>
              ) : profileConnections.isLoading ? (
                <div className="profile-connections-loading" aria-label="Əlaqələr yüklənir"><i /><i /><i /></div>
              ) : profileConnections.data?.length ? (
                <ul className="profile-connections-list">
                  {profileConnections.data.map((connection) => (
                    <li key={connection.id}>
                      <span className="profile-connection-avatar" aria-hidden="true">{connection.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toLocaleUpperCase("az")}</span>
                      <div><strong>{connection.name}</strong><small>{connection.program || connection.role}{connection.city ? ` · ${connection.city}` : ""}</small></div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="profile-connections-empty">Hələ qəbul edilmiş əlaqən yoxdur.</p>
              )}
              <Link href="/community" className="profile-connections-link" onClick={() => setConnectionsOpen(false)}>İcmanı aç <ArrowRight size={15} /></Link>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="profile-dashboard-grid">
        <motion.article
          className="profile-info-card profile-about-card"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={reduceMotion ? undefined : { y: -5, scale: 1.008 }}
          viewport={viewportOnce}
          transition={enterTransition}
        >
          <span className="profile-card-number">01</span>
          <div>
            <span className="profile-card-kicker">Təhsil məlumatları</span>
            <h2>{isStudent ? "Akademik profil" : "Peşəkar profil"}</h2>
            <p>{user.about || "Haqqında qısa məlumat əlavə edilməyib."}</p>
          </div>
          <dl className="profile-facts">
            <div><dt>Universitet</dt><dd>{user.university}</dd></div>
            {isStudent && <div><dt>Fakültə</dt><dd>{user.faculty}</dd></div>}
            <div><dt>{isStudent ? "İxtisas" : user.accessRole === "teacher" ? "Tədris sahəsi" : "Ekspertiza sahəsi"}</dt><dd>{user.program}</dd></div>
            <div><dt>{isStudent ? "Kurs" : "Təcrübə / vəzifə"}</dt><dd>{user.year}</dd></div>
          </dl>
        </motion.article>

        <motion.article
          className="profile-info-card profile-progress-card"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={reduceMotion ? undefined : { y: -5, scale: 1.008 }}
          viewport={viewportOnce}
          transition={{ ...enterTransition, delay: reduceMotion ? 0 : 0.06 }}
        >
          <span className="profile-card-number">02</span>
          <div>
            <span className="profile-card-kicker">Profil vəziyyəti</span>
            <strong>{user.completion}%</strong>
            <p>{user.completion >= 100 ? "Bütün profil məlumatları tamamlanıb." : "Çatışmayan məlumatları redaktə bölməsindən tamamlaya bilərsən."}</p>
          </div>
          <div
            className="profile-progress-track"
            role="progressbar"
            aria-label="Profil tamamlanması"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={user.completion}
          >
            <motion.i
              initial={reduceMotion ? false : { scaleX: 0 }}
              whileInView={{ scaleX: user.completion / 100 }}
              viewport={viewportOnce}
              transition={{ duration: reduceMotion ? 0 : 0.8, ease }}
            />
          </div>
        </motion.article>

        <motion.article
          className="profile-info-card profile-interests-card"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={reduceMotion ? undefined : { y: -5, scale: 1.008 }}
          viewport={viewportOnce}
          transition={enterTransition}
        >
          <span className="profile-card-number">03</span>
          <div>
            <span className="profile-card-kicker">Hesab məlumatları</span>
            <h2>Hesabın</h2>
          </div>
          <dl className="profile-account-details">
            <div><dt>E-poçt</dt><dd><Mail size={14} aria-hidden="true" />{user.email}</dd></div>
            <div><dt>Hesab növü</dt><dd><BadgeCheck size={14} aria-hidden="true" />{user.role}</dd></div>
            <div><dt>İstiqamət</dt><dd><GraduationCap size={14} aria-hidden="true" />{user.program}</dd></div>
          </dl>
        </motion.article>

        <motion.article
          className="profile-info-card profile-activity-card"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={reduceMotion ? undefined : { y: -5, scale: 1.008 }}
          viewport={viewportOnce}
          transition={{ ...enterTransition, delay: reduceMotion ? 0 : 0.06 }}
        >
          <span className="profile-card-number">04</span>
          <div>
            <span className="profile-card-kicker">Fəaliyyət</span>
            <h2>Son fəaliyyətlər</h2>
          </div>
          {recentItems.length > 0 ? (
            <ol className="profile-activity-list">
              {recentItems.slice(0, 5).map((activity) => (
                <li key={activity.id}>
                  <span className="profile-activity-dot" aria-hidden="true" />
                  <div>
                    <span>{activity.type ?? "Fəaliyyət"}</span>
                    <h3>{activity.title ?? "EduRate fəaliyyəti"}</h3>
                    {activity.text ? <p>{activity.text}</p> : null}
                  </div>
                  <time>{activity.status}</time>
                </li>
              ))}
            </ol>
          ) : user.activities.length > 0 ? (
            <ol className="profile-activity-list">
              {user.activities.map((activity) => (
                <li key={activity.id}>
                  <span className="profile-activity-dot" aria-hidden="true" />
                  <div>
                    <span>{activity.category}</span>
                    <h3>{activity.title}</h3>
                    <p>{activity.description}</p>
                  </div>
                  <time dateTime={activity.dateTime}>{activity.date}</time>
                </li>
              ))}
            </ol>
          ) : (
            <p className="profile-empty-copy">İlk fəaliyyətin burada görünəcək.</p>
          )}
        </motion.article>
      </div>
    </section>
  );
}

type ProfileEditFieldProps = {
  label: string;
  name: keyof ProfileUpdateInput;
  defaultValue: string;
  autoComplete?: string;
  required?: boolean;
};

function ProfileEditField({
  label,
  name,
  defaultValue,
  autoComplete,
  required = false,
}: ProfileEditFieldProps) {
  return (
    <label className="profile-edit-field">
      <span>{label}</span>
      <input
        name={name}
        type="text"
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        required={required}
      />
    </label>
  );
}

function readValue(formData: FormData, field: keyof ProfileUpdateInput): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}
