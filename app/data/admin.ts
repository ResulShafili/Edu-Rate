export type AdminCollectionKind = "users" | "clubs" | "events";

export type AdminRecordStatus =
  | "Aktiv"
  | "Gözləmədə"
  | "Məhdudlaşdırılıb"
  | "Açıq"
  | "Qaralama"
  | "Tamamlanıb";

export type AdminUserStatus = Extract<
  AdminRecordStatus,
  "Aktiv" | "Gözləmədə" | "Məhdudlaşdırılıb"
>;

export type AdminClubStatus = Extract<
  AdminRecordStatus,
  "Aktiv" | "Gözləmədə" | "Məhdudlaşdırılıb"
>;

export type AdminEventStatus = Extract<
  AdminRecordStatus,
  "Açıq" | "Qaralama" | "Tamamlanıb"
>;

export type AdminRecordBase<
  TStatus extends AdminRecordStatus = AdminRecordStatus,
> = {
  id: string;
  name: string;
  detail: string;
  status: TStatus;
  metric: string;
  updatedAt: string;
};

export type AdminUserRole = "student" | "mentor" | "teacher" | "assistant_admin" | "admin";

export type AdminUser = AdminRecordBase<AdminUserStatus> & {
  kind: "users";
  email: string;
  initials: string;
  role: AdminUserRole;
  university: string;
  faculty: string;
  connectionCount: number;
  joinedAt: string;
  lastActiveAt: string;
};

export type AdminClub = AdminRecordBase<AdminClubStatus> & {
  kind: "clubs";
  slug: string;
  category: string;
  coordinatorInitials: string;
  shortName?:string;
  tagline?:string;
  description?:string;
  about?:string[];
  tone?:"lime"|"violet"|"cyan"|"coral"|"amber"|"mint";
  visualMark?:string;
  meeting?:{cadence:string;day:string;time:string;place:string};
  focusTags?:string[];
  memberCount: number;
  eventCount: number;
  createdAt: string;
};

export type AdminEvent = AdminRecordBase<AdminEventStatus> & {
  kind: "events";
  category: string;
  organizer: string;
  startAt: string;
  attendeeCount: number;
  capacity: number;
  place: string;
};

export type AdminCollectionRecord = AdminUser | AdminClub | AdminEvent;

export type AdminMetric = {
  id: "users" | "clubs" | "events" | "engagement";
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "steady";
};

export type AdminActivityPoint = {
  label: string;
  users: number;
  clubs: number;
  events: number;
};

export type AdminDistributionPoint = {
  name: string;
  value: number;
  color: string;
};

export type AdminRecentActivity = {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  occurredAt: string;
  tone: "lime" | "blue" | "violet" | "coral";
};

export type AdminOverview = {
  updatedAt: string;
  metrics: readonly AdminMetric[];
  activity: readonly AdminActivityPoint[];
  distribution: readonly AdminDistributionPoint[];
  recentActivity: readonly AdminRecentActivity[];
};

export type AdminPage<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminListQuery = {
  search?: string;
  status?: AdminRecordStatus | "all";
  page?: number;
  pageSize?: number;
};

export type AdminUserQuery = AdminListQuery & {
  role?: AdminUserRole | "all";
};

export type AdminClubQuery = AdminListQuery & {
  category?: string;
};

export type AdminEventQuery = AdminListQuery & {
  category?: string;
  from?: string;
  to?: string;
};

export type AdminUserCreateInput = Pick<
  AdminUser,
  "name" | "email" | "role" | "university" | "faculty"
> & {
  status?: AdminUser["status"];
};

export type AdminUserUpdateInput = Partial<AdminUserCreateInput>;

export type AdminClubCreateInput = Pick<AdminClub,"name"|"slug"|"category"|"coordinatorInitials"> & {
  shortName:string;tagline:string;description:string;about:string[];
  tone:"lime"|"violet"|"cyan"|"coral"|"amber"|"mint";visualMark:string;
  meeting:{cadence:string;day:string;time:string;place:string};focusTags:string[];
  status?: AdminClub["status"];
};

export type AdminClubUpdateInput = Partial<AdminClubCreateInput>;

