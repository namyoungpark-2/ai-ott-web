import { v1Config } from './v1';
import { v2Config } from './v2';

export type VersionConfig = typeof v1Config;

export type Version = '1.0.0' | '2.0.0';

const versionMap: Record<Version, VersionConfig> = {
  '1.0.0': v1Config,
  '2.0.0': v2Config,
};

export function getVersionConfig(version?: string): VersionConfig {
  const v = (version || process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0') as Version;
  return versionMap[v] || v1Config;
}

export const currentVersion = getVersionConfig();
