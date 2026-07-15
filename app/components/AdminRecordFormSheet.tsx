"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type {
  AdminClub,
  AdminClubCreateInput,
  AdminCollectionKind,
  AdminCollectionRecord,
  AdminEvent,
  AdminEventCreateInput,
  AdminUser,
  AdminUserCreateInput,
} from "../data/admin";

export type AdminRecordSheetMode = "create" | "edit" | "delete";

export type AdminRecordSubmission =
  | { kind: "users"; input: AdminUserCreateInput }
  | { kind: "clubs"; input: AdminClubCreateInput }
  | { kind: "events"; input: AdminEventCreateInput };

type AdminRecordFormSheetProps = {
  error: string | null;
  kind: AdminCollectionKind;
  mode: AdminRecordSheetMode;
  onClose: () => void;
  onDelete: () => Promise<void>;
  onSubmit: (submission: AdminRecordSubmission) => Promise<void>;
  open: boolean;
  pending: boolean;
  record: AdminCollectionRecord | null;
};

const labels: Record<AdminCollectionKind, { singular: string; plural: string }> = {
  users: { singular: "istifadəçi", plural: "İstifadəçilər" },
  clubs: { singular: "klub", plural: "Klublar" },
  events: { singular: "tədbir", plural: "Tədbirlər" },
};