export type AdminEventCreateInput = Pick<
  AdminEvent,
  "name" | "category" | "organizer" | "startAt" | "capacity" | "place"
> & {
  status?: AdminEvent["status"];
};

export type AdminEventUpdateInput = Partial<AdminEventCreateInput>;

export const adminRoleLabels: Record<AdminUserRole, string> = {
  student: "Tələbə",
  mentor: "Mentor",
  teacher: "Müəllim",
  assistant_admin: "Admin köməkçisi",
  admin: "Əsas administrator",
};

export const adminDemoOverview: AdminOverview = {
  updatedAt: "2026-07-15T10:30:00+04:00",
  metrics: [
    { id: "users", label: "Aktiv istifadəçi", value: "2 418", change: "+12,4%", trend: "up" },
    { id: "clubs", label: "Tələbə klubu", value: "36", change: "+4 yeni", trend: "up" },
    { id: "events", label: "Açıq tədbir", value: "28", change: "+8,1%", trend: "up" },
    { id: "engagement", label: "İştirak göstəricisi", value: "74%", change: "+2,6%", trend: "up" },
  ],
  activity: [
    { label: "Fev", users: 1180, clubs: 18, events: 12 },
    { label: "Mar", users: 1390, clubs: 21, events: 15 },
    { label: "Apr", users: 1575, clubs: 24, events: 17 },
    { label: "May", users: 1840, clubs: 28, events: 21 },
    { label: "İyn", users: 2160, clubs: 33, events: 25 },
    { label: "İyl", users: 2418, clubs: 36, events: 28 },
  ],
  distribution: [
    { name: "Texnologiya", value: 34, color: "#c8ff4d" },
    { name: "Akademik", value: 27, color: "#77b8ff" },
    { name: "Yaradıcılıq", value: 21, color: "#b9a7ff" },
    { name: "Sosial təsir", value: 18, color: "#ff9e7a" },
  ],
  recentActivity: [
    {
      id: "activity-01",
      title: "Yeni klub təsdiqləndi",
      description: "Məhsul və UX icmasının müraciəti aktivləşdirildi.",
      timeLabel: "12 dəqiqə əvvəl",
      occurredAt: "2026-07-15T10:18:00+04:00",
      tone: "lime",
    },
    {
      id: "activity-02",
      title: "Tədbir proqramı yeniləndi",
      description: "Yay açıq səhnəsinin məkan və tutum məlumatları dəyişdirildi.",
      timeLabel: "46 dəqiqə əvvəl",
      occurredAt: "2026-07-15T09:44:00+04:00",
      tone: "blue",
    },
    {
      id: "activity-03",
      title: "Moderasiya qeydi tamamlandı",
      description: "Son müəllim rəyləri icma qaydalarına uyğun yoxlanıldı.",
      timeLabel: "2 saat əvvəl",
      occurredAt: "2026-07-15T08:30:00+04:00",
      tone: "violet",
    },
  ],
};

