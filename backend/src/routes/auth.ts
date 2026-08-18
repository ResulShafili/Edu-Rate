import { randomUUID } from "node:crypto";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
  markEmailVerified,
  updatePassword,
  type UserRecord,
} from "../db/database.js";
import {
  ACADEMIC_UNIVERSITY,
  isAcademicFaculty,
  isValidAcademicSelection,
} from "../data/academic-catalog.js";
import { ApiError } from "../lib/api-error.js";
import {
  createAccessToken,
  hashPassword,
  toPublicUser,
  verifyPassword,
} from "../lib/auth.js";
import { authenticate } from "../middleware/authenticate.js";
import { synchronizeProfessionalProfilesForUser } from "../db/professionals.js";
import { consumeActionToken, createActionToken, listSessions, registerSessionToken, revokeAllSessions, revokeSession } from "../db/auth-security.js";
import { accountActionUrl, EmailDeliveryError, sendAccountEmail } from "../lib/email.js";
import { env } from "../config/env.js";

export const authRouter = Router();

const signupLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Çox sayda qeydiyyat cəhdi edildi." } },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Çox sayda giriş cəhdi edildi." } },
});

const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "Şifrə ən az 8 simvol olmalıdır.")
    .max(72)
    .regex(/[a-zA-ZƏəÖöÜüĞğŞşÇçİı]/, "Şifrədə hərf olmalıdır.")
    .regex(/\d/, "Şifrədə rəqəm olmalıdır."),
  university: z.string().trim().min(2).max(180).default(ACADEMIC_UNIVERSITY),
  accountType: z.enum(["student", "teacher"]).default("student"),
  faculty: z.string().trim().max(180).optional().default(""),
  program: z.string().trim().min(2).max(180),
  legalAccepted: z.boolean().optional().default(false),
});

const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(72),
});
const emailSchema=z.object({email:z.email().transform((value)=>value.toLowerCase())}).strict();
const tokenSchema=z.object({token:z.string().min(32).max(256)}).strict();
const resetSchema=z.object({token:z.string().min(32).max(256),password:z.string().min(8).max(72).regex(/[a-zA-ZƏəÖöÜüĞğŞşÇçİı]/).regex(/\d/)}).strict();

async function issueSession(user:UserRecord,request:{get(name:string):string|undefined;ip?:string}){
  const sessionId=randomUUID();const token=createAccessToken(user,sessionId);
  await registerSessionToken(user.id,token,sessionId,request.get("user-agent")??"",request.ip??"");
  return token;
}

async function sendVerification(user:{id:string;email:string;name:string}){
  const token=await createActionToken(user.id,"verify_email",24*60*60*1000);
  const url=accountActionUrl("/auth/verify",token);
  await sendAccountEmail({to:user.email,subject:"EduRate e-poçt təsdiqi",html:`<p>Salam ${escapeHtml(user.name)},</p><p>EduRate hesabını təsdiqləmək üçün aşağıdakı keçiddən istifadə et.</p><p><a href="${url}">E-poçtu təsdiqlə</a></p><p>Keçid 24 saat qüvvədədir.</p>`});
}

