declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: "student" | "admin";
      };
    }
  }
}

export {};
