"use client";

import { BellRing } from "lucide-react";
import { useEffect, useState } from "react";

type State = "checking" | "unsupported" | "disabled" | "off" | "on" | "denied";

/** base64url VAPID açarını brauzerin gözlədiyi Uint8Array formatına çevirir. */
function toKeyBytes(base64: string) {
  const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`.replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(padded);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

/**
 * Cihaz bildirişləri açarı.
 *
 * Server VAPID açarı təqdim etməyibsə (push konfiqurasiya olunmayıb) bölmə
 * özünü "hazır deyil" kimi göstərir — heç bir saxta vəziyyət yaratmır.
 */
export function PushToggle() {
  const [state, setState] = useState<State>("checking");
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supported = typeof window !== "undefined"
        && "serviceWorker" in navigator
        && "PushManager" in window
        && "Notification" in window;
      if (!supported) {
        if (!cancelled) setState("unsupported");
        return;
      }
      try {
        const response = await fetch("/api/push", { cache: "no-store" });
        const payload = await response.json() as { data?: { publicKey: string | null } };
        const key = payload.data?.publicKey ?? null;
        if (cancelled) return;
        if (!key) {
          setState("disabled");
          return;
        }
        setPublicKey(key);
        if (Notification.permission === "denied") {
          setState("denied");
          return;
        }
        const registration = await navigator.serviceWorker.getRegistration();
        const existing = await registration?.pushManager.getSubscription();
        if (!cancelled) setState(existing ? "on" : "off");
      } catch {
        if (!cancelled) setState("disabled");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    if (!publicKey) return;
    setBusy(true);
    setMessage("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toKeyBytes(publicKey),
      });
      const response = await fetch("/api/push", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });
      if (!response.ok) throw new Error("Abunəlik saxlanmadı.");
      setState("on");
      setMessage("Bu cihaz üçün bildirişlər aktivdir.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bildirişlər aktivləşdirilmədi.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage("");
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "unsubscribe", endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setState("off");
      setMessage("Bu cihazda bildirişlər dayandırıldı.");
    } catch {
      setMessage("Bildirişlər dayandırılmadı.");
    } finally {
      setBusy(false);
    }
  }

  if (state === "checking" || state === "unsupported" || state === "disabled") {
    return null;
  }

  return (
    <div className="push-toggle">
      <span className="push-toggle__icon" aria-hidden="true"><BellRing size={17} /></span>
      <div>
        <strong>Cihaz bildirişləri</strong>
        <small>
          {state === "denied"
            ? "Brauzer bildirişləri bloklayıb. İcazəni brauzer parametrlərindən aç."
            : "Yeni elan və tədbir xəbərdarlığını telefonuna al."}
        </small>
        {message ? <em role="status">{message}</em> : null}
      </div>
      {state === "denied" ? null : (
        <button
          type="button"
          className={state === "on" ? "push-toggle__off" : "push-toggle__on"}
          onClick={() => void (state === "on" ? disable() : enable())}
          disabled={busy}
        >
          {busy ? "Gözlə…" : state === "on" ? "Dayandır" : "Aktivləşdir"}
        </button>
      )}
    </div>
  );
}