export const adminDemoUsers: readonly AdminUser[] = [
  {
    kind: "users",
    id: "usr-1001",
    name: "Aylin Rzayeva",
    email: "aylin.rzayeva@example.edu.az",
    initials: "AR",
    role: "student",
    university: "Azərbaycan Texniki Universiteti",
    faculty: "İnformasiya texnologiyaları",
    connectionCount: 18,
    joinedAt: "2026-02-11T09:20:00+04:00",
    lastActiveAt: "2026-07-15T10:12:00+04:00",
    detail: "Tələbə · İnformasiya texnologiyaları",
    status: "Aktiv",
    metric: "18 əlaqə",
    updatedAt: "2026-07-15T10:12:00+04:00",
  },
  {
    kind: "users",
    id: "usr-1002",
    name: "Murad Əliyev",
    email: "murad.aliyev@example.edu.az",
    initials: "MƏ",
    role: "mentor",
    university: "Bakı Dövlət Universiteti",
    faculty: "Tətbiqi riyaziyyat və kibernetika",
    connectionCount: 42,
    joinedAt: "2025-10-04T14:10:00+04:00",
    lastActiveAt: "2026-07-15T09:48:00+04:00",
    detail: "Mentor · Tətbiqi riyaziyyat",
    status: "Aktiv",
    metric: "42 əlaqə",
    updatedAt: "2026-07-15T09:48:00+04:00",
  },
  {
    kind: "users",
    id: "usr-1003",
    name: "Nigar Hüseynli",
    email: "nigar.huseynli@example.edu.az",
    initials: "NH",
    role: "teacher",
    university: "Azərbaycan Dövlət İqtisad Universiteti",
    faculty: "İqtisadiyyat və idarəetmə",
    connectionCount: 31,
    joinedAt: "2025-11-18T11:00:00+04:00",
    lastActiveAt: "2026-07-14T18:16:00+04:00",
    detail: "Müəllim · İqtisadiyyat və idarəetmə",
    status: "Aktiv",
    metric: "31 əlaqə",
    updatedAt: "2026-07-14T18:16:00+04:00",
  },
  {
    kind: "users",
    id: "usr-1004",
    name: "Tural Məmmədli",
    email: "tural.mammadli@example.edu.az",
    initials: "TM",
    role: "student",
    university: "Bakı Mühəndislik Universiteti",
    faculty: "Memarlıq və dizayn",
    connectionCount: 7,
    joinedAt: "2026-07-13T16:35:00+04:00",
    lastActiveAt: "2026-07-14T20:02:00+04:00",
    detail: "Tələbə · Memarlıq və dizayn",
    status: "Gözləmədə",
    metric: "7 əlaqə",
    updatedAt: "2026-07-14T20:02:00+04:00",
  },
  {
    kind: "users",
    id: "usr-1005",
    name: "Zəhra Qasımova",
    email: "zahra.qasimova@example.edu.az",
    initials: "ZQ",
    role: "student",
    university: "ADA Universiteti",
    faculty: "Humanitar və sosial elmlər",
    connectionCount: 24,
    joinedAt: "2026-01-26T10:40:00+04:00",
    lastActiveAt: "2026-07-14T17:30:00+04:00",
    detail: "Tələbə · Humanitar və sosial elmlər",
    status: "Aktiv",
    metric: "24 əlaqə",
    updatedAt: "2026-07-14T17:30:00+04:00",
  },
  {
    kind: "users",
    id: "usr-1006",
    name: "Elvin Kərimli",
    email: "elvin.karimli@example.edu.az",
    initials: "EK",
    role: "student",
    university: "Azərbaycan Texniki Universiteti",
    faculty: "İnformasiya texnologiyaları",
    connectionCount: 3,
    joinedAt: "2026-03-08T08:50:00+04:00",
    lastActiveAt: "2026-07-10T12:15:00+04:00",
    detail: "Tələbə · İnformasiya texnologiyaları",
    status: "Məhdudlaşdırılıb",
    metric: "3 əlaqə",
    updatedAt: "2026-07-10T12:15:00+04:00",
  },
];

export const adminDemoClubs: readonly AdminClub[] = [
  {
    kind: "clubs",
    id: "club-robotics",
    slug: "innovasiya-robototexnika",
    name: "İnnovasiya və Robototexnika",
    category: "Texnologiya",
    coordinatorInitials: "NH",
    memberCount: 84,
    eventCount: 12,
    createdAt: "2018-09-12T12:00:00+04:00",
    detail: "Texnologiya · NH tərəfindən idarə olunur",
    status: "Aktiv",
    metric: "84 üzv",
    updatedAt: "2026-07-15T09:22:00+04:00",
  },
  {
    kind: "clubs",
    id: "club-debate",
    slug: "debat-natiqlik",
    name: "Debat və Natiqlik Cəmiyyəti",
    category: "Akademik",
    coordinatorInitials: "NA",
    memberCount: 67,
    eventCount: 8,
    createdAt: "2015-10-03T12:00:00+04:00",
    detail: "Akademik · NA tərəfindən idarə olunur",
    status: "Aktiv",
    metric: "67 üzv",
    updatedAt: "2026-07-14T18:40:00+04:00",
  },
  {
    kind: "clubs",
    id: "club-green",
    slug: "yasil-kampus",
    name: "Yaşıl Kampus Təşkilatı",
    category: "Sosial təsir",
    coordinatorInitials: "LM",
    memberCount: 103,
    eventCount: 7,
    createdAt: "2017-04-22T12:00:00+04:00",
    detail: "Sosial təsir · LM tərəfindən idarə olunur",
    status: "Aktiv",
    metric: "103 üzv",
    updatedAt: "2026-07-14T16:08:00+04:00",
  },
  {
    kind: "clubs",
    id: "club-visual",
    slug: "vizual-hekaye",
    name: "Fotoqrafiya və Vizual Hekayə",
    category: "Yaradıcılıq",
    coordinatorInitials: "NG",
    memberCount: 58,
    eventCount: 6,
    createdAt: "2019-02-18T12:00:00+04:00",
    detail: "Yaradıcılıq · NG tərəfindən idarə olunur",
    status: "Aktiv",
    metric: "58 üzv",
    updatedAt: "2026-07-13T19:35:00+04:00",
  },
  {
    kind: "clubs",
    id: "club-product",
    slug: "mehsul-ux-icmasi",
    name: "Məhsul və UX icması",
    category: "Texnologiya",
    coordinatorInitials: "SA",
    memberCount: 19,
    eventCount: 1,
    createdAt: "2026-07-15T10:18:00+04:00",
    detail: "Texnologiya · SA tərəfindən idarə olunur",
    status: "Gözləmədə",
    metric: "19 üzv",
    updatedAt: "2026-07-15T10:18:00+04:00",
  },
];

