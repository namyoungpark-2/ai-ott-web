# 백엔드 연동 TODO

프론트엔드 P1-1 ~ P1-6 작업 완료 기준 정리. 아래 항목은 백엔드 API 계약이 확정되거나 추가될 때 함께 반영해야 한다.

---

## 1. 홈 (P1-1)

| 항목 | 현재 상태 | 필요한 백엔드 작업 |
|------|-----------|-------------------|
| `/api/app/home` 응답 shape | `sections[]` 배열 가정 | `sectionType` 필드 표준화 (`FEATURED`, `RAIL`, `GRID` 등) |
| Featured 섹션 | 첫 번째 또는 `type=FEATURED` 섹션으로 처리 | `featured: true` 또는 `type: "FEATURED"` 필드 명시 |
| 섹션 내 콘텐츠 `items[]` | `items` 또는 `contents` 둘 다 방어 처리 | 응답 키 `items`로 통일 |
| 썸네일 URL | 상대경로 / 절대경로 혼재 방어 처리 중 | 모든 이미지 URL을 절대 경로(CDN URL)로 반환 |

---

## 2. 검색 (P1-2)

| 항목 | 현재 상태 | 필요한 백엔드 작업 |
|------|-----------|-------------------|
| `/api/app/catalog/search?q=...` | `items` 또는 `contents` 방어 파싱 | 응답 키 `items`로 통일, `total` 필드 추가 권장 |
| 자동완성 / 추천 검색어 | 미구현 | `/api/app/catalog/search/suggestions?q=...` 엔드포인트 추가 |
| 최근 검색어 / 인기 검색어 | 미구현 | `/api/app/catalog/trending-searches` 엔드포인트 추가 |
| 검색 필터 (카테고리, 태그, 타입) | 미구현 | `category`, `tags`, `contentType` 쿼리 파라미터 지원 |
| 페이지네이션 | `page`, `size` 파라미터 전달 중 | `hasNext` 또는 `totalPages` 응답 필드 추가 |

---

## 3. 카테고리 (P1-3)

| 항목 | 현재 상태 | 필요한 백엔드 작업 |
|------|-----------|-------------------|
| `/api/app/categories/{slug}` | `contents` 또는 `items` 방어 파싱 | 응답 키 `items`로 통일 |
| `hasNext` 페이지네이션 | 클라이언트에서 `list.length === PAGE_SIZE`로 추측 | `hasNext: boolean` 또는 `total: number` 응답 필드 추가 |
| 서버 정렬 | 현재 클라이언트 정렬만 구현 | `sort=LATEST\|TITLE\|RUNTIME` 쿼리 파라미터 지원 |
| 카테고리 메타 (label, description) | 프론트에 하드코딩 (`CATEGORY_META`) | `/api/app/categories` 목록에 `label`, `description` 필드 포함 |
| 동적 카테고리 | 현재 4개 슬러그만 지원 | 카테고리 slug가 DB에서 동적으로 관리될 경우 알림 필요 |

---

## 4. 콘텐츠 상세 (P1-4)

| 항목 | 현재 상태 | 필요한 백엔드 작업 |
|------|-----------|-------------------|
| `/api/app/contents/{id}` | `ContentDetail` 타입으로 파싱 | `ageRating`, `originalTitle`, `synopsis`, `releaseDate`, `categories[]`, `tags[]` 모두 포함 |
| 관련 콘텐츠 | placeholder 표시 중 | `/api/app/contents/{id}/related` 엔드포인트 추가 (`items[]` 반환) |
| 시즌 / 에피소드 | 미구현 | 시리즈 콘텐츠의 경우 `/api/app/contents/{id}/episodes` 엔드포인트 고려 |
| 출연진 / 감독 | 미구현 | `ContentDetail`에 `cast[]`, `directors[]` 필드 추가 고려 |
| 찜 상태 초기값 | 현재 항상 `false`로 초기화 | `/api/app/contents/{id}` 응답에 `inWatchlist: boolean` 포함 또는 `/api/app/me/watchlist/{id}` GET 엔드포인트 추가 |

---

## 5. 재생 (P1-5)

