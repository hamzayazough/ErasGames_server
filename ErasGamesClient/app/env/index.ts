// Environment configuration
// This can be extended to use react-native-config for more complex setups

export interface Env {
  API_URL: string;
  API_TIMEOUT: number;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

const defaultEnv: Env = {
  API_URL: __DEV__ ? 'http://localhost:3000/api' : 'https://api.erasgames.com',
  API_TIMEOUT: 12000,
  LOG_LEVEL: __DEV__ ? 'debug' : 'warn',
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
};

export function getEnv(): Env {
  // In the future, you can add react-native-config here:
  // import Config from 'react-native-config';
  // return {
  //   API_URL: Config.API_URL || defaultEnv.API_URL,
  //   API_TIMEOUT: Number(Config.API_TIMEOUT) || defaultEnv.API_TIMEOUT,
  //   ...
  // };

  return defaultEnv;
}
