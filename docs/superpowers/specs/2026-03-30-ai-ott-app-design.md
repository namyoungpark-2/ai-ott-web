# ai-ott-app: Flutter 모바일 앱 설계

## 개요

ai-ott-web의 모든 기능을 Flutter 모바일 앱으로 구현한다. 소비자 기능(홈, 검색, 재생, 채널, 마이리스트), Creator Studio, Admin을 모두 포함한다.

**Why:** OTT 앱은 영상 재생/스크롤 성능이 UX에 직결되므로 Flutter를 선택. 단일 코드베이스로 iOS + Android 동시 지원.

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Flutter 3.x + Dart 3.x | 네이티브 성능, 단일 코드베이스 |
| 상태관리 | Riverpod | 타입 안전, 테스트 용이, Provider 대비 보일러플레이트 적음 |
| HTTP | Dio | 인터셉터(인증 토큰 자동 첨부), 에러 핸들링 |
| 영상 재생 | better_player (HLS) | HLS 스트리밍, 자막, 광고 오버레이 지원 |
| 라우팅 | GoRouter | 딥링크, 탭 네비게이션, 가드(인증 체크) |
| 로컬 저장 | SharedPreferences | 테마, 언어 설정 |
| 보안 저장 | flutter_secure_storage | JWT 토큰 |
| i18n | flutter_localizations + arb | 한국어/영어 |

## API 연동

### 직접 호출 (프록시 불필요)

웹은 Next.js 프록시(`/api/*`)를 거쳐 백엔드를 호출하지만, 모바일 앱은 백엔드 API를 직접 호출한다.

- Base URL: `NEXT_PUBLIC_API_BASE_URL` (동일한 Spring Boot 백엔드)
- `--dart-define=API_BASE_URL=https://api.example.com` 으로 환경별 주입
- Dio 인터셉터에서 `Authorization: Bearer <token>` 자동 첨부
- 401 응답 시 로그인 화면으로 리다이렉트

### 백엔드 엔드포인트 매핑

웹 프록시 → 백엔드 실제 경로:

| 기능 | 백엔드 경로 |
|------|------------|
| 로그인 | POST `/api/app/auth/login` |
| 회원가입 | POST `/api/app/auth/signup` |
| 홈 브라우즈 | GET `/api/app/catalog/browse` |
| 검색 | GET `/api/app/catalog/search?q=` |
| 콘텐츠 상세 | GET `/api/app/contents/{id}` |
| 카테고리 | GET `/api/app/categories/{slug}` |
| 채널 목록 | GET `/api/app/channels` |
| 채널 검색 | GET `/api/app/channels/search?q=` |
| 채널 상세 | GET `/api/app/channels/{handle}` |
| 채널 콘텐츠 | GET `/api/app/channels/{handle}/contents` |
| 채널 시리즈 | GET `/api/app/channels/{handle}/series` |
| 구독/해지 | POST/DELETE `/api/app/channels/{handle}/subscribe` |
| 구독 상태 | GET `/api/app/channels/{handle}/subscription-status` |
| 프로필 | GET/PUT/DELETE `/api/app/me` |
| 비밀번호 변경 | PUT `/api/app/me/password` |
| 이어보기 | GET `/api/app/me/continue-watching` |
| 재생 위치 | GET/PUT `/api/app/me/playback-progress/{contentId}` |
| 찜 목록 | GET `/api/app/me/watchlist` |
| 찜 추가/삭제 | PUT/DELETE `/api/app/me/watchlist/{contentId}` |
| 구독 채널 | GET `/api/app/me/subscriptions` |
| 광고 설정 | GET `/api/app/ads/config` |
| 광고 이벤트 | POST `/api/app/ads/impression`, `/click` |
| 시청 이벤트 | POST `/api/app/watch-events` |
| 결제 | POST `/api/app/payments/checkout` |
| 피드 | GET `/api/app/feed` |
| 크리에이터 채널 | GET/PUT `/api/app/creator/channel` |
| 크리에이터 콘텐츠 | GET/POST `/api/app/creator/contents` |
| 크리에이터 시리즈 | GET/POST `/api/app/creator/series` |

## 화면 구조

### 메인 탭 (BottomNavigationBar)

```
홈 | 검색 | 채널 | 마이리스트 | 더보기
```

### 화면 목록

**소비자 화면:**

