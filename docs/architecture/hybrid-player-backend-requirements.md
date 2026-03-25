# 하이브리드 플레이어 — 백엔드 요구사항

> 이 문서는 하이브리드 비디오 플레이어를 완전히 지원하기 위해 백엔드(Spring Boot)에서 필요한 변경사항을 정리합니다.
> 프론트엔드는 현재 클라이언트 사이드 감지(`<video>.videoWidth/videoHeight`)로 동작하므로, 아래 항목들은 **점진적 개선**입니다. 하지만 적용 시 UX가 크게 향상됩니다.

---

## 1. 콘텐츠 API에 비디오 메타데이터 추가

### 대상 API
- `GET /api/app/contents/{id}` (콘텐츠 상세)
- `GET /api/app/catalog/browse` (카탈로그 브라우즈)
- `GET /api/app/catalog/search` (검색)

### 추가 필드

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `videoWidth` | `Integer` | N | 원본 비디오 가로 해상도 (px) |
| `videoHeight` | `Integer` | N | 원본 비디오 세로 해상도 (px) |
| `orientation` | `String` | N | `LANDSCAPE` / `PORTRAIT` / `SQUARE` |
| `aspectRatio` | `String` | N | `"16:9"`, `"9:16"`, `"1:1"` 등 |
| `durationMs` | `Long` | N | 비디오 길이 (밀리초) |

### 예시 응답

```json
{
  "id": "abc-123",
  "title": "AI 풍경 영상",
  "status": "READY",
  "streamUrl": "/stream/abc-123/master.m3u8",
  "thumbnailUrl": "/thumb/abc-123.jpg",
  "videoWidth": 1920,
  "videoHeight": 1080,
  "orientation": "LANDSCAPE",
  "aspectRatio": "16:9",
  "durationMs": 45000
}
```

### Why
- 프론트엔드가 `loadedmetadata` 이벤트를 기다리지 않고 **즉시** 올바른 레이아웃을 렌더링할 수 있음
- 카탈로그 목록에서 세로형/가로형 콘텐츠에 맞는 카드 비율을 적용할 수 있음
- 레이아웃 시프트(CLS) 제거 → Core Web Vitals 개선

### 구현 가이드
- 트랜스코딩 파이프라인에서 `ffprobe` 또는 유사 도구로 원본 해상도를 추출하여 DB에 저장
- `orientation`은 `videoWidth`/`videoHeight`에서 파생 가능하므로, DB 컬럼 대신 계산 필드(virtual column / DTO 계산)로 처리 가능
- 기존 콘텐츠는 마이그레이션 배치로 `ffprobe` 재실행하여 메타데이터 보강

---

## 2. 카탈로그 API 방향 필터 지원

### 대상 API
- `GET /api/app/catalog/browse`
- `GET /api/app/catalog/search`

### 추가 쿼리 파라미터

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `orientation` | `String` | `LANDSCAPE`, `PORTRAIT`, `SQUARE`, `ALL` (기본값: `ALL`) |

### Why
- "세로형 영상만 보기" 같은 필터 기능을 프론트에서 구현할 수 있음
- 모바일 앱에서 세로형 콘텐츠를 TikTok 스타일 피드로 제공할 때 필요

---

## 3. 썸네일 비율 지원

### 현재 상태
- 썸네일은 단일 비율(추정: 16:9)로 생성됨

### 요구 변경
- 트랜스코딩 시 원본 비율에 맞는 썸네일 생성
  - 가로형 → 16:9 썸네일
  - 세로형 → 9:16 썸네일 (또는 원본 비율 유지)
- `posterUrl` / `thumbnailUrl`이 원본 비율을 반영해야 함

### Why
- 프론트엔드 ContentCard에서 세로형 콘텐츠에 16:9 썸네일을 사용하면 크롭이 심해짐
- 올바른 비율의 썸네일이 있어야 카드 레이아웃이 자연스러움

---

## 4. 이어보기 API에 메타데이터 추가

### 대상 API
- `GET /api/app/me/continue-watching`

### 추가 필드

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `orientation` | `String` | `LANDSCAPE` / `PORTRAIT` / `SQUARE` |
| `videoWidth` | `Integer` | 비디오 가로 해상도 |
| `videoHeight` | `Integer` | 비디오 세로 해상도 |

### Why
- 이어보기 레일에서 세로형 콘텐츠 카드를 구분하여 표시할 수 있음

---

## 5. DB 스키마 변경 (제안)

### contents 테이블

```sql
ALTER TABLE contents ADD COLUMN video_width  INTEGER     NULL;
ALTER TABLE contents ADD COLUMN video_height INTEGER     NULL;
ALTER TABLE contents ADD COLUMN duration_ms  BIGINT      NULL;
-- orientation은 video_width/video_height에서 파생 가능하므로 저장하지 않아도 됨
-- 필요하면 generated column 사용:
-- ALTER TABLE contents ADD COLUMN orientation VARCHAR(10)
--   GENERATED ALWAYS AS (
--     CASE
--       WHEN video_width IS NULL OR video_height IS NULL THEN NULL
--       WHEN video_width::float / video_height >= 1.2 THEN 'LANDSCAPE'
--       WHEN video_width::float / video_height <= 0.8 THEN 'PORTRAIT'
--       ELSE 'SQUARE'
--     END
--   ) STORED;
```

### 데이터 마이그레이션
- 기존 READY 상태 콘텐츠에 대해 `ffprobe` 배치 실행
- PROCESSING/FAILED 콘텐츠는 재트랜스코딩 시 자동 반영

---

## 6. 우선순위 및 일정 제안

| 우선순위 | 항목 | 영향도 | 난이도 |
|---------|------|--------|--------|
| **P0** | 콘텐츠 API에 videoWidth/videoHeight 추가 | 높음 (레이아웃 시프트 제거) | 낮음 |
| **P0** | DB 스키마 변경 + ffprobe 파이프라인 | 높음 | 중간 |
| **P1** | 이어보기 API에 orientation 추가 | 중간 | 낮음 |
| **P1** | 비율별 썸네일 생성 | 중간 | 중간 |
| **P2** | 카탈로그 방향 필터 | 낮음 | 낮음 |

---

## 7. 프론트엔드 연동 지점

프론트엔드 코드는 이미 백엔드 메타데이터를 수용할 준비가 되어 있습니다:

- `hooks/useContentPolling.ts` → `data.videoWidth`, `data.videoHeight` 파싱 (L67-68)
- `hooks/useVideoOrientation.ts` → `initialWidth`/`initialHeight` 옵션으로 즉시 방향 결정
- `types/video.ts` → `resolveOrientation(width, height)` 함수로 방향 계산

백엔드에서 필드를 추가하면 프론트엔드 변경 없이 자동으로 개선됩니다.
