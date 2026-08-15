# EduRate — Qarabağ Universiteti Tələbə Portalı

EduRate Qarabağ Universitetinin tələbə həyatı üçün hazırlanmış Azərbaycan dilli rəqəmsal platformadır. Platforma tələbəyə tədbirlər, elanlar, klublar, mentorluq, müəllim qiymətləndirməsi, şəxsi mesajlaşma və dəstək xidmətlərinə vahid, sadə giriş verir.

> Hazırkı vəziyyət: frontend Vercel-də, Express REST API isə Render-də işləyir. Qeydiyyat, giriş və profil məlumatları PostgreSQL-də saxlanır; frontend JWT-ni server tərəfli `HttpOnly` cookie vasitəsilə idarə edir.

## Dizayn sistemi

İnterfeys Qarabağ Universiteti Student Portal UI/UX qaydalarına uyğunlaşdırılıb:

- rənglər: `#44766C` (KU Green), `#16423C` (Dark Green), `#D3E8BF` (Soft Green), `#F8FAFC` fonu;
- Poppins/Tahoma əsaslı aydın tipoqrafiya;
- 4px əsaslı spacing sistemi, 8px düymə/input, 12px kart radiusu;
- desktop-da sol menyu və üst başlıq, mobil cihazda açılan menyu;
- fokus indikatorları, klaviatura ilə naviqasiya və `prefers-reduced-motion` dəstəyi.

## Səhifələr

| Marşrut | Bölmə | Məzmun |
| --- | --- | --- |
| `/` | Ana səhifə | Xoş gəlmisiniz bloku, sürətli keçidlər, tədbir və elan xülasəsi |
| `/events` | Tədbirlər | Kateqoriya filtri və tədbir təfərrüatları |
| `/feed` | Elanlar | Universitet yenilikləri və elanlar |
| `/community` | İcma | Tələbə əlaqələri və mesajlaşma interfeysi |
| `/teachers` | Müəllimlər | Obyektiv meyarlarla qiymətləndirmə |
| `/mentors` | Mentorlar | Mentor profilləri və müraciət axını |
| `/clubs` | Klublar | Klub kataloqu və klub səhifələri |
| `/support` | Dəstək | FAQ və dəstək sorğusu forması |
| `/auth` | Giriş və qeydiyyat | HttpOnly cookie ilə qorunan API sessiyası |
| `/workspace` | Rol paneli | Tələbə, müəllim və mentor üçün ayrıca iş axınları |
| `/profile` | Profil | Rol üzrə hesab və təcrübə məlumatları |
| `/admin` | İdarəetmə | Canlı analitika və verilənlər bazasına bağlı CRUD cədvəlləri |
| `/api-docs` | API sənədləri | OpenAPI 3.1 endpoint kataloqu və canlı health testi |
| `/technical-presentation` | Texniki təqdimat | Rəhbər şəxslər üçün hazır təqdimat məzmunu |

## Texnologiyalar

- React 19 və Next.js App Router
- TypeScript
- Tailwind CSS 4 və KUDS token override-ları
- Framer Motion və Recharts
- SWR və Fetch əsaslı service layer
- Next.js Route Handlers ilə təhlükəsiz BFF qatı
- Node.js + Express REST API və PostgreSQL
- OpenAPI 3.1

## Lokal işə salma

Node.js **22.13+** lazımdır.

```bash
npm install
npm run dev
```

Sonra tətbiq `http://localhost:3000`, API sənədləri isə `http://localhost:3000/api-docs` ünvanında açılır.

Ayrı Express backend-i `backend/` qovluğundadır:

```bash
cd backend
npm install
npm run dev
```

Server `http://localhost:3001`, Swagger UI isə `http://localhost:3001/api-docs` ünvanında açılır. Render deployment addımları `backend/README.md` faylında verilib.

