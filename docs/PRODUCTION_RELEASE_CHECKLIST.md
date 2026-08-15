# EduRate production buraxılış nəzarəti

## Buraxılışı bloklayan tələblər

- `SEED_DEMO_DATA=false` olmalıdır.
- `RESEND_API_KEY`, təsdiqlənmiş `EMAIL_FROM` və real `PUBLIC_APP_URL` verilməlidir.
- Güclü, ayrıca saxlanan `JWT_SECRET` istifadə edilməlidir.
- PostgreSQL backup yaradılmalı və restore sınağı sənədləşdirilməlidir.
- Hüquqi operator, məxfilik əlaqəsi və şərt versiyası hüquqşünas tərəfindən təsdiqlənməlidir.
- Admin MFA və paylanmış rate limit tamamlanmadan geniş ictimai açılış edilməməlidir.

## Deploy sırası

1. Database backup.
2. Migration tətbiqi.
3. Backend deploy və health yoxlaması.
4. Frontend deploy.
5. Auth, rol, rəy, mentorluq, klub, tədbir, şikayət və chat smoke testləri.

## Geri dönüş

Migration uğursuz olarsa frontend deploy dayandırılır. Backend əvvəlki işlək versiyaya qaytarılır və database yalnız təsdiqlənmiş backup proseduru ilə bərpa edilir. Məlumat itkisi ehtimalında yeni yazma əməliyyatları müvəqqəti bağlanır və insident qeydi açılır.

## Məlum production hardening borcu

- Admin üçün TOTP MFA və recovery kodları.
- Redis əsaslı shared rate limit və birdəfəlik realtime biletləri.
- `owner_admin` və son owner qoruması.
- Server başlanğıc SQL-lərinin tam migration-only modelə keçirilməsi.
- 30 günlük hesab silinməsi, anonimləşdirmə və legal-hold əməliyyatları.
- Müəllim etiraz/cavab interfeysi və hüquqi apellyasiya SLA-sı.

Bu maddələr bağlanmadan layihə “tam hüquqi production sistemi” deyil, nəzarətli pilot kimi saxlanmalıdır.
