# CLAUDE.md

## 프로젝트 개요

이 저장소는 **AI OTT 웹 프론트엔드**다. 기술 스택은 **Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 4**이며, 백엔드(Spring Boot 4 / Java 24 / PostgreSQL)와 연동해 OTT 서비스 웹앱 및 일부 운영 기능을 제공한다.

이 파일의 목적은 Claude Code가 이 프로젝트에서 일관된 방식으로 작업하도록 만드는 것이다. 이 문서를 읽은 뒤에는 다음 원칙을 반드시 따른다.

- 이 프로젝트는 더 이상 단순 POC가 아니다. 목표는 **상용 운영 가능한 OTT 웹앱**이다.
- 프론트 작업을 할 때는 항상 **사용자 앱**, **어드민 운영 플로우**, **백엔드 API 계약**, **배포/환경 설정**을 함께 고려한다.
- 이미 존재하는 API 프록시 패턴과 App Router 구조를 우선 존중한다.
- 임시 해법보다 **확장 가능한 구조**를 택한다.
- 바뀌는 API가 있으면 프론트 코드만 고치지 말고, 어떤 백엔드 변경이 필요한지도 함께 명시한다.

---

## 현재 저장소의 실제 구조

핵심 디렉터리:

- `app/`
  - 사용자 페이지와 API 프록시, 스트리밍/썸네일 라우트가 함께 있다.
- `app/api/`
  - 백엔드 Spring API를 프록시하는 Next Route Handler 모음.
- `app/page.tsx`
  - 홈 페이지.
- `app/search/page.tsx`
  - 검색 페이지.
- `app/categories/[slug]/page.tsx`
  - 카테고리 상세 페이지.
- `app/contents/[id]/page.tsx`
  - 콘텐츠 상세 페이지.
- `app/watch/[id]/page.tsx`
  - 재생 페이지.
- `app/my-list/page.tsx`
  - 개인화 목록 페이지.
- `app/admin/page.tsx`
  - 간이 운영 화면.
- `app/api/home/route.ts`
  - 홈 섹션 프록시.
- `app/api/categories/route.ts`
  - 카테고리 목록 프록시.
- `app/api/categories/[slug]/route.ts`
  - 카테고리 상세 프록시.
- `app/api/catalog/browse/route.ts`
  - 카탈로그 브라우징 프록시.
- `app/api/catalog/search/route.ts`
  - 검색 프록시.
- `app/api/contents/[id]/route.ts`
  - 콘텐츠 상세 프록시.
- `app/api/me/*`
  - watchlist / continue-watching / playback-progress 프록시.
- `app/hls/[...path]/route.ts`
  - HLS 프록시/전달.
- `app/thumbnails/[file]/route.ts`, `app/thumb/[file]/route.ts`
  - 썸네일 관련 라우트.
- `app/upload/*`
  - 업로드 기능.
- `app/constants.ts`
  - 웹앱 공통 상수.
- `app/lib/url.ts`
  - URL 유틸리티.
- `docs/ARCHITECTURE.md`
- `docs/CONFIGURATION.md`
- `docs/DEPLOYMENT.md`
- `Dockerfile`
- `.env.example`

현재 package 정보:

- `next`: `16.1.6`
- `react`: `19.2.3`
- `typescript`: `^5`
- `hls.js`: `^1.6.15`

실행 스크립트:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

---

## 백엔드 연동 맥락

이 웹앱은 독립 제품이 아니라 **Spring Boot 백엔드와 강하게 결합된 BFF 스타일 프런트**다.

연동 대상 백엔드의 중요한 특성:

- Java 24
- Spring Boot 4.0.2
- PostgreSQL + Flyway
- 헥사고날 아키텍처 지향
- 앱/어드민/API가 분리돼 있음
- 주요 마이그레이션:
  - `V1__init_core_catalog.sql`
  - `V2__video_asset_transcoding.sql`
  - `V3__watch_event_analytics.sql`
  - `V4__transcoding_job_indexes.sql`
  - `V5__content_status.sql`
  - `V6__catalog_taxonomy_and_discovery.sql`
  - `V7__home_personalization_and_curation.sql`

