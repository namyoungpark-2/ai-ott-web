# ai-ott-app Phase 1: 프로젝트 기반 구축

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Flutter 프로젝트를 생성하고, 모든 화면이 공유하는 기반 코드(모델, API 클라이언트, 인증, 테마, i18n, 라우팅 셸)를 구축한다.

**Architecture:** Riverpod 상태관리 + Dio HTTP 클라이언트 + GoRouter 라우팅. 모든 API 호출은 서비스 계층을 통하고, Dio 인터셉터가 JWT 토큰을 자동 첨부한다.

**Tech Stack:** Flutter 3.x, Dart 3.x, Riverpod, Dio, GoRouter, flutter_secure_storage, SharedPreferences

---

## File Structure

```
ai-ott-app/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   ├── config/
│   │   └── constants.dart
│   ├── models/
│   │   ├── user.dart
│   │   ├── channel.dart
│   │   ├── content.dart
│   │   ├── catalog.dart
│   │   ├── ad.dart
│   │   └── creator.dart
│   ├── services/
│   │   ├── dio_client.dart
│   │   └── auth_service.dart
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── theme_provider.dart
│   │   └── locale_provider.dart
│   ├── l10n/
│   │   ├── app_ko.arb
│   │   └── app_en.arb
│   ├── theme/
│   │   └── app_theme.dart
│   ├── router/
│   │   └── app_router.dart
│   ├── screens/
│   │   ├── home/
│   │   │   └── home_screen.dart
│   │   ├── search/
│   │   │   └── search_screen.dart
│   │   ├── channel/
│   │   │   └── channels_screen.dart
│   │   ├── my_list/
│   │   │   └── my_list_screen.dart
│   │   ├── more/
│   │   │   └── more_screen.dart
│   │   └── auth/
│   │       └── login_screen.dart
│   └── widgets/
│       ├── error_view.dart
│       ├── empty_view.dart
│       └── skeleton_loader.dart
├── test/
│   ├── models/
│   │   └── user_test.dart
│   ├── services/
│   │   └── auth_service_test.dart
│   └── providers/
│       └── auth_provider_test.dart
├── assets/
│   └── images/
├── android/
├── ios/
└── pubspec.yaml
```

---

### Task 1: Flutter 설치 및 프로젝트 생성

**Files:**
- Create: `/Users/namyoungpark/ai-ott/ai-ott-app/` (전체 프로젝트)

- [ ] **Step 1: Flutter SDK 설치**

```bash
brew install --cask flutter
```

설치 후 확인:
```bash
flutter --version
```
Expected: Flutter 3.x.x

- [ ] **Step 2: Flutter doctor 확인**

```bash
flutter doctor
```
Expected: Flutter, Dart 체크 통과 (Xcode/Android Studio는 선택)

- [ ] **Step 3: Flutter 프로젝트 생성**

```bash
cd /Users/namyoungpark/ai-ott
flutter create --org com.aiott --project-name ai_ott_app ai-ott-app
```
Expected: `ai-ott-app/` 디렉토리 생성

- [ ] **Step 4: 프로젝트 실행 확인**

```bash
cd /Users/namyoungpark/ai-ott/ai-ott-app
flutter pub get
```
Expected: 의존성 설치 성공

- [ ] **Step 5: Git 초기화 및 커밋**

```bash
cd /Users/namyoungpark/ai-ott/ai-ott-app
git init
git add .
git commit -m "chore: initialize Flutter project"
```

---

### Task 2: 의존성 추가

**Files:**
- Modify: `pubspec.yaml`

- [ ] **Step 1: pubspec.yaml 의존성 추가**

`pubspec.yaml`의 `dependencies:` 섹션을 아래로 교체:

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # State management
  flutter_riverpod: ^2.6.1
  riverpod_annotation: ^2.6.1

  # HTTP
  dio: ^5.7.0

  # Routing
  go_router: ^14.8.1

  # Storage
  shared_preferences: ^2.3.4
  flutter_secure_storage: ^9.2.4

  # Video
  better_player: ^0.0.84

  # Utils
  intl: ^0.19.0
  cached_network_image: ^3.4.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^5.0.0
  mockito: ^5.4.4
  build_runner: ^2.4.14
```

- [ ] **Step 2: flutter_localizations 설정 추가**

`pubspec.yaml`에 `flutter:` 섹션 아래 추가:

```yaml
flutter:
  generate: true
  uses-material-design: true
  assets:
    - assets/images/
```

- [ ] **Step 3: l10n.yaml 생성**

Create `l10n.yaml` at project root:

```yaml
arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
```

- [ ] **Step 4: assets 디렉토리 생성**

```bash
mkdir -p assets/images
touch assets/images/.gitkeep
```

- [ ] **Step 5: 의존성 설치**

```bash
flutter pub get
```
Expected: 성공

- [ ] **Step 6: 커밋**

```bash
git add .
git commit -m "chore: add project dependencies"
```

---

### Task 3: 상수 및 설정

**Files:**
- Create: `lib/config/constants.dart`

- [ ] **Step 1: constants.dart 작성**

```dart
// lib/config/constants.dart

