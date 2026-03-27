# 백엔드 API 변경사항 및 요구사항

> 이 문서는 프론트엔드에서 필요한 백엔드 API 변경사항을 정리합니다.
> 2026-03-27 기준 최신 API 스펙을 반영합니다.

---

## 1. 공통 변경: Accept-Language 헤더 지원

모든 API에 `Accept-Language` 헤더를 지원합니다.
- 우선순위: `Accept-Language` 헤더 → `lang` 쿼리 파라미터 → `"en"` 기본값
- 기존 `?lang=en` 방식도 하위 호환 유지

프론트엔드에서는 browse/search/feed 프록시 라우트에 `Accept-Language` 헤더를 추가 완료.

---

## 2. Catalog Browse API 변경

### `GET /api/app/catalog/browse`

#### 응답에 추가된 필드

```json
{
  "sections": [...],
  "categories": [
    { "slug": "movies", "label": "영화", "tier": 1, "parentSlug": null },
    { "slug": "television", "label": "TV 프로그램", "tier": 1, "parentSlug": null }
  ],
  "genres": [
    { "slug": "action", "label": "액션" },
    { "slug": "comedy", "label": "코미디" }
  ]
}
```

#### 아이템별 추가 필드

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `genres` | `String[]` | 장르 slug 배열 |
| `videoWidth` | `Integer` | 원본 비디오 가로 해상도 (px) |
| `videoHeight` | `Integer` | 원본 비디오 세로 해상도 (px) |
| `orientation` | `String` | `LANDSCAPE` / `PORTRAIT` / `SQUARE` |
| `durationMs` | `Long` | 비디오 길이 (밀리초) |

**프론트엔드 연동 상태**: `CatalogNavProvider`에서 `categories`, `genres`를 파싱하여 GlobalNav에 동적 표시. `CatalogItem` 타입에 새 필드 추가 완료.

---

## 3. Catalog Search API 변경

### `GET /api/app/catalog/search`

#### 추가 쿼리 파라미터

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `genre` | `String` | 장르 slug로 필터링 (신규) |

#### 아이템에 `genres` 필드 포함

프론트엔드 연동 상태: search 프록시 라우트에 `genre` 파라미터 전달 추가 완료.

---

## 4. Contents Detail API 변경

### `GET /api/app/contents/{contentId}`

#### 추가 필드

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `videoWidth` | `Integer` | 원본 비디오 가로 해상도 |
| `videoHeight` | `Integer` | 원본 비디오 세로 해상도 |
| `orientation` | `String` | `LANDSCAPE` / `PORTRAIT` / `SQUARE` |
| `durationMs` | `Long` | 비디오 길이 (밀리초) |

프론트엔드 연동 상태: `useContentPolling` hook에서 `videoWidth`/`videoHeight` 파싱 완료. 하이브리드 플레이어 방향 감지에 사용.

---

## 5. Continue Watching API 변경

### `GET /api/app/me/continue-watching`

#### 추가 필드

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `videoWidth` | `Integer` | 비디오 가로 해상도 |
| `videoHeight` | `Integer` | 비디오 세로 해상도 |
| `orientation` | `String` | `LANDSCAPE` / `PORTRAIT` / `SQUARE` |

---

## 6. Admin API 변경사항

### `PUT /api/admin/contents/{id}/taxonomy`

#### 요청 body에 `genreSlugs` 추가

```json
{
  "categorySlugs": ["movies"],
  "genreSlugs": ["action", "thriller"],
  "tags": ["blockbuster"],
  "lang": "en"
}
```

### `POST /api/admin/categories` — 필드 추가

```json
{
  "slug": "tv-comedy",
  "label": "TV Comedy",
  "iabCode": "IAB1-1",
  "tier": 2,
  "parentSlug": "television",
  "lang": "en"
}
```

### `GET /api/admin/categories` — 응답에 `iabCode`, `tier`, `parentId` 포함

### `POST /api/admin/genres` (신규)

```json
{
  "slug": "action",
  "label": "Action",
  "description": "Action and adventure",
  "lang": "en"
}
```

### `GET /api/admin/genres` (신규) — 장르 목록

### `POST /api/admin/contents/{id}/transcode` (신규) — contentId 기반 트랜스코딩

