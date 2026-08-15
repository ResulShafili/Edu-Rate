# EduRate təhlükəsizlik hesabatı

Tarix: 15 avqust 2026
Əhatə: Next.js BFF, Express API, PostgreSQL, autentifikasiya, rollar, moderasiya və mesajlaşma.

## Bağlanan əsas risklər

- Hər qorunan sorğuda istifadəçinin cari statusu və rolu database-dən yoxlanır.
- HttpOnly cookie mutasiyalarında eyni-origin/CSRF nəzarəti tətbiq olunur.
- Nonce əsaslı CSP, clickjacking, MIME sniffing və referrer müdafiələri aktivdir.
- Sorğu ölçüsü, JSON xətaları, timeout və lokal rate limit mövcuddur.
- Yeni sessiyalar serverdə hash edilmiş formada saxlanır, cihaz üzrə və toplu ləğv edilə bilir.
- Şifrə dəyişəndə digər sessiyalar ləğv olunur.
- E-poçt təsdiqi və şifrə bərpası tokenləri hash edilir, qısaömürlü və birdəfəlikdir.
- Production demo seed standart olaraq bağlıdır; əvvəlki demo kataloq məlumatları migration-la silinir.
- Rəylər yalnız aktiv tələbə hesabı, cari semestr və dörd pedaqoji meyar əsasında qəbul edilir.
- Mesajlar silinəndə audit üçün tombstone qalır; bloklama, səssizə alma və şikayət növbəsi mövcuddur.
- Məzmun şikayəti üzrə moderator, əsaslandırma, status və audit qeydi saxlanır.
- Swagger production-da standart olaraq bağlıdır.
- Dəstək forması girişsiz istifadə oluna bilər və saxta e-poçt ünvanı göstərilmir.
- Hüquqi razılıq ayrıca checkbox ilə alınır; şərt/məxfilik versiyası və qəbul vaxtı saxlanır.

## Production genişlənməsindən əvvəl bloklayan risklər

1. Admin hesabları üçün TOTP MFA və bərpa kodları hələ tamamlanmayıb.
2. Rate limit və birdəfəlik realtime biletləri çox instansiyalı mühit üçün Redis-ə keçirilməyib.
3. `owner_admin` rolu və son owner-in silinməsinin qarşısını alan ayrıca model yoxdur.
4. Hesabın 30 günlük silinmə, anonimləşdirmə və legal-hold axını tamamlanmayıb.
5. Köhnə başlanğıc SQL-lərinin hamısı migration-only modelə keçirilməyib.
6. Müəllimin rəyə cavab və formal apellyasiya interfeysi tamamlanmayıb.
7. Məxfilik siyasətində operatorun hüquqi adı və təsdiqlənmiş rəsmi əlaqə məlumatı təşkilati qərar gözləyir.

Bu səbəbdən hazır buraxılış nəzarətli, qeyri-rəsmi pilot kimi qiymətləndirilir; geniş ictimai production xidməti kimi elan edilməməlidir.

## Saxlanma prinsipləri

- Şikayət edilmiş məzmun: 180 günədək.
- Təhlükəsizlik qeydləri: 90 günədək.
- Admin audit qeydləri: 365 günədək.
- Hüquqi tələb olduqda legal-hold ayrıca təşkilati qərarla tətbiq edilməlidir.

## Məcburi yoxlamalar

- frontend lint, test və production build;
- backend typecheck, test və build;
- hər iki workspace üçün yüksək riskli dependency audit;
- PostgreSQL migration və restore sınağı;
- mobil 390×844 və desktop 1440×900 smoke/E2E axınları;
- e-poçt təsdiqi, şifrə bərpası, sessiya ləğvi və rol testləri;
- şikayət, bloklama, silinmiş mesaj və moderasiya audit testləri;
- production CSP, CORS, cookie və health cavabları.

Əməliyyat addımları [PRODUCTION_RELEASE_CHECKLIST.md](PRODUCTION_RELEASE_CHECKLIST.md) faylında verilib.