export const adminDemoEvents: readonly AdminEvent[] = [
  {
    kind: "events",
    id: "event-smart-campus",
    name: "Kampus üçün ağıllı həllər",
    category: "Emalatxana",
    organizer: "İnnovasiya və Robototexnika",
    startAt: "2026-07-24T18:00:00+04:00",
    attendeeCount: 54,
    capacity: 70,
    place: "İdeya otağı",
    detail: "24 iyul · 18:00 · İdeya otağı",
    status: "Açıq",
    metric: "54 / 70 yer",
    updatedAt: "2026-07-15T09:06:00+04:00",
  },
  {
    kind: "events",
    id: "event-debate-night",
    name: "Açıq debat gecəsi",
    category: "Açıq görüş",
    organizer: "Debat və Natiqlik Cəmiyyəti",
    startAt: "2026-07-25T18:30:00+04:00",
    attendeeCount: 42,
    capacity: 90,
    place: "Kiçik akt zalı",
    detail: "25 iyul · 18:30 · Kiçik akt zalı",
    status: "Açıq",
    metric: "42 / 90 yer",
    updatedAt: "2026-07-14T19:20:00+04:00",
  },
  {
    kind: "events",
    id: "event-biodiversity",
    name: "Kampus biomüxtəliflik səfəri",
    category: "Səfər",
    organizer: "Yaşıl Kampus Təşkilatı",
    startAt: "2026-07-20T09:30:00+04:00",
    attendeeCount: 28,
    capacity: 30,
    place: "Botanika bağı girişi",
    detail: "20 iyul · 09:30 · Botanika bağı",
    status: "Açıq",
    metric: "28 / 30 yer",
    updatedAt: "2026-07-14T14:45:00+04:00",
  },
  {
    kind: "events",
    id: "event-open-stage",
    name: "Yay açıq səhnəsi",
    category: "Təqdimat",
    organizer: "Səhnə və Musiqi Birliyi",
    startAt: "2026-08-05T19:30:00+04:00",
    attendeeCount: 61,
    capacity: 140,
    place: "Mərkəzi həyət səhnəsi",
    detail: "5 avqust · 19:30 · Mərkəzi həyət",
    status: "Açıq",
    metric: "61 / 140 yer",
    updatedAt: "2026-07-14T12:30:00+04:00",
  },
  {
    kind: "events",
    id: "event-accessible-design",
    name: "Əlçatan tədbir emalatxanası",
    category: "Emalatxana",
    organizer: "Könüllülər Şəbəkəsi",
    startAt: "2026-07-30T17:30:00+04:00",
    attendeeCount: 0,
    capacity: 45,
    place: "Tələbə mərkəzi",
    detail: "30 iyul · 17:30 · Tələbə mərkəzi",
    status: "Qaralama",
    metric: "45 yer",
    updatedAt: "2026-07-13T21:10:00+04:00",
  },
];
