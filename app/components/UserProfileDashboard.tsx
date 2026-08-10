"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  CalendarDays,
  Check,
  LogOut,
  MapPin,
  Pencil,
  Sparkles,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
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

const ease = [0.22, 1, 0.36, 1] as const;
const enterTransition = { duration: 0.62, ease };
const viewportOnce = { once: true, margin: "-48px" } as const;

const statIcons: Record<ProfileStat["id"], LucideIcon> = {
  events: CalendarDays,
  connections: UsersRound,
  saved: Bookmark,
};

export function UserProfileDashboard() {
  const [editing, setEditing] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [editFaculty, setEditFaculty] = useState<FacultyName | "">("");
  const [editProgram, setEditProgram] = useState("");
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

  const firstName = user.name.trim().split(/\s+/)[0] || user.name;
  const isStudent = user.accessRole === "student";

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
          <span className="profile-avatar">{user.initials}</span>
          <i className="profile-avatar-orbit" />
          <i className="profile-avatar-status" />
        </div>

        <div className="profile-hero-copy">
          <span className="profile-kicker">{isStudent ? "Tələbə profili" : user.accessRole === "teacher" ? "Müəllim profili" : user.accessRole === "mentor" ? "Mentor profili" : "Rəhbərlik profili"}</span>
          <h1 id="profile-title">Salam, <em>{firstName}.</em></h1>
          <div className="profile-identity-meta">
            <span><BadgeCheck size={14} aria-hidden="true" /> {user.role}</span>
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
              {editing ? "Redaktəni bağla" : "Profilə düzəliş et"}
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

      <motion.div
        className="profile-stats"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={enterTransition}
        aria-label="Profil göstəriciləri"
      >
        {user.stats.map((stat) => {
          const Icon = statIcons[stat.id];
          return (
            <article key={stat.id} className="profile-stat-card">
              <span><Icon size={16} aria-hidden="true" /></span>
              <strong>{String(stat.value).padStart(2, "0")}</strong>
              <p>{stat.label}</p>
            </article>
          );
        })}
      </motion.div>

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
            <span className="profile-card-kicker">Mənim haqqımda</span>
            <h2>{user.program}</h2>
            <p>{user.about}</p>
          </div>
          <dl className="profile-facts">
            <div><dt>Universitet</dt><dd>{user.university}</dd></div>
            {isStudent && <div><dt>Fakültə</dt><dd>{user.faculty}</dd></div>}
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
            <span className="profile-card-kicker">Profil tamamlanması</span>
            <strong>{user.completion}%</strong>
            <p>Bir neçə detal daha əlavə etsən, uyğun tədbir və mentor tövsiyələri daha dəqiq olacaq.</p>
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
            <span className="profile-card-kicker">Maraq dairəm</span>
            <h2>Səni hərəkətə gətirən mövzular.</h2>
          </div>
          {user.interests.length > 0 ? (
            <ul className="profile-interest-list">
              {user.interests.map((interest) => <li key={interest}>{interest}</li>)}
            </ul>
          ) : (
            <p className="profile-empty-copy">Maraq dairən hələ əlavə edilməyib.</p>
          )}
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
            <span className="profile-card-kicker">Son fəaliyyət</span>
            <h2>Son fəaliyyətlər</h2>
          </div>
          {user.activities.length > 0 ? (
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
