import { developmentConfig } from './development';
import { productionConfig } from './production';
import { stagingConfig } from './staging';

export type Environment = 'development' | 'staging' | 'production';

export type AppConfig = typeof developmentConfig;

export function getEnvConfig(env?: string): AppConfig {
  const envName = (env || process.env.NODE_ENV || 'development') as Environment;
  
  switch (envName) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    case 'development':
    default:
      return developmentConfig;
  }
}

export const config = getEnvConfig();
