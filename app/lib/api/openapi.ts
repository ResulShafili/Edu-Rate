const jsonContent = (schema: Record<string, unknown>) => ({
  content: { "application/json": { schema } },
});

const success = (schema: Record<string, unknown>, description = "Uğurlu cavab") => ({
  description,
  ...jsonContent({
    type: "object",
    required: ["data"],
    properties: { data: schema },
  }),
});

const error = (description: string) => ({
  description,
  ...jsonContent({ $ref: "#/components/schemas/ErrorResponse" }),
});

const adminListParameters = [
  { name: "search", in: "query", schema: { type: "string" } },
  { name: "status", in: "query", schema: { type: "string" } },
  { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
  { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
] as const;

const idParameter = { name: "id", in: "path", required: true, schema: { type: "string" } } as const;

function adminItemPath(label: string) {
  return {
    patch: {
      tags: ["Administration"],
      summary: `${label} məlumatlarını yenilə`,
      parameters: [idParameter],
      requestBody: { required: true, ...jsonContent({ type: "object", additionalProperties: true }) },
      responses: { "200": success({ type: "object", additionalProperties: true }) },
    },
    delete: {
      tags: ["Administration"],
      summary: `${label} sil`,
      parameters: [idParameter],
      responses: { "204": { description: `${label} silindi` } },
    },
  };
}

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "EduRate MVP API",
    version: "1.0.0",
    description: "EduRate tələbə portalı üçün ilkin REST API kontraktı. Bu versiya demo yaddaş anbarı ilə işləyir və davamlı database qatı növbəti sprintdə əvəzlənə bilər.",
  },
  servers: [{ url: "/", description: "Cari tətbiq" }],
  tags: [
    { name: "System", description: "Sistem vəziyyəti" },
    { name: "Authentication", description: "Qeydiyyat, giriş və sessiya" },
    { name: "Administration", description: "İstifadəçi, klub və tədbir idarəetməsi" },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "API sağlamlıq yoxlaması",
        responses: { "200": success({ $ref: "#/components/schemas/Health" }) },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["Authentication"],
        summary: "Yeni tələbə hesabı yarat",
        requestBody: { required: true, ...jsonContent({ $ref: "#/components/schemas/RegisterInput" }) },
        responses: {
          "201": success({ $ref: "#/components/schemas/Session" }, "Hesab uğurla yaradıldı"),
          "409": error("E-poçt artıq istifadə olunur"),
          "422": error("Validasiya xətası"),
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "E-poçt və şifrə ilə daxil ol",
        requestBody: { required: true, ...jsonContent({ $ref: "#/components/schemas/LoginInput" }) },
        responses: {
          "200": success({ $ref: "#/components/schemas/Session" }),
          "401": error("Giriş məlumatları düzgün deyil"),
          "422": error("Validasiya xətası"),
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Sessiyanı bağla",
        responses: { "204": { description: "Sessiya bağlandı" } },
      },
    },
    "/api/auth/session": {
      get: {
        tags: ["Authentication"],
        summary: "Cari sessiyanı qaytar",
        responses: {
          "200": success({ $ref: "#/components/schemas/Session" }),
          "401": error("Aktiv sessiya yoxdur"),
        },
      },
    },
    "/api/auth/profile": {
      patch: {
        tags: ["Authentication"],
        summary: "Cari istifadəçi profilini yenilə",
        requestBody: { required: true, ...jsonContent({ $ref: "#/components/schemas/ProfileUpdateInput" }) },
        responses: {
          "200": success({ $ref: "#/components/schemas/Session" }),
          "401": error("Daxil olmaq tələb olunur"),
          "422": error("Validasiya xətası"),
        },
      },
    },
    "/api/admin/overview": {
      get: {
        tags: ["Administration"],
        summary: "İdarəetmə panelinin ümumi göstəriciləri",
        responses: { "200": success({ type: "object", additionalProperties: true }) },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Administration"],
        summary: "İstifadəçiləri siyahıla",
        parameters: adminListParameters,
        responses: { "200": success({ $ref: "#/components/schemas/PaginatedResult" }) },
      },
      post: {
        tags: ["Administration"],
        summary: "İstifadəçi yarat",
        requestBody: { required: true, ...jsonContent({ type: "object", additionalProperties: true }) },
        responses: { "201": success({ type: "object", additionalProperties: true }, "İstifadəçi yaradıldı") },
      },
    },
    "/api/admin/users/{id}": adminItemPath("İstifadəçi"),
    "/api/admin/clubs": {
      get: {
        tags: ["Administration"],
        summary: "Klubları siyahıla",
        parameters: adminListParameters,
        responses: { "200": success({ $ref: "#/components/schemas/PaginatedResult" }) },
      },
      post: {
        tags: ["Administration"],
        summary: "Klub yarat",
        requestBody: { required: true, ...jsonContent({ type: "object", additionalProperties: true }) },
        responses: { "201": success({ type: "object", additionalProperties: true }, "Klub yaradıldı") },
      },
    },
    "/api/admin/clubs/{id}": adminItemPath("Klub"),
    "/api/admin/events": {
      get: {
        tags: ["Administration"],
        summary: "Tədbirləri siyahıla",
        parameters: adminListParameters,
        responses: { "200": success({ $ref: "#/components/schemas/PaginatedResult" }) },
      },
      post: {
        tags: ["Administration"],
        summary: "Tədbir yarat",
        requestBody: { required: true, ...jsonContent({ type: "object", additionalProperties: true }) },
        responses: { "201": success({ type: "object", additionalProperties: true }, "Tədbir yaradıldı") },
      },
    },
    "/api/admin/events/{id}": adminItemPath("Tədbir"),
    "/api/reviews/validate": {
      post: {
        tags: ["System"],
        summary: "Müəllim rəyi üçün moderasiya yoxlaması",
        requestBody: { required: true, ...jsonContent({ type: "object", additionalProperties: true }) },
        responses: {
          "200": success({ type: "object", additionalProperties: true }),
          "422": error("Rəy moderasiyadan keçmədi"),
        },
      },
    },
  },
  components: {
    schemas: {
      Health: {
        type: "object",
        required: ["status", "service", "timestamp"],
        properties: {
          status: { type: "string", example: "ok" },
          service: { type: "string", example: "EduRate API" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password", "university", "faculty"],
        properties: {
          name: { type: "string", example: "Nümunə Tələbə" },
          email: { type: "string", format: "email", example: "telebe@edurate.az" },
          password: { type: "string", format: "password", minLength: 8 },
          university: { type: "string", example: "Qarabağ Universiteti" },
          faculty: { type: "string", example: "İnformasiya texnologiyaları" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password", minLength: 8 },
        },
      },
      ProfileUpdateInput: {
        type: "object",
        required: ["name", "university", "faculty", "program", "year", "about"],
        properties: {
          name: { type: "string" }, university: { type: "string" }, faculty: { type: "string" },
          program: { type: "string" }, year: { type: "string" }, about: { type: "string", maxLength: 600 },
        },
      },
      User: { type: "object", additionalProperties: true },
      Session: {
        type: "object",
        required: ["user"],
        properties: { user: { $ref: "#/components/schemas/User" } },
      },
      PaginatedResult: {
        type: "object",
        required: ["items", "total", "page", "pageSize"],
        properties: {
          items: { type: "array", items: { type: "object", additionalProperties: true } },
          total: { type: "integer", minimum: 0 },
          page: { type: "integer", minimum: 1 },
          pageSize: { type: "integer", minimum: 1 },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: { code: { type: "string" }, message: { type: "string" }, details: { type: "object", additionalProperties: { type: "string" } } },
          },
        },
      },
    },
  },
} as const;