주요 백엔드 API 범주:

- 앱 API
  - `/api/app/home`
  - `/api/app/categories`
  - `/api/app/categories/{slug}`
  - `/api/app/catalog/browse`
  - `/api/app/catalog/search`
  - `/api/app/contents/{id}`
  - `/api/app/feed`
  - `/api/app/me/watchlist`
  - `/api/app/me/continue-watching`
  - `/api/app/me/playback-progress/{contentId}`
  - `/api/app/playback/*`
- 어드민 API
  - `/api/admin/categories`
  - `/api/admin/contents/*`
  - `/api/admin/curation/sections`
  - `/api/admin/curation/sections/{sectionId}/items`
  - `/api/admin/video-assets/*`

프론트엔드에서 새로운 기능을 만들 때는 가능한 한 **직접 백엔드 URL을 클라이언트에서 때리지 말고** `app/api/*` 프록시를 먼저 만들고, UI는 그 프록시를 호출하는 방식으로 구현한다.

---

## 제품 목표

이 저장소의 목표는 아래 사용자 경험을 완성하는 것이다.

### 사용자 앱 목표
- 홈에서 섹션형 OTT 브라우징 제공
- 카테고리 / 장르 / 태그 기반 탐색
- 검색 및 자동완성(점진 도입)
- 콘텐츠 상세
- 재생
- 찜 / 이어보기 / 시청 위치 저장
- 향후 프로필, 추천, 자막, 화질 선택 확장 가능 구조 유지

### 운영 목표
- 콘텐츠 관리
- 카테고리/태그/메타데이터 관리
- 홈 큐레이션 관리
- 배너/섹션 편성
- 공개/비공개 제어
- 운영 시 장애 추적 가능한 구조

### 엔지니어링 목표
- 얇은 페이지 파일 + 명확한 데이터 경계
- 서버/클라이언트 컴포넌트 책임 분리
- 재사용 가능한 UI와 fetch 로직 정리
- App Router, Route Handler, 환경 변수, Docker 구성이 일관적일 것

---

## 작업 우선순위

Claude Code는 다음 우선순위를 따른다.

1. **동작 보존**
   - 기존 홈/재생/업로드 흐름을 망가뜨리지 않는다.
2. **정보 구조 정리**
   - 페이지가 커지면 기능별로 분리한다.
3. **API 계약 안정화**
   - UI만 바꾸지 말고 프록시/DTO/에러 핸들링을 같이 정리한다.
4. **운영형 품질 개선**
   - 로딩/에러/empty state/환경 설정/타입 안전성 개선.
5. **확장성 확보**
   - 추천, 프로필, 인증, RBAC, 검색 고도화가 들어갈 여지를 남긴다.

---

## 절대 지켜야 할 규칙

### 1. App Router 규칙
- 새 페이지는 `app/` 아래에 둔다.
- 프록시/서버 핸들러는 `app/api/` 아래에 둔다.
- 스트리밍/파일 프록시는 기존 라우트 스타일을 유지한다.
- 페이지에서 백엔드 원격 URL을 직접 호출하기보다 **내부 API route**를 우선 사용한다.

### 2. 서버/클라이언트 컴포넌트 규칙
- 기본은 **서버 컴포넌트 우선**.
- 브라우저 이벤트, video state, local interaction이 필요한 경우만 `"use client"` 사용.
- 페이지 전체를 무조건 클라이언트 컴포넌트로 만들지 않는다.
- 클라이언트 컴포넌트는 되도록 프리젠테이션/상호작용에만 사용한다.

### 3. 데이터 패칭 규칙
- 동일한 API를 여러 페이지에서 쓰면 공통 fetch 유틸 또는 최소한 공통 함수로 추출한다.
- 백엔드 응답 shape가 고정되지 않았다면 방어적으로 파싱한다.
- 네트워크 실패, 4xx, 5xx, 빈 응답을 각각 구분해서 처리한다.
- 데이터가 없을 때 빈 화면이 아니라 **명시적 empty state**를 보여준다.

