# AI OTT 프로젝트 아키텍처 문서

## 개요

AI OTT는 Next.js 기반의 OTT(Over-The-Top) 플랫폼으로, 비디오 업로드, 트랜스코딩, 스트리밍 기능을 제공합니다.

## 프로젝트 구조

```
ai-ott-web/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── contents/      # 콘텐츠 API
│   │   ├── feed/          # 피드 API
│   │   └── watch-events/  # 시청 이벤트 API
│   ├── hls/               # HLS 스트리밍 라우트
│   ├── thumbnails/        # 썸네일 라우트
│   ├── upload/            # 업로드 페이지
│   ├── watch/             # 시청 페이지
│   └── page.tsx           # 홈 페이지
├── config/                # 설정 관리
│   ├── env/               # 환경별 설정
│   │   ├── development.ts
│   │   ├── staging.ts
│   │   ├── production.ts
│   │   └── index.ts
│   ├── versions/          # 버전별 설정
│   │   ├── v1.ts
│   │   ├── v2.ts
│   │   └── index.ts
│   └── pages/            # 페이지별 설정
│       ├── home.ts
│       ├── watch.ts
│       ├── upload.ts
│       └── index.ts
├── lib/                   # 유틸리티
│   ├── config/           # 설정 관리자
│   └── url.ts            # URL 유틸리티
└── .github/              # CI/CD
    └── workflows/        # GitHub Actions
```

## 아키텍처 설계 원칙

### 1. 환경별 설정 관리

프로젝트는 세 가지 환경을 지원합니다:
- **Development**: 로컬 개발 환경
- **Staging**: 스테이징 환경 (테스트용)
- **Production**: 프로덕션 환경

각 환경은 독립적인 설정 파일을 가지며, `config/env/` 디렉토리에서 관리됩니다.

### 2. 버전별 설정 관리

기능 변경이나 설정 변경을 버전별로 관리할 수 있습니다:
- **v1.0.0**: 초기 버전 (현재)
- **v2.0.0**: 향후 확장 버전

버전별 설정은 `config/versions/` 디렉토리에서 관리됩니다.

### 3. 페이지별 설정 관리

각 페이지는 독립적인 설정을 가질 수 있습니다:
- **Home**: 홈 페이지 설정
- **Watch**: 시청 페이지 설정
- **Upload**: 업로드 페이지 설정

페이지별 설정은 `config/pages/` 디렉토리에서 관리됩니다.

## 주요 컴포넌트

### 1. 설정 관리자 (ConfigManager)

`lib/config/index.ts`에 위치한 싱글톤 패턴의 설정 관리자입니다.

**주요 기능:**
- 환경별 설정 로드
- 버전별 설정 로드
- 페이지별 설정 제공
- 기능 활성화 여부 확인

**사용 예시:**
```typescript
import { configManager, getApiBaseUrl, getPageConfig } from '@/lib/config';

// API Base URL 가져오기
const apiUrl = getApiBaseUrl();

// 페이지 설정 가져오기
const homeConfig = getPageConfig('home');
```

### 2. API 라우트

Next.js API Routes를 사용하여 백엔드 API를 프록시합니다.

**주요 엔드포인트:**
- `/api/feed`: 콘텐츠 피드 조회
- `/api/contents/[id]`: 특정 콘텐츠 조회
- `/api/uploads`: 파일 업로드
- `/api/watch-events`: 시청 이벤트 전송
- `/hls/[...path]`: HLS 스트리밍
- `/thumbnails/[file]`: 썸네일 제공

### 3. 페이지 컴포넌트

**홈 페이지 (`app/page.tsx`)**
- 콘텐츠 목록 표시
- 검색 기능
- 히어로 섹션

**시청 페이지 (`app/watch/[id]/page.tsx`)**
- HLS.js를 사용한 비디오 플레이어
- 시청 이벤트 추적
- 썸네일 표시

**업로드 페이지 (`app/upload/page.tsx`)**
- 파일 업로드
- 제목 입력
- 업로드 진행 상태 표시

## 데이터 흐름

1. **업로드 플로우**
   ```
   사용자 → Upload Page → /api/uploads → Backend API
   ```

2. **시청 플로우**
   ```
   사용자 → Watch Page → /api/contents/[id] → Backend API
   사용자 → HLS Player → /hls/[...path] → Backend API
   ```

3. **피드 플로우**
   ```
   사용자 → Home Page → /api/feed → Backend API
   ```

## 환경 변수

### 필수 환경 변수

- `NEXT_PUBLIC_API_BASE_URL`: 백엔드 API Base URL
- `NEXT_PUBLIC_APP_VERSION`: 앱 버전
- `NODE_ENV`: 환경 설정 (development, staging, production)

### 환경별 설정

각 환경에 맞는 `.env` 파일을 생성하세요:
- `.env.development`
- `.env.staging`
- `.env.production`

## 배포 전략

### 브랜치 전략

- `main`: 프로덕션 배포
- `staging`: 스테이징 배포
- `develop`: 개발 배포

### CI/CD 파이프라인

GitHub Actions를 사용하여 자동화된 배포를 수행합니다:
- **CI**: Pull Request 시 린트 및 빌드 검증
- **Deploy Development**: `develop` 브랜치 푸시 시 자동 배포
- **Deploy Staging**: `staging` 브랜치 푸시 시 자동 배포
- **Deploy Production**: `main` 브랜치 푸시 시 자동 배포

## 기술 스택

- **Framework**: Next.js 16.1.6
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Video Player**: HLS.js 1.6.15
- **Deployment**: Vercel (GitHub Actions 연동)

## 향후 개선 사항

1. **버전 2.0 기능**
   - 시리즈 지원
   - 플레이리스트 기능
   - 추천 시스템
   - 자막 지원
   - 화질 선택 기능

2. **성능 최적화**
   - 이미지 최적화
   - 코드 스플리팅
   - 캐싱 전략 개선

3. **모니터링**
   - 에러 추적 (Sentry 등)
   - 성능 모니터링
   - 사용자 분석
