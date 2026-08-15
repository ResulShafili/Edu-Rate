declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: "student" | "mentor" | "teacher" | "assistant_admin" | "admin";
        sessionId?: string;
      };
    }
  }
}

export {};
