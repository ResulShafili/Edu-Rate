# EduRate API

EduRate frontend-indən ayrılmış Node.js, Express, TypeScript və PostgreSQL REST API serveridir.

## Lokal işə salma

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

- API: `http://localhost:3001`
- Health: `http://localhost:3001/api/health`
- Swagger UI: `http://localhost:3001/api-docs`
- OpenAPI JSON: `http://localhost:3001/api/openapi.json`

`DATABASE_URL` boş olduqda server yalnız development/test üçün yaddaş rejimində işləyir. Production mühitində PostgreSQL və ən az 32 simvolluq `JWT_SECRET` məcburidir.

## Render deployment

1. `https://dashboard.render.com/blueprints` açın.
2. **New Blueprint Instance** seçin və GitHub hesabınızı qoşun.
3. `ResulShafili/Edu-Rate` repository-sini seçin.
4. Render repository kökündəki `render.yaml` faylını avtomatik oxuyacaq.
5. **Apply** basın. `edurate-api` serveri və `edurate-db` PostgreSQL bazası birlikdə yaranacaq.
6. Deploy tamamlandıqda `https://edurate-api.onrender.com/api/health` və `/api-docs` ünvanlarını açın.

`render.yaml` build, start, healthcheck, təhlükəsiz JWT sirri və PostgreSQL bağlantısını avtomatik təmin edir. Pulsuz Render PostgreSQL instansiyası 30 gündən sonra bitdiyi üçün daimi production istifadə üçün sonradan ödənişli database və ya ayrıca idarə olunan PostgreSQL seçilməlidir.

Render build mərhələsində TypeScript və tip paketlərini quraşdırmaq üçün `npm ci --include=dev` istifadə olunur; runtime isə kompilyasiya edilmiş `dist/server.js` faylını başladır.

## Sprint 2 biznes API-ləri

- `GET/POST /api/events` — tədbirləri siyahıla və yeni tədbir yarat
- `GET/PATCH/DELETE /api/events/:eventId` — tədbir təfərrüatı və CRUD
- `POST/DELETE /api/events/:eventId/registrations` — tədbirə qoşul və qeydiyyatı ləğv et
- `GET /api/events/registrations/me` — istifadəçinin tədbir qeydiyyatları
- `GET/POST /api/mentorship/requests` — mentorluq müraciətlərini siyahıla və yarat
- `PATCH/DELETE /api/mentorship/requests/:requestId` — gözləyən müraciəti yenilə və sil
- `GET/POST/PATCH/DELETE /api/clubs` — klub kataloqu və admin CRUD
- `GET /api/clubs/memberships/me` — istifadəçinin klub üzvlükləri
- `POST/DELETE /api/clubs/:clubId/memberships` — kluba qoşul və üzvlükdən çıx
- `POST /api/reviews` — moderasiya edilən müəllim rəyini saxla
- `POST /api/support/tickets` — dəstək müraciətini saxla
- `GET /api/admin/overview` və admin CRUD endpoint-ləri — canlı idarəetmə məlumatları

## Sprint 3 əlavələri

- `GET /api/network/announcements` — verilənlər bazasından elanları siyahıla
- `GET /api/network/feed` — tələbə lentini siyahıla
- `GET /api/reviews` — yalnız təsdiqlənmiş, anonimləşdirilmiş müəllim rəylərini göstər
- `GET /api/admin/reviews` — moderasiya növbəsini göstər
- `PATCH /api/admin/reviews/:id` — rəyi təsdiqlə və ya rədd et

Frontend Elanlar səhifəsi artıq bu API-lərlə işləyir; yüklənmə, boş və xəta vəziyyətləri mövcuddur. Admin panelində rəy moderasiyası ayrıca qorunan bölmə kimi təqdim edilir.

Bütün yazma əməliyyatları JWT tələb edir. Tədbiri yalnız onu yaradan istifadəçi və ya admin dəyişə/silə bilər. Endpoint-lərin nümunələri və cavab kodları Swagger UI daxilində test edilə bilər.

## Frontend bağlantısı

Vercel project **Settings → Environment Variables** bölməsində bunları Render domeni ilə təyin edin:

```env
NEXT_PUBLIC_API_BASE_URL=https://edurate-api.onrender.com
EDURATE_API_BASE_URL=https://edurate-api.onrender.com
ADMIN_EMAILS=admin@example.az
```

Render servisində eyni ünvanı `ADMIN_EMAILS=admin@example.az` kimi təyin edin. Bu hesab yenidən daxil olduqda admin JWT-si alacaq.

Sonra frontend-i Vercel-də redeploy edin.

## Yoxlama

```bash
npm run typecheck
npm test
npm run build
```
