export const ACADEMIC_UNIVERSITY = "Qarabağ Universiteti" as const;

export const ACADEMIC_CATALOG = [
  {
    faculty: "Pedaqoji fakültə",
    programs: [
      "Riyaziyyat müəllimliyi",
      "İbtidai sinif müəllimliyi",
      "Xarici dil müəllimliyi (ingilis dili)",
      "Azərbaycan dili və ədəbiyyatı müəllimliyi",
      "Coğrafiya müəllimliyi",
      "Biologiya müəllimliyi",
      "Kimya müəllimliyi",
      "Tarix müəllimliyi",
    ],
  },
  {
    faculty: "İqtisadiyyat fakültəsi",
    programs: [
      "Beynəlxalq ticarət və logistika",
      "İqtisadiyyat",
      "Maliyyə",
      "Menecment",
      "Mühasibat",
      "Dövlət və bələdiyyə idarəetməsi",
    ],
  },
  {
    faculty: "Mühəndislik fakültəsi",
    programs: [
      "Elektrik və elektronika mühəndisliyi",
      "İnşaat mühəndisliyi",
      "Kompüter mühəndisliyi",
      "Logistika və nəqliyyat texnologiyaları mühəndisliyi",
      "Mexatronika və robototexnika mühəndisliyi",
      "Data analitikası",
    ],
  },
  {
    faculty: "Humanitar və sosial elmlər fakültəsi",
    programs: ["Beynəlxalq münasibətlər", "Hüquqşünaslıq", "Tarix", "Psixologiya"],
  },
  {
    faculty: "İncəsənət fakültəsi",
    programs: [
      "Musiqi müəllimliyi (müxtəlif alətlər üzrə)",
      "Dekorativ-tətbiqi sənət (bədii toxuculuq, keramika)",
      "Dizayn (interyer, qrafik, geyim dizaynı)",
      "İnstrumental ifaçılıq",
      "Vokal sənəti",
      "Bəstəkarlıq",
      "Musiqişünaslıq",
    ],
  },
  {
    faculty: "Turizm fakültəsi",
    programs: ["Turizm işinin təşkili"],
  },
  {
    faculty: "Tibb və Sağlamlıq Elmləri fakültəsi",
    programs: ["Tibb", "Tibb bacısı (qardaşı) işi"],
  },
] as const;

export type AcademicFaculty = (typeof ACADEMIC_CATALOG)[number]["faculty"];
export type AcademicProgram = (typeof ACADEMIC_CATALOG)[number]["programs"][number];

export function isAcademicFaculty(faculty: string): faculty is AcademicFaculty {
  const normalizedFaculty = faculty.trim();
  return ACADEMIC_CATALOG.some((item) => item.faculty === normalizedFaculty);
}

export function isValidAcademicSelection(faculty: string, program: string): boolean {
  const normalizedFaculty = faculty.trim();
  const normalizedProgram = program.trim();
  const entry = ACADEMIC_CATALOG.find((item) => item.faculty === normalizedFaculty);

  return entry ? (entry.programs as readonly string[]).includes(normalizedProgram) : false;
}
