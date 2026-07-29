"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useId,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { faculties, universities } from "../data/user";
import { ApiError } from "../lib/api/client";
import {
  isAuthProviderUnavailable,
  useAuth,
} from "./AuthProvider";

type AuthMode = "login" | "register";
type AuthField = "name" | "email" | "password" | "university" | "faculty";
type FieldErrors = Partial<Record<AuthField, string>>;

type AuthFormValues = Record<AuthField, string>;

const ease = [0.22, 1, 0.36, 1] as const;
const panelTransition = { duration: 0.38, ease };

const particles = [
  { id: "one", left: "8%", top: "18%", size: 7, delay: 0, duration: 6.8 },
  { id: "two", left: "19%", top: "73%", size: 11, delay: 0.8, duration: 7.4 },
  { id: "three", left: "42%", top: "11%", size: 5, delay: 1.2, duration: 6.2 },
  { id: "four", left: "68%", top: "22%", size: 9, delay: 0.4, duration: 8 },
  { id: "five", left: "87%", top: "67%", size: 6, delay: 1.7, duration: 7.1 },
  { id: "six", left: "57%", top: "84%", size: 12, delay: 1, duration: 8.4 },
] as const;

const particleAnimation = {
  y: [0, -16, 0],
  scale: [0.88, 1.08, 0.88],
  opacity: [0.16, 0.58, 0.16],
};

type AuthExperienceProps = {
  chatGPTSignInHref: string | null;
  initialMode?: AuthMode;
  returnTo?: string;
};

