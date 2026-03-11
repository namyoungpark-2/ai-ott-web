# CLAUDE.md

## 목적
이 저장소는 **운영형 OTT 웹앱**이다. 항상 **기존 동작을 보존하면서**, 사용자 앱·어드민·백엔드 API 계약을 함께 고려해 작업한다.

## 스택
- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- 백엔드: Spring Boot 4 / Java 24 / PostgreSQL

## 핵심 원칙
1. 기본은 **서버 컴포넌트 우선**.
2. 브라우저 상호작용이 필요할 때만 `"use client"` 사용.
3. 클라이언트에서 백엔드 직접 호출보다 **`app/api/*` 프록시 우선**.
4. 임시 해법보다 **확장 가능한 구조** 선택.
5. 기존 홈/재생/업로드 흐름을 깨지 않는다.
6. `any`는 피하고 타입을 명시한다.
7. 로딩/에러/empty state를 항상 고려한다.
8. 환경 변수 추가 시 `.env.example`도 같이 수정한다.

## 주요 구조
- `app/`: 사용자 페이지
- `app/api/`: Next Route Handler 프록시
- `app/watch/[id]/page.tsx`: 재생
- `app/contents/[id]/page.tsx`: 콘텐츠 상세
- `app/categories/[slug]/page.tsx`: 카테고리 상세
- `app/search/page.tsx`: 검색
- `app/my-list/page.tsx`: 내 목록
- `app/admin/page.tsx`: 운영 화면

## 데이터/연동 규칙
- UI는 가능하면 내부 프록시를 호출한다.
- 백엔드 응답 shape는 방어적으로 파싱한다.
- snake_case / camelCase 차이는 adapter로 정리한다.
- 프록시 route는 백엔드 status/message를 최대한 보존한다.

## UI 규칙
- Tailwind 유지.
- 반복되는 카드/섹션/배지는 컴포넌트화.
- OTT 특성상 hero, rail, metadata, CTA의 일관성 유지.
- 접근성(focus, alt, aria)과 반응형을 기본으로 고려.

## 작업 우선순위
1. 동작 보존
2. 정보 구조 정리
3. API 계약 안정화
4. 운영형 품질 개선
5. 확장성 확보

## 금지사항
- 페이지 전체를 불필요하게 클라이언트 컴포넌트로 바꾸지 말 것
- 클라이언트에서 백엔드 원격 URL을 직접 때리지 말 것
- Pages Router 패턴으로 회귀하지 말 것
- 근거 없이 새 라이브러리를 추가하지 말 것

## 백엔드 변경이 필요한 경우
다음 상황이면 프론트만 수정하지 말고 백엔드 변경 필요성을 함께 명시한다.
- 새로운 정렬/필터/검색 조건이 필요할 때
- 응답 필드가 부족할 때
- 개인화/권한/재생 정책이 바뀔 때
- 어드민 편성/운영 기능이 추가될 때

## 완료 보고 형식
작업 후 아래 형식으로 보고한다.
- 변경 파일
- 사용자 영향
- 백엔드 영향
- 남은 리스크
- 다음 추천 작업