| 화면 | 웹 대응 | 설명 |
|------|---------|------|
| HomeScreen | `/` | 히어로 배너 + 섹션별 가로 스크롤 레일 (최신, 인기, 트렌딩, 이어보기) |
| SearchScreen | `/search` | 상단 검색바 + 실시간 결과 그리드 |
| CategoryScreen | `/categories/[slug]` | 콘텐츠 그리드 + 정렬 (최신/제목/러닝타임) |
| ChannelsScreen | `/channels` | 채널 카드 그리드 + 검색 |
| ChannelDetailScreen | `/channels/[handle]` | 채널 프로필 + 구독 버튼 + 콘텐츠/시리즈 탭 |
| ContentDetailScreen | `/contents/[id]` | 포스터 + 메타데이터 + 재생 버튼 + 관련 콘텐츠 |
| PlayerScreen | `/watch/[id]` | 전체화면 HLS 재생 + 광고 (프리롤/미드롤/포스트롤) |
| MyListScreen | `/my-list` | 이어보기 + 찜 목록 |
| SettingsScreen | `/settings` | 프로필/비밀번호/구독/시청기록/계정삭제 |
| PricingScreen | `/pricing` | FREE/BASIC/PREMIUM 플랜 |
| LoginScreen | LoginModal | 로그인/회원가입 폼 |

**Creator Studio 화면:**

| 화면 | 웹 대응 | 설명 |
|------|---------|------|
| StudioDashboardScreen | `/studio` | 채널 카드 + 통계 + 최근 콘텐츠 |
| StudioChannelScreen | `/studio/channel` | 채널 설정 편집 |
| StudioContentsScreen | `/studio/contents` | 콘텐츠 목록 + 상태 필터 |
| StudioContentNewScreen | `/studio/contents/new` | 콘텐츠 생성 폼 |
| StudioContentEditScreen | `/studio/contents/[id]/edit` | 콘텐츠 편집 + 영상 업로드 |
| StudioSeriesScreen | `/studio/series` | 시리즈 목록 |
| StudioSeriesDetailScreen | `/studio/series/[id]` | 시리즈 상세/편집 |

**Admin 화면:**

| 화면 | 웹 대응 | 설명 |
|------|---------|------|
| AdminScreen | `/admin` | 카테고리 관리 + 콘텐츠 메타데이터 편집 |

### 네비게이션 흐름

- BottomNav 5탭은 각각 독립 Navigator 스택
- PlayerScreen은 풀스크린 push (탭바 숨김)
- Studio는 "더보기" 탭에서 진입, 별도 Nested Navigator
- GoRouter 가드: 인증 필요 화면(마이리스트, Studio, Admin)은 미로그인 시 LoginScreen으로 리다이렉트

## 프로젝트 구조

