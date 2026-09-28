"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * The portal's session, as the server sees it.
 *
 * The cookie is httpOnly, so nothing here can read it; the hook asks
 * `/api/auth/me` who the browser is and keeps that answer. Signing in and
 * out are round-trips, not flags in storage.
 */

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  /** True while the account still uses the seeded demo password. */
  mustChange: boolean;
}

interface MeResponse {
  user: SessionUser | null;
  /** True when the only account is still on the demo password. */
  demo?: boolean;
}

export type SignInResult = { ok: true; user: SessionUser } | { ok: false; error: string };

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

export function useAdminSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" })
      .then(async (response) => {
        const data = await readJson<MeResponse>(response);
        if (!live) return;
        setUser(data.user ?? null);
        setDemo(Boolean(data.demo));
      })
      .catch(() => {
        if (live) setUser(null);
      })
      .finally(() => {
        if (live) setChecked(true);
      });
    return () => {
      live = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string, remember = true): Promise<SignInResult> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await readJson<{ user?: SessionUser; error?: string }>(response);
      if (!response.ok || !data.user) {
        return { ok: false, error: data.error ?? "Could not sign in." };
      }
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch {
      return { ok: false, error: "The server could not be reached." };
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(
      () => undefined,
    );
    setUser(null);
  }, []);

  const changePassword = useCallback(
    async (current: string, next: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const response = await fetch("/api/auth/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ current, next }),
        });
        const data = await readJson<{ error?: string }>(response);
        if (!response.ok) return { ok: false, error: data.error ?? "Could not change the password." };
        setUser((prev) => (prev ? { ...prev, mustChange: false } : prev));
        setDemo(false);
        return { ok: true };
      } catch {
        return { ok: false, error: "The server could not be reached." };
      }
    },
    [],
  );

  return { user, signedIn: Boolean(user), checked, demo, signIn, signOut, changePassword };
}
