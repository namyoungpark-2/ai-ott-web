# Creator Studio 전면 재설계 스펙

> 일반 사용자 누구나 크리에이터가 되어 채널을 만들고, 영상을 업로드하고, 콘텐츠를 관리하는 UGC 플랫폼의 크리에이터 스튜디오 재설계

## 1. 목표

- 기존 스튜디오 페이지를 전면 재작성하여 UX 일관성과 코드 품질 확보
- 깨진 기능(콘텐츠 편집 404) 해결
- 비디오 업로드 + 메타데이터 생성을 단일 플로우로 통합
- 공유 컴포넌트 체계 구축으로 유지보수성 향상
- 반응형 대응 (모바일 포함)

## 2. 사용자 시나리오

### 2.1 크리에이터 온보딩
- 로그인한 사용자가 `/studio` 진입 시 채널 자동 생성 (백엔드 동작)
- 대시보드에서 바로 콘텐츠 업로드 가능
- 확장: 이후 온보딩 위자드, 완성도 프로그레스 바 추가 가능한 구조

### 2.2 콘텐츠 생성 (Happy Path)
1. `/studio/contents/new` 진입
2. 비디오 파일 드래그&드롭 또는 클릭 선택 (필수)
3. 파일 선택 후 메타데이터 폼 표시 (제목*, 설명, 모드)
4. EPISODE 선택 시 시리즈 선택/생성 + 시즌/에피소드 번호
5. "업로드 & 생성" 클릭
6. API: POST /creator/contents → contentId 생성
7. API: POST /creator/contents/{id}/upload → 비디오 업로드 (프로그레스 바)
8. 트랜스코딩 완료 시 자동 PUBLISHED
9. 완료 화면 → 콘텐츠 목록으로 이동

### 2.3 콘텐츠 편집
1. `/studio/contents`에서 편집 버튼 클릭
2. `/studio/contents/[id]/edit`로 이동
3. 기존 데이터 프리필 (제목, 설명, 썸네일)
4. 수정 후 저장 → PUT /creator/contents/{id}/metadata
5. 상태 변경 가능 (PUBLISHED ↔ UNLISTED)
6. 커스텀 썸네일 업로드 가능

### 2.4 시리즈 관리
1. `/studio/series`에서 시리즈 목록 확인
2. 시리즈 생성/편집/삭제
3. 시리즈 클릭 → `/studio/series/[id]` 에피소드 관리
4. 에피소드 목록 (번호 기반 정렬)
5. 에피소드 클릭 → 해당 콘텐츠 편집 페이지로 이동

### 2.5 일괄 관리
1. `/studio/contents`에서 체크박스로 여러 콘텐츠 선택
2. 일괄 공개/비공개/삭제 액션 실행
3. 확인 다이얼로그 후 처리

## 3. 라우트 구조

```
/studio                          → 대시보드
/studio/channel                  → 채널 설정
/studio/contents                 → 콘텐츠 목록 (필터, 정렬, 일괄 관리)
/studio/contents/new             → 콘텐츠 생성 (비디오+메타 통합)
/studio/contents/[id]/edit       → 콘텐츠 편집 (신규)
/studio/series                   → 시리즈 목록
/studio/series/[id]              → 시리즈 상세 + 에피소드 관리 (신규)
```

## 4. 레이아웃 시스템

### 4.1 StudioLayout (공통 래퍼)
```
┌─────────────────────────────────────────────────────┐
│ StudioHeader (채널명 + "채널 보기" 링크)              │
├──────────┬──────────────────────────────────────────┤
│ Sidebar  │  Page Content                            │
│ 220px    │  (maxWidth: 1080)                        │
├──────────┴──────────────────────────────────────────┤
│ 모바일(768px 이하): 사이드바 → 상단 수평 탭 바        │
└─────────────────────────────────────────────────────┘
```

### 4.2 StudioSidebar 메뉴 구조
```
대시보드        /studio
채널 설정       /studio/channel
내 콘텐츠       /studio/contents
시리즈          /studio/series
────────────
채널 보기       /channels/{handle}  (외부 링크)
홈으로          /
```

