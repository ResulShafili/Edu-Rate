import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import type { Express } from "express";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "edurate-test-secret-with-at-least-32-characters";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.TRUST_PROXY = "true";

let app: Express;

before(async () => {
  const module = await import("../src/app.js");
  app = module.createApp();
});

describe("EduRate API", () => {
  it("health endpoint-i server vəziyyətini qaytarır", async () => {
    const response = await request(app).get("/api/health").expect(200);
    assert.equal(response.body.data.status, "ok");
    assert.equal(response.body.data.database, "memory");
  });

  it("OpenAPI sənədini təqdim edir", async () => {
    const response = await request(app).get("/api/openapi.json").expect(200);
    assert.equal(response.body.openapi, "3.1.0");
    assert.ok(response.body.paths["/api/auth/signup"]);
  });

  it("Swagger-in cari API domenindən CORS sorğusuna icazə verir", async () => {
    const response = await request(app)
      .options("/api/auth/signup")
      .set("Host", "edurate-api.onrender.com")
      .set("X-Forwarded-Proto", "https")
      .set("Origin", "https://edurate-api.onrender.com")
      .set("Access-Control-Request-Method", "POST")
      .expect(204);

    assert.equal(
      response.headers["access-control-allow-origin"],
      "https://edurate-api.onrender.com",
    );
  });

  it("qeydiyyat, giriş və sessiya axınını tamamlayır", async () => {
    const email = `aylin.${Date.now()}@example.az`;
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Aylin Nəcəfli",
        email,
        password: "EduRate2026",
        university: "Qarabağ Universiteti",
        faculty: "Mühəndislik fakültəsi",
      })
      .expect(201);

    assert.equal(signup.body.data.user.email, email);
    assert.ok(signup.body.data.token);
    assert.equal(signup.body.data.user.passwordHash, undefined);

    await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Aylin Nəcəfli",
        email,
        password: "EduRate2026",
        faculty: "Mühəndislik fakültəsi",
      })
      .expect(409);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "EduRate2026" })
      .expect(200);

    const session = await request(app)
      .get("/api/auth/session")
      .set("Authorization", `Bearer ${login.body.data.token}`)
      .expect(200);

    assert.equal(session.body.data.user.email, email);
  });

  it("kataloq endpoint-lərini təqdim edir", async () => {
    const [events, clubs, mentors] = await Promise.all([
      request(app).get("/api/events").expect(200),
      request(app).get("/api/clubs").expect(200),
      request(app).get("/api/mentors").expect(200),
    ]);

    assert.ok(events.body.data.length > 0);
    assert.ok(clubs.body.data.length > 0);
    assert.ok(mentors.body.data.length > 0);
  });
});