### 4. 타입 규칙
- `any` 사용을 피한다.
- 응답 타입, UI 모델 타입을 명시한다.
- 백엔드 snake_case / camelCase 불일치가 있으면 adapter 함수로 정리한다.

### 5. 스타일 규칙
- Tailwind를 유지한다.
- 전역 스타일은 `app/globals.css`에 최소한으로 둔다.
- 반복되는 카드/섹션/배지 UI는 컴포넌트화한다.
- OTT UI 특성상 카드, 섹션, hero, metadata row, CTA의 시각적 일관성을 유지한다.

### 6. 에러 처리 규칙
- 프록시 route에서 백엔드 오류를 그대로 삼키지 말고 status와 message를 보존한다.
- 사용자 페이지는 친절한 메시지와 재시도 경로를 제공한다.
- 개발 중에는 원인 파악이 가능하도록 로그를 남기되, 민감 정보는 노출하지 않는다.

### 7. 환경 변수 규칙
- 환경 변수 추가 시 `.env.example`도 반드시 갱신한다.
- 클라이언트에서 필요한 변수만 `NEXT_PUBLIC_` 접두사를 붙인다.
- 서버 전용 값은 `NEXT_PUBLIC_`로 노출하지 않는다.

### 8. 호환성 규칙
- 이 프로젝트는 Next 16 / React 19 기준이다. 예전 Next 패턴을 섞지 않는다.
- 구형 Pages Router 패턴으로 회귀하지 않는다.
- 새 라이브러리 도입은 신중하게 하고, 내장 기능으로 해결 가능한지 먼저 본다.

---

## 이 저장소에서 Claude가 이해해야 하는 도메인 모델

웹에서 직접 모든 도메인을 구현하지 않더라도, 화면 설계와 API 계약을 위해 아래 개념을 이해해야 한다.

### Content
- 영화 또는 시리즈/에피소드 계열의 핵심 엔터티
- 주요 속성:
  - `id`
  - `slug`
  - `title`
  - `originalTitle`
  - `description` / `synopsis`
  - `posterUrl`
  - `bannerUrl`
  - `thumbnailUrl`
  - `ageRating`
  - `runtime`
  - `releaseDate`
  - `featured`
  - `status`
  - `categories`
  - `tags`

### Category
- 홈/탐색/큐레이션의 기본 축
- slug 기반 라우팅을 우선한다.

### Home Section
- 홈 화면 레일/섹션 단위
- 예: Featured, Trending, Recently Added, Category Picks

### Personalization
- watchlist
- continue watching
- playback progress

### Playback
- 콘텐츠 재생 URL 또는 세션
- HLS 기반 재생 흐름
- 향후 DRM / entitlement / quality / subtitles 확장 가능성 고려

### Admin Curation
- 운영자가 홈 섹션, 정렬, 노출 순서를 제어하는 기능

---

## 현재까지 반영된 기능과 아직 부족한 부분

### 이미 있는 기능
- 홈
- 검색
- 카테고리 상세
- 콘텐츠 상세
- 재생
- 내 목록
- watch progress 저장
- 홈/카테고리/검색/상세 관련 API 프록시
- 간이 어드민 페이지
- HLS/썸네일/업로드 라우트

### 아직 약한 부분
- 공통 UI 컴포넌트 분리 부족
- fetch 계층 정리 부족
- 에러/로딩 상태 통일 부족
- 접근성 개선 필요
- 인증/권한 UX 미완성
- 자동완성/추천/프로필 기능 미완성
- 어드민 UX가 페이지 하나에 몰려 있어 확장성 낮음
- 테스트 체계 부족
- 관측성/추적 도구 미연결

Claude는 새 작업 시 위 갭을 줄이는 방향으로 수정해야 한다.

---