### 4.3 반응형 브레이크포인트
- 데스크톱 (>768px): 사이드바 + 콘텐츠 영역
- 모바일 (≤768px): 상단 수평 탭 바 + 전체 너비 콘텐츠

## 5. 공유 컴포넌트

### 5.1 StudioLayout
- Props: `children`
- 역할: StudioHeader + StudioSidebar + 콘텐츠 영역 래핑
- 채널 정보 fetch (GET /creator/channel) → header/sidebar에 전달

### 5.2 StudioHeader
- 채널 프로필 이미지 + 이름 표시
- "채널 보기" 외부 링크
- 모바일에서도 항상 표시

### 5.3 StudioSidebar
- 기존 컴포넌트 리팩토링
- 데스크톱: 좌측 고정 220px
- 모바일: 숨김 (StudioMobileNav로 대체)

### 5.4 StudioMobileNav
- 768px 이하에서만 표시
- 수평 스크롤 탭 바 (cat-pill 스타일 재사용)

### 5.5 ContentForm
- Props: `mode: "create" | "edit"`, `initialData?: CreatorContent`, `onSubmit`
- 생성 모드: 빈 폼 + VideoUploader 표시
- 편집 모드: 기존 데이터 프리필, VideoUploader 숨김, ThumbnailEditor 표시
- 필드: 제목(필수), 설명, 모드(MOVIE/EPISODE), 시리즈 선택, 시즌/에피소드 번호

### 5.6 VideoUploader
- 드래그&드롭 영역 + 클릭 파일 선택
- 파일 선택 후: 파일명, 크기, 타입 표시
- 업로드 중: 프로그레스 바 (XMLHttpRequest의 upload.onprogress)
- 상태: idle → selected → uploading → done → error
- accept: "video/*"

### 5.7 ThumbnailEditor
- 현재 썸네일 미리보기 (자동 추출된 것)
- "커스텀 썸네일 업로드" 버튼 → 이미지 파일 선택
- 미리보기 + "원래대로" 되돌리기 버튼
- accept: "image/*"

### 5.8 StatusBadge
- Props: `status: ContentStatus | VideoAssetStatus`
- 상태별 색상 매핑:
  - DRAFT: gray
  - PUBLISHED: green
  - UNLISTED: yellow
  - ARCHIVED: red
  - UPLOADED/TRANSCODING: blue spinner
  - READY: green check
  - FAILED: red X

### 5.9 ConfirmDialog
- Props: `open`, `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`
- 오버레이 + 중앙 모달
- window.confirm() 대체

### 5.10 StudioTable
- Props: `columns`, `data`, `selectable`, `onSelectionChange`, `sortable`
- 체크박스 열 (selectable 시)
- 컬럼 헤더 클릭 정렬
- 반응형: 모바일에서 카드 레이아웃으로 전환

## 6. 페이지별 상세 설계

### 6.1 대시보드 (/studio)
**데이터:** GET /creator/channel, GET /creator/contents?limit=5

**UI 구성:**
- 채널 정보 카드 (프로필, 이름, handle, 구독자 수)
- 콘텐츠 요약 카드 (총 N개, PUBLISHED N개, DRAFT N개, UNLISTED N개)
- 최근 콘텐츠 5개 (제목, 상태, 날짜) — 클릭 시 편집 페이지로 이동
- 빠른 액션: "새 콘텐츠 업로드" 버튼, "채널 설정" 링크

### 6.2 채널 설정 (/studio/channel)
**데이터:** GET /creator/channel, PUT /creator/channel, PATCH /creator/channel/handle

**UI 구성:**
- 채널 이름 입력
- Handle 변경 (인라인 편집)
- 채널 설명 textarea
- 프로필 이미지 URL 입력 + 미리보기
- 배너 이미지 URL 입력 + 미리보기
- "저장" 버튼 + 토스트 알림

