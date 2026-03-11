# 배포 가이드

## 개요

이 프로젝트는 GitHub Actions를 사용하여 자동화된 CI/CD 파이프라인을 제공합니다.

## 배포 환경

프로젝트는 세 가지 배포 환경을 지원합니다:

1. **Development**: 개발 환경
2. **Staging**: 스테이징 환경 (테스트용)
3. **Production**: 프로덕션 환경

## 브랜치 전략

- `main`: 프로덕션 배포
- `staging`: 스테이징 배포
- `develop`: 개발 배포

## CI/CD 워크플로우

### 1. CI (Continuous Integration)

**파일**: `.github/workflows/ci.yml`

**트리거**:
- Pull Request 생성 시
- `main`, `develop` 브랜치에 푸시 시

**작업**:
- 코드 체크아웃
- Node.js 설정
- 의존성 설치
- 린트 실행
- 빌드 검증

### 2. Development 배포

**파일**: `.github/workflows/deploy-development.yml`

**트리거**:
- `develop` 브랜치에 푸시 시
- 수동 실행 (workflow_dispatch)

**작업**:
- 코드 체크아웃
- Node.js 설정
- 의존성 설치
- 빌드 (Development 환경)
- Vercel에 배포 (Preview)

### 3. Staging 배포

**파일**: `.github/workflows/deploy-staging.yml`

**트리거**:
- `staging` 브랜치에 푸시 시
- 수동 실행 (workflow_dispatch)

**작업**:
- 코드 체크아웃
- Node.js 설정
- 의존성 설치
- 빌드 (Staging 환경)
- Vercel에 배포 (Preview)

### 4. Production 배포

**파일**: `.github/workflows/deploy-production.yml`

**트리거**:
- `main` 브랜치에 푸시 시
- 수동 실행 (workflow_dispatch)

**작업**:
- 코드 체크아웃
- Node.js 설정
- 의존성 설치
- 린트 실행
- 빌드 (Production 환경)
- Vercel에 배포 (Production)

## GitHub Secrets 설정

GitHub Repository Settings > Secrets and variables > Actions에서 다음 Secrets를 설정해야 합니다:

### 필수 Secrets

1. **VERCEL_TOKEN**
   - Vercel 대시보드 > Settings > Tokens에서 생성
   - 배포 권한 필요

2. **VERCEL_ORG_ID**
   - Vercel 대시보드 > Settings > General에서 확인

3. **VERCEL_PROJECT_ID**
   - Vercel 프로젝트 설정에서 확인

### 환경별 Secrets

4. **DEV_API_BASE_URL** (선택)
   - Development 환경 API Base URL
   - 기본값: `http://localhost:8080`

5. **STAGING_API_BASE_URL** (필수)
   - Staging 환경 API Base URL

6. **PROD_API_BASE_URL** (필수)
   - Production 환경 API Base URL

## Vercel 설정

### 프로젝트 생성

1. Vercel 대시보드에서 새 프로젝트 생성
2. GitHub 저장소 연결
3. 프로젝트 설정 확인

### 환경 변수 설정

Vercel 대시보드에서 각 환경별 환경 변수를 설정하세요:

**Development**:
```
NEXT_PUBLIC_API_BASE_URL=<dev-api-url>
NEXT_PUBLIC_APP_VERSION=0.1.0
NODE_ENV=development
```

**Staging**:
```
NEXT_PUBLIC_API_BASE_URL=<staging-api-url>
NEXT_PUBLIC_APP_VERSION=0.1.0
NODE_ENV=staging
```

**Production**:
```
NEXT_PUBLIC_API_BASE_URL=<prod-api-url>
NEXT_PUBLIC_APP_VERSION=0.1.0
NODE_ENV=production
```

## 배포 프로세스

### 자동 배포

1. **Development 배포**
   ```bash
   git checkout develop
   git add .
   git commit -m "feat: 새로운 기능"
   git push origin develop
   ```
   - 자동으로 Development 환경에 배포됩니다.

2. **Staging 배포**
   ```bash
   git checkout staging
   git merge develop
   git push origin staging
   ```
   - 자동으로 Staging 환경에 배포됩니다.

3. **Production 배포**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```
   - 자동으로 Production 환경에 배포됩니다.

### 수동 배포

GitHub Actions에서 수동으로 워크플로우를 실행할 수 있습니다:

1. GitHub 저장소 > Actions 탭
2. 원하는 워크플로우 선택
3. "Run workflow" 클릭
4. 브랜치 선택 및 실행

## 배포 확인

### 배포 상태 확인

1. GitHub Actions 탭에서 워크플로우 실행 상태 확인
2. Vercel 대시보드에서 배포 상태 확인
3. 배포된 URL 접속하여 확인

### 로그 확인

1. GitHub Actions 로그: Actions 탭 > 워크플로우 실행 > 로그 확인
2. Vercel 로그: Vercel 대시보드 > 프로젝트 > Deployments > 로그 확인

## 롤백

### Vercel을 통한 롤백

1. Vercel 대시보드 > 프로젝트 > Deployments
2. 이전 배포 버전 선택
3. "Promote to Production" 클릭

### Git을 통한 롤백

```bash
# 이전 커밋으로 롤백
git revert HEAD
git push origin <branch>

# 특정 커밋으로 롤백
git reset --hard <commit-hash>
git push origin <branch> --force
```

## 문제 해결

### 배포 실패 시

1. **빌드 에러**
   - 로컬에서 `npm run build` 실행하여 확인
   - TypeScript 에러 확인
   - 환경 변수 확인

2. **환경 변수 누락**
   - GitHub Secrets 확인
   - Vercel 환경 변수 확인

3. **Vercel 인증 에러**
   - VERCEL_TOKEN 확인
   - VERCEL_ORG_ID 확인
   - VERCEL_PROJECT_ID 확인

### 배포 속도 개선

1. **캐싱 활용**
   - Node.js 캐시 사용 (자동)
   - npm 캐시 사용 (자동)

2. **병렬 작업**
   - 필요시 워크플로우를 병렬로 실행

## 모니터링

### 배포 모니터링

- GitHub Actions: 워크플로우 실행 상태
- Vercel: 배포 상태 및 성능 메트릭

### 애플리케이션 모니터링

- Vercel Analytics: 성능 메트릭
- 에러 추적: Sentry 등 (향후 추가 예정)

## 보안 고려사항

1. **Secrets 관리**
   - GitHub Secrets 사용
   - 환경 변수에 민감한 정보 저장 금지

2. **접근 제어**
   - Vercel 프로젝트 접근 권한 관리
   - GitHub 브랜치 보호 규칙 설정

3. **의존성 보안**
   - 정기적인 `npm audit` 실행
   - 취약점 패치 적용
