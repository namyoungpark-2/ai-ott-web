# 설정 관리 가이드

## 개요

이 프로젝트는 환경별, 버전별, 페이지별 설정을 체계적으로 관리할 수 있는 구조를 제공합니다.

## 설정 구조

### 1. 환경별 설정 (`config/env/`)

각 환경(development, staging, production)에 맞는 설정을 관리합니다.

#### Development (`config/env/development.ts`)
```typescript
{
  env: 'development',
  api: {
    baseUrl: 'http://localhost:8080',
    timeout: 30000,
  },
  // ...
}
```

#### Staging (`config/env/staging.ts`)
```typescript
{
  env: 'staging',
  api: {
    baseUrl: 'https://staging-api.example.com',
    timeout: 30000,
  },
  // ...
}
```

#### Production (`config/env/production.ts`)
```typescript
{
  env: 'production',
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 30000,
  },
  // ...
}
```

### 2. 버전별 설정 (`config/versions/`)

기능 변경이나 설정 변경을 버전별로 관리합니다.

#### v1.0.0 (`config/versions/v1.ts`)
- 초기 버전 설정
- 기본 기능만 포함
- 시리즈, 플레이리스트 미지원

#### v2.0.0 (`config/versions/v2.ts`)
- 향후 확장 버전
- 시리즈, 플레이리스트 지원
- 자막, 화질 선택 기능

### 3. 페이지별 설정 (`config/pages/`)

각 페이지의 고유 설정을 관리합니다.

#### Home Page (`config/pages/home.ts`)
```typescript
{
  itemsPerPage: 20,
  heroAspectRatio: '21/9',
  gridColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
  enableSearch: true,
  // ...
}
```

#### Watch Page (`config/pages/watch.ts`)
```typescript
{
  enableHls: true,
  enableSubtitles: false,
  enableQualitySelector: false,
  uiAutoHideDelay: 3000,
  // ...
}
```

#### Upload Page (`config/pages/upload.ts`)
```typescript
{
  maxFileSize: 1024 * 1024 * 1024, // 1GB
  allowedFormats: ['video/mp4'],
  enableTitleInput: true,
  // ...
}
```

## 설정 사용 방법

### ConfigManager 사용

```typescript
import { configManager, getApiBaseUrl, getPageConfig, isFeatureEnabled } from '@/lib/config';

// API Base URL 가져오기
const apiUrl = getApiBaseUrl();

// 페이지 설정 가져오기
const homeConfig = getPageConfig('home');
const watchConfig = getPageConfig('watch');
const uploadConfig = getPageConfig('upload');

// 기능 활성화 여부 확인
const analyticsEnabled = isFeatureEnabled('enableAnalytics');
```

### 환경 설정 변경

환경 변수를 통해 설정을 변경할 수 있습니다:

```bash
# Development
NODE_ENV=development npm run dev

# Staging
NODE_ENV=staging npm run build

# Production
NODE_ENV=production npm run build
```

### 버전 설정 변경

환경 변수를 통해 버전을 변경할 수 있습니다:

```bash
NEXT_PUBLIC_APP_VERSION=2.0.0 npm run build
```

## 환경 변수 설정

### 필수 환경 변수

프로젝트 루트에 환경 변수 파일을 생성하세요:

#### `.env.development`
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_APP_VERSION=0.1.0
NODE_ENV=development
```

#### `.env.staging`
```bash
NEXT_PUBLIC_API_BASE_URL=https://staging-api.example.com
NEXT_PUBLIC_APP_VERSION=0.1.0
NODE_ENV=staging
```

#### `.env.production`
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_APP_VERSION=0.1.0
NODE_ENV=production
```

### 환경 변수 우선순위

1. 환경 변수 파일 (`.env.local`, `.env.development`, etc.)
2. 설정 파일의 기본값
3. 하드코딩된 기본값

## 설정 추가 방법

### 새로운 환경 추가

1. `config/env/` 디렉토리에 새 파일 생성
2. `config/env/index.ts`에 추가

```typescript
// config/env/custom.ts
export const customConfig = {
  env: 'custom' as const,
  // ...
};

// config/env/index.ts
import { customConfig } from './custom';

export function getEnvConfig(env?: string): AppConfig {
  // ...
  case 'custom':
    return customConfig;
  // ...
}
```

### 새로운 버전 추가

1. `config/versions/` 디렉토리에 새 파일 생성
2. `config/versions/index.ts`에 추가

```typescript
// config/versions/v3.ts
export const v3Config = {
  version: '3.0.0',
  // ...
};

// config/versions/index.ts
import { v3Config } from './v3';

const versionMap: Record<Version, VersionConfig> = {
  // ...
  '3.0.0': v3Config,
};
```

### 새로운 페이지 설정 추가

1. `config/pages/` 디렉토리에 새 파일 생성
2. `config/pages/index.ts`에 export 추가
3. `lib/config/index.ts`에 타입 추가

## Next.js 설정 통합

`next.config.js`는 환경별 설정을 자동으로 로드합니다:

```javascript
const { getEnvConfig } = require('./config/env');
const config = getEnvConfig(process.env.NODE_ENV);

const nextConfig = {
  async rewrites() {
    return config.next.rewrites;
  },
  // ...
};
```

## CI/CD 통합

GitHub Actions 워크플로우에서 환경 변수를 설정합니다:

```yaml
env:
  NODE_ENV: production
  NEXT_PUBLIC_API_BASE_URL: ${{ secrets.PROD_API_BASE_URL }}
  NEXT_PUBLIC_APP_VERSION: ${{ github.sha }}
```

## 모범 사례

1. **환경 변수 사용**: 민감한 정보는 환경 변수로 관리
2. **타입 안정성**: TypeScript 타입을 활용하여 설정 타입 안정성 보장
3. **기본값 제공**: 모든 설정에 기본값 제공
4. **문서화**: 새로운 설정 추가 시 문서 업데이트
5. **버전 관리**: 설정 변경 시 버전 관리

## 문제 해결

### 설정이 로드되지 않는 경우

1. 환경 변수 파일이 올바른 위치에 있는지 확인
2. `NODE_ENV` 값이 올바른지 확인
3. Next.js 재시작

### 타입 에러가 발생하는 경우

1. TypeScript 재컴파일
2. 설정 파일의 타입 정의 확인
3. `lib/config/index.ts`의 타입 정의 확인
