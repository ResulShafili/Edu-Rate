# EduRate — Qarabağ Universiteti Tələbə Portalı

EduRate Qarabağ Universitetinin tələbə həyatı üçün hazırlanmış Azərbaycan dilli MVP platformasıdır. Platforma tələbəyə tədbirlər, elanlar, klublar, mentorluq, müəllim qiymətləndirməsi və dəstək xidmətlərinə vahid, sadə giriş verir.

> Hazırkı vəziyyət: frontend və ilkin REST API işlək MVP-dir. Demo məlumatları yaddaşda saxlanır; production üçün davamlı verilənlər bazası və rol icazələri növbəti mərhələdə qoşulmalıdır.

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
| `/community` | İcma | Tələbə əlaqələri və mesajlaşma demo axını |
| `/teachers` | Müəllimlər | Obyektiv meyarlarla qiymətləndirmə |
| `/mentors` | Mentorlar | Mentor profilləri və müraciət axını |
| `/clubs` | Klublar | Klub kataloqu və klub səhifələri |
| `/support` | Dəstək | FAQ və dəstək sorğusu forması |
| `/auth` | Giriş və qeydiyyat | Lokal cookie-sessiyalı autentifikasiya |
| `/profile` | Profil | Tələbə profilinin xülasəsi |
| `/admin` | İdarəetmə | Demo analitika və idarəetmə cədvəlləri |
| `/api-docs` | API sənədləri | OpenAPI 3.1 endpoint kataloqu və canlı health testi |
| `/technical-presentation` | Texniki təqdimat | Rəhbər şəxslər üçün hazır təqdimat məzmunu |

## Texnologiyalar

- React 19 və Next.js App Router
- TypeScript
- Tailwind CSS 4 və KUDS token override-ları
- Framer Motion və Recharts
- SWR və Fetch əsaslı service layer
- Next.js Route Handlers ilə REST API
- OpenAPI 3.1

## Lokal işə salma

Node.js **22.13+** lazımdır.

```bash
npm install
npm run dev
```

Sonra tətbiq `http://localhost:3000`, API sənədləri isə `http://localhost:3000/api-docs` ünvanında açılır.

`.env.example` faylını `.env.local` adı ilə kopyalayın və production-da güclü sessiya sirri verin:

```bash
EDURATE_AUTH_SECRET=minimum-32-simvolluq-unikal-production-sirriniz
```

## İşlək API-lər

| Metod | Endpoint | Təyinat |
| --- | --- | --- |
| `GET` | `/api/health` | Xidmətin işləkliyinin yoxlanması |
| `POST` | `/api/auth/signup` | Qeydiyyat və cookie sessiyasının yaradılması |
| `POST` | `/api/auth/login` | Giriş |
| `POST` | `/api/auth/logout` | Çıxış |
| `GET` | `/api/auth/session` | Aktiv sessiya |
| `PATCH` | `/api/auth/profile` | Profil məlumatlarının yenilənməsi |
| `GET` | `/api/admin/overview` | Admin dashboard demo göstəriciləri |
| `GET/POST/PATCH/DELETE` | `/api/admin/users`, `/api/admin/clubs`, `/api/admin/events` | Demo CRUD kontraktı |
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
npm run build:vercel
```

- `npm run build` Cloudflare/Vinext çıxışı üçün `dist/` yaradır.
- `npm run build:vercel` Vercel üçün Next.js production build-i yaradır.

## Production-a keçid qeydləri

Bu sprintdə aşağıdakılar MVP/demo məqsədlidir:

- Qeydiyyat məlumatları və admin CRUD məlumatları server prosesinin yaddaşındadır; proses yenilənəndə silinir.
- Admin endpoint-ləri UI və kontrakt testləri üçün hazırdır, lakin real rol əsaslı icazə yoxlaması hələ qoşulmayıb.
- Rəy moderasiyası ilkin filtrdir; qərar növbəsi və audit izi server/database qatında qurulmalıdır.

Növbəti mərhələdə Node.js + Express, PostgreSQL, davamlı sessiya storage-i, email təsdiqi, rate limiting, CSRF qoruması və admin RBAC əlavə edilməlidir. Xarici backend qoşulduqda `NEXT_PUBLIC_API_BASE_URL` və `EDURATE_API_BASE_URL` istifadə edilə bilər.
