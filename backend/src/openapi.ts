import {
  ACADEMIC_CATALOG,
  ACADEMIC_UNIVERSITY,
} from "./data/academic-catalog.js";

const academicFaculties = ACADEMIC_CATALOG.map((entry) => entry.faculty);
const academicPrograms = ACADEMIC_CATALOG.flatMap((entry) => [...entry.programs]);

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "EduRate REST API",
    version: "1.0.0",
    description:
      "EduRate tələbə portalının Express və PostgreSQL əsaslı REST API sənədləri.",
  },
  servers: [{ url: "/", description: "Cari EduRate API serveri" }],
  tags: [
    { name: "System", description: "Server vəziyyəti" },
    { name: "Authentication", description: "Qeydiyyat və giriş" },
    { name: "Catalog", description: "EduRate kataloqları" },
    { name: "Events", description: "Tədbir CRUD və iştirak qeydiyyatları" },
    { name: "Clubs", description: "Klublar və üzvlüklər" },
    { name: "Mentorship", description: "Mentorluq müraciətlərinin idarə edilməsi" },
    { name: "Reviews", description: "Müəllimlərin meyar əsaslı rəqəmsal qiymətləndirilməsi" },
    { name: "Support", description: "Dəstək müraciətləri" },
    { name: "Community", description: "İstifadəçi kataloqu və əlaqələr" },
    { name: "Messaging", description: "Qalıcı şəxsi mesajlaşma və realtime hadisələri" },
    {
      name: "Administration",
      description:
        "Əsas admin və admin köməkçisi üçün idarəetmə əməliyyatları. Köməkçi admin yalnız adi istifadəçilərə tələbə, mentor və müəllim rolu verə bilər.",
    },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Serverin işləkliyini yoxla",
        responses: {
          "200": {
            description: "Server işləyir",
            content: { "application/json": { schema: { $ref: "#/components/schemas/HealthResponse" } } },
          },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["Authentication"],
        summary: "Yeni tələbə hesabı yarat",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/SignupInput" } },
          },
        },
        responses: {
          "201": { description: "Hesab yaradıldı" },
          "409": { description: "E-poçt artıq mövcuddur" },
          "422": {
            description: "Validasiya və ya fakültə-ixtisas uyğunluğu xətası",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AcademicSelectionError" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Hesaba daxil ol",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } },
          },
        },
        responses: {
          "200": { description: "Giriş uğurludur" },
          "401": { description: "Giriş məlumatları yanlışdır" },
        },
      },
    },
    "/api/auth/session": {
      get: {
        tags: ["Authentication"],
        summary: "Cari istifadəçini qaytar",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Aktiv sessiya" },
          "401": { description: "Token yoxdur və ya yanlışdır" },
        },
      },
    },
    "/api/auth/profile": {
      patch: {
        tags: ["Authentication"],
        summary: "Cari istifadəçinin profilini yenilə",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ProfileInput" } },
          },
        },
        responses: {
          "200": { description: "Profil yeniləndi" },
          "401": { description: "Token yoxdur və ya yanlışdır" },
          "422": {
            description: "Validasiya və ya fakültə-ixtisas uyğunluğu xətası",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AcademicSelectionError" },
              },
            },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Client sessiyasını bitir",
        responses: { "204": { description: "Çıxış edildi" } },
      },
    },
    "/api/academic-catalog": {
      get: {
        tags: ["Catalog"],
        summary: "Rəsmi fakültə və ixtisas kataloqunu göstər",
        responses: {
          "200": {
            description: "Fakültələr və onlara aid ixtisaslar",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AcademicCatalogResponse" },
              },
            },
          },
        },
      },
    },
    "/api/events": {
      get: {
        tags: ["Events"],
        summary: "Tədbirləri siyahıla",
        responses: { "200": { description: "Tədbirlər", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Event" } } } } } } } },
      },
      post: {
        tags: ["Events"],
        summary: "Yeni tədbir yarat",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventInput" } } } },
        responses: { "201": { description: "Tədbir yaradıldı" }, "401": { description: "Giriş tələb olunur" }, "422": { description: "Validasiya xətası" } },
      },
    },
    "/api/events/{eventId}": {
      parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
      get: { tags: ["Events"], summary: "Tədbir təfərrüatını göstər", responses: { "200": { description: "Tədbir" }, "404": { description: "Tədbir tapılmadı" } } },
      patch: {
        tags: ["Events"], summary: "Yaratdığın tədbiri yenilə", security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventInput" } } } },
        responses: { "200": { description: "Tədbir yeniləndi" }, "403": { description: "İcazə yoxdur" }, "404": { description: "Tədbir tapılmadı" }, "422": { description: "Validasiya xətası" } },
      },
      delete: { tags: ["Events"], summary: "Yaratdığın tədbiri sil", security: [{ bearerAuth: [] }], responses: { "204": { description: "Tədbir silindi" }, "403": { description: "İcazə yoxdur" }, "404": { description: "Tədbir tapılmadı" } } },
    },
    "/api/events/{eventId}/registrations": {
      parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "string" } }],
      post: { tags: ["Events"], summary: "Tədbirə qeydiyyatdan keç", security: [{ bearerAuth: [] }], responses: { "201": { description: "Qeydiyyat tamamlandı" }, "409": { description: "Qeydiyyat bağlıdır, yer yoxdur və ya təkrardır" } } },
      delete: { tags: ["Events"], summary: "Tədbir qeydiyyatını ləğv et", security: [{ bearerAuth: [] }], responses: { "200": { description: "Qeydiyyat ləğv edildi" }, "404": { description: "Qeydiyyat tapılmadı" } } },
    },
    "/api/events/registrations/me": {
      get: { tags: ["Events"], summary: "Qeydiyyatdan keçdiyim tədbirləri göstər", security: [{ bearerAuth: [] }], responses: { "200": { description: "İstifadəçinin tədbirləri" } } },
    },
    "/api/clubs": {
      get: {
        tags: ["Clubs"],
        summary: "Klubları siyahıla",
        responses: { "200": { description: "Klublar" } },
      },
      post: { tags: ["Clubs"], summary: "Yeni klub yarat (admin)", security: [{ bearerAuth: [] }], responses: { "201": { description: "Klub yaradıldı" }, "403": { description: "Admin icazəsi tələb olunur" } } },
    },
    "/api/clubs/memberships/me": {
      get: { tags: ["Clubs"], summary: "Üzv olduğum klubları göstər", security: [{ bearerAuth: [] }], responses: { "200": { description: "Klub üzvlükləri" } } },
    },
    "/api/clubs/{clubId}/memberships": {
      parameters: [{ name: "clubId", in: "path", required: true, schema: { type: "string" } }],
      post: { tags: ["Clubs"], summary: "Kluba qoşul", security: [{ bearerAuth: [] }], responses: { "201": { description: "Üzvlük yaradıldı" }, "409": { description: "Artıq üzvdür" } } },
      delete: { tags: ["Clubs"], summary: "Klub üzvlüyündən çıx", security: [{ bearerAuth: [] }], responses: { "200": { description: "Üzvlük silindi" }, "404": { description: "Üzvlük tapılmadı" } } },
    },
    "/api/mentors": {
      get: {
        tags: ["Catalog"],
        summary: "Mentorları siyahıla",
        responses: { "200": { description: "Mentorlar" } },
      },
    },
    "/api/mentorship/requests": {
      get: { tags: ["Mentorship"], summary: "Müraciətlərimi siyahıla", security: [{ bearerAuth: [] }], responses: { "200": { description: "Mentorluq müraciətləri" } } },
      post: {
        tags: ["Mentorship"], summary: "Mentorluq müraciəti yarat", security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/MentorshipRequestInput" } } } },
        responses: { "201": { description: "Müraciət yaradıldı" }, "404": { description: "Mentor tapılmadı" }, "409": { description: "Gözləyən müraciət artıq var" }, "422": { description: "Validasiya xətası" } },
      },
    },
    "/api/mentorship/requests/{requestId}": {
      parameters: [{ name: "requestId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      patch: {
        tags: ["Mentorship"], summary: "Gözləyən müraciətin qeydini yenilə", security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["note"], properties: { note: { type: "string", maxLength: 600 } } } } } },
        responses: { "200": { description: "Müraciət yeniləndi" }, "404": { description: "Müraciət tapılmadı" } },
      },
      delete: { tags: ["Mentorship"], summary: "Gözləyən müraciəti sil", security: [{ bearerAuth: [] }], responses: { "204": { description: "Müraciət silindi" }, "404": { description: "Müraciət tapılmadı" } } },
    },
    "/api/reviews": {
      get: {
        tags: ["Reviews"], summary: "Təsdiqlənmiş müəllim qiymətləndirmələrini siyahıla",
        parameters: [
          { name: "teacherId", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 30 } },
        ],
        responses: { "200": { description: "Dərc edilmiş rəqəmsal nəticələr" }, "422": { description: "Validasiya xətası" } },
      },
      post: {
        tags: ["Reviews"], summary: "Müəllim üçün meyar əsaslı qiymətləndirmə göndər", security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TeacherReviewInput" } } } },
        responses: { "201": { description: "Qiymətləndirmə saxlanıldı" }, "409": { description: "Cari semestr üçün qiymətləndirmə mövcuddur" }, "422": { description: "Açıq mətn, naməlum sahə və ya natamam meyar qəbul edilmir" } },
      },
    },
    "/api/network/announcements": {
      get: {
        tags: ["Catalog"], summary: "Aktiv universitet elanlarını siyahıla",
        parameters: [{ name: "category", in: "query", schema: { type: "string", enum: ["official", "faculties", "clubs", "scholarship", "events"] } }],
        responses: { "200": { description: "Elanlar" }, "422": { description: "Validasiya xətası" } },
      },
    },
    "/api/network/feed": {
      get: {
        tags: ["Catalog"], summary: "Tələbə lentini siyahıla",
        parameters: [{ name: "category", in: "query", schema: { type: "string", enum: ["official", "faculties", "clubs", "scholarship", "events"] } }],
        responses: { "200": { description: "Lent paylaşımları" }, "422": { description: "Validasiya xətası" } },
      },
    },
    "/api/support/tickets": {
      post: {
        tags: ["Support"], summary: "Dəstək müraciəti yarat",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SupportTicketInput" } } } },
        responses: { "201": { description: "Müraciət saxlanıldı" }, "422": { description: "Validasiya xətası" } },
      },
    },
    "/api/support/tickets/me": { get:{tags:["Support"],summary:"Cari istifadəçinin dəstək müraciətlərini göstər",security:[{bearerAuth:[]}],responses:{"200":{description:"Müraciətlər"}}} },
    "/api/teachers": { get:{tags:["Catalog"],summary:"Təsdiqlənmiş müəllim profillərini siyahıla",responses:{"200":{description:"Müəllimlər"}}} },
    "/api/community/users": { get:{tags:["Community"],summary:"Aktiv istifadəçi kataloqu",security:[{bearerAuth:[]}],responses:{"200":{description:"İstifadəçilər"}}} },
    "/api/community/connections": {
      get:{tags:["Community"],summary:"Əlaqələri siyahıla",security:[{bearerAuth:[]}],responses:{"200":{description:"Əlaqələr"}}},
      post:{tags:["Community"],summary:"Əlaqə sorğusu göndər",security:[{bearerAuth:[]}],responses:{"201":{description:"Sorğu yaradıldı"}}},
    },
    "/api/community/conversations": {
      get:{tags:["Messaging"],summary:"Söhbətləri siyahıla",security:[{bearerAuth:[]}],responses:{"200":{description:"Söhbətlər"}}},
      post:{tags:["Messaging"],summary:"Şəxsi söhbət yarat",security:[{bearerAuth:[]}],responses:{"201":{description:"Söhbət yaradıldı"}}},
    },
    "/api/community/conversations/{id}/messages": {
      parameters:[{name:"id",in:"path",required:true,schema:{type:"string",format:"uuid"}}],
      get:{tags:["Messaging"],summary:"Cursor əsaslı mesaj tarixçəsi",security:[{bearerAuth:[]}],responses:{"200":{description:"Mesajlar"}}},
      post:{tags:["Messaging"],summary:"Mesaj göndər",security:[{bearerAuth:[]}],responses:{"201":{description:"Mesaj saxlanıldı"}}},
    },
    "/api/realtime/ticket": { post:{tags:["Messaging"],summary:"Birdəfəlik realtime bileti al",security:[{bearerAuth:[]}],responses:{"201":{description:"60 saniyəlik bilet"}}} },
    "/api/admin/overview": {
      get: { tags: ["Administration"], summary: "Canlı idarəetmə göstəricilərini göstər", security: [{ bearerAuth: [] }], responses: { "200": { description: "İdarəetmə icmalı" }, "403": { description: "Admin icazəsi tələb olunur" } } },
    },
    "/api/admin/users": {
      get: {
        tags: ["Administration"],
        summary: "İstifadəçiləri siyahıla",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "İstifadəçilər" },
          "403": { description: "Admin icazəsi tələb olunur" },
        },
      },
      post: {
        tags: ["Administration"],
        summary: "Yeni istifadəçi yarat (yalnız əsas admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "İstifadəçi yaradıldı" },
          "403": { description: "Əsas admin icazəsi tələb olunur" },
          "422": { description: "Validasiya xətası" },
        },
      },
    },
    "/api/admin/users/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      patch: {
        tags: ["Administration"],
        summary: "İstifadəçini yenilə və ya adi istifadəçi rolunu dəyiş",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "İstifadəçi yeniləndi" },
          "403": { description: "Administrator hesabı qorunur və ya səlahiyyət yüksəltmə cəhdi rədd edildi" },
          "409": { description: "Aktiv adminin özünü kilidləmə cəhdinin qarşısı alındı" },
          "404": { description: "İstifadəçi tapılmadı" },
        },
      },
      delete: {
        tags: ["Administration"],
        summary: "İstifadəçini sil (yalnız əsas admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          "204": { description: "İstifadəçi silindi" },
          "403": { description: "Əsas admin icazəsi tələb olunur" },
          "409": { description: "Admin öz hesabını silə bilməz" },
          "404": { description: "İstifadəçi tapılmadı" },
        },
      },
    },
    "/api/admin/clubs": {
      get: { tags: ["Administration"], summary: "Klubları idarəetmə üçün siyahıla", security: [{ bearerAuth: [] }], responses: { "200": { description: "Klublar" }, "403": { description: "Admin icazəsi tələb olunur" } } },
      post: { tags: ["Administration"], summary: "Yeni klub yarat", security: [{ bearerAuth: [] }], responses: { "201": { description: "Klub yaradıldı" }, "403": { description: "Admin icazəsi tələb olunur" } } },
    },
    "/api/admin/clubs/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      patch: { tags: ["Administration"], summary: "Klubu yenilə", security: [{ bearerAuth: [] }], responses: { "200": { description: "Klub yeniləndi" }, "403": { description: "Admin icazəsi tələb olunur" } } },
      delete: { tags: ["Administration"], summary: "Klubu sil", security: [{ bearerAuth: [] }], responses: { "204": { description: "Klub silindi" }, "403": { description: "Admin icazəsi tələb olunur" } } },
    },
    "/api/admin/events": {
      get: { tags: ["Administration"], summary: "Tədbirləri idarəetmə üçün siyahıla", security: [{ bearerAuth: [] }], responses: { "200": { description: "Tədbirlər" }, "403": { description: "Admin icazəsi tələb olunur" } } },
      post: { tags: ["Administration"], summary: "Yeni tədbir yarat", security: [{ bearerAuth: [] }], responses: { "201": { description: "Tədbir yaradıldı" }, "403": { description: "Admin icazəsi tələb olunur" } } },
    },
    "/api/admin/events/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      patch: { tags: ["Administration"], summary: "Tədbiri yenilə", security: [{ bearerAuth: [] }], responses: { "200": { description: "Tədbir yeniləndi" }, "403": { description: "Admin icazəsi tələb olunur" } } },
      delete: { tags: ["Administration"], summary: "Tədbiri sil", security: [{ bearerAuth: [] }], responses: { "204": { description: "Tədbir silindi" }, "403": { description: "Admin icazəsi tələb olunur" } } },
    },
    "/api/admin/reviews": {
      get: {
        tags: ["Administration"], summary: "Rəyləri moderasiya üçün siyahıla", security: [{ bearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["pending", "approved", "rejected"], default: "pending" } },
          { name: "teacherId", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Moderasiya rəyləri" }, "403": { description: "Admin icazəsi tələb olunur" } },
      },
    },
    "/api/admin/reviews/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      patch: {
        tags: ["Administration"], summary: "Rəyi təsdiqlə və ya rədd et", security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["status"], properties: { status: { type: "string", enum: ["approved", "rejected"] } } } } } },
        responses: { "200": { description: "Rəy yeniləndi" }, "404": { description: "Rəy tapılmadı" }, "403": { description: "Admin icazəsi tələb olunur" } },
      },
    },
    "/api/workspace": {
      get: {
        tags: ["Authentication"], summary: "Cari rol üçün iş panelini göstər", security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Tələbə, müəllim, mentor və ya rəhbərlik paneli" }, "401": { description: "Giriş tələb olunur" } },
      },
    },
    "/api/workspace/mentorship/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      patch: {
        tags: ["Mentorship"], summary: "Mentorluq müraciətini qəbul et və ya rədd et", security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["status"], properties: { status: { type: "string", enum: ["accepted", "rejected"] } } } } } },
        responses: { "200": { description: "Müraciət yeniləndi" }, "403": { description: "Mentor icazəsi tələb olunur" }, "404": { description: "Müraciət tapılmadı" } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      UserRole: {
        type: "string",
        enum: ["student", "mentor", "teacher", "assistant_admin", "admin"],
        description:
          "admin: tam səlahiyyət; assistant_admin: klub/tədbir CRUD və adi istifadəçilərə student/mentor/teacher rolu vermək; digər rollar: standart istifadəçi səlahiyyətləri.",
      },
      HealthResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            required: ["status", "service", "database", "timestamp"],
            properties: {
              status: { type: "string", example: "ok" },
              service: { type: "string", example: "EduRate API" },
              database: { type: "string", enum: ["memory", "postgresql"] },
              timestamp: { type: "string", format: "date-time" },
            },
          },
        },
      },
      SignupInput: {
        type: "object",
        required: ["name", "email", "password", "accountType", "program"],
        properties: {
          name: { type: "string", example: "Nümunə Tələbə" },
          email: { type: "string", format: "email", example: "telebe@example.az" },
          password: { type: "string", format: "password", minLength: 8, example: "EduRate2026" },
          university: {
            type: "string",
            enum: [ACADEMIC_UNIVERSITY],
            default: ACADEMIC_UNIVERSITY,
            example: ACADEMIC_UNIVERSITY,
          },
          accountType: {
            type: "string",
            enum: ["student", "teacher", "mentor"],
            default: "student",
            description: "Müəllim və mentor hesabları rəhbərlik təsdiqindən sonra aktivləşir.",
          },
          faculty: {
            type: "string",
            enum: academicFaculties,
            description: "Yalnız tələbə qeydiyyatı üçün tələb olunur.",
            example: "Mühəndislik fakültəsi",
          },
          program: {
            type: "string",
            description: "Tələbə üçün ixtisas, müəllim üçün tədris sahəsi, mentor üçün ekspertiza sahəsi.",
            example: "Kompüter mühəndisliyi",
          },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "telebe@example.az" },
          password: { type: "string", format: "password", example: "EduRate2026" },
        },
      },
      ProfileInput: {
        type: "object",
        required: ["name", "university", "faculty", "program", "year", "about"],
        properties: {
          name: { type: "string", example: "Nümunə Tələbə" },
          university: {
            type: "string",
            enum: [ACADEMIC_UNIVERSITY],
            example: ACADEMIC_UNIVERSITY,
          },
          faculty: {
            type: "string",
            enum: academicFaculties,
            example: "Mühəndislik fakültəsi",
          },
          program: {
            type: "string",
            enum: academicPrograms,
            description: "Seçilmiş fakültəyə aid ixtisas olmalıdır.",
            example: "Kompüter mühəndisliyi",
          },
          year: { type: "string", example: "2-ci kurs" },
          about: { type: "string", maxLength: 600 },
        },
      },
      AcademicCatalogResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: {
            type: "array",
            minItems: 7,
            items: {
              type: "object",
              required: ["faculty", "programs"],
              properties: {
                faculty: { type: "string", enum: academicFaculties },
                programs: {
                  type: "array",
                  minItems: 1,
                  items: { type: "string", enum: academicPrograms },
                },
              },
            },
          },
        },
      },
      AcademicSelectionError: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string", example: "INVALID_ACADEMIC_SELECTION" },
              message: {
                type: "string",
                example: "Universitet, fakültə və ixtisas seçimi rəsmi kataloqa uyğun deyil.",
              },
              details: {
                type: "object",
                additionalProperties: { type: "string" },
                example: { program: "İxtisası seçilmiş fakültənin siyahısından seçin." },
              },
            },
          },
        },
      },
      EventInput: {
        type: "object",
        required: ["title", "category", "description", "longDescription", "location", "city", "organizer", "startAt", "endAt", "registrationDeadline", "speakers", "capacity"],
        properties: {
          title: { type: "string", minLength: 3, maxLength: 140, example: "Kampus innovasiya günü" },
          category: { type: "string", enum: ["Design", "Technology", "Culture", "Wellness"] },
          description: { type: "string", minLength: 10, maxLength: 280 },
          longDescription: { type: "string", minLength: 20, maxLength: 1600 },
          location: { type: "string", example: "İnnovasiya mərkəzi" },
          city: { type: "string", example: "Xankəndi" },
          organizer: { type: "string", example: "Tələbə innovasiya klubu" },
          startAt: { type: "string", format: "date-time", example: "2026-10-20T14:00:00+04:00" },
          endAt: { type: "string", format: "date-time", example: "2026-10-20T16:00:00+04:00" },
          registrationDeadline: { type: "string", format: "date-time", example: "2026-10-19T23:59:59+04:00" },
          speakers: { type: "array", items: { type: "string" }, example: ["Nigar Hüseynli", "Tural Kərimov"] },
          capacity: { type: "integer", minimum: 1, maximum: 10000, example: 100 },
          accent: { type: "string", example: "#c8ff4d" },
          glow: { type: "string", example: "rgba(200, 255, 77, 0.28)" },
        },
      },
      Event: {
        allOf: [
          { $ref: "#/components/schemas/EventInput" },
          { type: "object", required: ["id", "availableSpots", "createdAt", "updatedAt"], properties: { id: { type: "string" }, availableSpots: { type: "integer" }, createdBy: { type: ["string", "null"] }, createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" } } },
        ],
      },
      MentorshipRequestInput: {
        type: "object",
        required: ["mentorId"],
        properties: { mentorId: { type: "string", example: "aygun-rzayeva" }, note: { type: "string", maxLength: 600, example: "Məhsul ideyam üçün istiqamət almaq istəyirəm." } },
      },
      TeacherReviewInput: {
        type: "object",
        required: ["teacherId", "course", "semester", "criteria"],
        properties: {
          teacherId: { type: "string", example: "nigar-huseynli" },
          course: { type: "string", example: "İngilis dili" },
          semester: { type: "string", example: "2026-payız" },
          criteria: { type: "object", required: ["clarity", "subjectKnowledge", "objectivity", "communication"], properties: { clarity: { type: "integer", minimum: 1, maximum: 5 }, subjectKnowledge: { type: "integer", minimum: 1, maximum: 5 }, objectivity: { type: "integer", minimum: 1, maximum: 5 }, communication: { type: "integer", minimum: 1, maximum: 5 } } },
        },
      },
      SupportTicketInput: {
        type: "object",
        required: ["name", "email", "topic", "message"],
        properties: { name: { type: "string", minLength: 2 }, email: { type: "string", format: "email" }, topic: { type: "string", minLength: 2 }, message: { type: "string", minLength: 20, maxLength: 2000 } },
      },
    },
  },
} as const;