function escapeHtml(value:string){return value.replace(/[&<>"']/g,(character)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character]!));}

const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  university: z.string().trim().min(2).max(180),
  faculty: z.string().trim().min(2).max(180),
  program: z.string().trim().min(2).max(180),
  year: z.string().trim().min(1).max(80),
  about: z.string().trim().max(600),
});

function academicSelectionErrorDetails(
  university: string,
  faculty: string,
): Record<string, string> {
  if (university !== ACADEMIC_UNIVERSITY) {
    return { university: `Universitet yalnız “${ACADEMIC_UNIVERSITY}” ola bilər.` };
  }

  if (!isAcademicFaculty(faculty)) {
    return { faculty: "Fakültəni təqdim olunan rəsmi siyahıdan seçin." };
  }

  return { program: "İxtisası seçilmiş fakültənin siyahısından seçin." };
}

authRouter.post("/signup", signupLimiter, async (request, response) => {
  const input = signupSchema.parse(request.body);
  if (env.NODE_ENV !== "test" && input.legalAccepted !== true) {
    throw new ApiError(422, "LEGAL_CONSENT_REQUIRED", "İstifadə şərtləri və məxfilik siyasəti qəbul edilməlidir.");
  }

  if (input.accountType === "student" && (
    input.university !== ACADEMIC_UNIVERSITY ||
    !isValidAcademicSelection(input.faculty, input.program)
  )) {
    throw new ApiError(
      422,
      "INVALID_ACADEMIC_SELECTION",
      "Universitet, fakültə və ixtisas seçimi rəsmi kataloqa uyğun deyil.",
      academicSelectionErrorDetails(input.university, input.faculty),
    );
  }

  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    if (existingUser.role === "teacher" && existingUser.status === "Gözləmədə") {
      throw new ApiError(409, "TEACHER_APPROVAL_PENDING", "Bu e-poçtla müəllim müraciəti artıq yaradılıb və rəhbərliyin təsdiqini gözləyir.");
    }
    throw new ApiError(409, "EMAIL_EXISTS", "Bu e-poçt artıq istifadə olunur.");
  }

  if (input.accountType !== "student" && input.university !== ACADEMIC_UNIVERSITY) {
    throw new ApiError(422, "INVALID_UNIVERSITY", `Universitet yalnız “${ACADEMIC_UNIVERSITY}” ola bilər.`, {
      university: `Universitet yalnız “${ACADEMIC_UNIVERSITY}” ola bilər.`,
    });
  }

  const isPrivilegedRegistration = input.accountType === "teacher";
  const user = await createUser({
    name: input.name,
    email: input.email,
    university: input.university,
    faculty: input.accountType === "teacher" ? "Müəllim heyəti" : input.faculty,
    program: input.program,
    role: input.accountType,
    status: isPrivilegedRegistration ? "Gözləmədə" : "Aktiv",
    passwordHash: await hashPassword(input.password),
    emailVerifiedAt: env.RESEND_API_KEY ? null : new Date().toISOString(),
    termsVersion: "2026-08-15",
    privacyVersion: "2026-08-15",
  });
  if (user.status !== "Aktiv") {
    if (!user.emailVerifiedAt) await sendVerification(user);
    response.status(201).json({ data: { user: toPublicUser(user), requiresApproval: true, requiresEmailVerification: !user.emailVerifiedAt } });
    return;
  }
  if(!user.emailVerifiedAt){await sendVerification(user);response.status(201).json({data:{user:toPublicUser(user),requiresApproval:false,requiresEmailVerification:true}});return;}
  response.status(201).json({ data: { token: await issueSession(user,request), user: toPublicUser(user), requiresApproval: false, requiresEmailVerification:false } });
});

authRouter.post("/login", loginLimiter, async (request, response) => {
  const input = loginSchema.parse(request.body);
  const user = await findUserByEmail(input.email);

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "E-poçt və ya şifrə düzgün deyil.");
  }
  if (user.status !== "Aktiv") {
    throw new ApiError(403, "ACCOUNT_RESTRICTED", "Hesab aktiv deyil.");
  }
  if(!user.emailVerifiedAt)throw new ApiError(403,"EMAIL_NOT_VERIFIED","Daxil olmadan əvvəl e-poçt ünvanını təsdiqlə.");

  response.json({ data: { token: await issueSession(user,request), user: toPublicUser(user) } });
});

authRouter.get("/session", authenticate, async (request, response) => {
  const user = await findUserById(request.auth!.userId);

  if (!user) {
    throw new ApiError(401, "SESSION_USER_NOT_FOUND", "Sessiya istifadəçisi tapılmadı.");
  }

  response.json({ data: { user: toPublicUser(user) } });
});

