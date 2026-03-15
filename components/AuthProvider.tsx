"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type AuthUser = {
  id: string;
  username: string;
  role: "ADMIN" | "USER";
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  /** 초기 localStorage 복원 중 true */
  loading: boolean;
  login: (username: string, password: string) => Promise<{ error?: string }>;
  signup: (username: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  login: async () => ({}),
  signup: async () => ({}),
  logout: () => {},
});

const STORAGE_KEY = "ott_auth_user";
const TOKEN_KEY = "ott_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 페이지 로드 시 localStorage에서 복원
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored) as AuthUser);
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) setToken(storedToken);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleAuthResponse(
    endpoint: string,
    username: string,
    password: string
  ): Promise<{ error?: string }> {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        accessToken?: string;
        id?: string;
        username?: string;
        role?: string;
        message?: string;
      };

      if (!res.ok) {
        return { error: data.message ?? "요청에 실패했습니다." };
      }

      const authUser: AuthUser = {
        id: data.id ?? username,
        username: data.username ?? username,
        role: data.role === "ADMIN" ? "ADMIN" : "USER",
      };
      const authToken = data.accessToken ?? null;
      setUser(authUser);
      setToken(authToken);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      if (authToken) localStorage.setItem(TOKEN_KEY, authToken);
      return {};
    } catch {
      return { error: "서버에 연결할 수 없습니다." };
    }
  }

  const login = useCallback(
    (username: string, password: string) =>
      handleAuthResponse("/api/auth/login", username, password),
    []
  );

  const signup = useCallback(
    (username: string, password: string) =>
      handleAuthResponse("/api/auth/signup", username, password),
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
