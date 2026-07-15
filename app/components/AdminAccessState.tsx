import { ArrowLeft, KeyRound, ShieldAlert, WifiOff } from "lucide-react";
import Link from "next/link";

export type AdminAccessDeniedState =
  | { status: "signed-out"; signInHref: string }
  | { status: "forbidden" }
  | { status: "unavailable" };

type AdminAccessStateProps = {
  access: AdminAccessDeniedState;
};

const content = {
  "signed-out": {
    eyebrow: "Qorunan iş sahəsi",
    title: "Davam etmək üçün daxil ol.",
    description:
      "İdarəetmə mərkəzi yalnız təsdiqlənmiş administrator sessiyası ilə açılır.",
    action: "Hesaba daxil ol",
    icon: KeyRound,
  },
  forbidden: {
    eyebrow: "Giriş məhduddur",
    title: "Bu bölmə yalnız administrator üçündür.",
    description:
      "Hesabın aktivdir, lakin idarəetmə icazəsi yoxdur. Girişin səhv məhdudlaşdırıldığını düşünürsənsə, platforma rəhbəri ilə əlaqə saxla.",
    action: "Platformaya qayıt",
    icon: ShieldAlert,
  },
  unavailable: {
    eyebrow: "Sessiya yoxlanılır",
    title: "İcazə xidmətinə indi qoşula bilmirik.",
    description:
      "Təhlükəsizliyə görə idarəetmə paneli bağlı saxlanıldı. Bağlantı bərpa olunanda yenidən yoxla.",
    action: "Yenidən yoxla",
    icon: WifiOff,
  },
} as const;

export function AdminAccessState({ access }: AdminAccessStateProps) {
  const state = content[access.status];
  const Icon = state.icon;
  const href =
    access.status === "signed-out"
      ? access.signInHref
      : access.status === "unavailable"
        ? "/admin"
        : "/";

  return (
    <section
      className="profile-section profile-empty-section"
      aria-labelledby="admin-access-title"
    >
      <div
        className="profile-empty-card"
        role={access.status === "unavailable" ? "alert" : "status"}
        aria-live="polite"
      >
        <span className="profile-empty-mark" aria-hidden="true">
          <Icon size={20} />
        </span>
        <span className="profile-kicker">{state.eyebrow}</span>
        <h1 id="admin-access-title">{state.title}</h1>
        <p>{state.description}</p>
        <Link href={href} className="profile-empty-action">
          {access.status !== "signed-out" && (
            <ArrowLeft size={16} aria-hidden="true" />
          )}
          {state.action}
        </Link>
      </div>
    </section>
  );
}