### `GET /api/admin/auth/me` — JWT 없이도 기본 admin 정보 반환하도록 수정

---

## 7. Feed / Series / Seasons API

| API | 변경 |
|-----|------|
| `GET /api/app/feed` | `Accept-Language` 헤더 지원 |
| `GET /api/app/series/{id}` | `Accept-Language` 헤더 지원 + i18n fallback 수정 |
| `GET /api/app/seasons/{id}/episodes` | `Accept-Language` 헤더 지원 |

---

## 8. 전체 API Path 목록 (최신)

### Auth (`/auth`)

| Method | Path |
|--------|------|
| POST | `/auth/signup` |
| POST | `/auth/login` |
| POST | `/auth/logout` |
| POST | `/auth/verify-email` |
| POST | `/auth/resend-verification` |
| POST | `/auth/forgot-password` |
| POST | `/auth/reset-password` |
| POST | `/auth/admin/login` |
| POST | `/auth/ops/login` |

### Admin (`/api/admin`)

| Method | Path | 상태 |
|--------|------|------|
| GET | `/api/admin/auth/me` | 수정 |
| POST | `/api/admin/contents` | 기존 |
| GET | `/api/admin/contents` | 수정 (Accept-Language) |
| GET | `/api/admin/contents/{id}` | 수정 (Accept-Language) |
| POST | `/api/admin/contents/{id}/assets` | 기존 |
| POST | `/api/admin/contents/{id}/transcode` | **신규** |
| PATCH | `/api/admin/contents/{id}/status` | 기존 |
| PUT | `/api/admin/contents/{id}/metadata` | 기존 (i18n) |
| PUT | `/api/admin/contents/{id}/taxonomy` | 수정 (genreSlugs) |
| POST | `/api/admin/categories` | 수정 (iabCode, tier, parentSlug, lang) |
| GET | `/api/admin/categories` | 수정 (응답에 iabCode, tier, parentId) |
| POST | `/api/admin/genres` | **신규** |
| GET | `/api/admin/genres` | **신규** |
| GET | `/api/admin/video-assets` | 기존 |
| GET | `/api/admin/video-assets/{id}` | 기존 |
| POST | `/api/admin/video-assets/{id}/transcode` | 기존 |
| POST | `/api/admin/video-assets/{id}/retry` | 기존 |
| POST | `/api/admin/uploads/uploads` | 기존 |
| GET | `/api/admin/failures` | 기존 |
| GET | `/api/admin/users` | 기존 |
| PUT | `/api/admin/users/{id}/subscription` | 기존 |
| DELETE | `/api/admin/users/{id}` | 기존 |

### App (`/api/app`)

| Method | Path | 상태 |
|--------|------|------|
| GET | `/api/app/feed` | 수정 (Accept-Language) |
| GET | `/api/app/catalog/browse` | 수정 (categories, genres, video meta) |
| GET | `/api/app/catalog/search` | 수정 (genre param, genres in items) |
| GET | `/api/app/contents/{id}` | 수정 (video meta) |
| GET | `/api/app/contents/{id}/related` | 기존 |
| GET | `/api/app/series/{id}` | 수정 (Accept-Language, i18n) |
| GET | `/api/app/seasons/{id}/episodes` | 수정 (Accept-Language) |
| GET | `/api/app/playback/{id}/playback` | 기존 |
| GET | `/api/app/me/continue-watching` | 수정 (video meta) |
| GET | `/api/app/me/playback-progress/{id}` | 기존 |
| POST | `/api/app/me/playback-progress/{id}` | 기존 |
| POST | `/api/app/watch-events` | 기존 |
| GET | `/api/app/analytics/contents/{id}/daily` | 기존 |
| GET | `/api/app/analytics/contents/top` | 기존 |
| POST | `/api/app/payments/checkout` | 기존 |
| POST | `/api/app/payments/portal` | 기존 |

### Ops (`/api/ops`)

| Method | Path |
|--------|------|
| GET | `/api/ops/transcoding/summary` |
| GET | `/api/ops/transcoding/failures/top` |
| GET | `/api/ops/transcoding/recent` |

### Webhooks / Health

| Method | Path |
|--------|------|
| POST | `/api/webhooks/stripe` |
| GET | `/`, `/health` |