class AppConstants {
  AppConstants._();

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8080',
  );

  static const int pageSize = 24;
  static const int searchDebounceMs = 350;

  // Content statuses
  static const String statusDraft = 'DRAFT';
  static const String statusPublished = 'PUBLISHED';
  static const String statusUnlisted = 'UNLISTED';
  static const String statusArchived = 'ARCHIVED';
}
```

- [ ] **Step 2: 커밋**

```bash
git add lib/config/constants.dart
git commit -m "feat: add app constants"
```

---

### Task 4: Dart 모델 클래스

**Files:**
- Create: `lib/models/user.dart`
- Create: `lib/models/channel.dart`
- Create: `lib/models/content.dart`
- Create: `lib/models/catalog.dart`
- Create: `lib/models/ad.dart`
- Create: `lib/models/creator.dart`
- Test: `test/models/user_test.dart`

- [ ] **Step 1: User 모델 테스트 작성**

```dart
// test/models/user_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:ai_ott_app/models/user.dart';

void main() {
  group('User', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'u1',
        'username': 'testuser',
        'email': 'test@example.com',
        'role': 'USER',
        'subscriptionTier': 'FREE',
      };
      final user = User.fromJson(json);
      expect(user.id, 'u1');
      expect(user.username, 'testuser');
      expect(user.email, 'test@example.com');
      expect(user.role, 'USER');
      expect(user.subscriptionTier, 'FREE');
    });

    test('toJson produces correct map', () {
      final user = User(
        id: 'u1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        subscriptionTier: 'FREE',
      );
      final json = user.toJson();
      expect(json['id'], 'u1');
      expect(json['username'], 'testuser');
    });
  });

  group('LoginRequest', () {
    test('toJson produces correct map', () {
      final req = LoginRequest(username: 'admin', password: 'pass');
      final json = req.toJson();
      expect(json['username'], 'admin');
      expect(json['password'], 'pass');
    });
  });
}
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
flutter test test/models/user_test.dart
```
Expected: FAIL — `user.dart` 파일 없음

- [ ] **Step 3: User 모델 구현**

```dart
// lib/models/user.dart

class User {
  final String id;
  final String username;
  final String email;
  final String role;
  final String subscriptionTier;

