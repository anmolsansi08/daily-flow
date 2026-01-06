import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c1d935eeb5984dafb7b5a8565ddd875c',
  appName: 'Task Manager',
  webDir: 'dist',
  server: {
    url: 'https://c1d935ee-b598-4daf-b7b5-a8565ddd875c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#0A84FF',
      sound: 'default'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FFFFFF',
      showSpinner: false
    }
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
