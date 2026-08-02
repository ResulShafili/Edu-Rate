import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  academicProgramsByFaculty,
  canonicalUniversity,
  faculties,
  getProgramsForFaculty,
  isFacultyName,
  isValidFacultyProgram,
} from "../app/data/academic-programs.ts";
import {
  ACADEMIC_CATALOG,
  isValidAcademicSelection,
} from "../backend/src/data/academic-catalog.ts";

describe("academic catalog", () => {
  it("rəsmi yeddi fakültəni unikal və boş olmayan ixtisaslarla saxlayır", () => {
    assert.equal(canonicalUniversity, "Qarabağ Universiteti");
    assert.equal(faculties.length, 7);
    assert.equal(new Set(faculties).size, 7);

    for (const faculty of faculties) {
      const programs = getProgramsForFaculty(faculty);
      assert.ok(programs.length > 0, `${faculty} üçün ən az bir ixtisas olmalıdır`);
      assert.equal(new Set(programs).size, programs.length, `${faculty} daxilində dublikat ixtisas var`);
      assert.ok(programs.every((program) => program.trim().length > 0));
    }
  });

  it("frontend və backend kataloqlarının tam eyni qalmasını təmin edir", () => {
    const backendCatalog = Object.fromEntries(
      ACADEMIC_CATALOG.map(({ faculty, programs }) => [faculty, [...programs]]),
    );
    const frontendCatalog = Object.fromEntries(
      Object.entries(academicProgramsByFaculty).map(([faculty, programs]) => [faculty, [...programs]]),
    );

    assert.deepEqual(frontendCatalog, backendCatalog);
  });

  it("ixtisasları yalnız seçilmiş fakültəyə görə qaytarır", () => {
    assert.deepEqual(getProgramsForFaculty("Mövcud olmayan fakültə"), []);
    assert.equal(isFacultyName("Mühəndislik fakültəsi"), true);
    assert.equal(isFacultyName("Mövcud olmayan fakültə"), false);
    assert.equal(isValidFacultyProgram("Mühəndislik fakültəsi", "Kompüter mühəndisliyi"), true);
    assert.equal(isValidFacultyProgram("Mühəndislik fakültəsi", "Psixologiya"), false);
    assert.equal(isValidAcademicSelection("Mühəndislik fakültəsi", "Psixologiya"), false);
  });

  it("Bəstəkarlıq və Musiqişünaslığı ayrıca seçim kimi saxlayır", () => {
    const programs = getProgramsForFaculty("İncəsənət fakültəsi");
    assert.ok(programs.includes("Bəstəkarlıq"));
    assert.ok(programs.includes("Musiqişünaslıq"));
    assert.equal(programs.includes("Bəstəkarlıq və Musiqişünaslıq"), false);
  });
});
