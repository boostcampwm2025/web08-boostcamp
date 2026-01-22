export interface EnvironmentConfig {
  serverUrl: string;
  clientUrl: string;
}

export const environments: Record<string, EnvironmentConfig> = {
  local: {
    serverUrl: 'http://localhost:3000',
    clientUrl: 'http://localhost:5173',
  },
  staging: {
    serverUrl: 'http://localhost:3001',
    clientUrl: 'https://staging.codejam.kr',
  },
  production: {
    serverUrl: 'https://api.codejam.kr',
    clientUrl: 'https://codejam.kr',
  },
};

export function getConfig(env?: string): EnvironmentConfig {
  const environment = env || process.env.CODEJAM_ENV || 'production';
  const config = environments[environment];

  if (!config) {
    throw new Error(
      `Unknown environment: ${environment}. Available: ${Object.keys(environments).join(', ')}`
    );
  }

  return config;
}
