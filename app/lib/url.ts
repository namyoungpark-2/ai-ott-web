export function withApiBase(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
  return `${base}${path}`;
}


export function getThumbnailUrl(url: string | null | undefined, base: string): string | null {
  if (!url) return null;
  // /thumbnails/로 시작하면 그대로 사용 (rewrites가 처리하거나 API 라우트 사용)
  // rewrites가 브라우저 요청에서 작동하지 않을 수 있으므로, API 라우트를 사용하도록 변환
  if (url.startsWith("/thumbnails/")) {
    // 파일명만 추출하여 API 라우트 경로로 변환
    const fileName = url.replace("/thumbnails/", "");
    return `/thumbnails/${fileName}`;
  }
  // /thumb/로 시작하면 그대로 사용
  if (url.startsWith("/thumb/")) return url;
  // /로 시작하는 상대 경로면 그대로 사용
  if (url.startsWith("/")) return url;
  // 그 외에는 base 추가
  return `${base}${url}`;
}