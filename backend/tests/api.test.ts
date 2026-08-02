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
    assert.ok(response.body.paths["/api/events/{eventId}"]);
    assert.ok(response.body.paths["/api/mentorship/requests"]);
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
    const email = `telebe.${Date.now()}@example.az`;
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Nümunə Tələbə",
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
        name: "Nümunə Tələbə",
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

    const profile = await request(app)
      .patch("/api/auth/profile")
      .set("Authorization", `Bearer ${login.body.data.token}`)
      .send({
        name: "Nümunə Tələbə",
        university: "Qarabağ Universiteti",
        faculty: "Mühəndislik fakültəsi",
        program: "Kompüter mühəndisliyi",
        year: "2-ci kurs",
        about: "Texnologiya və tələbə icmaları ilə maraqlanıram.",
      })
      .expect(200);

    assert.equal(profile.body.data.user.program, "Kompüter mühəndisliyi");
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

  it("tədbir CRUD, qeydiyyat və mentorluq axınlarını başdan sona tamamlayır", async () => {
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test İstifadəçisi",
        email: `crud.${Date.now()}@example.az`,
        password: "EduRate2026",
        university: "Qarabağ Universiteti",
        faculty: "İqtisadiyyat fakültəsi",
      })
      .expect(201);
    const authorization = `Bearer ${signup.body.data.token}`;
    const eventInput = {
      title: "Sprint 2 innovasiya görüşü",
      category: "Technology",
      description: "Tələbə layihələrinin təqdim olunduğu açıq innovasiya görüşü.",
      longDescription: "Komandalar işlək prototiplərini təqdim edir, rəy alır və növbəti inkişaf addımlarını birlikdə müəyyənləşdirirlər.",
      location: "İnnovasiya mərkəzi",
      city: "Xankəndi",
      organizer: "EduRate tələbə komandası",
      startAt: "2026-12-10T14:00:00+04:00",
      endAt: "2026-12-10T16:00:00+04:00",
      registrationDeadline: "2026-12-09T23:59:59+04:00",
      speakers: ["Nigar Hüseynli", "Tural Kərimov"],
      capacity: 40,
      accent: "#c8ff4d",
      glow: "rgba(200, 255, 77, 0.28)",
    };

    const created = await request(app)
      .post("/api/events")
      .set("Authorization", authorization)
      .send(eventInput)
      .expect(201);
    const eventId = created.body.data.id as string;
    assert.equal(created.body.data.availableSpots, 40);

    const updated = await request(app)
      .patch(`/api/events/${eventId}`)
      .set("Authorization", authorization)
      .send({ ...eventInput, title: "Yenilənmiş innovasiya görüşü" })
      .expect(200);
    assert.equal(updated.body.data.title, "Yenilənmiş innovasiya görüşü");

    await request(app)
      .post(`/api/events/${eventId}/registrations`)
      .set("Authorization", authorization)
      .expect(201);
    await request(app)
      .post(`/api/events/${eventId}/registrations`)
      .set("Authorization", authorization)
      .expect(409);

    const myEvents = await request(app)
      .get("/api/events/registrations/me")
      .set("Authorization", authorization)
      .expect(200);
    assert.ok(myEvents.body.data.some((event: { id: string }) => event.id === eventId));

    await request(app)
      .delete(`/api/events/${eventId}/registrations`)
      .set("Authorization", authorization)
      .expect(200);

    const mentorship = await request(app)
      .post("/api/mentorship/requests")
      .set("Authorization", authorization)
      .send({ mentorId: "aygun-rzayeva", note: "Məhsul ideyamı dəqiqləşdirmək istəyirəm." })
      .expect(201);
    const mentorshipId = mentorship.body.data.id as string;

    await request(app)
      .patch(`/api/mentorship/requests/${mentorshipId}`)
      .set("Authorization", authorization)
      .send({ note: "Məhsul strategiyası üzrə ilkin plan hazırlamaq istəyirəm." })
      .expect(200);
    await request(app)
      .delete(`/api/mentorship/requests/${mentorshipId}`)
      .set("Authorization", authorization)
      .expect(204);

    await request(app)
      .delete(`/api/events/${eventId}`)
      .set("Authorization", authorization)
      .expect(204);
    await request(app).get(`/api/events/${eventId}`).expect(404);
  });
});
