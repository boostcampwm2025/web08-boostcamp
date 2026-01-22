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
    serverUrl: 'https://staging.codejam.kro.kr',
    clientUrl: 'https://staging.codejam.kro.kr',
  },
  production: {
    serverUrl: 'https://production.codejam.kro.kr',
    clientUrl: 'https://production.codejam.kro.kr',
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
