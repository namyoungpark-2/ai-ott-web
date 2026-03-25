# Hybrid Video Player — 아키텍처 문서

## Why (변경 동기)

AI 생성 영상은 가로형(16:9)과 세로형(9:16)이 혼재한다. 기존 플레이어는 가로형에 편향된 레이아웃(`width: min(1200px, 92vw)`, `maxHeight: 72vh`)을 사용하여, 세로형 영상이 화면 중앙에 작게 표시되는 문제가 있었다. 두 방향 모두 1급 시민으로 지원하는 하이브리드 플레이어가 필요하다.

## AS-IS → TO-BE

### AS-IS
```
app/watch/[id]/page.tsx (715줄 단일 모놀리스)
├── Content type 정의
├── getOrCreate / sendWatchEvent 유틸
├── WatchPageInner (모든 로직 포함)
│   ├── useEffect × 7 (폴링, HLS, 재생상태, UI, 단축키, 이벤트, 진행저장)
│   ├── 광고 상태 관리
│   └── 인라인 스타일 렌더링 (가로형 편향)
└── WatchPage (AdProvider 래퍼)
```

### TO-BE
```
types/video.ts              — VideoOrientation, VideoMeta, resolveOrientation()
hooks/
├── useVideoOrientation.ts  — loadedmetadata / resize 이벤트 기반 방향 감지
├── useContentPolling.ts    — 콘텐츠 폴링 (PROCESSING→READY→FAILED)
├── useHlsPlayer.ts         — HLS.js / native HLS 연결
├── usePlaybackState.ts     — play/pause 상태 추적
├── usePlayerUI.ts           — 마우스 활동 기반 UI 표시/숨김
├── useKeyboardShortcuts.ts — Space, ←/→, F 단축키
├── useWatchEvents.ts       — 시청 이벤트 전송 + mid-roll 트리거
├── usePlaybackProgress.ts  — 재생 위치 저장
└── useFullscreen.ts        — 풀스크린 + 모바일 방향 잠금

components/player/
├── PlayerShell.tsx         — data-orientation 기반 방향 적응형 컨테이너
├── VideoContainer          — 방향별 비디오 사이징 (export from PlayerShell)
├── BlurredBackground.tsx   — 흐린 썸네일 배경 (세로형에서 더 강조)
├── PlayerTopBar.tsx        — 상단 네비게이션 (Back + Fullscreen)
├── PlayerOverlay.tsx       — 타이틀/상태카드/플레이버튼 (방향별 정렬)
└── PlayerBottomHint.tsx    — 하단 단축키 힌트

app/watch/[id]/page.tsx     — 170줄 오케스트레이터 (715줄 → 170줄)
```

## 방향 감지 플로우

```
1. 콘텐츠 API 응답에 videoWidth/videoHeight 있음?
   ├─ YES → 즉시 orientation 결정 (레이아웃 시프트 없음)
   └─ NO  → orientation = "unknown" (기본: landscape 레이아웃)

2. <video> loadedmetadata 이벤트 발생
   └─ videoWidth / videoHeight 읽기
      └─ w/h >= 1.2 → "landscape"
         w/h <= 0.8 → "portrait"
         그 외       → "square"

3. <video> resize 이벤트 (HLS 적응 스트리밍에서 해상도 변경 시)
   └─ 방향 재계산
```

## 방향별 레이아웃 전략

| 방향 | 비디오 사이징 | 배경 | 오버레이 정렬 |
|------|-------------|------|-------------|
| **Landscape** | `width: min(1200px, 92vw)`, `maxHeight: 80vh` | blur 22px, opacity 0.25 | 하단 좌측 |
| **Portrait** | `height: min(88vh, calc(100vh-60px))`, 폭은 비율 계산 | blur 40px, opacity 0.5 (강조) | 하단 중앙 |
| **Square** | `min(80vh, 80vw, 700px)` 정사각 | blur 22px | 하단 좌측 |
| **Unknown** | Landscape와 동일 | Landscape와 동일 | Landscape와 동일 |

