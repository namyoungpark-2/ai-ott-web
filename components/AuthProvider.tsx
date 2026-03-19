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
  subscriptionTier: "FREE" | "BASIC" | "PREMIUM";
};

type AuthState = {
  user: AuthUser | null;
  /** 초기 쿠키 복원 중 true */
  loading: boolean;
  login: (username: string, password: string) => Promise<{ error?: string }>;
  signup: (username: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => ({}),
  signup: async () => ({}),
  logout: () => {},
});

/** document.cookie에서 특정 키 값을 파싱 */
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 페이지 로드 시 auth_user 쿠키에서 복원 (JWT는 httpOnly라 JS에서 접근 불가)
  useEffect(() => {
    try {
      const raw = readCookie("auth_user");
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        setUser(parsed);
      }
    } catch {
      // 쿠키 파싱 실패 시 무시
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
        credentials: "include", // 쿠키 자동 포함
        body: JSON.stringify({ username, password }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        id?: string;
        username?: string;
        role?: string;
        subscriptionTier?: string;
        message?: string;
      };

      if (!res.ok) {
        return { error: data.message ?? "요청에 실패했습니다." };
      }

      // 서버가 auth_user 쿠키를 Set-Cookie로 설정함
      // 브라우저가 자동으로 저장하지만, 즉시 UI 업데이트를 위해 state에도 저장
      const authUser: AuthUser = {
        id: data.id ?? username,
        username: data.username ?? username,
        role: data.role === "ADMIN" ? "ADMIN" : "USER",
        subscriptionTier: (data.subscriptionTier as AuthUser["subscriptionTier"]) ?? "FREE",
      };
      setUser(authUser);
      return {};
    } catch {
      return { error: "서버에 연결할 수 없습니다." };
    }
  }

  const login = useCallback(
    (username: string, password: string) =>
      handleAuthResponse("/api/auth/login", username, password),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const signup = useCallback(
    (username: string, password: string) =>
      handleAuthResponse("/api/auth/signup", username, password),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    // API 라우트가 쿠키를 제거함
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
