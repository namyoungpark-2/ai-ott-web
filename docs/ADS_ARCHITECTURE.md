# 광고 시스템 아키텍처

> AI OTT Web — Ads System Design & Implementation Guide
> 작성일: 2026-03-16

---

## 1. 개요

OTT 플랫폼의 수익화를 위해 **비파괴적(non-intrusive)** 광고 시스템을 설계했다.
사용자 경험을 최우선으로 두되, 광고주에게 충분한 노출/클릭/완료 데이터를 제공하는 구조다.

### 지원 광고 유형

| 유형 | 위치 | 특징 |
|------|------|------|
| `BANNER` | 홈/카테고리 페이지 섹션 사이 | 이미지 배너, 클릭 추적, 닫기 가능 |
| `VIDEO_PREROLL` | 영상 재생 직전 | 스킵 버튼(N초 후), 광고 후 자동 재생 |
| `VIDEO_MIDROLL` | 영상 재생 중 지정 시점 | 일시정지 후 광고, 완료/스킵 후 재개 |
| `VIDEO_POSTROLL` | 영상 종료 후 | 다음 콘텐츠 추천과 연계 가능 |
| `VIDEO_OVERLAY` | (향후) 재생 중 하단 L-배너 | 재생 방해 없이 오버레이 표시 |

---

## 2. 디렉터리 구조

```
types/
  ads.ts                        # 모든 광고 관련 TypeScript 타입 정의

components/ads/
  AdProvider.tsx                # 광고 컨텍스트 프로바이더 + 추적 로직
  AdBanner.tsx                  # 배너 광고 렌더링 컴포넌트
  VideoAd.tsx                   # 영상 광고 오버레이 컴포넌트

app/api/ads/
  config/route.ts               # GET  /api/ads/config  — 광고 설정 조회
  impression/route.ts           # POST /api/ads/impression — 노출 이벤트
  click/route.ts                # POST /api/ads/click — 클릭 이벤트
```

---

## 3. 데이터 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                              │
│  Page mounts                                                 │
│    └─► AdProvider                                            │
│           └─► GET /api/ads/config?page=watch&contentId=xxx   │
│                    │                                         │
│                    ▼                                         │
│             AdConfig { banners[], video: { preRoll,         │
│                        midRolls[], postRoll } }              │
│                                                              │
│  Video content becomes READY                                 │
│    └─► preRoll exists?                                       │
│           ├─ YES → show VideoAd overlay                      │
│           │          └─► POST /api/ads/impression            │
│           │          └─► user skips or video ends            │
│           │                └─► POST /api/ads/impression (SKIP)│
│           │                └─► start main video              │
│           └─ NO  → start main video immediately             │
│                                                              │
│  HEARTBEAT every 10s                                         │
│    └─► check pendingMidRolls[0].triggerPositionMs            │
│           └─► trigger? → pause video, show VideoAd          │
│                              └─► complete → resume video     │
│                                                              │
│  Banner ad on home page                                      │
│    └─► render after every 2nd section                        │
│           └─► POST /api/ads/impression (on mount)            │
│           └─► user clicks → POST /api/ads/click             │
└─────────────────────────────────────────────────────────────┘
           │                              │
           ▼                              ▼
  Next.js Route Handler           Next.js Route Handler
  /api/ads/config                 /api/ads/impression
  /api/ads/click                        │
           │                            │
           ▼                            ▼
  Spring Boot Backend             Spring Boot Backend
  /api/app/ads/config             /api/app/ads/impression
  /api/app/ads/click
```

---

## 4. 핵심 타입 (`types/ads.ts`)

```typescript
type AdType =
  | "BANNER"
  | "VIDEO_PREROLL"
  | "VIDEO_MIDROLL"
  | "VIDEO_POSTROLL"
  | "VIDEO_OVERLAY";

type AdPlacement = {
  id: string;
  type: AdType;
  status: "ACTIVE" | "PAUSED" | "EXPIRED";
  advertiser?: string;
  title?: string;

  // Banner
  imageUrl?: string;
  clickUrl?: string;

  // Video
  videoUrl?: string;
  skipAfterSeconds?: number | null;  // null = 스킵 불가
  durationSeconds?: number;

  // Mid-roll only
  triggerPositionMs?: number;        // 콘텐츠 재생 위치 (ms)
};

