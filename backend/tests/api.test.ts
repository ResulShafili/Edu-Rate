import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import type { Express } from "express";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "edurate-test-secret-with-at-least-32-characters";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.TRUST_PROXY = "true";

let app: Express;
let reusableStudentId = "";
let reusableStudentToken = "";
let reusableAdminToken = "";
let reusableReviewId = "";

before(async () => {
  const module = await import("../src/app.js");
  app = module.createApp();
  const [{createUser},{createAccessToken,hashPassword}]=await Promise.all([import("../src/db/database.js"),import("../src/lib/auth.js")]);
  const admin=await createUser({name:"Başlanğıc Administrator",email:"bootstrap.admin@example.az",passwordHash:await hashPassword("EduRate2026"),university:"Qarabağ Universiteti",faculty:"Pedaqoji fakültə",program:"Riyaziyyat müəllimliyi",role:"admin",status:"Aktiv"});
  reusableAdminToken=createAccessToken(admin);
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
    assert.ok(response.body.paths["/api/clubs/{clubId}"]);
    assert.ok(response.body.paths["/api/reviews"]);
    assert.ok(response.body.paths["/api/network/announcements"]);
    assert.ok(response.body.paths["/api/network/feed"]);
    assert.ok(response.body.paths["/api/admin/reviews"]);
    assert.ok(response.body.paths["/api/admin/announcements"]);
    assert.ok(response.body.paths["/api/admin/feed"]);
    assert.ok(response.body.paths["/api/admin/support-tickets"]);
    assert.ok(response.body.paths["/api/workspace"]);
    assert.ok(response.body.paths["/api/workspace/mentorship/{id}"]);
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
    const [events, clubs, mentors, teachers, announcements, feed] = await Promise.all([
      request(app).get("/api/events").expect(200),
      request(app).get("/api/clubs").expect(200),
      request(app).get("/api/mentors").expect(200),
      request(app).get("/api/teachers").expect(200),
      request(app).get("/api/network/announcements").expect(200),
      request(app).get("/api/network/feed").expect(200),
    ]);

    assert.ok(events.body.data.length > 0);
    assert.ok(clubs.body.data.length > 0);
    assert.ok(mentors.body.data.length > 0);
    assert.ok(teachers.body.data.length > 0);
    assert.equal(typeof teachers.body.data[0].rating, "number");
    assert.equal(typeof teachers.body.data[0].reviewCount, "number");
    assert.ok(announcements.body.data.length > 0);
    assert.ok(feed.body.data.length > 0);
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
      .set("Authorization", `Bearer ${reusableAdminToken}`)
      .send(eventInput)
      .expect(201);
    const eventId = created.body.data.id as string;
    assert.equal(created.body.data.availableSpots, 40);

    const updated = await request(app)
      .patch(`/api/events/${eventId}`)
      .set("Authorization", `Bearer ${reusableAdminToken}`)
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
      .set("Authorization", `Bearer ${reusableAdminToken}`)
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
      criteria: { clarity: 5, subjectKnowledge: 5, objectivity: 4, communication: 5 },
    };
    const createdReview = await request(app).post("/api/reviews").set("Authorization", authorization).send(reviewInput).expect(201);
    reusableReviewId = createdReview.body.data.id;
    await request(app).post("/api/reviews").set("Authorization", authorization).send(reviewInput).expect(409);
    await request(app).post("/api/reviews").set("Authorization", authorization).send({ ...reviewInput, semester: "2027-yaz", text: "Açıq mətn API tərəfindən qəbul edilməməlidir." }).expect(422);

    const ticket = await request(app).post("/api/support/tickets").set("Authorization", authorization).send({
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
    assert.equal(signup.body.data.user.role, "student");
    const denied = await request(app)
      .get("/api/admin/overview")
      .set("Authorization", `Bearer ${signup.body.data.token}`)
      .expect(403);
    assert.equal(denied.body.error.code, "ADMIN_REQUIRED");
    const authorization = `Bearer ${reusableAdminToken}`;

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

  it("admin rəy moderasiyasını tamamlayır və yalnız təsdiqlənmiş rəyi yayımlayır", async () => {
    const authorization = `Bearer ${reusableAdminToken}`;
    const pending = await request(app)
      .get("/api/admin/reviews?status=pending")
      .set("Authorization", authorization)
      .expect(200);
    assert.ok(pending.body.data.some((review: { id: string }) => review.id === reusableReviewId));

    await request(app)
      .patch(`/api/admin/reviews/${reusableReviewId}`)
      .set("Authorization", authorization)
      .send({ status: "approved" })
      .expect(200);

    const published = await request(app)
      .get("/api/reviews?teacherId=nigar-huseynli")
      .expect(200);
    const review = published.body.data.find((item: { id: string }) => item.id === reusableReviewId);
    assert.ok(review);
    assert.equal(review.userId, undefined);
    assert.equal(review.text, undefined);
    assert.equal(review.author, "Təsdiqlənmiş tələbə");
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
        shortName:"RBAC Klub",
        tagline:"Tələbə ideyalarını birlikdə işlək layihəyə çevir.",
        description:"Texnologiya və məhsul ideyaları üzərində çalışan açıq tələbə klubudur.",
        about:["Klub müxtəlif ixtisaslardan tələbələri real kampus problemləri ətrafında birləşdirir."],
        tone:"lime",visualMark:"RK",meeting:{cadence:"Həftəlik",day:"Çərşənbə",time:"18:00",place:"İnnovasiya zalı"},
        focusTags:["Texnologiya","Komanda işi"],
        status:"Aktiv",
      })
      .expect(201);
    const clubId = createdClub.body.data.id as string;
    const publicClub=await request(app).get(`/api/clubs/${clubSlug}`).expect(200);
    assert.equal(publicClub.body.data.tagline,"Tələbə ideyalarını birlikdə işlək layihəyə çevir.");
    assert.equal(publicClub.body.data.memberCount,0);
    assert.deepEqual(publicClub.body.data.focusTags,["Texnologiya","Komanda işi"]);
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

  it("müəllim qeydiyyatından sonra eyni hesabla mentorluq müraciəti yaradır", async () => {
    const suffix = Date.now();
    const adminAuthorization = `Bearer ${reusableAdminToken}`;

    const teacherSignup = await request(app).post("/api/auth/signup").set("X-Forwarded-For", "203.0.113.61").send({
      name: "Səma Həsənli", email: `teacher.${suffix}@example.az`, password: "EduRate2026",
      university: "Qarabağ Universiteti", accountType: "teacher", program: "Riyaziyyat",
    }).expect(201);
    assert.equal(teacherSignup.body.data.requiresApproval, true);
    assert.equal(teacherSignup.body.data.token, undefined);
    assert.equal(teacherSignup.body.data.user.role, "teacher");
    assert.equal(teacherSignup.body.data.user.status, "Gözləmədə");

    const repeatedTeacherSignup = await request(app).post("/api/auth/signup").set("X-Forwarded-For", "203.0.113.66").send({
      name: "Səma Həsənli", email: `teacher.${suffix}@example.az`, password: "EduRate2026",
      university: "Qarabağ Universiteti", accountType: "teacher", program: "Riyaziyyat",
    }).expect(409);
    assert.equal(repeatedTeacherSignup.body.error.code, "TEACHER_APPROVAL_PENDING");

    await request(app).post("/api/auth/login").set("X-Forwarded-For", "203.0.113.62")
      .send({ email: `teacher.${suffix}@example.az`, password: "EduRate2026" }).expect(403);
    await request(app).patch(`/api/admin/users/${teacherSignup.body.data.user.id}`)
      .set("Authorization", adminAuthorization).send({ status: "Aktiv" }).expect(200);
    const teacherLogin = await request(app).post("/api/auth/login").set("X-Forwarded-For", "203.0.113.63")
      .send({ email: `teacher.${suffix}@example.az`, password: "EduRate2026" }).expect(200);
    const teacherAuthorization = `Bearer ${teacherLogin.body.data.token}`;
    const teacherWorkspace = await request(app).get("/api/workspace")
      .set("Authorization", teacherAuthorization).expect(200);
    assert.equal(teacherWorkspace.body.data.role, "teacher");
    assert.equal(teacherWorkspace.body.data.focus, "Riyaziyyat");

    const teacherCatalog = await request(app).get("/api/teachers").expect(200);
    const teacherProfile = teacherCatalog.body.data.find((item: { userId: string }) => item.userId === teacherSignup.body.data.user.id);
    assert.ok(teacherProfile);

    await request(app).patch("/api/auth/profile").set("Authorization", teacherAuthorization).send({
      name: "Səma Həsənova", university: "Qarabağ Universiteti", faculty: "Müəllim heyəti",
      program: "Riyaziyyat müəllimliyi", year: "Müəllim", about: "Riyazi düşüncəni praktik nümunələrlə inkişaf etdirirəm.",
    }).expect(200);
    const updatedTeacherCatalog = await request(app).get("/api/teachers").expect(200);
    const updatedTeacherProfile = updatedTeacherCatalog.body.data.find((item: { userId: string }) => item.userId === teacherSignup.body.data.user.id);
    assert.equal(updatedTeacherProfile.name, "Səma Həsənova");
    assert.equal(updatedTeacherProfile.specialty, "Riyaziyyat müəllimliyi");

    await request(app).post("/api/auth/signup").set("X-Forwarded-For", "203.0.113.64").send({
      name: "Ayrıca Mentor", email: `mentor.${suffix}@example.az`, password: "EduRate2026",
      university: "Qarabağ Universiteti", accountType: "mentor", program: "Məhsul strategiyası",
    }).expect(422);

    const application = await request(app).post("/api/workspace/mentor-application")
      .set("Authorization", teacherAuthorization).send({
        specialty: "Riyaziyyat mentorluğu",
        biography: "Tələbələrə riyazi düşüncə və akademik inkişaf üzrə dəstək verirəm.",
        availability: "Həftəiçi 18:00-dan sonra",
        meetingMode: "Hibrid",
        languages: ["Azərbaycan dili"],
      }).expect(201);
    assert.equal(application.body.data.status, "pending");
    await request(app).post("/api/workspace/mentor-application")
      .set("Authorization", teacherAuthorization).send({
        specialty: "Riyaziyyat mentorluğu", biography: "Tələbələrə riyazi düşüncə və akademik inkişaf üzrə dəstək verirəm.",
        availability: "Həftəiçi", meetingMode: "Onlayn", languages: ["Azərbaycan dili"],
      }).expect(409);

    const pendingApplications = await request(app).get("/api/admin/mentor-applications?status=pending")
      .set("Authorization", adminAuthorization).expect(200);
    assert.ok(pendingApplications.body.data.some((item: { id: string }) => item.id === application.body.data.id));
    await request(app).patch(`/api/admin/mentor-applications/${application.body.data.id}`)
      .set("Authorization", adminAuthorization).send({ status: "approved" }).expect(200);

    const dualWorkspace = await request(app).get("/api/workspace").set("Authorization", teacherAuthorization).expect(200);
    assert.equal(dualWorkspace.body.data.role, "teacher");
    assert.equal(dualWorkspace.body.data.mentorEnabled, true);

    const studentSignup = await request(app).post("/api/auth/signup").set("X-Forwarded-For", "203.0.113.65").send({
      name: "Mentorluq Test Tələbəsi", email: `mentor.student.${suffix}@example.az`, password: "EduRate2026",
      university: "Qarabağ Universiteti", faculty: "Mühəndislik fakültəsi",
      program: "Kompüter mühəndisliyi", accountType: "student",
    }).expect(201);
    const mentorship = await request(app).post("/api/mentorship/requests")
      .set("Authorization", `Bearer ${studentSignup.body.data.token}`)
      .send({ mentorId: `mentor-${teacherSignup.body.data.user.id}`, note: "Karyera planımı dəqiqləşdirmək istəyirəm." }).expect(201);

    const mentorWorkspace = await request(app).get("/api/workspace").set("Authorization", teacherAuthorization).expect(200);
    assert.ok(mentorWorkspace.body.data.mentorItems.some((item: { id: string }) => item.id === mentorship.body.data.id));
    const accepted = await request(app).patch(`/api/workspace/mentorship/${mentorship.body.data.id}`)
      .set("Authorization", teacherAuthorization).send({ status: "accepted" }).expect(200);
    assert.equal(accepted.body.data.status, "accepted");

    await request(app).patch(`/api/admin/users/${teacherSignup.body.data.user.id}`)
      .set("Authorization", adminAuthorization).send({ status: "Məhdudlaşdırılıb" }).expect(200);
    const restrictedCatalog = await request(app).get("/api/teachers").expect(200);
    assert.equal(restrictedCatalog.body.data.some((item: { userId: string }) => item.userId === teacherSignup.body.data.user.id), false);
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

  it("qaralama tədbiri gizlədir və qismən redaktədə məlumatı qoruyur", async()=>{
    const authorization=`Bearer ${reusableAdminToken}`;
    const created=await request(app).post("/api/admin/events").set("Authorization",authorization).send({name:"Qaralama seminar",category:"Technology",organizer:"EduRate",startAt:"2027-01-12T10:00:00+04:00",capacity:30,place:"Kampus",status:"Qaralama"}).expect(201);
    const id=created.body.data.id as string;
    await request(app).get(`/api/events/${id}`).expect(404);
    const after=await request(app).patch(`/api/admin/events/${id}`).set("Authorization",authorization).send({name:"Yenilənmiş qaralama seminar"}).expect(200);
    assert.equal(after.body.data.description,created.body.data.description);
    const publicEvents=await request(app).get("/api/events").expect(200);
    assert.equal(publicEvents.body.data.some((item:{id:string})=>item.id===id),false);

    const [{createUser},{createAccessToken,hashPassword}]=await Promise.all([import("../src/db/database.js"),import("../src/lib/auth.js")]);
    const attendee=await createUser({name:"Qaralama Testi",email:`draft.${Date.now()}@example.az`,passwordHash:await hashPassword("EduRate2026"),university:"Qarabağ Universiteti",faculty:"Mühəndislik fakültəsi",program:"Kompüter mühəndisliyi"});
    await request(app).post(`/api/events/${id}/registrations`).set("Authorization",`Bearer ${createAccessToken(attendee)}`).expect(409);
  });

  it("tədbirin tutumunu mövcud qeydiyyatdan aşağı salmağa icazə vermir", async()=>{
    const authorization=`Bearer ${reusableAdminToken}`;
    const event=await request(app).post("/api/admin/events").set("Authorization",authorization).send({name:"Tutum sınağı",category:"Technology",organizer:"EduRate",startAt:"2027-02-12T10:00:00+04:00",capacity:2,place:"Kampus",status:"Açıq"}).expect(201);
    const [{createUser},{createAccessToken,hashPassword}]=await Promise.all([import("../src/db/database.js"),import("../src/lib/auth.js")]);
    for(const index of [1,2]){
      const attendee=await createUser({name:`İştirakçı ${index}`,email:`capacity.${index}.${Date.now()}@example.az`,passwordHash:await hashPassword("EduRate2026"),university:"Qarabağ Universiteti",faculty:"Mühəndislik fakültəsi",program:"Kompüter mühəndisliyi"});
      await request(app).post(`/api/events/${event.body.data.id}/registrations`).set("Authorization",`Bearer ${createAccessToken(attendee)}`).expect(201);
    }
    const response=await request(app).patch(`/api/admin/events/${event.body.data.id}`).set("Authorization",authorization).send({capacity:1}).expect(409);
    assert.equal(response.body.error.code,"CAPACITY_BELOW_REGISTRATIONS");
  });

  it("iki real hesab arasında əlaqə, qalıcı mesaj və oxunma axınını tamamlayır",async()=>{
    const [{createUser},{createAccessToken,hashPassword}]=await Promise.all([import("../src/db/database.js"),import("../src/lib/auth.js")]);
    const suffix=Date.now();
    const sender=await createUser({name:"Göndərən Test",email:`sender.${suffix}@example.az`,passwordHash:await hashPassword("EduRate2026"),university:"Qarabağ Universiteti",faculty:"İqtisadiyyat fakültəsi",program:"İqtisadiyyat"});
    const peer=await createUser({name:"Mesaj Testi",email:`message.${suffix}@example.az`,passwordHash:await hashPassword("EduRate2026"),university:"Qarabağ Universiteti",faculty:"İqtisadiyyat fakültəsi",program:"Maliyyə"});
    const studentAuthorization=`Bearer ${createAccessToken(sender)}`;const peerAuthorization=`Bearer ${createAccessToken(peer)}`;
    const connection=await request(app).post("/api/community/connections").set("Authorization",studentAuthorization).send({userId:peer.id}).expect(201);
    await request(app).patch(`/api/community/connections/${connection.body.data.id}`).set("Authorization",peerAuthorization).send({}).expect(200);
    const conversation=await request(app).post("/api/community/conversations").set("Authorization",studentAuthorization).send({peerId:peer.id}).expect(201);
    const id=conversation.body.data.id as string;
    const sent=await request(app).post(`/api/community/conversations/${id}/messages`).set("Authorization",studentAuthorization).send({body:"Salam, layihəni birlikdə yoxlayaq."}).expect(201);
    const history=await request(app).get(`/api/community/conversations/${id}/messages`).set("Authorization",peerAuthorization).expect(200);
    assert.equal(history.body.data[0].id,sent.body.data.id);
    await request(app).patch(`/api/community/conversations/${id}/read`).set("Authorization",peerAuthorization).send({}).expect(200);
  });

  it("elan, lent moderasiyası və dəstək statusunu admin axınında tamamlayır",async()=>{
    const adminAuthorization=`Bearer ${reusableAdminToken}`;
    const signup=await request(app).post("/api/auth/signup").set("X-Forwarded-For","203.0.113.90").send({
      name:"Məzmun Testi",email:`content.${Date.now()}@example.az`,password:"EduRate2026",university:"Qarabağ Universiteti",
      faculty:"Mühəndislik fakültəsi",program:"Kompüter mühəndisliyi",accountType:"student",
    }).expect(201);
    const studentAuthorization=`Bearer ${signup.body.data.token}`;
    const announcement=await request(app).post("/api/admin/announcements").set("Authorization",adminAuthorization).send({
      category:"official",title:"Sprint təqdimatı",summary:"Sprint təqdimatı üçün zal və proqram məlumatları yenilənib.",source:"Tələbə İşləri",sourceInitials:"Tİ",tone:"lime",
      startsAt:"2027-03-10T10:00:00+04:00",expiresAt:"2027-03-10T18:00:00+04:00",priority:true,status:"draft",
    }).expect(201);
    let publicAnnouncements=await request(app).get("/api/network/announcements").expect(200);
    assert.equal(publicAnnouncements.body.data.some((item:{id:string})=>item.id===announcement.body.data.id),false);
    await request(app).patch(`/api/admin/announcements/${announcement.body.data.id}`).set("Authorization",adminAuthorization).send({status:"published"}).expect(200);
    publicAnnouncements=await request(app).get("/api/network/announcements").expect(200);
    assert.equal(publicAnnouncements.body.data.some((item:{id:string})=>item.id===announcement.body.data.id),true);

    const post=await request(app).post("/api/network/feed").set("Authorization",studentAuthorization).send({title:"Layihə komandası",summary:"Yeni tələbə layihəsi üçün iki komanda yoldaşı axtarılır.",tags:["Komanda"]}).expect(202);
    let publicFeed=await request(app).get("/api/network/feed").expect(200);
    assert.equal(publicFeed.body.data.some((item:{id:string})=>item.id===post.body.data.id),false);
    await request(app).patch(`/api/admin/feed/${post.body.data.id}`).set("Authorization",adminAuthorization).send({status:"published"}).expect(200);
    publicFeed=await request(app).get("/api/network/feed").expect(200);
    assert.equal(publicFeed.body.data.some((item:{id:string})=>item.id===post.body.data.id),true);

    const ticket=await request(app).post("/api/support/tickets").set("Authorization",studentAuthorization).set("X-Forwarded-For","203.0.113.91").send({name:"Dəstək Testi",email:"support@example.az",topic:"Profil",message:"Profil məlumatlarımın yenilənməsi üçün köməyə ehtiyacım var."}).expect(201);
    const tickets=await request(app).get("/api/admin/support-tickets").set("Authorization",adminAuthorization).expect(200);
    const stored=tickets.body.data.find((item:{reference:string})=>item.reference===ticket.body.data.reference);
    assert.ok(stored);
    await request(app).patch(`/api/admin/support-tickets/${stored.id}`).set("Authorization",adminAuthorization).send({status:"resolved"}).expect(200);
    const mine=await request(app).get("/api/support/tickets/me").set("Authorization",studentAuthorization).expect(200);
    assert.equal(mine.body.data.find((item:{id:string})=>item.id===stored.id).status,"resolved");
  });
});
