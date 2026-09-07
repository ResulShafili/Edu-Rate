"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/**
 * Hesabın silinməsi (GDPR "unudulma hüququ").
 *
 * Əvvəl istifadəçinin hesabını silmək üçün heç bir yol yox idi — məxfilik
 * siyasəti yalnız "dəstək formasından sorğu göndər" deyirdi. İndi özü silə bilir.
 *
 * Silinmə geri qaytarılmır, ona görə iki maneə var: əvvəlcə təsdiq addımı açılır,
 * sonra şifrə tələb olunur (backend onu yoxlayır). Beləcə nə təsadüfi klik, nə də
 * oğurlanmış açıq sessiya hesabı silə bilmir.
 */
export function DeleteAccountPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(payload?.error?.message || "Hesab silinmədi.");
      }
      // Sessiya artıq etibarsızdır — tam yenidən yükləmə ilə çıxış edirik.
      window.location.href = "/";
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Hesab silinmədi.");
      setBusy(false);
    }
  }

  return (
    <section className="danger-zone" aria-labelledby="danger-zone-title">
      <header>
        <span className="danger-zone__icon" aria-hidden="true">
          <AlertTriangle size={17} />
        </span>
        <div>
          <strong id="danger-zone-title">Hesabı sil</strong>
          <small>
            Profilin, rəylərin, mesajların və klub üzvlüklərin həmişəlik silinir.
            Bu əməliyyat geri qaytarılmır.
          </small>
        </div>
        {!open ? (
          <button type="button" className="danger-zone__open" onClick={() => setOpen(true)}>
            Sil
          </button>
        ) : null}
      </header>

      {open ? (
        <form onSubmit={(event) => void submit(event)}>
          <label htmlFor="delete-account-password">
            Təsdiq üçün şifrəni yaz
            <input
              id="delete-account-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              minLength={8}
              disabled={busy}
            />
          </label>

          {error ? (
            <p className="danger-zone__error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="danger-zone__actions">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPassword("");
                setError("");
              }}
              disabled={busy}
            >
              Ləğv et
            </button>
            <button type="submit" className="is-danger" disabled={busy || password.length < 8}>
              <Trash2 size={15} aria-hidden="true" />
              {busy ? "Silinir…" : "Hesabı həmişəlik sil"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
