import { randomUUID } from "node:crypto";
import { databasePool } from "./database.js";

export type ProfessionalKind = "teacher" | "mentor";
export type ProfessionalProfile = {
  id: string; userId: string | null; kind: ProfessionalKind; slug: string; name: string;
  headline: string; specialty: string; biography: string; city: string; experienceYears: number;
  availability: string; meetingMode: string; languages: string[]; expertise: string[];
  status: "pending" | "approved" | "rejected"; visible: boolean;
};

const seedProfiles: Omit<ProfessionalProfile, "id" | "userId">[] = [
  { kind:"teacher", slug:"leyla-memmedova", name:"Leyla Məmmədova", headline:"Riyaziyyat müəllimi", specialty:"Riyaziyyat", biography:"Mürəkkəb mövzuları gündəlik nümunələrlə sadələşdirir.", city:"Bakı", experienceYears:11, availability:"Bu gün · 18:30-dan sonra", meetingMode:"Hibrid", languages:["Azərbaycan dili"], expertise:["Cəbr","Analiz"], status:"approved", visible:true },
  { kind:"teacher", slug:"nigar-huseynli", name:"Nigar Hüseynli", headline:"İngilis dili müəllimi", specialty:"İngilis dili", biography:"Danışıq və akademik yazı bacarıqlarını praktik yanaşma ilə inkişaf etdirir.", city:"Xankəndi", experienceYears:8, availability:"Həftəiçi", meetingMode:"Onlayn", languages:["Azərbaycan dili","İngilis dili"], expertise:["Speaking","Writing"], status:"approved", visible:true },
  { kind:"teacher", slug:"tural-kerimov", name:"Tural Kərimov", headline:"Fizika müəllimi", specialty:"Fizika", biography:"Fiziki qanunları təcrübə və vizual nümunələrlə izah edir.", city:"Bakı", experienceYears:10, availability:"Çərşənbə axşamı", meetingMode:"Əyani", languages:["Azərbaycan dili"], expertise:["Mexanika","Elektrik"], status:"approved", visible:true },
  { kind:"teacher", slug:"murad-eliyev", name:"Murad Əliyev", headline:"Proqramlaşdırma müəllimi", specialty:"Proqramlaşdırma", biography:"Alqoritmləri praktik layihələr üzərindən öyrədir.", city:"Xankəndi", experienceYears:9, availability:"Həftəiçi", meetingMode:"Hibrid", languages:["Azərbaycan dili"], expertise:["Alqoritmlər","Backend"], status:"approved", visible:true },
  { kind:"teacher", slug:"aysel-rehimova", name:"Aysel Rəhimova", headline:"Tarix müəllimi", specialty:"Tarix", biography:"Tarixi hadisələri mənbə və səbəb-nəticə əlaqələri ilə izah edir.", city:"Şuşa", experienceYears:12, availability:"Cümə", meetingMode:"Əyani", languages:["Azərbaycan dili"], expertise:["Azərbaycan tarixi"], status:"approved", visible:true },
  { kind:"teacher", slug:"emin-seferli", name:"Emin Səfərli", headline:"İqtisadiyyat müəllimi", specialty:"İqtisadiyyat", biography:"İqtisadi anlayışları real bazar nümunələri ilə əlaqələndirir.", city:"Bakı", experienceYears:8, availability:"Şənbə", meetingMode:"Onlayn", languages:["Azərbaycan dili","İngilis dili"], expertise:["Mikroiqtisadiyyat"], status:"approved", visible:true },
  { kind:"mentor", slug:"aygun-rzayeva", name:"Aygün Rzayeva", headline:"Məhsul strategiyası mentoru", specialty:"Məhsul strategiyası", biography:"İdeyanı aydın məhsul hekayəsinə və yol xəritəsinə çevirir.", city:"Bakı", experienceYears:9, availability:"4 saat ərzində cavab verir", meetingMode:"Hibrid", languages:["Azərbaycan dili","İngilis dili"], expertise:["Strategiya","Araşdırma"], status:"approved", visible:true },
  { kind:"mentor", slug:"murad-selimli", name:"Murad Səlimli", headline:"Yaradıcı texnologiyalar mentoru", specialty:"Yaradıcı texnologiyalar", biography:"Texnologiya ilə yaradıcı ideyaları işlək prototipə çevirir.", city:"Xankəndi", experienceYears:7, availability:"Bir gün ərzində cavab verir", meetingMode:"Əyani", languages:["Azərbaycan dili"], expertise:["Prototipləmə","Frontend"], status:"approved", visible:true },
  { kind:"mentor", slug:"pervin-necefova", name:"Pərvin Nəcəfova", headline:"Süni intellekt mentoru", specialty:"Məsuliyyətli süni intellekt", biography:"Məsuliyyətli AI layihələri üçün araşdırma və məhsul qərarlarını dəqiqləşdirir.", city:"Bakı", experienceYears:8, availability:"8 saat ərzində cavab verir", meetingMode:"Onlayn", languages:["Azərbaycan dili","İngilis dili"], expertise:["AI","Data"], status:"approved", visible:true },
  { kind:"mentor", slug:"kenan-memmedov", name:"Kənan Məmmədov", headline:"Sistem dizaynı mentoru", specialty:"Sistem dizaynı", biography:"Mürəkkəb texniki sistemləri aydın hissələrə bölməyə kömək edir.", city:"Bakı", experienceYears:10, availability:"6 saat ərzində cavab verir", meetingMode:"Hibrid", languages:["Azərbaycan dili"], expertise:["Arxitektura","Backend"], status:"approved", visible:true },
  { kind:"mentor", slug:"yegane-tahirova", name:"Yeganə Tahirova", headline:"Xidmət dizaynı mentoru", specialty:"Xidmət dizaynı", biography:"İstifadəçi ehtiyaclarını xidmət axınına çevirir.", city:"Xankəndi", experienceYears:7, availability:"Bir gün ərzində cavab verir", meetingMode:"Əyani", languages:["Azərbaycan dili"], expertise:["UX","Araşdırma"], status:"approved", visible:true },
  { kind:"mentor", slug:"sevinc-melikova", name:"Sevinc Məlikova", headline:"Karyera mentoru", specialty:"Yaradıcı karyera", biography:"Portfel, müsahibə və karyera istiqamətini planlaşdırmağa dəstək verir.", city:"Bakı", experienceYears:9, availability:"Bir gün ərzində cavab verir", meetingMode:"Onlayn", languages:["Azərbaycan dili","İngilis dili"], expertise:["Karyera","Portfel"], status:"approved", visible:true },
];