```
ai-ott-app/
├── lib/
│   ├── main.dart                 # 앱 진입점
│   ├── app.dart                  # MaterialApp + GoRouter + ProviderScope
│   ├── config/
│   │   ├── constants.dart        # API_BASE_URL, 페이지 사이즈 등
│   │   └── theme.dart            # 다크/라이트 ThemeData
│   ├── models/                   # Dart 모델 클래스 (freezed 없이 수동)
│   │   ├── channel.dart          # Channel, ChannelContent, ChannelSeries
│   │   ├── content.dart          # ContentItem, ContentDetail
│   │   ├── user.dart             # User, LoginRequest, SignupRequest
│   │   ├── ad.dart               # AdConfig, AdPlacement, VideoAdConfig
│   │   ├── catalog.dart          # BrowseSection, NavCategory
│   │   └── creator.dart          # CreatorContent, CreatorSeries
│   ├── services/                 # API 호출 계층
│   │   ├── dio_client.dart       # Dio 인스턴스 + 인터셉터
│   │   ├── auth_service.dart     # login, signup, logout
│   │   ├── catalog_service.dart  # browse, search, categories
│   │   ├── channel_service.dart  # channels CRUD, subscribe
│   │   ├── content_service.dart  # content detail, watchlist
│   │   ├── user_service.dart     # profile, password, history
│   │   ├── player_service.dart   # playback progress, watch events
│   │   ├── ad_service.dart       # ad config, impression, click
│   │   ├── creator_service.dart  # studio API calls
│   │   └── payment_service.dart  # checkout
│   ├── providers/                # Riverpod providers
│   │   ├── auth_provider.dart
│   │   ├── theme_provider.dart
│   │   ├── locale_provider.dart
│   │   ├── catalog_provider.dart
│   │   ├── channel_provider.dart
│   │   ├── player_provider.dart
│   │   └── studio_provider.dart
│   ├── screens/
│   │   ├── home/
│   │   │   ├── home_screen.dart
│   │   │   └── widgets/          # HeroBanner, SectionRail, ContentCard
│   │   ├── search/
│   │   │   └── search_screen.dart
│   │   ├── category/
│   │   │   └── category_screen.dart
│   │   ├── channel/
│   │   │   ├── channels_screen.dart
│   │   │   └── channel_detail_screen.dart
│   │   ├── content/
│   │   │   └── content_detail_screen.dart
│   │   ├── player/
│   │   │   ├── player_screen.dart
│   │   │   └── widgets/          # PlayerControls, VideoAdOverlay
│   │   ├── my_list/
│   │   │   └── my_list_screen.dart
│   │   ├── auth/
│   │   │   └── login_screen.dart
│   │   ├── settings/
│   │   │   └── settings_screen.dart
│   │   ├── pricing/
│   │   │   └── pricing_screen.dart
│   │   ├── studio/
│   │   │   ├── studio_dashboard_screen.dart
│   │   │   ├── studio_channel_screen.dart
│   │   │   ├── studio_contents_screen.dart
│   │   │   ├── studio_content_new_screen.dart
│   │   │   ├── studio_content_edit_screen.dart
│   │   │   ├── studio_series_screen.dart
│   │   │   └── studio_series_detail_screen.dart
│   │   ├── admin/
│   │   │   └── admin_screen.dart
│   │   └── more/
│   │       └── more_screen.dart  # 더보기 탭 (Studio/Admin/설정 진입)
│   ├── widgets/                  # 공용 위젯
│   │   ├── content_card.dart
│   │   ├── channel_card.dart
│   │   ├── section_rail.dart
│   │   ├── skeleton_loader.dart
│   │   ├── error_view.dart
│   │   ├── empty_view.dart
│   │   ├── subscribe_button.dart
│   │   ├── status_badge.dart
│   │   ├── ad_banner_widget.dart
│   │   └── img_with_fallback.dart
│   ├── l10n/
│   │   ├── app_ko.arb           # 한국어
│   │   └── app_en.arb           # 영어
│   └── router/
│       └── app_router.dart      # GoRouter 설정 + 가드
├── assets/
│   └── images/                  # 앱 아이콘, 플레이스홀더 등
├── android/
├── ios/
├── test/
└── pubspec.yaml
```

## 주요 패턴

### 인증
- `flutter_secure_storage`에 JWT 토큰 저장
- Dio 인터셉터에서 모든 요청에 `Authorization: Bearer <token>` 자동 첨부
- 401 응답 시 토큰 삭제 + LoginScreen으로 리다이렉트
- AuthProvider(Riverpod)가 user 상태 관리

### 테마
- `ThemeData` 다크/라이트 정의 (웹의 CSS 변수 → MaterialApp themeMode)
- SharedPreferences에 선호 테마 저장
- ThemeProvider(Riverpod)로 전환

### i18n
- `flutter_localizations` + `.arb` 파일
- 웹의 번역 키를 동일하게 유지 (nav.home, nav.channels 등)
- SharedPreferences에 선호 언어 저장, 브라우저 감지 대신 시스템 로케일 감지

### 영상 재생
- `better_player`로 HLS 스트리밍
- 재생 위치를 주기적으로 백엔드에 PUT
- 광고: 프리롤/미드롤/포스트롤을 PlayerScreen 내 오버레이 위젯으로 처리
- 전체화면 모드, 가로/세로 자동 회전

### 에러 처리
- 모든 화면에서 로딩/에러/빈 상태 3분기 (웹과 동일 패턴)
- `ErrorView` 위젯: 에러 메시지 + 재시도 버튼
- `EmptyView` 위젯: 빈 상태 안내
- `SkeletonLoader` 위젯: 로딩 스켈레톤

### 광고
- 배너 광고: `AdBannerWidget` (홈, 카테고리, 검색에 배치)
- 영상 광고: `VideoAdOverlay` (PlayerScreen 내부)
- 광고 노출/클릭/스킵 이벤트 백엔드 전송

## 타겟 플랫폼
- iOS + Android 동시 지원
- 최소 버전: iOS 13+, Android API 24+ (Android 7.0+)

## 레포지토리 위치
- `/Users/namyoungpark/ai-ott/ai-ott-app/` (ai-ott-web과 같은 레벨)
- 별도 git 레포지토리로 관리
