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

## Frontend bağlantısı

Vercel project **Settings → Environment Variables** bölməsində bunları Railway domeni ilə təyin edin:

```env
NEXT_PUBLIC_API_BASE_URL=https://edurate-api.onrender.com
EDURATE_API_BASE_URL=https://edurate-api.onrender.com
```

Sonra frontend-i Vercel-də redeploy edin.

## Yoxlama

```bash
npm run typecheck
npm test
npm run build
```
