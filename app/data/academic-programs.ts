export const canonicalUniversity = "Qarabağ Universiteti" as const;

export const academicProgramsByFaculty = {
  "Pedaqoji fakültə": [
    "Riyaziyyat müəllimliyi",
    "İbtidai sinif müəllimliyi",
    "Xarici dil müəllimliyi (ingilis dili)",
    "Azərbaycan dili və ədəbiyyatı müəllimliyi",
    "Coğrafiya müəllimliyi",
    "Biologiya müəllimliyi",
    "Kimya müəllimliyi",
    "Tarix müəllimliyi",
  ],
  "İqtisadiyyat fakültəsi": [
    "Beynəlxalq ticarət və logistika",
    "İqtisadiyyat",
    "Maliyyə",
    "Menecment",
    "Mühasibat",
    "Dövlət və bələdiyyə idarəetməsi",
  ],
  "Mühəndislik fakültəsi": [
    "Elektrik və elektronika mühəndisliyi",
    "İnşaat mühəndisliyi",
    "Kompüter mühəndisliyi",
    "Logistika və nəqliyyat texnologiyaları mühəndisliyi",
    "Mexatronika və robototexnika mühəndisliyi",
    "Data analitikası",
  ],
  "Humanitar və sosial elmlər fakültəsi": [
    "Beynəlxalq münasibətlər",
    "Hüquqşünaslıq",
    "Tarix",
    "Psixologiya",
  ],
  "İncəsənət fakültəsi": [
    "Musiqi müəllimliyi (müxtəlif alətlər üzrə)",
    "Dekorativ-tətbiqi sənət (bədii toxuculuq, keramika)",
    "Dizayn (interyer, qrafik, geyim dizaynı)",
    "İnstrumental ifaçılıq",
    "Vokal sənəti",
    "Bəstəkarlıq",
    "Musiqişünaslıq",
  ],
  "Turizm fakültəsi": [
    "Turizm işinin təşkili",
  ],
  "Tibb və Sağlamlıq Elmləri fakültəsi": [
    "Tibb",
    "Tibb bacısı (qardaşı) işi",
  ],
} as const;

export type FacultyName = keyof typeof academicProgramsByFaculty;

export const faculties = Object.keys(academicProgramsByFaculty) as FacultyName[];

export function isFacultyName(value: string): value is FacultyName {
  return Object.prototype.hasOwnProperty.call(academicProgramsByFaculty, value);
}

export function getProgramsForFaculty(faculty: string): readonly string[] {
  return isFacultyName(faculty) ? academicProgramsByFaculty[faculty] : [];
}

export function isValidFacultyProgram(faculty: string, program: string): boolean {
  return getProgramsForFaculty(faculty).some((candidate) => candidate === program);
}
