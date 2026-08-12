export function getCurrentAcademicSemester(date = new Date()) {
  const year = date.getFullYear();
  return `${year}-${date.getMonth() < 6 ? "yaz" : "payız"}`;
}