## 권장 폴더 개선 방향

대규모 변경 시 아래 구조를 우선 고려한다.

```txt
app/
  (routes...)
components/
  ui/
  catalog/
  playback/
  search/
  personalization/
  admin/
lib/
  api/
  mappers/
  formatters/
  guards/
  constants/
types/
```

단, 지금 저장소에 이런 구조가 아직 완전히 없다고 해서 무조건 대규모 리팩터링부터 시작하지는 않는다. **작업 범위 안에서 점진적으로 이동**한다.

---

## API 프록시 작성 규칙

새 API를 추가할 때는 다음 패턴을 따른다.

1. `app/api/.../route.ts` 생성
2. 백엔드 base URL은 환경 변수에서 읽는다.
3. method, params, body, headers를 명확히 전달한다.
4. 실패 응답은 가능한 한 status를 보존한다.
5. 응답 타입을 예상하고 최소한의 validation/normalization을 수행한다.
6. 클라이언트/페이지에서는 이 내부 route만 사용한다.

예시 원칙:
- GET 조회: query param을 그대로 넘기되, 허용 목록이 있으면 정리한다.
- PUT/POST: body validation을 추가한다.
- 인증 쿠키/헤더가 필요하면 프록시에서 forward 전략을 통일한다.

---

## 페이지별 작업 원칙

### 홈 (`app/page.tsx`)
목표:
- OTT 메인 랜딩 역할
- Hero + section rails + 빠른 탐색 동선

원칙:
- section 데이터가 없더라도 페이지 전체가 죽지 않게 한다.
- Featured 섹션과 일반 섹션 UI를 분리 가능하게 설계한다.
- 섹션 순서와 제목은 백엔드 큐레이션을 우선 존중한다.

### 검색 (`app/search/page.tsx`)
목표:
- 검색어 입력, 결과 리스트, 빈 결과 처리

원칙:
- 디바운스 또는 제출 기반 방식을 명확히 정한다.
- 향후 suggestion/trending search가 들어갈 자리를 남긴다.
- query string 기반으로 화면 상태를 복원 가능하게 한다.

### 카테고리 (`app/categories/[slug]/page.tsx`)
목표:
- 특정 카테고리의 콘텐츠 목록을 안정적으로 보여준다.

원칙:
- 잘못된 slug 처리 필요
- 향후 정렬/필터/페이지네이션 확장 가능하도록 설계

### 콘텐츠 상세 (`app/contents/[id]/page.tsx`)
목표:
- 상세 메타데이터 + CTA(재생, 찜) + 관련 콘텐츠

원칙:
- 메타 정보가 일부 비어도 페이지가 최대한 유지되게 한다.
- 향후 시즌/에피소드, 출연진, 추천, 리뷰 등이 추가될 수 있게 여백을 둔다.

### 재생 (`app/watch/[id]/page.tsx`)
목표:
- 안정적인 HLS 재생 + progress 저장

원칙:
- 브라우저 호환성과 autoplay 정책 고려
- progress 저장은 지나치게 자주 호출하지 않는다.
- 에러 발생 시 재시도 또는 안내 메시지 제공

### 내 목록 (`app/my-list/page.tsx`)
목표:
- watchlist / continue watching의 사용자 허브

원칙:
- 로그인/개인화 미연동 상태를 고려한 fallback 제공
- 리스트 수정 동작은 낙관적 UI 여부를 명확히 정한다.

### 어드민 (`app/admin/page.tsx`)
목표:
- 임시 운영 화면이 아니라, 장기적으로 운영 도구로 발전 가능한 기반 마련

원칙:
- 기능이 커지면 페이지 단일 파일 유지 금지
- 섹션 관리, 콘텐츠 관리, 카테고리 관리 영역을 분리
- 모든 mutation은 에러/성공 피드백 제공

---

## 성능 원칙

