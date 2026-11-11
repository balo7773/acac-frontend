"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, ApiError } from "./api";

export type Role = "candidate" | "judge" | "admin";

export type SessionUser = {
  role: Role;
  user_id: number;
  display_name: string | null;
  /** Present only when role === "judge". Fetched from judges table. */
  judge_type?: "internal" | "external";
  /** Present only when role === "judge". e.g. "mask_owl" */
  mask_avatar?: string;
  must_change_password?: boolean;
};

export type RegisterPayload = {
  full_name: string;
  matric_number: string;
  whatsapp_number: string;
  linkedin_url: string;
  password: string;
};

export type RegisterResponse = {
  user_id: number;
  role: "candidate";
  submission_id: number;
  participant_number: number;
};

/**
 * Where a signed-in user should land.
 * Part 3: admin → /admin. Candidate (/portal) and judge (/judge) land in Parts 4 & 5.
 */
export function portalPathFor(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "judge") return "/judge";
  return "/portal";
}

export function roleLabel(role: Role): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  login: (identifier: string, password: string, role: Role) => Promise<SessionUser>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Single source of auth state for the whole app. Without a shared provider, every
 * component calling useAuth() would fire its own /api/auth/me and the header
 * wouldn't update when the login page signs in.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await apiFetch<{
        user_id: number;
        role: Role;
        display_name?: string;
        judge_type?: "internal" | "external";
        mask_avatar?: string;
        must_change_password?: boolean;
      }>(
        "/api/auth/me"
      );
      setUser((prev) => ({
        role: me.role,
        user_id: me.user_id,
        display_name:
          me.display_name ??
          (prev && prev.user_id === me.user_id && prev.role === me.role ? prev.display_name : null),
        judge_type: me.judge_type,
        mask_avatar: me.mask_avatar,
        must_change_password: me.must_change_password,
      }));
    } catch (e) {
      // 401 = no session; anything else (network) is treated as logged out for now.
      void (e instanceof ApiError);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (identifier: string, password: string, role: Role) => {
    const me = await apiFetch<SessionUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password, role }),
    });
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await apiFetch<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    // Cookie is set; we already know who this is, so skip the /me round-trip.
    setUser({
      role: "candidate",
      user_id: res.user_id,
      display_name: `Candidate #${res.participant_number}`,
    });
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
