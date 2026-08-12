# EduRate təhlükəsizlik yoxlaması

Tarix: 2 avqust 2026

Əhatə: Next.js frontend/BFF, Express API, autentifikasiya, admin icazələri, REST sorğuları, brauzer başlıqları və dependency zənciri.

## İcra xülasəsi

Yoxlama zamanı aşkarlanan yüksək və orta riskli tətbiq səviyyəli çatışmazlıqlar aradan qaldırılıb. İstifadəçinin statusu və rolu artıq hər qorunan API sorğusunda verilənlər bazasından yenidən yoxlanır; cookie əsaslı BFF mutasiyaları origin/CSRF nəzarətindən keçir; production CSP və brauzer təhlükəsizlik başlıqları aktivdir; sorğu ölçüsü, JSON xətaları və server vaxt limitləri idarə olunur. Frontend və backend dependency auditləri `0 vulnerability` nəticəsi verib.

## Tapıntılar və görülən işlər

### SEC-001 — Köhnəlmiş JWT ilə rol və hesab statusunun saxlanması

- Status: **Düzəldildi**
- Risk: Yüksək
- Yer: `backend/src/middleware/authenticate.ts:16`, `backend/src/middleware/authenticate.ts:20`
- Sübut: Token yoxlanıldıqdan sonra `findUserById(tokenIdentity.userId)` çağırılır və yalnız bazadakı cari `role`/`status` sorğuya yazılır.
- Təsir: Admin rolu ləğv edilmiş və ya bloklanmış istifadəçi köhnə tokenlə qorunan əməliyyatlara davam edə bilərdi.
- Həll: Hər qorunan sorğuda istifadəçi bazadan yenidən oxunur; silinmiş hesab `401`, aktiv olmayan hesab `403` alır.
- Test: Mövcud tokenlə hesab bloklama və admin rolunu ləğv etmə ssenariləri backend testlərinə əlavə edilib.

### SEC-002 — Cookie əsaslı mutasiyalarda CSRF sərhədi

- Status: **Düzəldildi**
- Risk: Yüksək
- Yer: `app/lib/security/request-origin.ts:1`, `app/lib/api/security.ts:4`
- Sübut: Dəyişiklik yaradan BFF route-ları `assertTrustedMutation(request)` ilə `Origin` və `Sec-Fetch-Site` dəyərlərini yoxlayır.
- Təsir: Xarici sayt istifadəçinin brauzer sessiyasından istifadə edərək onun adından əməliyyat göndərə bilərdi.
- Həll: Yalnız eyni origin və açıq şəkildə konfiqurasiya olunmuş frontend origin-ləri qəbul edilir; `cross-site` sorğular `403 CSRF_REJECTED` qaytarır.
- Müdafiə qatları: Sessiya cookie-si `HttpOnly`, production-da `Secure` və `SameSite=Lax` olaraq qalır.

### SEC-003 — CSP və vahid brauzer təhlükəsizlik başlıqlarının olmaması

- Status: **Düzəldildi**
- Risk: Orta
- Yer: `proxy.ts:2`, `app/lib/security/content-security-policy.ts:4`, `next.config.ts:4`
- Sübut: Hər səhifə sorğusu üçün ayrıca nonce yaradılır; `script-src` yalnız `self`, nonce və `strict-dynamic` istifadə edir; `frame-ancestors 'none'` və `object-src 'none'` aktivdir.
- Təsir: XSS, clickjacking və lazımsız brauzer imkanlarından sui-istifadəyə qarşı müdafiə zəif idi.
- Həll: Nonce əsaslı production CSP, `X-Frame-Options: DENY`, `nosniff`, Referrer Policy, Permissions Policy, COOP/CORP əlavə edilib və `X-Powered-By` söndürülüb.
- Qeyd: Framer Motion runtime `style` atributları istifadə etdiyi üçün `style-src 'unsafe-inline'` saxlanılıb; bu güzəşt skript siyasətinə şamil olunmur.

