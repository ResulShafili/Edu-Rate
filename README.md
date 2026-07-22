# EduRate

EduRate tədbirləri, icma əlaqələrini, müəllim seçimini, mentorluğu və dəstəyi vahid,
sakit və əlçatan təcrübədə birləşdirən Azərbaycan dilli təhsil platformasıdır.
İnterfeys geniş nəfəs sahəsi, aydın məzmun iyerarxiyası və məqsədli hərəkətlərlə
istifadəçini yormadan növbəti addıma aparır.

## Platforma marşrutları

| Marşrut | Bölmə | Məqsəd |
| --- | --- | --- |
| `/` | Ana səhifə | Platformanın istiqamətlərinə qısa giriş |
| `/events` | Tədbirlər | Kateqoriyaya görə süzgəc, 3D kartlar və məlumat paneli |
| `/community` | İcma | Orqanik skelet yüklənməsi, əlaqə və mesajlaşma |
| `/teachers` | Müəllimlər | Müəllim seçimi, meyarlar üzrə qiymətləndirmə və rəylər |
| `/mentors` | Mentorlar | Genişlənən profillər və mentorluq müraciəti |
| `/support` | Dəstək | FAQ və tamamlanma göstəricili dəstək sorğusu |
| `/auth` | Giriş və qeydiyyat | Yumşaq keçidli autentifikasiya təcrübəsi |
| `/profile` | Profil | Tələbə məlumatları və fəaliyyət xülasəsi |
| `/feed` | Elanlar | Xəbərlər, bildirişlər və kateqoriyalı elanlar |
| `/clubs` | Klublar | Tələbə təşkilatları və klub profilləri |
| `/admin` | İdarəetmə | Analitika, istifadəçi, klub və tədbir nəzarəti |
| `/technical-presentation` | Texniki təqdimat | Rəhbər görüşləri üçün texniki xülasə və danışıq skripti |

Davamlı naviqasiya qabığı bütün marşrutlarda görünür. `AnimatePresence` əsaslı səhifə
keçidləri məzmunu yumşaq şəkildə solğunlaşdırır və cüzi miqyaslandırır. Üzən söhbət
pəncərəsinin vəziyyəti marşrut dəyişəndə qorunur.

## Müəllim qiymətləndirməsi

Müəllimlər tək ümumi ulduzla deyil, dərs təcrübəsini təsvir edən dörd aydın meyarla
qiymətləndirilir:

- izahın aydınlığı;
- fənn biliyi;
- obyektivlik;
- ünsiyyət və dəstək.

Hər meyar 1–5 bal aralığındadır, klaviatura ilə idarə olunur və yekun bal avtomatik
hesablanır. Rəy insanın şəxsiyyətini deyil, müşahidə olunan tədris təcrübəsini
qiymətləndirməlidir. Buna görə nalayiq ifadə, şəxsə yönəlmiş təhqir, reklam, keçid,
əlaqə məlumatı və həddindən artıq təkrar qəbul edilmir. İnterfeys rəyi rədd etməklə
kifayətlənmir; fikri konkret və hörmətli şəkildə yenidən yazmaq üçün Azərbaycan
dilində səbəb və təklif göstərir.

`POST /api/reviews/validate` eyni qaydaları server sərhədində də yoxlayır. Bu yoxlama
gələcək verilənlər bazasına yazılmadan əvvəl məcburi təhlükəsizlik qatı kimi
saxlanmalıdır. Avtomatik yoxlama insan nəzarətini tam əvəz etmir.

## Dizayn və hərəkət prinsipləri

- Eyni mürəkkəb, kağız, laym və yumşaq bənövşəyi rəng sistemi bütün modullarda qorunur.
- Əsas hərəkətlər `transform` və `opacity` üzərində qurulur; bahalı effektlər daimi
  animasiya edilmir.
- `prefers-reduced-motion` seçimi olan istifadəçilər üçün parallax, yay və konfetti
  hərəkətləri azaldılır.
- Naviqasiya, formalar, akkordeonlar, karusel və qiymətləndirmə klaviatura və toxunma
  ilə işləyir.
- Müəllim və mentor təqdimatında real şəxslərin fotoşəkillərindən istifadə olunmur;
  yalnız stilizə olunmuş, uydurma illüstrasiya və inisiallar göstərilir.

## Texnologiyalar

- React 19 və Next.js App Router
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Recharts
- SWR və native Fetch
- Lucide ikonları
- Sites hostinqi üçün Cloudflare uyğun ESM çıxışı

## Lokal işə salma