- 큰 목록은 필요 시 pagination / incremental loading 고려
- 이미지와 썸네일은 lazy loading 우선
- 서버 컴포넌트로 가능한 부분은 서버에서 렌더링
- 중복 fetch 최소화
- 영상 재생 페이지는 메인 UI 외의 무거운 로직을 지연 로딩 고려
- 클라이언트 번들 증가를 유발하는 라이브러리 추가를 경계한다

---

## 접근성 원칙

- 버튼은 실제 버튼 요소 사용
- 링크는 실제 링크 요소 사용
- 이미지 alt 제공
- 키보드 포커스 스타일 유지
- 폼 input에는 label 또는 접근 가능한 이름 제공
- 모달/드롭다운 추가 시 focus trap 고려

---

## 보안 원칙

- 민감한 토큰/비밀값을 클라이언트에 노출하지 않는다.
- 업로드 관련 기능은 파일 타입/크기 검증을 가정하고 UI도 제한을 보여준다.
- 관리자 기능은 프론트에서 숨기는 것만으로 보호됐다고 가정하지 않는다. 백엔드 권한 체크가 필요하다.
- 사용자 입력은 라우트 핸들러에서 검증하고 그대로 백엔드에 위임하지 않는다.

---

## 테스트/검증 원칙

작업 후 기본적으로 아래를 확인한다.

### 프론트 기본 검증
- `npm run lint`
- `npm run build`

### 수동 확인 우선순위
- 홈 진입
- 검색
- 카테고리 진입
- 콘텐츠 상세 진입
- 재생 진입
- watchlist 추가/삭제
- continue watching 표시
- 어드민 화면 주요 mutation

### 변경 시 꼭 확인할 것
- env 값 누락 여부
- API 프록시 status 전달 정상 여부
- 브라우저에서 HLS route 동작 여부
- 서버 컴포넌트/클라이언트 컴포넌트 경계 오류 여부

---

## 작업 방식 규칙

Claude Code는 다음 방식으로 일한다.

1. 먼저 관련 파일을 모두 읽고 현재 구현 방식을 파악한다.
2. 작은 수정이라도 **영향받는 라우트, 페이지, 프록시, 타입**을 함께 본다.
3. 단순 UI 수정이 아니라면 백엔드 계약 영향 여부를 먼저 체크한다.
4. 수정 범위가 크면 먼저 계획을 짧게 정리한다.
5. 구현 후 무엇을 바꿨는지, 무엇이 아직 남았는지 명확히 적는다.

금지:
- 맥락 확인 없이 대규모 파일 이동
- 기존 라우트를 무시하고 새 패턴을 섞기
- 백엔드 shape를 추측해서 화면만 맞추기
- 로컬에서만 통하는 하드코딩
- 불필요한 거대 라이브러리 도입

---

## Claude가 선호해야 하는 구현 스타일

좋은 예:
- 작은 공통 함수 추출
- 타입 추가
- UI 반복 제거
- 빈 상태/에러 상태 보강
- route handler에서 응답 정리
- 환경 변수/README/문서 동시 갱신

나쁜 예:
- 한 파일에 페이지 + fetch + 타입 + 거대한 JSX 몰아넣기
- `any` 남발
- try/catch 없이 fetch 남발
- `use client`를 무분별하게 페이지 상단에 붙이기
- 백엔드 API 경로를 여러 파일에 하드코딩

---

## 향후 구현 로드맵 기준 우선순위

Claude는 아래 순서로 가치가 큰 작업을 선호한다.

### 높은 우선순위
1. 공통 API/fetch 계층 정리
2. 홈/상세/카테고리 UI 컴포넌트 분리
3. 어드민 화면 분리 및 폼 안정화
4. 로딩/에러/empty state 공통화
5. watchlist / continue watching UX 개선
6. 인증 상태 처리 구조 도입

### 중간 우선순위
1. 검색 suggestion/trending 준비
2. 추천 섹션 UI 확장
3. 프로필/세션 UX
4. 디자인 시스템 기초 컴포넌트
5. SEO/metadata 정리

