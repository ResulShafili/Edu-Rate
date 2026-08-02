import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import type { Express } from "express";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "edurate-test-secret-with-at-least-32-characters";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.TRUST_PROXY = "true";
process.env.ADMIN_EMAILS = "admin.test@example.az";

let app: Express;
let reusableStudentId = "";
let reusableStudentToken = "";
let reusableAdminToken = "";

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
    assert.ok(response.body.paths["/api/clubs/{clubId}/memberships"]);
    assert.ok(response.body.paths["/api/reviews"]);
    assert.ok(response.body.paths["/api/support/tickets"]);
    assert.ok(response.body.paths["/api/academic-catalog"]);
  });

  it("CORS-u yalnız frontend allowlist-i ilə məhdudlaşdırır", async () => {
    const allowed = await request(app)
      .options("/api/auth/signup")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "POST")
      .expect(204);
    assert.equal(allowed.headers["access-control-allow-origin"], "http://localhost:3000");
    assert.equal(allowed.headers["access-control-allow-credentials"], undefined);

    const denied = await request(app)
      .options("/api/auth/signup")
      .set("Origin", "https://attacker.example")
      .set("Access-Control-Request-Method", "POST")
      .expect(200);
    assert.equal(denied.headers["access-control-allow-origin"], undefined);
  });

  it("yanlış və həddindən böyük JSON sorğularını təhlükəsiz rədd edir", async () => {
    const malformed = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":')
      .expect(400);
    assert.equal(malformed.body.error.code, "INVALID_JSON");

    const oversized = await request(app)
      .post("/api/support/tickets")
      .send({
        name: "Test İstifadəçisi",
        email: "payload@example.az",
        topic: "Təhlükəsizlik testi",
        message: "x".repeat(70_000),
      })
      .expect(413);
    assert.equal(oversized.body.error.code, "PAYLOAD_TOO_LARGE");
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
        program: "Kompüter mühəndisliyi",
      })
      .expect(201);

    assert.equal(signup.body.data.user.email, email);
    assert.ok(signup.body.data.token);
    assert.equal(signup.body.data.user.passwordHash, undefined);
    reusableStudentId = signup.body.data.user.id;
    reusableStudentToken = signup.body.data.token;

    await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Nümunə Tələbə",
        email,
        password: "EduRate2026",
        faculty: "Mühəndislik fakültəsi",
        program: "Kompüter mühəndisliyi",
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

    const invalidProfile = await request(app)
      .patch("/api/auth/profile")
      .set("Authorization", `Bearer ${login.body.data.token}`)
      .send({
        name: "Nümunə Tələbə",
        university: "Qarabağ Universiteti",
        faculty: "Mühəndislik fakültəsi",
        program: "Psixologiya",
        year: "2-ci kurs",
        about: "Uyğun olmayan ixtisas seçimi sınağı.",
      })
      .expect(422);
    assert.equal(invalidProfile.body.error.code, "INVALID_ACADEMIC_SELECTION");

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

  it("rəsmi akademik kataloqu və fakültə-ixtisas uyğunluğunu qoruyur", async () => {
    const { ACADEMIC_CATALOG, isValidAcademicSelection } = await import(
      "../src/data/academic-catalog.js"
    );
    assert.equal(ACADEMIC_CATALOG.length, 7);

    const catalog = await request(app).get("/api/academic-catalog").expect(200);
    assert.deepEqual(catalog.body.data, ACADEMIC_CATALOG);

    for (const entry of ACADEMIC_CATALOG) {
      assert.ok(entry.programs.length > 0);
      for (const program of entry.programs) {
        assert.equal(isValidAcademicSelection(entry.faculty, program), true);
      }
    }
    assert.equal(isValidAcademicSelection("Mühəndislik fakültəsi", "Psixologiya"), false);
    assert.equal(isValidAcademicSelection("Mövcud olmayan fakültə", "Tibb"), false);

    const validBase = {
      name: "Akademik Seçim Testi",
      password: "EduRate2026",
      university: "Qarabağ Universiteti",
      faculty: "Mühəndislik fakültəsi",
      program: "Kompüter mühəndisliyi",
    };

    const mismatched = await request(app)
      .post("/api/auth/signup")
      .set("X-Forwarded-For", "203.0.113.21")
      .send({ ...validBase, email: `mismatch.${Date.now()}@example.az`, program: "Psixologiya" })
      .expect(422);
    assert.equal(mismatched.body.error.code, "INVALID_ACADEMIC_SELECTION");
    assert.ok(mismatched.body.error.details.program);

    const unsupportedUniversity = await request(app)
      .post("/api/auth/signup")
      .set("X-Forwarded-For", "203.0.113.22")
      .send({ ...validBase, email: `university.${Date.now()}@example.az`, university: "Başqa Universitet" })
      .expect(422);
    assert.equal(unsupportedUniversity.body.error.code, "INVALID_ACADEMIC_SELECTION");
    assert.ok(unsupportedUniversity.body.error.details.university);

    const missingProgram = await request(app)
      .post("/api/auth/signup")
      .set("X-Forwarded-For", "203.0.113.23")
      .send({
        name: validBase.name,
        email: `missing.${Date.now()}@example.az`,
        password: validBase.password,
        university: validBase.university,
        faculty: validBase.faculty,
      })
      .expect(422);
    assert.equal(missingProgram.body.error.code, "VALIDATION_ERROR");
    assert.ok(missingProgram.body.error.details.program);
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
        program: "İqtisadiyyat",
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

  it("klub üzvlüyü, müəllim rəyi və dəstək müraciətini bazada saxlayır", async () => {
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Aysel Məmmədli",
        email: `platform.${Date.now()}@example.az`,
        password: "EduRate2026",
        university: "Qarabağ Universiteti",
        faculty: "Humanitar və sosial elmlər fakültəsi",
        program: "Psixologiya",
      })
      .expect(201);
    const authorization = `Bearer ${signup.body.data.token}`;

    await request(app)
      .post("/api/clubs/innovasiya-robototexnika/memberships")
      .set("Authorization", authorization)
      .expect(201);
    const memberships = await request(app)
      .get("/api/clubs/memberships/me")
      .set("Authorization", authorization)
      .expect(200);
    assert.ok(memberships.body.data.some((club: { slug: string }) => club.slug === "innovasiya-robototexnika"));

    const reviewInput = {
      teacherId: "nigar-huseynli",
      course: "İngilis dili",
      semester: `2026-payız-${Date.now()}`,
      text: "İzahlar aydın idi və tapşırıqlara faydalı geribildirim verildi.",
      criteria: { clarity: 5, subjectKnowledge: 5, objectivity: 4, communication: 5 },
    };
    await request(app).post("/api/reviews").set("Authorization", authorization).send(reviewInput).expect(201);
    await request(app).post("/api/reviews").set("Authorization", authorization).send(reviewInput).expect(409);
    await request(app).post("/api/reviews").set("Authorization", authorization).send({ ...reviewInput, semester: "2027-yaz", text: "Bu müəllim axmaqdır və heç nə bilmir." }).expect(422);

    const ticket = await request(app).post("/api/support/tickets").send({
      name: "Aysel Məmmədli",
      email: "aysel.memmedli@example.az",
      topic: "Tədbir qeydiyyatı",
      message: "Tədbir qeydiyyatımın vəziyyətini dəqiqləşdirmək istəyirəm.",
    }).expect(201);
    assert.match(ticket.body.data.reference, /^EDU-/);

    await request(app)
      .delete("/api/clubs/innovasiya-robototexnika/memberships")
      .set("Authorization", authorization)
      .expect(200);
  });

  it("admin icmalı və real idarəetmə siyahılarını qorunan API-dən qaytarır", async () => {
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test Administratoru",
        email: "admin.test@example.az",
        password: "EduRate2026",
        university: "Qarabağ Universiteti",
        faculty: "Pedaqoji fakültə",
        program: "Riyaziyyat müəllimliyi",
      })
      .expect(201);
    assert.equal(signup.body.data.user.role, "admin");
    const authorization = `Bearer ${signup.body.data.token}`;
    reusableAdminToken = signup.body.data.token;

    const overview = await request(app).get("/api/admin/overview").set("Authorization", authorization).expect(200);
    assert.equal(overview.body.data.metrics.length, 4);
    const users = await request(app).get("/api/admin/users?page=1&pageSize=5").set("Authorization", authorization).expect(200);
    assert.equal(users.body.data.page, 1);
    assert.ok(users.body.data.total >= 1);
    const clubs = await request(app).get("/api/admin/clubs?page=1&pageSize=5").set("Authorization", authorization).expect(200);
    assert.ok(clubs.body.data.total >= 1);

    await request(app)
      .patch(`/api/admin/users/${reusableStudentId}`)
      .set("Authorization", authorization)
      .send({ status: "Məhdudlaşdırılıb" })
      .expect(200);
    await request(app)
      .get("/api/auth/session")
      .set("Authorization", `Bearer ${reusableStudentToken}`)
      .expect(403);

  });

  it("iki səviyyəli admin icazələrini server tərəfində tətbiq edir", async () => {
    const adminAuthorization = `Bearer ${reusableAdminToken}`;
    const suffix = Date.now();

    const primaryAdminSession = await request(app)
      .get("/api/auth/session")
      .set("Authorization", adminAuthorization)
      .expect(200);
    const primaryAdminId = primaryAdminSession.body.data.user.id as string;

    for (const unsafeSelfPatch of [{ role: "student" }, { status: "Məhdudlaşdırılıb" }]) {
      const deniedSelfLockout = await request(app)
        .patch(`/api/admin/users/${primaryAdminId}`)
        .set("Authorization", adminAuthorization)
        .send(unsafeSelfPatch)
        .expect(409);
      assert.equal(deniedSelfLockout.body.error.code, "SELF_ADMIN_LOCKOUT_FORBIDDEN");
    }

    const assistantCandidate = await request(app)
      .post("/api/admin/users")
      .set("Authorization", adminAuthorization)
      .send({
        name: "Admin Köməkçisi",
        email: `assistant.${suffix}@example.az`,
        role: "student",
        university: "Qarabağ Universiteti",
        faculty: "İdarəetmə fakültəsi",
      })
      .expect(201);
    const assistantId = assistantCandidate.body.data.id as string;

    const student = await request(app)
      .post("/api/admin/users")
      .set("Authorization", adminAuthorization)
      .send({
        name: "RBAC Tələbəsi",
        email: `student.rbac.${suffix}@example.az`,
        role: "student",
        university: "Qarabağ Universiteti",
        faculty: "Mühəndislik fakültəsi",
      })
      .expect(201);
    const studentId = student.body.data.id as string;

    const [{ findUserById }, { createAccessToken }] = await Promise.all([
      import("../src/db/database.js"),
      import("../src/lib/auth.js"),
    ]);
    const assistantRecord = await findUserById(assistantId);
    const studentRecord = await findUserById(studentId);
    assert.ok(assistantRecord);
    assert.ok(studentRecord);
    const assistantAuthorization = `Bearer ${createAccessToken(assistantRecord)}`;
    const studentAuthorization = `Bearer ${createAccessToken(studentRecord)}`;

    const promoted = await request(app)
      .patch(`/api/admin/users/${assistantId}`)
      .set("Authorization", adminAuthorization)
      .send({ role: "assistant_admin" })
      .expect(200);
    assert.equal(promoted.body.data.role, "assistant_admin");

    const assistantSession = await request(app)
      .get("/api/auth/session")
      .set("Authorization", assistantAuthorization)
      .expect(200);
    assert.equal(assistantSession.body.data.user.role, "assistant_admin");

    await Promise.all([
      request(app).get("/api/admin/overview").set("Authorization", assistantAuthorization).expect(200),
      request(app).get("/api/admin/users").set("Authorization", assistantAuthorization).expect(200),
      request(app).get("/api/admin/clubs").set("Authorization", assistantAuthorization).expect(200),
      request(app).get("/api/admin/events").set("Authorization", assistantAuthorization).expect(200),
    ]);

    const eventInput = {
      name: "RBAC inteqrasiya tədbiri",
      category: "Texnologiya",
      organizer: "EduRate komandası",
      startAt: "2027-02-12T14:00:00+04:00",
      capacity: 80,
      place: "İnnovasiya mərkəzi",
    };
    const createdEvent = await request(app)
      .post("/api/admin/events")
      .set("Authorization", assistantAuthorization)
      .send(eventInput)
      .expect(201);
    const eventId = createdEvent.body.data.id as string;
    await request(app)
      .patch(`/api/admin/events/${eventId}`)
      .set("Authorization", assistantAuthorization)
      .send({ name: "Yenilənmiş RBAC tədbiri" })
      .expect(200);

    const clubSlug = `rbac-klubu-${suffix}`;
    const createdClub = await request(app)
      .post("/api/admin/clubs")
      .set("Authorization", assistantAuthorization)
      .send({
        name: "RBAC İnnovasiya Klubu",
        slug: clubSlug,
        category: "Texnologiya",
        coordinatorInitials: "RK",
      })
      .expect(201);
    const clubId = createdClub.body.data.id as string;
    await request(app)
      .patch(`/api/admin/clubs/${clubId}`)
      .set("Authorization", assistantAuthorization)
      .send({ name: "RBAC Texnologiya Klubu" })
      .expect(200);

    const forbiddenUserCreate = await request(app)
      .post("/api/admin/users")
      .set("Authorization", assistantAuthorization)
      .send({
        name: "İcazəsiz İstifadəçi",
        email: `forbidden.${suffix}@example.az`,
        role: "student",
        university: "Qarabağ Universiteti",
        faculty: "İqtisadiyyat fakültəsi",
      })
      .expect(403);
    assert.equal(forbiddenUserCreate.body.error.code, "PRIMARY_ADMIN_REQUIRED");

    const allowedLowerRoleChange = await request(app)
      .patch(`/api/admin/users/${studentId}`)
      .set("Authorization", assistantAuthorization)
      .send({ role: "mentor" })
      .expect(200);
    assert.equal(allowedLowerRoleChange.body.data.role, "mentor");

    const forbiddenRoleEscalation = await request(app)
      .patch(`/api/admin/users/${studentId}`)
      .set("Authorization", assistantAuthorization)
      .send({ role: "admin" })
      .expect(403);
    assert.equal(forbiddenRoleEscalation.body.error.code, "ROLE_ESCALATION_FORBIDDEN");

    const forbiddenSelfRoleChange = await request(app)
      .patch(`/api/admin/users/${assistantId}`)
      .set("Authorization", assistantAuthorization)
      .send({ role: "student" })
      .expect(403);
    assert.equal(
      forbiddenSelfRoleChange.body.error.code,
      "PRIVILEGED_USER_MODIFICATION_FORBIDDEN",
    );

    const forbiddenPrimaryAdminChange = await request(app)
      .patch(`/api/admin/users/${primaryAdminId}`)
      .set("Authorization", assistantAuthorization)
      .send({ role: "teacher" })
      .expect(403);
    assert.equal(
      forbiddenPrimaryAdminChange.body.error.code,
      "PRIVILEGED_USER_MODIFICATION_FORBIDDEN",
    );

    await request(app)
      .patch(`/api/admin/users/${studentId}`)
      .set("Authorization", assistantAuthorization)
      .send({ role: "teacher", status: "Aktiv" })
      .expect(422);

    const forbiddenUserDelete = await request(app)
      .delete(`/api/admin/users/${studentId}`)
      .set("Authorization", assistantAuthorization)
      .expect(403);
    assert.equal(forbiddenUserDelete.body.error.code, "PRIMARY_ADMIN_REQUIRED");

    for (const path of ["/api/admin/overview", "/api/admin/users", "/api/admin/events", "/api/admin/clubs"]) {
      const denied = await request(app)
        .get(path)
        .set("Authorization", studentAuthorization)
        .expect(403);
      assert.equal(denied.body.error.code, "ADMIN_REQUIRED");
    }

    await request(app)
      .delete(`/api/admin/events/${eventId}`)
      .set("Authorization", assistantAuthorization)
      .expect(204);
    await request(app)
      .delete(`/api/admin/clubs/${clubId}`)
      .set("Authorization", assistantAuthorization)
      .expect(204);

    await request(app)
      .delete(`/api/admin/users/${studentId}`)
      .set("Authorization", adminAuthorization)
      .expect(204);
    await request(app)
      .delete(`/api/admin/users/${assistantId}`)
      .set("Authorization", adminAuthorization)
      .expect(204);
  });

  it("legacy akademik məlumatlı hesabların sessiya və profil axınını pozmur", async () => {
    const adminAuthorization = `Bearer ${reusableAdminToken}`;
    const created = await request(app)
      .post("/api/admin/users")
      .set("Authorization", adminAuthorization)
      .send({
        name: "Legacy Tələbə",
        email: `legacy.${Date.now()}@example.az`,
        role: "student",
        university: "Köhnə Universitet",
        faculty: "Köhnə fakültə",
      })
      .expect(201);

    const [{ findUserById }, { createAccessToken }] = await Promise.all([
      import("../src/db/database.js"),
      import("../src/lib/auth.js"),
    ]);
    const legacyUser = await findUserById(created.body.data.id as string);
    assert.ok(legacyUser);
    const authorization = `Bearer ${createAccessToken(legacyUser)}`;

    const session = await request(app)
      .get("/api/auth/session")
      .set("Authorization", authorization)
      .expect(200);
    assert.equal(session.body.data.user.university, "Köhnə Universitet");
    assert.equal(session.body.data.user.faculty, "Köhnə fakültə");

    const profile = await request(app)
      .patch("/api/auth/profile")
      .set("Authorization", authorization)
      .send({
        name: "Legacy Tələbə",
        university: legacyUser.university,
        faculty: legacyUser.faculty,
        program: legacyUser.program,
        year: legacyUser.year,
        about: "Mövcud akademik məlumatlar dəyişdirilmədən profil yeniləndi.",
      })
      .expect(200);
    assert.equal(profile.body.data.user.about, "Mövcud akademik məlumatlar dəyişdirilmədən profil yeniləndi.");

    await request(app)
      .delete(`/api/admin/users/${legacyUser.id}`)
      .set("Authorization", adminAuthorization)
      .expect(204);
  });
});