Node.js 22.13 və ya daha yeni versiya tələb olunur.

```bash
npm install
npm run dev
```

Real Node.js + Express API-yə qoşulmaq üçün `.env.example` faylını `.env.local`
adı ilə köçürün və `NEXT_PUBLIC_API_BASE_URL` dəyərini backend ünvanına dəyişin.
Bu dəyişən verilmədikdə admin panel təhlükəsiz demo adapterindən istifadə edir.

Hostinq çıxışları ayrı saxlanılır: `npm run build` Sites/Cloudflare üçün `dist/`,
`npm run build:vercel` isə Vercel üçün `.next/` çıxışı yaradır.

Keyfiyyət yoxlamaları:

```bash
npm run lint
npm run build
npm run build:vercel
npm test
```

## Arxitektura

- `PlatformShell` davamlı naviqasiya və alt hissəni saxlayır.
- `RouteTransition` marşrut keçidini, azaldılmış hərəkəti və yeni səhifəyə fokusun
  ötürülməsini idarə edir.
- `PlatformProvider` söhbət vəziyyətini marşrutlardan yuxarıda saxlayır.
- Hər məhsul modulu `app/events`, `app/community`, `app/teachers`, `app/mentors` və
  `app/support` daxilində ayrıca marşruta malikdir; Phase 6–8 marşrutları eyni
  davamlı qabıq və keçid sisteminə qoşulur.
- `CriteriaRating` bacarıq meyarlarını və orta balı, `review-moderation` isə hörmətli
  rəy qaydalarını idarə edir.
- Domen məlumatları `app/data`, təqdimat və qarşılıqlı əlaqə məntiqi isə
  `app/components` daxilində saxlanır.

## REST API müqaviləsi

`app/lib/api/client.ts` vahid Fetch client-i, strukturlaşdırılmış `ApiError`, sorğunun
ləğvi, cookie əsaslı sessiya və həm birbaşa JSON, həm də `{ "data": ... }` cavab
formatını təmin edir. `app/services/admin.service.ts` endpoint müqaviləsini,
`app/hooks/useAdminData.ts` isə SWR keşini, təkrar yoxlamanı və skeleton vəziyyətlərini
UI qatından ayırır.

Express backend üçün gözlənilən admin endpoint-ləri:

- `GET /auth/session` — `role: "admin"` olan təhlükəsiz sessiya yoxlaması;
- `GET /admin/overview`;
- `GET`, `POST /admin/users`, `/admin/clubs`, `/admin/events`;
- `PATCH`, `DELETE /admin/users/:id`, `/admin/clubs/:id`, `/admin/events/:id`.

`/auth/session` cavabı `{ "user": { "displayName": "...", "email": "...", "role": "admin" } }`
və ya eyni məlumatın `data` envelope-u daxilindəki forması ola bilər. Admin səhifəsi real
API rejimində bu yoxlamanı serverdə aparır və icazə xidməti əlçatan olmadıqda bağlı
qalır. `EDURATE_API_BASE_URL` sessiya sorğusu üçün server-only override,
`EDURATE_SESSION_COOKIE_NAME` isə HttpOnly sessiya cookie-sinin adıdır.

Səhvlər üçün tövsiyə olunan format
`{ "message": "...", "code": "...", "details": {}, "requestId": "..." }` şəklindədir.
Backend cookie sessiyasından istifadə edirsə CORS-da yalnız etibarlı frontend origin-i
və credentials dəstəyini aktiv etməlidir. Administrator rolu və hər bir CRUD icazəsi
mütləq Express middleware-də yenidən yoxlanmalıdır; frontend menyusunun gizlədilməsi
təhlükəsizlik sərhədi deyil.

## Məlumatların saxlanması sərhədi

Hazırkı mərhələ istehsal keyfiyyətli ön hissəni və rəy yoxlama API-sini təqdim edir.
Söhbət mesajları, əlaqə vəziyyətləri, təsdiqlənmiş müəllim rəyləri, mentorluq
müraciətləri və dəstək sorğuları hələ davamlı verilənlər bazasında saxlanmır.
Səhifə yenilənəndə brauzerdəki müvəqqəti vəziyyət sıfırlana bilər.

Növbəti istehsal addımı autentifikasiya, verilənlər bazası, real vaxt mesajlaşma və
moderator növbəsini qoşmaqdır. Müştəri tərəfdəki yoxlama rahatlıq üçündür; etibar
sərhədi həmişə server və verilənlər bazasına yazma əməliyyatı olmalıdır.
