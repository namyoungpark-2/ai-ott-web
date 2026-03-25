export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/** ngrok 무료 플랜 브라우저 경고 스킵용 헤더 */
export const BACKEND_HEADERS: Record<string, string> = {
  "ngrok-skip-browser-warning": "true",
};