export function AuthExperience({ chatGPTSignInHref, initialMode = "login", returnTo = "/profile" }: AuthExperienceProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const reduceMotion = Boolean(useReducedMotion());
  const formId = useId();
  const router = useRouter();
  const {
    credentialAuthAvailable,
    register,
    signIn,
    status,
  } = useAuth();
  const submitting = status === "submitting";
  const unavailableMessage = chatGPTSignInHref
    ? "E-poçt və şifrə ilə giriş aktiv deyil. Təhlükəsiz giriş üçün ChatGPT düyməsindən istifadə et."
    : "Təhlükəsiz giriş provayderi hələ qoşulmayıb. Şifrən göndərilmir və saxlanılmır.";
  const visibleMessage = formMessage || (
    credentialAuthAvailable ? "" : unavailableMessage
  );

  function selectMode(nextMode: AuthMode) {
    if (nextMode === mode || submitting) return;
    setMode(nextMode);
    setErrors({});
    setFormMessage("");
    setShowPassword(false);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    let nextMode: AuthMode | null = null;

    if (event.key === "ArrowLeft" || event.key === "Home") nextMode = "login";
    if (event.key === "ArrowRight" || event.key === "End") nextMode = "register";
    if (!nextMode) return;

    event.preventDefault();
    selectMode(nextMode);
    document.getElementById(`${formId}-${nextMode}-tab`)?.focus();
  }

  function handleFormChange(event: FormEvent<HTMLFormElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;

    const field = target.name as AuthField;
    if (!isAuthField(field)) return;

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (formMessage) setFormMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !credentialAuthAvailable) return;

    const form = event.currentTarget;
    const values = readFormValues(new FormData(form));
    const nextErrors = validateAuthForm(mode, values);

    setErrors(nextErrors);
    setFormMessage("");

    const firstInvalidField = Object.keys(nextErrors)[0] as AuthField | undefined;
    if (firstInvalidField) {
      (form.elements.namedItem(firstInvalidField) as HTMLElement | null)?.focus();
      return;
    }

    try {
      if (mode === "login") {
        await signIn({ email: values.email, password: values.password });
        setFormMessage("Daxil oldun. Profilin açılır.");
      } else {
        await register({
          name: values.name,
          email: values.email,
          password: values.password,
          university: values.university,
          faculty: values.faculty,
        });
        setFormMessage("Hazırsan — hesabın yaradıldı. Profilin açılır.");
      }

      form.reset();
      router.push(returnTo);
    } catch (error) {
      if (isAuthProviderUnavailable(error)) {
        setFormMessage(unavailableMessage);
      } else if (error instanceof ApiError) {
        const fieldErrors = readApiFieldErrors(error);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors((current) => ({ ...current, ...fieldErrors }));
          const firstErrorField = Object.keys(fieldErrors)[0] as AuthField;
          (form.elements.namedItem(firstErrorField) as HTMLElement | null)?.focus();
        }
        setFormMessage(error.message);
      } else if (error instanceof Error && error.message) {
        setFormMessage(error.message);
      } else {
        setFormMessage(
          mode === "login"
            ? "Giriş məlumatlarını yoxla və yenidən cəhd et."
            : "Hesabı yaratmaq mümkün olmadı. Məlumatlarını yoxlayıb yenidən cəhd et.",
        );
      }
    }
  }

  const panelHeading = mode === "login"
    ? <>Yenidən <em>xoş gəldin.</em></>
    : <>EduRate icmasına <em>qoşul.</em></>;
  const panelDescription = mode === "login"
    ? "Dərslər, elanlar və öyrənmə çevrən bir addım uzaqdadır."
    : "Universitet həyatını daha əlaqəli və məqsədli etmək üçün profilini yarat.";

  return (
    <section className="auth-section" aria-labelledby="auth-title">
      <div className="auth-particles" aria-hidden="true">
        {particles.map((particle) => (
          <motion.i
            key={particle.id}
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
            } as CSSProperties}
            animate={reduceMotion ? undefined : particleAnimation}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="auth-layout"
        initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease }}
      >
        <aside className="auth-story" aria-label="EduRate universitet şəbəkəsi">
          <div>
            <span className="auth-kicker"><Sparkles size={13} aria-hidden="true" /> Universitet şəbəkən</span>
            <h2>Bir giriş.<br /><em>Bütün tələbə həyatın.</em></h2>
            <p>
              Etibarlı elanları izləmək, doğru insanlarla tanış olmaq və inkişaf yolunu
              bir yerdə saxlamaq üçün düşünülmüş sakit məkan.
            </p>
          </div>
          <div className="auth-story-note">
            <span><i /> Aktiv şəbəkə</span>
            <p>Diqqətini yayındırmayan, universitet həyatına uyğun şəxsi təcrübə.</p>
          </div>
          <div className="auth-orbit auth-orbit-one" aria-hidden="true" />
          <div className="auth-orbit auth-orbit-two" aria-hidden="true" />
        </aside>

        <motion.div className="auth-panel" layout>
          <header className="auth-panel-heading">
            <span>EduRate hesabı</span>
            <h1 id="auth-title">{panelHeading}</h1>
            <p>{panelDescription}</p>
          </header>

          {chatGPTSignInHref && (
            <div className="auth-form-footer">
              <p className="auth-privacy-note">
                <Check size={13} aria-hidden="true" /> Sites-in təhlükəsiz giriş axınıdır; şifrən EduRate-a ötürülmür.
              </p>
              <motion.a
                href={chatGPTSignInHref}
                className="auth-submit"
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                <span>ChatGPT ilə davam et</span>
                <ArrowRight size={16} aria-hidden="true" />
              </motion.a>
            </div>
          )}

          <div className="auth-mode-tabs" role="tablist" aria-label="Hesab əməliyyatı">
            {(["login", "register"] as const).map((tabMode) => {
              const active = mode === tabMode;
              const label = tabMode === "login" ? "Daxil ol" : "Qeydiyyatdan keç";

              return (
                <button
                  key={tabMode}
                  id={`${formId}-${tabMode}-tab`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`${formId}-${tabMode}-panel`}
                  tabIndex={active ? 0 : -1}
                  disabled={submitting}
                  onClick={() => selectMode(tabMode)}
                  onKeyDown={handleTabKeyDown}
                >
                  {active && <motion.i layoutId="active-auth-mode" className="auth-mode-pill" />}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={mode}
              id={`${formId}-${mode}-panel`}
              className="auth-form-panel"
              role="tabpanel"
              aria-labelledby={`${formId}-${mode}-tab`}
              initial={reduceMotion ? false : { opacity: 0, x: mode === "login" ? -24 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: mode === "login" ? 18 : -18 }}
              transition={reduceMotion ? { duration: 0 } : panelTransition}
            >
              <form
                className={`auth-form auth-form-${mode}`}
                noValidate
                aria-busy={submitting}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
              >
                {mode === "register" && (
                  <AuthFieldShell
                    id={`${formId}-name`}
                    label="Ad və soyad"
                    error={errors.name}
                    icon={<UserRound size={16} aria-hidden="true" />}
                  >
                    <input
                      id={`${formId}-name`}
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Məsələn, Aylin Nəcəfli"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? `${formId}-name-error` : undefined}
                      disabled={!credentialAuthAvailable || submitting}
                      required
                    />
                  </AuthFieldShell>
                )}

                <AuthFieldShell
                  id={`${formId}-email`}
                  label="E-poçt ünvanı"
                  error={errors.email}
                  icon={<Mail size={16} aria-hidden="true" />}
                >
                  <input
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="ad.soyad@universitet.az"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? `${formId}-email-error` : undefined}
                    disabled={!credentialAuthAvailable || submitting}
                    required
                  />
                </AuthFieldShell>

                <AuthFieldShell
                  id={`${formId}-password`}
                  label="Şifrə"
                  error={errors.password}
                  icon={<LockKeyhole size={16} aria-hidden="true" />}
                  action={(
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
                      aria-pressed={showPassword}
                      disabled={!credentialAuthAvailable || submitting}
                    >
                      {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                    </button>
                  )}
                >
                  <input
                    id={`${formId}-password`}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="Ən azı 8 simvol"
                    minLength={8}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? `${formId}-password-error` : undefined}
                    disabled={!credentialAuthAvailable || submitting}
                    required
                  />
                </AuthFieldShell>

                {mode === "register" && (
                  <>
                    <AuthFieldShell
                      id={`${formId}-university`}
                      label="Universitet"
                      error={errors.university}
                      icon={<Building2 size={16} aria-hidden="true" />}
                    >
                      <input
                        id={`${formId}-university`}
                        name="university"
                        type="text"
                        list={`${formId}-universities`}
                        autoComplete="organization"
                        placeholder="Universitetini seç və ya yaz"
                        aria-invalid={Boolean(errors.university)}
                        aria-describedby={errors.university ? `${formId}-university-error` : undefined}
                        disabled={!credentialAuthAvailable || submitting}
                        required
                      />
                      <datalist id={`${formId}-universities`}>
                        {universities.map((university) => <option key={university} value={university}>{university}</option>)}
                      </datalist>
                    </AuthFieldShell>

                    <AuthFieldShell
                      id={`${formId}-faculty`}
                      label="Fakültə"
                      error={errors.faculty}
                      icon={<GraduationCap size={16} aria-hidden="true" />}
                    >
                      <input
                        id={`${formId}-faculty`}
                        name="faculty"
                        type="text"
                        list={`${formId}-faculties`}
                        autoComplete="organization-title"
                        placeholder="Fakültəni seç və ya yaz"
                        aria-invalid={Boolean(errors.faculty)}
                        aria-describedby={errors.faculty ? `${formId}-faculty-error` : undefined}
                        disabled={!credentialAuthAvailable || submitting}
                        required
                      />
                      <datalist id={`${formId}-faculties`}>
                        {faculties.map((faculty) => <option key={faculty} value={faculty}>{faculty}</option>)}
                      </datalist>
                    </AuthFieldShell>
                  </>
                )}

                <div className="auth-form-footer">
                  {mode === "login" && (
                    <a className="auth-forgot-link" href="/support?topic=account">Şifrəni unutmusansa, dəstək al</a>
                  )}
                  <p className="auth-privacy-note">
                    <Check size={13} aria-hidden="true" /> Məlumatların yalnız şəxsi təcrübəni qurmaq üçün istifadə olunur.
                  </p>
                  <motion.button
                    type="submit"
                    className="auth-submit"
                    disabled={submitting || !credentialAuthAvailable}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  >
                    <span>
                      {submitting
                        ? "Yoxlanılır…"
                        : !credentialAuthAvailable
                          ? "E-poçt girişi aktiv deyil"
                          : mode === "login"
                            ? "Daxil ol"
                            : "Hesab yarat"}
                    </span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </motion.button>
                </div>

                <p
                  className={`auth-form-message${visibleMessage ? " is-visible" : ""}`}
                  role={formMessage.includes("mümkün olmadı") || formMessage.includes("yoxla") ? "alert" : "status"}
                  aria-live="polite"
                >
                  {visibleMessage}
                </p>
                <p className="auth-legal-links">
                  Davam etməklə <a href="/terms">istifadə şərtləri</a> və <a href="/privacy">məxfilik siyasəti</a> ilə razılaşırsan.
                </p>
              </form>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}

type AuthFieldShellProps = {
  id: string;
  label: string;
  error?: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
};

function AuthFieldShell({ id, label, error, icon, action, children }: AuthFieldShellProps) {
  return (
    <div className={`auth-field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-shell">
        <span className="auth-field-icon">{icon}</span>
        {children}
        {action}
      </div>
      {error && <span id={`${id}-error`} className="auth-field-error">{error}</span>}
    </div>
  );
}

function readFormValues(formData: FormData): AuthFormValues {
  return {
    name: getFormValue(formData, "name"),
    email: getFormValue(formData, "email"),
    password: getFormValue(formData, "password"),
    university: getFormValue(formData, "university"),
    faculty: getFormValue(formData, "faculty"),
  };
}

function getFormValue(formData: FormData, field: AuthField): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function validateAuthForm(mode: AuthMode, values: AuthFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (mode === "register" && values.name.length < 2) errors.name = "Ad və soyadını yaz.";
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Düzgün e-poçt ünvanı yaz.";
  if (values.password.length < 8) {
    errors.password = "Şifrə ən azı 8 simvol olmalıdır.";
  } else if (values.password.length > 72) {
    errors.password = "Şifrə ən çox 72 simvol ola bilər.";
  } else if (!/[a-zA-ZƏəÖöÜüĞğŞşÇçİı]/.test(values.password)) {
    errors.password = "Şifrədə ən azı bir hərf olmalıdır.";
  } else if (!/\d/.test(values.password)) {
    errors.password = "Şifrədə ən azı bir rəqəm olmalıdır.";
  }
  if (mode === "register" && !values.university) errors.university = "Universitetini seç və ya yaz.";
  if (mode === "register" && !values.faculty) errors.faculty = "Fakültəni seç və ya yaz.";

  return errors;
}

function isAuthField(value: string): value is AuthField {
  return ["name", "email", "password", "university", "faculty"].includes(value);
}

function readApiFieldErrors(error: ApiError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  const details = error.details;

  if (details && typeof details === "object" && !Array.isArray(details)) {
    Object.entries(details).forEach(([field, message]) => {
      if (isAuthField(field) && typeof message === "string") {
        fieldErrors[field] = message;
      }
    });
  }

  if (error.code === "EMAIL_EXISTS") {
    fieldErrors.email = "Bu e-poçtla artıq hesab yaradılıb. Daxil ol bölməsindən istifadə et.";
  }

  return fieldErrors;
}
