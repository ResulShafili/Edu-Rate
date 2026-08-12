export type Mentor = {
  id: string;
  name: string;
  initials: string;
  role: string;
  focus: string;
  bio: string;
  location: string;
  timezone: string;
  experience: string;
  responseTime: string;
  availability: string[];
  mode: "Onlayn" | "Əyani" | "Hibrid";
  languages: string[];
  expertise: string[];
  outcome: string;
  accent: string;
  glow: string;
};

export type Teacher = {
  id: string;
  name: string;
  initials: string;
  role: string;
  subject: string;
  bio: string;
  city: string;
  experience: string;
  availability: string;
  teachingMode: "Onlayn" | "Əyani" | "Hibrid";
  language: "Azərbaycan dili" | "İngilis dili";
  studentsCount: number;
  rating: number;
  reviewCount: number;
  accent: string;
  glow: string;
};

export type TeacherReview = {
  id: string;
  teacherId: Teacher["id"];
  teacherName: string;
  author: string;
  initials: string;
  rating: number;
  text?: string;
  date: string;
  course: string;
  accent: string;
  featured?: boolean;
  criteria?: {
    clarity: number;
    subjectKnowledge: number;
    objectivity: number;
    communication: number;
  };
};
