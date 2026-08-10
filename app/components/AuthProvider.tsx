"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  type AuthGateway,
  type ProfileUpdateInput,
  type RegisterInput,
  type RegisterResult,
  type SignInInput,
  type UserProfile,
} from "../data/user";
import {
  isAdminAccessRole,
  type AdminAccessRole,
} from "../lib/auth/admin-role";
import { credentialAuthGateway, getCredentialSession } from "../lib/auth/credential-api";

type AuthStatus = "idle" | "submitting";

type AuthContextValue = {
  user: UserProfile | null;
  status: AuthStatus;
  credentialAuthAvailable: boolean;
  signOutHref: string | null;
  isAdmin: boolean;
  adminRole: AdminAccessRole | null;
  signIn: (input: SignInInput) => Promise<UserProfile>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  signOut: () => Promise<void>;
  updateProfile: (input: ProfileUpdateInput) => Promise<UserProfile>;
};

type AuthProviderProps = PropsWithChildren<{
  gateway?: AuthGateway;
  initialUser?: UserProfile | null;
  signOutHref?: string | null;
}>;

const AuthContext = createContext<AuthContextValue | null>(null);

export const AUTH_PROVIDER_UNAVAILABLE_CODE = "AUTH_PROVIDER_NOT_CONFIGURED";

export function AuthProvider({
  children,
  gateway,
  initialUser = null,
  signOutHref = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const activeGateway = gateway ?? credentialAuthGateway;
  const credentialAuthAvailable = !signOutHref;
  const adminRole = isAdminAccessRole(user?.accessRole)
    ? user.accessRole
    : null;

  useEffect(() => {
    if (initialUser) return;
    let cancelled = false;

    void getCredentialSession().then((sessionUser) => {
      if (!cancelled && sessionUser) setUser(sessionUser);
    });

    return () => {
      cancelled = true;
    };
  }, [initialUser]);

  const signIn = useCallback(async (input: SignInInput) => {
    setStatus("submitting");
    try {
      const nextUser = await activeGateway.signIn(input);
      setUser(nextUser);
      return nextUser;
    } finally {
      setStatus("idle");
    }
  }, [activeGateway]);

  const register = useCallback(async (input: RegisterInput) => {
    setStatus("submitting");
    try {
      const result = await activeGateway.register(input);
      if (result.user) setUser(result.user);
      return result;
    } finally {
      setStatus("idle");
    }
  }, [activeGateway]);

  const signOut = useCallback(async () => {
    setStatus("submitting");
    try {
      await activeGateway.signOut();
      setUser(null);
    } finally {
      setStatus("idle");
    }
  }, [activeGateway]);

  const updateProfile = useCallback(async (input: ProfileUpdateInput) => {
    if (!user) throw new Error("AUTH_REQUIRED");

    setStatus("submitting");
    try {
      const nextUser = await activeGateway.updateProfile(user, input);
      setUser(nextUser);
      return nextUser;
    } finally {
      setStatus("idle");
    }
  }, [activeGateway, user]);

  const value = useMemo<AuthContextValue>(() => ({
    credentialAuthAvailable,
    signOutHref,
    isAdmin: Boolean(adminRole),
    adminRole,
    user,
    status,
    signIn,
    register,
    signOut,
    updateProfile,
  }), [adminRole, credentialAuthAvailable, register, signIn, signOut, signOutHref, status, updateProfile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth AuthProvider daxilində istifadə olunmalıdır.");
  }
  return context;
}

export function isAuthProviderUnavailable(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message === AUTH_PROVIDER_UNAVAILABLE_CODE
  );
}