const memory = new Map<string, ProfessionalProfile>(
  seedProfiles.map((profile) => [profile.slug, { ...profile, id: randomUUID(), userId: null }]),
);

export function activateMemoryMentorProfile(input: {
  userId: string; name: string; specialty: string; biography: string;
  availability: string; meetingMode: string; languages: string[];
}) {
  if (databasePool) return;
  const slug = `mentor-${input.userId}`;
  memory.set(slug, {
    id: randomUUID(), userId: input.userId, kind: "mentor", slug, name: input.name,
    headline: `${input.specialty} mentoru`, specialty: input.specialty, biography: input.biography,
    city: "Xankəndi", experienceYears: 0, availability: input.availability,
    meetingMode: input.meetingMode, languages: input.languages, expertise: [input.specialty],
    status: "approved", visible: true,
  });
}

export async function seedProfessionalProfiles() {
  if (!databasePool) return;
  for (const profile of seedProfiles) {
    await databasePool.query(`INSERT INTO professional_profiles
      (id,kind,slug,display_name,headline,specialty,biography,city,experience_years,availability,meeting_mode,languages,expertise,status,visible)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT (slug) DO NOTHING`,
      [randomUUID(),profile.kind,profile.slug,profile.name,profile.headline,profile.specialty,profile.biography,profile.city,profile.experienceYears,profile.availability,profile.meetingMode,profile.languages,profile.expertise,profile.status,profile.visible]);
  }
  await databasePool.query(`UPDATE teacher_reviews r SET teacher_profile_id=p.id FROM professional_profiles p
    WHERE r.teacher_profile_id IS NULL AND r.teacher_id=p.slug`);
  await databasePool.query(`UPDATE mentorship_requests r SET mentor_profile_id=p.id FROM professional_profiles p
    WHERE r.mentor_profile_id IS NULL AND r.mentor_id=p.slug`);
}

