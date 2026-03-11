# AI OTT Web

AI 기반 OTT(Over-The-Top) 플랫폼의 웹 프론트엔드 애플리케이션입니다.

## 주요 기능

- 🎬 비디오 업로드 및 관리
- 📺 HLS 스트리밍 재생
- 🎨 현대적인 UI/UX
- ⚙️ 환경별 설정 관리
- 🔄 버전별 기능 관리
- 🚀 자동화된 CI/CD

## 기술 스택

- **Framework**: Next.js 16.1.6
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Video Player**: HLS.js 1.6.15
- **Deployment**: Vercel (GitHub Actions)

## 시작하기

### 사전 요구사항

- Node.js 20 이상
- npm, yarn, pnpm, 또는 bun

### 설치

```bash
# 의존성 설치
npm install
```

### 환경 변수 설정

프로젝트 루트에 환경 변수 파일을 생성하세요:

```bash
# .env.development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_APP_VERSION=0.1.0
NODE_ENV=development
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 프로젝트 구조

```
ai-ott-web/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── upload/            # 업로드 페이지
│   ├── watch/             # 시청 페이지
│   └── page.tsx           # 홈 페이지
├── config/                # 설정 관리
│   ├── env/               # 환경별 설정
│   ├── versions/          # 버전별 설정
│   └── pages/            # 페이지별 설정
├── lib/                   # 유틸리티
│   ├── config/           # 설정 관리자
│   └── url.ts            # URL 유틸리티
├── docs/                  # 문서
│   ├── ARCHITECTURE.md   # 아키텍처 문서
│   ├── CONFIGURATION.md  # 설정 가이드
│   └── DEPLOYMENT.md     # 배포 가이드
└── .github/              # CI/CD
    └── workflows/        # GitHub Actions
```

## 설정 관리

이 프로젝트는 환경별, 버전별, 페이지별 설정을 체계적으로 관리합니다.

### 환경별 설정

- **Development**: 로컬 개발 환경
- **Staging**: 스테이징 환경
- **Production**: 프로덕션 환경

### 버전별 설정

- **v1.0.0**: 현재 버전
- **v2.0.0**: 향후 확장 버전

자세한 내용은 [설정 가이드](docs/CONFIGURATION.md)를 참조하세요.

## CI/CD

GitHub Actions를 사용하여 자동화된 배포를 수행합니다:

- **CI**: Pull Request 시 린트 및 빌드 검증
- **Development**: `develop` 브랜치 푸시 시 자동 배포
- **Staging**: `staging` 브랜치 푸시 시 자동 배포
- **Production**: `main` 브랜치 푸시 시 자동 배포

자세한 내용은 [배포 가이드](docs/DEPLOYMENT.md)를 참조하세요.

## 문서

- [아키텍처 문서](docs/ARCHITECTURE.md) - 프로젝트 아키텍처 및 설계 원칙
- [설정 가이드](docs/CONFIGURATION.md) - 설정 관리 방법
- [배포 가이드](docs/DEPLOYMENT.md) - CI/CD 및 배포 프로세스

## 개발 가이드

### 코드 스타일

```bash
# 린트 실행
npm run lint
```

### 브랜치 전략

- `main`: 프로덕션 배포
- `staging`: 스테이징 배포
- `develop`: 개발 배포

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.