## 풀스크린 동작

- **데스크탑**: `#player-root` 요소에 Fullscreen API 적용 (광고 오버레이 포함)
- **모바일**: Screen Orientation API로 방향 잠금 시도
  - Landscape 영상 → `screen.orientation.lock("landscape")`
  - Portrait 영상 → `screen.orientation.lock("portrait")`
  - 풀스크린 해제 시 → `screen.orientation.unlock()`
- **iOS Safari**: `webkitRequestFullscreen` 폴백

## 파일 매핑

### 신규 생성
| 파일 | 역할 |
|------|------|
| `types/video.ts` | 비디오 방향 타입 + 유틸 |
| `hooks/useVideoOrientation.ts` | 방향 감지 hook |
| `hooks/useContentPolling.ts` | 콘텐츠 폴링 hook |
| `hooks/useHlsPlayer.ts` | HLS 연결 hook |
| `hooks/usePlaybackState.ts` | 재생 상태 hook |
| `hooks/usePlayerUI.ts` | UI 표시/숨김 hook |
| `hooks/useKeyboardShortcuts.ts` | 키보드 단축키 hook |
| `hooks/useWatchEvents.ts` | 시청 이벤트 hook |
| `hooks/usePlaybackProgress.ts` | 재생 위치 저장 hook |
| `hooks/useFullscreen.ts` | 풀스크린 hook |
| `components/player/PlayerShell.tsx` | 방향 적응형 컨테이너 |
| `components/player/BlurredBackground.tsx` | 블러 배경 |
| `components/player/PlayerTopBar.tsx` | 상단 바 |
| `components/player/PlayerOverlay.tsx` | 오버레이 |
| `components/player/PlayerBottomHint.tsx` | 하단 힌트 |

### 수정
| 파일 | 변경 내용 |
|------|----------|
| `app/watch/[id]/page.tsx` | 715줄 → 170줄 리팩토링 (오케스트레이터) |

## 엣지 케이스

1. **loadedmetadata 전 레이아웃**: `orientation: "unknown"` → landscape 기본 → `transition: all .3s ease`로 부드럽게 전환
2. **HLS 적응 스트리밍 해상도 변경**: `resize` 이벤트 리스너로 재감지
3. **Screen Orientation API 미지원**: try/catch로 graceful degradation
4. **iOS Safari Fullscreen 제한**: `webkitRequestFullscreen` 폴백
5. **모바일 blur 성능**: portrait에서 blur(40px) 사용 → 성능 이슈 시 `will-change: transform` 또는 서버사이드 pre-blur

## 사이드 이펙트

- 기존 가로형 영상의 레이아웃이 약간 변경됨 (`maxHeight: 72vh` → `80vh`, 비디오에 `objectFit: "contain"` 추가)
- 하단 힌트 텍스트가 단축키 가이드로 변경됨
- `F` 키 풀스크린 단축키 추가

## 검증 방법

```bash
# TypeScript 체크
npx tsc --noEmit

# 개발 서버
npm run dev
```

### 수동 검증 체크리스트
- [ ] 가로형(16:9) 영상 재생 → 가로 최대화 레이아웃
- [ ] 세로형(9:16) 영상 재생 → 세로 최대화 + 블러 사이드 패널
- [ ] 정사각(1:1) 영상 재생 → 균형 잡힌 크기
- [ ] PROCESSING 상태 → 인코딩 카드 중앙 표시
- [ ] FAILED 상태 → 에러 카드 중앙 표시
- [ ] Space 재생/일시정지, ←/→ 탐색, F 풀스크린
- [ ] 풀스크린 진입/해제
- [ ] 모바일 터치 → UI 표시/숨김
- [ ] 광고 오버레이 정상 작동
- [ ] 재생 위치 저장/복원