### 6.3 콘텐츠 목록 (/studio/contents)
**데이터:** GET /creator/contents?lang={locale}&limit=50

**UI 구성:**
- 상단: "내 콘텐츠" 제목 + "새 콘텐츠" 버튼
- 상태 필터: 전체 | DRAFT | PUBLISHED | UNLISTED (pill 버튼)
- StudioTable:
  - 체크박스 | 썸네일(40x24) | 제목 | 타입 | 상태 | 비디오 | 날짜 | 액션
  - 액션: 편집(링크), 공개/비공개 토글, 삭제
- 일괄 액션 바 (선택 시 표시): "N개 선택됨" + 일괄 공개 | 일괄 비공개 | 일괄 삭제
- 삭제 시 ConfirmDialog 표시

### 6.4 콘텐츠 생성 (/studio/contents/new)
**데이터:** POST /creator/contents, POST /creator/contents/{id}/upload, GET /creator/series

**UI 구성:**
- Phase 1: VideoUploader (전체 화면 드래그&드롭 영역)
  - 파일 선택 전: 큰 드롭존 "비디오 파일을 드래그하거나 클릭하세요"
  - 파일 선택 후: 파일 정보 표시 + ContentForm 펼침
- Phase 2: ContentForm (mode="create")
  - 제목 (필수)
  - 설명
  - 콘텐츠 유형: MOVIE / EPISODE 토글
  - EPISODE: 시리즈 선택 드롭다운 + "새 시리즈" 옵션 + 시즌/에피소드 번호
- Phase 3: "업로드 & 생성" 버튼
  - 클릭 → 메타 생성 API → 비디오 업로드 API (프로그레스 바)
  - 완료 → 성공 메시지 + "콘텐츠 목록" 버튼

### 6.5 콘텐츠 편집 (/studio/contents/[id]/edit)
**데이터:** GET /creator/contents → 해당 ID 찾기, PUT /creator/contents/{id}/metadata, PATCH /creator/contents/{id}/status

**UI 구성:**
- ContentForm (mode="edit", initialData=기존 콘텐츠)
  - 제목, 설명 수정
  - 비디오 상태 표시 (재업로드 불가, 상태만 표시)
  - ThumbnailEditor (커스텀 썸네일 업로드)
  - 상태 변경 드롭다운 (PUBLISHED / UNLISTED)
- "저장" 버튼 → PUT metadata
- "삭제" 버튼 → ConfirmDialog → DELETE

### 6.6 시리즈 목록 (/studio/series)
**데이터:** GET /creator/series, POST /creator/series, PUT /creator/series/{id}, DELETE /creator/series/{id}

**UI 구성:**
- 상단: "시리즈" 제목 + "새 시리즈" 버튼
- 시리즈 카드 그리드:
  - 제목, 설명, 에피소드 수
  - 액션: 편집(인라인), 삭제(ConfirmDialog), 상세 보기(링크)
- 인라인 생성 폼 (제목, 설명)

### 6.7 시리즈 상세 (/studio/series/[id])
**데이터:** GET /creator/series, GET /creator/contents (시리즈 필터)

**UI 구성:**
- 시리즈 메타 편집 (제목, 설명) — 인라인
- 에피소드 목록 테이블 (시즌/에피소드 번호 기준 정렬)
  - 제목 | S/E 번호 | 상태 | 비디오 상태 | 액션
  - 클릭 → /studio/contents/[id]/edit
- "에피소드 추가" → /studio/contents/new?seriesId={id} (시리즈 프리셋)

## 7. API 엔드포인트 매핑

