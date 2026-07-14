# EduRate

EduRate seçilmiş öyrənmə təcrübələrini, səmimi icma əlaqələrini, məqsədli
mentorluğu və qayğıkeş dəstəyi bir araya gətirən yüksək səviyyəli təhsil platformasıdır.
İnterfeys tam Azərbaycan dilindədir və hər bölmə diqqəti əsas işə yönəldən,
sakit, əlçatan və axıcı təcrübə təqdim edir.

## Məhsul imkanları

- Mərhələli mətn keçidləri, dərinlik hissi yaradan fon elementləri və maqnit düymələri olan
  animasiyalı giriş səhifəsi
- Kateqoriyaya görə süzgəclənən, 3D meyillənmə effekti və şüşəvari məlumat
  paneli olan tədbir təqvimi
- Orqanik skelet yüklənməsi, əlaqə qurma və mesaj yazma hərəkətləri olan icma
  kataloqu
- Axıcı mesaj animasiyaları, yazma göstəricisi, rahat sürüşmə və yığcam
  tənzimləmələr menyusu olan üzən söhbət pəncərəsi
- Profil daxilində genişlənən mentor məlumatları, uyğun vaxtlar və animasiyalı
  mentorluq müraciəti təsdiqi
- Axıcı tez-tez verilən suallar akkordeonları, üzən etiketlər, yoxlama mesajları və tamamlanma
  göstəricisi olan dəstək sorğusu forması
- Yumşaq yapışma və dərinlik hərəkətli, real şəxs fotoşəkli istifadə etməyən stilizə olunmuş
  illüstrasiya portretləri ilə üfüqi müəllim karuseli
- Yay fizikası ilə hərəkət edən əlçatan SVG ulduzları, klaviatura idarəsi və
  hərəkəti azaltma seçiminə hörmət edən interaktiv qiymətləndirmə
- Parıltılı uğur halqası, incə konfetti təsdiqi və sürüşdükcə görünən sərbəst
  sütun düzülüşlü tələbə rəyləri
- Klaviatura, toxunma, mobil ekran və azaldılmış hərəkət rejimi üçün dəstək

## Texnologiyalar

- React 19 və Next.js ilə uyğun vinext işləmə mühiti
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide ikonları
- Sites hostinqi üçün Cloudflare ilə uyğun ESM çıxışı

## Lokal işə salma

Node.js 22.13 və ya daha yeni versiya tələb olunur.

```bash
npm install
npm run dev
```

Yoxlama əmrləri:

```bash
npm run lint
npm run build
npm test
```

## Arxitektura

Platforma tədbirləri, icma əlaqələrini, müəllim seçimi və qiymətləndirməni,
mentorluğu və dəstəyi bir-birindən ayrılmış modul sərhədlərində saxlayır.

- `ConnectionsExperience` icma kataloqunu və söhbət pəncərəsini birləşdirir.
- `TeacherEvaluation` müəllim karuselini, `TeacherCard` profil kartlarını,
  `SpringRating` əlçatan qiymətləndirməni və `ReviewCard` rəy axınını idarə edir.
- `GuidanceExperience` mentorluq və dəstək bölmələrini əsas səhifə qabığından
  asılı etmədən bir araya gətirir.
- Domen məlumatları `app/data` daxilində tipləndirilmiş fayllarda saxlanılır;
  təqdimat və qarşılıqlı əlaqə məntiqi isə ayrıca komponentlərdə qalır.

Əsas səhifədə modul ardıcıllığı istifadəçi yolunu izləyir: tədbirlər → icma →
müəllim seçimi və qiymətləndirmə → mentorluq → dəstək.

### 4-cü mərhələ: Müəllim seçimi və qiymətləndirmə

Bu mərhələ müəllimləri tək səhifədə kəşf etməyi, müqayisə etməyi, seçməyi və
qiymətləndirməyi mümkün edir. Üfüqi karusel toxunma, siçan, trekpad və klaviatura
ilə işləyir. SVG ulduzları yay fizikasına əsaslanan izləmə effekti verir; rəy
göndərildikdə təsdiq halqası və hərəkəti azaltma seçiminə uyğun konfetti görünür.
Keçmiş rəylər ekran eninə uyğun sərbəst sütun düzülüşündə təqdim olunur.

## Məlumatların saxlanması sərhədi

Hazırkı mərhələ istehsal keyfiyyətli ön hissə təcrübəsini nümayiş etdirir.
Söhbət mesajları, əlaqə vəziyyətləri, müəllim rəyləri, mentorluq müraciətləri və
dəstək sorğuları brauzer yaddaşındakı müvəqqəti interfeys vəziyyətidir; səhifə
yenilənəndə davamlı saxlanılmır və serverə göndərilmir.

Bu sərhədlər gələcəkdə autentifikasiya, verilənlər bazası, real vaxt mesajlaşma
və müvafiq müəllim, mentorluq və dəstək API-lərinə qoşulmaq üçün açıq saxlanılıb.