| 항목 | 현재 상태 | 필요한 백엔드 작업 |
|------|-----------|-------------------|
| 재생 URL (`streamUrl`) | `/api/app/contents/{id}` 응답에서 가져옴 | `streamUrl` 필드가 항상 HLS manifest URL (`.m3u8`)임을 보장 |
| 콘텐츠 상태 폴링 | `status: PROCESSING\|READY\|FAILED` 폴링 | `estimatedProgress` (0~100) 필드 추가 시 UX 개선 가능 |
| 재생 위치 저장 | `POST /api/app/me/playback-progress/{id}` | `{ positionMs }` body 수신 확인. 응답 `200` 또는 `204` 기대 |
| 재생 이벤트 | `POST /api/watch-events` (프록시 미구현) | `/api/app/watch-events` 엔드포인트 확인, 프론트 프록시 `app/api/watch-events/route.ts` 추가 필요 |
| 권한/DRM | 401/403 → FAILED 상태 표시 처리 완료 | entitlement 체크 엔드포인트 도입 시 알림 필요 |
| 화질 선택 | 미구현 | HLS manifest에 복수 품질 포함 시 player에 옵션 UI 추가 가능 |
| 자막 | 미구현 | HLS manifest에 subtitle track 포함 시 추가 |

---

## 6. 내 목록 (P1-6)

| 항목 | 현재 상태 | 필요한 백엔드 작업 |
|------|-----------|-------------------|
| `/api/app/me/watchlist` GET | `items` 또는 `contents` 방어 파싱 | 응답 키 `items`로 통일, `ContentItem` 전체 필드 반환 |
| 찜 삭제 | `DELETE /api/app/me/watchlist/{contentId}` | 204 또는 200 반환 확인 |
| `/api/app/me/continue-watching` GET | `items` 또는 `contents` 방어 파싱 | `positionMs`, `durationMs`, 콘텐츠 기본 정보 포함 필요 |
| `durationMs` 필드 | `null` 처리 중 | `continue-watching` 응답에 `durationMs` 포함 권장 (진행률 표시용) |
| 이어보기 삭제 / 숨기기 | 미구현 | `DELETE /api/app/me/continue-watching/{contentId}` 추가 고려 |
| 인증 없이 접근 시 | 현재 API 응답 오류를 조용히 처리 | 비로그인 시 401 반환, 프론트 로그인 유도 UX 추가 필요 |

---

## 7. 인증 (전반)

| 항목 | 현재 상태 | 필요한 백엔드 작업 |
|------|-----------|-------------------|
| 로그인 | `POST /api/auth/login` 프록시 구현. `MOCK_AUTH_ENABLED=true` 시 admin/admin 허용 | `{ username, password }` → `{ id, username, role }` 응답 스펙 확정 |
| 로그아웃 | `POST /api/auth/logout` 프록시 구현 | 세션/쿠키 무효화 처리 |
| 세션 유지 | localStorage에 user 저장. 서버 인증 세션과 불일치 가능 | `/api/auth/me` GET 엔드포인트 추가 → 앱 마운트 시 세션 검증 |
| RBAC | `role: "ADMIN"\|"USER"` 타입만 정의 | 백엔드 권한 체계 확정 후 어드민 기능 보호 구현 |
| 토큰 갱신 | 미구현 | JWT 사용 시 refresh token 전략 필요 |

---

## 8. 프록시 Route 미구현 항목

프론트에서 호출하지만 `app/api/` 프록시가 아직 없는 엔드포인트:

| 프록시 경로 | 대상 백엔드 경로 | 우선순위 |
|------------|----------------|---------|
| `app/api/watch-events/route.ts` | `POST /api/app/watch-events` | 높음 |
| `app/api/auth/me/route.ts` | `GET /api/auth/me` | 높음 |
| `app/api/contents/[id]/related/route.ts` | `GET /api/app/contents/{id}/related` | 중간 |
| `app/api/catalog/trending/route.ts` | `GET /api/app/catalog/trending` | 중간 |
| `app/api/catalog/search/suggestions/route.ts` | `GET /api/app/catalog/search/suggestions` | 낮음 |
| `app/api/me/continue-watching/[contentId]/route.ts` | `DELETE /api/app/me/continue-watching/{contentId}` | 낮음 |

---

## 9. 공통 응답 스펙 표준화 요청

현재 프론트에서 여러 키(`items`, `contents`, 배열 직접 반환)를 방어적으로 처리하고 있다.
백엔드 전체에서 **페이지네이션 응답을 아래 형식으로 통일**하면 프론트 코드를 단순화할 수 있다.

```json
{
  "items": [...],
  "page": 0,
  "size": 24,
  "total": 120,
  "hasNext": true
}
```

단일 항목 응답은 그대로 객체 반환.

---

_최종 업데이트: 2026-03-16 (P1-1 ~ P1-6 완료 기준)_
