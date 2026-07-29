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
    { name: "Administration", description: "Admin əməliyyatları" },
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
    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Client sessiyasını bitir",
        responses: { "204": { description: "Çıxış edildi" } },
      },
    },
    "/api/events": {
      get: {
        tags: ["Catalog"],
        summary: "Tədbirləri siyahıla",
        responses: { "200": { description: "Tədbirlər" } },
      },
    },
    "/api/clubs": {
      get: {
        tags: ["Catalog"],
        summary: "Klubları siyahıla",
        responses: { "200": { description: "Klublar" } },
      },
    },
    "/api/mentors": {
      get: {
        tags: ["Catalog"],
        summary: "Mentorları siyahıla",
        responses: { "200": { description: "Mentorlar" } },
      },
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
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
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
          name: { type: "string", example: "Aylin Nəcəfli" },
          email: { type: "string", format: "email", example: "aylin@example.az" },
          password: { type: "string", format: "password", minLength: 8, example: "EduRate2026" },
          university: { type: "string", example: "Qarabağ Universiteti" },
          faculty: { type: "string", example: "Mühəndislik fakültəsi" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "aylin@example.az" },
          password: { type: "string", format: "password", example: "EduRate2026" },
        },
      },
    },
  },
} as const;
