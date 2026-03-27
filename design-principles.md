# Design Principles — AI OTT Web

## 1. 서버 우선 (Server-First)

- **Server Component가 기본값**. 데이터 페칭, 메타데이터, 초기 렌더링은 서버에서.
- `"use client"`는 이벤트 핸들러, 브라우저 API, 상태 관리가 필요한 최소 단위에만.
- 페이지 전체를 클라이언트 컴포넌트로 만들지 않는다. 인터랙티브 부분만 분리.

## 2. 프록시 퍼스트 (Proxy-First)

- 모든 백엔드 통신은 `app/api/*` Route Handler를 거친다.
- 클라이언트 → 백엔드 직접 호출 금지.
- 프록시에서 snake_case → camelCase 정규화, 에러 처리, 인증 토큰 주입.

## 3. 방어적 파싱 (Defensive Parsing)

- 백엔드 응답 shape을 신뢰하지 않는다.
- optional chaining, 기본값, 타입 가드를 적극 사용.
- `any` 대신 명시적 타입 정의.

## 4. OTT 패턴 일관성

- **Hero**: 상단 대형 배너. 16:9 또는 21:9 비율.
- **Rail**: 가로 스크롤 콘텐츠 목록. 카테고리별 그룹핑.
- **Card**: 콘텐츠 썸네일 + 메타데이터. 호버 시 확대/정보 표시.
- **CTA**: 재생, 내 목록 추가 등 주요 액션 버튼.
- **Navigation**: 카테고리 필(pill) 네비게이션. 현재 경로 하이라이트.

## 5. 상태 완전성 (State Completeness)

모든 비동기 UI는 4가지 상태를 반드시 처리:

| 상태 | 처리 |
|------|------|
| **Loading** | 스켈레톤 또는 스피너 |
| **Success** | 데이터 렌더링 |
| **Empty** | 안내 메시지 + CTA |
| **Error** | 에러 메시지 + 재시도 버튼 |

## 6. 접근성 기본값 (A11y by Default)

- 모든 이미지에 `alt` 텍스트.
- 인터랙티브 요소에 `aria-label` / `role`.
- 키보드 내비게이션 지원 (focus ring, tab order).
- 색상 대비 WCAG AA 이상.

## 7. 반응형 우선 (Responsive-First)

Tailwind 브레이크포인트 기준:

| 기기 | 너비 | Tailwind |
|------|------|----------|
| 모바일 | < 640px | 기본 |
| 태블릿 | 640–1024px | `sm:` ~ `lg:` |
| 데스크톱 | > 1024px | `lg:` ~ `xl:` |

- 모바일 레이아웃을 먼저 작성하고 브레이크포인트로 확장.
- 그리드 컬럼 수, 카드 크기, 히어로 비율이 기기별로 적응.

## 8. 컴포넌트 추출 기준

- 동일 패턴이 **2회 이상** 반복되면 컴포넌트로 추출.
- 하나의 컴포넌트는 하나의 책임.
- props 인터페이스를 명시적으로 정의.

## 9. 금지 사항

- Pages Router 패턴 사용 금지
- 클라이언트에서 백엔드 직접 호출 금지
- 불필요한 라이브러리 추가 금지
- `any` 타입 사용 금지
- 전체 페이지를 `"use client"`로 감싸기 금지

---

## 10. Playwright MCP를 활용한 디자인 검증

### 왜 필요한가

코드만으로는 시각적 결과를 확인할 수 없다. Playwright MCP를 사용하면 **개발 중 실시간으로 브라우저에서 디자인 원칙 준수 여부를 검증**할 수 있다.

### 검증 워크플로우

```
코드 작성 → dev 서버 확인 → Playwright MCP로 검증 → 수정 → 반복
```

### 디자인 원칙별 검증 방법

#### 서버 우선 검증
```
1. browser_navigate("http://localhost:3000")
2. browser_evaluate({ function: "() => document.querySelectorAll('[data-reactroot]').length" })
   → 클라이언트 하이드레이션 범위 확인
3. browser_network_requests({ includeStatic: false })
   → 클라이언트에서 백엔드 직접 호출이 없는지 확인
```

#### OTT 패턴 일관성 검증
```
1. browser_snapshot()
   → Hero, Rail, Card, CTA, Navigation 구조 확인
2. browser_take_screenshot({ type: "png" })
   → 시각적 레이아웃 확인
3. browser_hover({ ref: "[카드 ref]" })
   → 호버 상태 확인
4. browser_take_screenshot({ type: "png" })
   → 호버 후 시각적 변화 확인
```

#### 상태 완전성 검증
```
# 로딩 상태
1. browser_navigate("http://localhost:3000/categories/movie")
2. browser_snapshot() → 스켈레톤/스피너 존재 확인

# 에러 상태 (백엔드 미연결 시)
3. browser_wait_for({ time: 3 })
4. browser_snapshot() → 에러 메시지 + 재시도 버튼 확인

# 빈 상태
5. browser_snapshot() → 안내 메시지 확인
```

#### 접근성 검증
```
1. browser_snapshot()
   → 접근성 트리에서 모든 요소의 role, name 확인
   → alt 텍스트 누락, aria-label 누락 탐지
2. browser_press_key({ key: "Tab" })
   → 포커스 이동 순서 확인
3. browser_snapshot()
   → 포커스된 요소 확인
```

#### 반응형 검증
```
# 모바일
1. browser_resize({ width: 390, height: 844 })
2. browser_snapshot()
3. browser_take_screenshot({ type: "png" })

# 태블릿
4. browser_resize({ width: 768, height: 1024 })
5. browser_snapshot()
6. browser_take_screenshot({ type: "png" })

# 데스크톱
7. browser_resize({ width: 1440, height: 900 })
8. browser_snapshot()
9. browser_take_screenshot({ type: "png" })
```

#### 사용자 플로우 검증
```
# 검색 플로우
1. browser_navigate("http://localhost:3000")
2. browser_snapshot()
3. browser_click({ ref: "[검색 입력 ref]" })
4. browser_type({ ref: "[검색 입력 ref]", text: "액션" })
5. browser_wait_for({ text: "검색 결과" })
6. browser_snapshot() → 결과 확인

# 재생 플로우
1. browser_navigate("http://localhost:3000/watch/1")
2. browser_snapshot() → 플레이어 + 메타데이터 확인
3. browser_console_messages({ level: "error" }) → 에러 없음 확인
4. browser_network_requests({ includeStatic: false }) → HLS 요청 확인
```

### 검증 체크리스트 (UI 작업 완료 시)

| 항목 | 검증 도구 | 기준 |
|------|----------|------|
| 레이아웃 정확성 | `screenshot` | 디자인과 일치 |
| 접근성 트리 | `snapshot` | role/name 완전성 |
| 콘솔 에러 | `console_messages` | error 레벨 0건 |
| API 호출 경로 | `network_requests` | `/api/*` 프록시 경유만 |
| 모바일 대응 | `resize` + `snapshot` | 깨짐 없음 |
| 키보드 내비게이션 | `press_key(Tab)` | 논리적 순서 |
| 호버/포커스 상태 | `hover` + `snapshot` | 시각적 피드백 |
| 로딩 상태 | `snapshot` (초기) | 스켈레톤 존재 |
| 에러 상태 | `snapshot` (실패 시) | 에러 UI + 재시도 |