function map(row: Record<string, unknown>): ProfessionalProfile {
  return { id:String(row.id), userId:row.user_id ? String(row.user_id) : null, kind:row.kind as ProfessionalKind,
    slug:String(row.slug), name:String(row.display_name), headline:String(row.headline), specialty:String(row.specialty),
    biography:String(row.biography), city:String(row.city), experienceYears:Number(row.experience_years),
    availability:String(row.availability), meetingMode:String(row.meeting_mode), languages:Array.isArray(row.languages)?row.languages.map(String):[],
    expertise:Array.isArray(row.expertise)?row.expertise.map(String):[], status:row.status as ProfessionalProfile["status"], visible:Boolean(row.visible) };
}

export async function listProfessionalProfiles(kind?: ProfessionalKind, includeHidden=false) {
  if (!databasePool) return [...memory.values()].filter((p) => (!kind || p.kind===kind) && (includeHidden || (p.status==="approved" && p.visible)));
  const values: unknown[]=[]; const clauses:string[]=[];
  if (kind) { values.push(kind); clauses.push(`kind=$${values.length}`); }
  if (!includeHidden) clauses.push("status='approved' AND visible=TRUE");
  const result=await databasePool.query(`SELECT * FROM professional_profiles ${clauses.length?`WHERE ${clauses.join(" AND ")}`:""} ORDER BY display_name`,values);
  return result.rows.map(map);
}

export async function findProfessionalProfile(idOrSlug:string, kind?:ProfessionalKind) {
  if (!databasePool) return [...memory.values()].find((p)=>(p.id===idOrSlug||p.slug===idOrSlug)&&(!kind||p.kind===kind))??null;
  const result=await databasePool.query(`SELECT * FROM professional_profiles WHERE (id::text=$1 OR slug=$1) ${kind?"AND kind=$2":""} LIMIT 1`,kind?[idOrSlug,kind]:[idOrSlug]);
  return result.rows[0]?map(result.rows[0]):null;
}

export async function findProfessionalByUser(userId:string, kind:ProfessionalKind) {
  if (!databasePool) return [...memory.values()].find((p)=>p.userId===userId&&p.kind===kind)??null;
  const result=await databasePool.query("SELECT * FROM professional_profiles WHERE user_id=$1 AND kind=$2 LIMIT 1",[userId,kind]);
  return result.rows[0]?map(result.rows[0]):null;
}

export async function ensureProfessionalProfileForUser(user:{id:string;name:string;role:string;program:string;city:string}) {
  if (user.role!=="teacher"&&user.role!=="mentor") return null;
  const existing=await findProfessionalByUser(user.id,user.role); if (existing) return existing;
  if (!databasePool) return null;
  const slug=`${user.role}-${user.id}`;
  const result=await databasePool.query(`INSERT INTO professional_profiles
    (id,user_id,kind,slug,display_name,headline,specialty,biography,city,status,visible)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'approved',TRUE) RETURNING *`,
    [randomUUID(),user.id,user.role,slug,user.name,user.role==="teacher"?"Müəllim":"Mentor",user.program,"",user.city]);
  return map(result.rows[0]);
}
