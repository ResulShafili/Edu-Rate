# EduRate — Sprint 4 yekunlaşdırma sənədi

## Canlı mühit

- Frontend: <https://edu-rate-nu.vercel.app>
- Backend: <https://edurate-api.onrender.com>
- Swagger: <https://edurate-api.onrender.com/api-docs>
- Health: <https://edurate-api.onrender.com/api/health>

## Tamamlanan əsas axınlar

- tələbə və müəllim qeydiyyatı, giriş, çıxış və profil yenilənməsi;
- müəllimin mentorluq rolu üçün müraciəti və rəhbərlik təsdiqi;
- tədbir kataloqu, qeydiyyat və qeydiyyatı geri çəkmə;
- klub kataloqu, üzvlük və üzvlükdən çıxma;
- müəllimin cari semestr üzrə meyar əsaslı qiymətləndirilməsi və rəy moderasiyası;
- mentor kataloqu, müraciət, qəbul və rədd axını;
- real istifadəçi kataloqu, əlaqə sorğusu, qəbul, rədd və geri çəkmə;
- PostgreSQL-də saxlanan 1–1 mesajlaşma, typing və oxundu vəziyyəti;
- elanlar, tələbə lenti, dəstək müraciəti və istifadəçi müraciət tarixçəsi;
- admin və admin köməkçisi üçün rol əsaslı idarəetmə, CRUD və audit tarixçəsi.

## Təhlükəsizlik və məlumat bütövlüyü

- sessiya HttpOnly cookie ilə saxlanılır;
- parollar bcrypt ilə hash edilir;
- giriş və qeydiyyata sorğu limiti tətbiq olunur;
- bütün yazma əməliyyatlarında server validasiyası işləyir;
- əsas admin və admin köməkçisi səlahiyyətləri backend səviyyəsində ayrılır;
- müəllim rəyləri meyar əsaslıdır və yayımdan əvvəl moderasiya olunur;
- database sxemi versiyalı migration-larla yenilənir;
- health endpoint PostgreSQL bağlantısını real sorğu ilə yoxlayır və nasazlıqda 503 qaytarır.

## Yekun yoxlama komandaları

Frontend:

```bash
npm ci
npm run lint
npm test
npm run build
```

Backend:

```bash
cd backend
npm ci
npm run typecheck
npm test
npm run build
```

## Təqdimat günü smoke test

1. Ana səhifəni desktop və mobil ölçüdə açın.
2. Yeni tələbə hesabı yaradın və profilə daxil olun.
3. Tədbirə qeydiyyatdan keçin, sonra qeydiyyatı geri çəkin.
4. Kluba qoşulun, profil üzvlük sayını yoxlayın və klubdan çıxın.
5. İkinci hesaba əlaqə sorğusu göndərin; zəng panelindən qəbul və rədd axınını göstərin.
6. İki əlaqəli hesab arasında mesaj göndərin.
7. Müəllimi dörd obyektiv meyarla qiymətləndirin və cari semestr təkrar rəy qorumasını göstərin.
8. Dəstək bileti yaradın və profil/rol panelində tarixçəsini göstərin.
9. Admin paneldə istifadəçi, tədbir, klub, elan və moderasiya bölmələrini göstərin.
10. Swagger-də health, giriş və bir qorunan endpoint-i test edin.

## Production-dan sonrakı genişləndirmələr

E-poçt təsdiqi, şifrə bərpası, fayl/səsli mesajlar, qrup söhbətləri, universitet SSO-su və çoxserverli Socket.IO infrastrukturu cari Sprint 4 qəbul çərçivəsinə daxil deyil. Bunlar əsas axınların işləməsinə mane olmayan ayrıca production-hardening işləridir.
