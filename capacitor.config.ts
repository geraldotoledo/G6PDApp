import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.g6pd.scanner',
  appName: 'G6PDApp',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorCookies: {
      enabled: true
    }
  }
};

export default config;
