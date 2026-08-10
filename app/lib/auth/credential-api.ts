import {
  createApiClient,
} from "../api/client";
import type {
  AuthGateway,
  ProfileUpdateInput,
  RegisterInput,
  RegisterResult,
  SignInInput,
  UserProfile,
} from "../../data/user";

const api = createApiClient({ baseUrl: "/api" });

type SessionPayload = { user: UserProfile };

export const credentialAuthGateway: AuthGateway = {
  async signIn(input: SignInInput) {
    const result = await api.post<SessionPayload, SignInInput>("/auth/login", input);
    return result.user;
  },
  async register(input: RegisterInput) {
    const result = await api.post<{ user: UserProfile | null; requiresApproval: boolean }, RegisterInput>("/auth/signup", input);
    return { ...result, accountType: input.accountType } satisfies RegisterResult;
  },
  async signOut() {
    await api.post<void, Record<string, never>>("/auth/logout", {});
  },
  async updateProfile(_profile: UserProfile, input: ProfileUpdateInput) {
    const result = await api.patch<SessionPayload, ProfileUpdateInput>("/auth/profile", input);
    return result.user;
  },
};

export async function getCredentialSession(): Promise<UserProfile | null> {
  try {
    const result = await api.get<SessionPayload>("/auth/session");
    return result.user;
  } catch {
    return null;
  }
}