### 낮지만 중요함
1. 테스트 체계 도입
2. 관측성 훅 연동
3. 접근성 고도화
4. 국제화 구조 준비

---

## 백엔드와 함께 수정해야 하는 경우의 규칙

다음 상황이면 프론트만 고치지 말고 백엔드 변경 필요성을 반드시 언급한다.

- 검색 결과에 필요한 필드가 누락돼 있음
- 카테고리/큐레이션 데이터 shape가 불안정함
- watchlist / continue watching 식별자 규칙이 불명확함
- 재생 URL/세션에 권한 정책이 필요함
- 어드민 mutation 결과에 필요한 audit 정보가 없음
- pagination / sorting / filtering 계약이 부족함

응답 형식 예시:
- 프론트 변경 내용
- 필요한 백엔드 변경 내용
- 임시 대응인지 영구 해법인지

---

## 커밋/변경 단위 가이드

가능하면 변경은 아래 단위로 나눈다.

- feat(web): 사용자 기능 추가
- feat(admin): 운영 기능 추가
- refactor(api): 프록시/데이터 계층 정리
- refactor(ui): 공통 컴포넌트 분리
- fix(playback): 재생 관련 버그 수정
- fix(search): 검색 UX/API 정합성 수정
- chore(env): 환경 변수/배포 설정 변경
- docs: 문서 갱신

---

## 이 프로젝트에서 바로 유용한 실행 명령

```bash
npm install
npm run dev
npm run lint
npm run build
```

Docker:

```bash
docker build -t ai-ott-web .
docker run --rm -p 3000:3000 --env-file .env.local ai-ott-web
```

백엔드 기본 연동 주소 예시:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Claude에게 기대하는 최종 산출물 형태

작업을 마친 뒤에는 항상 아래 형식으로 정리한다.

1. 무엇을 바꿨는지
2. 왜 바꿨는지
3. 어떤 파일이 바뀌었는지
4. 백엔드 영향이 있는지
5. 사용자가 바로 확인할 수 있는 테스트 방법
6. 아직 남은 리스크

---

## 특히 중요: 지금 프로젝트에서 Claude가 기억해야 할 현실적 판단

- 이 저장소는 겉보기보다 **백엔드 계약 의존성**이 크다.
- 프론트만 예쁘게 바꾸는 것은 충분하지 않다.
- 홈/카테고리/상세/재생/내 목록 흐름을 **실제 OTT 제품 경험**으로 완성하는 것이 핵심이다.
- 어드민은 데모 화면이 아니라 운영 관점에서 계속 확장될 것을 전제로 해야 한다.
- 지금 당장의 최선은 “무조건 큰 리팩터링”이 아니라, **기능별로 공통화하면서 점진적으로 구조를 좋게 만드는 것**이다.

---

## 권장 첫 작업 목록

Claude Code가 이 저장소를 처음 열었을 때 가장 먼저 검토할 항목:

1. `app/page.tsx`
2. `app/search/page.tsx`
3. `app/categories/[slug]/page.tsx`
4. `app/contents/[id]/page.tsx`
5. `app/watch/[id]/page.tsx`
6. `app/my-list/page.tsx`
7. `app/admin/page.tsx`
8. `app/api/home/route.ts`
9. `app/api/catalog/search/route.ts`
10. `app/api/categories/[slug]/route.ts`
11. `app/api/me/watchlist/route.ts`
12. `app/api/me/continue-watching/route.ts`
13. `app/api/me/playback-progress/[contentId]/route.ts`
14. `app/lib/url.ts`
15. `.env.example`
16. `docs/ARCHITECTURE.md`
17. `docs/CONFIGURATION.md`
18. `docs/DEPLOYMENT.md`

---

## 최종 한 줄 지시

이 프로젝트에서 작업할 때 Claude는 항상 **“운영 가능한 OTT 웹앱을 만든다”**는 관점으로 판단하고, **현재 구조를 존중하면서도 장기적으로 유지보수 가능한 방향으로 점진 개선**하라.
