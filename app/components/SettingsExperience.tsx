"use client";

import { Bell, Check, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "./ui/Primitives";

type Preferences = {
  announcements: boolean;
  eventReminders: boolean;
  communityMessages: boolean;
};

const defaults: Preferences = {
  announcements: true,
  eventReminders: true,
  communityMessages: false,
};

const preferenceItems = [
  { key: "announcements", title: "Vacib elanlar", description: "Rəsmi universitet yeniliklərini al.", icon: Bell },
  { key: "eventReminders", title: "Tədbir xatırlatmaları", description: "Qeydiyyatdan keçdiyin tədbirlərdən əvvəl bildiriş al.", icon: Mail },
  { key: "communityMessages", title: "İcma mesajları", description: "Yeni bağlantı və mesajlar haqqında bildiriş al.", icon: ShieldCheck },
] as const;

export function SettingsExperience() {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("edurate:preferences");
    if (!stored) return;
    try {
      const nextPreferences = { ...defaults, ...(JSON.parse(stored) as Partial<Preferences>) };
      queueMicrotask(() => setPreferences(nextPreferences));
    } catch {
      window.localStorage.removeItem("edurate:preferences");
    }
  }, []);

  function save() {
    window.localStorage.setItem("edurate:preferences", JSON.stringify(preferences));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <section className="settings-page" aria-labelledby="settings-title">
      <PageHeader id="settings-title" eyebrow="Hesab" title="Parametrlər" description="Bildiriş seçimlərini bu cihaz üçün idarə et." />
      <div className="settings-card">
        <div className="settings-list">
          {preferenceItems.map(({ key, title, description, icon: Icon }) => (
            <label key={key} className="settings-row">
              <span className="settings-row-icon"><Icon size={18} aria-hidden="true" /></span>
              <span><strong>{title}</strong><small>{description}</small></span>
              <input
                type="checkbox"
                checked={preferences[key]}
                onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))}
              />
            </label>
          ))}
        </div>
        <button type="button" className="kuds-primary-button" onClick={save}>{saved && <Check size={16} aria-hidden="true" />}{saved ? "Yadda saxlandı" : "Seçimləri yadda saxla"}</button>
        <p className="settings-status" role="status" aria-live="polite">{saved ? "Bildiriş seçimlərin bu cihazda yadda saxlandı." : ""}</p>
      </div>
    </section>
  );
}