authRouter.patch("/profile", authenticate, async (request, response) => {
  const input = profileSchema.parse(request.body);
  const currentUser = await findUserById(request.auth!.userId);

  if (!currentUser) {
    throw new ApiError(404, "USER_NOT_FOUND", "İstifadəçi tapılmadı.");
  }

  const keepsLegacyAcademicSelection =
    currentUser.university === input.university &&
    currentUser.faculty === input.faculty &&
    currentUser.program === input.program;

  if (currentUser.role === "student" &&
    !keepsLegacyAcademicSelection &&
    (input.university !== ACADEMIC_UNIVERSITY ||
      !isValidAcademicSelection(input.faculty, input.program))
  ) {
    throw new ApiError(
      422,
      "INVALID_ACADEMIC_SELECTION",
      "Universitet, fakültə və ixtisas seçimi rəsmi kataloqa uyğun deyil.",
      academicSelectionErrorDetails(input.university, input.faculty),
    );
  }

  if (currentUser.role !== "student" && input.university !== ACADEMIC_UNIVERSITY) {
    throw new ApiError(422, "INVALID_UNIVERSITY", `Universitet yalnız “${ACADEMIC_UNIVERSITY}” ola bilər.`, {
      university: `Universitet yalnız “${ACADEMIC_UNIVERSITY}” ola bilər.`,
    });
  }

  const user = await updateUserProfile(request.auth!.userId, input);

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "İstifadəçi tapılmadı.");
  }

  await synchronizeProfessionalProfilesForUser(user);

  response.json({ data: { user: toPublicUser(user) } });
});

authRouter.post("/logout", authenticate, async (request, response) => {
  if(request.auth?.sessionId)await revokeSession(request.auth.userId,request.auth.sessionId);
  response.status(204).send();
});

authRouter.post("/verify-email/request",signupLimiter,async(request,response)=>{const {email}=emailSchema.parse(request.body);const user=await findUserByEmail(email);if(user&&!user.emailVerifiedAt)await sendVerification(user);response.status(202).json({data:{accepted:true}});});
authRouter.post("/verify-email/confirm",async(request,response)=>{const {token}=tokenSchema.parse(request.body);const userId=await consumeActionToken(token,"verify_email");if(!userId)throw new ApiError(422,"TOKEN_INVALID","Təsdiq keçidi etibarsızdır və ya vaxtı bitib.");const user=await markEmailVerified(userId);if(!user)throw new ApiError(404,"USER_NOT_FOUND","İstifadəçi tapılmadı.");response.json({data:{verified:true}});});
authRouter.post("/password/forgot",loginLimiter,async(request,response)=>{const {email}=emailSchema.parse(request.body);const user=await findUserByEmail(email);if(user){const token=await createActionToken(user.id,"reset_password",30*60*1000);const url=accountActionUrl("/auth/recovery",token);try{await sendAccountEmail({to:user.email,subject:"EduRate şifrə bərpası",html:`<p>Şifrəni yeniləmək üçün <a href="${url}">təhlükəsiz keçidi aç</a>.</p><p>Keçid 30 dəqiqə qüvvədədir.</p>`});}catch(error){if(error instanceof EmailDeliveryError)throw new ApiError(503,"EMAIL_DELIVERY_UNAVAILABLE",error.message);throw error;}}response.status(202).json({data:{accepted:true}});});
authRouter.post("/password/reset",loginLimiter,async(request,response)=>{const {token,password}=resetSchema.parse(request.body);const userId=await consumeActionToken(token,"reset_password");if(!userId)throw new ApiError(422,"TOKEN_INVALID","Şifrə bərpası keçidi etibarsızdır və ya vaxtı bitib.");await updatePassword(userId,await hashPassword(password));await revokeAllSessions(userId);response.json({data:{reset:true}});});
authRouter.get("/sessions",authenticate,async(request,response)=>response.json({data:await listSessions(request.auth!.userId,request.auth!.sessionId)}));
authRouter.delete("/sessions/:id",authenticate,async(request,response)=>{const id=z.string().uuid().parse(request.params.id);if(!await revokeSession(request.auth!.userId,id))throw new ApiError(404,"SESSION_NOT_FOUND","Sessiya tapılmadı.");response.status(204).send();});
authRouter.delete("/sessions",authenticate,async(request,response)=>{await revokeAllSessions(request.auth!.userId,request.auth!.sessionId);response.status(204).send();});