| 기능 | Method | Frontend Proxy | Backend |
|------|--------|---------------|---------|
| 내 채널 조회 | GET | /api/creator/channel | /api/app/creator/channel |
| 채널 수정 | PUT | /api/creator/channel | /api/app/creator/channel |
| Handle 변경 | PATCH | /api/creator/channel/handle | /api/app/creator/channel/handle |
| 콘텐츠 목록 | GET | /api/creator/contents | /api/app/creator/contents |
| 콘텐츠 생성 | POST | /api/creator/contents | /api/app/creator/contents |
| 메타 수정 | PUT | /api/creator/contents/[id]/metadata | /api/app/creator/contents/{id}/metadata |
| 상태 변경 | PATCH | /api/creator/contents/[id]/status | /api/app/creator/contents/{id}/status |
| 콘텐츠 삭제 | DELETE | /api/creator/contents/[id] | /api/app/creator/contents/{id} |
| 비디오 업로드 | POST | /api/creator/contents/[id]/upload | /api/app/creator/contents/{id}/upload |
| 시리즈 목록 | GET | /api/creator/series | /api/app/creator/series |
| 시리즈 생성 | POST | /api/creator/series | /api/app/creator/series |
| 시리즈 수정 | PUT | /api/creator/series/[id] | /api/app/creator/series/{id} |
| 시리즈 삭제 | DELETE | /api/creator/series/[id] | /api/app/creator/series/{id} (프록시 추가 필요) |

**신규 프록시 필요:** DELETE /api/creator/series/[id] (시리즈 삭제)

## 8. 상태 관리

- 각 페이지는 독립적인 로컬 상태 (useState)
- StudioLayout에서 채널 정보를 한번 fetch → Context로 하위 전달
- 일괄 선택 상태: 콘텐츠 목록 페이지 내 로컬 상태
- 업로드 프로그레스: VideoUploader 컴포넌트 내 로컬 상태 (XMLHttpRequest)

## 9. 에러 처리

- 모든 fetch: try/catch + 에러 상태 + "다시 시도" 버튼
- 401 Unauthorized: 로그인 페이지로 리다이렉트
- 403 Forbidden: "권한이 없습니다" 메시지
- 네트워크 에러: "서버 연결을 확인해주세요" 메시지
- 업로드 실패: 재시도 버튼 + 에러 메시지

## 10. 확장 포인트

- **온보딩 위자드:** StudioLayout에 `onboardingStep` 상태 추가 → 조건부 위자드 렌더링
- **공개 설정:** ContentForm에 `publishMode` 필드 추가 → 자동/수동/예약 공개
- **분석 대시보드:** 대시보드에 차트 컴포넌트 추가 (백엔드 analytics API 필요)
- **드래그 에피소드 순서:** 시리즈 상세에서 dnd-kit 등 라이브러리 추가

## 11. 파일 구조

```
components/studio/
├── StudioLayout.tsx          # 공통 레이아웃 래퍼 (신규)
├── StudioHeader.tsx          # 상단 헤더 (신규)
├── StudioSidebar.tsx         # 사이드바 (재작성)
├── StudioMobileNav.tsx       # 모바일 탭 바 (신규)
├── ContentForm.tsx           # 생성/편집 공유 폼 (신규)
├── VideoUploader.tsx         # 드래그&드롭 업로드 (신규)
├── ThumbnailEditor.tsx       # 썸네일 관리 (신규)
├── StatusBadge.tsx           # 상태 배지 (신규)
├── ConfirmDialog.tsx         # 확인 다이얼로그 (신규)
└── StudioTable.tsx           # 테이블 + 체크박스 (신규)

app/studio/
├── layout.tsx                # 메타데이터만 (유지)
├── page.tsx                  # 대시보드 (재작성)
├── channel/
│   └── page.tsx              # 채널 설정 (재작성)
├── contents/
│   ├── page.tsx              # 콘텐츠 목록 (재작성)
│   ├── new/
│   │   └── page.tsx          # 콘텐츠 생성 (재작성)
│   └── [id]/
│       └── edit/
│           └── page.tsx      # 콘텐츠 편집 (신규)
└── series/
    ├── page.tsx              # 시리즈 목록 (재작성)
    └── [id]/
        └── page.tsx          # 시리즈 상세 (신규)

app/api/creator/
└── series/[id]/route.ts      # DELETE 핸들러 추가
```
