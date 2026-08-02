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
    { name: "Reviews", description: "Müəllim rəyləri və moderasiya" },
    { name: "Support", description: "Dəstək müraciətləri" },
    {
      name: "Administration",
      description:
        "Əsas admin və admin köməkçisi üçün idarəetmə əməliyyatları. İstifadəçi yazma əməliyyatları yalnız əsas adminə açıqdır.",
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
          "422": { description: "Validasiya xətası" },
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
          "422": { description: "Validasiya xətası" },
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
      post: {
        tags: ["Reviews"], summary: "Moderasiya növbəsinə müəllim rəyi göndər", security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TeacherReviewInput" } } } },
        responses: { "201": { description: "Rəy saxlanıldı" }, "409": { description: "Cari semestr üçün rəy mövcuddur" }, "422": { description: "Validasiya və ya moderasiya xətası" } },
      },
    },
    "/api/support/tickets": {
      post: {
        tags: ["Support"], summary: "Dəstək müraciəti yarat",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SupportTicketInput" } } } },
        responses: { "201": { description: "Müraciət saxlanıldı" }, "422": { description: "Validasiya xətası" } },
      },
    },
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
        summary: "İstifadəçini və rolunu yenilə (yalnız əsas admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "İstifadəçi yeniləndi" },
          "403": { description: "Əsas admin icazəsi tələb olunur" },
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
          "admin: tam səlahiyyət; assistant_admin: admin paneli və klub/tədbir CRUD; digər rollar: standart istifadəçi səlahiyyətləri.",
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
        required: ["name", "email", "password", "faculty"],
        properties: {
          name: { type: "string", example: "Nümunə Tələbə" },
          email: { type: "string", format: "email", example: "telebe@example.az" },
          password: { type: "string", format: "password", minLength: 8, example: "EduRate2026" },
          university: { type: "string", example: "Qarabağ Universiteti" },
          faculty: { type: "string", example: "Mühəndislik fakültəsi" },
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
          university: { type: "string", example: "Qarabağ Universiteti" },
          faculty: { type: "string", example: "Mühəndislik fakültəsi" },
          program: { type: "string", example: "Kompüter mühəndisliyi" },
          year: { type: "string", example: "2-ci kurs" },
          about: { type: "string", maxLength: 600 },
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
        required: ["teacherId", "course", "semester", "text", "criteria"],
        properties: {
          teacherId: { type: "string", example: "nigar-huseynli" },
          course: { type: "string", example: "İngilis dili" },
          semester: { type: "string", example: "2026-payız" },
          text: { type: "string", minLength: 12, maxLength: 1200 },
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