`.env.example` faylını `.env.local` adı ilə kopyalayın və tətbiq ünvanlarını təyin edin:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EDURATE_APP_ORIGIN=http://localhost:3000
EDURATE_API_BASE_URL=http://localhost:3001
```

## İşlək API-lər

| Metod | Endpoint | Təyinat |
| --- | --- | --- |
| `GET` | `/api/health` | Xidmətin işləkliyinin yoxlanması |
| `POST` | `/api/auth/signup` | Tələbə qeydiyyatı və müəllim/mentor təsdiq müraciəti |
| `POST` | `/api/auth/login` | Giriş |
| `POST` | `/api/auth/logout` | Çıxış |
| `GET` | `/api/auth/session` | Aktiv sessiya |
| `PATCH` | `/api/auth/profile` | Profil məlumatlarının yenilənməsi |
| `GET/PATCH` | `/api/workspace` | Rol paneli və mentor müraciətlərinin cavablandırılması |
| `GET` | `/api/admin/overview` | Verilənlər bazasından canlı admin göstəriciləri |
| `GET/POST/PATCH/DELETE` | `/api/admin/users`, `/api/admin/clubs`, `/api/admin/events` | Qorunan real CRUD əməliyyatları |
| `GET/PATCH` | `/api/admin/reviews` | Müəllim rəylərinin admin moderasiyası |
| `POST/DELETE` | `/api/clubs/:clubId/memberships` | Kluba qoşulma və üzvlükdən çıxma |
| `GET/POST` | `/api/reviews` | Təsdiqlənmiş rəylər və yeni rəyin moderasiya növbəsinə göndərilməsi |
| `GET` | `/api/network/announcements`, `/api/network/feed` | PostgreSQL əsaslı elanlar və tələbə lenti |
| `GET/POST/PATCH/DELETE` | `/api/community/connections` | Əlaqə sorğusu, qəbul, rədd və əlaqədən çıxma |
| `GET/POST/PATCH` | `/api/community/conversations` | Qalıcı şəxsi söhbətlər, mesajlar və oxundu vəziyyəti |
| `POST` | `/api/support/tickets` | Dəstək müraciətinin bazada saxlanması |
| `GET` | `/api/openapi.json` | OpenAPI 3.1 sənədi |
| `POST` | `/api/reviews/validate` | Rəy mətninin ilkin moderasiyası |

Məsələn, health endpoint-i:

```bash
curl http://localhost:3000/api/health
```

## Keyfiyyət yoxlamaları

```bash
npm run lint
npm test
npm run build
```

- `npm run build` Vercel və standart Node.js mühiti üçün Next.js production build-i yaradır.

## Production qeydləri

- Qeydiyyat, profil, tədbirlər, klub üzvlükləri, mentorluq müraciətləri, müəllim rəyləri və dəstək sorğuları PostgreSQL-də qalıcı saxlanılır.
- Admin istifadəçi, klub və tədbir CRUD-u JWT rol yoxlaması ilə qorunur.
- Müəllim və mentor profilləri sabit UUID ilə istifadəçi hesablarına bağlanır; elan, tədbir, klub, rəy, əlaqə və mesaj məlumatlarının əsas mənbəyi PostgreSQL-dir.
- Administrator rolu açıq qeydiyyatdan verilmir; ilkin admin yalnız idarə olunan PostgreSQL əməliyyatı ilə təyin olunur və frontend rol məlumatını qorunan backend sessiyasından alır.
- Vercel-də `NEXT_PUBLIC_SITE_URL` və `EDURATE_APP_ORIGIN` real frontend domeninə bərabər olmalıdır.

Ətraflı tətbiq təhlükəsizliyi nəticələri və production nəzarət siyahısı üçün
[`docs/security_best_practices_report.md`](docs/security_best_practices_report.md) sənədinə baxın.

Production genişləndirilməsi üçün e-poçt təsdiqi, şifrə bərpası və refresh-token rotasiyası növbəti hardening mərhələsinə saxlanılıb. Xarici backend ünvanı `EDURATE_API_BASE_URL` ilə dəyişdirilə bilər.