type AdConfig = {
  pageType: "home" | "content" | "watch" | "category" | "search";
  contentId?: string;
  banners: AdPlacement[];
  video: {
    preRoll?: AdPlacement;
    midRolls: AdPlacement[];         // triggerPositionMs 오름차순 정렬
    postRoll?: AdPlacement;
  };
};
```

---

## 5. 컴포넌트 설명

### `AdProvider` (`components/ads/AdProvider.tsx`)

- 페이지 마운트 시 `/api/ads/config` 호출
- `AdContext`를 통해 하위 컴포넌트에 `config`, `trackImpression`, `trackClick`, `trackSkip` 제공
- **광고 실패는 절대 페이지를 깨뜨리지 않는다** (모든 에러 silent)
- `pageType` + `contentId` props으로 컨텍스트 결정

```tsx
<AdProvider pageType="watch" contentId={contentId}>
  <WatchPageInner />
</AdProvider>
```

### `AdBanner` (`components/ads/AdBanner.tsx`)

- 마운트 시 자동으로 노출(impression) 추적
- 이미지 로드 실패 시 그라디언트 플레이스홀더로 폴백
- `dismissible` prop으로 닫기 버튼 노출 여부 제어
- 클릭 시 `clickUrl`로 새 탭 열기 + 클릭 이벤트 전송

```tsx
<AdBanner ad={banner} dismissible contentId="..." />
```

### `VideoAd` (`components/ads/VideoAd.tsx`)

- `<video>` 엘리먼트로 광고 영상 재생 (HLS 주 플레이어와 별도)
- `skipAfterSeconds` 이후 스킵 버튼 표시
- `videoUrl`이 없거나 로드 실패 시 `durationSeconds` 카운트다운 후 자동 완료
- `onComplete` 콜백으로 상위에 완료/스킵 통보
- `phase` prop: `"preroll" | "midroll" | "postroll"` → 하단 안내 문구 결정

---

## 6. 페이지별 통합

### Watch 페이지 (`app/watch/[id]/page.tsx`)

```
content READY
  ↓
adConfigReady?
  ├─ preRoll → VideoAd(preroll) overlay
  │              └─► onComplete → v.play()
  └─ no preRoll → v.play() immediately

HEARTBEAT (10s interval)
  └─► pendingMidRolls[0].triggerPositionMs <= currentPosMs?
        ├─ YES → v.pause() → VideoAd(midroll)
        │           └─► onComplete → v.play()
        └─ NO  → continue
```

**Ad state 변수:**

| 변수 | 타입 | 역할 |
|------|------|------|
| `activeAd` | `AdPlacement \| null` | 현재 표시 중인 광고 |
| `adPhase` | `AdPhase` | `"preroll" \| "midroll" \| "postroll" \| null` |
| `adConfigReady` | `boolean` | 광고 설정 로드 완료 여부 |
| `pendingMidRollsRef` | `useRef` | 미방영된 미드롤 큐 |
| `preRollShownRef` | `useRef` | 프리롤 중복 방지 플래그 |

### 홈 페이지 (`app/page.tsx`)

- `HomeSectionWithAd` 래퍼로 모든 섹션 감쌈
- 홀수 인덱스(1, 3, 5…) 섹션 이후에 배너 삽입
- 배너 데이터는 `adConfig.banners[Math.floor(index / 2)]`로 매핑

---

## 7. API 프록시 라우트

### `GET /api/ads/config`

```
Query: page=home|content|watch|category|search, contentId=<id>

Response (AdConfig):
{
  "pageType": "watch",
  "contentId": "abc123",
  "banners": [],
  "video": {
    "preRoll": { "id": "...", "type": "VIDEO_PREROLL", ... },
    "midRolls": [
      { "id": "...", "type": "VIDEO_MIDROLL", "triggerPositionMs": 60000, ... }
    ],
    "postRoll": null
  }
}
```

- 백엔드 404/501 → 빈 AdConfig 반환 (광고 없음 처리)
- `MOCK_ADS_ENABLED=true` → 샘플 광고 반환 (백엔드 없이 테스트 가능)

### `POST /api/ads/impression`

```json
{
  "adId": "ad-001",
  "adType": "VIDEO_PREROLL",
  "contentId": "content-123",
  "positionMs": 0,
  "sessionId": "...",
  "deviceId": "...",
  "occurredAt": "2026-03-16T10:00:00.000Z"
}
```

- 스킵 이벤트도 동일 엔드포인트 + `"eventKind": "SKIP"` 추가

### `POST /api/ads/click`

```json
{
  "adId": "ad-001",
  "adType": "BANNER",
  "contentId": "content-123",
  "occurredAt": "2026-03-16T10:00:00.000Z"
}
```

---

## 8. 백엔드 연동 체크리스트

프론트 구조는 완성됐다. 백엔드가 아래 API를 구현하면 즉시 연동된다.

### 필수 구현 (백엔드)

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/app/ads/config` | GET | 페이지/콘텐츠별 광고 설정 반환 |
| `/api/app/ads/impression` | POST | 광고 노출/스킵 이벤트 수신 |
| `/api/app/ads/click` | POST | 광고 클릭 이벤트 수신 |