  const User({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    required this.subscriptionTier,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String? ?? '',
      username: json['username'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? 'USER',
      subscriptionTier: json['subscriptionTier'] as String? ?? 'FREE',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'username': username,
        'email': email,
        'role': role,
        'subscriptionTier': subscriptionTier,
      };
}

class LoginRequest {
  final String username;
  final String password;

  const LoginRequest({required this.username, required this.password});

  Map<String, dynamic> toJson() => {
        'username': username,
        'password': password,
      };
}

class SignupRequest {
  final String username;
  final String email;
  final String password;

  const SignupRequest({
    required this.username,
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() => {
        'username': username,
        'email': email,
        'password': password,
      };
}

class LoginResponse {
  final String token;
  final User user;

  const LoginResponse({required this.token, required this.user});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json['token'] as String? ?? '',
      user: User.fromJson(json['user'] as Map<String, dynamic>? ?? {}),
    );
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
flutter test test/models/user_test.dart
```
Expected: All tests PASS

- [ ] **Step 5: Channel 모델 작성**

```dart
// lib/models/channel.dart

class Channel {
  final String id;
  final String handle;
  final String name;
  final String? description;
  final String? profileImageUrl;
  final String? bannerImageUrl;
  final bool isOfficial;
  final int subscriberCount;
  final String status;
  final String createdAt;

  const Channel({
    required this.id,
    required this.handle,
    required this.name,
    this.description,
    this.profileImageUrl,
    this.bannerImageUrl,
    this.isOfficial = false,
    this.subscriberCount = 0,
    this.status = 'ACTIVE',
    this.createdAt = '',
  });

  factory Channel.fromJson(Map<String, dynamic> json) {
    return Channel(
      id: json['id'] as String? ?? '',
      handle: json['handle'] as String? ?? '',
      name: json['name'] as String? ?? '',
      description: json['description'] as String?,
      profileImageUrl: json['profileImageUrl'] as String?,
      bannerImageUrl: json['bannerImageUrl'] as String?,
      isOfficial: json['isOfficial'] as bool? ?? false,
      subscriberCount: json['subscriberCount'] as int? ?? 0,
      status: json['status'] as String? ?? 'ACTIVE',
      createdAt: json['createdAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'handle': handle,
        'name': name,
        'description': description,
        'profileImageUrl': profileImageUrl,
        'bannerImageUrl': bannerImageUrl,
        'isOfficial': isOfficial,
        'subscriberCount': subscriberCount,
        'status': status,
        'createdAt': createdAt,
      };
}

class ChannelContent {
  final String contentId;
  final String title;
  final String contentType;
  final String status;
  final String? thumbnailUrl;
  final String createdAt;

  const ChannelContent({
    required this.contentId,
    required this.title,
    required this.contentType,
    required this.status,
    this.thumbnailUrl,
    this.createdAt = '',
  });

  factory ChannelContent.fromJson(Map<String, dynamic> json) {
    return ChannelContent(
      contentId: json['contentId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      contentType: json['contentType'] as String? ?? 'MOVIE',
      status: json['status'] as String? ?? 'DRAFT',
      thumbnailUrl: json['thumbnailUrl'] as String?,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}

class ChannelSeries {
  final String seriesId;
  final String title;
  final String status;
  final int episodeCount;

  const ChannelSeries({
    required this.seriesId,
    required this.title,
    required this.status,
    this.episodeCount = 0,
  });

  factory ChannelSeries.fromJson(Map<String, dynamic> json) {
    return ChannelSeries(
      seriesId: json['seriesId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      status: json['status'] as String? ?? 'DRAFT',
      episodeCount: json['episodeCount'] as int? ?? 0,
    );
  }
}
```

- [ ] **Step 6: Content 모델 작성**

```dart
// lib/models/content.dart

class ContentItem {
  final String id;
  final String title;
  final String? description;
  final String contentType;
  final String? posterUrl;
  final int? runtimeSeconds;
  final List<String> categories;
  final List<String> tags;

  const ContentItem({
    required this.id,
    required this.title,
    this.description,
    this.contentType = 'MOVIE',
    this.posterUrl,
    this.runtimeSeconds,
    this.categories = const [],
    this.tags = const [],
  });

  factory ContentItem.fromJson(Map<String, dynamic> json) {
    return ContentItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      contentType: json['contentType'] as String? ?? 'MOVIE',
      posterUrl: json['posterUrl'] as String?,
      runtimeSeconds: json['runtimeSeconds'] as int?,
      categories: (json['categories'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      tags: (json['tags'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }
}

class ContentDetail extends ContentItem {
  final String? channelHandle;
  final String? channelName;
  final String status;
  final String? videoUrl;
  final String createdAt;

  const ContentDetail({
    required super.id,
    required super.title,
    super.description,
    super.contentType,
    super.posterUrl,
    super.runtimeSeconds,
    super.categories,
    super.tags,
    this.channelHandle,
    this.channelName,
    this.status = 'PUBLISHED',
    this.videoUrl,
    this.createdAt = '',
  });

  factory ContentDetail.fromJson(Map<String, dynamic> json) {
    return ContentDetail(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      contentType: json['contentType'] as String? ?? 'MOVIE',
      posterUrl: json['posterUrl'] as String?,
      runtimeSeconds: json['runtimeSeconds'] as int?,
      categories: (json['categories'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      tags: (json['tags'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      channelHandle: json['channelHandle'] as String?,
      channelName: json['channelName'] as String?,
      status: json['status'] as String? ?? 'PUBLISHED',
      videoUrl: json['videoUrl'] as String?,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}

class PlaybackProgress {
  final String contentId;
  final int positionSeconds;
  final int durationSeconds;

  const PlaybackProgress({
    required this.contentId,
    required this.positionSeconds,
    required this.durationSeconds,
  });

  factory PlaybackProgress.fromJson(Map<String, dynamic> json) {
    return PlaybackProgress(
      contentId: json['contentId'] as String? ?? '',
      positionSeconds: json['positionSeconds'] as int? ?? 0,
      durationSeconds: json['durationSeconds'] as int? ?? 0,
    );
  }

  double get progressPercent =>
      durationSeconds > 0 ? positionSeconds / durationSeconds : 0;
}
```

- [ ] **Step 7: Catalog 모델 작성**

```dart
// lib/models/catalog.dart

class NavCategory {
  final String slug;
  final String label;
  final int? tier;
  final String? parentSlug;

  const NavCategory({
    required this.slug,
    required this.label,
    this.tier,
    this.parentSlug,
  });

  factory NavCategory.fromJson(Map<String, dynamic> json) {
    return NavCategory(
      slug: json['slug'] as String? ?? '',
      label: json['label'] as String? ?? '',
      tier: json['tier'] as int?,
      parentSlug: json['parentSlug'] as String?,
    );
  }
}

class BrowseSection {
  final String title;
  final String? sectionType;
  final List<Map<String, dynamic>> items;

  const BrowseSection({
    required this.title,
    this.sectionType,
    this.items = const [],
  });

  factory BrowseSection.fromJson(Map<String, dynamic> json) {
    return BrowseSection(
      title: json['title'] as String? ?? '',
      sectionType: json['sectionType'] as String?,
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => e as Map<String, dynamic>)
              .toList() ??
          [],
    );
  }
}

class BrowseResponse {
  final List<NavCategory> categories;
  final List<BrowseSection> sections;

  const BrowseResponse({
    this.categories = const [],
    this.sections = const [],
  });

  factory BrowseResponse.fromJson(Map<String, dynamic> json) {
    return BrowseResponse(
      categories: (json['categories'] as List<dynamic>?)
              ?.map((e) => NavCategory.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      sections: (json['sections'] as List<dynamic>?)
              ?.map((e) => BrowseSection.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}
```

- [ ] **Step 8: Ad 모델 작성**

```dart
// lib/models/ad.dart

class AdPlacement {
  final String id;
  final String type;
  final String status;
  final String? advertiser;
  final String? title;
  final String? imageUrl;
  final String? clickUrl;
  final int? width;
  final int? height;
  final String? videoUrl;
  final int? skipAfterSeconds;
  final int? durationSeconds;
  final int? triggerPositionMs;

  const AdPlacement({
    required this.id,
    required this.type,
    this.status = 'ACTIVE',
    this.advertiser,
    this.title,
    this.imageUrl,
    this.clickUrl,
    this.width,
    this.height,
    this.videoUrl,
    this.skipAfterSeconds,
    this.durationSeconds,
    this.triggerPositionMs,
  });

  factory AdPlacement.fromJson(Map<String, dynamic> json) {
    return AdPlacement(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? 'BANNER',
      status: json['status'] as String? ?? 'ACTIVE',
      advertiser: json['advertiser'] as String?,
      title: json['title'] as String?,
      imageUrl: json['imageUrl'] as String?,
      clickUrl: json['clickUrl'] as String?,
      width: json['width'] as int?,
      height: json['height'] as int?,
      videoUrl: json['videoUrl'] as String?,
      skipAfterSeconds: json['skipAfterSeconds'] as int?,
      durationSeconds: json['durationSeconds'] as int?,
      triggerPositionMs: json['triggerPositionMs'] as int?,
    );
  }
}

class VideoAdConfig {
  final AdPlacement? preRoll;
  final List<AdPlacement> midRolls;
  final AdPlacement? postRoll;

  const VideoAdConfig({
    this.preRoll,
    this.midRolls = const [],
    this.postRoll,
  });

  factory VideoAdConfig.fromJson(Map<String, dynamic> json) {
    return VideoAdConfig(
      preRoll: json['preRoll'] != null
          ? AdPlacement.fromJson(json['preRoll'] as Map<String, dynamic>)
          : null,
      midRolls: (json['midRolls'] as List<dynamic>?)
              ?.map((e) => AdPlacement.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      postRoll: json['postRoll'] != null
          ? AdPlacement.fromJson(json['postRoll'] as Map<String, dynamic>)
          : null,
    );
  }
}

class AdConfig {
  final String pageType;
  final String? contentId;
  final List<AdPlacement> banners;
  final VideoAdConfig? video;

  const AdConfig({
    required this.pageType,
    this.contentId,
    this.banners = const [],
    this.video,
  });

  factory AdConfig.fromJson(Map<String, dynamic> json) {
    return AdConfig(
      pageType: json['pageType'] as String? ?? 'home',
      contentId: json['contentId'] as String?,
      banners: (json['banners'] as List<dynamic>?)
              ?.map((e) => AdPlacement.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      video: json['video'] != null
          ? VideoAdConfig.fromJson(json['video'] as Map<String, dynamic>)
          : null,
    );
  }
}
```

- [ ] **Step 9: Creator 모델 작성**

```dart
// lib/models/creator.dart

class CreatorContent {
  final String contentId;
  final String title;
  final String contentType;
  final String status;
  final String? videoAssetStatus;
  final String? thumbnailUrl;
  final String createdAt;

  const CreatorContent({
    required this.contentId,
    required this.title,
    this.contentType = 'MOVIE',
    this.status = 'DRAFT',
    this.videoAssetStatus,
    this.thumbnailUrl,
    this.createdAt = '',
  });

  factory CreatorContent.fromJson(Map<String, dynamic> json) {
    return CreatorContent(
      contentId: json['contentId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      contentType: json['contentType'] as String? ?? 'MOVIE',
      status: json['status'] as String? ?? 'DRAFT',
      videoAssetStatus: json['videoAssetStatus'] as String?,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}

class CreatorSeries {
  final String seriesId;
  final String title;
  final String? description;
  final int episodeCount;

  const CreatorSeries({
    required this.seriesId,
    required this.title,
    this.description,
    this.episodeCount = 0,
  });

  factory CreatorSeries.fromJson(Map<String, dynamic> json) {
    return CreatorSeries(
      seriesId: json['seriesId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      episodeCount: json['episodeCount'] as int? ?? 0,
    );
  }
}

class CreateContentPayload {
  final String mode;
  final String title;
  final String? seriesTitle;
  final String? seriesId;
  final int? seasonNumber;
  final int? episodeNumber;

  const CreateContentPayload({
    required this.mode,
    required this.title,
    this.seriesTitle,
    this.seriesId,
    this.seasonNumber,
    this.episodeNumber,
  });

  Map<String, dynamic> toJson() => {
        'mode': mode,
        'title': title,
        if (seriesTitle != null) 'seriesTitle': seriesTitle,
        if (seriesId != null) 'seriesId': seriesId,
        if (seasonNumber != null) 'seasonNumber': seasonNumber,
        if (episodeNumber != null) 'episodeNumber': episodeNumber,
      };
}
```

- [ ] **Step 10: 테스트 통과 확인 및 커밋**

```bash
flutter test test/models/user_test.dart
```
Expected: All tests PASS

```bash
git add lib/models/ lib/config/ test/models/
git commit -m "feat: add all Dart model classes and constants"
```

---

### Task 5: Dio HTTP 클라이언트

**Files:**
- Create: `lib/services/dio_client.dart`

- [ ] **Step 1: Dio 클라이언트 작성**

```dart
// lib/services/dio_client.dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:ai_ott_app/config/constants.dart';

class DioClient {
  late final Dio dio;
  final FlutterSecureStorage _storage;

  static const String _tokenKey = 'auth_token';

  DioClient({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage() {
    dio = Dio(
      BaseOptions(
        baseUrl: '${AppConstants.apiBaseUrl}/api/app',
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: _tokenKey);
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          // 401 처리는 AuthProvider에서 수행
          return handler.next(error);
        },
      ),
    );
  }

  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<void> clearToken() async {
    await _storage.delete(key: _tokenKey);
  }

  Future<String?> getToken() async {
    return _storage.read(key: _tokenKey);
  }
}
```

- [ ] **Step 2: 커밋**

```bash
git add lib/services/dio_client.dart
git commit -m "feat: add Dio HTTP client with auth interceptor"
```

---

### Task 6: 인증 서비스 + Provider

**Files:**
- Create: `lib/services/auth_service.dart`
- Create: `lib/providers/auth_provider.dart`

- [ ] **Step 1: AuthService 작성**

```dart
// lib/services/auth_service.dart
import 'package:dio/dio.dart';
import 'package:ai_ott_app/models/user.dart';
import 'package:ai_ott_app/services/dio_client.dart';

class AuthService {
  final DioClient _client;

  AuthService(this._client);

  Future<LoginResponse> login(LoginRequest request) async {
    final response = await _client.dio.post(
      '/auth/login',
      data: request.toJson(),
    );
    final loginResponse = LoginResponse.fromJson(response.data);
    await _client.saveToken(loginResponse.token);
    return loginResponse;
  }

  Future<LoginResponse> signup(SignupRequest request) async {
    final response = await _client.dio.post(
      '/auth/signup',
      data: request.toJson(),
    );
    final loginResponse = LoginResponse.fromJson(response.data);
    await _client.saveToken(loginResponse.token);
    return loginResponse;
  }

  Future<void> logout() async {
    try {
      await _client.dio.post('/auth/logout');
    } catch (_) {
      // 로그아웃 API 실패해도 로컬 토큰은 삭제
    }
    await _client.clearToken();
  }

  Future<User?> getMe() async {
    try {
      final response = await _client.dio.get('/me');
      return User.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) return null;
      rethrow;
    }
  }
}
```

- [ ] **Step 2: AuthProvider 작성**

```dart
// lib/providers/auth_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ai_ott_app/models/user.dart';
import 'package:ai_ott_app/services/auth_service.dart';
import 'package:ai_ott_app/services/dio_client.dart';

final dioClientProvider = Provider<DioClient>((ref) {
  return DioClient();
});

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.watch(dioClientProvider));
});

class AuthState {
  final User? user;
  final bool loading;

  const AuthState({this.user, this.loading = false});

  bool get isLoggedIn => user != null;

  AuthState copyWith({User? user, bool? loading, bool clearUser = false}) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      loading: loading ?? this.loading,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(const AuthState(loading: true)) {
    _init();
  }

  Future<void> _init() async {
    try {
      final user = await _authService.getMe();
      state = AuthState(user: user);
    } catch (_) {
      state = const AuthState();
    }
  }

  Future<void> login(String username, String password) async {
    state = state.copyWith(loading: true);
    try {
      final response = await _authService.login(
        LoginRequest(username: username, password: password),
      );
      state = AuthState(user: response.user);
    } catch (e) {
      state = state.copyWith(loading: false);
      rethrow;
    }
  }

  Future<void> signup(String username, String email, String password) async {
    state = state.copyWith(loading: true);
    try {
      final response = await _authService.signup(
        SignupRequest(username: username, email: email, password: password),
      );
      state = AuthState(user: response.user);
    } catch (e) {
      state = state.copyWith(loading: false);
      rethrow;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    state = const AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(authServiceProvider));
});
```

- [ ] **Step 3: 커밋**

```bash
git add lib/services/auth_service.dart lib/providers/auth_provider.dart
git commit -m "feat: add auth service and Riverpod provider"
```

---

### Task 7: 테마

**Files:**
- Create: `lib/theme/app_theme.dart`
- Create: `lib/providers/theme_provider.dart`

- [ ] **Step 1: 테마 정의**

```dart
// lib/theme/app_theme.dart
import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  static const Color accent = Color(0xFF6D5EFC);
  static const Color accentLight = Color(0xFF8B7FFF);

  static ThemeData dark = ThemeData(
    brightness: Brightness.dark,
    colorScheme: ColorScheme.dark(
      primary: accent,
      secondary: accentLight,
      surface: const Color(0xFF0E0E1A),
    ),
    scaffoldBackgroundColor: const Color(0xFF07070F),
    cardColor: const Color(0xFF13131F),
    dividerColor: const Color(0xFF1E1E2E),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF07070F),
      elevation: 0,
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Color(0xFF0E0E1A),
      selectedItemColor: accent,
      unselectedItemColor: Color(0xFF6B6B80),
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
      headlineMedium: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
      titleMedium: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
      bodyMedium: TextStyle(fontSize: 14),
      bodySmall: TextStyle(fontSize: 12, color: Color(0xFF8B8B9E)),
    ),
  );

  static ThemeData light = ThemeData(
    brightness: Brightness.light,
    colorScheme: ColorScheme.light(
      primary: accent,
      secondary: accentLight,
      surface: const Color(0xFFF5F5F7),
    ),
    scaffoldBackgroundColor: Colors.white,
    cardColor: const Color(0xFFF5F5F7),
    dividerColor: const Color(0xFFE0E0E5),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      elevation: 0,
      foregroundColor: Colors.black87,
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: accent,
      unselectedItemColor: Color(0xFF9E9E9E),
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
      headlineMedium: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
      titleMedium: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
      bodyMedium: TextStyle(fontSize: 14),
      bodySmall: TextStyle(fontSize: 12, color: Color(0xFF6B6B80)),
    ),
  );
}
```

- [ ] **Step 2: 테마 Provider**

```dart
// lib/providers/theme_provider.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier() : super(ThemeMode.dark) {
    _load();
  }

  static const String _key = 'theme_mode';

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final value = prefs.getString(_key);
    if (value == 'light') {
      state = ThemeMode.light;
    } else {
      state = ThemeMode.dark;
    }
  }

  Future<void> toggle() async {
    state = state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _key,
      state == ThemeMode.dark ? 'dark' : 'light',
    );
  }
}

final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) {
  return ThemeNotifier();
});
```

- [ ] **Step 3: 커밋**

```bash
git add lib/theme/ lib/providers/theme_provider.dart
git commit -m "feat: add dark/light theme with Riverpod provider"
```

---

### Task 8: i18n (한국어/영어)

**Files:**
- Create: `lib/l10n/app_en.arb`
- Create: `lib/l10n/app_ko.arb`
- Create: `lib/providers/locale_provider.dart`

- [ ] **Step 1: 영어 번역 파일**

```json
{
  "@@locale": "en",
  "navHome": "Home",
  "navSearch": "Search",
  "navChannels": "Channels",
  "navMyList": "My List",
  "navMore": "More",
  "login": "Log In",
  "signup": "Sign Up",
  "logout": "Log Out",
  "username": "Username",
  "password": "Password",
  "email": "Email",
  "retry": "Retry",
  "loadMore": "Load More",
  "loading": "Loading...",
  "noResults": "No results found.",
  "subscribe": "Subscribe",
  "subscribed": "Subscribed",
  "subscribers": "{count} subscribers",
  "@subscribers": {
    "placeholders": {
      "count": {"type": "String"}
    }
  },
  "searchPlaceholder": "Search channels, contents...",
  "settings": "Settings",
  "profile": "Profile",
  "changePassword": "Change Password",
  "subscriptions": "Subscriptions",
  "watchHistory": "Watch History",
  "deleteAccount": "Delete Account",
  "studio": "Creator Studio",
  "admin": "Admin",
  "play": "Play",
  "continueWatching": "Continue Watching",
  "categoryEmpty": "No contents in this category yet.",
  "channelsEmpty": "No channels found.",
  "pricing": "Pricing"
}
```

- [ ] **Step 2: 한국어 번역 파일**

```json
{
  "@@locale": "ko",
  "navHome": "홈",
  "navSearch": "검색",
  "navChannels": "채널",
  "navMyList": "마이리스트",
  "navMore": "더보기",
  "login": "로그인",
  "signup": "회원가입",
  "logout": "로그아웃",
  "username": "사용자명",
  "password": "비밀번호",
  "email": "이메일",
  "retry": "다시 시도",
  "loadMore": "더 보기",
  "loading": "불러오는 중...",
  "noResults": "검색 결과가 없습니다.",
  "subscribe": "구독",
  "subscribed": "구독중",
  "subscribers": "구독자 {count}명",
  "@subscribers": {
    "placeholders": {
      "count": {"type": "String"}
    }
  },
  "searchPlaceholder": "채널, 콘텐츠 검색...",
  "settings": "설정",
  "profile": "프로필",
  "changePassword": "비밀번호 변경",
  "subscriptions": "구독 관리",
  "watchHistory": "시청 기록",
  "deleteAccount": "계정 삭제",
  "studio": "크리에이터 스튜디오",
  "admin": "관리자",
  "play": "재생",
  "continueWatching": "이어보기",
  "categoryEmpty": "이 카테고리에는 아직 콘텐츠가 없습니다.",
  "channelsEmpty": "등록된 채널이 없습니다.",
  "pricing": "요금제"
}
```

- [ ] **Step 3: Locale Provider**

```dart
// lib/providers/locale_provider.dart
import 'dart:ui';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(const Locale('ko')) {
    _load();
  }

  static const String _key = 'locale';
  static const List<Locale> supported = [Locale('ko'), Locale('en')];

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_key);
    if (saved != null) {
      state = Locale(saved);
    } else {
      // 시스템 로케일 감지
      final system = PlatformDispatcher.instance.locale.languageCode;
      state = system == 'en' ? const Locale('en') : const Locale('ko');
    }
  }

  Future<void> setLocale(Locale locale) async {
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, locale.languageCode);
  }

  Future<void> toggle() async {
    final next =
        state.languageCode == 'ko' ? const Locale('en') : const Locale('ko');
    await setLocale(next);
  }
}

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier();
});
```

- [ ] **Step 4: 커밋**

```bash
git add lib/l10n/ lib/providers/locale_provider.dart
git commit -m "feat: add i18n (Korean/English) with locale provider"
```

---

### Task 9: 공용 위젯

**Files:**
- Create: `lib/widgets/error_view.dart`
- Create: `lib/widgets/empty_view.dart`
- Create: `lib/widgets/skeleton_loader.dart`

- [ ] **Step 1: ErrorView 위젯**

```dart
// lib/widgets/error_view.dart
import 'package:flutter/material.dart';

class ErrorView extends StatelessWidget {
  final String message;
  final String? detail;
  final VoidCallback? onRetry;

  const ErrorView({
    super.key,
    this.message = '불러올 수 없습니다.',
    this.detail,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 48, color: Colors.grey[600]),
            const SizedBox(height: 16),
            Text(
              message,
              style: const TextStyle(fontSize: 16),
              textAlign: TextAlign.center,
            ),
            if (detail != null) ...[
              const SizedBox(height: 8),
              Text(
                detail!,
                style: TextStyle(fontSize: 13, color: Colors.grey[500]),
                textAlign: TextAlign.center,
              ),
            ],
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: onRetry,
                child: const Text('다시 시도'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: EmptyView 위젯**

```dart
// lib/widgets/empty_view.dart
import 'package:flutter/material.dart';

class EmptyView extends StatelessWidget {
  final String message;
  final IconData icon;
  final Widget? action;

  const EmptyView({
    super.key,
    required this.message,
    this.icon = Icons.inbox_outlined,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 56, color: Colors.grey[600]),
            const SizedBox(height: 16),
            Text(
              message,
              style: TextStyle(fontSize: 15, color: Colors.grey[500]),
              textAlign: TextAlign.center,
            ),
            if (action != null) ...[
              const SizedBox(height: 24),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 3: SkeletonLoader 위젯**

```dart
// lib/widgets/skeleton_loader.dart
import 'package:flutter/material.dart';

class SkeletonLoader extends StatefulWidget {
  final double width;
  final double height;
  final double borderRadius;

  const SkeletonLoader({
    super.key,
    this.width = double.infinity,
    required this.height,
    this.borderRadius = 8,
  });

  @override
  State<SkeletonLoader> createState() => _SkeletonLoaderState();
}

class _SkeletonLoaderState extends State<SkeletonLoader>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat();
    _animation = Tween<double>(begin: 0.3, end: 0.6).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(_animation.value * 0.12),
            borderRadius: BorderRadius.circular(widget.borderRadius),
          ),
        );
      },
    );
  }
}
```

- [ ] **Step 4: 커밋**

```bash
git add lib/widgets/
git commit -m "feat: add shared widgets (ErrorView, EmptyView, SkeletonLoader)"
```

---

### Task 10: GoRouter + 탭 셸 + 플레이스홀더 화면

**Files:**
- Create: `lib/router/app_router.dart`
- Create: `lib/screens/home/home_screen.dart`
- Create: `lib/screens/search/search_screen.dart`
- Create: `lib/screens/channel/channels_screen.dart`
- Create: `lib/screens/my_list/my_list_screen.dart`
- Create: `lib/screens/more/more_screen.dart`
- Create: `lib/screens/auth/login_screen.dart`

- [ ] **Step 1: 플레이스홀더 화면 5개 작성**

```dart
// lib/screens/home/home_screen.dart
import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Home — Phase 2')),
    );
  }
}
```

```dart
// lib/screens/search/search_screen.dart
import 'package:flutter/material.dart';

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Search — Phase 2')),
    );
  }
}
```

```dart
// lib/screens/channel/channels_screen.dart
import 'package:flutter/material.dart';