export function AdminRecordFormSheet({
  error,
  kind,
  mode,
  onClose,
  onDelete,
  onSubmit,
  open,
  pending,
  record,
}: AdminRecordFormSheetProps) {
  const reducedMotion = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const config = labels[kind];

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      if (mode === "delete") {
        panelRef.current?.querySelector<HTMLElement>("[data-delete-cancel]")?.focus();
      } else {
        firstFieldRef.current?.focus();
      }
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [mode, open]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !pending) {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onSubmit(createSubmission(kind, formData));
  }

  const title =
    mode === "create"
      ? `Yeni ${config.singular} yarat`
      : mode === "edit"
        ? `${capitalize(config.singular)} məlumatını yenilə`
        : `${capitalize(config.singular)} qeydini sil?`;
  const description =
    mode === "delete"
      ? "Bu əməliyyat geri qaytarılmır. Təsdiqdən əvvəl qeydi bir daha yoxla."
      : "Yalnız vacib məlumatları daxil et. Dəyişikliklər REST API-yə təhlükəsiz göndəriləcək.";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="admin-record-sheet-backdrop"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.22 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !pending) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            className={`admin-record-sheet${mode === "delete" ? " is-delete" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            aria-busy={pending}
            initial={reducedMotion ? false : { opacity: 0, x: 32, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, x: 24, scale: 0.99 }}
            transition={{ duration: reducedMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={handleKeyDown}
          >
            <header className="admin-record-sheet__header">
              <span className="admin-record-sheet__eyebrow">
                {mode === "create" ? <Plus size={15} /> : mode === "edit" ? <Pencil size={15} /> : <Trash2 size={15} />}
                {config.plural} / {mode === "create" ? "Yeni qeyd" : mode === "edit" ? "Redaktə" : "Silmə"}
              </span>
              <h2 id={titleId}>{title}</h2>
              <p id={descriptionId}>{description}</p>
              <button
                type="button"
                className="admin-record-sheet__close"
                onClick={onClose}
                disabled={pending}
                aria-label="Pəncərəni bağla"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            {mode === "delete" ? (
              <DeleteConfirmation
                name={record?.name ?? "Bu qeyd"}
                error={error}
                pending={pending}
                onCancel={onClose}
                onDelete={onDelete}
              />
            ) : (
              <form className="admin-record-form" onSubmit={(event) => void handleSubmit(event)}>
                <div className="admin-record-form__fields">
                  {kind === "users" && (
                    <UserFields
                      record={record?.kind === "users" ? record : null}
                      firstFieldRef={firstFieldRef}
                    />
                  )}
                  {kind === "clubs" && (
                    <ClubFields
                      record={record?.kind === "clubs" ? record : null}
                      firstFieldRef={firstFieldRef}
                    />
                  )}
                  {kind === "events" && (
                    <EventFields
                      record={record?.kind === "events" ? record : null}
                      firstFieldRef={firstFieldRef}
                    />
                  )}
                </div>

                {error && (
                  <p className="admin-record-form__error" role="alert">
                    <AlertTriangle size={16} aria-hidden="true" />
                    {error}
                  </p>
                )}

                <footer className="admin-record-form__footer">
                  <button type="button" onClick={onClose} disabled={pending}>
                    Ləğv et
                  </button>
                  <button type="submit" className="is-primary" disabled={pending}>
                    <Check size={16} aria-hidden="true" />
                    {pending ? "Yadda saxlanılır…" : mode === "create" ? "Qeyd yarat" : "Yadda saxla"}
                  </button>
                </footer>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type FieldProps<TRecord> = {
  firstFieldRef: React.RefObject<HTMLInputElement | null>;
  record: TRecord | null;
};

function UserFields({ firstFieldRef, record }: FieldProps<AdminUser>) {
  return (
    <>
      <Field label="Ad və soyad" name="name" required>
        <input ref={firstFieldRef} name="name" defaultValue={record?.name} minLength={3} maxLength={80} required />
      </Field>
      <Field label="E-poçt" name="email" required>
        <input name="email" type="email" defaultValue={record?.email} maxLength={120} autoComplete="email" required />
      </Field>
      <Field label="Rol" name="role" required>
        <select name="role" defaultValue={record?.role ?? "student"} required>
          <option value="student">Tələbə</option>
          <option value="mentor">Mentor</option>
          <option value="teacher">Müəllim</option>
          <option value="admin">Administrator</option>
        </select>
      </Field>
      <Field label="Universitet" name="university" required>
        <input name="university" defaultValue={record?.university} minLength={3} maxLength={120} required />
      </Field>
      <Field label="Fakültə" name="faculty" required>
        <input name="faculty" defaultValue={record?.faculty} minLength={2} maxLength={100} required />
      </Field>
      <Field label="Vəziyyət" name="status" required>
        <select name="status" defaultValue={record?.status ?? "Gözləmədə"} required>
          <option value="Aktiv">Aktiv</option>
          <option value="Gözləmədə">Gözləmədə</option>
          <option value="Məhdudlaşdırılıb">Məhdudlaşdırılıb</option>
        </select>
      </Field>
    </>
  );
}

function ClubFields({ firstFieldRef, record }: FieldProps<AdminClub>) {
  return (
    <>
      <Field label="Klubun adı" name="name" required>
        <input ref={firstFieldRef} name="name" defaultValue={record?.name} minLength={3} maxLength={100} required />
      </Field>
      <Field label="URL qısa adı" name="slug" hint="Məsələn: mehsul-ux-icmasi" required>
        <input name="slug" defaultValue={record?.slug} pattern="[a-z0-9-]+" minLength={3} maxLength={80} aria-describedby="slug-hint" required />
      </Field>
      <Field label="Kateqoriya" name="category" required>
        <input name="category" defaultValue={record?.category} minLength={2} maxLength={60} required />
      </Field>
      <Field label="Koordinator inisialları" name="coordinatorInitials" required>
        <input name="coordinatorInitials" defaultValue={record?.coordinatorInitials} minLength={2} maxLength={4} required />
      </Field>
      <Field label="Vəziyyət" name="status" required>
        <select name="status" defaultValue={record?.status ?? "Gözləmədə"} required>
          <option value="Aktiv">Aktiv</option>
          <option value="Gözləmədə">Gözləmədə</option>
          <option value="Məhdudlaşdırılıb">Məhdudlaşdırılıb</option>
        </select>
      </Field>
    </>
  );
}

function EventFields({ firstFieldRef, record }: FieldProps<AdminEvent>) {
  return (
    <>
      <Field label="Tədbirin adı" name="name" required>
        <input ref={firstFieldRef} name="name" defaultValue={record?.name} minLength={3} maxLength={120} required />
      </Field>
      <Field label="Kateqoriya" name="category" required>
        <input name="category" defaultValue={record?.category} minLength={2} maxLength={60} required />
      </Field>
      <Field label="Təşkilatçı" name="organizer" required>
        <input name="organizer" defaultValue={record?.organizer} minLength={2} maxLength={100} required />
      </Field>
      <Field label="Başlama vaxtı" name="startAt" required>
        <input name="startAt" type="datetime-local" defaultValue={toLocalDateTime(record?.startAt)} required />
      </Field>
      <Field label="Tutum" name="capacity" required>
        <input name="capacity" type="number" defaultValue={record?.capacity ?? 40} min={1} max={5000} inputMode="numeric" required />
      </Field>
      <Field label="Məkan" name="place" required>
        <input name="place" defaultValue={record?.place} minLength={2} maxLength={100} required />
      </Field>
      <Field label="Vəziyyət" name="status" required>
        <select name="status" defaultValue={record?.status ?? "Qaralama"} required>
          <option value="Açıq">Açıq</option>
          <option value="Qaralama">Qaralama</option>
          <option value="Tamamlanıb">Tamamlanıb</option>
        </select>
      </Field>
    </>
  );
}

type FieldPropsBase = {
  children: React.ReactNode;
  hint?: string;
  label: string;
  name: string;
  required?: boolean;
};

function Field({ children, hint, label, name, required }: FieldPropsBase) {
  return (
    <label className="admin-record-field">
      <span>
        {label}
        {required && <i aria-hidden="true">*</i>}
      </span>
      {children}
      {hint && <small id={`${name}-hint`}>{hint}</small>}
    </label>
  );
}

type DeleteConfirmationProps = {
  error: string | null;
  name: string;
  onCancel: () => void;
  onDelete: () => Promise<void>;
  pending: boolean;
};

function DeleteConfirmation({ error, name, onCancel, onDelete, pending }: DeleteConfirmationProps) {
  return (
    <div className="admin-delete-confirmation">
      <div aria-hidden="true"><AlertTriangle size={22} /></div>
      <strong>{name}</strong>
      <p>Qeyd və onun idarəetmə məlumatları siyahıdan silinəcək.</p>
      {error && <p className="admin-record-form__error" role="alert">{error}</p>}
      <footer>
        <button type="button" data-delete-cancel onClick={onCancel} disabled={pending}>Geri qayıt</button>
        <button type="button" className="is-danger" onClick={() => void onDelete()} disabled={pending}>
          <Trash2 size={16} aria-hidden="true" />
          {pending ? "Silinir…" : "Bəli, sil"}
        </button>
      </footer>
    </div>
  );
}

function createSubmission(
  kind: AdminCollectionKind,
  formData: FormData,
): AdminRecordSubmission {
  if (kind === "users") {
    return {
      kind,
      input: {
        name: fieldValue(formData, "name"),
        email: fieldValue(formData, "email").toLocaleLowerCase("az"),
        role: fieldValue(formData, "role") as AdminUser["role"],
        university: fieldValue(formData, "university"),
        faculty: fieldValue(formData, "faculty"),
        status: fieldValue(formData, "status") as AdminUser["status"],
      },
    };
  }
  if (kind === "clubs") {
    return {
      kind,
      input: {
        name: fieldValue(formData, "name"),
        slug: fieldValue(formData, "slug").toLocaleLowerCase("az"),
        category: fieldValue(formData, "category"),
        coordinatorInitials: fieldValue(formData, "coordinatorInitials").toLocaleUpperCase("az"),
        status: fieldValue(formData, "status") as AdminClub["status"],
      },
    };
  }
  const startAtValue = fieldValue(formData, "startAt");
  return {
    kind,
    input: {
      name: fieldValue(formData, "name"),
      category: fieldValue(formData, "category"),
      organizer: fieldValue(formData, "organizer"),
      startAt: new Date(startAtValue).toISOString(),
      capacity: Number.parseInt(fieldValue(formData, "capacity"), 10),
      place: fieldValue(formData, "place"),
      status: fieldValue(formData, "status") as AdminEvent["status"],
    },
  };
}

function fieldValue(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function toLocalDateTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function capitalize(value: string): string {
  return value.charAt(0).toLocaleUpperCase("az") + value.slice(1);
}