### 권장 DB 스키마 (참고)

```sql
-- 광고 소재
CREATE TABLE ads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        VARCHAR(30) NOT NULL,   -- BANNER, VIDEO_PREROLL, ...
  status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  advertiser  VARCHAR(200),
  title       VARCHAR(500),
  image_url   TEXT,
  video_url   TEXT,
  click_url   TEXT,
  skip_after_seconds  INT,
  duration_seconds    INT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 미드롤 트리거 (콘텐츠별 광고 배치)
CREATE TABLE ad_content_placements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id               UUID REFERENCES ads(id),
  content_id          UUID REFERENCES contents(id),
  trigger_position_ms BIGINT,  -- NULL = 프리롤/포스트롤
  priority            INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 노출/클릭 이벤트
CREATE TABLE ad_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id           UUID REFERENCES ads(id),
  event_kind      VARCHAR(20) NOT NULL,  -- IMPRESSION, SKIP, CLICK
  content_id      UUID,
  session_id      VARCHAR(100),
  device_id       VARCHAR(100),
  position_ms     BIGINT,
  watched_seconds INT,
  occurred_at     TIMESTAMPTZ NOT NULL
);
```

---

## 9. 개발/테스트 방법

### 목(Mock) 광고 활성화

`.env.local`에 추가:
```bash
MOCK_ADS_ENABLED=true
```

활성화 시 동작:
- 홈 페이지 → 배너 광고 1개 삽입 (이미지 없는 플레이스홀더)
- Watch 페이지 → 프리롤 15초 + 1분 지점 미드롤 10초

### 수동 테스트 경로

1. **배너 광고**: 홈(`/`) → 두 번째 섹션 아래 배너 확인
2. **프리롤**: `/watch/{id}` 접속 → 재생 전 광고 오버레이 확인, 5초 후 스킵 버튼 확인
3. **미드롤**: 영상 1분 시청 → 광고 삽입 확인, 재개 확인
4. **배너 닫기**: 배너 오른쪽 상단 `×` 버튼 클릭 → 사라짐 확인
5. **클릭 추적**: 배너 클릭 → Network 탭에서 `POST /api/ads/click` 확인

---

## 10. 향후 확장 방향

| 기능 | 설명 | 우선순위 |
|------|------|---------|
| VAST/VMAP 지원 | 표준 광고 프로토콜 연동으로 외부 광고 네트워크 지원 | 중간 |
| 광고 타겟팅 | 사용자 카테고리/시청 이력 기반 맞춤 광고 | 중간 |
| 광고 빈도 제한 | 동일 광고 노출 횟수 제한 (frequency capping) | 높음 |
| Overlay 광고 | 영상 재생 중 하단 L-배너 | 낮음 |
| 어드민 광고 관리 | 광고 소재 등록/수정/예약/성과 확인 UI | 높음 |
| A/B 테스트 | 광고 크리에이티브 성과 비교 | 낮음 |
| 수익 대시보드 | CPM, CTR, 완료율 집계 | 중간 |

---

## 11. 설계 원칙 요약

1. **광고 실패는 절대 페이지를 깨뜨리지 않는다** — 모든 에러는 silent graceful degradation
2. **광고 없이도 동작한다** — 백엔드 미연결 시 빈 AdConfig 반환, 광고 0개
3. **추적은 베스트 에포트** — 노출/클릭 전송 실패해도 UX 영향 없음
4. **비디오 광고는 별도 엘리먼트** — HLS 주 플레이어와 독립 (스트림 조작 불필요)
5. **사용자 경험 우선** — 스킵 가능 광고, 닫기 버튼, 과도한 광고 방지

---

_최종 업데이트: 2026-03-16_