### SEC-004 — Paralel frontend sessiyası və e-poçt əsaslı admin qərarı

- Status: **Düzəldildi**
- Risk: Orta
- Yer: `app/lib/auth/request-identity.ts:1`, `app/lib/auth/admin-access.ts:1`, `app/layout.tsx:73`
- Sübut: İdentifikasiya yalnız backend-in yoxladığı session endpoint-indən alınır və admin görünüşü `role === "admin"` ilə açılır.
- Təsir: Bir-birindən ayrılan iki sessiya mənbəyi və frontend e-poçt siyahısı yanlış admin vəziyyəti yarada bilərdi.
- Həll: Köhnə lokal imzalı fallback və frontend admin allowlist-i silinib; backend vahid etibar mənbəyidir.

### SEC-005 — Sorğu ölçüsü, JSON və connection resurs limitləri

- Status: **Düzəldildi**
- Risk: Orta
- Yer: `app/lib/api/http.ts:81`, `backend/src/app.ts:55`, `backend/src/middleware/errors.ts:12`, `backend/src/server.ts:13`
- Sübut: Frontend BFF və Express JSON body üçün 64 KB limit var; malformed JSON `400`, böyük body `413`; server request/header/keep-alive limitləri təyin olunub.
- Təsir: Həddən böyük və ya qüsurlu sorğular yaddaş/CPU istifadəsini artırıb qeyri-aydın `500` cavabları yarada bilərdi.
- Həll: Erkən ölçü yoxlaması, sabit xəta kodları, timeout-lar və socket başına sorğu limiti əlavə edilib.

### SEC-006 — Kriptoqrafik və əməliyyat sərtləşdirmələri

- Status: **Düzəldildi**
- Risk: Aşağı
- Yer: `backend/src/lib/auth.ts:46`, `backend/src/db/platform.ts:333`, `backend/src/app.ts:33`, `.github/workflows/ci.yml:26`
- Sübut: JWT yoxlanması `HS256` allowlist-i ilə məhduddur; ticket referansı `randomBytes` istifadə edir; daxil olan request-id formatı məhdudlaşdırılır; CI yüksək səviyyəli dependency auditini bloklayır.
- Həll: Kriptoqrafik təsadüfilik, təhlükəsiz log/request-id davranışı, GitHub CI və Dependabot əlavə edilib.

## Qalan əməliyyat tədbirləri

Bu maddələr kod xətası deyil, production idarəetməsi üçün tələb olunan növbəti nəzarətlərdir:

1. Render-də `JWT_SECRET` ən azı 32 simvolluq unikal secret olaraq saxlanmalı və periodik rotasiya edilməlidir.
2. Vercel-də `NEXT_PUBLIC_SITE_URL` və `EDURATE_APP_ORIGIN` yalnız real frontend origin-inə bərabər olmalıdır.
3. Render-də `FRONTEND_URL` yalnız real frontend origin-inə bərabər olmalı, ilkin administrator isə e-poçt sahibliyi yoxlanıldıqdan sonra idarə olunan PostgreSQL əməliyyatı ilə təyin edilməlidir.
4. PostgreSQL backup, bərpa sınağı və secret-lərin giriş auditləri platforma səviyyəsində aktiv edilməlidir.
5. E-poçt təsdiqi, parolun bərpası, refresh-token rotasiyası və admin üçün MFA növbəti autentifikasiya sprintində əlavə edilməlidir.
6. Vercel/Render tərəfində WAF və paylanmış rate limiting aktivləşdirilməlidir; tətbiq daxilindəki limitlər əlavə müdafiə qatıdır.

## Yoxlama qapıları

- Frontend lint və testlər
- Backend TypeScript typecheck və testlər
- Frontend/backend production build
- Hər iki workspace üçün `npm audit --audit-level=high`
- Real brauzerdə desktop və 390×844 mobil yoxlama
- Eyni-origin və cross-site CSRF ssenariləri
- Production response header və CSP yoxlaması