class ChannelsScreen extends StatelessWidget {
  const ChannelsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Channels — Phase 2')),
    );
  }
}
```

```dart
// lib/screens/my_list/my_list_screen.dart
import 'package:flutter/material.dart';

class MyListScreen extends StatelessWidget {
  const MyListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('My List — Phase 2')),
    );
  }
}
```

```dart
// lib/screens/more/more_screen.dart
import 'package:flutter/material.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('More — Phase 2')),
    );
  }
}
```

- [ ] **Step 2: LoginScreen 작성**

```dart
// lib/screens/auth/login_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ai_ott_app/providers/auth_provider.dart';
import 'package:ai_ott_app/theme/app_theme.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  bool _isSignup = false;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _usernameCtrl.dispose();
    _passwordCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      if (_isSignup) {
        await ref.read(authProvider.notifier).signup(
              _usernameCtrl.text.trim(),
              _emailCtrl.text.trim(),
              _passwordCtrl.text,
            );
      } else {
        await ref.read(authProvider.notifier).login(
              _usernameCtrl.text.trim(),
              _passwordCtrl.text,
            );
      }
      if (mounted) context.go('/');
    } catch (e) {
      setState(() => _error = '인증에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_isSignup ? '회원가입' : '로그인')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 32),
            Text(
              'AI OTT',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w700,
                color: AppTheme.accent,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 48),
            TextField(
              controller: _usernameCtrl,
              decoration: const InputDecoration(
                labelText: '사용자명',
                border: OutlineInputBorder(),
              ),
            ),
            if (_isSignup) ...[
              const SizedBox(height: 16),
              TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: '이메일',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
            const SizedBox(height: 16),
            TextField(
              controller: _passwordCtrl,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: '비밀번호',
                border: OutlineInputBorder(),
              ),
              onSubmitted: (_) => _submit(),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 13)),
            ],
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accent,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: _loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Text(_isSignup ? '회원가입' : '로그인'),
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => setState(() => _isSignup = !_isSignup),
              child: Text(
                _isSignup ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입',
                style: TextStyle(color: Colors.grey[400]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 3: GoRouter 설정**

```dart
// lib/router/app_router.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ai_ott_app/providers/auth_provider.dart';
import 'package:ai_ott_app/screens/home/home_screen.dart';
import 'package:ai_ott_app/screens/search/search_screen.dart';
import 'package:ai_ott_app/screens/channel/channels_screen.dart';
import 'package:ai_ott_app/screens/my_list/my_list_screen.dart';
import 'package:ai_ott_app/screens/more/more_screen.dart';
import 'package:ai_ott_app/screens/auth/login_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      final loggedIn = authState.isLoggedIn;
      final isLoginRoute = state.matchedLocation == '/login';

      // 인증 필요 경로
      final authRequired = ['/my-list', '/studio', '/admin'];
      final needsAuth =
          authRequired.any((p) => state.matchedLocation.startsWith(p));

      if (needsAuth && !loggedIn) return '/login';
      if (isLoginRoute && loggedIn) return '/';
      return null;
    },
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return ScaffoldWithNavBar(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
                path: '/channels',
                builder: (_, __) => const ChannelsScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
                path: '/my-list', builder: (_, __) => const MyListScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/more', builder: (_, __) => const MoreScreen()),
          ]),
        ],
      ),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
    ],
  );
});

class ScaffoldWithNavBar extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const ScaffoldWithNavBar({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: navigationShell.currentIndex,
        onTap: (index) => navigationShell.goBranch(
          index,
          initialLocation: index == navigationShell.currentIndex,
        ),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: '홈'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: '검색'),
          BottomNavigationBarItem(
              icon: Icon(Icons.live_tv), label: '채널'),
          BottomNavigationBarItem(
              icon: Icon(Icons.bookmark_border), label: '마이리스트'),
          BottomNavigationBarItem(
              icon: Icon(Icons.more_horiz), label: '더보기'),
        ],
      ),
    );
  }
}
```

- [ ] **Step 4: 커밋**

```bash
git add lib/screens/ lib/router/
git commit -m "feat: add GoRouter shell with bottom nav and placeholder screens"
```

---

### Task 11: main.dart + app.dart 조립

**Files:**
- Modify: `lib/main.dart`
- Create: `lib/app.dart`

- [ ] **Step 1: app.dart 작성**

```dart
// lib/app.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:ai_ott_app/theme/app_theme.dart';
import 'package:ai_ott_app/providers/theme_provider.dart';
import 'package:ai_ott_app/providers/locale_provider.dart';
import 'package:ai_ott_app/router/app_router.dart';

class AiOttApp extends ConsumerWidget {
  const AiOttApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);
    final locale = ref.watch(localeProvider);
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'AI OTT',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: themeMode,
      locale: locale,
      supportedLocales: LocaleNotifier.supported,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: router,
    );
  }
}
```

- [ ] **Step 2: main.dart 교체**

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ai_ott_app/app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: AiOttApp(),
    ),
  );
}
```

- [ ] **Step 3: 빌드 확인**

```bash
flutter pub get
flutter analyze
```
Expected: No errors

- [ ] **Step 4: 커밋**

```bash
git add lib/main.dart lib/app.dart
git commit -m "feat: assemble main app with theme, locale, router"
```

---

### Task 12: GitHub 레포 생성 및 Push

- [ ] **Step 1: GitHub 레포 생성**

```bash
cd /Users/namyoungpark/ai-ott/ai-ott-app
gh repo create namyoungpark-2/ai-ott-app --private --source=. --push
```

- [ ] **Step 2: 확인**

```bash
git log --oneline
```
Expected: Task 1~11 커밋이 모두 보임

---

## Phase 1 완료 기준

- [x] Flutter 프로젝트 생성 및 의존성 설치
- [x] 6개 모델 클래스 (User, Channel, Content, Catalog, Ad, Creator)
- [x] Dio 클라이언트 + Auth 인터셉터
- [x] AuthService + AuthProvider (로그인/회원가입/로그아웃)
- [x] 다크/라이트 테마 + ThemeProvider
- [x] 한국어/영어 i18n + LocaleProvider
- [x] GoRouter + BottomNavigationBar 5탭 셸
- [x] LoginScreen (실제 동작)
- [x] 공용 위젯 (ErrorView, EmptyView, SkeletonLoader)
- [x] User 모델 유닛 테스트

**Phase 2 (소비자 화면)에서:** 플레이스홀더 화면들을 실제 구현으로 교체
