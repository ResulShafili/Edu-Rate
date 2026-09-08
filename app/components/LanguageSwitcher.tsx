"use client";

import { Languages } from "lucide-react";
import { languages } from "../i18n/config";
import { useLanguage } from "../i18n/LanguageProvider";

/**
 * AZ / EN / RU keçidi.
 *
 * Üç dil az olduğu üçün açılan siyahı əvəzinə yan-yana seqment düymələr:
 * bir toxunuşla dəyişir, hansı dilin aktiv olduğu dərhal görünür.
 * Seçim çərəzdə saxlanır, ona görə növbəti açılışda da qalır.
 */
export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="lang-switch" role="group" aria-label={t("common.language")}>
      <Languages size={14} aria-hidden="true" />
      {languages.map((item) => {
        const active = item.code === language;
        return (
          <button
            key={item.code}
            type="button"
            className={active ? "is-active" : undefined}
            aria-pressed={active}
            // Ekran oxuyucu üçün tam dil adı: "AZ" tək başına aydın deyil.
            aria-label={item.name}
            onClick={() => setLanguage(item.code)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
