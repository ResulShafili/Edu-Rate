/**
 * Dil konfiqurasiyası.
 *
 * Seçim `edurate_lang` çərəzində saxlanır — belədə SERVER də hansı dildə render
 * edəcəyini bilir (`<html lang>` düzgün gəlir və hidrasiya uyğunsuzluğu olmur).
 * localStorage kifayət etmirdi, çünki serverdə oxunmur.
 */

export const languages = [
  { code: "az", label: "AZ", name: "Azərbaycanca" },
  { code: "en", label: "EN", name: "English" },
  { code: "ru", label: "RU", name: "Русский" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

export const defaultLanguage: LanguageCode = "az";

export const languageCookieName = "edurate_lang";

/** Naməlum dəyəri təhlükəsiz şəkildə dəstəklənən dilə çevirir. */
export function normalizeLanguage(value: string | undefined | null): LanguageCode {
  if (!value) return defaultLanguage;
  const match = languages.find((language) => language.code === value.toLowerCase());
  return match ? match.code : defaultLanguage;
}

/** Tarix/rəqəm formatlaması üçün tam lokal kodu. */
export const localeByLanguage: Record<LanguageCode, string> = {
  az: "az-AZ",
  en: "en-GB",
  ru: "ru-RU",
};

/**
 * Naviqasiya etiketləri məlumat faylında statik azərbaycanca yazılıb.
 * Strukturu dəyişmək əvəzinə `href`-i tərcümə açarına bağlayırıq —
 * belədə həm mövcud məlumat toxunulmaz qalır, həm də etiketlər tərcümə olunur.
 */
export const routeLabelKeys: Record<string, string> = {
  "/": "nav.home",
  "/schedule": "nav.schedule",
  "/feed": "nav.feed",
  "/events": "nav.events",
  "/clubs": "nav.clubs",
  "/community": "nav.community",
  "/teachers": "nav.teachers",
  "/mentors": "nav.mentors",
  "/questions": "nav.questions",
  "/support": "nav.support",
  "/profile": "nav.profile",
  "/workspace": "nav.workspace",
  "/settings": "nav.settings",
  "/auth": "nav.signIn",
};

/** Menyu qrup başlıqları üçün eyni məntiq. */
export const navGroupKeys: Record<string, string> = {
  "Gündəlik": "nav.group.daily",
  "Kəşf et": "nav.group.discover",
  "İnsanlar": "nav.group.people",
  "Kömək": "nav.group.help",
  "Hesab": "nav.group.account",
};
