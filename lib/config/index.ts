import { config, getEnvConfig, type AppConfig } from '@/config/env';
import { homePageConfig, uploadPageConfig, watchPageConfig } from '@/config/pages';
import { currentVersion, getVersionConfig, type VersionConfig } from '@/config/versions';

/**
 * 통합 설정 관리자
 * 환경별, 버전별, 페이지별 설정을 통합하여 제공
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private envConfig: AppConfig;
  private versionConfig: VersionConfig;

  private constructor() {
    this.envConfig = config;
    this.versionConfig = currentVersion;
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 환경 설정 가져오기
   */
  getEnvConfig(): AppConfig {
    return this.envConfig;
  }

  /**
   * 버전 설정 가져오기
   */
  getVersionConfig(): VersionConfig {
    return this.versionConfig;
  }

  /**
   * API Base URL 가져오기
   */
  getApiBaseUrl(): string {
    return this.envConfig.api.baseUrl;
  }

  /**
   * 페이지 설정 가져오기
   */
  getPageConfig(page: 'home' | 'watch' | 'upload') {
    switch (page) {
      case 'home':
        return homePageConfig;
      case 'watch':
        return watchPageConfig;
      case 'upload':
        return uploadPageConfig;
      default:
        throw new Error(`Unknown page: ${page}`);
    }
  }

  /**
   * 기능 활성화 여부 확인
   */
  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.envConfig.features[feature];
  }

  /**
   * 환경 재설정 (테스트용)
   */
  setEnvironment(env: string) {
    this.envConfig = getEnvConfig(env);
  }

  /**
   * 버전 재설정 (테스트용)
   */
  setVersion(version: string) {
    this.versionConfig = getVersionConfig(version);
  }
}

// 싱글톤 인스턴스 export
export const configManager = ConfigManager.getInstance();

// 편의 함수들
export const getApiBaseUrl = () => configManager.getApiBaseUrl();
export const getPageConfig = (page: 'home' | 'watch' | 'upload') => configManager.getPageConfig(page);
export const isFeatureEnabled = (feature: keyof AppConfig['features']) => configManager.isFeatureEnabled(feature);
