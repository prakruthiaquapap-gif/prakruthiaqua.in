import type { CapacitorConfig } from '@capacitor/cli';

const website = new URL(process.env.CAPACITOR_SERVER_URL || 'https://prakruthiaqua.in/');
if (website.protocol !== 'https:' || website.username || website.password) throw new Error('CAPACITOR_SERVER_URL must be a public HTTPS website URL.');

const config: CapacitorConfig = {
  appId: 'in.prakruthiaqua.app',
  appName: 'Prakruthi Aqua',
  webDir: 'mobile-web',
  server: {
    url: website.href,
    cleartext: false,
    errorPath: 'offline.html',
    allowNavigation: [website.hostname, 'prakruthiaqua.in', 'www.prakruthiaqua.in'],
  },
  android: { backgroundColor: '#263f04', allowMixedContent: false, webContentsDebuggingEnabled: false },
  plugins: {
    SplashScreen: { launchShowDuration: 1200, backgroundColor: '#263f04', showSpinner: false, androidScaleType: 'CENTER_INSIDE' },
  },
};
export default config;
